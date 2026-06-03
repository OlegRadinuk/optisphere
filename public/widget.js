(function () {
  "use strict";

  // Find own script tag — document.currentScript is null for async-loaded scripts
  var script = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="widget.js"]');
    if (s.length) return s[s.length - 1];
    var all = document.getElementsByTagName("script");
    return all[all.length - 1];
  })();

  var BOT_SLUG = script.getAttribute("data-bot")      || "default";
  var API_BASE = script.getAttribute("data-api")      || "https://optisphere.tech";
  var PRIMARY  = script.getAttribute("data-color")    || null;
  var TITLE    = script.getAttribute("data-title")    || null;
  var POSITION = script.getAttribute("data-position") || "right";
  var BOTTOM   = parseInt(script.getAttribute("data-bottom") || "120", 10);
  var RIGHT    = parseInt(script.getAttribute("data-right")  || "20", 10);
  var LEFT     = parseInt(script.getAttribute("data-left")   || "20", 10);
  var GREETING_DELAY = parseInt(script.getAttribute("data-greeting-delay") || "3000", 10);
  var _cfg = (window._opsphCfg && window._opsphCfg[BOT_SLUG]) || {};
  var AVATAR_URL = script.getAttribute("data-avatar") || _cfg.avatar || null;

  var COLOR     = PRIMARY || "#e85d04";
  var CHAR_NAME = TITLE   || "Ассистент";
  var AVA_LETTER = CHAR_NAME.charAt(0).toUpperCase();
  var GREETING  = "";
  var DEFAULT_GREETING = "Здравствуйте! 👋 Подскажу и отвечу на ваши вопросы — напишите, что вас интересует.";

  function makeAvaHtml(size) {
    if (AVATAR_URL) {
      return '<img src="' + escHtml(AVATAR_URL) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;display:block;" alt="">';
    }
    return escHtml(AVA_LETTER);
  }
  function makeAvaDom(size) {
    if (AVATAR_URL) {
      var img = document.createElement("img");
      img.src = AVATAR_URL;
      img.style.cssText = "width:" + size + "px;height:" + size + "px;border-radius:50%;object-fit:cover;display:block;";
      img.alt = "";
      return img;
    }
    var t = document.createTextNode(AVA_LETTER);
    return t;
  }

  var messages      = [];
  var sessionId     = "s-" + Math.random().toString(36).slice(2);
  var isOpen        = false;
  var isStreaming   = false;
  var leadFormShown = false;
  var bubbleDismissed = false;
  var quickRepliesShown = false;

  var STORAGE_KEY    = "opsph_chat_" + BOT_SLUG;
  var SESSION_FLAG   = "opsph_alive_" + BOT_SLUG; // sessionStorage flag — cleared on reload/new tab
  var MAX_MESSAGES   = 50;

  function loadSession() {
    try {
      // Restore only if user is navigating within the same browser session (SPA).
      // sessionStorage is wiped on page reload / new tab / new visit — so we start fresh.
      if (!sessionStorage.getItem(SESSION_FLAG)) return;
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || !data.sessionId || !data.messages) return;
      sessionId = data.sessionId;
      messages  = data.messages;
    } catch (e) { /* storage unavailable or JSON parse error */ }
  }

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_FLAG, "1");
      var trimmed = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId: sessionId,
        messages:  trimmed,
        savedAt:   Date.now()
      }));
    } catch (e) { /* quota exceeded or unavailable */ }
  }

  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_FLAG);
    } catch (e) {}
    messages       = [];
    sessionId      = "s-" + Math.random().toString(36).slice(2);
    leadFormShown  = false;
    quickRepliesShown = false;
    var msgsEl = msgs();
    if (msgsEl) msgsEl.innerHTML = "";
    showGreeting();
  }

  function restoreMessages() {
    if (!messages.length) return;
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (m.role === "user") {
        appendUserMsg(m.content);
      } else if (m.role === "assistant") {
        appendBotRow(m.content);
      }
    }
  }

  var PILL_H    = 48;

  // ── CSS ─────────────────────────────────────────────────────────────────────
  function injectCSS() {
    var isLeft = POSITION === "left";
    var hEdge = isLeft ? ("left:" + LEFT + "px") : ("right:" + RIGHT + "px");
    var hEdgeChat = isLeft ? ("left:" + (LEFT - 4) + "px") : ("right:" + (RIGHT - 4) + "px");
    var css = [
      "#opsph-btn{position:fixed;bottom:" + BOTTOM + "px;" + hEdge + ";z-index:9999;height:" + PILL_H + "px;padding:0 18px 0 10px;border-radius:24px;background:" + COLOR + ";border:none;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.22);display:flex;align-items:center;gap:9px;transition:transform .2s,box-shadow .2s;}",
      "#opsph-btn:hover{transform:scale(1.05);box-shadow:0 6px 24px rgba(0,0,0,.3);}",
      "#opsph-btn-ava{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-btn-label{font-weight:700;font-size:14px;color:#fff;font-family:system-ui,sans-serif;letter-spacing:.2px;white-space:nowrap;}",
      "#opsph-bubble{position:fixed;bottom:" + (BOTTOM + PILL_H + 10) + "px;" + hEdge + ";z-index:9998;background:#fff;border-radius:16px;border-bottom-" + (isLeft ? "left" : "right") + "-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,.13);padding:14px 16px 14px 14px;max-width:260px;display:flex;flex-direction:column;gap:8px;animation:opsph-pop .3s ease;border:1.5px solid #f0f0f0;}",
      "#opsph-bubble.hide{display:none;}",
      "@keyframes opsph-pop{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}",
      "#opsph-bubble-head{display:flex;align-items:center;gap:8px;}",
      "#opsph-bubble-ava{width:30px;height:30px;border-radius:50%;background:" + COLOR + ";display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-bubble-name{font-weight:700;font-size:13px;color:#1e293b;font-family:system-ui,sans-serif;}",
      "#opsph-bubble-close{margin-left:auto;width:20px;height:20px;border:none;background:none;cursor:pointer;color:#94a3b8;font-size:16px;padding:0;line-height:1;display:flex;align-items:center;justify-content:center;}",
      "#opsph-bubble-text{font-size:13px;color:#334155;font-family:system-ui,sans-serif;line-height:1.5;}",
      "#opsph-bubble-cta{background:" + COLOR + ";color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;font-family:system-ui,sans-serif;cursor:pointer;transition:opacity .15s;text-align:left;}",
      "#opsph-bubble-cta:hover{opacity:.88;}",
      "#opsph-wrap{position:fixed;bottom:" + (BOTTOM + PILL_H + 12) + "px;" + hEdgeChat + ";z-index:9997;width:368px;max-width:calc(100vw - 32px);height:530px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden;transition:opacity .22s,transform .22s;opacity:0;transform:translateY(14px) scale(.97);pointer-events:none;}",
      "#opsph-wrap.open{opacity:1;transform:none;pointer-events:all;}",
      "#opsph-head{background:" + COLOR + ";padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}",
      "#opsph-head-ava{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-head-info{flex:1;min-width:0;}",
      "#opsph-head-name{font-weight:700;font-size:15px;color:#fff;font-family:system-ui,sans-serif;}",
      "#opsph-head-sub{font-size:11px;color:rgba(255,255,255,.75);font-family:system-ui,sans-serif;margin-top:1px;}",
      "#opsph-close{background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;border-radius:50%;width:30px;height:30px;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
      "#opsph-close:hover{background:rgba(255,255,255,.28);}",
      "#opsph-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-family:system-ui,sans-serif;font-size:14px;background:#f8fafc;}",
      "#opsph-msgs::-webkit-scrollbar{width:3px;}",
      "#opsph-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}",
      ".opsph-row{display:flex;align-items:flex-end;gap:7px;}",
      ".opsph-row-ava{width:26px;height:26px;border-radius:50%;background:" + COLOR + ";display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      ".opsph-msg{max-width:80%;padding:9px 13px;border-radius:14px;word-break:break-word;white-space:pre-wrap;line-height:1.55;}",
      ".opsph-user{align-self:flex-end;background:" + COLOR + ";color:#fff;border-bottom-right-radius:4px;}",
      ".opsph-bot{background:#fff;color:#1e293b;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.07);}",
      ".opsph-typing-row{display:flex;align-items:flex-end;gap:7px;}",
      ".opsph-typing{background:#fff;padding:11px 14px;border-radius:14px;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.07);}",
      ".opsph-typing span{display:inline-block;width:6px;height:6px;background:#94a3b8;border-radius:50%;margin:0 2px;animation:opsph-bounce .9s infinite;}",
      ".opsph-typing span:nth-child(2){animation-delay:.18s;}",
      ".opsph-typing span:nth-child(3){animation-delay:.36s;}",
      "@keyframes opsph-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}",
      ".opsph-lead-card{background:#fff;border:1.5px solid " + COLOR + ";border-radius:14px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.07);max-width:86%;}",
      ".opsph-lead-title{font-weight:700;font-size:13px;color:#1e293b;margin-bottom:10px;font-family:system-ui,sans-serif;}",
      ".opsph-lead-input{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #e2e8f0;border-radius:9px;font-size:13px;font-family:system-ui,sans-serif;outline:none;margin-bottom:8px;transition:border-color .15s;}",
      ".opsph-lead-input:focus{border-color:" + COLOR + ";}",
      ".opsph-lead-btn{width:100%;padding:9px;border:none;border-radius:9px;background:" + COLOR + ";color:#fff;font-weight:600;font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;}",
      ".opsph-lead-btn:disabled{opacity:.5;cursor:default;}",
      ".opsph-lead-ok{color:#059669;font-size:13px;font-family:system-ui,sans-serif;font-weight:600;text-align:center;padding:6px 0;}",
      "#opsph-footer{display:flex;flex-direction:column;flex-shrink:0;background:#fff;border-top:1px solid #e2e8f0;}",
      "#opsph-form{display:flex;padding:10px 12px 6px;gap:8px;}",
      "#opsph-clear{background:none;border:none;cursor:pointer;font-size:11px;color:#94a3b8;font-family:system-ui,sans-serif;padding:0 12px 8px;text-align:center;width:100%;transition:color .15s;}",
      "#opsph-clear:hover{color:#64748b;}",
      "#opsph-input{flex:1;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:system-ui,sans-serif;outline:none;resize:none;min-height:38px;max-height:96px;line-height:1.4;transition:border-color .15s;color:#1e293b;background:#f8fafc;}",
      "#opsph-input:focus{border-color:" + COLOR + ";background:#fff;}",
      "#opsph-send{width:38px;height:38px;border-radius:12px;border:none;background:" + COLOR + ";cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
      "#opsph-send:disabled{opacity:.45;cursor:default;}",
      "@media(max-width:480px){#opsph-wrap{width:calc(100vw - 20px);}#opsph-btn{" + (POSITION==="left"?"left:12px":"right:12px") + "}#opsph-bubble{" + (POSITION==="left"?"left:12px":"right:12px") + ";max-width:calc(100vw - 40px);}}",
      ".opsph-quick-replies{display:flex;flex-wrap:wrap;margin-top:8px;}",
      ".opsph-qr-chip{display:inline-flex;align-items:center;padding:6px 14px;border-radius:20px;border:1px solid rgba(8,145,178,0.4);background:rgba(8,145,178,0.12);color:" + COLOR + ";font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;margin:4px 4px 0 0;transition:background .15s;line-height:1.3;}",
      ".opsph-qr-chip:hover{background:rgba(8,145,178,0.22);}"
    ].join("");

    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  function buildDOM() {
    var btn = document.createElement("button");
    btn.id = "opsph-btn";
    btn.setAttribute("aria-label", "Чат с " + CHAR_NAME);
    btn.innerHTML =
      '<div id="opsph-btn-ava">' + makeAvaHtml(32) + '</div>' +
      '<span id="opsph-btn-label">' + escHtml(CHAR_NAME) + '</span>';
    btn.addEventListener("click", function () { hideBubble(); toggle(); });
    document.body.appendChild(btn);

    var wrap = document.createElement("div");
    wrap.id = "opsph-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    var placeholder = script.getAttribute("data-placeholder") || "Напишите вопрос…";
    wrap.innerHTML = [
      '<div id="opsph-head">',
        '<div id="opsph-head-ava">' + makeAvaHtml(36) + '</div>',
        '<div id="opsph-head-info">',
          '<div id="opsph-head-name">' + escHtml(CHAR_NAME) + '</div>',
          '<div id="opsph-head-sub">● Онлайн · ИИ-ассистент</div>',
        '</div>',
        '<button id="opsph-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-msgs" aria-live="polite"></div>',
      '<div id="opsph-footer">',
        '<form id="opsph-form" autocomplete="off">',
          '<textarea id="opsph-input" placeholder="' + escHtml(placeholder) + '" rows="1"></textarea>',
          '<button id="opsph-send" type="submit">' + sendIcon() + '</button>',
        '</form>',
        '<button id="opsph-clear" type="button">очистить историю</button>',
      '</div>'
    ].join("");
    document.body.appendChild(wrap);

    wrap.querySelector("#opsph-close").addEventListener("click", toggle);
    wrap.querySelector("#opsph-form").addEventListener("submit", onSubmit);
    wrap.querySelector("#opsph-clear").addEventListener("click", clearHistory);
    var inp = wrap.querySelector("#opsph-input");
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        wrap.querySelector("#opsph-form").dispatchEvent(new Event("submit", { bubbles: true }));
      }
    });
    inp.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 96) + "px";
    });
  }

  // ── Greeting bubble ──────────────────────────────────────────────────────────
  function showBubble() {
    if (bubbleDismissed || isOpen) return;
    var el = document.createElement("div");
    el.id = "opsph-bubble";
    el.innerHTML = [
      '<div id="opsph-bubble-head">',
        '<div id="opsph-bubble-ava">' + makeAvaHtml(30) + '</div>',
        '<span id="opsph-bubble-name">' + escHtml(CHAR_NAME) + '</span>',
        '<button id="opsph-bubble-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-bubble-text">' + (GREETING ? escHtml(GREETING).replace(/\n/g, "<br>") : escHtml(DEFAULT_GREETING)) + '</div>',
      '<button id="opsph-bubble-cta">Написать →</button>',
    ].join("");
    document.body.appendChild(el);

    el.querySelector("#opsph-bubble-close").addEventListener("click", function (e) {
      e.stopPropagation();
      hideBubble();
    });
    el.querySelector("#opsph-bubble-cta").addEventListener("click", function () {
      hideBubble();
      if (!isOpen) toggle();
    });
  }

  function hideBubble() {
    bubbleDismissed = true;
    var el = document.getElementById("opsph-bubble");
    if (el) el.remove();
  }

  // ── Toggle ───────────────────────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    var wrap = document.getElementById("opsph-wrap");
    var label = document.getElementById("opsph-btn-label");
    if (isOpen) {
      wrap.classList.add("open");
      if (label) label.textContent = "Закрыть";
      if (messages.length === 0) showGreeting();
      setTimeout(function () {
        var i = document.getElementById("opsph-input");
        if (i) i.focus();
      }, 60);
    } else {
      wrap.classList.remove("open");
      if (label) label.textContent = CHAR_NAME;
    }
  }

  // ── Greeting message in chat ──────────────────────────────────────────────────
  function showGreeting() {
    appendBotRow(GREETING || DEFAULT_GREETING);
    appendQuickReplies();
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  function onSubmit(e) {
    e.preventDefault();
    if (isStreaming) return;
    var inp = document.getElementById("opsph-input");
    var text = inp.value.trim();
    if (!text) return;
    inp.value = "";
    inp.style.height = "auto";
    removeQuickReplies();
    messages.push({ role: "user", content: text });
    saveSession();
    appendUserMsg(text);
    streamBot();
  }

  // ── Stream ────────────────────────────────────────────────────────────────────
  function streamBot() {
    isStreaming = true;
    setSendDisabled(true);
    var typingRow = appendTypingRow();

    fetch(API_BASE + "/api/bots/" + BOT_SLUG + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, sessionId: sessionId })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res;
      })
      .then(function (res) {
        typingRow.remove();
        var row    = createBotRow();
        var bubble = row.querySelector(".opsph-bot");
        msgs().appendChild(row);
        scrollToBottom();

        var reader  = res.body.getReader();
        var decoder = new TextDecoder();
        var full    = "";

        function read() {
          reader.read().then(function (r) {
            if (r.done) {
              var cleaned = full.replace(/\[SAVE_LEAD\]/g, "").replace(/\[SHOW_FORM\]/g, "").trimEnd();
              bubble.innerHTML = linkify(cleaned);
              messages.push({ role: "assistant", content: cleaned });
              saveSession();
              if ((full.indexOf("[SAVE_LEAD]") !== -1 || full.indexOf("[SHOW_FORM]") !== -1) && !leadFormShown) showLeadForm();
              if (!leadFormShown) {
                var userMsgCount = 0;
                for (var mi = 0; mi < messages.length; mi++) { if (messages[mi].role === "user") userMsgCount++; }
                if (userMsgCount >= 3) showLeadForm();
              }
              isStreaming = false;
              setSendDisabled(false);
              scrollToBottom();
              return;
            }
            var chunk = decoder.decode(r.value, { stream: true });
            full += chunk;
            bubble.textContent = full.replace(/\[SAVE_LEAD\]/g, "").replace(/\[SHOW_FORM\]/g, "");
            scrollToBottom();
            read();
          }).catch(function () {
            typingRow.remove();
            isStreaming = false;
            setSendDisabled(false);
          });
        }
        read();
      })
      .catch(function () {
        typingRow.remove();
        appendBotRow("Произошла ошибка соединения. Попробуйте ещё раз.");
        isStreaming = false;
        setSendDisabled(false);
      });
  }

  // ── Lead Form ─────────────────────────────────────────────────────────────────
  function showLeadForm() {
    leadFormShown = true;
    var card = document.createElement("div");
    card.className = "opsph-lead-card";
    card.innerHTML = [
      '<div class="opsph-lead-title">📋 Оставить заявку</div>',
      '<input class="opsph-lead-input" id="opsph-lead-name" type="text" placeholder="Ваше имя" autocomplete="name">',
      '<input class="opsph-lead-input" id="opsph-lead-phone" type="tel" placeholder="+7 (___) ___ __ __" autocomplete="tel">',
      '<button class="opsph-lead-btn" id="opsph-lead-submit">Отправить заявку</button>'
    ].join("");
    msgs().appendChild(card);
    scrollToBottom();

    var submitBtn = card.querySelector("#opsph-lead-submit");
    submitBtn.addEventListener("click", function () {
      var name  = card.querySelector("#opsph-lead-name").value.trim();
      var phone = card.querySelector("#opsph-lead-phone").value.trim();
      if (!phone) { card.querySelector("#opsph-lead-phone").focus(); return; }
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправляем…";
      fetch(API_BASE + "/api/bots/" + BOT_SLUG + "/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, phone: phone, sessionId: sessionId })
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          card.innerHTML = '<div class="opsph-lead-ok">✓ Заявка принята! Скоро с вами свяжутся.</div>';
          appendBotRow("Отлично, принял заявку! С вами скоро свяжутся.");
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Попробовать снова";
        });
    });
    var phoneInp = card.querySelector("#opsph-lead-phone");
    phoneInp.addEventListener("input", function () {
      var pos = this.selectionStart;
      var prev = this.value;
      this.value = formatPhone(this.value);
      if (pos >= prev.length) this.selectionStart = this.selectionEnd = this.value.length;
    });
    phoneInp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submitBtn.click();
    });
  }

  // ── Quick replies ─────────────────────────────────────────────────────────────
  var QUICK_REPLIES = [];

  function appendQuickReplies() {
    if (quickRepliesShown) return;
    quickRepliesShown = true;

    var container = document.createElement("div");
    container.className = "opsph-quick-replies";
    container.id = "opsph-quick-replies";

    for (var i = 0; i < QUICK_REPLIES.length; i++) {
      (function (item) {
        var chip = document.createElement("button");
        chip.className = "opsph-qr-chip";
        chip.type = "button";
        chip.textContent = item.label;
        chip.addEventListener("click", function () {
          removeQuickReplies();
          if (item.action === "tel") {
            window.location.href = item.href;
          } else {
            sendQuickReply(item.label);
          }
        });
        container.appendChild(chip);
      })(QUICK_REPLIES[i]);
    }

    msgs().appendChild(container);
    scrollToBottom();
  }

  function removeQuickReplies() {
    var el = document.getElementById("opsph-quick-replies");
    if (el) el.remove();
  }

  function sendQuickReply(text) {
    if (isStreaming) return;
    messages.push({ role: "user", content: text });
    saveSession();
    appendUserMsg(text);
    streamBot();
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────────
  function appendUserMsg(text) {
    var el = document.createElement("div");
    el.className = "opsph-msg opsph-user";
    el.textContent = text;
    msgs().appendChild(el);
    scrollToBottom();
  }

  function createBotRow() {
    var row = document.createElement("div");
    row.className = "opsph-row";
    var av = document.createElement("div");
    av.className = "opsph-row-ava";
    av.appendChild(makeAvaDom(26));
    var b = document.createElement("div");
    b.className = "opsph-msg opsph-bot";
    row.appendChild(av);
    row.appendChild(b);
    return row;
  }

  function linkify(text) {
    // Strip markdown bold/italic wrapping around URLs before escaping
    text = text.replace(/\*{1,2}(https?:\/\/[^\s*]+)\*{1,2}/g, '$1');
    text = text.replace(/_{1,2}(https?:\/\/[^\s_]+)_{1,2}/g, '$1');
    var escaped = escHtml(text);
    // Match full URLs (https://...) and bare domains (domain.ru/...)
    return escaped.replace(/(https?:\/\/[^\s<*_]+|(?<!["\w])(?:[\w-]+\.(?:ru|com|tech|io|org|net)(?:\/[^\s<*_]*)?))(?=[.,!?)\s]|$)/g, function (match) {
      var href = match.startsWith("http") ? match : "https://" + match;
      return '<a href="' + href + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">' + match + '</a>';
    });
  }

  function appendBotRow(text) {
    var row = createBotRow();
    row.querySelector(".opsph-bot").innerHTML = linkify(text);
    msgs().appendChild(row);
    scrollToBottom();
  }

  function appendTypingRow() {
    var row = document.createElement("div");
    row.className = "opsph-typing-row";
    var av = document.createElement("div");
    av.className = "opsph-row-ava";
    av.textContent = AVA_LETTER;
    var t = document.createElement("div");
    t.className = "opsph-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    row.appendChild(av);
    row.appendChild(t);
    msgs().appendChild(row);
    scrollToBottom();
    return row;
  }

  function msgs()          { return document.getElementById("opsph-msgs"); }
  function scrollToBottom(){ var m = msgs(); if (m) m.scrollTop = m.scrollHeight; }
  function setSendDisabled(v){ var b = document.getElementById("opsph-send"); if (b) b.disabled = v; }
  function escHtml(s)      { return ("" + s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function formatPhone(val) {
    var digits = val.replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    var r = "+7";
    if (digits.length > 1) r += " (" + digits.slice(1, 4);
    if (digits.length >= 4) r += ") " + digits.slice(4, 7);
    if (digits.length >= 7) r += " " + digits.slice(7, 9);
    if (digits.length >= 9) r += " " + digits.slice(9, 11);
    return r;
  }

  function sendIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  // ── Init — fetch config first, then render ────────────────────────────────────
  function render() {
    injectCSS();
    buildDOM();
    restoreMessages();
    if (GREETING_DELAY >= 0) setTimeout(showBubble, GREETING_DELAY);
  }

  function init() {
    loadSession();
    fetch(API_BASE + "/api/bots/" + BOT_SLUG + "/config")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) {
        if (cfg) {
          if (cfg.color)       COLOR      = cfg.color;
          if (cfg.title)       CHAR_NAME  = cfg.title;
          if (cfg.placeholder) script.setAttribute("data-placeholder", cfg.placeholder);
          if (Array.isArray(cfg.quick_replies) && cfg.quick_replies.length) QUICK_REPLIES = cfg.quick_replies;
          if (cfg.greeting) GREETING = cfg.greeting;
          AVA_LETTER = CHAR_NAME.charAt(0).toUpperCase();
        }
        render();
      })
      .catch(function () { render(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
