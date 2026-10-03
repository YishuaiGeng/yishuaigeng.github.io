/**
 * as-folio site configuration
 *
 * This file replaces _config.yml from al-folio.
 * Update the values below to personalize your site.
 * All configuration is fully typed — your editor will catch mistakes.
 */

// ─── Navigation types (exported for use in Navbar.astro / SearchTrigger) ────

/** A simple navigation link. */
export type NavLeaf = { label: string; href: string };

/**
 * A dropdown group. `label` is the trigger text; `children` are the menu items.
 * Maximum supported depth is 2 levels (group → item). Do not nest further.
 */
export type NavDropdown = { label: string; children: NavLeaf[] };

/** A top-level nav entry — either a plain link or a dropdown group. */
export type NavItem = NavLeaf | NavDropdown;

export const site = {
  // ─── Derived deployment values ────────────────────────────────────────────

  /** Site origin from Astro's resolved `site` option. */
  url: import.meta.env.SITE.replace(/\/$/, ''),

  /** Base path from Astro's resolved `base` option. */
  base: import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, ''),

  // ─── Identity ──────────────────────────────────────────────────────────────

  /** Site title. Shown in the browser tab and navbar. */
  title: 'Yishuai Geng (耿宜帅)',

  /** Site description. Used in meta tags. */
  description:
    'Academic homepage of Yishuai Geng, a PhD student working on knowledge representation and reasoning, logical reasoning with large language models, and recommender systems.',

  /** Language code for the site. */
  lang: 'en',

  // ─── Author ────────────────────────────────────────────────────────────────

  author: {
    /** Full name shown in navbar, about page heading, and footer. */
    name: 'Yishuai Geng',

    /** Short email address (used in social links). */
    email: 'ysgeng@seu.edu.cn',

    /** Path to the lifestyle photo shown on the home page. */
    avatar: '/assets/img/profile-life.jpg',

    /** CSS object-position used when the home-page photo is cropped. */
    avatarPosition: '68% 50%',

    /**
     * Subtitle below your name on the about page.
     * HTML is supported.
     */
    subtitle: `PhD Student in Computer Science and Technology
      &nbsp;·&nbsp;
      <a href="https://www.seu.edu.cn/english/">Southeast University</a>`,

    /**
     * Address block below profile photo.
     * HTML is supported.
     */
    moreInfo: '',

    /** Research interests shown as separate rows on the home page. */
    researchInterests: [
      'Knowledge Representation and Reasoning',
      'Logical Reasoning with Large Language Models',
      'Recommender Systems',
    ],
  },

  // ─── Social links ──────────────────────────────────────────────────────────
  //
  // Supported platforms (set to undefined to hide):
  //   email, x_username, linkedin_username, github_username, gitlab_username,
  //   scholar_userid, dblp_url, orcid_id, inspire_id, researchgate_username,
  //   arxiv_id, youtube_id, instagram_username, mastodon_url,
  //   bluesky_handle, medium_username, cv_pdf, rss_icon

  socials: {
    email: 'ysgeng@seu.edu.cn',
    x_username: undefined as string | undefined,
    linkedin_username: undefined as string | undefined,
    github_username: 'YishuaiGeng' as string | undefined,
    gitlab_username: undefined as string | undefined,
    /** Google Scholar user ID — the part after user= in your Scholar URL */
    scholar_userid: 'yYGe764AAAAJ',
    dblp_url: 'https://dblp.uni-trier.de/pid/364/4698.html' as string | undefined,
    orcid_id: '0000-0003-1034-8126' as string | undefined,
    /** Inspire HEP author ID */
    inspire_id: undefined as string | undefined,
    researchgate_username: undefined as string | undefined,
    arxiv_id: undefined as string | undefined,
    youtube_id: undefined as string | undefined,
    instagram_username: undefined as string | undefined,
    mastodon_url: undefined as string | undefined,
    bluesky_handle: undefined as string | undefined,
    medium_username: undefined as string | undefined,
    /** Path to CV PDF in public/assets/pdf/ */
    cv_pdf: undefined as string | undefined,
    /** Show RSS icon in social links */
    rss_icon: true,
  },

  // ─── Navigation ────────────────────────────────────────────────────────────

  navbar: {
    /** Fix navbar to top of viewport. */
    fixed: true,
    /** Show social icons in navbar (about page only). */
    socialIcons: false,
    /**
     * Top-level navigation items.
     * Use `{ label, href }` for a plain link.
     * Use `{ label, children: [...] }` for a dropdown group (max 2 levels).
     *
     * `href` values are relative to the site root (base is prepended automatically).
     */
    items: [
      { label: 'About', href: '/' },
      { label: 'Blogs', href: '/blog/' },
      { label: 'Publications', href: '/publications/' },
      { label: 'Projects', href: '/projects/' },
      { label: 'Repositories', href: '/repositories/' },
      { label: 'CV', href: '/cv/' },
    ] as NavItem[],
  },

  // ─── Footer ────────────────────────────────────────────────────────────────

  footer: {
    /**
     * Text shown in footer. HTML is supported.
     * Leave empty string to hide.
     */
    text: `Powered by <a href="https://github.com/dadangnh/as-folio" target="_blank" rel="noopener noreferrer">as-folio</a>.
      Hosted by <a href="https://pages.github.com/" target="_blank" rel="noopener noreferrer">GitHub Pages</a>.`,
    /** Show "Last updated" timestamp in footer. */
    lastUpdated: false,
    /** Path to impressum/legal page (EU GDPR). Leave undefined to hide. */
    impressum: undefined as string | undefined,
    /**
     * Footer display mode:
     * 'sticky'  — always visible at the bottom of the viewport (al-folio default)
     * 'normal'  — sits at the natural bottom of page content (only visible when scrolled down)
     * 'hidden'  — footer is not rendered at all
     */
    position: 'normal' as 'sticky' | 'normal' | 'hidden',
  },

  // ─── CV page ───────────────────────────────────────────────────────────────

  cv: {
    /**
     * Which CV data format to render.
     * 'rendercv' → reads src/data/cv.yml (RenderCV YAML format)
     * 'jsonresume' → reads src/data/resume.json (JSONResume format)
     */
    format: 'rendercv' as 'rendercv' | 'jsonresume',
    /** Path to CV PDF for the download button in public/assets/pdf/. */
    pdfPath: '',
    /** Path to the formal portrait shown in the CV contact section. */
    photoPath: '/assets/img/profile-cv.jpg',
    /** CSS object-position used when the CV portrait is cropped. */
    photoPosition: '50% 35%',
  },

  // ─── Blog ──────────────────────────────────────────────────────────────────

  blog: {
    /** Name shown in the blog page heading. */
    name: 'Blogs',
    description:
      'A working notebook for paper reading, focused study, technical practice, and daily learning.',
    /** Number of posts per page. */
    postsPerPage: 20,
    /** Stable notebook collections shown at the top of the blog page. */
    collections: [
      {
        name: '投稿目录',
        icon: 'book',
        description: '期刊与会议的研究方向、CCF 等级及期刊分区。',
      },
      {
        name: 'Paper Reading',
        icon: 'book',
        description: 'Structured reviews, critiques, and connections across papers.',
      },
      {
        name: 'Learning Notes',
        icon: 'learning',
        description: 'Study notes on RAG, reinforcement learning, and emerging methods.',
      },
      {
        name: 'Technical Notes',
        icon: 'code',
        description: 'Reproducible experiments, implementation details, and engineering decisions.',
      },
      {
        name: 'Daily Notes',
        icon: 'pen',
        description: 'Weekly plans, work logs, reflections, and ideas worth revisiting.',
      },
    ] as Array<{
      name: string;
      icon: 'book' | 'learning' | 'code' | 'pen';
      description: string;
    }>,
    /** Labels used by the blog directory and post listing. */
    labels: {
      collections: 'Collections',
      topics: 'Topics',
      allTags: 'All Tags',
      allNotes: 'All Notes',
      noteSingular: 'note',
      notePlural: 'notes',
      readingTime: 'min read',
      pinned: 'Pinned',
    },
    /**
     * Tags shown as badges on the blog listing page header.
     * Users can click them to filter posts by tag.
     */
    displayTags: [
      'CCF',
      '投稿选刊',
      'Knowledge Representation',
      'LLM Reasoning',
      'Recommender Systems',
      'RAG',
      'Reinforcement Learning',
      'Research Workflow',
    ] as string[],
    /** Categories shown as badges on the blog listing page header. */
    displayCategories: [
      '投稿目录',
      'Paper Reading',
      'Learning Notes',
      'Technical Notes',
      'Daily Notes',
    ] as string[],
    /**
     * External post sources (fetched at build time).
     * Each entry is either an RSS feed URL or a list of individual post objects.
     */
    externalSources: [] as Array<{
      name: string;
      rssUrl?: string;
      posts?: Array<{ url: string; publishedDate: string }>;
      categories?: string[];
      tags?: string[];
    }>,
    /** Average reading speed (words per minute) used for reading-time estimates. */
    wordsPerMinute: 200 as number,
    /** Copy shown on the blog page while no posts exist. */
    emptyTitle: 'Posts Coming Soon',
    emptyMessage: 'Research notes and personal updates will be published here.',
  },

  /** Filterable venue directory embedded in submission notes. */
  submissionDirectory: {
    /** Render the directory; the surrounding note remains readable when disabled. */
    enabled: true,
    sourcePath: '/assets/pdf/ccf-2026-v7.pdf',
    areas: [
      { id: 'ai', label: '人工智能' },
      { id: 'theory', label: '计算机科学理论' },
      { id: 'data', label: '数据库/数据挖掘/内容检索' },
      { id: 'cross', label: '交叉/综合/新兴' },
    ],
    kinds: { journal: '期刊', conference: '会议' },
    schemes: { cas: '中科院分区', xinrui: '新锐分区', jcr: 'JCR' },
    labels: {
      search: '检索名称、简称、旧称或标签',
      searchPlaceholder: '例如 KR、RecSys、Knowledge、CCF B',
      area: '研究方向',
      kind: '文献载体',
      rank: 'CCF 等级',
      partition: '期刊分区',
      all: '全部',
      reset: '重置筛选',
      pending: '未标注分区',
      notApplicable: '期刊分区不适用',
      empty: '没有符合条件的条目，请调整筛选条件。',
      count: '显示 {count} / {total} 条目录记录（跨方向重复列出）',
      name: '名称与出版方',
      tags: '分类与关联标签',
      source: '来源',
      sourcePage: '原文 p.',
      sourceLink: '目录链接',
      formerName: '旧称 / 别名',
      ccf: 'CCF',
      zoneSuffix: '区',
    },
  },

  // ─── About page sections ──────────────────────────────────────────────────

  announcements: {
    /** Show news/announcements section on the about page. */
    enabled: true,
    /** Enable vertical scroll if more than 3 items. */
    scrollable: true,
    /** Max news items to show (undefined = show all). */
    limit: 5 as number | undefined,
  },

  latestPosts: {
    /** Show latest blog posts section on the about page. */
    enabled: true,
    scrollable: true,
    limit: 3 as number | undefined,
  },

  selectedPapers: {
    /** Show selected publications section on the about page. */
    enabled: true,
  },

  /** MapMyVisitors map and statistics, displayed at the bottom of the homepage. */
  visitors: {
    /** Show the widget when its script and statistics URLs are configured. */
    enabled: true,
    /** Official JavaScript embed, with automatic width, loaded in the page body. */
    scriptUrl:
      'https://mapmyvisitors.com/map.js?d=eQnjsfdUxsfQFjOtMUQp3ztDDOQhr1aRecRhFNiVTHM&cl=ffffff&w=a',
    /** Official image fallback, loaded only when JavaScript is disabled. */
    imageUrl:
      'https://mapmyvisitors.com/map.png?d=eQnjsfdUxsfQFjOtMUQp3ztDDOQhr1aRecRhFNiVTHM&cl=ffffff',
    /** Public statistics for the configured MapMyVisitors profile. */
    statisticsUrl: 'https://mapmyvisitors.com/web/1c8mp',
    /** Maximum widget width in pixels; smaller screens use the available width. */
    maxWidth: 600,
    labels: {
      mapAlt: 'World map of visitor locations, provided by MapMyVisitors',
      details: 'Visitor statistics',
      caption: 'Visitor locations and statistics · MapMyVisitors',
    },
  },

  // ─── Features ─────────────────────────────────────────────────────────────

  features: {
    /** Enable dark/light mode toggle in navbar. */
    darkmode: true,
    /** Enable ⌘K search. */
    search: true,
    /** Enable reading progress bar on blog posts. */
    progressBar: true,
    /** Show back-to-top button. */
    backToTop: true,
    /** Enable automatic masonry layout for project cards. */
    masonry: true,
    /** Enable click-to-zoom on images (medium-zoom). */
    mediumZoom: true,
    /** Show styled CSS tooltips on hover for project card icons and publication annotations.
     *  When false, the browser's native title-attribute tooltip is used instead. */
    tooltips: false,
    /** Enable GDPR-compliant cookie consent dialog. */
    cookieConsent: false,
    /** Enable newsletter subscription form. */
    newsletter: false,
    /**
     * Enable video embedding for BibTeX entries.
     * If false, video links open in a new tab instead.
     */
    videoEmbedding: false,
    /**
     * Enable Astro View Transitions for smooth page-to-page animations.
     * Disable if you prefer full page reloads (e.g. for accessibility reasons).
     */
    viewTransitions: true,
    /** Show social sharing links (X, LinkedIn, Facebook, email) at the bottom of blog posts. */
    socialShare: false,
  },

  // ─── Giscus comments ──────────────────────────────────────────────────────
  // Follow setup at https://giscus.app/ then fill in the values below.

  giscus: {
    /** Show GitHub Discussions comments on blog posts. */
    enabled: true,
    /**
     * When true, Giscus is hidden behind a "Load comments" button — the
     * giscus.app script is only fetched after the user opts in.
     * Recommended for GDPR compliance (giscus sets third-party cookies).
     * Default: true.
     */
    lazyLoad: true,
    repo: 'YishuaiGeng/yishuaigeng.github.io' as `${string}/${string}`,
    repoId: 'R_kgDONzkV-w',
    category: 'General',
    categoryId: 'DIC_kwDONzkV-84DG91T',
    /** How to map discussions to pages. */
    mapping: 'title' as 'pathname' | 'url' | 'title' | 'og:title',
    strict: true,
    reactionsEnabled: true,
    inputPosition: 'bottom' as 'top' | 'bottom',
    darkTheme: 'dark',
    lightTheme: 'light',
    lang: 'en',
    labels: {
      noticeBefore: 'Comments are powered by',
      provider: 'Giscus',
      noticeAfter: '(GitHub Discussions). Loading them fetches resources from GitHub.',
      load: 'Load comments',
    },
  },

  // ─── Analytics ────────────────────────────────────────────────────────────

  analytics: {
    /** Google Analytics 4 measurement ID (format: G-XXXXXXXXXX). */
    ga4: '' as string,
    /** Cronitor RUM analytics site ID. */
    cronitor: '' as string,
    /** Pirsch analytics site ID. */
    pirsch: '' as string,
    /** OpenPanel analytics client ID. */
    openpanel: '' as string,
    /** Google Search Console verification ID. */
    googleVerification: '' as string,
    /** Bing Webmaster verification ID. */
    bingVerification: '' as string,
  },

  // ─── Open Graph ───────────────────────────────────────────────────────────

  og: {
    /** Include Open Graph meta tags. */
    enabled: true,
    /** Default OG image path (in public/). */
    image: '' as string,
  },

  // ─── Newsletter ───────────────────────────────────────────────────────────

  newsletter: {
    /** Loops.so form endpoint. */
    endpoint: '' as string,
  },

  // ─── Teaching page ────────────────────────────────────────────────────────

  teaching: {
    /**
     * Google Calendar ID for the "Upcoming Events" section.
     * Set to a calendar address like 'user@gmail.com' to show the embed.
     * Leave empty string to hide the calendar section entirely.
     */
    calendarId: '' as string,
    /** Timezone for the Google Calendar embed (e.g., 'America/New_York'). */
    timezone: 'Asia/Shanghai' as string,
  },

  // ─── Publications ─────────────────────────────────────────────────────────

  publications: {
    /**
     * Show badges for individual publication entries.
     * Can be disabled globally here; also toggleable per entry in BibTeX.
     */
    badges: {
      altmetric: true,
      dimensions: true,
      googleScholar: true,
      inspirehep: false,
    },
    /**
     * Max number of authors shown before "and N more..." link.
     * Set to undefined to always show all authors.
     */
    maxAuthorLimit: 20 as number | undefined,
    /** Enable thumbnail images for publications (if `preview` set in BibTeX). */
    thumbnails: false,
    /**
     * Last name used to italicise your name in publication author lists.
     * Defaults to the last word of `site.author.name` when not set.
     * Override explicitly if your publications use a different name form.
     */
    authorLastName: 'Geng' as string | undefined,
    /** Path prefix (relative to public/) for publication preview images. */
    previewDir: '/assets/img/publication_preview/',
    /** Path prefix (relative to public/) for publication PDFs and supplements. */
    pdfDir: '/assets/pdf/',
    /** UI labels — override for non-English sites. */
    labels: {
      abstract: 'Abs',
      bibtex: 'Bib',
      supp: 'Supp',
      searchPlaceholder: 'Search publications\u2026',
      noResults: 'No publications match your search.',
      totalCitations: 'Google Scholar Citations',
    },
  },

  // ─── Repositories ────────────────────────────────────────────────────────

  repositories: {
    /** Show GitHub user stats cards. */
    githubUsers: true,
    /** Show GitHub repository pin cards. */
    githubRepos: true,
    /** Show GitHub trophy stats (repo_trophies). Disabled by default — the service has known reliability issues. */
    trophies: false,
    /** Theme for light mode (from github-readme-stats themes). */
    themeLight: 'default' as string,
    /** Theme for dark mode. */
    themeDark: 'dark' as string,
    /** Trophy card theme for light mode (from github-profile-trophy themes). */
    trophyThemeLight: 'flat' as string,
    /** Trophy card theme for dark mode. */
    trophyThemeDark: 'gitdimmed' as string,
  },

  // ─── Comments ─────────────────────────────────────────────────────────────

  comments: {
    /**
     * Disqus shortname — the subdomain part of YOUR-SHORTNAME.disqus.com.
     * Required when a post sets `disqus: true` in frontmatter.
     * Leave empty string if not using Disqus.
     */
    disqusShortname: '' as string,
  },

  // ─── Page copy ────────────────────────────────────────────────────────────

  pages: {
    projects: {
      /** Description shown below the Projects heading. */
      description: 'Research projects and software by Yishuai Geng.',
      emptyTitle: 'Projects Coming Soon',
      emptyMessage: 'Selected research and software projects will be added here.',
    },
    teaching: {
      /** Description shown below the Teaching heading. */
      description: 'Courses, teaching materials, and academic resources.',
      emptyTitle: 'Teaching Materials Coming Soon',
      emptyMessage: 'Courses, presentations, and academic resources will be added here.',
    },
    people: {
      emptyTitle: 'People Section Coming Soon',
      emptyMessage: 'Collaborator and research group profiles will be added here.',
    },
    books: {
      emptyTitle: 'Reading List Coming Soon',
      emptyMessage: 'Books and reading notes will be added here.',
    },
    repositories: {
      description: 'Selected GitHub activity and open-source repositories.',
      emptyTitle: 'Repositories Coming Soon',
      emptyMessage: 'Selected open-source repositories will be added here.',
    },
  },

  // ─── Theme defaults ───────────────────────────────────────────────────────

  theme: {
    /**
     * Default color theme.
     * 'system' follows OS preference.
     */
    default: 'system' as 'light' | 'dark' | 'system',

    /**
     * Primary accent color used for links, active nav items, badges, and highlights.
     * Accepts any CSS color string (hex, hsl, rgb, etc.).
     * Set to 'auto' to use the built-in defaults (purple in light mode, cyan in dark mode).
     *
     * Example presets:
     *   Purple (default): { light: '#b509ac', dark: '#2698ba' }
     *   Blue:             { light: '#0076df', dark: '#68c0d9' }
     *   Red:              { light: '#ff3636', dark: '#f29105' }
     *   Green:            { light: '#009f06', dark: '#b7d12a' }
     *   Orange:           { light: '#f29105', dark: '#efcc00' }
     *   Custom hover:     { light: '#0076df', dark: '#68c0d9', hoverLight: '#0a53be', hoverDark: '#9fd8ea' }
     */
    color: {
      light: '#0076df' as string,
      dark: '#68c0d9' as string,
      hoverLight: '#0a53be' as string,
      hoverDark: '#9fd8ea' as string,
    },
  },
} as const;

export type SiteConfig = typeof site;
