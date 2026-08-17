(() => {
  const themes = [
    Object.freeze({
      id: 'gpt-ui',
      name: 'gpt-ui',
      file: 'theme.css',
      description: '现代化的卡片式界面，强化信息层级与操作反馈。',
      note: '默认主题'
    }),
    Object.freeze({
      id: 'agsv',
      name: 'agsv',
      file: 'agsv-theme.css',
      description: '更简洁的 NP 站点布局，保留第二套主题的视觉风格。',
      note: '备选主题'
    })
  ];

  globalThis.GPTUIThemes = Object.freeze({
    defaultId: 'gpt-ui',
    themes: Object.freeze(themes)
  });
})();
