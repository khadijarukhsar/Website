# Words that insisted on being written
A quiet, minimal, and deeply personal static writing space designed for reflection and reading.

## Features
- **Seamless SPA Navigation**: Transitions between writings instantly without full page reloads, preserving the reading flow using `history.pushState` and the View Transitions API.
- **Typewriter Engine**: A dynamic Javascript typewriter effect that types out articles in real-time. Features a 3-state accessibility toggle (ONCE, ALWAYS, OFF).
- **Dark Mode**: Fully supported, high-contrast dark theme with user preference memory and screenreader accessibility built-in.
- **Zero-Database Architecture**: Built entirely with static HTML, CSS, and vanilla JS. Extremely fast, deeply secure, and hosted for free via GitHub Pages.

## Configuration
All central settings (Author Name, Site Title, Welcome Message) are managed via `js/config.js`.

The article database is manually tracked in `js/writings-data.js`, which automatically populates the index pages and Next/Previous navigation across the site.

## Deployment
Optimized for GitHub Pages. Simply push the repository to the `main` branch and enable GitHub Pages on the root directory.
