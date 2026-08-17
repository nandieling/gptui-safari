(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  const domainUtils = globalThis.GPTUIThemeDomain;
  const themeConfig = globalThis.GPTUIThemeConfig;
  const themeRegistry = globalThis.GPTUIThemes;
  if (!api?.storage?.local || !domainUtils) {
    return;
  }

  const SETTINGS_KEY = 'gptuiThemeSettings';
  const DOMAIN_VERSION = 2;
  const TRANSLATION_DOMAIN_VERSION = 1;
  const DEFAULT_TRANSLATION_DOMAINS = [
    'jpopsuki.eu',
    'iptorrents.com',
    'happyfappy.net',
    'hd-space.org'
  ];
  const themes = Array.isArray(themeRegistry?.themes) ? [...themeRegistry.themes] : [];
  const defaultThemeId = themeRegistry?.defaultId || themes[0]?.id || 'gpt-ui';
  const DEFAULT_SETTINGS = {
    enabled: true,
    themeId: defaultThemeId,
    domains: Array.isArray(themeConfig?.domains) ? [...themeConfig.domains] : [],
    domainVersion: DOMAIN_VERSION,
    hideTypeColumn: false,
    autoTranslate: true,
    translationDomains: DEFAULT_TRANSLATION_DOMAINS,
    translationDomainVersion: TRANSLATION_DOMAIN_VERSION
  };

  const enabledInput = document.querySelector('#enabled');
  const hideTypeInput = document.querySelector('#hide-type-column');
  const autoTranslateInput = document.querySelector('#auto-translate');
  const themeList = document.querySelector('#theme-list');
  const domainForm = document.querySelector('#domain-form');
  const domainInput = document.querySelector('#domain');
  const domainList = document.querySelector('#domain-list');
  const domainCount = document.querySelector('#domain-count');
  const translationDomainForm = document.querySelector('#translation-domain-form');
  const translationDomainInput = document.querySelector('#translation-domain');
  const translationDomainList = document.querySelector('#translation-domain-list');
  const translationDomainCount = document.querySelector('#translation-domain-count');
  const status = document.querySelector('#status');
  const panel = document.querySelector('.panel');

  let settings = { ...DEFAULT_SETTINGS };
  let statusTimer;

  function focusOptionsTop() {
    document.activeElement?.blur?.();
    domainInput?.blur?.();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    panel?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function normalizeThemeId(themeId) {
    return themes.some((theme) => theme.id === themeId) ? themeId : defaultThemeId;
  }

  function normalizeDomains(domains) {
    return [...new Set(domains
      .map((domain) => domainUtils.normalizeDomain(domain))
      .filter((domain) => domainUtils.isValidDomain(domain)))].sort();
  }

  function normalizeSettings(savedSettings) {
    const saved = savedSettings && typeof savedSettings === 'object' ? savedSettings : {};
    const savedDomains = Array.isArray(saved.domains) ? saved.domains : [];
    const domains = saved.domainVersion === DOMAIN_VERSION
      ? normalizeDomains(savedDomains)
      : normalizeDomains([...DEFAULT_SETTINGS.domains, ...savedDomains]);
    const savedTranslationDomains = Array.isArray(saved.translationDomains)
      ? saved.translationDomains
      : [];
    const translationDomains = saved.translationDomainVersion === TRANSLATION_DOMAIN_VERSION
      ? normalizeDomains(savedTranslationDomains)
      : normalizeDomains([...DEFAULT_TRANSLATION_DOMAINS, ...savedTranslationDomains]);
    return {
      ...DEFAULT_SETTINGS,
      enabled: saved.enabled !== false,
      hideTypeColumn: saved.hideTypeColumn === true,
      autoTranslate: saved.autoTranslate !== false,
      themeId: normalizeThemeId(saved.themeId),
      domains,
      domainVersion: DOMAIN_VERSION,
      translationDomains,
      translationDomainVersion: TRANSLATION_DOMAIN_VERSION
    };
  }

  function setStatus(message, isError = false) {
    window.clearTimeout(statusTimer);
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'success';
    statusTimer = window.setTimeout(() => {
      status.textContent = '';
      delete status.dataset.state;
    }, 2600);
  }

  async function saveSettings() {
    await api.storage.local.set({ [SETTINGS_KEY]: settings });
  }

  function updateThemeSelection() {
    themeList.querySelectorAll('.theme-card').forEach((card) => {
      const selected = card.dataset.theme === settings.themeId;
      card.dataset.selected = selected ? 'true' : 'false';
      const input = card.querySelector('input[name="theme"]');
      const state = card.querySelector('.theme-state');
      if (input) {
        input.checked = selected;
      }
      if (state) {
        state.hidden = !selected;
      }
    });
  }

  function renderThemes() {
    themeList.replaceChildren();

    if (themes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '主题资源不可用，请重新运行 gpt-ui。';
      themeList.appendChild(empty);
      return;
    }

    themes.forEach((theme) => {
      const card = document.createElement('label');
      card.className = 'theme-card';
      card.dataset.theme = theme.id;

      const input = document.createElement('input');
      input.className = 'theme-radio';
      input.type = 'radio';
      input.name = 'theme';
      input.value = theme.id;
      input.setAttribute('aria-label', `选择 ${theme.name} 主题`);

      const preview = document.createElement('span');
      preview.className = 'theme-preview';
      preview.dataset.theme = theme.id;
      preview.setAttribute('aria-hidden', 'true');

      const content = document.createElement('span');
      content.className = 'theme-card-content';

      const header = document.createElement('span');
      header.className = 'theme-card-header';

      const name = document.createElement('strong');
      name.className = 'theme-name';
      name.textContent = theme.name;

      const state = document.createElement('span');
      state.className = 'theme-state';
      state.textContent = '当前使用';

      const description = document.createElement('span');
      description.className = 'theme-description';
      description.textContent = theme.description;

      const note = document.createElement('span');
      note.className = 'theme-note';
      note.textContent = `${theme.note} · ${theme.file}`;

      header.append(name, state);
      content.append(header, description, note);
      card.append(input, preview, content);
      themeList.appendChild(card);
    });

    updateThemeSelection();
  }

  function renderDomains() {
    domainList.replaceChildren();
    domainCount.textContent = String(settings.domains.length);

    if (settings.domains.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = '尚未添加站点。添加域名后，主题才会在对应页面生效。';
      domainList.appendChild(empty);
      return;
    }

    settings.domains.forEach((domain) => {
      const item = document.createElement('li');
      item.className = 'domain-item';

      const label = document.createElement('code');
      label.textContent = domain;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove';
      removeButton.dataset.domain = domain;
      removeButton.textContent = '移除';
      removeButton.addEventListener('click', async () => {
        const previousDomains = settings.domains;
        settings.domains = settings.domains.filter((itemDomain) => itemDomain !== domain);
        try {
          await saveSettings();
          renderDomains();
          setStatus(`已移除 ${domain}`);
        } catch (error) {
          settings.domains = previousDomains;
          setStatus('设置保存失败，请重试', true);
        }
      });

      item.append(label, removeButton);
      domainList.appendChild(item);
    });
  }

  function renderTranslationDomains() {
    translationDomainList.replaceChildren();
    translationDomainCount.textContent = String(settings.translationDomains.length);

    if (settings.translationDomains.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = '尚未添加自动翻译站点。';
      translationDomainList.appendChild(empty);
      return;
    }

    settings.translationDomains.forEach((domain) => {
      const item = document.createElement('li');
      item.className = 'domain-item';

      const label = document.createElement('code');
      label.textContent = domain;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove';
      removeButton.textContent = '移除';
      removeButton.addEventListener('click', async () => {
        const previousDomains = settings.translationDomains;
        settings.translationDomains = previousDomains.filter((itemDomain) => itemDomain !== domain);
        try {
          await saveSettings();
          renderTranslationDomains();
          setStatus(`已停止翻译 ${domain}`);
        } catch (error) {
          settings.translationDomains = previousDomains;
          setStatus('设置保存失败，请重试', true);
        }
      });

      item.append(label, removeButton);
      translationDomainList.appendChild(item);
    });
  }

  enabledInput.addEventListener('change', async () => {
    settings.enabled = enabledInput.checked;
    try {
      await saveSettings();
      setStatus(settings.enabled ? '主题已启用' : '主题已停用');
    } catch (error) {
      enabledInput.checked = !settings.enabled;
      settings.enabled = enabledInput.checked;
      setStatus('设置保存失败，请重试', true);
    }
  });

  hideTypeInput.addEventListener('change', async () => {
    settings.hideTypeColumn = hideTypeInput.checked;
    try {
      await saveSettings();
      setStatus(settings.hideTypeColumn ? '类型列隐藏已启用' : '类型列隐藏已停用');
    } catch (error) {
      hideTypeInput.checked = !settings.hideTypeColumn;
      settings.hideTypeColumn = hideTypeInput.checked;
      setStatus('设置保存失败，请重试', true);
    }
  });

  autoTranslateInput.addEventListener('change', async () => {
    settings.autoTranslate = autoTranslateInput.checked;
    try {
      await saveSettings();
      setStatus(settings.autoTranslate ? '自动翻译已启用' : '自动翻译已停用');
    } catch (error) {
      autoTranslateInput.checked = !settings.autoTranslate;
      settings.autoTranslate = autoTranslateInput.checked;
      setStatus('设置保存失败，请重试', true);
    }
  });

  themeList.addEventListener('change', async (event) => {
    const input = event.target.closest('input[name="theme"]');
    if (!input || !themeList.contains(input)) {
      return;
    }

    const nextTheme = themes.find((theme) => theme.id === input.value);
    if (!nextTheme) {
      return;
    }

    const previousThemeId = settings.themeId;
    settings.themeId = nextTheme.id;
    updateThemeSelection();
    try {
      await saveSettings();
      setStatus(`已切换到 ${nextTheme.name} 主题`);
    } catch (error) {
      settings.themeId = previousThemeId;
      updateThemeSelection();
      setStatus('设置保存失败，请重试', true);
    }
  });

  domainForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const domain = domainUtils.normalizeDomain(domainInput.value);

    if (!domainUtils.isValidDomain(domain)) {
      setStatus('请输入有效的域名', true);
      domainInput.focus();
      return;
    }

    if (settings.domains.includes(domain)) {
      setStatus('这个域名已经添加', true);
      return;
    }

    settings.domains = [...settings.domains, domain].sort();
    try {
      await saveSettings();
      domainInput.value = '';
      renderDomains();
      setStatus(`已添加 ${domain}`);
    } catch (error) {
      settings.domains = settings.domains.filter((itemDomain) => itemDomain !== domain);
      setStatus('设置保存失败，请重试', true);
    }
  });

  translationDomainForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const domain = domainUtils.normalizeDomain(translationDomainInput.value);

    if (!domainUtils.isValidDomain(domain)) {
      setStatus('请输入有效的域名', true);
      translationDomainInput.focus();
      return;
    }
    if (settings.translationDomains.includes(domain)) {
      setStatus('这个站点已经添加', true);
      return;
    }

    settings.translationDomains = [...settings.translationDomains, domain].sort();
    try {
      await saveSettings();
      translationDomainInput.value = '';
      renderTranslationDomains();
      setStatus(`已为 ${domain} 启用自动翻译`);
    } catch (error) {
      settings.translationDomains = settings.translationDomains.filter((itemDomain) => itemDomain !== domain);
      setStatus('设置保存失败，请重试', true);
    }
  });

  async function initialize() {
    const stored = await api.storage.local.get({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
    settings = normalizeSettings(stored[SETTINGS_KEY]);
    enabledInput.checked = settings.enabled;
    hideTypeInput.checked = settings.hideTypeColumn;
    autoTranslateInput.checked = settings.autoTranslate;
    renderThemes();
    renderDomains();
    renderTranslationDomains();
    focusOptionsTop();
  }

  void initialize().catch(() => {
    enabledInput.disabled = true;
    hideTypeInput.disabled = true;
    autoTranslateInput.disabled = true;
    themeList.querySelectorAll('input').forEach((input) => {
      input.disabled = true;
    });
    domainInput.disabled = true;
    domainForm.querySelector('button[type="submit"]').disabled = true;
    translationDomainInput.disabled = true;
    translationDomainForm.querySelector('button[type="submit"]').disabled = true;
    setStatus('无法读取扩展设置', true);
  });

  // Safari may focus the first form control when the extension page opens.
  // Keep the initial view at the top without removing keyboard access later.
  focusOptionsTop();
  window.setTimeout(focusOptionsTop, 0);
  window.setTimeout(focusOptionsTop, 32);
})();
