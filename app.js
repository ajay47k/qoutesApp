/* Quotes App SPA Logic */
(function() {
  'use strict';

  // ------------------ State ------------------
  const state = {
    quote: '',
    author: '',
    loading: false,
    // track last fetched id/slug if API returns it (not required)
  };

  // ------------------ DOM ------------------
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  const spinnerEl = document.getElementById('spinner');
  const newBtn = document.getElementById('newQuoteBtn');
  const tweetBtn = document.getElementById('tweetBtn');

  // ------------------ Config / APIs ------------------
  // Primary: quotable.io random
  const ENDPOINTS = [
    'https://api.quotable.io/random',
    // Fallback list API gives multiple; we'll pick random if first fails
    'https://api.quotable.io/quotes?limit=50'
  ];

  // ------------------ Helpers ------------------
  function setLoading(isLoading) {
    state.loading = isLoading;
    spinnerEl.hidden = !isLoading;
    spinnerEl.setAttribute('aria-hidden', String(!isLoading));
    if (isLoading) {
      // Preserve height by keeping previous content but visually muting
      quoteTextEl.classList.add('fading');
    } else {
      quoteTextEl.classList.remove('fading');
    }
  }

  function render() {
    if (!state.quote) {
      quoteTextEl.innerHTML = '<span class="placeholder">Fetching inspiration...</span>';
      quoteAuthorEl.textContent = '';
      tweetBtn.disabled = true;
      return;
    }
    quoteTextEl.textContent = state.quote;
    quoteAuthorEl.textContent = state.author ? `— ${state.author}` : '';
    tweetBtn.disabled = !state.quote;
  }

  function buildTweetIntent() {
    if (!state.quote) return '#quotes';
    // Compose tweet under 280 chars; leave some slack for URL (none here) but safe trim
    const base = `"${state.quote}" — ${state.author || 'Unknown'}`;
    const trimmed = base.length > 260 ? base.slice(0, 257) + '…' : base;
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(trimmed);
    return url;
  }

  async function fetchRandomQuote() {
    setLoading(true);
    try {
      let data = await getJSON(ENDPOINTS[0]);
      // quotable.io/random returns {content, author}
      if (data && data.content) {
        updateQuote(data.content, data.author);
      } else {
        throw new Error('Unexpected random shape');
      }
    } catch (err) {
      // Fallback attempt: list endpoint
      try {
        const list = await getJSON(ENDPOINTS[1]);
        if (list && Array.isArray(list.results) && list.results.length) {
          const pick = list.results[Math.floor(Math.random() * list.results.length)];
            updateQuote(pick.content, pick.author);
        } else {
          throw new Error('Fallback empty');
        }
      } catch (fallbackErr) {
        updateQuote('Unable to fetch quote. Please try again.', '');
        console.error('Quote fetch failed:', err, fallbackErr);
      }
    } finally {
      setLoading(false);
      render();
    }
  }

  async function getJSON(url) {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
  }

  function updateQuote(text, author) {
    state.quote = text || '';
    state.author = author || '';
  }

  function handleNewQuote() {
    fetchRandomQuote();
  }

  function handleTweet() {
    const href = buildTweetIntent();
    window.open(href, '_blank', 'noopener');
  }

  // ------------------ Init ------------------
  function init() {
    newBtn.addEventListener('click', handleNewQuote);
    tweetBtn.addEventListener('click', handleTweet);
    // Keyboard accessory: Enter triggers when focused
    newBtn.addEventListener('keyup', e => { if (e.key === 'Enter') handleNewQuote(); });
    tweetBtn.addEventListener('keyup', e => { if (e.key === 'Enter' && !tweetBtn.disabled) handleTweet(); });

    fetchRandomQuote();
  }

  init();
})();
