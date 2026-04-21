# Renovation Cost Calculator

A lightweight, embeddable, multi-step calculator that estimates renovation costs for apartments, houses, offices and commercial spaces. Pure HTML / CSS / JS — **no frameworks, no build step, no dependencies**. Drop it into any site.

![Calculator hero](https://placehold.co/920x120/2563eb/ffffff?text=Renovation+Cost+Calculator)

## Features

- **5-step wizard** with an animated progress bar
- **Property type**: apartment, private house, office, commercial
- **Area slider** (20–500 m²)
- **4 renovation levels**: cosmetic, standard, euro, designer
- **Per-room pricing** with individual coefficients (kitchen, bathroom, toilet, bedroom, living room, hallway, balcony)
- **Add-ons**: design project, wall demolition, underfloor heating, smart home
- **Detailed estimate**: work, materials, extras, grand total
- **Price range** (min–max) and **timeline estimate** localized in Russian
- **Lead capture form** (name + phone) with a `renovation:lead` custom event for CRM integration
- **PDF export** via the built-in `window.print()` with print-optimized CSS
- **Responsive**, mobile-first, accessible (radiogroups, aria, keyboard-friendly)
- **Montserrat** font via Google Fonts, accent color `#2563eb`

## File structure

```
renovation-cost-calculator/
├── index.html       # Markup (5 steps + modal)
├── style.css        # Light-theme minimalist styling
├── calculator.js    # Step navigation + pricing engine
├── README.md        # This file
└── .gitignore
```

Total weight: ~25 KB (uncompressed), no network requests besides the Google Font.

## Quick start

### Option 1 — Standalone page

Copy the folder to your server and point a link at `index.html`:

```
https://yoursite.com/calculator/index.html
```

### Option 2 — Embed with an iframe (one tag)

The simplest way to drop the calculator onto any page, CMS, or landing builder:

```html
<iframe
  src="/calculator/index.html"
  style="width:100%; min-height:900px; border:0;"
  title="Renovation cost calculator"
  loading="lazy">
</iframe>
```

Resize trick (optional) — post the iframe height from the child page if you need it to auto-grow.

### Option 3 — Inline on an existing page

1. Copy the three inner blocks from `index.html`:
   - `<link>` tags to Google Fonts and `style.css` (or paste `style.css` into your stylesheet)
   - everything inside `<main class="calc">…</main>`
   - `<script src="calculator.js">` (or paste the JS before `</body>`)
2. Upload `style.css` and `calculator.js` alongside the page.
3. Done — no additional setup.

## Capturing leads

When a user submits the "Получить точный расчёт" form, the page dispatches a DOM event you can listen to:

```js
document.addEventListener('renovation:lead', (e) => {
  // e.detail = { name, phone, calculation, timestamp }
  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(e.detail),
  });
});
```

The `calculation` property contains the full breakdown (property type, renovation type, area, selected rooms/extras, min/max price, timeline, etc.) — ready to forward to a CRM, Telegram bot, or email webhook.

## Customizing prices

All pricing lives in the `PRICING` object at the top of `calculator.js`:

```js
const PRICING = {
  propertyType: {
    apartment: { multiplier: 1.00, label: 'Квартира' },
    // ...
  },
  renovationType: {
    cosmetic: { base: 4500, spread: 0.35, label: 'Косметический',
                daysPerSqm: 0.5, workShare: 0.50, materialShare: 0.45 },
    // ...
  },
  rooms: {
    kitchen: { coef: 0.15, label: 'Кухня' },
    // ...
  },
  extras: {
    design: { coef: 0.08, label: 'Дизайн-проект' },
    // ...
  },
};
```

- `base` — base cost per m² in rubles
- `spread` — ± range around the mean (e.g. 0.30 = ±15% → min/max)
- `daysPerSqm` — hours of work translated into schedule days
- `workShare` / `materialShare` — how the total is split in the breakdown
- `coef` — percentage uplift added on top of the base subtotal

## Customizing look

The entire palette is driven by CSS variables at the top of `style.css`:

```css
:root {
  --accent: #2563eb;         /* primary blue — change to rebrand */
  --accent-dark: #1d4fd7;
  --accent-light: #dbeafe;
  --accent-soft: #eff6ff;
  --text: #0f172a;
  --bg: #f8fafc;
  /* ... */
}
```

Swap `--accent` with your brand color and the whole UI follows.

## Screenshots

| Step | Description |
|---|---|
| **Step 1** — Property type & area | Four property cards + a 20–500 m² slider |
| **Step 2** — Renovation level | Four options (cosmetic → designer) with descriptions |
| **Step 3** — Rooms | Toggleable chips for each room |
| **Step 4** — Add-ons | Toggle switches for design, demolition, warm floor, smart home |
| **Step 5** — Result | Hero price card + itemized estimate + PDF / lead CTAs |

*(Generate your own screenshots by opening `index.html` locally — no tooling required.)*

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `:has()` for styled radios/checkboxes, which has been widely supported since 2023.

## License

MIT — free to use, modify and embed in commercial projects.
