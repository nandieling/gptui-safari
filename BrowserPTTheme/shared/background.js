/* Manifest v3 keeps no persistent page, so the toolbar button has to open the
 * settings tab itself.  A popup would shrink the options panel to 800x600, so
 * the manifest leaves default_popup unset and lets the click through. */
(() => {
  'use strict';

  const api = globalThis.browser ?? globalThis.chrome;

  if (!api?.runtime?.onInstalled || !api.action?.onClicked) {
    return;
  }

  const openSettings = () => {
    void api.runtime.openOptionsPage();
  };

  api.action.onClicked.addListener(openSettings);

  api.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      openSettings();
    }
  });
})();
