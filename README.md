# Shrishti & Jaydeep Wedding Invitation

Luxury single-page wedding invitation built with Astro, with React used only for its interactive invitation controls.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` to create the production site in `dist/`. `npm run preview` previews that build. Astro serves the page as static HTML and hydrates only the interactive invitation experience.

## Edit content

All wedding-specific content is centralized in [src/config.js](src/config.js): names, date, venue, map link, celebrations, and gallery items. Unconfirmed function information deliberately says “Details to be announced.” Replace gallery image URLs with supplied couple photographs and meaningful alt captions.

The RSVP validates in the browser and presents an honest confirmation that it is not stored. To collect real RSVP replies, replace the `submit` function in `src/main.jsx` with a request to your own server or Google Form endpoint. Do not put keys or credentials in frontend code.

## GitHub Pages

1. Push this repository to GitHub on the `main` branch.
2. In GitHub: **Settings → Pages → Build and deployment → GitHub Actions**.
3. The included workflow builds and deploys automatically. No secrets or custom domain are required.

The Astro configuration detects the GitHub repository name during the Actions build, so asset paths work at the repository’s default GitHub Pages URL.
