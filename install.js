/* IQ Market — помощник „Сложи магазина на телефона“ (инсталиране като уеб приложение, PWA).
   Разпознава телефона и браузъра и показва точните стъпки, със стрелка към бутона, който трябва да се натисне.

   Защо е нужно: iPhone не позволява на сайт да се инсталира сам (няма бутон като в Chrome на Android).
   Единственият път е менюто на браузъра: „Сподели“ → „Добави към Начален екран“.
   В iOS 26 и 27 бутонът „Сподели“ вече НЕ е долу в средата, а е скрит в менюто „⋯“ долу вдясно.
   Имената на бутоните са по българското ръководство на Apple (support.apple.com/bg-bg/guide/iphone/iphea86e5236/ios):
   „Сподели“, „Добави към Начален екран“, „Редактирай действия“, „Отвори като уеб приложение“, „Добави“.

   Вътрешните браузъри на Facebook, Messenger, Instagram, Viber и други приложения не могат да добавят икона,
   затова там показваме „Отвори в Safari“ / „Отвори в Chrome“ и „Копирай адреса“. */
(function () {
  'use strict';
  var STORE = 'iqmarketbg.com/store.html?install=1';      // след отваряне в Safari/Chrome помощникът се показва сам

  function env() {
    var ua = navigator.userAgent || '';
    var touchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;   // iPad с „компютърен“ изглед
    var ios = /iPhone|iPad|iPod/.test(ua) || touchMac;
    var ipad = /iPad/.test(ua) || touchMac;
    var android = !ios && /Android/.test(ua);
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

    var app = '';
    if (/Instagram/.test(ua)) app = 'Instagram';
    else if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger/.test(ua)) app = 'Facebook или Messenger';
    else if (/Viber/i.test(ua)) app = 'Viber';
    else if (/Telegram/i.test(ua)) app = 'Telegram';
    else if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) app = 'TikTok';
    else if (/GSA\//.test(ua)) app = 'приложението Google';
    else if (/Snapchat|LinkedInApp|Pinterest|Line\//.test(ua)) app = 'друго приложение';

    var browser = 'other';
    if (app) browser = 'inapp';
    else if (ios) {
      if (!/Safari\//.test(ua)) browser = 'inapp';          // вграден преглед в приложение: в него няма думата Safari
      else if (/CriOS/.test(ua)) browser = 'chrome';
      else if (/FxiOS/.test(ua)) browser = 'firefox';
      else if (/EdgiOS/.test(ua)) browser = 'edge';
      else if (/OPiOS|OPT\//.test(ua)) browser = 'opera';
      else if (/DuckDuckGo|Ddg\//.test(ua)) browser = 'ddg';
      else if (/YaBrowser|GSA/.test(ua)) browser = 'other';
      else browser = 'safari';
    } else if (android) {
      if (/; wv\)/.test(ua)) browser = 'inapp';
      else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
      else if (/Firefox\//.test(ua)) browser = 'firefox';
      else if (/EdgA\//.test(ua)) browser = 'edge';
      else if (/OPR\//.test(ua)) browser = 'opera';
      else if (/Chrome\//.test(ua)) browser = 'chrome';
    } else {
      if (/Edg\//.test(ua)) browser = 'edge';
      else if (/Chrome\//.test(ua)) browser = 'chrome';
      else if (/Firefox\//.test(ua)) browser = 'firefox';
      else if (/Safari\//.test(ua)) browser = 'safari';
    }
    // Версия: Safari 26+ замразява „OS 18_x“ в описанието си, затова за Safari четем „Version/26“ (= iOS 26).
    var sv = +((ua.match(/Version\/(\d+)/) || [])[1] || 0);
    var m = ua.match(/OS (\d+)_(\d+)/);
    var osv = m ? (+m[1] + (+m[2]) / 100) : 0;
    var iosv = browser === 'safari' && sv ? Math.max(sv, osv) : osv;
    return { ios: ios, ipad: ipad, android: android, desktop: !ios && !android, standalone: standalone,
             app: app, browser: browser, iosv: iosv };
  }

  // ---------- иконки (като тези в менютата на телефона) ----------
  var I = {
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></svg>',
    kebab: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18.5" r="2"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 9.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.5a2 2 0 0 0-2-2h-1.5"/><path d="M12 14V3"/><path d="M8.5 6.5 12 3l3.5 3.5"/></svg>',
    addhome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    toggle: '<svg viewBox="0 0 24 24"><rect x="2" y="6.5" width="20" height="11" rx="5.5" fill="currentColor"/><circle cx="16.5" cy="12" r="4" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg>',
    safari: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
    install: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/></svg>'
  };
  var ARROW = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="23" fill="var(--brand,#128A3E)"/><path d="M24 11v24M14 26l10 10 10-10" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function step(ico, html, note) { return { ico: ico, html: html, note: note || '' }; }
  var ADDHOME = step('addhome', 'Прелисти надолу и натисни <b>Добави към Начален екран</b>',
    'Не го виждаш? Потърси в <b>Още</b> или най-долу в <b>Редактирай действия</b>.');
  var ADD = step('toggle', 'Остави включено <b>Отвори като уеб приложение</b> и натисни <b>Добави</b>');

  // Какво да прави човек на ТОЗИ телефон и в ТОЗИ браузър. arrow: къде е бутонът (br долу вдясно, bc долу в средата, tr горе вдясно).
  function plan(e, canPrompt) {
    if (canPrompt) return { kind: 'prompt' };
    if (e.browser === 'inapp') return { kind: 'inapp' };
    if (e.ios) {
      if (e.browser !== 'safari' && e.iosv && e.iosv < 16.4) return { kind: 'oldios' };
      if (e.browser === 'safari') {
        if (e.ipad) return { arrow: 'tr', steps: [
          step('share', 'Натисни <b>Сподели</b> горе вдясно', 'В по-новите версии може да е в менюто <b>⋯</b> до адреса.'),
          ADDHOME, ADD] };
        if (e.iosv >= 26) return { arrow: 'br', steps: [
          step('dots', 'Натисни <b>⋯</b> долу вдясно', 'Лентата е смалена? Първо я докосни. Ако в нея виждаш направо иконата за споделяне, натисни нея.'),
          step('share', 'Натисни <b>Сподели</b>'),
          ADDHOME, ADD] };
        return { arrow: 'bc', steps: [
          step('share', 'Натисни <b>Сподели</b> (квадратчето със стрелка) долу в средата'),
          ADDHOME,
          step('check', 'Натисни <b>Добави</b> горе вдясно')] };
      }
      if (e.browser === 'chrome') return { arrow: 'tr', safariHelp: true, steps: [
        step('share', 'Натисни <b>Сподели</b> в адресната лента, вдясно от адреса', 'Не го виждаш? Натисни <b>⋯</b> долу вдясно и избери <b>Сподели</b>.'),
        ADDHOME,
        step('check', 'Натисни <b>Добави</b>')] };
      if (e.browser === 'firefox') return { arrow: 'br', safariHelp: true, steps: [
        step('burger', 'Натисни менюто <b>☰</b> долу вдясно'),
        step('share', 'Избери <b>Сподели</b>'),
        ADDHOME, step('check', 'Натисни <b>Добави</b>')] };
      return { safariHelp: true, steps: [
        step('dots', 'Отвори менюто на браузъра (<b>⋯</b> или <b>☰</b>)'),
        step('share', 'Избери <b>Сподели</b>'),
        ADDHOME, step('check', 'Натисни <b>Добави</b>')] };
    }
    if (e.android) {
      if (e.browser === 'samsung') return { arrow: 'br', steps: [
        step('burger', 'Натисни менюто <b>☰</b> долу вдясно', 'Или иконата за инсталиране в адресната лента, ако я има.'),
        step('addhome', 'Избери <b>Добави страница към</b> → <b>Начален екран</b>'),
        step('check', 'Потвърди с <b>Добави</b>')] };
      if (e.browser === 'firefox') return { steps: [
        step('kebab', 'Натисни менюто <b>⋮</b> (горе или долу вдясно)'),
        step('addhome', 'Избери <b>Добави към началния екран</b> или <b>Инсталирай</b>'),
        step('check', 'Потвърди')] };
      return { arrow: 'tr', steps: [
        step('kebab', 'Натисни менюто <b>⋮</b> горе вдясно'),
        step('install', 'Избери <b>Инсталирай приложението</b> или <b>Добави към началния екран</b>'),
        step('check', 'Потвърди с <b>Инсталирай</b>')] };
    }
    return { kind: 'desktop' };
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ICON = '<img src="pwa-192.png" alt="">';
  var SAFARI_BTNS = '<a class="iqmi-btn pri" href="x-safari-https://' + STORE + '">' + I.safari + ' Отвори в Safari</a>' +
                    '<button class="iqmi-btn" type="button" data-iqmi-copy>Копирай адреса</button>';
  var CHROME_BTNS = '<a class="iqmi-btn pri" href="intent://' + STORE + '#Intent;scheme=https;package=com.android.chrome;end">Отвори в Chrome</a>' +
                    '<button class="iqmi-btn" type="button" data-iqmi-copy>Копирай адреса</button>';

  // HTML на помощника. Връща {html, arrow}.
  function guide(e, canPrompt) {
    e = e || env();
    var p = plan(e, canPrompt), h = '<div class="iqmi">';
    if (p.kind === 'prompt') {
      h += '<h2>Инсталирай IQ Market</h2><p class="iqmi-sub">' + ICON + '<span>Едно натискане и иконата е на началния ти екран. Без магазин за приложения, винаги най-новата версия.</span></p>' +
           '<div class="iqmi-btns"><button class="iqmi-btn pri" type="button" data-iqmi-prompt>' + I.install + ' Инсталирай сега</button></div>';
    } else if (p.kind === 'inapp') {
      var where = e.app ? esc(e.app) : 'друго приложение';
      var br = e.android ? 'Chrome' : 'Safari';
      h += '<h2>Първо отвори в ' + br + '</h2><p class="iqmi-sub">' + ICON + '<span>Сега магазинът е отворен вътре в ' + where + '. Оттук телефонът не позволява да се сложи иконата.</span></p>' +
           '<div class="iqmi-btns">' + (e.android ? CHROME_BTNS : SAFARI_BTNS) + '</div>' +
           '<p class="iqmi-help">Бутонът не сработи? Натисни <b>' + (e.android ? '⋮' : '⋯') + '</b> горе в това приложение и избери <b>Отвори в ' + br + '</b> (или <b>Отвори в браузъра</b>). Можеш и да копираш адреса и да го поставиш в ' + br + '.</p>';
    } else if (p.kind === 'oldios') {
      h += '<h2>Отвори в Safari</h2><p class="iqmi-sub">' + ICON + '<span>На тази версия на iPhone иконата се добавя само от Safari.</span></p>' +
           '<div class="iqmi-btns">' + SAFARI_BTNS + '</div>';
    } else if (p.kind === 'desktop') {
      h += '<h2>Сложи магазина на телефона</h2><p class="iqmi-sub">' + ICON + '<span>Отвори <b>iqmarketbg.com</b> на телефона си и натисни <b>Свали приложението</b>. Ще ти покажем стъпките точно за него.</span></p>' +
           '<p class="iqmi-help">На компютър: в Chrome или Edge натисни иконата за инсталиране вдясно в адресната лента.</p>';
    } else {
      h += '<h2>Сложи IQ Market на телефона</h2><p class="iqmi-sub">' + ICON + '<span>' + p.steps.length + ' стъпки и иконата е на началния ти екран.' + (p.arrow ? ' Следвай стрелката.' : '') + '</span></p><ol>';
      p.steps.forEach(function (s, i) {
        h += '<li><span class="iqmi-ico">' + I[s.ico] + '<b>' + (i + 1) + '</b></span><span class="iqmi-t">' + s.html +
             (s.note ? '<small>' + s.note + '</small>' : '') + '</span></li>';
      });
      h += '</ol><p class="iqmi-done">' + I.check + '<span>Готово! Отваряй магазина от иконата <b>IQ Market</b>. Оттам можеш да включиш и известията.</span></p>';
      if (e.ios) {
        h += '<details class="iqmi-more"><summary>Не се получава?</summary><p class="iqmi-help">' +
             (p.safariHelp ? 'Най-сигурно е в Safari.' : 'Ако си отворил връзката от Facebook, Messenger, Viber или имейл, магазинът може да е вътре в него. Отвори го в Safari.') +
             '</p><div class="iqmi-btns">' + SAFARI_BTNS + '</div></details>';
      } else if (e.android) {
        h += '<details class="iqmi-more"><summary>Не се получава?</summary><p class="iqmi-help">Най-лесно е в Chrome: там излиза бутон <b>Инсталирай</b>.</p><div class="iqmi-btns">' + CHROME_BTNS + '</div></details>';
      }
    }
    h += '<button class="iqmi-btn iqmi-close" type="button" data-iqmi-close>Разбрах</button></div>';
    return { html: h, arrow: p.arrow || '' };
  }

  // Текст за лентата „Инсталирай IQ Market“ в магазина
  function barText(e) {
    e = e || env();
    if (e.browser === 'inapp') return { text: 'Отвори в ' + (e.android ? 'Chrome' : 'Safari') + ', за да го сложиш на телефона.', btn: 'Как?' };
    return { text: 'Сложи иконата на началния екран — само няколко докосвания.', btn: 'Покажи как' };
  }

  function copy(btn) {
    var url = 'https://iqmarketbg.com/store.html';
    function ok() { var t = btn.textContent; btn.textContent = 'Копирано ✓ Постави го в браузъра'; setTimeout(function () { btn.textContent = t; }, 3500); }
    function old() {
      var ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (_) { prompt('Копирай адреса:', url); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, old); else old();
  }

  // Свързва бутоните в помощника. opts: {close(), prompt()}
  function bind(root, opts) {
    opts = opts || {};
    root.querySelectorAll('[data-iqmi-copy]').forEach(function (b) { b.onclick = function () { copy(b); }; });
    root.querySelectorAll('[data-iqmi-close]').forEach(function (b) { b.onclick = function () { if (opts.close) opts.close(); }; });
    root.querySelectorAll('[data-iqmi-prompt]').forEach(function (b) { b.onclick = function () { if (opts.prompt) opts.prompt(); }; });
  }

  var arrowEl = null;
  function showArrow(pos) {
    hideArrow(); if (!pos) return;
    css();
    arrowEl = document.createElement('div');
    arrowEl.className = 'iqmi-arrow ' + pos; arrowEl.setAttribute('aria-hidden', 'true'); arrowEl.innerHTML = '<i>' + ARROW + '</i>';
    document.body.appendChild(arrowEl);
  }
  function hideArrow() { if (arrowEl) { arrowEl.remove(); arrowEl = null; } }

  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement('style');
    s.textContent =
      '.iqmi h2{margin:0 0 8px;font-size:1.25rem;line-height:1.25;color:var(--ink)}' +
      '.iqmi-sub{display:flex;gap:12px;align-items:center;margin:0 0 12px;color:var(--ink-soft);font-size:.92rem;line-height:1.45}' +
      '.iqmi-sub img{width:44px;height:44px;border-radius:11px;flex:none}' +
      '.iqmi ol{list-style:none;margin:0;padding:0}' +
      '.iqmi li{display:flex;gap:12px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)}' +
      '.iqmi li:first-child{border-top:0}' +
      '.iqmi-ico{position:relative;flex:none;width:42px;height:42px;border-radius:12px;background:var(--surface-2,#EEF3EA);color:var(--brand);display:grid;place-items:center}' +
      '.iqmi-ico svg{width:23px;height:23px}' +
      '.iqmi-ico b{position:absolute;top:-6px;left:-6px;width:21px;height:21px;border-radius:50%;background:var(--brand);color:#fff;font-size:.74rem;font-weight:800;display:grid;place-items:center;border:2px solid var(--surface,#fff)}' +
      '.iqmi-t{flex:1;min-width:0;font-size:.98rem;line-height:1.38;color:var(--ink);padding-top:2px}' +
      '.iqmi-t b,.iqmi-help b,.iqmi-sub b{color:var(--ink);font-weight:800}' +
      '.iqmi-t small{display:block;margin-top:3px;color:var(--ink-soft);font-size:.83rem;line-height:1.4}' +
      '.iqmi-done{display:flex;gap:10px;align-items:flex-start;margin:4px 0 0;padding:9px 12px;border-radius:12px;background:var(--surface-2,#EEF3EA);color:var(--ink-soft);font-size:.9rem;line-height:1.45}' +
      '.iqmi-done svg{width:20px;height:20px;flex:none;color:var(--brand);margin-top:1px}' +
      '.iqmi-btns{display:grid;gap:8px;margin-top:14px}' +
      '.iqmi-btn{display:flex;justify-content:center;align-items:center;gap:8px;width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:1rem;font-weight:700;text-decoration:none;cursor:pointer;text-align:center}' +
      '.iqmi-btn svg{width:20px;height:20px;flex:none}' +
      '.iqmi-btn.pri{background:var(--brand);border-color:var(--brand);color:#fff}' +
      '.iqmi-close{margin-top:12px}' +
      '.iqmi-help{margin:12px 0 0;color:var(--ink-soft);font-size:.86rem;line-height:1.5}' +
      '.iqmi-more{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}' +
      '.iqmi-more summary{cursor:pointer;color:var(--brand);font-weight:700;font-size:.92rem}' +
      '.iqmi-more .iqmi-help{margin-top:8px}' +
      '.iqmi-arrow{position:fixed;z-index:9999;pointer-events:none;width:56px;height:56px;filter:drop-shadow(0 3px 8px rgba(0,0,0,.45))}' +
      '.iqmi-arrow i{display:block;width:100%;height:100%;animation:iqmiDown 1s ease-in-out infinite}' +
      '.iqmi-arrow svg{display:block;width:100%;height:100%}' +
      '.iqmi-arrow.br{right:10px;bottom:calc(6px + env(safe-area-inset-bottom,0px))}' +
      '.iqmi-arrow.bc{left:calc(50% - 28px);bottom:calc(6px + env(safe-area-inset-bottom,0px))}' +
      '.iqmi-arrow.tr{right:10px;top:calc(6px + env(safe-area-inset-top,0px))}' +
      '.iqmi-arrow.tr svg{transform:rotate(180deg)}' +
      '.iqmi-arrow.tr i{animation-name:iqmiUp}' +
      '@keyframes iqmiDown{0%,100%{transform:translateY(-4px)}50%{transform:translateY(6px)}}' +
      '@keyframes iqmiUp{0%,100%{transform:translateY(4px)}50%{transform:translateY(-6px)}}' +
      '@media(prefers-reduced-motion:reduce){.iqmi-arrow i{animation:none}}';
    document.head.appendChild(s);
  }

  window.IQMI = { env: env, guide: function (e, canPrompt) { css(); return guide(e, canPrompt); },
                  barText: barText, bind: bind, showArrow: showArrow, hideArrow: hideArrow };
})();
