# QuotesAppGold

An accessible, resilient, vanilla JavaScript quotes single-page application showcasing production-grade front-end patterns (state isolation, pure rendering, provider fallback, abortable fetch, progressive enhancement, and a11y support).

## Features
- Multiple quote providers with ordered fallback (quotable, dummyjson, type.fit, local static)
- Abortable, idempotent fetch (cancels in-flight when user requests a new one)
- Graceful loading with spinner + fixed min-height to prevent layout shift
- Local static fallback guarantees a quote even if offline
- ARIA live region & polite updates
- Tweet intent builder with length-safe truncation
- Pure state -> render separation
- Defensive error handling & provider isolation

## Tech Stack
- HTML5 semantic structure
- CSS3 (design tokens, responsive sizing, utility classes)
- Vanilla ES6+ JavaScript (no external dependencies)
- (Optional future) localStorage persistence for last quote

## Architecture Overview
Layer | Responsibility
------|--------------
Providers | Encapsulate external APIs & normalize `{ content, author }`
State | Current quote, author, loading flag
Controller | Event handlers (new quote, tweet) & abort coordination
Render | `render()` applies state to DOM; minimal DOM writes
Fallback | Local array ensures non-empty experience
Accessibility | Live updates, button states, spinner semantics

## State Shape
```js
state = {
	quote: String,      // current quote text
	author: String,     // current author
	loading: Boolean    // UI loading spinner flag
}
```

## Data Flow
User clicks New → Abort previous (if any) → Iterate providers → First success updates state → Render → (On failure after all) local fallback message.

## Accessibility
- `aria-live="polite" aria-atomic="true"` around quote text
- Spinner has `role="status"` & `aria-hidden` toggled for assistive technology
- Disabled Tweet button until quote available
- High-contrast focus ring and accessible labels

## Tweet Format
`"<quote>" — <author>` truncated intelligently to fit inside 280 chars (reserve headroom). Unknown authors rendered as `Unknown`.

## Provider Strategy
Order attempted:
1. Quotable Random (`https://api.quotable.io/random`)
2. DummyJSON Random Quote (`https://dummyjson.com/quotes/random`)
3. Type.fit Random Pick (`https://type.fit/api/quotes`)
4. Local Static Fallback (in-memory list)

Each provider throws on shape mismatch or HTTP failure; control flow proceeds to next. AbortController cancels chain if new request begins.

## Error Handling
- Logs technical details to console only
- User sees friendly fallback message if all remote sources fail
- Local fallback prevents empty UI scenario

## Security Considerations
- Text injected via `textContent` (prevents HTML injection)
- Providers considered untrusted; shape validated before usage
- No user-supplied input executed

## Project Structure
```
practicejs/
	index.html      # Markup + root containers / spinner
	styles.css      # Theme tokens, layout, spinner, responsive rules
	app.js          # Providers, state, controller, render
	Readme.md       # This document
```

## Customization
Goal | Change
-----|-------
Add provider | Append to `Providers` array with `fetch(signal)` returning normalized object
Adjust order | Reorder entries in `Providers`
Change spinner | Update `.spinner` styles in CSS
Persist last quote | Add localStorage set/read in `updateQuote()` & on init
Limit quote length | Truncate in `updateQuote` before setting state

## Extensibility Ideas
- Prefetch next quote post-render
- LocalStorage hydration (instant first paint)
- Copy to clipboard button
- Offline SW caching & network-first strategy
- Theming toggle (light/dark via CSS vars)
- Metrics: provider success / latency logging
- Retry button & exponential backoff
- Animated transitions (respecting reduced motion)

## Core Functions
Function | Purpose
---------|--------
`fetchRandomQuote()` | Orchestrate provider attempts with abort support
`updateQuote(text, author)` | Normalize & set state
`render()` | Apply state to DOM (idempotent)
`buildTweetIntent()` | Compose safe tweet URL

## Manual Test Scenarios
Scenario | Expected
---------|---------
Rapid multi-click New | Only last fetch resolves (previous aborted)
All remote down | Local fallback quote shown
Tweet disabled initially | Enabled only after successful quote
Network slow + new click | First request aborted promptly

## License
MIT (add LICENSE file if needed).

## Status
Stable resilient baseline. Ready for prefetch, persistence, and advanced UX enhancements.
