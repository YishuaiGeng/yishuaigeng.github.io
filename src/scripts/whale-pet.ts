import type { site } from '@config/site';

type Settings = Pick<
  typeof site.pet,
  'sleepAfterMs' | 'blink' | 'happyDurationMs' | 'fountain' | 'reading' | 'thinking' | 'labels'
>;
type State = 'idle' | 'blink' | 'happy' | 'reading' | 'thinking' | 'sleep';

class WhalePet extends HTMLElement {
  #settings!: Settings;
  #events?: AbortController;
  #motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  #timers = new Map<string, number>();
  #animations = new Set<Animation>();
  #state: State = 'idle';
  #lastActivity = -Infinity;

  connectedCallback() {
    if (this.#events) return;
    this.#settings = JSON.parse(this.dataset.settings!) as Settings;
    this.#events = new AbortController();
    const { signal } = this.#events;
    this.querySelector('.pet-activate')?.addEventListener('click', this.#interact, { signal });
    for (const event of ['pointermove', 'pointerdown', 'keydown', 'scroll', 'focusin']) {
      document.addEventListener(event, this.#activity, { passive: true, signal });
    }
    // Defer until focus, selection and the search dialog have processed the event.
    for (const event of ['click', 'keydown', 'keyup', 'focusin', 'focusout', 'selectionchange']) {
      document.addEventListener(event, this.#queueContext, { signal });
    }
    document.addEventListener(
      'scroll',
      () => {
        this.#later('context', this.#settings.reading.settleMs, this.#syncContext);
      },
      { passive: true, signal },
    );
    document.addEventListener('visibilitychange', this.#refresh, { signal });
    document.addEventListener('astro:page-load', this.#refresh, { signal });
    this.#motion.addEventListener('change', this.#refresh, { signal });
    this.#refresh();
  }

  disconnectedCallback() {
    this.#events?.abort();
    this.#events = undefined;
    this.#pause();
  }

  get #available() {
    return this.isConnected && !document.hidden;
  }

  #later(key: string, delay: number, action: () => void) {
    this.#cancel(key);
    this.#timers.set(
      key,
      window.setTimeout(() => {
        this.#timers.delete(key);
        if (this.isConnected) action();
      }, delay),
    );
  }

  #cancel(key: string) {
    window.clearTimeout(this.#timers.get(key));
    this.#timers.delete(key);
  }

  #stopAnimations() {
    for (const animation of this.#animations) animation.cancel();
    this.#animations.clear();
    this.dataset.fountain = 'idle';
    this.#cancel('fountain-end');
  }

  #pause() {
    for (const timer of this.#timers.values()) window.clearTimeout(timer);
    this.#timers.clear();
    this.#stopAnimations();
    this.dataset.motion = 'paused';
    const announcement = this.querySelector('.pet-announcement');
    if (announcement) announcement.textContent = '';
  }

  #refresh = () => {
    this.#pause();
    this.#setState(this.#contextState());
    if (!this.#available) return;
    this.dataset.motion = this.#motion.matches ? 'reduced' : 'active';
    this.#lastActivity = -Infinity;
    this.#activity();
    this.#syncContext();
  };

  #contextState(): 'idle' | 'reading' | 'thinking' {
    const search = document.querySelector<HTMLElement & { visible?: boolean }>('#ninja-search');
    const editing = document.activeElement?.matches(
      'input:not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]',
    );
    if (this.#settings.thinking.enabled && (search?.visible || editing)) return 'thinking';
    if (this.#settings.reading.enabled) {
      const selection = window.getSelection();
      const main = document.getElementById('main-content');
      const selectingContent =
        !!selection?.toString().trim() &&
        (main?.contains(selection.anchorNode) || main?.contains(selection.focusNode));
      if (
        this.dataset.readingPage === 'true' ||
        window.scrollY >= this.#settings.reading.scrollThreshold ||
        selectingContent
      ) {
        return 'reading';
      }
    }
    return 'idle';
  }

  #queueContext = () => {
    if (this.#available) this.#later('context', 0, this.#syncContext);
  };

  #syncContext = () => {
    if (!this.#available || this.#state === 'happy') return;
    const context = this.#contextState();
    if (context !== 'idle') {
      this.#cancel('blink');
      this.#cancel('blink-end');
      this.#cancel('sleep');
      this.#setState(context);
    } else if (this.#state !== 'sleep' && this.#state !== 'blink') {
      this.#setState('idle');
      this.#scheduleBlink();
      if (!this.#timers.has('sleep')) this.#scheduleSleep();
    }
  };

  #setState(state: State) {
    this.#state = state;
    this.dataset.state = state;
    const button = this.querySelector('.pet-activate');
    const label = this.#settings.labels[state === 'blink' ? 'idle' : state];
    button?.setAttribute('aria-label', `${label}. ${this.#settings.labels.activate}`);
  }

  #activity = () => {
    if (!this.#available) return;
    const now = performance.now();
    if (now - this.#lastActivity < 800 && this.#state !== 'sleep') return;
    this.#lastActivity = now;
    if (this.#state === 'sleep') {
      this.#setState(this.#contextState());
      this.#scheduleBlink();
    }
    this.#scheduleSleep();
  };

  #scheduleSleep() {
    this.#cancel('sleep');
    if (this.#contextState() !== 'idle') return;
    this.#later('sleep', this.#settings.sleepAfterMs, () => {
      if (this.#contextState() !== 'idle' || this.#state === 'happy') return;
      this.#cancel('blink');
      this.#cancel('blink-end');
      this.#stopAnimations();
      this.#setState('sleep');
    });
  }

  #scheduleBlink() {
    if (
      this.#motion.matches ||
      !this.#available ||
      this.#state !== 'idle' ||
      this.#timers.has('blink')
    )
      return;
    const { minMs, maxMs, durationMs } = this.#settings.blink;
    this.#later('blink', minMs + Math.random() * (maxMs - minMs), () => {
      if (this.#state !== 'idle') return;
      this.#setState('blink');
      this.#later('blink-end', durationMs, () => {
        this.#setState(this.#contextState());
        this.#syncContext();
      });
    });
  }

  #interact = () => {
    if (!this.#available) return;
    this.#lastActivity = -Infinity;
    this.#activity();
    this.#cancel('blink');
    this.#cancel('blink-end');
    this.#stopAnimations();
    this.#setState('happy');
    const announcement = this.querySelector('.pet-announcement');
    if (announcement) announcement.textContent = this.#settings.labels.greeting;
    if (!this.#motion.matches) {
      this.#animate(
        this.querySelector('.pet-reaction'),
        [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(1px) scale(1.035, .95)', offset: 0.16 },
          { transform: 'translateY(-2px) scale(.985, 1.025)', offset: 0.45 },
          { transform: 'translateY(0) scale(1)' },
        ],
        850,
      );
      if (this.#settings.fountain.enabled) this.#spray();
    }
    this.#later('reaction-end', this.#settings.happyDurationMs, () => {
      this.#setState(this.#contextState());
      if (announcement) announcement.textContent = '';
      this.#syncContext();
    });
  };

  #animate(target: Element | null, keyframes: Keyframe[], duration: number, delay = 0) {
    if (!target) return;
    const animation = target.animate(keyframes, { duration, delay, easing: 'ease-in-out' });
    this.#animations.add(animation);
    animation.onfinish = () => this.#animations.delete(animation);
  }

  #spray() {
    this.dataset.fountain = 'active';
    this.#later('fountain-end', 1300, () => {
      this.dataset.fountain = 'idle';
    });
    this.#animate(
      this.querySelector('.pet-spout'),
      [
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(.93)', offset: 0.15 },
        { transform: 'scaleY(1.14)', offset: 0.38 },
        { transform: 'scaleY(.985)', offset: 0.78 },
        { transform: 'scaleY(1)' },
      ],
      1000,
    );
    this.querySelectorAll('.pet-droplet').forEach((drop, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side < 0 ? 393 : 767;
      const y = side < 0 ? 330 : 257;
      const spread = side * (72 + Math.floor(i / 2) * 46);
      const height = 130 + Math.floor(i / 2) * 25;
      this.#animate(
        drop,
        [
          { transform: `translate(${x}px, ${y}px) scale(.3)`, opacity: 0 },
          {
            transform: `translate(${x + spread * 0.18}px, ${y - height * 0.65}px) scale(.8)`,
            opacity: 1,
            offset: 0.2,
          },
          {
            transform: `translate(${x + spread * 0.5}px, ${y - height}px) scale(1)`,
            opacity: 1,
            offset: 0.48,
          },
          {
            transform: `translate(${x + spread * 0.85}px, ${y - height * 0.2}px) scale(.75)`,
            opacity: 0.8,
            offset: 0.8,
          },
          { transform: `translate(${x + spread}px, ${y + 55}px) scale(.3)`, opacity: 0 },
        ],
        800,
        100 + i * 45,
      );
    });
  }
}

if (!customElements.get('whale-pet')) customElements.define('whale-pet', WhalePet);
