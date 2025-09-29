# qoutesApp

Single-page Quotes application. Shows a "Quote of the Moment" and lets you fetch a new quote and tweet it.

## Features
- Centered banner layout
- New Quote fetch from public API (quotable.io fallback strategy)
- Graceful loading state with spinner + min-height to avoid layout shift
- Copy-safe tweet intent link including author and quote
- Accessible: ARIA live region for quote updates, focus management, high contrast buttons

## Structure
- `index.html` – markup skeleton
- `styles.css` – layout, theme, spinner, responsive adjustments
- `app.js` – state, fetch, render, tweet builder

## Development
Open `index.html` directly in a modern browser (no build step).

## Tweet Format
`"<quote>" — <author>` (trimmed if necessary to keep under 280 characters)

## Possible Enhancements
- Loading multiple at once & caching next
- Dark mode toggle
- Copy to clipboard button
- Offline fallback list

## License
MIT
