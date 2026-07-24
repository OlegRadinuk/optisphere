(function () {
  "use strict";

  // ── Конфиг из тега <script> ────────────────────────────────────────────────
  var script = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="booking-widget.js"]');
    return s.length ? s[s.length - 1] : null;
  })();
  function attr(name, def) {
    return (script && script.getAttribute(name)) || def;
  }

  var BOOKING_URL = attr("data-url", "https://optisphere.tech/booking/albamed");
  var ACCENT      = attr("data-color", "#e0502e");
  // Санитизация цвета: значение уходит в CSS/SVG без экранирования, пускаем только hex.
  if (!/^#[0-9a-fA-F]{3,8}$/.test(ACCENT)) ACCENT = "#e0502e";
  var TITLE       = attr("data-title", "Запись к врачу");
  // Логотип клиники в шапке модалки (белый лого на оранжевой шапке).
  var LOGO        = attr("data-logo", "https://optisphere.tech/albamed/albamed-logo.png");
  var LABEL       = attr("data-label", "Записаться онлайн");
  // CSS-селектор существующих кнопок записи, которые надо перехватить.
  // По умолчанию — любые ссылки, ведущие на страницу записи.
  var SELECTOR    = attr("data-selector", "");
  // data-float="true" → показать плавающую кнопку в углу.
  var FLOAT       = attr("data-float", "false") === "true";
  var FLOAT_POS   = attr("data-position", "right"); // right | left

  var overlay = null;
  var lastFocused = null;

  // ── SVG-иконки (без эмодзи) ─────────────────────────────────────────────────
  function closeIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  }
  function calIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  }

  // ── Стили ───────────────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById("albk-style")) return;
    var css = [
      "#albk-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55);opacity:0;transition:opacity .2s ease;padding:24px;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}",
      "#albk-overlay.albk-on{opacity:1;}",
      "#albk-panel{position:relative;width:480px;max-width:100%;height:680px;max-height:calc(100vh - 48px);background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden;display:flex;flex-direction:column;transform:translateY(12px) scale(.98);transition:transform .2s ease;}",
      "#albk-overlay.albk-on #albk-panel{transform:none;}",
      "#albk-bar{display:flex;align-items:center;gap:9px;padding:11px 14px;background:" + ACCENT + ";color:#fff;flex-shrink:0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;}",
      "#albk-logo{height:30px;width:auto;display:block;flex-shrink:0;}",
      "#albk-bar-ic{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
      "#albk-bar-title{font-size:15px;font-weight:700;line-height:1.2;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      "#albk-close{width:32px;height:32px;border:none;background:rgba(255,255,255,.16);color:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}",
      "#albk-close:hover{background:rgba(255,255,255,.3);}",
      "#albk-frame-wrap{flex:1;position:relative;background:#f8fafc;}",
      "#albk-frame{width:100%;height:100%;border:0;display:block;}",
      "#albk-spin{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}",
      "#albk-spin svg{animation:albk-rot .7s linear infinite;}",
      "@keyframes albk-rot{to{transform:rotate(360deg);}}",
      // Плавающая кнопка
      "#albk-fab{position:fixed;bottom:22px;z-index:2147482000;display:flex;align-items:center;gap:9px;height:50px;padding:0 20px 0 16px;border:none;border-radius:26px;background:" + ACCENT + ";color:#fff;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.24);transition:transform .18s,box-shadow .18s;}",
      "#albk-fab:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.3);}",
      "#albk-fab.albk-right{right:22px;}#albk-fab.albk-left{left:22px;}",
      "@media(max-width:520px){",
        "#albk-overlay{padding:0;}",
        "#albk-panel{width:100%;height:100%;max-height:100vh;border-radius:0;}",
        "#albk-fab{bottom:16px;height:46px;font-size:14px;}#albk-fab.albk-right{right:16px;}#albk-fab.albk-left{left:16px;}",
      "}"
    ].join("");
    var el = document.createElement("style");
    el.id = "albk-style";
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── Открытие / закрытие модалки ─────────────────────────────────────────────
  function open() {
    if (overlay) return;
    injectCSS();
    lastFocused = document.activeElement;

    overlay = document.createElement("div");
    overlay.id = "albk-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", TITLE);
    // Шапка: логотип клиники слева (с фолбэком на иконку+заголовок), крестик справа.
    var barBrand = LOGO
      ? '<img id="albk-logo" src="' + escHtml(LOGO) + '" alt="' + escHtml(TITLE) + '">' +
        '<div id="albk-bar-title" style="display:none">' + escHtml(TITLE) + '</div>'
      : '<div id="albk-bar-ic">' + calIcon() + '</div>' +
        '<div id="albk-bar-title">' + escHtml(TITLE) + '</div>';
    overlay.innerHTML =
      '<div id="albk-panel">' +
        '<div id="albk-bar">' +
          barBrand +
          '<div style="flex:1"></div>' +
          '<button id="albk-close" aria-label="Закрыть">' + closeIcon() + '</button>' +
        '</div>' +
        '<div id="albk-frame-wrap">' +
          '<div id="albk-spin"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="' + ACCENT + '" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";

    // iframe вставляем после кадра, чтобы сработала анимация появления
    var frame = document.createElement("iframe");
    frame.id = "albk-frame";
    frame.title = TITLE;
    frame.setAttribute("allow", "clipboard-write");
    frame.src = BOOKING_URL;
    frame.addEventListener("load", function () {
      var sp = document.getElementById("albk-spin");
      if (sp) sp.style.display = "none";
    });
    overlay.querySelector("#albk-frame-wrap").appendChild(frame);

    overlay.querySelector("#albk-close").addEventListener("click", close);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });

    // Фолбэк логотипа без inline-onerror (устойчив к строгой CSP у клиента).
    var logoImg = document.getElementById("albk-logo");
    if (logoImg) {
      logoImg.addEventListener("error", function () {
        this.style.display = "none";
        var t = document.getElementById("albk-bar-title");
        if (t) t.style.display = "block";
      });
    }

    document.addEventListener("keydown", onKey);
    // Focus trap: не выпускаем фокус из модалки на страницу-хост под ней.
    document.addEventListener("focusin", onFocusIn);

    requestAnimationFrame(function () { overlay.classList.add("albk-on"); });
    setTimeout(function () {
      var c = document.getElementById("albk-close");
      if (c) c.focus();
    }, 60);
  }

  function close() {
    if (!overlay) return;
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusin", onFocusIn);
    var o = overlay;
    overlay = null;
    o.classList.remove("albk-on");
    document.documentElement.style.overflow = "";
    setTimeout(function () { if (o && o.parentNode) o.parentNode.removeChild(o); }, 200);
    if (lastFocused && lastFocused.focus) { try { lastFocused.focus(); } catch (e) {} }
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function onFocusIn(e) {
    // Фокус ушёл за пределы модалки (на страницу-хост) → вернуть на крестик.
    // Цель внутри iframe считается внутри overlay (iframe — потомок overlay).
    if (overlay && e.target !== overlay && !overlay.contains(e.target)) {
      var c = document.getElementById("albk-close");
      if (c) c.focus();
    }
  }

  function escHtml(s) {
    return ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ── Привязка к существующим кнопкам записи ──────────────────────────────────
  function matchesBookingLink(el) {
    var a = el.closest && el.closest("a[href]");
    if (!a) return false;
    var href = a.getAttribute("href") || "";
    return href.indexOf("/booking/albamed") !== -1 || href.indexOf(BOOKING_URL) !== -1;
  }

  // Делегирование на весь документ: перехватываем и ссылки на страницу записи,
  // и элементы по кастомному селектору — один обработчик, работает и для
  // динамически добавленных кнопок.
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var hit = matchesBookingLink(t) || (SELECTOR && t.closest(SELECTOR));
    if (hit) {
      // Пропускаем Ctrl/Cmd/Shift+клик и не-левую кнопку — нативное «открыть в новой вкладке».
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      // Подавляем собственный обработчик сайта (напр. .openModal открывает свою форму),
      // иначе поверх нашей модалки откроется ещё и родной попап.
      e.stopImmediatePropagation();
      open();
    }
  }, true);

  // ── Плавающая кнопка (опционально) ──────────────────────────────────────────
  function mountFab() {
    if (!FLOAT || document.getElementById("albk-fab")) return;
    injectCSS();
    var b = document.createElement("button");
    b.id = "albk-fab";
    b.className = FLOAT_POS === "left" ? "albk-left" : "albk-right";
    b.type = "button";
    b.innerHTML = calIcon() + '<span>' + escHtml(LABEL) + '</span>';
    b.addEventListener("click", open);
    document.body.appendChild(b);
  }

  // ── Публичный API ───────────────────────────────────────────────────────────
  window.AlbamedBooking = { open: open, close: close };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountFab);
  } else {
    mountFab();
  }
})();
