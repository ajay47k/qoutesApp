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

  // ------------------ Config / Providers ------------------
  // We rotate through providers; each returns a normalized { content, author }
  const localFallback = [
    { content: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { content: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
    { content: 'Well begun is half done.', author: 'Aristotle' },
    { content: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' },
    { content: 'Make it work, make it right, make it fast.', author: 'Kent Beck' }
  ];

  const Providers = [
    {
      name: 'quotable-random',
      fetch: async (signal) => {
        const r = await fetch('https://api.quotable.io/random', { signal });
        if (!r.ok) throw new Error('quotable random HTTP ' + r.status);
        const j = await r.json();
        if (!j.content) throw new Error('quotable random shape');
        return { content: j.content, author: j.author || 'Unknown' };
      }
    },
    {
      name: 'dummyjson',
      fetch: async (signal) => {
        const r = await fetch('https://dummyjson.com/quotes/random', { signal });
        if (!r.ok) throw new Error('dummyjson HTTP ' + r.status);
        const j = await r.json();
        if (!j.quote) throw new Error('dummyjson shape');
        return { content: j.quote, author: j.author || 'Unknown' };
      }
    },
    {
      name: 'typefit',
      fetch: async (signal) => {
        const r = await fetch('https://type.fit/api/quotes', { signal });
        if (!r.ok) throw new Error('typefit HTTP ' + r.status);
        const j = await r.json();
        if (!Array.isArray(j) || !j.length) throw new Error('typefit empty');
        const pick = j[Math.floor(Math.random() * j.length)];
        if (!pick || !pick.text) throw new Error('typefit shape');
        return { content: pick.text, author: pick.author || 'Unknown' };
      }
    },
    {
      name: 'local-fallback',
      fetch: async () => {
        const pick = localFallback[Math.floor(Math.random() * localFallback.length)];
        return pick;
      }
    }
  ];

  let currentAbort = null;

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
    if (currentAbort) currentAbort.abort();
    currentAbort = new AbortController();
    const { signal } = currentAbort;

    setLoading(true);
    let lastError = null;
    for (const provider of Providers) {
      try {
        const { content, author } = await provider.fetch(signal);
        updateQuote(content, author);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (signal.aborted) {
          return; // aborted intentionally
        }
        // continue to next provider
      }
    }
    if (lastError) {
      updateQuote('Unable to fetch quote. Please try again.', '');
      console.error('All providers failed:', lastError);
    }
    setLoading(false);
    render();
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
