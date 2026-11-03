# vizune-template-moonwish
Moonwish: a dreamy, starry maintenance page with an animated WebGL spiral galaxy, twinkling starfield and pastel ice-cream palette.

## Features

- ✨ Twinkling canvas starfield with four-point sparkles
- 🌌 Animated WebGL spiral galaxy, clipped to your banner art with a mask
- 📊 Animated progress bar and step tracker, driven by a small config
- 💌 "Notify me" email form, ready to wire up to your mailing service
- 🔗 Social links with scalloped badges and official brand icons
- 🍨 Pastel palette (strawberry pink, blueberry ice, vanilla cream) set in CSS variables
- ♿ Accessible contrast, keyboard focus states and `prefers-reduced-motion` support
- 📱 Responsive layout that stacks on phones
- No frameworks, no build step: plain HTML, CSS and JavaScript

## Quick start

1. Clone or download the repo.
2. Open `index.html` in your browser. That's it, no install needed.
3. To put it live, upload these files together to any static host (GitHub Pages, Netlify, Neocities, Nekoweb and so on):

```
index.html        page structure
styles.css        all styling
script.js         progress, form, icons, galaxy and starfield
galaxy-mask.png   where the galaxy shows on the banner
your-banner.png   your banner art (see below)
```

The files load each other by name, so keep them in the same folder.

## Customising

### Text

Edit `index.html` directly:

- **Site name and slogan**: `.brand-name` and `.brand-sub` in the `<header>`
- **Heading**: the `<h1>` (also update the `<title>` in the `<head>`)
- **Intro paragraph**: `<p class="lede">`
- **Card labels**: written in sentence case; CSS displays them in capitals

### Progress and steps

At the top of `script.js`:

```js
const PROGRESS = 76;
const STEPS = [
  { name: "Design",  desc: "UI/UX and visual assets are ready",  status: "done"        },
  { name: "Coding",  desc: "Building and refining the website",  status: "in-progress" },
  { name: "Content", desc: "Adding and polishing site content",  status: "in-progress" },
  { name: "Launch",  desc: "Final testing and going live soon",  status: "todo"        },
];
```

Each step's `status` sets its dot, in both the progress steps and the Project Status list:

| Status | Dot |
|---|---|
| `"done"` | Filled pink with a tick |
| `"in-progress"` | Pulsing ice-blue ring with a small filled centre |
| `"todo"` | Plain empty ring |

Screen readers announce each state as "Done", "In progress" or "Not started". `PROGRESS` sets the bar separately, so you can show partial progress on in-progress steps.

### Colours

All colours are CSS variables at the top of `styles.css`:

| Variable | Used for |
|---|---|
| `--pink`, `--pink-soft`, `--lilac` | Base palette, borders and glows |
| `--ice` | Accent: percentage, "next" step, site name, hover states |
| `--cream` | Small labels, slogan and input placeholder |
| `--plum` | Dark text and icons on pink (keeps contrast above 4.5:1) |
| `--bg-deep`, `--bg-mid` | Night-sky background |

If you change the pinks behind the button or ticks, check that plum text still has enough contrast.

### Fonts

The page uses Playfair Display (heading), Crimson Pro (body) and Jost (labels) from Google Fonts. Swap the `<link>` in `index.html` and the `--display`, `--serif` and `--sans` variables in `styles.css` to change them.

### Banner art

The banner sits in the bottom-left corner. To use your own:

1. Add a **square PNG with a transparent background** to the folder.
2. Point the `<img>` inside `.hero-frame` in `index.html` at it.
3. Adjust the frame in `styles.css`:
   - `.hero-frame` `transform` tilts and nudges the art (for example, to push a cropped edge off-screen).
   - `.orbits` `--face-x`, `--face-y` and `--size` place the dotted orbit rings, as percentages of the image.

### Galaxy

The galaxy only shows where `galaxy-mask.png` is solid. If you change the banner, make a new mask the **same size as your banner image**: solid white where the galaxy should appear, transparent everywhere else. Any image editor with layers works.

The galaxy's look is set in the `GALAXY` block in `script.js`:

| Setting | What it does |
|---|---|
| `count` | Number of stars |
| `branches` | Number of spiral arms |
| `spin` | How tightly the arms curl |
| `randomness`, `randomnessPower` | How far stars stray from the arms |
| `size` | Star size |
| `innerColor`, `outerColor` | Colour at the core and at the edges |
| `speed` | Rotation speed |
| `centerX`, `centerY` | Centre point, as fractions of the banner (0 to 1) |
| `radius` | Size, as a fraction of the banner width |
| `viewAngle`, `roll` | Tilt of the disc (0 = from above, 90 = edge-on) |

### Social links

In `index.html`, set each link's `href` to your profile and its `aria-label` to the platform name. The `data-icon` attribute picks the icon:

- `data-icon="bluesky"`: solid logo from [Simple Icons](https://simpleicons.org)
- `data-icon="tabler:brand-codepen"`: outline logo from [Tabler Icons](https://tabler.io/icons)
- `data-icon="fa:github-alt"`: solid logo from [Font Awesome Free](https://fontawesome.com)

Use the icon's name from whichever library you like.

### Email form

The form checks the email address and shows a thank-you message, but doesn't send it anywhere yet. Find the `TODO` in `script.js` and send `input.value` to your newsletter or form service (Buttondown, Formspree, Netlify Forms and so on).

## Browser notes

- The galaxy needs WebGL, which all modern browsers support. Without it, the rest of the page still works.
- Icons and fonts load from CDNs, so they need an internet connection.
- With reduced motion turned on in the visitor's system settings, animations stop.

## Credits

- Galaxy look inspired by [Chema Alfonso's galaxy pen](https://codepen.io/ChemaAlfonso/pen/VwzrwGx)
- Icons: [Simple Icons](https://simpleicons.org) (CC0), [Tabler Icons](https://tabler.io/icons) (MIT), [Font Awesome Free](https://fontawesome.com) (CC BY 4.0)
- Fonts: [Google Fonts](https://fonts.google.com)
