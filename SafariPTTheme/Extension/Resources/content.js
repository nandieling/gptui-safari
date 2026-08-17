(() => {
  'use strict';

  const api = globalThis.browser ?? globalThis.chrome;
  const domainUtils = globalThis.GPTUIThemeDomain;
  const themeConfig = globalThis.GPTUIThemeConfig;
  const themeRegistry = globalThis.GPTUIThemes;

  if (!api?.runtime?.getURL || !api?.storage?.local || !domainUtils) {
    return;
  }

  const SETTINGS_KEY = 'gptuiThemeSettings';
  const THEME_ATTRIBUTE = 'data-gptui-safari-theme';
  const LINK_ATTRIBUTE = 'data-gptui-safari-theme-link';
  const SITE_ATTRIBUTE = 'data-gptui-site';
  const PAGE_ATTRIBUTE = 'data-gptui-page';
  const DOMAIN_VERSION = 2;
  const IS_TOP_FRAME = window.top === window.self;
  const FALLBACK_THEME = { id: 'gpt-ui', file: 'theme.css' };
  const DEFAULT_THEME_ID = themeRegistry?.defaultId || FALLBACK_THEME.id;
  const SITE_COLOR_ONLY_DOMAINS = Object.freeze([
    'greatposterwall.com',
    'oldtoons.world',
    'seedpool.org',
    'darkland.top',
    'blutopia.cc'
  ]);
  // These listings intentionally use the site's native NexusPHP table. Keep
  // their CSS-facing site id generic so retired site adapters cannot match.
  const GENERIC_NEXUSPHP_SITE_IDS = Object.freeze([
    'hdsky.me',
    'hdhome.org',
    'ourbits.club',
    'ptchdbits.co',
    'hddolby.com',
    'springsunday.net'
  ]);
  const DEFAULT_TRANSLATION_DOMAINS = Object.freeze([
    'jpopsuki.eu',
    'iptorrents.com',
    'happyfappy.net',
    'hd-space.org'
  ]);
  const TRANSLATION_EXCLUDE_SELECTOR = [
    '.gptui-torrent-row:not(.gptui-torrent-header-row)',
    'table.torrents > tbody > tr:not(.gptui-torrent-header-row)',
    'table.torrent_table > tbody > tr:not(.gptui-torrent-header-row)',
    'table#torrenttable > tbody > tr:not(.gptui-torrent-header-row)',
    'table#torrent_table > tbody > tr:not(.gptui-torrent-header-row)',
    'table[class*="torrent"] > tbody > tr:not(.gptui-torrent-header-row)',
    '[data-gptui-torrent-table] > tbody > tr:not(.gptui-torrent-header-row)',
    '.gptui-title-cell:not(.gptui-torrent-header-cell)',
    '.gptui-title-primary:not(.gptui-torrent-header-cell)',
    '.gptui-title-line:not(.gptui-torrent-header-cell)',
    '.torrent-title',
    '.torrent-name',
    '.torrent_name',
    '.release-name',
    '.release-description',
    '[class*="torrent-row"]:not(.gptui-torrent-header-row)',
    '[id*="torrenttable"] tr:not(.gptui-torrent-header-row)'
  ].join(',');
  const TRANSLATION_UI_SELECTOR = [
    'nav',
    'header',
    'footer',
    'aside',
    '[role="navigation"]',
    '[role="menu"]',
    '[role="menuitem"]',
    '[role="tab"]',
    'button',
    'label',
    'select',
    'option',
    '.menu',
    '[id*="menu"]',
    '[class*="menu"]',
    '[class*="nav"]',
    '[class*="pager"]',
    '[class*="pagination"]',
    '[class*="breadcrumb"]',
    '[class*="filter"]',
    '[class*="search"]',
    '[class*="toolbar"]',
    '[class*="tab"]',
    '[class*="panel-title"]',
    '[class*="section-title"]',
    '[class*="page-title"]',
    '[id="mainmenu"]',
    '[id="topmenu"]',
    '[id="menu"]',
    '[id="nav"]',
    '.mainmenu',
    '.navbar',
    '.navigation',
    '.topmenu',
    '.toolbar',
    '.tabs',
    '[class*="login"]',
    '[class*="account"]',
    '[class*="profile"]',
    '[class*="stat"]',
    '[class*="info"]',
    '[id*="info"]',
    '[class*="setting"]',
    '#info_block',
    '#userinfo',
    '#user_info',
    '#userbar',
    '#stats',
    '#stats_block',
    '.info-block',
    '.info_block',
    '.user-info',
    '.user_info',
    '.userbar',
    '.user-stats',
    '.user_stats',
    '.site-header',
    '.site-nav',
    '.topbar',
    '.button',
    '.btn',
    'a.button',
    'a.btn',
    'a',
    'td',
    'li',
    'form',
    'fieldset',
    'legend',
    'textarea',
    'caption',
    'thead',
    'th',
    'table[data-gptui-torrent-table] tr.gptui-torrent-header-row',
    'h1',
    'h2',
    'h3'
  ].join(',');
  const TRANSLATION_PHRASES = Object.freeze({
    'home': '首页',
    'homepage': '首页',
    'browse': '浏览',
    'browse torrents': '浏览种子',
    'torrents': '种子',
    'torrent': '种子',
    'torrent list': '种子列表',
    'search': '搜索',
    'search torrents': '搜索种子',
    'advanced search': '高级搜索',
    'log in': '登录',
    'login': '登录',
    'sign in': '登录',
    'log out': '退出登录',
    'logout': '退出登录',
    'sign out': '退出登录',
    'register': '注册',
    'sign up': '注册',
    'my account': '我的账户',
    'account': '账户',
    'profile': '个人资料',
    'settings': '设置',
    'preferences': '偏好设置',
    'language': '语言',
    'english': '英语',
    'japanese': '日语',
    'forum': '论坛',
    'forums': '论坛',
    'messages': '消息',
    'inbox': '收件箱',
    'notifications': '通知',
    'rules': '规则',
    'faq': '常见问题',
    'help': '帮助',
    'staff': '管理组',
    'donate': '捐赠',
    'upload': '上传',
    'uploads': '上传',
    'request': '求种',
    'download': '下载',
    'downloads': '下载',
    'favorites': '收藏',
    'favourites': '收藏',
    'bookmarks': '书签',
    'requests': '求种',
    'new posts': '新帖子',
    'new topics': '新主题',
    'my topics': '我的主题',
    't-subs': 'T-字幕',
    'f-subs': 'F-字幕',
    'rss': 'RSS',
    'claim': '认领',
    'review': '审核',
    'comments': '评论',
    'comment': '评论',
    'replies': '回复',
    'reply': '回复',
    'peers': '连接数',
    'size': '大小',
    'time': '时间',
    'date added': '添加日期',
    'added': '已添加',
    'category': '分类',
    'categories': '分类',
    'type': '类型',
    'name': '名称',
    'title': '标题',
    'details': '详情',
    'rating': '评分',
    'freeleech': '免费',
    'free leech': '免费',
    'free': '免费',
    'promoted': '促销',
    'filter': '筛选',
    'sort': '排序',
    'apply': '应用',
    'reset': '重置',
    'clear': '清除',
    'go': '前往',
    'submit': '提交',
    'save': '保存',
    'cancel': '取消',
    'close': '关闭',
    'next': '下一页',
    'next page': '下一页',
    'previous': '上一页',
    'previous page': '上一页',
    'first': '首页',
    'last': '末页',
    'refresh': '刷新',
    'show': '显示',
    'hide': '隐藏',
    'select': '选择',
    'all': '全部',
    'yes': '是',
    'no': '否',
    'home page': '首页',
    'welcome back': '欢迎回来',
    'welcome back!': '欢迎回来！',
    'index': '首页',
    'extras': '额外功能',
    'donations': '捐赠',
    'invites': '邀请',
    'invite': '邀请',
    'log': '日志',
    'application': '申请',
    'tags': '标签',
    'collages': '合集',
    'chat': '聊天',
    'vip': '贵宾会员',
    'conn-checker': '连接检查',
    'connection checker': '连接检查',
    'top 10': '热门排行',
    'top': '热门',
    'mirrors': '镜像站',
    'iptv': '网络电视',
    'trending torrents': '热门种子',
    'trending 种子': '热门种子',
    'trending': '热门趋势',
    'day': '日',
    'week': '周',
    'month': '月',
    'quarter': '季度',
    'year': '年',
    'movies': '电影',
    'movie': '电影',
    'tv shows': '电视剧',
    'tv guide': '电视指南',
    'credits': '积分',
    'credit': '积分',
    'slots': '配额',
    'up': '上传',
    'down': '下载',
    'ratio': '分享率',
    'bonus': '魔力值',
    'members': '会员',
    'member': '会员',
    'active': '活动中',
    'active only': '仅显示活动项',
    'search by': '搜索方式',
    'show/hide categories': '显示/隐藏分类',
    'our team recommend': '团队推荐',
    'cat.': '分类',
    'com.': '评论',
    'filename': '文件名',
    'file name': '文件名',
    'uploader': '发布者',
    'uploaded by': '发布者',
    'last access': '上次访问',
    'active torrents': '活动种子',
    'most active torrents uploaded in the past day': '过去一天上传的最活跃种子',
    'most active torrents uploaded in the past week': '过去一周上传的最活跃种子',
    'most active torrents uploaded in the past month': '过去一个月上传的最活跃种子',
    'most active torrents': '最活跃种子',
    'uploaded in the past day': '过去一天上传',
    'uploaded in the past week': '过去一周上传',
    'uploaded in the past month': '过去一个月上传',
    'past day': '过去一天',
    'past week': '过去一周',
    'past month': '过去一个月',
    'my panel': '我的面板',
    'friendlist': '好友列表',
    'mailbox': '邮箱',
    'notices': '通知',
    'posts': '帖子',
    'friends': '好友',
    'peeps': '用户',
    'artists': '艺人',
    'artist': '艺人',
    'album': '专辑',
    'albums': '专辑',
    'single': '单曲',
    'tv-music': '电视音乐',
    'radio': '电台',
    'irc': 'IRC',
    'torrent/album name': '种子/专辑名称',
    'album name': '专辑名称',
    'data': '数据',
    'rank': '等级',
    'read new announcement': '阅读新公告',
    'latest forum threads': '最新论坛主题',
    'new site blog': '新站点博客',
    'new contest': '新活动',
    'seed': '做种',
    'leech': '下载',
    'dl': '下载',
    'dls': '下载数',
    'days': '天',
    'day(s)': '天',
    'hours': '小时',
    'hour': '小时',
    'minutes': '分钟',
    'minute': '分钟',
    'seconds': '秒',
    'second': '秒',
    'left': '剩余',
    'site free leech': '站点免费',
    'adddate': '添加日期',
    'addeddate': '添加日期',
    'cat': '分类',
    's': '做种',
    'l': '下载',
    'seeders': '做种数',
    'leechers': '下载数',
    'user': '用户',
    'users': '用户',
    'password': '密码',
    'username': '用户名',
    'captcha': '验证码',
    'advanced options': '高级选项',
    'remember me': '记住我',
    'create account': '创建账户',
    'recover password': '找回密码',
    'automatic log off after 15 minutes inactivity': '闲置 15 分钟后自动退出',
    'login successful': '登录成功',
    'no results found': '没有找到结果',
    'loading': '加载中',
    'today': '今天',
    'yesterday': '昨天',
    'tomorrow': '明天',
    'added date': '添加日期',
    'date': '日期',
    'new': '新的',
    'more': '更多',
    'less': '更少',
    'online': '在线',
    'offline': '离线',
    'view': '查看',
    'list': '列表',
    'grid': '网格',
    'page': '页面',
    'pages': '页',
    'results': '结果',
    'showing': '显示',
    'of': '共',
    'support': '支持',
    'live irc support': 'IRC 在线支持',
    'double up credit offer now active': '双倍积分活动现已开启',
    'double credit active': '双倍积分已开启',
    'donate now': '立即捐赠',
    'premium streaming': '高级流媒体',
    'trusted by thousands': '受到数千人信赖',
    'your support keeps this community alive': '您的支持让这个社区持续发展',
    'every donation is doubled right now': '现在每笔捐赠都会获得双倍积分',
    'sharing the universe': '共享宇宙',
    'pay paypal': '使用 PayPal 支付',
    'ホーム': '首页',
    '検索': '搜索',
    'ログイン': '登录',
    'ログアウト': '退出登录',
    '登録': '注册',
    'アカウント': '账户',
    'プロフィール': '个人资料',
    '設定': '设置',
    '言語': '语言',
    'フォーラム': '论坛',
    'メッセージ': '消息',
    '通知': '通知',
    'ヘルプ': '帮助',
    'アップロード': '上传',
    'ダウンロード': '下载',
    'お気に入り': '收藏',
    'コメント': '评论',
    '返信': '回复',
    'カテゴリ': '分类',
    'サイズ': '大小',
    '評価': '评分',
    '次へ': '下一页',
    '前へ': '上一页',
    '詳細': '详情',
    '絞り込み': '筛选',
    '並べ替え': '排序'
  });

  const SITE_RULES = Object.freeze({
    'totheglory.im': { layout: 'totheglory' },
    'pthome.net': { layout: 'pthome' },
    'pandapt.net': { layout: 'pandapt' },
    'open.cd': { layout: 'open-cd' },
    'hdarea.club': { layout: 'hdarea' },
    'pttime.org': { layout: 'pttime' },
    'p.t-baozi.cc': { layout: 'baozi' },
    'pt.btschool.club': { layout: 'btschool' },
    'pt.soulvoice.club': { layout: 'soulvoice' },
    'pterclub.net': { layout: 'pterclub' },
    'tjupt.org': { layout: 'tjupt' },
    'pt.keepfrds.com': { layout: 'keepfrds' },
    'cyanbug.net': { layout: 'cyanbug' },
    'discfan.net': { layout: 'discfan' },
    'azusa.wiki': { layout: 'azusa' },
    'dicmusic.com': { layout: 'dicmusic' },
    'jpopsuki.eu': { layout: 'jpopsuki' },
    'monikadesign.uk': { layout: 'monikadesign' },
    'hhanclub.net': { layout: 'hhanclub' },
    'byr.pt': { layout: 'byr' },
    '13city.org': { layout: '13city' },
    'duckboobee.org': { layout: 'duckboobee' },
    'et8.org': { layout: 'et8' },
    'ultrahd.net': { layout: 'ultrahd' },
    'dubhe.site': { layout: 'dubhe' },
    'hdvideo.top': { layout: 'hdvideo' },
    'xingtan.one': { layout: 'xingtan' },
    'dstudio.me': { layout: 'dstudio' },
    'www.haidan.cc': { layout: 'haidan' },
    'bitporn.eu': { layout: 'bitporn' }
  });

  const hostname = domainUtils.normalizeDomain(location.hostname);
  const siteId = [...Object.keys(SITE_RULES), ...SITE_COLOR_ONLY_DOMAINS].find((domain) => (
    hostname === domain || hostname.endsWith(`.${domain}`)
  )) || hostname;
  const siteRule = SITE_RULES[siteId] || {};
  const TORRENT_CONTROL_LAYOUTS = Object.freeze([
    'hdarea',
    'btschool',
    'soulvoice',
    'azusa',
    'ultrahd',
    'pterclub',
    'et8'
  ]);
  const TORRENT_MARK_LAYOUTS = Object.freeze([
    ...TORRENT_CONTROL_LAYOUTS,
    'discfan'
  ]);
  // These legacy tables are more reliable when left in their native column
  // geometry. Clear artifacts from older extension versions before styling.
  const NATIVE_TORRENT_LAYOUTS = Object.freeze(['open-cd', 'baozi', 'dicmusic']);
  const TORRENT_CONTROL_RAIL_LAYOUTS = Object.freeze([
    'pterclub',
    'et8',
    'hdarea',
    'btschool',
    'soulvoice',
    'azusa',
    'ultrahd'
  ]);
  const TORRENT_CONTROL_METRIC_LAYOUTS = Object.freeze([
    'hdarea',
    'btschool',
    'soulvoice',
    'azusa',
    'ultrahd'
  ]);
  const TITLE_WRAP_LAYOUTS = Object.freeze([
    'btschool',
    'soulvoice',
    'azusa',
    'ultrahd',
    'discfan'
  ]);
  const TYPE_COLUMN_FALLBACKS = Object.freeze({
    hdarea: 0,
    btschool: 0,
    soulvoice: 0,
    azusa: 0,
    ultrahd: 0,
    discfan: 0
  });
  const LEGACY_TITLE_TABLE_LAYOUTS = Object.freeze([
    'springsunday',
    'btschool',
    'soulvoice',
    'azusa',
    'et8',
    'ultrahd'
  ]);

  const DEFAULT_SETTINGS = {
    enabled: true,
    themeId: DEFAULT_THEME_ID,
    domains: Array.isArray(themeConfig?.domains) ? [...themeConfig.domains] : [],
    domainVersion: DOMAIN_VERSION,
    hideTypeColumn: false,
    autoTranslate: true,
    translationDomains: [...DEFAULT_TRANSLATION_DOMAINS],
    translationDomainVersion: 1
  };

  let activeSettings = DEFAULT_SETTINGS;
  let themeActive = false;
  let documentObserver;
  let adaptTimer = 0;
  const translatedTextNodes = new Map();
  const translatedAttributes = new Map();
  const translationAttributeIds = new WeakMap();
  let nextTranslationAttributeId = 0;

  const FREE_TIME_PATTERN = /(?:优惠剩余时间|免费剩余时间|剩余时间|优惠时间|免费时间|free\s*(?:time|remaining|leech)|免费)[\s:：\[\](){}【】「」『』-]*(?:(?:(?:\d+(?:\.\d+)?\s*(?:天|日|小时|时|分|分钟|秒|days?|hours?|minutes?|seconds?|d|h|m|s)\s*){1,3}|\d+(?:\s*[:：]\s*\d+){1,2}|\d+(?:\.\d+)?))?/gi;
  const FREE_TIME_DETECT_PATTERN = new RegExp(FREE_TIME_PATTERN.source, 'gi');
  const FREE_TIME_CONTEXT_PATTERN = /(?:优惠剩余时间|免费剩余时间|剩余时间|优惠时间|免费时间|free\s*(?:time|remaining|leech))/i;
  const FREE_TIME_LABEL_PATTERN = /^(?:优惠剩余时间|免费剩余时间|剩余时间|优惠时间|免费时间|free\s*(?:time|remaining|leech))$/i;
  const FREE_TIME_VALUE_PATTERN = /^(?:(?:\d+(?:\.\d+)?\s*(?:天|日|小时|时|分钟|分|秒|days?|hours?|minutes?|seconds?|d|h|m|s)\s*)+|\d+\s*[:：]\s*\d+(?:\s*[:：]\s*\d+)?)$/i;
  const FREE_TIME_NUMBER_PATTERN = /^\d+(?:\.\d+)?$/;
  const FREE_TIME_HINT = /(?:优惠剩余时间|免费剩余时间|剩余时间|优惠时间|免费时间|free\s*(?:time|remaining|leech)|免费)/i;
  const DROPDOWN_SELECTOR = [
    '.ddsubmenustyle',
    '.dropmenu',
    'ul.menu li > ul',
    '#ddtopmenubar li > ul',
    '#mainmenu li > ul',
    '[data-gptui-dropdown]'
  ].join(',');

  function uniqueDomains(domains) {
    return [...new Set(domains
      .map((domain) => domainUtils.normalizeDomain(domain))
      .filter((domain) => domainUtils.isValidDomain(domain)))].sort();
  }

  function resolveTheme(themeId) {
    const selectedTheme = themeRegistry?.themes?.find((theme) => theme.id === themeId);
    return selectedTheme || themeRegistry?.themes?.[0] || FALLBACK_THEME;
  }

  function normalizeSettings(savedSettings) {
    const saved = savedSettings && typeof savedSettings === 'object' ? savedSettings : {};
    const savedDomains = Array.isArray(saved.domains) ? saved.domains : [];
    const domains = saved.domainVersion === DOMAIN_VERSION
      ? uniqueDomains(savedDomains)
      : uniqueDomains([...DEFAULT_SETTINGS.domains, ...savedDomains]);
    const savedTranslationDomains = Array.isArray(saved.translationDomains)
      ? saved.translationDomains
      : [];
    const translationDomains = saved.translationDomainVersion === 1
      ? uniqueDomains(savedTranslationDomains)
      : uniqueDomains([...DEFAULT_TRANSLATION_DOMAINS, ...savedTranslationDomains]);

    return {
      ...DEFAULT_SETTINGS,
      enabled: saved.enabled !== false,
      hideTypeColumn: saved.hideTypeColumn === true,
      autoTranslate: saved.autoTranslate !== false,
      themeId: resolveTheme(saved.themeId).id,
      domains,
      domainVersion: DOMAIN_VERSION,
      translationDomains,
      translationDomainVersion: 1
    };
  }

  async function readSettings() {
    const stored = await api.storage.local.get({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
    return normalizeSettings(stored[SETTINGS_KEY]);
  }

  function isSiteColorOnly() {
    return SITE_COLOR_ONLY_DOMAINS.some((domain) => (
      hostname === domain || hostname.endsWith(`.${domain}`)
    ));
  }

  function setSiteMetadata() {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    const cssSiteId = GENERIC_NEXUSPHP_SITE_IDS.includes(siteId) ? 'nexusphp' : siteId;
    root.setAttribute(SITE_ATTRIBUTE, cssSiteId);
    root.setAttribute(PAGE_ATTRIBUTE, /(?:torrents?\.php|index(?:\.php)?|browse|search)/i.test(location.pathname)
      ? 'listing'
      : 'page');
    if (activeSettings.hideTypeColumn) {
      root.setAttribute('data-gptui-hide-type-column', 'true');
    } else {
      root.removeAttribute('data-gptui-hide-type-column');
    }
  }

  function addThemeLinks(themeId) {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    const selectedTheme = resolveTheme(themeId);
    const styleFiles = isSiteColorOnly()
      ? ['site-colors.css']
      : [selectedTheme.file, 'safari-compat.css'];
    const target = document.head || root;

    document.querySelectorAll(`link[${LINK_ATTRIBUTE}]`).forEach((link) => {
      if (!styleFiles.includes(link.getAttribute(LINK_ATTRIBUTE))) {
        link.remove();
      }
    });

    styleFiles.forEach((fileName) => {
      const existingLink = [...document.querySelectorAll(`link[${LINK_ATTRIBUTE}]`)]
        .find((link) => link.getAttribute(LINK_ATTRIBUTE) === fileName);
      const link = existingLink || document.createElement('link');

      link.rel = 'stylesheet';
      link.href = api.runtime.getURL(fileName);
      link.setAttribute(LINK_ATTRIBUTE, fileName);
      // Re-appending keeps the selected resources after any site stylesheet.
      target.appendChild(link);
    });

    root.setAttribute(THEME_ATTRIBUTE, selectedTheme.id);
    if (activeSettings.hideTypeColumn) {
      root.setAttribute('data-gptui-hide-type-column', 'true');
    } else {
      root.removeAttribute('data-gptui-hide-type-column');
    }
    themeActive = true;
    queueAdapt();
  }

  function removeThemeLinks() {
    document.querySelectorAll(`link[${LINK_ATTRIBUTE}]`).forEach((link) => link.remove());
    document.documentElement?.removeAttribute(THEME_ATTRIBUTE);
    document.documentElement?.removeAttribute('data-gptui-hide-type-column');
    themeActive = false;
  }

  function isConfiguredByDefault() {
    return domainUtils.matchesDomain(hostname, DEFAULT_SETTINGS.domains);
  }

  function isTranslationSite() {
    return activeSettings.translationDomains.some((domain) => (
      hostname === domain || hostname.endsWith(`.${domain}`)
    ));
  }

  function isTranslationExcluded(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }
    if (element.matches?.(TRANSLATION_EXCLUDE_SELECTOR) ||
      element.closest?.(TRANSLATION_EXCLUDE_SELECTOR)) {
      return true;
    }

    // Some translation targets use plain tables without torrent-related class
    // names. Their data rows still have a details/download link and several
    // cells; exclude those rows before walking generic UI anchors/cells.
    let row = element.closest?.('tr');
    while (row) {
      if (isLikelyTorrentDataRow(row)) {
        return true;
      }
      row = row.parentElement?.closest?.('tr') || null;
    }
    return false;
  }

  function isLikelyTorrentDataRow(row) {
    if (!row || row.classList.contains('gptui-torrent-header-row') || row.querySelector('th')) {
      return false;
    }
    const table = row.closest('table');
    const marker = [
      row.id,
      typeof row.className === 'string' ? row.className : '',
      table?.id,
      typeof table?.className === 'string' ? table.className : ''
    ].filter(Boolean).join(' ').toLowerCase();
    if (/(?:torrent|torrent_table|torrenttable|release|download-list|download_list)/i.test(marker)) {
      return row.cells.length >= 2;
    }
    const hasTorrentLink = [...row.querySelectorAll('a[href]')].some((link) => {
      const href = link.getAttribute('href') || '';
      return /(?:details|download|torrent|\.torrent)(?:\.php|[/?#=&]|$)/i.test(href);
    });
    return row.cells.length >= 3 && hasTorrentLink;
  }

  function translationKey(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function translateUiText(value) {
    const original = String(value || '');
    const trimmed = original.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!trimmed) {
      return original;
    }

    const exact = TRANSLATION_PHRASES[translationKey(trimmed)];
    if (exact) {
      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      return `${leading}${exact}${trailing}`;
    }

    let translated = trimmed;
    [...Object.entries(TRANSLATION_PHRASES)]
      .sort((left, right) => right[0].length - left[0].length)
      .forEach(([source, target]) => {
        const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = /[a-z]/i.test(source)
          ? new RegExp(`${/^[a-z0-9]/i.test(source) ? '\\b' : ''}${escaped}${/[a-z0-9]$/i.test(source) ? '\\b' : ''}`, 'gi')
          : new RegExp(escaped, 'g');
        translated = translated.replace(pattern, target);
      });
    if (translated === trimmed) {
      return original;
    }
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function restoreTranslations() {
    translatedTextNodes.forEach((record, node) => {
      if (node.isConnected && node.nodeValue === record.translated) {
        node.nodeValue = record.original;
      }
      translatedTextNodes.delete(node);
    });
    translatedAttributes.forEach((record, key) => {
      if (record.element.isConnected && record.element.getAttribute(record.name) === record.translated) {
        record.element.setAttribute(record.name, record.original);
      }
      translatedAttributes.delete(key);
    });
  }

  function translateTextNode(node) {
    if (!node?.parentElement || isTranslationExcluded(node.parentElement)) {
      return;
    }
    const current = node.nodeValue || '';
    const record = translatedTextNodes.get(node);
    const source = record && current === record.translated ? record.original : current;
    const translated = translateUiText(source);
    if (translated === source) {
      translatedTextNodes.delete(node);
      return;
    }
    node.nodeValue = translated;
    translatedTextNodes.set(node, { original: source, translated });
  }

  function translateUiAttribute(element, name) {
    if (!element || isTranslationExcluded(element)) {
      return;
    }
    const current = element.getAttribute(name);
    if (!current || !/\S/.test(current)) {
      return;
    }
    let elementId = translationAttributeIds.get(element);
    if (!elementId) {
      nextTranslationAttributeId += 1;
      elementId = String(nextTranslationAttributeId);
      translationAttributeIds.set(element, elementId);
    }
    const key = `${elementId}:${name}`;
    const record = translatedAttributes.get(key);
    const source = record && record.name === name && current === record.translated
      ? record.original
      : current;
    const translated = translateUiText(source);
    if (translated === source) {
      if (record?.name === name) {
        translatedAttributes.delete(key);
      }
      return;
    }
    if (translated === current) {
      translatedAttributes.set(key, { element, name, original: source, translated });
      return;
    }
    element.setAttribute(name, translated);
    translatedAttributes.set(key, { element, name, original: source, translated });
  }

  function translateUserInterface() {
    if (!IS_TOP_FRAME || !activeSettings.autoTranslate || !isTranslationSite()) {
      restoreTranslations();
      return;
    }

    const roots = [...document.querySelectorAll(TRANSLATION_UI_SELECTOR)]
      .filter((element) => !isTranslationExcluded(element));
    const seen = new Set();
    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, 4);
      let node;
      while ((node = walker.nextNode())) {
        if (seen.has(node) || isTranslationExcluded(node.parentElement)) {
          continue;
        }
        seen.add(node);
        translateTextNode(node);
      }
    });

    roots.forEach((root) => {
      [root, ...root.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], select, option, [aria-label], [title], [placeholder], [alt]')]
        .forEach((element) => {
          ['aria-label', 'title', 'placeholder', 'alt', 'value'].forEach((name) => {
            if (name === 'value' && !/^(?:input|button)$/i.test(element.tagName || '')) {
              return;
            }
            if (element.hasAttribute(name)) {
              translateUiAttribute(element, name);
            }
          });
        });
    });
  }

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function columnLabel(cell) {
    return [
      textOf(cell),
      cell?.getAttribute?.('aria-label'),
      cell?.getAttribute?.('title'),
      cell?.getAttribute?.('alt'),
      typeof cell?.className === 'string' ? cell.className : '',
      cell?.id
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isTorrentTableCandidate(table) {
    const identity = `${table.id || ''} ${typeof table.className === 'string' ? table.className : ''}`.toLowerCase();
    const hasTorrentName = identity.includes('torrent');
    const hasTorrentArtwork = Boolean(table.querySelector('img.pro_free, img.pro_50pctdown, img.pro_free2, img[class*="torrent"]'));
    const rows = [...table.rows].filter((row) => row.cells.length >= 3);
    return rows.length >= 2 && (hasTorrentName || hasTorrentArtwork);
  }

  function findTorrentTables() {
    const tables = [...document.querySelectorAll('table')]
      .filter(isTorrentTableCandidate);
    if (TORRENT_MARK_LAYOUTS.includes(siteRule.layout)) {
      document.querySelectorAll('table.torrents, table#torrenttable').forEach((table) => {
        const rows = [...table.rows].filter((row) => row.cells.length >= 3);
        if (rows.length >= 2) {
          tables.push(table);
        }
      });
    }
    const candidates = [...new Set(tables)];
    const candidateSet = new Set(candidates);
    return candidates.filter((table) => {
      let ancestor = table.parentElement?.closest('table');
      while (ancestor) {
        if (candidateSet.has(ancestor) || ancestor.matches('table[data-gptui-torrent-table]')) {
          return false;
        }
        ancestor = ancestor.parentElement?.closest('table');
      }
      return true;
    });
  }

  function findHeaderRow(table) {
    const rows = [...table.rows];
    const candidates = rows.slice(0, 8);
    const scored = candidates.map((row, index) => {
      const labels = [...row.cells].map(columnLabel);
      const score = labels.reduce((total, label) => {
        if (!label || label.length > 28) {
          return total;
        }
        return total + (/标题|名称|类型|分类|种类|类别|海报|封面|发布者|评分|优惠|免费|title|name|category|cat|poster|cover|uploader|rating|free|size/i.test(label) ? 1 : 0);
      }, 0);
      return { row, index, score };
    });
    return scored
      .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.row || rows[0];
  }

  function findColumnIndex(labels, pattern, fallback) {
    const index = labels.findIndex((label) => pattern.test(label));
    return index >= 0 ? index : fallback;
  }

  function rowColumnSpan(row) {
    return [...(row?.cells || [])].reduce((total, cell) => (
      total + Math.max(1, Number(cell.colSpan) || 1)
    ), 0);
  }

  function cellIndexAtColumn(row, columnIndex) {
    if (!row || !Number.isInteger(columnIndex) || columnIndex < 0) {
      return -1;
    }

    let logicalIndex = 0;
    for (const [index, cell] of [...row.cells].entries()) {
      const span = Math.max(1, Number(cell.colSpan) || 1);
      if (columnIndex >= logicalIndex && columnIndex < logicalIndex + span) {
        return index;
      }
      logicalIndex += span;
    }
    return -1;
  }

  function logicalCells(row) {
    const result = [];
    let logicalIndex = 0;
    [...(row?.cells || [])].forEach((cell, index) => {
      const span = Math.max(1, Number(cell.colSpan) || 1);
      result.push({ cell, index, logicalIndex, span });
      logicalIndex += span;
    });
    return result;
  }

  function titleCellScore(cell, logicalIndex, preferredIndex) {
    if (!cell) {
      return -Infinity;
    }

    const value = textOf(cell);
    const titleNodes = [...cell.querySelectorAll('a, b, strong')]
      .filter((element) => !element.querySelector('img'))
      .map((element) => textOf(element))
      .filter((text) => text.length >= 8);
    const imageCount = cell.querySelectorAll('img').length;
    const hasOnlyArtwork = imageCount > 0 && value.length < 8 && titleNodes.length === 0;
    const hasLongTitleNode = titleNodes.some((text) => text.length >= 20);
    let score = Math.min(value.length, 180);
    if (titleNodes.length > 0) {
      score += 70;
    }
    if (hasLongTitleNode) {
      score += 45;
    }
    if (cell.querySelector('a')) {
      score += 12;
    }
    if (hasOnlyArtwork) {
      score -= 180;
    }
    if (imageCount > 2 && value.length < 20) {
      score -= 80;
    }
    if (logicalIndex === preferredIndex) {
      score += 18;
    }
    return score;
  }

  function inferTitleColumnIndex(table, header, count, fallback) {
    if (!table || count <= 0) {
      return fallback;
    }

    const scores = Array.from({ length: count }, () => 0);
    [...table.rows]
      .filter((row) => row !== header && row.cells.length >= 2)
      .slice(0, 80)
      .forEach((row) => {
        logicalCells(row).forEach(({ cell, logicalIndex, span }) => {
          if (logicalIndex >= count) {
            return;
          }
          const value = textOf(cell);
          const longLink = [...cell.querySelectorAll('a, b, strong')]
            .some((element) => !element.querySelector('img') && textOf(element).length >= 12);
          let score = titleCellScore(cell, logicalIndex, fallback);
          if (longLink) {
            score += 45;
          }
          if (span > 1) {
            score -= 10;
          }
          if (value.length < 8 && !longLink) {
            score -= 40;
          }
          scores[logicalIndex] += score;
        });
      });

    let bestIndex = fallback;
    let bestScore = fallback >= 0 && fallback < scores.length ? scores[fallback] : -Infinity;
    scores.forEach((score, index) => {
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    });
    return bestIndex >= 0 ? bestIndex : fallback;
  }

  function posterImageScore(image) {
    if (!image) {
      return 0;
    }

    const marker = `${torrentImageOwnMarker(image)} ${torrentImageOwnerMarker(image)}`;
    if (/(?:download|arrowdown|rss|feed|comment|reply|question|help|audit|review|approve|verify|check|favorite|favourite|bookmark|collect|star|imdb|tmdb|douban|rating|score|审核|未审|已审)/i.test(marker)) {
      return 0;
    }

    const rect = image.getBoundingClientRect?.();
    const width = Math.max(Number(rect?.width) || 0, Number(image.naturalWidth) || 0,
      Number.parseFloat(image.getAttribute?.('width')) || 0);
    const height = Math.max(Number(rect?.height) || 0, Number(image.naturalHeight) || 0,
      Number.parseFloat(image.getAttribute?.('height')) || 0);
    const alt = `${image.getAttribute?.('alt') || ''} ${image.getAttribute?.('title') || ''}`;
    let score = 0;
    if (/(?:poster|cover|movie|film|backdrop|thumbnail|timg|海报|封面)/i.test(marker)) {
      score += 10;
    }
    if (alt.trim() === '?' || alt.trim() === '？') {
      score += 4;
    }
    if (height >= 24 && height / Math.max(width, 1) >= 1.15) {
      score += 6;
    }
    if (height >= 48) {
      score += 2;
    }
    return score;
  }

  function inferPosterColumnIndex(table, header, count, titleIndex, typeIndex) {
    if (!table || titleIndex <= 0 || count <= 0) {
      return -1;
    }

    const scores = Array.from({ length: Math.min(titleIndex, count) }, () => 0);
    [...table.rows]
      .filter((row) => row !== header && row.cells.length >= 2)
      .slice(0, 80)
      .forEach((row) => {
        logicalCells(row).forEach(({ cell, logicalIndex }) => {
          if (logicalIndex >= titleIndex || logicalIndex === typeIndex) {
            return;
          }
          const imageScore = [...cell.querySelectorAll('img')]
            .reduce((total, image) => total + posterImageScore(image), 0);
          scores[logicalIndex] += imageScore;
        });
      });

    let bestIndex = -1;
    let bestScore = 0;
    scores.forEach((score, index) => {
      if (score > bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    });
    return bestIndex;
  }

  function isCommentCountText(value) {
    return /^(?:\d{1,6})(?:\s*[条个])?$/.test(String(value || '').trim());
  }

  function isCommentStatusElement(element) {
    if (!element) {
      return false;
    }

    const marker = [
      torrentControlMarker(element),
      element.getAttribute?.('src'),
      element.getAttribute?.('alt'),
      element.getAttribute?.('title'),
      typeof element.className === 'string' ? element.className : ''
    ].filter(Boolean).join(' ').toLowerCase();
    return /(?:comments?|comment|reply|discussion|讨论|评论|回复)/.test(marker) &&
      !/(?:audit|review|approve|verify|check|审核|未审|已审)/.test(marker);
  }

  function findCommentPayload(titleCell) {
    if (!titleCell) {
      return { control: null, count: null };
    }

    const control = [...titleCell.querySelectorAll(
      'a, button, [role="button"], input[type="image"], img'
    )]
      .filter(isCommentStatusElement)
      .map((element) => element.closest?.(
        'a, button, [role="button"], input[type="image"]'
      ) || element)
      .find((element) => textOf(element).length < 20);

    const candidates = [];
    const walker = document.createTreeWalker(titleCell, 4);
    let node;
    while ((node = walker.nextNode())) {
      const value = String(node.nodeValue || '').trim();
      if (!isCommentCountText(value)) {
        continue;
      }

      const parent = node.parentElement;
      if (!parent || parent.closest(
        '.gptui-title-meta, .gptui-free-time, .gptui-rating-block, .gptui-torrent-control-rail'
      )) {
        continue;
      }
      const longTitleOwner = parent.closest('a, b, strong');
      if (longTitleOwner && textOf(longTitleOwner).length >= 20) {
        continue;
      }

      let score = 0;
      if (isCommentStatusElement(parent) || isCommentStatusElement(parent.previousElementSibling)) {
        score += 50;
      }
      if (control && control.contains(node)) {
        continue;
      }
      if (parent.parentElement === titleCell) {
        score += 8;
      }
      candidates.push({ node, score });
    }

    candidates.sort((left, right) => right.score - left.score);
    return { control: control || null, count: candidates[0]?.node || null };
  }

  function moveCommentPayload(node, targetCell) {
    if (!node || !targetCell) {
      return;
    }

    if (node.nodeType === 3) {
      const value = String(node.nodeValue || '').trim();
      if (!value) {
        return;
      }
      const count = document.createElement('span');
      count.className = 'gptui-comment-count';
      count.textContent = value;
      node.parentNode?.replaceChild(count, node);
      targetCell.appendChild(count);
      return;
    }

    const tagName = node.tagName?.toLowerCase() || '';
    if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
      return;
    }
    node.classList.add('gptui-comment-payload');
    targetCell.appendChild(node);
  }

  function normalizeCommentColumnRows(table, titleIndex, commentsIndex, expectedColumnCount) {
    if (!table || !Number.isInteger(titleIndex) || !Number.isInteger(commentsIndex) ||
        commentsIndex < 0 || commentsIndex <= titleIndex) {
      return;
    }

    [...table.rows]
      .filter((row) => row.cells.length >= 2)
      .forEach((row) => {
        const irregularRow = expectedColumnCount > 0 &&
          (rowColumnSpan(row) !== expectedColumnCount || [...row.cells].some((cell) => cell.colSpan > 1));
        const titleCellIndex = irregularRow
          ? findTitleCellIndex(row, titleIndex)
          : cellIndexAtColumn(row, titleIndex);
        const titleCell = row.cells[titleCellIndex];
        let commentCell = row.cells[cellIndexAtColumn(row, commentsIndex)];
        if (!titleCell) {
          return;
        }

        const titleSpan = Math.max(1, Number(titleCell.colSpan) || 1);
        if (titleCell === commentCell && titleSpan > commentsIndex - titleIndex) {
          const payload = findCommentPayload(titleCell);
          if (!payload.control && !payload.count) {
            return;
          }

          titleCell.colSpan = Math.max(1, titleSpan - 1);
          commentCell = document.createElement('td');
          commentCell.className = 'gptui-comment-normalized-cell';
          titleCell.after(commentCell);
          moveCommentPayload(payload.control, commentCell);
          if (payload.count && (!payload.control || !payload.control.contains(payload.count))) {
            moveCommentPayload(payload.count, commentCell);
          }
          row.setAttribute('data-gptui-comments-normalized', 'true');
          return;
        }

        // BTSchool and HDArea put the comment number at the end of the title
        // action strip even when the title cell does not use colspan. Move
        // that standalone number into the existing comments column so it has
        // the same horizontal center as the header icon.
        if (!commentCell || commentCell === titleCell || textOf(commentCell)) {
          return;
        }
        const payload = findCommentPayload(titleCell);
        if (!payload.count && !payload.control) {
          return;
        }
        moveCommentPayload(payload.control, commentCell);
        if (payload.count && (!payload.control || !payload.control.contains(payload.count))) {
          moveCommentPayload(payload.count, commentCell);
        }
        row.setAttribute('data-gptui-comments-normalized', 'true');
      });

    if (expectedColumnCount > 0) {
      table.setAttribute('data-gptui-comments-normalized-count', String(expectedColumnCount));
    }
  }

  function ensureTorrentColumnGroup(table, layout, count, columnIndexes) {
    if (!table || !count || !['hdarea', 'pterclub', 'et8',
      'btschool', 'soulvoice', 'azusa', 'ultrahd',
      'discfan'].includes(layout)) {
      return;
    }

    const roleByIndex = new Map();
    const rolePriority = ['title', 'type', 'poster', 'rating', 'comments', 'free', 'artwork', 'publisher'];
    const setRole = (index, role) => {
      const previous = roleByIndex.get(index);
      if (Number.isInteger(index) && index >= 0 && index < count &&
          (!previous || rolePriority.indexOf(role) < rolePriority.indexOf(previous))) {
        roleByIndex.set(index, role);
      }
    };
    setRole(columnIndexes.type, 'type');
    setRole(columnIndexes.poster, 'poster');
    setRole(columnIndexes.title, 'title');
    setRole(columnIndexes.rating, 'rating');
    setRole(columnIndexes.comments, 'comments');
    setRole(columnIndexes.free, 'free');
    if (['pterclub', 'et8'].includes(layout) && columnIndexes.title > 0) {
      for (let index = 0; index < columnIndexes.title; index += 1) {
        setRole(index, 'artwork');
      }
    }
    setRole(count - 1, 'publisher');

    const columnRoles = [...Array(count)]
      .map((_, index) => roleByIndex.get(index) || 'metric');
    const signature = `v2:${layout}:${count}:${columnRoles
      .map((_, index) => roleByIndex.get(index) || 'metric')
      .join(',')}`;
    let columnGroup = [...table.children]
      .find((child) => child.tagName?.toLowerCase() === 'colgroup' &&
        child.getAttribute('data-gptui-column-widths') === 'true');
    if (columnGroup?.getAttribute('data-gptui-column-signature') === signature) {
      return;
    }

    if (!columnGroup) {
      columnGroup = document.createElement('colgroup');
      columnGroup.setAttribute('data-gptui-column-widths', 'true');
      table.insertBefore(columnGroup, table.firstElementChild || null);
    } else {
      columnGroup.replaceChildren();
    }

    [...Array(count)].forEach((_, index) => {
      const column = document.createElement('col');
      const role = columnRoles[index];
      column.className = `gptui-col-${role}`;
      column.setAttribute('data-gptui-column-index', String(index + 1));
      columnGroup.appendChild(column);
    });
    table.style.removeProperty('--gptui-title-column-width');
    columnGroup.setAttribute('data-gptui-column-signature', signature);
  }

  function torrentGridWidth(role, layout) {
    if (role === 'title') {
      return 'minmax(0, 1fr)';
    }
    if (role === 'poster') {
      return ['open-cd', 'dicmusic'].includes(layout) ? '104px' : '72px';
    }
    if (role === 'type') {
      return '64px';
    }
    if (role === 'artwork') {
      return '66px';
    }
    if (role === 'publisher') {
      return '78px';
    }
    if (role === 'comments') {
      return '52px';
    }
    if (role === 'rating') {
      return '54px';
    }
    if (role === 'free') {
      return '56px';
    }
    return '54px';
  }

  function ensureTorrentGridTemplate(table, layout, count, columnIndexes) {
    if (!table || count <= 0) {
      return;
    }

    const hiddenTypeIndex = activeSettings.hideTypeColumn &&
      Number.isInteger(columnIndexes.type) ? columnIndexes.type : -1;
    const roleByColumn = new Map();
    const rolePriority = ['title', 'type', 'poster', 'rating', 'comments', 'free', 'artwork', 'publisher'];
    Object.entries(columnIndexes).forEach(([role, index]) => {
      if (!Number.isInteger(index) || index < 0 || index >= count) {
        return;
      }
      if (index === hiddenTypeIndex) {
        return;
      }
      const visibleIndex = hiddenTypeIndex >= 0 && index > hiddenTypeIndex
        ? index - 1
        : index;
      const previous = roleByColumn.get(visibleIndex);
      if (!previous || rolePriority.indexOf(role) < rolePriority.indexOf(previous)) {
        roleByColumn.set(visibleIndex, role);
      }
    });
    const visibleCount = Math.max(1, count - (hiddenTypeIndex >= 0 ? 1 : 0));
    if (!roleByColumn.has(visibleCount - 1) && visibleCount > 1) {
      roleByColumn.set(visibleCount - 1, 'publisher');
    }
    const template = [...Array(visibleCount)]
      .map((_, index) => torrentGridWidth(roleByColumn.get(index) || 'metric', layout))
      .join(' ');
    table.style.setProperty('--gptui-grid-template', template);
  }

  function markTorrentGridRow(table, row, cells, columnIndexes, resolvedIndexes, roleByCell,
    expectedColumnCount, irregularRow) {
    if (!siteRule.layout || !irregularRow) {
      row.removeAttribute('data-gptui-grid-row');
      row.removeAttribute('data-gptui-grid-columns');
      cells.forEach((cell) => {
        cell.style.removeProperty('--gptui-grid-column');
        cell.style.removeProperty('--gptui-grid-span');
      });
      return;
    }

    const hiddenTypeIndex = activeSettings.hideTypeColumn &&
      Number.isInteger(columnIndexes.type) ? columnIndexes.type : -1;
    const gridColumnCount = Math.max(1, expectedColumnCount - (hiddenTypeIndex >= 0 ? 1 : 0));
    ensureTorrentGridTemplate(table, siteRule.layout, expectedColumnCount, columnIndexes);
    const logicalIndexByCell = new Map(
      logicalCells(row).map(({ cell, logicalIndex }) => [
        cell,
        logicalIndex === hiddenTypeIndex && hiddenTypeIndex >= 0
          ? -1
          : (hiddenTypeIndex >= 0 && logicalIndex > hiddenTypeIndex
            ? logicalIndex - 1
            : logicalIndex)
      ])
    );
    const assignments = new Map();
    const occupied = new Set();
    const rolePriority = ['title', 'type', 'poster', 'rating', 'comments', 'free', 'artwork', 'publisher'];
    [...roleByCell.entries()]
      .sort((left, right) => rolePriority.indexOf(left[1]) - rolePriority.indexOf(right[1]))
      .forEach(([cellIndex, role]) => {
        if (role === 'type' && hiddenTypeIndex >= 0) {
          return;
        }
        const desired = columnIndexes[role];
        if (!Number.isInteger(desired) || desired < 0 || desired >= expectedColumnCount) {
          return;
        }
        let column = hiddenTypeIndex >= 0 && desired > hiddenTypeIndex
          ? desired - 1
          : desired;
        while (occupied.has(column) && column < gridColumnCount - 1) {
          column += 1;
        }
        assignments.set(cellIndex, { column, span: 1 });
        occupied.add(column);
      });

    cells.forEach((cell, index) => {
      if (hiddenTypeIndex >= 0 && cell.classList.contains('gptui-type-cell')) {
        cell.style.removeProperty('--gptui-grid-column');
        cell.style.removeProperty('--gptui-grid-span');
        return;
      }
      if (!assignments.has(index)) {
        let column = logicalIndexByCell.get(cell) ?? index;
        column = Math.max(0, Math.min(gridColumnCount - 1, column));
        while (occupied.has(column) && column < gridColumnCount - 1) {
          column += 1;
        }
        assignments.set(index, { column, span: 1 });
        occupied.add(column);
      }
      const assignment = assignments.get(index);
      cell.style.setProperty('--gptui-grid-column', String(assignment.column + 1));
      cell.style.setProperty('--gptui-grid-span', String(assignment.span));
    });
    row.setAttribute('data-gptui-grid-row', 'true');
    row.setAttribute('data-gptui-grid-columns', String(gridColumnCount));
  }

  function findTitleCellIndex(row, titleIndex) {
    const cells = [...row.cells];
    const mappedIndex = cellIndexAtColumn(row, titleIndex);
    const logicalIndexByCell = new Map(
      logicalCells(row).map(({ cell, logicalIndex }) => [cell, logicalIndex])
    );

    // Rows with a missing cell or a colSpan can make the logical title index
    // point at an artwork/metric cell. Prefer the cell that actually contains
    // a long title link before falling back to the mapped column.
    const candidates = cells.map((cell, index) => {
      const titleLinkLength = Math.max(0, ...[...cell.querySelectorAll('a, b, strong')]
        .filter((element) => !element.querySelector('img'))
        .map((element) => textOf(element).length));
      const imageCount = cell.querySelectorAll('img').length;
      const valueLength = textOf(cell).length;
      const logicalIndex = logicalIndexByCell.get(cell) ?? index;
      let score = titleCellScore(cell, logicalIndex, titleIndex);
      if (titleLinkLength >= 12) {
        score += 100 + Math.min(80, titleLinkLength);
      } else if (valueLength >= 20 && imageCount === 0) {
        score += 55;
      }
      if (imageCount > 0 && titleLinkLength < 12 && valueLength < 20) {
        score -= 90;
      }
      return { index, score, titleLinkLength, valueLength };
    });
    const explicitTitle = candidates
      .filter((candidate) => candidate.titleLinkLength >= 12 ||
        (candidate.valueLength >= 20 && cells[candidate.index].querySelectorAll('img').length === 0))
      .sort((left, right) => right.score - left.score ||
        right.titleLinkLength - left.titleLinkLength ||
        Math.abs(left.index - titleIndex) - Math.abs(right.index - titleIndex))[0];
    if (explicitTitle) {
      return explicitTitle.index;
    }

    return candidates.reduce((bestIndex, candidate) => (
      candidate.score > candidates[bestIndex].score ? candidate.index : bestIndex
    ), mappedIndex >= 0 ? mappedIndex : Math.min(titleIndex, Math.max(0, cells.length - 1)));
  }

  function directChildOf(element, ancestor) {
    let current = element;
    while (current?.parentElement && current.parentElement !== ancestor) {
      current = current.parentElement;
    }
    return current?.parentElement === ancestor ? current : null;
  }

  function nextMeaningfulSibling(node) {
    let current = node?.nextSibling;
    while (current) {
      if (current.nodeType === 3 && !/\S/.test(current.nodeValue || '')) {
        current = current.nextSibling;
        continue;
      }
      return current;
    }
    return null;
  }

  function hasTitleBreakAfter(node) {
    const next = nextMeaningfulSibling(node);
    return next?.nodeType === 1 && next.tagName.toLowerCase() === 'br';
  }

  function ensureTitlePrimaryBreak(primary, container) {
    if (!primary || !container) {
      return;
    }

    // Walk up through inline wrappers so `<a><b>title</b>subtitle</a>` is
    // split inside the anchor instead of after the whole anchor.
    let current = primary;
    while (current && current !== container) {
      if (hasTitleBreakAfter(current)) {
        return;
      }
      if (nextMeaningfulSibling(current)) {
        const lineBreak = document.createElement('br');
        lineBreak.className = 'gptui-title-primary-break';
        current.after(lineBreak);
        return;
      }
      current = current.parentElement;
    }

    const directRoot = directChildOf(primary, container);
    if (directRoot && hasTitleBreakAfter(directRoot)) {
      return;
    }
    if (directRoot && nextMeaningfulSibling(directRoot)) {
      const lineBreak = document.createElement('br');
      lineBreak.className = 'gptui-title-primary-break';
      directRoot.after(lineBreak);
    }
  }

  function siblingText(node, direction) {
    let current = node?.[direction];
    while (current) {
      const value = current.nodeType === 3 ? current.nodeValue : textOf(current);
      if (String(value || '').trim()) {
        return String(value || '');
      }
      current = current[direction];
    }
    return '';
  }

  function removeOurbitsRatingBreaks(line) {
    if (!line) {
      return;
    }

    // The original rating markup can insert a <br> between `7` and `.3`.
    // Remove only that break so the separator between IMDb and Douban rows
    // remains intact.
    [...line.querySelectorAll('br')].forEach((breakNode) => {
      const before = siblingText(breakNode, 'previousSibling');
      const after = siblingText(breakNode, 'nextSibling');
      if (/\d\s*$/.test(before) && /^\s*\.\s*\d/.test(after)) {
        breakNode.remove();
      }
    });
  }

  function hasOurbitsLongTitle(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    if (element.classList.contains('gptui-title-flow') ||
        element.classList.contains('gptui-title-meta') ||
        element.querySelector('.gptui-title-primary')) {
      return true;
    }

    const titleLikeElements = [...element.querySelectorAll('a, b, strong')]
      .filter((child) => !child.querySelector('img'))
      .map((child) => textOf(child))
      .filter((value) => value.length >= 20);
    if (titleLikeElements.length > 0) {
      return true;
    }

    return textOf(element).length > 128;
  }

  function ourbitsImageMarker(image) {
    return [
      image?.getAttribute('src'),
      image?.getAttribute('alt'),
      image?.getAttribute('title'),
      image?.getAttribute('class'),
      image?.id
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function isOurbitsRatingRailNode(element) {
    return Boolean(element?.closest?.('.gptui-ourbits-rating-rail'));
  }

  function isOurbitsFreeImage(image) {
    const marker = ourbitsImageMarker(image);
    return /(?:^|[\s_-])(?:pro[_-]?)?free(?:[_-]?\d*)?(?:[\s_-]|$)|50pctdown|freeleech/i.test(marker);
  }

  function isOurbitsRatingImage(image) {
    if (!image || image.tagName?.toLowerCase() !== 'img') {
      return false;
    }

    const marker = ourbitsImageMarker(image);
    return /imdb|douban|豆瓣|评分|rating|score/.test(marker);
  }

  function isOurbitsLargeSquareImage(image) {
    if (!image || isOurbitsFreeImage(image) || isOurbitsRatingImage(image)) {
      return false;
    }

    const width = Math.max(
      Number(image.naturalWidth) || 0,
      Number(image.width) || 0,
      Number.parseFloat(image.getAttribute('width')) || 0
    );
    const height = Math.max(
      Number(image.naturalHeight) || 0,
      Number(image.height) || 0,
      Number.parseFloat(image.getAttribute('height')) || 0
    );
    if (width < 24 || height < 24) {
      return false;
    }

    const ratio = width / height;
    return ratio >= 0.7 && ratio <= 1.4;
  }

  function isOurbitsAuditImage(image) {
    if (!image || image.tagName?.toLowerCase() !== 'img') {
      return false;
    }

    const marker = ourbitsImageMarker(image);
    return /question|问号|help|audit|review|reviewed|unreviewed|approve|approved|unapproved|verify|verified|check|checked|审核|未审|已审|审核状态/.test(marker) ||
      isOurbitsLargeSquareImage(image);
  }

  function isOurbitsRatingAuxiliaryImage(image) {
    if (!image || image.tagName?.toLowerCase() !== 'img') {
      return false;
    }

    const marker = ourbitsImageMarker(image);
    return isOurbitsAuditImage(image) || /rss|feed|star|favorite|收藏/.test(marker);
  }

  function isOurbitsRatingContainer(element, titleCell, ratingTextPattern) {
    if (!element || element === titleCell || element.nodeType !== 1 ||
        element.closest('.gptui-title-meta') || hasOurbitsLongTitle(element)) {
      return false;
    }

    const value = textOf(element);
    if (!value || value.length > 128) {
      return false;
    }

    return ratingTextPattern.test(value) ||
      Boolean(element.querySelector('.gptui-rating-value, img.gptui-rating-icon'));
  }

  function normalizeOurbitsRatingRoot(root, titleCell) {
    if (!root || root === titleCell) {
      return null;
    }

    const tagName = root.tagName?.toLowerCase() || '';
    if (!['td', 'th', 'tr', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
      return root;
    }

    const table = root.closest('table');
    return table && table !== titleCell && titleCell.contains(table) ? table : null;
  }

  function markOurbitsRatingBlock(titleCell) {
    if (!titleCell) {
      return;
    }

    const ratingValuePattern = /^(?:\d{1,2}\s*\.\s*\d{1,2}|N\s*\/?\s*A)$/i;
    const ratingTextPattern = /(?:^|[^A-Za-z0-9_-])(?:\d{1,2}\s*\.\s*\d{1,2}|N\s*\/?\s*A)(?=$|[^A-Za-z0-9_-])/i;
    const ratingZeroPattern = /(?:^|[^A-Za-z0-9_-])0(?=$|[^A-Za-z0-9_-])/;

    titleCell.querySelectorAll('.gptui-rating-block').forEach((element) => {
      if (!isOurbitsRatingRailNode(element)) {
        element.classList.remove('gptui-rating-block');
      }
    });

    const ratingValueNodes = [];
    const textWalker = document.createTreeWalker(titleCell, 4);
    let textNode;
    while ((textNode = textWalker.nextNode())) {
      if (isOurbitsRatingRailNode(textNode.parentElement) ||
          textNode.parentElement?.classList.contains('gptui-rating-value') ||
          textNode.parentElement?.closest('.gptui-title-meta')) {
        continue;
      }
      if (ratingValuePattern.test(String(textNode.nodeValue || '').trim())) {
        ratingValueNodes.push(textNode);
      }
    }

    ratingValueNodes.forEach((node) => {
      const value = document.createElement('span');
      value.className = 'gptui-rating-value';
      value.textContent = node.nodeValue || '';
      node.parentNode.replaceChild(value, node);
    });

    const allImages = [...titleCell.querySelectorAll('img')]
      .filter((image) => !isOurbitsRatingRailNode(image));
    const markedImages = allImages.filter(isOurbitsRatingImage);

    // Some OurBits image URLs are generic. In that case, only treat the image
    // as a score icon when its small surrounding block contains a score. This
    // prevents a generic image in a title wrapper from making the whole title
    // wrapper a rating block.
    const ratingImages = allImages.filter((image) => {
      if (markedImages.includes(image) || isOurbitsRatingAuxiliaryImage(image)) {
        return true;
      }
      let current = image.parentElement;
      while (current && current !== titleCell) {
        const value = textOf(current);
        const hasMarkedRatingImage = [...current.querySelectorAll('img')]
          .some(isOurbitsRatingImage);
        const hasRatingValue = ratingTextPattern.test(value) ||
          (ratingZeroPattern.test(value) && hasMarkedRatingImage);
        if (!hasOurbitsLongTitle(current) && hasRatingValue &&
            (isOurbitsRatingAuxiliaryImage(image) || hasMarkedRatingImage)) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
    ratingImages.forEach((image) => image.classList.add('gptui-rating-icon'));

    const ratingTextNodes = [...titleCell.querySelectorAll(
      'table, tbody, thead, tfoot, tr, td, th, div, span, a, b, strong, font'
    )].filter((element) => {
      if (isOurbitsRatingRailNode(element) || element.closest('.gptui-title-meta')) {
        return false;
      }
      const value = textOf(element);
      if (!value || value.length > 96) {
        return false;
      }
      if (ratingTextPattern.test(value)) {
        return true;
      }
      return ratingZeroPattern.test(value) &&
        Boolean(element.querySelector('img.gptui-rating-icon') ||
          [...element.querySelectorAll('img')].some(isOurbitsRatingImage));
    });

    const ratingElements = [...ratingImages, ...ratingTextNodes];
    if (ratingElements.length === 0) {
      return;
    }

    const roots = new Set();
    ratingElements.forEach((element) => {
      let current = element.nodeType === 1 ? element : element.parentElement;
      let root = null;
      while (current && current !== titleCell) {
        if (isOurbitsRatingContainer(current, titleCell, ratingTextPattern)) {
          root = current;
        }
        current = current.parentElement;
      }
      const normalizedRoot = normalizeOurbitsRatingRoot(root, titleCell);
      if (normalizedRoot) {
        roots.add(normalizedRoot);
      }
    });

    // Keep the largest safe rating wrapper. The smaller descendants are
    // score lines, not separate columns.
    [...roots].forEach((root) => {
      if ([...roots].some((other) => other !== root && other.contains(root))) {
        roots.delete(root);
      }
    });
    roots.forEach((root) => root.classList.add('gptui-rating-block'));

    titleCell.querySelectorAll('.gptui-rating-value').forEach((value) => {
      const owner = value.parentElement;
      owner?.closest('table')?.classList.add('gptui-rating-table');
      owner?.classList.add('gptui-rating-line');
    });

    [...new Set([
      ...ratingImages.map((image) => image.parentElement),
      ...ratingTextNodes
    ].filter(Boolean))].forEach((node) => {
      let current = node;
      while (current && current !== titleCell) {
        const value = textOf(current);
        if (value.length <= 96 &&
            (ratingTextPattern.test(value) || ratingZeroPattern.test(value))) {
          current.classList.add('gptui-rating-line');
          current.closest('table')?.classList.add('gptui-rating-table');
          removeOurbitsRatingBreaks(current);
          break;
        }
        current = current.parentElement;
      }
    });
  }

  function findOurbitsRatingUnit(element, titleCell) {
    let current = element?.nodeType === 1 ? element.parentElement : element?.parentElement;
    let unit = null;
    while (current && current !== titleCell) {
      if (!isOurbitsRatingRailNode(current) &&
          !hasOurbitsLongTitle(current) &&
          textOf(current).length <= 128) {
        unit = current;
      }
      current = current.parentElement;
    }
    return unit;
  }

  function createOurbitsRatingRail(titleCell) {
    let rail = [...titleCell.children]
      .find((child) => child.classList.contains('gptui-ourbits-rating-rail'));
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'gptui-ourbits-rating-rail';
      rail.setAttribute('aria-label', 'Torrent ratings');
      titleCell.appendChild(rail);
    }
    return rail;
  }

  function wrapOurbitsRatingUnit(root) {
    if (!root) {
      return null;
    }
    if (root.classList.contains('gptui-ourbits-rating-rail-item')) {
      return root;
    }

    const item = document.createElement('span');
    item.className = 'gptui-ourbits-rating-rail-item';
    const tagName = root.tagName?.toLowerCase() || '';
    const isTableSection = ['td', 'th', 'tr', 'tbody', 'thead', 'tfoot'].includes(tagName);
    if (!isTableSection) {
      item.appendChild(root);
      return item;
    }

    // A score can be the only cell of a small legacy table. Unwrap table
    // sections into a valid inline wrapper before moving them out of that
    // table; keeping a bare <td> in the rail makes WebKit apply table sizing.
    const appendContents = (source) => {
      [...source.childNodes].forEach((child) => {
        const childTag = child.nodeType === 1 ? child.tagName.toLowerCase() : '';
        if (['td', 'th', 'tr', 'tbody', 'thead', 'tfoot'].includes(childTag)) {
          appendContents(child);
        } else {
          item.appendChild(child);
        }
      });
    };
    appendContents(root);
    root.remove();
    return item;
  }

  function cleanupOurbitsRatingSource(sourceParent, titleCell) {
    let current = sourceParent;
    while (current && current !== titleCell &&
        !current.classList.contains('gptui-title-meta') &&
        !current.classList.contains('gptui-title-flow')) {
      const nextParent = current.parentElement;
      if (textOf(current) || current.querySelector('img, svg, canvas, input, button, a')) {
        break;
      }
      current.remove();
      current = nextParent;
    }
  }

  function markOurbitsRatingRail(titleCell) {
    if (!titleCell) {
      return;
    }

    const existingRail = titleCell.querySelector(':scope > .gptui-ourbits-rating-rail');
    const markedNodes = [
      ...titleCell.querySelectorAll('.gptui-rating-block, .gptui-rating-icon, .gptui-rating-value')
    ].filter((element) => !isOurbitsRatingRailNode(element));
    if (markedNodes.length === 0 && !existingRail) {
      return;
    }

    const roots = new Set();
    markedNodes.forEach((element) => {
      if (element.classList.contains('gptui-rating-block')) {
        roots.add(element);
        return;
      }
      const unit = findOurbitsRatingUnit(element, titleCell);
      if (unit && unit !== titleCell) {
        roots.add(unit);
      }
    });

    const rail = existingRail || createOurbitsRatingRail(titleCell);
    topLevelNodes([...roots]).forEach((root) => {
      if (!root || root === rail || rail.contains(root)) {
        return;
      }
      const sourceParent = root.parentElement;
      const item = wrapOurbitsRatingUnit(root);
      if (!item) {
        return;
      }
      rail.appendChild(item);
      cleanupOurbitsRatingSource(sourceParent, titleCell);
    });

    const children = [...rail.children];
    if (children.length === 0) {
      rail.remove();
      titleCell.removeAttribute('data-gptui-ourbits-rating-rail');
      titleCell.style.removeProperty('--gptui-ourbits-rating-space');
      return;
    }

    titleCell.setAttribute('data-gptui-ourbits-rating-rail', 'true');
    rail.setAttribute('data-gptui-rating-count', String(children.length));
    const measuredWidth = Math.ceil(rail.getBoundingClientRect().width || rail.scrollWidth || 0);
    const fallbackWidth = children.reduce((total, child) => (
      total + Math.max(24, textOf(child).length * 6 + 18)
    ), Math.max(0, children.length - 1) * 2);
    titleCell.style.setProperty(
      '--gptui-ourbits-rating-space',
      `${Math.max(measuredWidth, fallbackWidth, 72) + 8}px`
    );
  }

  function isSpringsundayRatingImage(image) {
    return Boolean(image && image.tagName?.toLowerCase() === 'img' &&
      /imdb|douban|豆瓣|评分|rating|score/i.test(ourbitsImageMarker(image)));
  }

  function springsundayControlMarker(element) {
    const control = element?.closest?.('a, button');
    return [
      ourbitsImageMarker(element),
      control?.getAttribute('href'),
      control?.getAttribute('title'),
      control?.getAttribute('aria-label'),
      control ? textOf(control) : ''
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function isSpringsundayControlImage(image) {
    if (!image || image.tagName?.toLowerCase() !== 'img' ||
        isSpringsundayRatingImage(image) || isOurbitsFreeImage(image)) {
      return false;
    }

    const marker = springsundayControlMarker(image);
    const alt = String(image.getAttribute('alt') || '').trim();
    const title = String(image.getAttribute('title') || '').trim();
    return isOurbitsAuditImage(image) ||
      /arrowdown|dt_download|download|下载|rss|feed|comments?|comment|评论|reply|讨论|favorite|favourite|bookmark|收藏|star|question|help|audit|review|approve|verify|check|claim|审核|未审|已审|认领/.test(marker) ||
      alt === '?' || title === '?';
  }

  function clearSpringsundayRatingMarkup(titleCell) {
    titleCell.querySelectorAll('.gptui-rating-value').forEach((element) => {
      if (element.closest('.gptui-torrent-control-rail')) {
        return;
      }
      element.replaceWith(document.createTextNode(element.textContent || ''));
    });
    titleCell.querySelectorAll(
      '.gptui-rating-block, .gptui-rating-icon, .gptui-rating-line, .gptui-rating-table'
    ).forEach((element) => {
      if (element.closest('.gptui-torrent-control-rail')) {
        return;
      }
      element.classList.remove(
        'gptui-rating-block',
        'gptui-rating-icon',
        'gptui-rating-line',
        'gptui-rating-table'
      );
    });
  }

  function isSpringsundayRatingContainer(element, titleCell, ratingTextPattern) {
    if (!element || element === titleCell || element.nodeType !== 1 ||
        element.closest('.gptui-title-meta') || hasOurbitsLongTitle(element)) {
      return false;
    }

    const tagName = element.tagName?.toLowerCase() || '';
    if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
      return false;
    }

    const value = textOf(element);
    return value.length > 0 && value.length <= 48 &&
      (ratingTextPattern.test(value) ||
        [...element.querySelectorAll('img')].some(isSpringsundayRatingImage));
  }

  function markSpringsundayRatingBlock(titleCell) {
    if (!titleCell) {
      return;
    }

    clearSpringsundayRatingMarkup(titleCell);
    const ratingValuePattern = /^(?:\d{1,2}\s*\.\s*\d{1,2}|N\s*\/?\s*A)$/i;
    const ratingTextPattern = /(?:^|[^A-Za-z0-9_-])(?:\d{1,2}\s*\.\s*\d{1,2}|N\s*\/?\s*A)(?=$|[^A-Za-z0-9_-])/i;
    const ratingValueNodes = [];
    const textWalker = document.createTreeWalker(titleCell, 4);
    let textNode;
    while ((textNode = textWalker.nextNode())) {
      if (textNode.parentElement?.closest('.gptui-title-meta, .gptui-torrent-control-rail')) {
        continue;
      }
      if (ratingValuePattern.test(String(textNode.nodeValue || '').trim())) {
        ratingValueNodes.push(textNode);
      }
    }

    ratingValueNodes.forEach((node) => {
      const value = document.createElement('span');
      value.className = 'gptui-rating-value';
      value.textContent = node.nodeValue || '';
      node.parentNode.replaceChild(value, node);
    });

    const ratingImages = [...titleCell.querySelectorAll('img')]
      .filter((image) => !image.closest('.gptui-torrent-control-rail'))
      .filter(isSpringsundayRatingImage);
    ratingImages.forEach((image) => image.classList.add('gptui-rating-icon'));

    const ratingElements = [
      ...ratingImages,
      ...[...titleCell.querySelectorAll('.gptui-rating-value')]
        .filter((element) => !element.closest('.gptui-torrent-control-rail'))
    ];
    if (ratingElements.length === 0) {
      return;
    }

    const roots = new Set();
    const lines = new Set();
    ratingElements.forEach((element) => {
      let current = element.nodeType === 1 ? element.parentElement : element.parentElement;
      let root = null;
      let line = null;
      while (current && current !== titleCell) {
        const value = textOf(current);
        if (!line && value.length > 0 && value.length <= 48 &&
            (ratingTextPattern.test(value) ||
              [...current.querySelectorAll('img')].some(isSpringsundayRatingImage))) {
          line = current;
        }
        if (!root && isSpringsundayRatingContainer(current, titleCell, ratingTextPattern)) {
          root = current;
          break;
        }
        current = current.parentElement;
      }
      if (root) {
        roots.add(root);
      }
      if (line) {
        lines.add(line);
        removeOurbitsRatingBreaks(line);
      }
    });

    roots.forEach((root) => root.classList.add('gptui-rating-block'));
    lines.forEach((line) => line.classList.add('gptui-rating-line'));
    titleCell.querySelectorAll('.gptui-rating-value').forEach((value) => {
      value.parentElement?.closest('table')?.classList.add('gptui-rating-table');
    });
  }

  function markSpringsundayControlGroup(titleCell) {
    if (!titleCell) {
      return;
    }

    titleCell.querySelectorAll('.gptui-springsunday-control-group').forEach((element) => {
      element.classList.remove('gptui-springsunday-control-group');
    });

    const controlAnchors = [...titleCell.querySelectorAll(
      'a.gptui-springsunday-control, button.gptui-springsunday-control'
    )];
    const controlImages = [...titleCell.querySelectorAll('img.gptui-springsunday-control-icon')]
      .filter((image) => !image.closest('a.gptui-springsunday-control, button.gptui-springsunday-control'));
    const controls = [...controlAnchors, ...controlImages];
    if (controls.length < 2) {
      return;
    }

    const groups = new Set();
    controls.forEach((control) => {
      let current = control.parentElement;
      while (current && current !== titleCell) {
        const nestedAnchors = current.querySelectorAll(
          'a.gptui-springsunday-control, button.gptui-springsunday-control'
        ).length;
        const nestedImages = [...current.querySelectorAll('img.gptui-springsunday-control-icon')]
          .filter((image) => !image.closest('a.gptui-springsunday-control, button.gptui-springsunday-control'))
          .length;
        const hasLongTitle = [...current.querySelectorAll('a, b, strong')]
          .some((element) => textOf(element).length >= 20);
        const value = textOf(current);
        if (nestedAnchors + nestedImages >= 2 && !hasLongTitle && value.length <= 64 &&
            !current.closest('.gptui-title-meta')) {
          groups.add(current);
          break;
        }
        current = current.parentElement;
      }
    });
    groups.forEach((group) => group.classList.add('gptui-springsunday-control-group'));
  }

  function markSpringsundayControls(titleCell) {
    if (!titleCell) {
      return;
    }

    titleCell.querySelectorAll(
      '.gptui-springsunday-control, .gptui-springsunday-control-icon, .gptui-springsunday-control-group'
    ).forEach((element) => {
      element.classList.remove(
        'gptui-springsunday-control',
        'gptui-springsunday-control-icon',
        'gptui-springsunday-control-group'
      );
    });

    titleCell.querySelectorAll('img').forEach((image) => {
      if (!isSpringsundayControlImage(image)) {
        return;
      }
      image.classList.add('gptui-springsunday-control-icon');
      image.closest('a, button')?.classList.add('gptui-springsunday-control');
    });

    titleCell.querySelectorAll('a, button').forEach((control) => {
      const marker = [
        control.getAttribute('href'),
        control.getAttribute('title'),
        control.getAttribute('aria-label'),
        textOf(control)
      ].filter(Boolean).join(' ').toLowerCase();
      if (/(?:download|下载|rss|feed|comment|评论|reply|讨论|favorite|favourite|bookmark|收藏|question|help|audit|review|approve|verify|check|claim|审核|未审|已审|认领)/.test(marker)) {
        control.classList.add('gptui-springsunday-control');
      }
    });
  }

  function markHdhomeDownloadControls(table) {
    if (!table) {
      return;
    }

    const downloadImageSelector = [
      'img.dt_download',
      'img[class*="dt_download"]',
      'img[src*="download"]',
      'img[id*="download"]',
      'img[alt*="下载"]',
      'img[title*="下载"]',
      'img[alt*="Download"]',
      'img[title*="Download"]'
    ].join(',');
    table.querySelectorAll(downloadImageSelector).forEach((image) => {
      image.classList.add('gptui-download-icon');
      image.closest('a, button')?.classList.add('gptui-download-control');
    });

    table.querySelectorAll('a[href], area[href], button, input[type="button"], input[type="submit"]')
      .forEach((control) => {
        const marker = [
          control.getAttribute('href'),
          control.getAttribute('title'),
          control.getAttribute('aria-label'),
          control.getAttribute('value'),
          textOf(control)
        ].filter(Boolean).join(' ');
        if (!/(?:download(?:\.php)?|下载)/i.test(marker)) {
          return;
        }

        control.classList.add('gptui-download-control');
        control.querySelectorAll('img').forEach((image) => {
          image.classList.add('gptui-download-icon');
        });
      });
  }

  function torrentControlMarker(element) {
    const owner = element?.closest?.('a, button, [role="button"], input[type="image"]');
    const ownClass = typeof element?.className === 'string' ? element.className : '';
    const ownerClass = typeof owner?.className === 'string' ? owner.className : '';
    return [
      element?.getAttribute?.('src'),
      element?.getAttribute?.('alt'),
      element?.getAttribute?.('title'),
      ownClass,
      element?.id,
      owner?.getAttribute?.('href'),
      owner?.getAttribute?.('title'),
      owner?.getAttribute?.('aria-label'),
      owner?.getAttribute?.('data-action'),
      owner?.getAttribute?.('data-command'),
      ownerClass,
      owner && textOf(owner).length <= 48 ? textOf(owner) : ''
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function torrentImageOwnMarker(image) {
    return [
      image?.getAttribute?.('src'),
      image?.getAttribute?.('alt'),
      image?.getAttribute?.('title'),
      typeof image?.className === 'string' ? image.className : '',
      image?.id
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function torrentImageOwnerMarker(image) {
    const owner = image?.closest?.('a, button, [role="button"], input[type="image"]');
    return [
      owner?.getAttribute?.('href'),
      owner?.getAttribute?.('title'),
      owner?.getAttribute?.('aria-label'),
      typeof owner?.className === 'string' ? owner.className : '',
      owner && textOf(owner).length <= 48 ? textOf(owner) : ''
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function torrentControlRole(marker) {
    const value = String(marker || '').toLowerCase();
    if (/(?:dt[_-]?download|arrowdown|download(?:\.php)?|下载)/.test(value)) {
      return 'download';
    }
    if (/(?:imdb|tmdb|douban|豆瓣|评分|rating|score)/.test(value)) {
      return 'rating';
    }
    if (/(?:favorite|favourite|bookmark|collect|collected|buddylist|fav(?:orite)?|star|收藏)/.test(value)) {
      return 'favorite';
    }
    if (/(?:rss|feed|comments?|comment|评论|reply|讨论|question|help|audit|review|approve|verify|check|claim|审核|未审|已审|认领)/.test(value)) {
      return 'status';
    }
    return '';
  }

  function torrentControlRootHasPoster(root, row, titleCell) {
    if (!root || !row || !titleCell) {
      return false;
    }

    const images = root.matches?.('img')
      ? [root]
      : [...root.querySelectorAll?.('img') || []];
    return images.some((image) => isTorrentPosterImage(image, row, titleCell));
  }

  function isTorrentPosterImage(image, row, titleCell) {
    if (!image || !row || !titleCell) {
      return false;
    }

    const sourceCell = image.closest('td, th');
    if (sourceCell?.classList.contains('gptui-type-cell') ||
        sourceCell?.classList.contains('gptui-poster-cell')) {
      return true;
    }

    const ownMarker = torrentImageOwnMarker(image);
    const ownerMarker = torrentImageOwnerMarker(image);
    const marker = `${ownMarker} ${ownerMarker}`;
    const roleMarker = /(?:download|arrowdown|rss|feed|comment|reply|question|help|audit|review|approve|verify|check|favorite|favourite|bookmark|collect|star|imdb|tmdb|douban|rating|score|审核|未审|已审)/i;
    const ownRoleMarker = roleMarker.test(ownMarker);

    const rect = image.getBoundingClientRect?.();
    const renderedWidth = Number(rect?.width) || 0;
    const renderedHeight = Number(rect?.height) || 0;
    const naturalWidth = Number(image.naturalWidth) || 0;
    const naturalHeight = Number(image.naturalHeight) || 0;
    const attributeWidth = Number.parseFloat(image.getAttribute?.('width')) || 0;
    const attributeHeight = Number.parseFloat(image.getAttribute?.('height')) || 0;
    const width = Math.max(renderedWidth, naturalWidth, attributeWidth);
    const height = Math.max(renderedHeight, naturalHeight, attributeHeight);
    const portraitShape = height >= 24 && width >= 12 && height / Math.max(width, 1) >= 1.15;
    const naturalPortrait = naturalHeight >= 32 && naturalWidth >= 12 &&
      naturalHeight / Math.max(naturalWidth, 1) >= 1.15;

    if (siteRule.layout === 'pterclub' && !ownRoleMarker &&
        (portraitShape || naturalPortrait)) {
      // PterClub sometimes wraps a poster in an IMDb/details link. The link's
      // URL is a control marker, but the portrait image itself is not an icon.
      return true;
    }

    if (siteRule.layout === 'pterclub' &&
        /(?:poster|cover|movie|film|backdrop|thumbnail|timg|海报|封面)/i.test(marker) &&
        !ownRoleMarker) {
      return true;
    }

    const isInTitle = titleCell.contains(image);
    if (!isInTitle || roleMarker.test(marker)) {
      return false;
    }

    return (renderedWidth >= 24 && renderedHeight >= 24) ||
      (naturalWidth >= 32 && naturalHeight >= 32);
  }

  function torrentControlAllowed(element, role, row, titleCell) {
    const cell = element?.closest?.('td, th');
    const owner = element?.closest?.('a, button, [role="button"], input[type="image"]');
    const marker = torrentControlMarker(element);
    const inTitle = Boolean(titleCell && (element === titleCell || titleCell.contains(element)));
    const inRating = Boolean(cell?.classList.contains('gptui-rating-cell'));
    const inMetricRail = TORRENT_CONTROL_METRIC_LAYOUTS.includes(siteRule.layout) &&
      Boolean(cell?.classList.contains('gptui-metric-cell'));
    const hasExplicitDownload = /(?:dt[_-]?download|download(?:\.php)?|下载)/.test(marker);
    const hasExplicitFavorite = /(?:favorite|favourite|bookmark|collect|collected|buddylist|fav(?:orite)?|收藏)/.test(marker);
    const hasOwner = Boolean(owner);

    if (inTitle || inRating || inMetricRail) {
      return true;
    }
    if (role === 'download') {
      return hasOwner || hasExplicitDownload;
    }
    if (role === 'favorite') {
      return hasOwner || hasExplicitFavorite;
    }
    return hasOwner && row.contains(owner);
  }

  function markTorrentControlElement(element, role) {
    if (!element || !role) {
      return;
    }

    const roleIconClass = `gptui-torrent-${role}-icon`;
    const roleControlClass = `gptui-torrent-${role}-control`;
    const isImage = element.tagName?.toLowerCase() === 'img';
    if (isImage) {
      element.classList.add('gptui-torrent-control-icon', roleIconClass);
    }

    const owner = isImage
      ? element.closest('a, button, [role="button"], input[type="image"]')
      : element.matches?.('a, button, [role="button"], input[type="image"]')
        ? element
        : element.closest?.('a, button, [role="button"], input[type="image"]');
    if (!owner) {
      return;
    }

    if (role === 'rating') {
      owner.classList.add('gptui-torrent-rating-control', roleControlClass);
    } else {
      owner.classList.add('gptui-torrent-control', roleControlClass);
    }
    owner.querySelectorAll('img').forEach((image) => {
      image.classList.add('gptui-torrent-control-icon', roleIconClass);
    });
  }

  function isTorrentControlNode(element) {
    return Boolean(element?.nodeType === 1 && (
      element.matches?.('.gptui-torrent-control, .gptui-torrent-rating-control, .gptui-torrent-control-icon') ||
      element.querySelector?.('.gptui-torrent-control, .gptui-torrent-rating-control, .gptui-torrent-control-icon')
    ));
  }

  function markTorrentControlGroups(row, titleCell) {
    const controlSelector = [
      '.gptui-torrent-control',
      '.gptui-torrent-rating-control',
      '.gptui-torrent-control-icon'
    ].join(',');
    const controls = [...row.querySelectorAll(controlSelector)]
      .filter((element) => !element.matches('img') ||
        !element.closest('.gptui-torrent-control, .gptui-torrent-rating-control'));
    if (controls.length < 2) {
      return;
    }

    const groups = new Set();
    controls.forEach((control) => {
      let current = control.parentElement;
      while (current && current !== titleCell) {
        if (current.classList.contains('gptui-torrent-control-rail')) {
          break;
        }
        const tagName = current.tagName?.toLowerCase() || '';
        if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
          current = current.parentElement;
          continue;
        }
        const nestedControls = controls.filter((candidate) => current.contains(candidate)).length;
        const value = textOf(current);
        const hasLongLink = [...current.querySelectorAll('a, b, strong')]
          .some((element) => textOf(element).length >= 20 &&
            !element.matches('.gptui-torrent-control, .gptui-torrent-rating-control'));
        if (nestedControls >= 2 && value.length <= 64 && !hasLongLink &&
            !current.closest('.gptui-title-meta')) {
          groups.add(current);
          break;
        }
        current = current.parentElement;
      }
    });

    [...groups].forEach((group) => {
      if ([...groups].some((other) => other !== group && other.contains(group))) {
        groups.delete(group);
      }
    });
    groups.forEach((group) => {
      group.classList.add('gptui-torrent-control-group');
      [...group.querySelectorAll('br')].forEach((breakNode) => {
        let previous = breakNode.previousSibling;
        let next = breakNode.nextSibling;
        while (previous && previous.nodeType === 3 && !/\S/.test(previous.nodeValue || '')) {
          previous = previous.previousSibling;
        }
        while (next && next.nodeType === 3 && !/\S/.test(next.nodeValue || '')) {
          next = next.nextSibling;
        }
        if (isTorrentControlNode(previous) && isTorrentControlNode(next)) {
          breakNode.classList.add('gptui-torrent-control-break');
        }
      });
    });
  }

  function torrentControlOwner(element) {
    if (!element) {
      return null;
    }
    if (element.matches?.('a, button, [role="button"], input[type="image"]')) {
      return element;
    }
    return element.closest?.('a, button, [role="button"], input[type="image"]') || null;
  }

  function torrentControlRailRoot(element) {
    if (!element) {
      return null;
    }

    const owner = torrentControlOwner(element);
    if (owner) {
      return owner;
    }
    if (element.matches?.('img, input[type="image"]')) {
      return element;
    }
    return null;
  }

  function torrentControlRailRootAllowed(root, row, titleCell) {
    const isRatingBlockRoot = Boolean(root?.classList?.contains('gptui-rating-block'));
    if (!root || !row.contains(root) || root === titleCell ||
        root.closest('.gptui-torrent-control-rail, .gptui-title-meta') ||
        (!isRatingBlockRoot && root.closest('.gptui-rating-block')) ||
        root.classList.contains('gptui-title-primary') ||
        root.querySelector('.gptui-title-primary') ||
        torrentControlRootHasPoster(root, row, titleCell)) {
      return false;
    }

    if (isRatingBlockRoot && hasOurbitsLongTitle(root)) {
      return false;
    }

    const sourceCell = root.closest('td, th');
    const isInTitle = titleCell.contains(root);
    const isInRating = Boolean(sourceCell?.classList.contains('gptui-rating-cell'));
    const isInMetricRail = TORRENT_CONTROL_METRIC_LAYOUTS.includes(siteRule.layout) &&
      Boolean(sourceCell?.classList.contains('gptui-metric-cell'));
    if (!isInTitle && !isInRating && !isInMetricRail) {
      return false;
    }

    const value = textOf(root);
    // Do not detach a title link merely because one of its child images has a
    // keyword-like filename. Real rating/action links contain short labels or
    // icons; a visible twenty-character link is the torrent title itself.
    if (root.matches('a') && value.length >= 20) {
      return false;
    }
    return true;
  }

  function isTorrentRatingValueNode(node) {
    const value = node?.nodeType === 3 ? node.nodeValue : textOf(node);
    if (!/^(?:\d{1,2}\s*\.\s*\d{1,2}|N\s*\/?\s*A)$/i.test(String(value || '').trim())) {
      return false;
    }
    return node?.nodeType === 3 || !node.querySelector?.('img, svg, a, button, input');
  }

  function adjacentTorrentRatingValue(root) {
    const findSibling = (direction) => {
      let sibling = root?.[direction];
      while (sibling && sibling.nodeType === 3 && !/\S/.test(sibling.nodeValue || '')) {
        sibling = sibling[direction];
      }
      if (!sibling || (sibling.nodeType === 1 && sibling.tagName.toLowerCase() === 'br') ||
          !isTorrentRatingValueNode(sibling)) {
        return null;
      }
      return sibling;
    };

    return findSibling('nextSibling') || findSibling('previousSibling');
  }

  function wrapTorrentRatingRoot(root) {
    if (!root || root.classList.contains('gptui-torrent-rating-rail-item') ||
        (!root.classList.contains('gptui-torrent-rating-control') &&
          !root.classList.contains('gptui-torrent-rating-icon'))) {
      return root;
    }
    if (textOf(root)) {
      return root;
    }

    const valueNode = adjacentTorrentRatingValue(root);
    const parent = root.parentNode;
    if (!valueNode || !parent || valueNode.parentNode !== parent ||
        valueNode.parentElement?.closest('.gptui-rating-block')) {
      return root;
    }

    const wrapper = document.createElement('span');
    wrapper.className = 'gptui-torrent-rating-rail-item';
    parent.insertBefore(wrapper, valueNode.nodeType === 3 || valueNode === root ? root : valueNode);
    let sibling = root.nextSibling;
    while (sibling && sibling.nodeType === 3 && !/\S/.test(sibling.nodeValue || '')) {
      sibling = sibling.nextSibling;
    }
    if (sibling === valueNode) {
      wrapper.appendChild(root);
      wrapper.appendChild(valueNode);
    } else {
      wrapper.appendChild(valueNode);
      wrapper.appendChild(root);
    }
    return wrapper;
  }

  function wrapTorrentRatingBlockRoot(root) {
    if (!root || root.classList.contains('gptui-torrent-rating-rail-item')) {
      return root;
    }
    const wrapper = document.createElement('span');
    wrapper.className = 'gptui-torrent-rating-rail-item';
    root.parentNode?.insertBefore(wrapper, root);
    wrapper.appendChild(root);
    return wrapper;
  }

  function ensureTorrentControlRail(titleCell) {
    let rail = [...titleCell.children]
      .find((child) => child.classList.contains('gptui-torrent-control-rail'));
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'gptui-torrent-control-rail';
      rail.setAttribute('aria-label', 'Torrent controls');
      titleCell.appendChild(rail);
    }
    return rail;
  }

  function cleanupTorrentControlSource(sourceParent, row, titleCell) {
    let parent = sourceParent;
    while (parent && parent !== row && parent !== titleCell &&
        !parent.classList.contains('gptui-title-meta')) {
      if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(parent.tagName?.toLowerCase())) {
        break;
      }

      const nextParent = parent.parentElement;
      const hasInteractive = parent.querySelector(
        'a, button, [role="button"], input, select, textarea, video, audio'
      );
      const hasVisual = parent.querySelector('img, svg, canvas, object, embed');
      if (textOf(parent) || hasInteractive || hasVisual) {
        break;
      }
      parent.remove();
      parent = nextParent;
    }
  }

  function updateTorrentControlRail(titleCell, rail) {
    const controls = siteRule.layout === 'springsunday'
      ? [...rail.querySelectorAll(':scope > .gptui-springsunday-primary-row > *, :scope > .gptui-springsunday-status-row > *')]
      : [...rail.children];
    if (controls.length === 0) {
      rail.remove();
      titleCell.removeAttribute('data-gptui-control-rail');
      titleCell.style.removeProperty('--gptui-control-rail-space');
      return;
    }

    titleCell.setAttribute('data-gptui-control-rail', 'true');
    if (siteRule.layout === 'springsunday') {
      rail.setAttribute('data-gptui-springsunday-rail', 'true');
    }
    rail.setAttribute('data-gptui-control-count', String(controls.length));
    const measuredWidth = Math.ceil(rail.scrollWidth || rail.getBoundingClientRect().width || 0);
    const fallbackWidth = controls.reduce((total, control) => {
      const isRating = control.classList.contains('gptui-torrent-rating-control') ||
        control.classList.contains('gptui-torrent-rating-rail-item');
      return total + (isRating ? Math.max(28, textOf(control).length * 7 + 16) : 20);
    }, Math.max(0, controls.length - 1) * 2);
    const minimumRailWidth = {
      springsunday: 152,
      hdarea: 152,
      btschool: 132,
      soulvoice: 132,
      azusa: 132,
      ultrahd: 132,
      'open-cd': 116,
      baozi: 116,
      dicmusic: 116
    }[siteRule.layout] || 0;
    const railWidth = Math.max(measuredWidth, fallbackWidth, minimumRailWidth);
    const reservedWidth = siteRule.layout === 'springsunday'
      ? Math.max(railWidth, 152)
      : railWidth;
    titleCell.style.setProperty('--gptui-control-rail-space', `${reservedWidth + 8}px`);
    if (siteRule.layout === 'springsunday') {
      titleCell.style.setProperty('--gptui-springsunday-rail-width', `${reservedWidth}px`);
      rail.style.setProperty('--gptui-springsunday-rail-width', `${reservedWidth}px`);
    }
  }

  function markTorrentControlRail(row, titleCell) {
    if (!row || !titleCell) {
      return;
    }

    const markedSelector = [
      '.gptui-torrent-control',
      '.gptui-torrent-rating-control',
      '.gptui-torrent-control-icon',
      '.gptui-download-control',
      '.gptui-download-icon',
      '.gptui-springsunday-control',
      '.gptui-springsunday-control-icon'
    ].join(',');
    const roots = new Set();
    row.querySelectorAll(markedSelector).forEach((element) => {
      // HDArea and BTSchool have a real comments metric column. Keep its
      // status icon and count in that cell so they line up with the header;
      // only ratings/download/favorite controls belong in the title rail.
      if (['hdarea', 'btschool'].includes(siteRule.layout) && (
        element.matches?.('.gptui-torrent-status-control, .gptui-torrent-status-icon') ||
        element.closest?.('.gptui-torrent-status-control')
      )) {
        return;
      }
      const root = torrentControlRailRoot(element);
      if (torrentControlRailRootAllowed(root, row, titleCell)) {
        roots.add(root);
      }
    });

    const rail = [...titleCell.children]
      .find((child) => child.classList.contains('gptui-torrent-control-rail'));
    if (roots.size === 0 && !rail) {
      return;
    }

    const targetRail = rail || ensureTorrentControlRail(titleCell);
    const orderedRoots = topLevelNodes([...roots]);
    orderedRoots.forEach((root) => {
      const railRoot = wrapTorrentRatingRoot(root);
      if (railRoot.parentElement === targetRail || targetRail.contains(railRoot)) {
        return;
      }
      const sourceParent = railRoot.parentElement;
      targetRail.appendChild(railRoot);
      cleanupTorrentControlSource(sourceParent, row, titleCell);
    });

    updateTorrentControlRail(titleCell, targetRail);
  }

  function isSpringsundayStatusRailItem(item) {
    if (!item) {
      return false;
    }
    const nodes = [item, ...item.querySelectorAll?.(
      '.gptui-torrent-control, .gptui-torrent-status-control, .gptui-springsunday-control, img'
    ) || []];
    return nodes.some((node) => {
      if (node.matches?.('.gptui-torrent-status-control, .gptui-torrent-status-icon')) {
        return true;
      }
      const marker = [
        torrentControlMarker(node),
        springsundayControlMarker(node),
        typeof node.className === 'string' ? node.className : ''
      ].filter(Boolean).join(' ').toLowerCase();
      return torrentControlRole(marker) === 'status' ||
        /(?:rss|feed|audit|review|approve|verify|check|claim|审核|未审|已审|认领)/.test(marker);
    });
  }

  function organizeSpringsundayControlRail(rail) {
    if (!rail) {
      return;
    }

    const items = [];
    [...rail.children].forEach((child) => {
      if (child.matches('.gptui-springsunday-primary-row, .gptui-springsunday-status-row')) {
        items.push(...child.children);
      } else {
        items.push(child);
      }
    });
    const primary = document.createElement('div');
    primary.className = 'gptui-springsunday-primary-row';
    const status = document.createElement('div');
    status.className = 'gptui-springsunday-status-row';
    items.forEach((item) => {
      (isSpringsundayStatusRailItem(item) ? status : primary).appendChild(item);
    });
    rail.replaceChildren();
    if (primary.children.length > 0) {
      rail.appendChild(primary);
    }
    if (status.children.length > 0) {
      rail.appendChild(status);
    }
    rail.setAttribute('data-gptui-springsunday-rail', 'true');
    primary.setAttribute('data-gptui-springsunday-row', 'primary');
    status.setAttribute('data-gptui-springsunday-row', 'status');
  }

  function markSpringsundayControlRail(row, titleCell) {
    if (!row || !titleCell) {
      return;
    }

    const markedSelector = [
      '.gptui-springsunday-control',
      '.gptui-springsunday-control-icon',
      '.gptui-torrent-control',
      '.gptui-torrent-rating-control',
      '.gptui-torrent-control-icon',
      '.gptui-rating-block'
    ].join(',');
    titleCell.querySelectorAll('img').forEach((image) => {
      if (!isSpringsundayControlImage(image)) {
        return;
      }
      image.classList.add('gptui-springsunday-control-icon');
      image.closest('a, button')?.classList.add('gptui-springsunday-control');
    });
    const roots = new Set();
    row.querySelectorAll(markedSelector).forEach((element) => {
      const root = element.classList.contains('gptui-rating-block')
        ? element
        : torrentControlRailRoot(element);
      if (torrentControlRailRootAllowed(root, row, titleCell)) {
        roots.add(root);
      }
    });

    const rail = [...titleCell.children]
      .find((child) => child.classList.contains('gptui-torrent-control-rail'));
    if (roots.size === 0 && !rail) {
      return;
    }

    const targetRail = rail || ensureTorrentControlRail(titleCell);
    topLevelNodes([...roots]).forEach((root) => {
      const railRoot = root.classList.contains('gptui-rating-block')
        ? wrapTorrentRatingBlockRoot(root)
        : root;
      if (!railRoot || railRoot.parentElement === targetRail || targetRail.contains(railRoot)) {
        return;
      }
      const sourceParent = railRoot.parentElement;
      targetRail.appendChild(railRoot);
      cleanupTorrentControlSource(sourceParent, row, titleCell);
    });
    organizeSpringsundayControlRail(targetRail);
    updateTorrentControlRail(titleCell, targetRail);
  }

  function markTorrentControlBreaks(row) {
    const actionSelector = [
      '.gptui-torrent-control',
      '.gptui-torrent-download-icon',
      '.gptui-torrent-favorite-icon',
      '.gptui-torrent-status-control',
      '.gptui-torrent-status-icon'
    ].join(',');
    row.querySelectorAll('br').forEach((breakNode) => {
      let previous = breakNode.previousSibling;
      let next = breakNode.nextSibling;
      while (previous && previous.nodeType === 3 && !/\S/.test(previous.nodeValue || '')) {
        previous = previous.previousSibling;
      }
      while (next && next.nodeType === 3 && !/\S/.test(next.nodeValue || '')) {
        next = next.nextSibling;
      }
      const hasAction = (node) => Boolean(node?.nodeType === 1 && (
        node.matches?.(actionSelector) || node.querySelector?.(actionSelector)
      ));
      if (hasAction(previous) && hasAction(next)) {
        breakNode.classList.add('gptui-torrent-control-break');
      }
    });
  }

  function markTorrentControls(row) {
    const titleCell = row.querySelector('.gptui-title-cell');
    if (!titleCell) {
      return;
    }

    // OurBits has a nested rating/title structure that is intentionally kept
    // in place by its site adapter. Generic control detection can mistake one
    // of those wrappers for a title action and reserve the whole title width.
    if (siteRule.layout === 'ourbits') {
      return;
    }

    const markedSelector = [
      '.gptui-torrent-control',
      '.gptui-torrent-control-icon',
      '.gptui-torrent-control-group',
      '.gptui-torrent-control-break',
      '.gptui-torrent-download-control',
      '.gptui-torrent-download-icon',
      '.gptui-torrent-rating-control',
      '.gptui-torrent-rating-icon',
      '.gptui-torrent-favorite-control',
      '.gptui-torrent-favorite-icon',
      '.gptui-torrent-status-control',
      '.gptui-torrent-status-icon'
    ].join(',');
    const markedClasses = [
      'gptui-torrent-control',
      'gptui-torrent-control-icon',
      'gptui-torrent-control-group',
      'gptui-torrent-control-break',
      'gptui-torrent-download-control',
      'gptui-torrent-download-icon',
      'gptui-torrent-rating-control',
      'gptui-torrent-rating-icon',
      'gptui-torrent-favorite-control',
      'gptui-torrent-favorite-icon',
      'gptui-torrent-status-control',
      'gptui-torrent-status-icon'
    ];
    row.querySelectorAll(markedSelector).forEach((element) => {
      markedClasses.forEach((className) => element.classList.remove(className));
    });

    row.querySelectorAll('img').forEach((image) => {
      const marker = torrentControlMarker(image);
      const role = torrentControlRole(marker);
      if (!role || /(?:pro[_-]?)?free|freeleech|pctdown|twoupfree/.test(marker)) {
        return;
      }
      if (isTorrentPosterImage(image, row, titleCell)) {
        return;
      }
      if (!torrentControlAllowed(image, role, row, titleCell)) {
        return;
      }
      markTorrentControlElement(image, role);
    });

    row.querySelectorAll('a, button, [role="button"], input[type="image"]').forEach((control) => {
      const marker = torrentControlMarker(control);
      const role = torrentControlRole(marker);
      if (!role || /(?:pro[_-]?)?free|freeleech|pctdown|twoupfree/.test(marker)) {
        return;
      }
      if (torrentControlRootHasPoster(control, row, titleCell)) {
        return;
      }
      if (!torrentControlAllowed(control, role, row, titleCell)) {
        return;
      }
      markTorrentControlElement(control, role);
    });

    markTorrentControlGroups(row, titleCell);
    markTorrentControlBreaks(row);
    if (siteRule.layout === 'springsunday') {
      markSpringsundayControlRail(row, titleCell);
    } else if (TORRENT_CONTROL_RAIL_LAYOUTS.includes(siteRule.layout)) {
      markTorrentControlRail(row, titleCell);
    }
  }

  function markCells(table, columnIndexes, expectedColumnCount, headerRow) {
    const rows = [...table.rows];
    rows.forEach((row) => {
      const cells = [...row.cells];
      const isHeaderRow = row === headerRow;
      row.classList.toggle('gptui-torrent-header-row', isHeaderRow);
      cells.forEach((cell) => {
        cell.classList.toggle('gptui-torrent-header-cell', isHeaderRow);
      });
      if (cells.length < 2) {
        return;
      }

      const irregularRow = !isHeaderRow && expectedColumnCount > 0 &&
        (rowColumnSpan(row) !== expectedColumnCount || cells.some((cell) => cell.colSpan > 1));
      if (irregularRow) {
        row.classList.add('gptui-unstructured-row');
      } else {
        row.classList.remove('gptui-unstructured-row');
      }

      row.classList.add('gptui-torrent-row');
      cells.forEach((cell) => {
        cell.classList.remove(
          'gptui-title-cell',
          'gptui-type-cell',
          'gptui-poster-cell',
          'gptui-artwork-cell',
          'gptui-free-cell',
          'gptui-free-moved-cell',
          'gptui-rating-cell',
          'gptui-comments-cell',
          'gptui-publisher-cell',
          'gptui-metric-cell'
        );
        cell.style.removeProperty('--gptui-pterclub-title-offset');
      });
      const resolvedIndexes = Object.fromEntries(
        Object.entries(columnIndexes).map(([name, index]) => [
          name,
          irregularRow && index >= 0 ? cellIndexAtColumn(row, index) : index
        ])
      );
      if (irregularRow && columnIndexes.title >= 0) {
        resolvedIndexes.title = findTitleCellIndex(row, columnIndexes.title);
      }

      const rolePriority = ['title', 'type', 'poster', 'rating', 'comments', 'free', 'artwork', 'publisher'];
      const roleByCell = new Map();
      Object.entries(resolvedIndexes).forEach(([name, index]) => {
        const cell = cells[index];
        if (!cell || !rolePriority.includes(name)) {
          return;
        }
        const previous = roleByCell.get(index);
        if (!previous || rolePriority.indexOf(name) < rolePriority.indexOf(previous)) {
          roleByCell.set(index, name);
        }
      });

      if (['pterclub', 'et8'].includes(siteRule.layout) && columnIndexes.title >= 0) {
        logicalCells(row).forEach(({ cell, index, logicalIndex }) => {
          if (logicalIndex >= columnIndexes.title || roleByCell.has(index) || !cell.querySelector('img')) {
            return;
          }
          roleByCell.set(index, 'artwork');
        });
      }

      roleByCell.forEach((name, index) => {
        cells[index]?.classList.add(`gptui-${name}-cell`);
      });
      const namedIndexes = new Set(roleByCell.keys());
      cells.forEach((cell, index) => {
        if (!namedIndexes.has(index)) {
          cell.classList.add('gptui-metric-cell');
        }
      });

      markTorrentGridRow(table, row, cells, columnIndexes, resolvedIndexes, roleByCell,
        expectedColumnCount, irregularRow);

      if (!isHeaderRow) {
        const titleCell = row.querySelector('.gptui-title-cell');
        if (siteRule.layout === 'ourbits') {
          markOurbitsRatingBlock(titleCell);
        }
        if (siteRule.layout === 'springsunday') {
          markSpringsundayRatingBlock(titleCell);
          markSpringsundayControls(titleCell);
        }
        // OurBits uses legacy nested tables for both the title and scores.
        // Keep those nodes in their original table context; converting them to
        // a new flow wrapper makes WebKit calculate a one-character column.
        if (siteRule.layout !== 'ourbits') {
          normalizeTitleCell(titleCell);
        }
        if (siteRule.layout === 'ourbits') {
          markOurbitsPrimaryTitle(titleCell);
        }
        if (siteRule.layout === 'springsunday') {
          markSpringsundayPrimaryTitle(titleCell);
        }
        if (TITLE_WRAP_LAYOUTS.includes(siteRule.layout)) {
          markCurrentTorrentPrimaryTitle(titleCell);
        }
        markFreeTime(row);
        if (siteRule.layout === 'pterclub') {
          markPterclubTags(row);
        }
        if (TORRENT_CONTROL_LAYOUTS.includes(siteRule.layout)) {
          markTorrentControls(row);
        }
        if (siteRule.layout === 'pterclub') {
          markPterclubTitleOffset(titleCell);
        }
      }
    });
  }

  function resolveTypeColumnIndex(labels, layout) {
    const detectedIndex = findColumnIndex(labels, /类型|分类|种类|类别|type|category|cat/i, -1);
    if (detectedIndex >= 0) {
      return detectedIndex;
    }
    return Number.isInteger(TYPE_COLUMN_FALLBACKS[layout])
      ? TYPE_COLUMN_FALLBACKS[layout]
      : -1;
  }

  function markTypeColumn(table) {
    if (!table) {
      return;
    }

    const header = findHeaderRow(table);
    const labels = [...(header?.cells || [])].map(columnLabel);
    const typeIndex = resolveTypeColumnIndex(labels, siteRule.layout);
    const titleIndex = Number.parseInt(table.getAttribute('data-gptui-title-column') || '', 10) - 1;
    const hasExplicitTypeHeader = findColumnIndex(
      labels,
      /类型|分类|种类|类别|type|category|cat/i,
      -1
    ) >= 0;
    if (typeIndex < 0 || (!hasExplicitTypeHeader && typeIndex === titleIndex)) {
      return;
    }

    table.setAttribute('data-gptui-torrent-table', 'true');
    [...table.rows].forEach((row) => {
      [...row.cells].forEach((cell) => cell.classList.remove('gptui-type-cell'));
      const cellIndex = cellIndexAtColumn(row, typeIndex);
      if (cellIndex >= 0) {
        row.cells[cellIndex]?.classList.add('gptui-type-cell');
      }
    });
    table.setAttribute('data-gptui-type-column', String(typeIndex + 1));
  }

  function resetGenericTorrentTable(table) {
    if (!table || (siteRule.layout && !NATIVE_TORRENT_LAYOUTS.includes(siteRule.layout))) {
      return;
    }

    table.querySelectorAll(':scope > colgroup[data-gptui-column-widths="true"]').forEach((group) => {
      group.remove();
    });

    const generatedAttributes = new Set([
      'data-gptui-torrent-table',
      'data-gptui-type-column',
      'data-gptui-columns',
      'data-gptui-layout',
      'data-gptui-flow-table',
      'data-gptui-title-column',
      'data-gptui-rating-column',
      'data-gptui-comments-column',
      'data-gptui-free-column',
      'data-gptui-comments-normalized',
      'data-gptui-comments-normalized-count',
      'data-gptui-title-layout',
      'data-gptui-title-flow',
      'data-gptui-control-rail',
      'data-gptui-springsunday-rail',
      'data-gptui-control-count',
      'data-gptui-ourbits-rating-rail'
    ]);

    [table, ...table.querySelectorAll('*')].forEach((element) => {
      [...element.attributes].forEach((attribute) => {
        if (generatedAttributes.has(attribute.name) || attribute.name.startsWith('data-gptui-')) {
          element.removeAttribute(attribute.name);
        }
      });
      element.classList?.forEach((className) => {
        if (className.startsWith('gptui-')) {
          element.classList.remove(className);
        }
      });
      [...element.style].forEach((property) => {
        if (property.startsWith('--gptui-')) {
          element.style.removeProperty(property);
        }
      });
    });

    [...table.rows].forEach((row) => {
      row.removeAttribute('data-gptui-grid-row');
      row.removeAttribute('data-gptui-grid-columns');
      row.classList.remove(
        'gptui-torrent-row',
        'gptui-torrent-header-row',
        'gptui-unstructured-row'
      );
      [...row.cells].forEach((cell) => {
        cell.style.removeProperty('--gptui-grid-column');
        cell.style.removeProperty('--gptui-grid-span');
        cell.classList.remove(
          'gptui-title-cell',
          'gptui-poster-cell',
          'gptui-artwork-cell',
          'gptui-free-cell',
          'gptui-free-moved-cell',
          'gptui-rating-cell',
          'gptui-comments-cell',
          'gptui-publisher-cell',
          'gptui-metric-cell',
          'gptui-type-cell',
          'gptui-torrent-header-cell'
        );
      });
    });
  }

  function clearGenericTorrentArtifacts() {
    if (!GENERIC_NEXUSPHP_SITE_IDS.includes(siteId)) {
      return;
    }

    document.querySelectorAll(
      'table[data-gptui-torrent-table], table[data-gptui-layout], table[data-gptui-columns], table[data-gptui-type-column]'
    ).forEach(resetGenericTorrentTable);
  }

  function markTorrentTable(table) {
    const header = findHeaderRow(table);
    const labels = [...(header?.cells || [])].map(columnLabel);
    const rowCounts = [...table.rows]
      .filter((row) => row.cells.length >= 2)
      .map(rowColumnSpan);
    const count = Math.max(
      rowColumnSpan(header),
      ...rowCounts,
      header?.cells?.length || 0,
      table.rows[0]?.cells?.length || 0
    );
    const isHdarea = siteRule.layout === 'hdarea';
    const isSoulvoice = siteRule.layout === 'soulvoice';
    const shouldInferTitle = [
      'pterclub',
      'et8',
      'soulvoice',
      'baozi',
      'discfan',
      'dicmusic'
    ].includes(siteRule.layout);
    const detectedTitleIndex = findColumnIndex(labels, /标题|名称|title|name|torrent/i, -1);
    const inferredTitleIndex = shouldInferTitle
      ? inferTitleColumnIndex(table, header, count, isSoulvoice || siteRule.layout === 'dicmusic' ? 1 : (count > 2 ? 1 : 0))
      : -1;
    const titleIndex = isHdarea
      ? 2
      : (shouldInferTitle
        ? inferredTitleIndex
        : (detectedTitleIndex >= 0 ? detectedTitleIndex : (count > 2 ? 1 : 0)));
    const detectedTypeIndex = findColumnIndex(labels, /类型|分类|种类|类别|type|category|cat/i, -1);
    const resolvedTypeIndex = isHdarea ? 0 : resolveTypeColumnIndex(labels, siteRule.layout);
    const typeIndex = resolvedTypeIndex === titleIndex && detectedTypeIndex < 0
      ? -1
      : resolvedTypeIndex;
    const detectedPosterIndex = findColumnIndex(labels, /海报|封面|poster|cover/i, -1);
    const posterIndex = isHdarea
      ? 1
      : (detectedPosterIndex >= 0
        ? detectedPosterIndex
        : (['soulvoice', 'dicmusic', 'discfan'].includes(siteRule.layout)
          ? inferPosterColumnIndex(table, header, count, titleIndex, typeIndex)
          : (['pterclub', 'et8'].includes(siteRule.layout)
          ? inferPosterColumnIndex(table, header, count, titleIndex, typeIndex)
          : -1)));
    const detectedRatingIndex = findColumnIndex(labels, /评分|rating|vote|imdb|豆瓣|douban/i, -1);
    // OurBits keeps its stacked IMDb/Douban block inside the title cell.
    const ratingIndex = siteRule.layout === 'ourbits'
      ? -1
      : (detectedRatingIndex >= 0
      ? detectedRatingIndex
      : -1);
    const detectedCommentsIndex = findColumnIndex(labels, /评论|回复|讨论|comments?|comment/i, -1);
    // Most of these sites use an icon-only comments header immediately after
    // the title. Use the detected label when available, otherwise keep the
    // count in that stable column instead of treating it as an anonymous
    // metric that can drift under the title control rail.
    const commentColumnLayouts = new Set(['ourbits', ...TORRENT_CONTROL_METRIC_LAYOUTS]);
    const fallbackCommentsIndex = titleIndex + 1 < count ? titleIndex + 1 : -1;
    const commentsIndex = commentColumnLayouts.has(siteRule.layout)
      ? (detectedCommentsIndex >= fallbackCommentsIndex && detectedCommentsIndex < count
        ? detectedCommentsIndex
        : fallbackCommentsIndex)
      : -1;
    const freeIndexCandidate = findColumnIndex(labels, /优惠|免费|free|剩余/i, -1);
    const freeIndex = freeIndexCandidate === titleIndex ? -1 : freeIndexCandidate;

    if (['hdarea', 'btschool'].includes(siteRule.layout)) {
      normalizeCommentColumnRows(table, titleIndex, commentsIndex, count);
    }

    table.setAttribute('data-gptui-torrent-table', 'true');
    table.setAttribute('data-gptui-columns', String(count));
    table.setAttribute('data-gptui-title-column', String(titleIndex + 1));
    table.setAttribute('data-gptui-layout', siteRule.layout || 'nexusphp');

    const dataRows = [...table.rows]
      .filter((row) => row !== header)
      .filter((row) => row.cells.length >= 3);
    const irregularRows = dataRows.filter((row) => (
      rowColumnSpan(row) !== count || [...row.cells].some((cell) => cell.colSpan > 1)
    ));
    const hasMostlyIrregularRows = irregularRows.length > Math.max(2, dataRows.length / 2);
    if (hasMostlyIrregularRows) {
      table.setAttribute('data-gptui-flow-table', 'true');
    } else {
      table.removeAttribute('data-gptui-flow-table');
    }
    if (ratingIndex >= 0) {
      table.setAttribute('data-gptui-rating-column', String(ratingIndex + 1));
    } else {
      table.removeAttribute('data-gptui-rating-column');
    }
    if (commentsIndex >= 0 && commentsIndex < count) {
      table.setAttribute('data-gptui-comments-column', String(commentsIndex + 1));
    } else {
      table.removeAttribute('data-gptui-comments-column');
    }
    if (freeIndex >= 0) {
      table.setAttribute('data-gptui-free-column', String(freeIndex + 1));
    }

    ensureTorrentColumnGroup(table, siteRule.layout, count, {
      title: titleIndex,
      type: typeIndex,
      poster: posterIndex,
      rating: ratingIndex,
      comments: commentsIndex,
      free: freeIndex,
      publisher: count - 1
    });

    if (siteRule.layout === 'hdhome') {
      markHdhomeDownloadControls(table);
    }

    markCells(table, {
      title: titleIndex,
      type: typeIndex,
      poster: posterIndex,
      rating: ratingIndex,
      comments: commentsIndex,
      free: freeIndex,
      publisher: count - 1
    }, count, header);
  }

  function hasFreeTimeText(value) {
    if (!FREE_TIME_HINT.test(value)) {
      return false;
    }

    FREE_TIME_DETECT_PATTERN.lastIndex = 0;
    return (String(value).match(FREE_TIME_DETECT_PATTERN) || []).some((match) => /\d/.test(match));
  }

  function trimFreeTimePunctuation(value) {
    return String(value || '')
      .replace(/^[\s\[\](){}【】「」『』:：]+|[\s\[\](){}【】「」『』:：]+$/g, '')
      .trim();
  }

  function isFreeTimeLabelText(value) {
    return FREE_TIME_LABEL_PATTERN.test(trimFreeTimePunctuation(value));
  }

  function isFreeTimeValueText(value) {
    return FREE_TIME_VALUE_PATTERN.test(trimFreeTimePunctuation(value));
  }

  function isMeaningfulTitleNode(node) {
    if (node.nodeType === 3) {
      return /\S/.test(node.nodeValue || '');
    }
    if (node.nodeType !== 1 || node.classList.contains('gptui-title-meta')) {
      return false;
    }
    return Boolean(textOf(node) || node.querySelector('img, svg, video, input, button'));
  }

  function markLegacyTitleTables(titleCell) {
    if (!titleCell || !LEGACY_TITLE_TABLE_LAYOUTS.includes(siteRule.layout)) {
      return;
    }

    titleCell.querySelectorAll('table').forEach((table) => {
      if (table.matches('.gptui-rating-block, .gptui-rating-table') ||
          table.closest('.gptui-rating-block, .gptui-rating-table')) {
        return;
      }

      const hasMarkedTitle = Boolean(table.querySelector('.gptui-title-primary, .gptui-title-line'));
      const hasTitleLink = [...table.querySelectorAll('a, b, strong')]
        .some((element) => !element.querySelector('img') && textOf(element).length >= 6);
      if (hasMarkedTitle || hasTitleLink) {
        table.classList.add('gptui-title-wrapper-table');
      }
    });
  }

  function findTitleBreakContainer(titleCell) {
    if (!titleCell) {
      return null;
    }
    const hasDirectBreak = [...titleCell.childNodes].some((node) => node.nodeType === 1 && node.tagName.toLowerCase() === 'br');
    if (hasDirectBreak) {
      return titleCell;
    }

    return [...titleCell.querySelectorAll('*')]
      .filter((element) => !element.closest('.gptui-title-meta'))
      .filter((element) => [...element.childNodes].some((node) => node.nodeType === 1 && node.tagName.toLowerCase() === 'br'))
      .sort((left, right) => textOf(right).length - textOf(left).length)[0] || null;
  }

  function isTitleBadgeLine(line) {
    const value = textOf(line);
    if (!value || value.length > 96 || line.querySelector('.gptui-free-time')) {
      return false;
    }

    const links = [...line.querySelectorAll('a')].filter((element) => textOf(element).length > 20);
    if (links.length > 0) {
      return false;
    }

    const visualPieces = [...line.querySelectorAll('img, span, b, strong, em, label, font, i')];
    if (visualPieces.length < 2) {
      return false;
    }
    return visualPieces.every((element) => element.tagName.toLowerCase() === 'img' || textOf(element).length <= 20);
  }

  function reorderTitleLines(lines) {
    if (lines.length < 3) {
      return lines;
    }

    const primaryIndex = lines.findIndex((line) => {
      const titleLinks = [...line.querySelectorAll('a')].some((element) => textOf(element).length >= 8);
      const emphasized = [...line.querySelectorAll('b, strong')].some((element) => textOf(element).length >= 8);
      return !isTitleBadgeLine(line) && (titleLinks || emphasized);
    });
    const resolvedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;
    const subtitleIndex = lines.findIndex((line, index) => (
      index > resolvedPrimaryIndex &&
      !isTitleBadgeLine(line) &&
      !line.querySelector('.gptui-free-time') &&
      textOf(line).length >= 10
    ));
    if (subtitleIndex < 0 || subtitleIndex === resolvedPrimaryIndex + 1) {
      return lines;
    }

    return [
      lines[resolvedPrimaryIndex],
      lines[subtitleIndex],
      ...lines.filter((_, index) => index !== resolvedPrimaryIndex && index !== subtitleIndex)
    ];
  }

  function normalizeTitleCell(titleCell) {
    if (!titleCell) {
      return;
    }

    markLegacyTitleTables(titleCell);
    if (titleCell.getAttribute('data-gptui-title-layout') === 'true') {
      return;
    }

    const container = findTitleBreakContainer(titleCell);
    if (!container) {
      titleCell.setAttribute('data-gptui-title-layout', 'true');
      return;
    }

    const groups = [];
    let currentGroup = [];
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'br') {
        if (currentGroup.some(isMeaningfulTitleNode)) {
          groups.push(currentGroup);
        }
        currentGroup = [];
      } else {
        currentGroup.push(node);
      }
    });
    if (currentGroup.some(isMeaningfulTitleNode)) {
      groups.push(currentGroup);
    }

    if (groups.length < 2) {
      titleCell.setAttribute('data-gptui-title-layout', 'true');
      return;
    }

    const lines = groups.map((nodes, index) => {
      const line = document.createElement('span');
      line.className = 'gptui-title-line';
      line.setAttribute('data-gptui-title-line', String(index + 1));
      nodes.forEach((node) => line.appendChild(node));
      return line;
    });
    [...container.childNodes]
      .filter((node) => node.nodeType === 1 && node.tagName.toLowerCase() === 'br')
      .forEach((node) => node.remove());
    // ET8 and UltraHD contain legacy rows whose badge/details lines can look
    // like a second title link. Preserve the source order there; the explicit
    // primary break still separates the main and subtitle links below.
    const orderedLines = ['et8', 'ultrahd'].includes(siteRule.layout)
      ? lines
      : reorderTitleLines(lines);
    orderedLines.forEach((line) => container.appendChild(line));
    titleCell.setAttribute('data-gptui-title-layout', 'true');
  }

  function isOurbitsRatingNode(node) {
    if (node?.nodeType !== 1) {
      return false;
    }
    return node.classList.contains('gptui-rating-block') ||
      Boolean(node.querySelector('.gptui-rating-block, .gptui-rating-icon'));
  }

  function markOurbitsPrimaryTitle(flow) {
    if (!flow) {
      return;
    }

    flow.querySelectorAll('.gptui-title-primary').forEach((element) => {
      element.classList.remove('gptui-title-primary');
    });
    const candidates = [...flow.querySelectorAll('a, b, strong')]
      .filter((element) => !element.closest('.gptui-rating-block, .gptui-title-meta'));
    const primary = candidates
      .filter((element) => ['b', 'strong'].includes(element.tagName.toLowerCase()))
      .find((element) => textOf(element).length >= 8) ||
      candidates.find((element) => textOf(element).length >= 8);
    primary?.classList.add('gptui-title-primary');
    ensureTitlePrimaryBreak(primary, flow);
  }

  function markSpringsundayPrimaryTitle(titleCell) {
    if (!titleCell) {
      return;
    }

    const flow = titleCell.querySelector('.gptui-title-flow') || titleCell;
    flow.querySelectorAll('.gptui-title-primary').forEach((element) => {
      element.classList.remove('gptui-title-primary');
    });
    const candidates = [...flow.querySelectorAll('a, b, strong')]
      .filter((element) => !element.closest('.gptui-title-meta, .gptui-rating-block'));
    const primary = candidates
      .filter((element) => ['b', 'strong'].includes(element.tagName.toLowerCase()))
      .find((element) => textOf(element).length >= 6) ||
      candidates.find((element) => textOf(element).length >= 8);
    primary?.classList.add('gptui-title-primary');
    ensureTitlePrimaryBreak(primary, flow);
    if (primary) {
      mergeSpringsundayIconLine(titleCell, primary);
      ensureTitlePrimaryBreak(primary, flow);
    }
  }

  function markCurrentTorrentPrimaryTitle(titleCell) {
    if (!titleCell || !TITLE_WRAP_LAYOUTS.includes(siteRule.layout)) {
      return;
    }

    const flow = titleCell.querySelector('.gptui-title-flow') || titleCell;
    flow.querySelectorAll('.gptui-title-primary').forEach((element) => {
      element.classList.remove('gptui-title-primary');
    });
    const candidates = [...flow.querySelectorAll('a, b, strong')]
      .filter((element) => !element.closest(
        '.gptui-title-meta, .gptui-torrent-control-rail, .gptui-rating-block'
      ))
      .filter((element) => !element.querySelector('img'))
      .filter((element) => textOf(element).length >= 6);
    const primary = candidates
      .filter((element) => ['b', 'strong'].includes(element.tagName.toLowerCase()))
      .find((element) => textOf(element).length >= 8) ||
      candidates.find((element) => textOf(element).length >= 12) ||
      candidates[0];
    primary?.classList.add('gptui-title-primary');
    ensureTitlePrimaryBreak(primary, flow);
  }

  function isSpringsundayIconOnlyLine(line) {
    if (!line || line.querySelector('.gptui-title-meta, .gptui-rating-block')) {
      return false;
    }

    const images = [...line.querySelectorAll('img')];
    if (images.length === 0 || images.length > 2 || textOf(line).length > 2) {
      return false;
    }

    const marker = images.map((image) => [
      image.getAttribute('src'),
      image.getAttribute('alt'),
      image.getAttribute('title'),
      image.getAttribute('class'),
      image.id
    ].filter(Boolean).join(' ')).join(' ');
    return !images.some(isSpringsundayControlImage) &&
      !/(?:download|rss|feed|star|favorite|comment|imdb|douban|free|pctdown|leech|question|help|audit|review|approve|verify|check|审核|未审|已审|\?)/i.test(marker);
  }

  function mergeSpringsundayIconLine(titleCell, primary) {
    const primaryLine = primary.closest('.gptui-title-line');
    if (!primaryLine) {
      return;
    }

    titleCell.querySelectorAll('.gptui-title-line').forEach((line) => {
      if (line === primaryLine || !isSpringsundayIconOnlyLine(line)) {
        return;
      }

      const nodes = [...line.childNodes]
        .filter(isMeaningfulTitleNode)
        .reverse();
      nodes.forEach((node) => primaryLine.insertBefore(node, primaryLine.firstChild));
      line.remove();
    });
  }

  function normalizeOurbitsTitleFlow(titleCell) {
    if (!titleCell) {
      return;
    }

    let flow = [...titleCell.children]
      .find((child) => child.classList.contains('gptui-title-flow'));

    // A rating table can be nested inside the original title wrapper. Promote
    // the safe rating root before collecting title nodes so the title flow can
    // never contain a score block and a long subtitle in the same inline box.
    titleCell.querySelectorAll('.gptui-rating-block').forEach((element) => {
      if (isOurbitsRatingRailNode(element)) {
        return;
      }
      if (element === flow || hasOurbitsLongTitle(element)) {
        element.classList.remove('gptui-rating-block');
      }
    });
    const ratingRoots = [...titleCell.querySelectorAll('.gptui-rating-block')]
      .filter((element) => !isOurbitsRatingRailNode(element))
      .filter((element) => !element.closest('.gptui-title-meta'))
      .filter((element) => ![...titleCell.querySelectorAll('.gptui-rating-block')]
        .some((other) => other !== element && other.contains(element)));
    ratingRoots.forEach((root) => {
      if (root.parentElement === titleCell || root === flow) {
        return;
      }
      const tagName = root.tagName?.toLowerCase() || '';
      if (['td', 'th', 'tr', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
        return;
      }
      const meta = titleCell.querySelector(':scope > .gptui-title-meta');
      titleCell.insertBefore(root, meta || null);
    });

    const directNodes = [...titleCell.childNodes];
    const movableNodes = directNodes.filter((node) => {
      if (node === flow || node.nodeType === 8) {
        return false;
      }
      if (node.nodeType === 3) {
        return /\S/.test(node.nodeValue || '');
      }
      if (node.nodeType !== 1 || node.classList.contains('gptui-title-meta')) {
        return false;
      }
      return !isOurbitsRatingNode(node);
    });

    if (!flow && movableNodes.length > 0) {
      flow = document.createElement('div');
      flow.className = 'gptui-title-flow';
      const firstRatingNode = directNodes.find((node) => isOurbitsRatingNode(node));
      titleCell.insertBefore(flow, firstRatingNode || movableNodes[0]);
    }
    if (!flow) {
      return;
    }

    movableNodes.forEach((node) => {
      if (node.parentNode !== flow) {
        flow.appendChild(node);
      }
    });
    markOurbitsPrimaryTitle(flow);
    titleCell.setAttribute('data-gptui-title-flow', 'true');
    titleCell.toggleAttribute('data-gptui-title-has-rating', Boolean(
      titleCell.querySelector('.gptui-rating-block, .gptui-rating-icon')
    ));
  }

  function isFreeBadgeElement(element) {
    const tagName = element?.tagName?.toLowerCase() || '';
    if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(tagName)) {
      return false;
    }
    if (element?.classList?.contains('gptui-free-time')) {
      return false;
    }

    const className = typeof element?.className === 'string' ? element.className : '';
    const marker = `${className} ${element?.id || ''} ${element?.getAttribute?.('title') || ''} ${element?.getAttribute?.('alt') || ''} ${element?.getAttribute?.('src') || ''}`;
    const value = textOf(element);
    const freeMarker = /(?:^|[\s_-])(?:pro[_-]?)?free(?:[_-]?\d*)?(?:[\s_-]|$)|twoupfree|freeleech|pctdown/i;
    const hasFreeImage = tagName === 'img' && freeMarker.test(marker);
    const hasFreeClass = freeMarker.test(className);
    const hasFreeLabel = /^(?:free(?:\s*leech)?|freeleech|免费(?:种子)?)$/i.test(trimFreeTimePunctuation(value));

    return hasFreeImage || (hasFreeClass && value.length <= 48) || hasFreeLabel;
  }

  function isFreeTimeNumberText(value) {
    return FREE_TIME_NUMBER_PATTERN.test(trimFreeTimePunctuation(value));
  }

  function isStandaloneFreeTimeElement(element) {
    const value = textOf(element);
    if (value.length === 0 || value.length > 96) {
      return false;
    }
    return hasFreeTimeText(value) || isFreeTimeLabelText(value) || isFreeTimeValueText(value);
  }

  function ensureTitleMeta(titleCell) {
    let meta = [...titleCell.children].find((child) => child.classList.contains('gptui-title-meta'));
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'gptui-title-meta';
      titleCell.appendChild(meta);
    }
    return meta;
  }

  function wrapFreeTimeText(row, sourceCells) {
    const titleCell = row.querySelector('.gptui-title-cell');
    const walker = document.createTreeWalker(row, 4);
    const textNodes = [];
    let current;
    while ((current = walker.nextNode())) {
      if (current.parentElement?.closest('.gptui-title-meta, .gptui-free-time, script, style')) {
        continue;
      }
      const value = current.nodeValue || '';
      const sourceCell = current.parentElement?.closest('td, th');
      const sourceText = textOf(sourceCell);
      const hasSourceContext = sourceCells.has(sourceCell) && FREE_TIME_CONTEXT_PATTERN.test(sourceText);
      const parentMarker = `${current.parentElement?.className || ''} ${current.parentElement?.id || ''}`;
      const parentHasFreeContext = Boolean(current.parentElement) && (
        FREE_TIME_CONTEXT_PATTERN.test(textOf(current.parentElement)) ||
        Boolean(current.parentElement.querySelector('.gptui-free-time'))
      );
      const titleLine = current.parentElement?.closest('.gptui-title-line');
      const lineHasOnlyFreeContext = sourceCell === titleCell && titleLine &&
        FREE_TIME_CONTEXT_PATTERN.test(textOf(titleLine)) &&
        !titleLine.querySelector('a[href]') && textOf(titleLine).length <= 128;
      const standaloneNumber = hasSourceContext && isFreeTimeNumberText(value) && (
        sourceCell !== titleCell ||
        /free|time|优惠|剩余/i.test(parentMarker) ||
        lineHasOnlyFreeContext ||
        parentHasFreeContext
      );
      if (hasFreeTimeText(value) || (sourceCells.has(sourceCell) && (
        FREE_TIME_CONTEXT_PATTERN.test(value) ||
        isFreeTimeLabelText(value) ||
        isFreeTimeValueText(value) ||
        standaloneNumber
      ))) {
        textNodes.push(current);
      }
    }

    textNodes.forEach((node) => {
      if (!node.parentNode || node.parentElement?.closest('.gptui-title-meta, .gptui-free-time')) {
        return;
      }
      const value = node.nodeValue || '';
      const fragment = document.createDocumentFragment();
      let offset = 0;
      let found = false;
      FREE_TIME_PATTERN.lastIndex = 0;
      let part;
      while ((part = FREE_TIME_PATTERN.exec(value))) {
        const isLabel = isFreeTimeLabelText(part[0]);
        if (!hasFreeTimeText(part[0]) && !isLabel) {
          continue;
        }
        found = true;
        if (part.index > offset) {
          fragment.appendChild(document.createTextNode(value.slice(offset, part.index)));
        }
        const span = document.createElement('span');
        span.className = 'gptui-free-time';
        span.textContent = part[0];
        fragment.appendChild(span);
        offset = part.index + part[0].length;
      }
      if (!found) {
        const trimmed = trimFreeTimePunctuation(value);
        if (!isFreeTimeLabelText(trimmed) && !isFreeTimeValueText(trimmed) && !isFreeTimeNumberText(trimmed)) {
          return;
        }
        const span = document.createElement('span');
        span.className = 'gptui-free-time';
        span.textContent = value;
        fragment.appendChild(span);
      } else if (offset < value.length) {
        fragment.appendChild(document.createTextNode(value.slice(offset)));
      }
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function topLevelNodes(nodes) {
    return nodes.filter((node) => !nodes.some((other) => other !== node && other.contains(node)));
  }

  function cleanupMovedNode(sourceParent, row, titleCell) {
    let parent = sourceParent;
    while (parent && parent !== row && parent !== titleCell && !parent.classList.contains('gptui-title-meta')) {
      if (['td', 'th', 'tr', 'table', 'tbody', 'thead', 'tfoot'].includes(parent.tagName?.toLowerCase())) {
        break;
      }
      const nextParent = parent.parentElement;
      if (textOf(parent) || parent.querySelector('img, input, button, select, textarea')) {
        break;
      }
      parent.remove();
      parent = nextParent;
    }
  }

  function markEmptyFreeCells(titleCell, cells) {
    const movedCells = [];
    cells.forEach((cell) => {
      if (!textOf(cell) && !cell.querySelector('img, input, button, select, textarea, a')) {
        cell.classList.add('gptui-free-moved-cell');
        movedCells.push(cell);
      }
    });
    if (movedCells.length === 0) {
      return;
    }

    const table = titleCell.closest('table[data-gptui-torrent-table]');
    const header = table && findHeaderRow(table);
    movedCells.forEach((cell) => {
      header?.cells[cell.cellIndex]?.classList.add('gptui-free-moved-cell');
    });
  }

  function collectFreeSourceCells(row, titleCell, freeCandidates, rowText) {
    const sourceCells = new Set();
    freeCandidates.forEach((element) => {
      const cell = element.closest('td, th');
      if (cell) {
        sourceCells.add(cell);
      }
    });
    row.querySelectorAll('.gptui-free-cell').forEach((cell) => sourceCells.add(cell));

    const hasFreeContext = freeCandidates.length > 0 || FREE_TIME_CONTEXT_PATTERN.test(rowText);
    [...row.cells].forEach((cell) => {
      const value = textOf(cell);
      const isMarkedFreeCell = cell === titleCell || cell.classList.contains('gptui-free-cell');
      if (hasFreeTimeText(value) || FREE_TIME_CONTEXT_PATTERN.test(value) || isFreeTimeLabelText(value) ||
          (hasFreeContext && isMarkedFreeCell && isFreeTimeValueText(value))) {
        sourceCells.add(cell);
      }
    });
    if (titleCell && hasFreeContext) {
      sourceCells.add(titleCell);
    }
    return sourceCells;
  }

  function mergeFreeTimeMeta(meta) {
    const timeNodes = [...meta.children]
      .filter((element) => element.classList.contains('gptui-free-time'));
    if (timeNodes.length < 2) {
      return;
    }

    const firstIndex = [...meta.children].indexOf(timeNodes[0]);
    const merged = document.createElement('span');
    merged.className = 'gptui-free-time';
    merged.textContent = timeNodes.map((element) => textOf(element)).join(' ');
    timeNodes.forEach((element) => element.remove());
    meta.insertBefore(merged, meta.children[firstIndex] || null);
  }

  function markFreeTime(row) {
    const rowText = textOf(row);
    const titleCell = row.querySelector('.gptui-title-cell');
    titleCell?.classList.remove('gptui-free-cell', 'gptui-free-moved-cell');
    const freeCandidates = [...row.querySelectorAll('img, span, b, strong, em, label, a, font, i, div')]
      .filter(isFreeBadgeElement);
    const hasFreeImage = freeCandidates.some((element) => element.tagName?.toLowerCase() === 'img');
    const hasFreeTimeLabel = FREE_TIME_CONTEXT_PATTERN.test(rowText);
    if (!hasFreeTimeText(rowText) && !hasFreeTimeLabel && !hasFreeImage && freeCandidates.length === 0) {
      return;
    }

    const freeImage = freeCandidates.find((element) => element.tagName?.toLowerCase() === 'img');
    const freeCell = freeImage?.closest('td, th') || row.querySelector('.gptui-free-cell');
    if (freeCell && freeCell !== titleCell) {
      freeCell.classList.add('gptui-free-cell');
    }
    if (!titleCell) {
      return;
    }

    const sourceCells = collectFreeSourceCells(row, titleCell, freeCandidates, rowText);
    wrapFreeTimeText(row, sourceCells);
    const meta = ensureTitleMeta(titleCell);
    const timeNodes = [...row.querySelectorAll('.gptui-free-time')]
      .filter((element) => !element.closest('.gptui-title-meta') && isStandaloneFreeTimeElement(element));
    const badgeNodes = [...row.querySelectorAll('img, span, b, strong, em, label, a, font, i, div')]
      .filter(isFreeBadgeElement)
      .filter((element) => !element.closest('.gptui-title-meta'));
    const movableNodes = topLevelNodes([...new Set([...badgeNodes, ...timeNodes])]);
    const orderedNodes = [
      ...movableNodes.filter((node) => isFreeBadgeElement(node)),
      ...movableNodes.filter((node) => !isFreeBadgeElement(node) && isStandaloneFreeTimeElement(node))
    ];
    const movedSourceCells = new Set(orderedNodes
      .map((node) => node.closest('td, th'))
      .filter((cell) => cell && cell !== titleCell));

    orderedNodes.forEach((node) => {
      const sourceParent = node.parentElement;
      node.classList.add(node.classList.contains('gptui-free-time') ? 'gptui-free-time' : 'gptui-free-badge');
      meta.appendChild(node);
      cleanupMovedNode(sourceParent, row, titleCell);
    });
    mergeFreeTimeMeta(meta);
    markEmptyFreeCells(titleCell, movedSourceCells);
  }

  function markPterclubTags(row) {
    const titleCell = row.querySelector('.gptui-title-cell');
    if (!titleCell) {
      return;
    }
    titleCell.querySelectorAll('span, a, b, strong, em, font, label').forEach((element) => {
      const value = textOf(element);
      if (value.length >= 1 && value.length <= 8 && !hasFreeTimeText(value) && !/^https?:/i.test(value)) {
        element.classList.add('gptui-torrent-tag');
      }
    });
  }

  function pterclubTextStartRect(element) {
    if (!element || typeof document.createTreeWalker !== 'function') {
      return element?.getBoundingClientRect?.() || null;
    }

    const walker = document.createTreeWalker(element, 4);
    let textNode;
    while ((textNode = walker.nextNode())) {
      if (!/\S/.test(textNode.nodeValue || '')) {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const rect = range.getBoundingClientRect();
      if (rect.width || rect.height) {
        return rect;
      }
    }
    return element.getBoundingClientRect?.() || null;
  }

  function markPterclubTitleOffset(titleCell) {
    if (!titleCell) {
      return;
    }

    titleCell.querySelectorAll('.gptui-pterclub-primary, .gptui-pterclub-title-wrapper')
      .forEach((element) => {
        element.classList.remove('gptui-pterclub-primary', 'gptui-pterclub-title-wrapper');
      });

    const candidates = [...titleCell.querySelectorAll('a, b, strong')]
      .filter((element) => !element.closest('.gptui-title-meta, .gptui-torrent-control-rail'))
      .filter((element) => textOf(element).length >= 12)
      .filter((element) => !element.querySelector('img'));
    const primary = candidates
      .find((element) => textOf(element).length >= 20) || candidates[0];
    if (!primary) {
      titleCell.style.removeProperty('--gptui-pterclub-title-offset');
      return;
    }

    primary.classList.add('gptui-pterclub-primary');
    let parent = primary.parentElement;
    while (parent && parent !== titleCell) {
      const tagName = parent.tagName?.toLowerCase() || '';
      if (!['a', 'b', 'strong'].includes(tagName)) {
        parent.classList.add('gptui-pterclub-title-wrapper');
      }
      parent = parent.parentElement;
    }

    const cellRect = titleCell.getBoundingClientRect?.();
    const titleRect = pterclubTextStartRect(primary);
    if (!cellRect || !titleRect) {
      return;
    }
    const offset = Math.max(0, Math.round(titleRect.left - cellRect.left));
    titleCell.style.setProperty('--gptui-pterclub-title-offset', `${offset}px`);
  }

  function normalizeDropdown(dropdown) {
    dropdown.setAttribute('data-gptui-dropdown', 'true');
    const owner = dropdown.closest('li') || dropdown.parentElement;
    owner?.setAttribute('data-gptui-menu-owner', 'true');
    if (!IS_TOP_FRAME) {
      return;
    }

    const style = getComputedStyle(dropdown);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return;
    }

    const rect = dropdown.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    dropdown.removeAttribute('data-gptui-dropdown-edge');
    dropdown.removeAttribute('data-gptui-dropdown-placement');
    if (rect.right > window.innerWidth - 8) {
      dropdown.setAttribute('data-gptui-dropdown-edge', 'right');
    } else if (rect.left < 8) {
      dropdown.setAttribute('data-gptui-dropdown-edge', 'left');
    }
    if (rect.bottom > window.innerHeight - 8 && rect.top > rect.height + 8) {
      dropdown.setAttribute('data-gptui-dropdown-placement', 'top');
    } else {
      dropdown.setAttribute('data-gptui-dropdown-placement', 'bottom');
    }
  }

  function normalizeDropdowns() {
    document.querySelectorAll(DROPDOWN_SELECTOR).forEach(normalizeDropdown);
  }

  function normalizeHdareaNavigation() {
    if (siteRule.layout !== 'hdarea') {
      return;
    }

    document.querySelectorAll('ul.menu, #mainmenu, #ddtopmenubar').forEach((menu) => {
      menu.setAttribute('data-gptui-hdarea-menu', 'true');
      let shell = menu.parentElement;
      let depth = 0;
      while (shell && shell !== document.body && shell.id !== 'outer' && depth < 5) {
        shell.setAttribute('data-gptui-hdarea-menu-shell', 'true');
        shell = shell.parentElement;
        depth += 1;
      }
    });
  }

  function markInfoBlocks() {
    document.querySelectorAll('table#info_block, table[data-gptui-info-block]').forEach((table) => {
      table.setAttribute('data-gptui-info-block', 'true');
      table.querySelectorAll(':scope > tbody > tr').forEach((row) => {
        row.setAttribute('data-gptui-info-row', 'true');
      });
    });
  }

  function adaptDocument() {
    if (!IS_TOP_FRAME || !document.documentElement) {
      return;
    }

    if (!themeActive) {
      translateUserInterface();
      return;
    }

    setSiteMetadata();
    markInfoBlocks();
    clearGenericTorrentArtifacts();
    const torrentTables = findTorrentTables();
    torrentTables.forEach(resetGenericTorrentTable);
    if (TORRENT_MARK_LAYOUTS.includes(siteRule.layout)) {
      torrentTables.forEach(markTorrentTable);
    }
    if (activeSettings.hideTypeColumn) {
      torrentTables.forEach(markTypeColumn);
    }
    normalizeDropdowns();
    normalizeHdareaNavigation();
    translateUserInterface();
  }

  function queueAdapt() {
    window.clearTimeout(adaptTimer);
    adaptTimer = window.setTimeout(adaptDocument, 80);
  }

  function watchDocument() {
    if (!IS_TOP_FRAME || documentObserver || !document.documentElement ||
        (!themeActive && !isTranslationSite())) {
      return;
    }

    documentObserver = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => mutation.type === 'childList' ||
        (mutation.type === 'attributes' && mutation.target !== document.documentElement));
      if (!relevant) {
        return;
      }
      queueAdapt();
    });
    documentObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden']
    });
  }

  async function syncTheme() {
    try {
      activeSettings = await readSettings();
      setSiteMetadata();
      const shouldApply = activeSettings.enabled && domainUtils.matchesDomain(hostname, activeSettings.domains);
      if (shouldApply) {
        addThemeLinks(activeSettings.themeId);
      } else {
        removeThemeLinks();
      }
      translateUserInterface();
      watchDocument();
    } catch (error) {
      // Keep the immediate default injection in place when storage is temporarily
      // unavailable during document_start.
      if (!themeActive && isConfiguredByDefault()) {
        addThemeLinks(DEFAULT_THEME_ID);
      }
      console.warn('[gpt-ui] Could not read extension settings.', error);
    }
  }

  setSiteMetadata();
  if (isConfiguredByDefault()) {
    addThemeLinks(DEFAULT_THEME_ID);
  }
  watchDocument();

  api.storage.onChanged?.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[SETTINGS_KEY]) {
      void syncTheme();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    setSiteMetadata();
    watchDocument();
    if (themeActive) {
      addThemeLinks(activeSettings.themeId);
    }
    queueAdapt();
  }, { once: true });

  window.addEventListener('resize', queueAdapt, { passive: true });
  window.addEventListener('scroll', queueAdapt, { passive: true });
  if (['ourbits', 'springsunday', 'pterclub'].includes(siteRule.layout)) {
    window.addEventListener('load', queueAdapt, { once: true });
  }
  void syncTheme();
})();
