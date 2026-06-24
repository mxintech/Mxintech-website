# México in Tech — brand colors

Official color system for [mxintech.org](https://mxintech.org). Use these tokens in UI work instead of ad‑hoc hex values.

## Primary palette

| Name | HEX | Usage |
|------|-----|--------|
| **Azul** | `#1B3F8B` | Navigation, headings, primary buttons, links |
| **Rosa** | `#EF5980` | Accents, highlights, CTAs, progress indicators |

Tints at 80%, 60%, 40%, and 20% are available in CSS as `--mx-blue-*` and `--mx-pink-*`.

## Secondary palette

| Name | HEX | Usage |
|------|-----|--------|
| **Cian** | `#11CFE7` | Speaker profile accent, informational highlights |
| **Naranja** | `#F78D46` | Warm accents, badges (sparingly) |
| **Carbón** | `#314044` | Body text, dark surfaces, readable copy |
| **Verde** | `#63CE36` | Success states, business/partnership accent |

## Implementation

### CSS (preferred)

All semantic theme variables are defined in [`src/index.css`](../../src/index.css):

- `--mx-blue`, `--mx-pink`, `--mx-cyan`, `--mx-orange`, `--mx-charcoal`, `--mx-green`
- `--heading`, `--p-text`, `--nav-bg`, etc. map to brand colors per theme

Use `var(--mx-blue)` rather than hardcoding `#1B3F8B`.

### JavaScript

[`src/config/brand.js`](../../src/config/brand.js) exports `BRAND` and `BRAND_RGB` for inline styles or config (e.g. contact form accents in [`src/config/contactForms.js`](../../src/config/contactForms.js)).

## Theme mapping (light)

| Token | Color |
|-------|--------|
| Headings | Azul `#1B3F8B` |
| Body text | Carbón `#314044` |
| Accent / h1–h3 emphasis | Rosa `#EF5980` |
| Navigation | Azul `#1B3F8B` |

## Theme mapping (dark)

Backgrounds use charcoal-based tones with blue/pink gradients. Text uses light neutrals; accents remain rosa and cian.

## Do not use

These were legacy placeholders and are **not** part of the official manual:

- `#4763A1` (old “site blue”)
- `#638eba` (old hover blue)

Replace with `--mx-blue` or `--mx-blue-80` when updating styles.
