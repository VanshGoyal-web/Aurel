# AUREL — Time, beautifully kept.

A complete, responsive, **GitHub Pages-ready** reproduction of the AUREL watch-storefront concept. Built using plain **HTML, CSS, and JavaScript** — no npm, framework, database, build tooling, or API keys needed.

> **Important:** This is an independent reconstruction of the public AUREL concept website, not a byte-for-byte export of the hosted site's private source code. It uses the original AUREL artwork available from the earlier creative project. The watch rotation uses layered **CSS 3D perspective** on photographic cutouts, rather than a real 3D/CAD model; the wrist fitting is a visual proportion preview, not augmented reality.

## What's included

- Editorial, responsive landing page and six-watch collection
- Interactive six-watch studio with drag / touch / arrow-key rotation, automatic 360° animation, dial zoom, and conceptual layer reveal
- Watch cards with collection filters, favorites, and an interactive demo bag
- Four photographic skin-tone previews and adjustable wrist size / case size fitting
- Watch finder, FAQ, scrollable sections, and mobile navigation
- Local images in optimized WebP format; browser-local favorites and bag via `localStorage`
- Accessibility basics: semantic HTML, labeled buttons, focus states, reduced-motion preference

## Project structure

```text
AUREL/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
│   └── images/
│       ├── hero.webp
│       ├── premiere-ivory.webp
│       ├── premiere-noire.webp
│       ├── premiere-steel.webp
│       ├── atelier-forest.webp
│       ├── atelier-moonphase.webp
│       ├── atelier-deco.webp
│       ├── hand-light.webp
│       ├── hand-medium.webp
│       ├── hand-tan.webp
│       ├── hand-deep.webp
│       ├── detail-ivory.webp
│       ├── detail-green.webp
│       └── detail-rose.webp
├── .gitignore
└── README.md
```

## Run locally

**Option A — simplest:** open `index.html` in a web browser.

**Option B — recommended in VS Code:** install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.

**Option C — Python (if installed):**

```bash
python -m http.server 5500
```

Visit http://localhost:5500.

## Upload to GitHub

1. Create a new GitHub repository called `aurel-timepieces`.
2. Extract this ZIP and open its **`aurel-timepieces-github` folder** in VS Code.
3. Open **Terminal → New Terminal** and run:

```bash
git init
git add .
git commit -m "Initial AUREL watch website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aurel-timepieces.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. If the remote repository already contains a README or other files, pull and resolve any differences first. Alternatively, on GitHub choose **Add file → Upload files**, drag the extracted folder's **contents** to the upload area, and commit.

### Publish using GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **`main`**, folder **`/ (root)`**, then **Save**.
4. When GitHub finishes deploying, visit the URL shown in the Pages settings (normally `https://YOUR_USERNAME.github.io/aurel-timepieces/`).

Relative `css/`, `js/`, and `assets/` paths work both on a repository subpath and on the root of a custom domain.

## Make edits

- **Text/layout:** `index.html`
- **Colors/fonts/spacing/animations:** `css/style.css` (`:root` has the main palette)
- **Watches, prices, descriptions, filters and interactions:** `js/app.js` (`watches` data array near the top)
- **Images:** `assets/images/`; update image file references in `js/app.js` when renaming

## Limitations and usage notes

- All timepieces, prices and product specifications are illustrative. **AUREL is a fictional watch brand.** There is no payment processor, authentication, shipping, order creation or live inventory.
- The CSS 3D preview rotates a photographic watch face and a stylized back. A true 360° photogrammetry turntable or physically modeled 3D watch would require actual multi-angle source photography or `.glb`/`.gltf` watch models.
- Dial inspection is a photograph-based zoom. Layer reveal is a conceptual illustration and not an exploded mechanical CAD drawing.
- The wrist preview overlays the watch artwork onto separate photographic hands; skin tone, wrist circumference, and dial proportions are approximations. It is **not** a real-time camera/virtual-try-on or guaranteed physical fit.
- The optional Google Fonts use the internet. System serif/sans-serif fallbacks work offline.
- Favorites and the bag are stored in each visitor's browser, not synced between devices.
- Images came from the user's original AUREL design project. Confirm any intended commercial usage rights before republishing beyond the concept.

## Source concept

Original public reference: https://aurel-timepieces-vansh.alighttide2048.chatgpt.site/

Built as a portable static version for VS Code, GitHub, and GitHub Pages.
