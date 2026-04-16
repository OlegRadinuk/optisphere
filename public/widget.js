(function () {
  "use strict";

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName("script");
    return s[s.length - 1];
  })();

  var BOT_SLUG = script.getAttribute("data-bot")      || "default";
  var API_BASE = script.getAttribute("data-api")      || "https://optisphere.tech";
  var PRIMARY  = script.getAttribute("data-color")    || null;
  var TITLE    = script.getAttribute("data-title")    || null;
  var POSITION = script.getAttribute("data-position") || "right";
  var BOTTOM   = parseInt(script.getAttribute("data-bottom") || "24", 10);
  var GREETING_DELAY = parseInt(script.getAttribute("data-greeting-delay") || "3000", 10);

  var COLOR     = PRIMARY || "#e85d04";
  var CHAR_NAME = TITLE   || "Альба";
  var AVA_LETTER = CHAR_NAME.charAt(0).toUpperCase();

  var messages      = [];
  var sessionId     = "s-" + Math.random().toString(36).slice(2);
  var isOpen        = false;
  var isStreaming   = false;
  var leadFormShown = false;
  var bubbleDismissed = false;

  var PILL_H    = 48;
  var BTN_RIGHT = POSITION === "left" ? "auto" : "20px";
  var BTN_LEFT  = POSITION === "left" ? "20px" : "auto";

  // ── CSS ─────────────────────────────────────────────────────────────────────
  function injectCSS() {
    var isLeft = POSITION === "left";
    var css = [
      // Pill button
      "#opsph-btn{position:fixed;bottom:" + BOTTOM + "px;" + (isLeft ? "left:20px" : "right:20px") + ";z-index:9999;height:" + PILL_H + "px;padding:0 18px 0 10px;border-radius:24px;background:" + COLOR + ";border:none;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.22);display:flex;align-items:center;gap:9px;transition:transform .2s,box-shadow .2s;}",
      "#opsph-btn:hover{transform:scale(1.05);box-shadow:0 6px 24px rgba(0,0,0,.3);}",
      "#opsph-btn-ava{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-btn-label{font-weight:700;font-size:14px;color:#fff;font-family:system-ui,sans-serif;letter-spacing:.2px;white-space:nowrap;}",
      // Greeting bubble
      "#opsph-bubble{position:fixed;bottom:" + (BOTTOM + PILL_H + 10) + "px;" + (isLeft ? "left:20px" : "right:20px") + ";z-index:9998;background:#fff;border-radius:16px;border-bottom-" + (isLeft ? "left" : "right") + "-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,.13);padding:14px 16px 14px 14px;max-width:260px;display:flex;flex-direction:column;gap:8px;animation:opsph-pop .3s ease;border:1.5px solid #f0f0f0;}",
      "#opsph-bubble.hide{display:none;}",
      "@keyframes opsph-pop{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}",
      "#opsph-bubble-head{display:flex;align-items:center;gap:8px;}",
      "#opsph-bubble-ava{width:30px;height:30px;border-radius:50%;background:" + COLOR + ";display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-bubble-name{font-weight:700;font-size:13px;color:#1e293b;font-family:system-ui,sans-serif;}",
      "#opsph-bubble-close{margin-left:auto;width:20px;height:20px;border:none;background:none;cursor:pointer;color:#94a3b8;font-size:16px;padding:0;line-height:1;display:flex;align-items:center;justify-content:center;}",
      "#opsph-bubble-text{font-size:13px;color:#334155;font-family:system-ui,sans-serif;line-height:1.5;}",
      "#opsph-bubble-cta{background:" + COLOR + ";color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;font-family:system-ui,sans-serif;cursor:pointer;transition:opacity .15s;text-align:left;}",
      "#opsph-bubble-cta:hover{opacity:.88;}",
      // Chat window
      "#opsph-wrap{position:fixed;bottom:" + (BOTTOM + PILL_H + 12) + "px;" + (isLeft ? "left:16px" : "right:16px") + ";z-index:9997;width:368px;max-width:calc(100vw - 32px);height:530px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden;transition:opacity .22s,transform .22s;opacity:0;transform:translateY(14px) scale(.97);pointer-events:none;}",
      "#opsph-wrap.open{opacity:1;transform:none;pointer-events:all;}",
      // Header
      "#opsph-head{background:" + COLOR + ";padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}",
      "#opsph-head-ava{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-head-info{flex:1;min-width:0;}",
      "#opsph-head-name{font-weight:700;font-size:15px;color:#fff;font-family:system-ui,sans-serif;}",
      "#opsph-head-sub{font-size:11px;color:rgba(255,255,255,.75);font-family:system-ui,sans-serif;margin-top:1px;}",
      "#opsph-close{background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;border-radius:50%;width:30px;height:30px;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
      "#opsph-close:hover{background:rgba(255,255,255,.28);}",
      // Messages
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
      // Lead form
      ".opsph-lead-card{background:#fff;border:1.5px solid " + COLOR + ";border-radius:14px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.07);max-width:86%;}",
      ".opsph-lead-title{font-weight:700;font-size:13px;color:#1e293b;margin-bottom:10px;font-family:system-ui,sans-serif;}",
      ".opsph-lead-input{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #e2e8f0;border-radius:9px;font-size:13px;font-family:system-ui,sans-serif;outline:none;margin-bottom:8px;transition:border-color .15s;}",
      ".opsph-lead-input:focus{border-color:" + COLOR + ";}",
      ".opsph-lead-btn{width:100%;padding:9px;border:none;border-radius:9px;background:" + COLOR + ";color:#fff;font-weight:600;font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;}",
      ".opsph-lead-btn:disabled{opacity:.5;cursor:default;}",
      ".opsph-lead-ok{color:#059669;font-size:13px;font-family:system-ui,sans-serif;font-weight:600;text-align:center;padding:6px 0;}",
      // Input
      "#opsph-form{display:flex;padding:10px 12px;border-top:1px solid #e2e8f0;gap:8px;flex-shrink:0;background:#fff;}",
      "#opsph-input{flex:1;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:system-ui,sans-serif;outline:none;resize:none;min-height:38px;max-height:96px;line-height:1.4;transition:border-color .15s;color:#1e293b;background:#f8fafc;}",
      "#opsph-input:focus{border-color:" + COLOR + ";background:#fff;}",
      "#opsph-send{width:38px;height:38px;border-radius:12px;border:none;background:" + COLOR + ";cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
      "#opsph-send:disabled{opacity:.45;cursor:default;}",
      "@media(max-width:480px){#opsph-wrap{width:calc(100vw - 20px);}#opsph-btn{" + (isLeft?"left:12px":"right:12px") + "}#opsph-bubble{" + (isLeft?"left:12px":"right:12px") + ";max-width:calc(100vw - 40px);}}"
    ].join("");

    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  function buildDOM() {
    // Pill button
    var btn = document.createElement("button");
    btn.id = "opsph-btn";
    btn.setAttribute("aria-label", "Чат с " + CHAR_NAME);
    btn.innerHTML =
      '<div id="opsph-btn-ava">' + escHtml(AVA_LETTER) + '</div>' +
      '<span id="opsph-btn-label">' + escHtml(CHAR_NAME) + '</span>';
    btn.addEventListener("click", function () {
      hideBubble();
      toggle();
    });
    document.body.appendChild(btn);

    // Chat window
    var wrap = document.createElement("div");
    wrap.id = "opsph-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = [
      '<div id="opsph-head">',
        '<div id="opsph-head-ava">' + escHtml(AVA_LETTER) + '</div>',
        '<div id="opsph-head-info">',
          '<div id="opsph-head-name">' + escHtml(CHAR_NAME) + '</div>',
          '<div id="opsph-head-sub">● Онлайн · ИИ-ассистент клиники</div>',
        '</div>',
        '<button id="opsph-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-msgs" aria-live="polite"></div>',
      '<form id="opsph-form" autocomplete="off">',
        '<textarea id="opsph-input" placeholder="Напишите вопрос…" rows="1"></textarea>',
        '<button id="opsph-send" type="submit">' + sendIcon() + '</button>',
      '</form>'
    ].join("");
    document.body.appendChild(wrap);

    wrap.querySelector("#opsph-close").addEventListener("click", toggle);
    wrap.querySelector("#opsph-form").addEventListener("submit", onSubmit);
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
        '<div id="opsph-bubble-ava">' + escHtml(AVA_LETTER) + '</div>',
        '<span id="opsph-bubble-name">' + escHtml(CHAR_NAME) + '</span>',
        '<button id="opsph-bubble-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-bubble-text">Здравствуйте! Я ' + escHtml(CHAR_NAME) + ' — ИИ-ассистент клиники 👋<br>Помогу с вопросами о врачах, записи на приём или симптомах.</div>',
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
    appendBotRow(
      "Здравствуйте! Я " + CHAR_NAME + " — ИИ-ассистент клиники Альба Мед. 👋\n\n" +
      "Помогу:\n• Разобраться с симптомами → к какому врачу идти\n• Записаться на приём\n• Узнать адрес, часы работы\n\nКакой у вас вопрос?"
    );
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
    messages.push({ role: "user", content: text });
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
      body: JSON.stringify({ messages: messages, sessionId: sessionId }),
      credentials: "include"
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
              var cleaned = full.replace(/\[SAVE_LEAD\]/g, "").trimEnd();
              bubble.textContent = cleaned;
              messages.push({ role: "assistant", content: cleaned });
              if (full.indexOf("[SAVE_LEAD]") !== -1 && !leadFormShown) showLeadForm();
              isStreaming = false;
              setSendDisabled(false);
              scrollToBottom();
              return;
            }
            var chunk = decoder.decode(r.value, { stream: true });
            full += chunk;
            bubble.textContent = full.replace(/\[SAVE_LEAD\]/g, "");
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
        appendBotRow("Произошла ошибка соединения. Попробуйте ещё раз или позвоните: +7 (978) 788-77-22");
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
      '<div class="opsph-lead-title">📋 Записаться на приём</div>',
      '<input class="opsph-lead-input" id="opsph-lead-name" type="text" placeholder="Ваше имя" autocomplete="name">',
      '<input class="opsph-lead-input" id="opsph-lead-phone" type="tel" placeholder="Телефон *" autocomplete="tel">',
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
        body: JSON.stringify({ name: name, phone: phone, sessionId: sessionId }),
        credentials: "include"
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          card.innerHTML = '<div class="opsph-lead-ok">✓ Заявка принята! Перезвоним в ближайшее время.</div>';
          appendBotRow("Отлично, записала! Администратор свяжется с вами. Если удобнее — звоните сами: +7 (978) 788-77-22.");
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Попробовать снова";
        });
    });
    card.querySelector("#opsph-lead-phone").addEventListener("keydown", function (e) {
      if (e.key === "Enter") submitBtn.click();
    });
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
    av.textContent = AVA_LETTER;
    var b = document.createElement("div");
    b.className = "opsph-msg opsph-bot";
    row.appendChild(av);
    row.appendChild(b);
    return row;
  }

  function appendBotRow(text) {
    var row = createBotRow();
    row.querySelector(".opsph-bot").textContent = text;
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

  function sendIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    injectCSS();
    buildDOM();
    if (GREETING_DELAY >= 0) {
      setTimeout(showBubble, GREETING_DELAY);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
