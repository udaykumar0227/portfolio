# Gudla Uday Kumar — Portfolio

A bold, single-page portfolio built with plain HTML, CSS, and JavaScript.
No frameworks, no build step, no dependencies. Fonts are bundled locally, so
the site also works offline.

## Preview locally

Double-click `index.html`, or from Terminal:

```sh
open index.html
```

## Make it yours

Open `index.html` and replace the placeholders. Search for these strings:

| Find | Replace with |
| --- | --- |
| `Your Name` | Your real name |
| `YN` | Your initials |
| `Your City` | Your city |
| `hello@yourname.com` | Your email (appears twice) |
| `href="#"` | Your real social URLs |

Also update:

- `<title>` and the `description` / Open Graph tags in `<head>`.
- The hero headline and intro paragraph.
- The six service cards (title, description, tags).
- The About section: bio, facts, and skill chips.
- The Process section if you work a different way.
- The footer copyright line.

### Colours and fonts

Everything visual lives at the top of `styles.css` in `:root`:

```css
--bg: #0b0b0c;     /* background */
--ink: #f4f1ea;    /* text */
--acid: #d9ff43;   /* primary accent */
--flame: #ff5a36;  /* secondary accent */
--lilac: #b9a7ff;  /* tertiary accent */
```

Change those five values and the whole site changes with them.

## Deploy with Netlify Drop

No account or install is required to start:

1. Open <https://app.netlify.com/drop> in Safari.
2. Drag this **whole folder** (`new-project`) onto the page.
3. Wait a few seconds — Netlify gives you a live `*.netlify.app` URL.
4. Sign in (free) if you want to keep the site, rename it, or attach a domain.

To update the site later, drag the folder onto the same site again, or connect
the folder to a Git repository for automatic deploys.

### Optional custom domain

In Netlify: **Site configuration → Domain management → Add a domain**. A `.com`
usually costs roughly $10–15/year; the Netlify subdomain and HTTPS are free.

## Files

```
index.html      content and structure
styles.css      all styling, responsive rules, animations
script.js       menu, scroll reveals, copy button, clock, cursor
favicon.svg     site icon
_headers        Netlify security/cache headers (ignored locally)
robots.txt      search-engine rules
assets/fonts/   self-hosted woff2 fonts (SIL Open Font License)
```

## Accessibility & performance notes

- Respects `prefers-reduced-motion`.
- Keyboard focus styles, skip link, and semantic landmarks.
- No trackers, no third-party requests, no layout-shifting ads.
- Total page weight is roughly the size of the three font files (~47 KB) plus
  the HTML/CSS/JS, so it loads fast on mobile connections.
