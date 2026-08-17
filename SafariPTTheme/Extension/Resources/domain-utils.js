(() => {
  function normalizeDomain(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
      .split(/[/?#]/, 1)[0]
      .replace(/^\*\./, '')
      .replace(/:\d+$/, '')
      .replace(/\.$/, '');
  }

  function isValidDomain(domain) {
    return domain.length > 0 &&
      domain.length <= 253 &&
      !domain.includes('..') &&
      /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(domain);
  }

  function matchesDomain(hostname, domains) {
    const host = normalizeDomain(hostname);
    return domains.some((domain) => {
      const normalized = normalizeDomain(domain);
      return normalized && (host === normalized || host.endsWith(`.${normalized}`));
    });
  }

  globalThis.GPTUIThemeDomain = Object.freeze({
    isValidDomain,
    matchesDomain,
    normalizeDomain
  });
})();
