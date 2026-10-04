export {};

// This module runs once; Astro page-load events handle subsequent client navigation.
type Mermaid = {
  initialize: (options: Record<string, unknown>) => void;
  run: (options: { nodes: HTMLElement[] }) => Promise<void>;
};

const sources = new WeakMap<HTMLElement, string>();
const moduleUrl = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
let library: Promise<Mermaid> | undefined;
let rendering = false;
let requested = false;
let pageVersion = 0;

function loadMermaid() {
  library ??= import(/* @vite-ignore */ moduleUrl)
    .then((module) => module.default as Mermaid)
    .catch((error: unknown) => {
      library = undefined;
      throw error;
    });
  return library;
}

function prepareDiagrams() {
  document.querySelectorAll('[data-mermaid] pre[data-language="mermaid"]').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const diagram = document.createElement('div');
    diagram.className = 'mermaid';
    diagram.tabIndex = 0;
    const source = code.textContent ?? '';
    sources.set(diagram, source);
    diagram.textContent = source;
    pre.replaceWith(diagram);
  });
}

async function renderDiagrams() {
  requested = true;
  if (rendering) return;
  rendering = true;

  try {
    // Coalesce theme/navigation events while Mermaid's asynchronous renderer is busy.
    while (requested) {
      requested = false;
      prepareDiagrams();
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-mermaid] .mermaid'),
      ).filter((node) => sources.has(node));
      if (!nodes.length) continue;

      const version = pageVersion;
      const mermaid = await loadMermaid();
      if (version !== pageVersion) continue;
      const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';
      const pending = nodes.filter(
        (node) => node.isConnected && node.dataset.renderedTheme !== theme,
      );
      if (!pending.length) continue;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
        flowchart: { useMaxWidth: false, rankSpacing: 32, nodeSpacing: 24 },
      });

      for (const node of pending) {
        if (!node.isConnected || version !== pageVersion) break;
        // Keep the source outside the SVG so theme changes can render it again safely.
        node.style.minHeight = `${node.getBoundingClientRect().height}px`;
        node.textContent = sources.get(node) ?? '';
        node.removeAttribute('data-processed');
        try {
          await mermaid.run({ nodes: [node] });
          node.dataset.renderedTheme = theme;
        } catch (error) {
          node.textContent = sources.get(node) ?? '';
          node.removeAttribute('data-processed');
          delete node.dataset.renderedTheme;
          console.error('Unable to render Mermaid diagram:', error);
        } finally {
          node.style.removeProperty('min-height');
        }
      }
    }
  } catch (error) {
    // If the CDN is unavailable, leave the diagram source readable in the article.
    console.error('Unable to load Mermaid:', error);
  } finally {
    rendering = false;
  }
}

const themeObserver = new MutationObserver(() => void renderDiagrams());
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
document.addEventListener('astro:before-swap', () => {
  pageVersion += 1;
});
document.addEventListener('astro:page-load', () => void renderDiagrams());
void renderDiagrams();
