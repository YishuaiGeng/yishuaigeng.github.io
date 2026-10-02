# Yishuai Geng - Academic Homepage

Source for [yishuaigeng.github.io](https://yishuaigeng.github.io), built with
[as-folio](https://github.com/dadangnh/as-folio), Astro, and TypeScript.

## Local development

Prerequisites: Node.js 24 or newer and Corepack.

```bash
corepack enable
yarn install --immutable
yarn dev
```

The production build is generated with:

```bash
yarn build
```

## Content

- Site identity and navigation: `src/config/site.ts`
- Biography: `src/data/about.mdx`
- Publications: `src/data/papers.bib`
- CV: `src/data/cv.yml`
- Honors and activities: `src/data/achievements.mdx`
- News: `src/content/announcements/`
- Static files: `public/assets/`

## Deployment

Pushing `main` triggers `.github/workflows/deploy.yml`, which builds the site and
deploys it to GitHub Pages at the domain root.

## License

The site template is distributed under the MIT License. See `LICENSE` and the
upstream [as-folio repository](https://github.com/dadangnh/as-folio).
