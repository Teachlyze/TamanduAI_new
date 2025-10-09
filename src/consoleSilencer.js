// Global console silencer - must be imported BEFORE any other app imports
(function setupConsoleSilencer() {
  try {
    const verbose = (import.meta?.env?.VITE_VERBOSE_LOGS || '').toString().toLowerCase() === 'true';

    // Keep originals
    const original = {
      log: console.log,
      info: console.info,
      debug: console.debug,
      warn: console.warn,
      error: console.error,
    };

    if (!verbose) {
      const noop = () => {};
      // Silence noisy levels
      console.log = noop; // eslint-disable-line no-console
      console.info = noop; // eslint-disable-line no-console
      console.debug = noop; // eslint-disable-line no-console

      // Filter known noisy warnings while keeping real warnings visible
      console.warn = function filteredWarn(...args) { // eslint-disable-line no-console
        const msg = (args && args[0] ? String(args[0]) : '').toLowerCase();
        // Ignore Supabase duplicate GoTrueClient notice
        if (msg.includes('multiple gotrueclient instances')) return;
        // Forward other warnings
        return original.warn.apply(console, args);
      };

      // Keep errors intact
      console.error = function forwardedError(...args) { // eslint-disable-line no-console
        return original.error.apply(console, args);
      };
    }
  } catch (_) {
    // ignore
  }
})();
