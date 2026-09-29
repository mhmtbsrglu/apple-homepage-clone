# Apple Homepage Clone

A responsive, single-page recreation of Apple's storefront homepage, built with plain HTML, CSS, and JavaScript.

## Preview

### Desktop

![Desktop homepage screenshot](screenshots/desktop.png)

### Mobile

![Mobile homepage screenshot](screenshots/mobile.png)

## Run locally

From this directory, start a local server:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow publishes the site whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The deployed site will be available at <https://mhmtbsrglu.github.io/apple-homepage-clone/>.

GitHub Pages can publish a private repository when the account's plan supports private-repository Pages. The published website itself is public.

## Included

- Responsive global navigation with search and shopping bag panels
- Product campaign heroes and a six-tile product grid
- Add-to-bag feedback and an interactive entertainment carousel
- Reduced-motion support and keyboard-accessible controls
- Locally stored Apple product images in `assets/`

Product photography in `assets/` is sourced from Apple's public homepage.
