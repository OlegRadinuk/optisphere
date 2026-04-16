(function () {
  "use strict";

  // ── Config from script tag ──────────────────────────────────────────────────
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var BOT_SLUG   = script.getAttribute("data-bot") || "default";
  var API_BASE   = script.getAttribute("data-api") || "https://optisphere.tech";
  var PRIMARY    = script.getAttribute("data-color") || null;
  var TITLE      = script.getAttribute("data-title") || null;
  var POSITION   = script.getAttribute("data-position") || "right"; // "right" | "left"
  var GREETING   = script.getAttribute("data-greeting") || null;

  // ── State ───────────────────────────────────────────────────────────────────
  var messages      = [];
  var sessionId     = "s-" + Math.random().toString(36).slice(2);
  var isOpen        = false;
  var isStreaming   = false;
  var leadFormShown = false;

  var COLOR = PRIMARY || "#0891b2";
  var CHAR_NAME = TITLE || "Ассистент";
  var AVATAR_LETTER = CHAR_NAME.charAt(0).toUpperCase();

  // ── CSS ─────────────────────────────────────────────────────────────────────
  function injectCSS() {
    var pos = POSITION === "left";
    var css = [
      // Toggle button
      "#opsph-btn{position:fixed;bottom:24px;" + (pos?"left:24px":"right:24px") + ";z-index:9999;width:60px;height:60px;border-radius:50%;background:" + COLOR + ";border:none;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}",
      "#opsph-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,0,0,.32);}",
      "#opsph-btn-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;color:#fff;font-family:system-ui,sans-serif;letter-spacing:.5px;}",
      // Chat window
      "#opsph-wrap{position:fixed;bottom:96px;" + (pos?"left:16px":"right:16px") + ";z-index:9998;width:368px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden;transition:opacity .22s,transform .22s;opacity:0;transform:translateY(18px) scale(.96);pointer-events:none;}",
      "#opsph-wrap.open{opacity:1;transform:none;pointer-events:all;}",
      // Header
      "#opsph-head{background:" + COLOR + ";padding:14px 16px 14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;}",
      "#opsph-head-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      "#opsph-head-info{flex:1;min-width:0;}",
      "#opsph-head-name{font-weight:700;font-size:15px;color:#fff;font-family:system-ui,sans-serif;}",
      "#opsph-head-status{font-size:11px;color:rgba(255,255,255,.75);font-family:system-ui,sans-serif;margin-top:1px;}",
      "#opsph-close{background:rgba(255,255,255,.15);border:none;color:#fff;cursor:pointer;border-radius:50%;width:30px;height:30px;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}",
      "#opsph-close:hover{background:rgba(255,255,255,.3);}",
      // Messages
      "#opsph-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;background:#f8fafc;}",
      "#opsph-msgs::-webkit-scrollbar{width:3px;}",
      "#opsph-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}",
      // Bot message row (avatar + bubble)
      ".opsph-row{display:flex;align-items:flex-end;gap:8px;}",
      ".opsph-row-avatar{width:28px;height:28px;border-radius:50%;background:" + COLOR + ";display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;font-family:system-ui,sans-serif;flex-shrink:0;}",
      ".opsph-msg{max-width:78%;padding:10px 14px;border-radius:14px;word-break:break-word;white-space:pre-wrap;}",
      ".opsph-user{align-self:flex-end;background:" + COLOR + ";color:#fff;border-bottom-right-radius:4px;}",
      ".opsph-bot{background:#fff;color:#1e293b;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.07);}",
      // Typing
      ".opsph-typing-row{display:flex;align-items:flex-end;gap:8px;}",
      ".opsph-typing{background:#fff;padding:12px 16px;border-radius:14px;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.07);}",
      ".opsph-typing span{display:inline-block;width:7px;height:7px;background:#94a3b8;border-radius:50%;margin:0 2px;animation:opsph-bounce .9s infinite;}",
      ".opsph-typing span:nth-child(2){animation-delay:.18s;}",
      ".opsph-typing span:nth-child(3){animation-delay:.36s;}",
      "@keyframes opsph-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}",
      // Lead form card
      ".opsph-lead-card{background:#fff;border:1.5px solid " + COLOR + ";border-radius:14px;padding:16px;margin:4px 0;box-shadow:0 2px 12px rgba(0,0,0,.08);max-width:86%;}",
      ".opsph-lead-title{font-weight:700;font-size:13px;color:#1e293b;margin-bottom:10px;font-family:system-ui,sans-serif;}",
      ".opsph-lead-input{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #e2e8f0;border-radius:9px;font-size:13px;font-family:system-ui,sans-serif;outline:none;margin-bottom:8px;transition:border-color .15s;}",
      ".opsph-lead-input:focus{border-color:" + COLOR + ";}",
      ".opsph-lead-btn{width:100%;padding:10px;border:none;border-radius:9px;background:" + COLOR + ";color:#fff;font-weight:600;font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;transition:opacity .15s;}",
      ".opsph-lead-btn:hover{opacity:.88;}",
      ".opsph-lead-btn:disabled{opacity:.5;cursor:default;}",
      ".opsph-lead-success{color:#059669;font-size:13px;font-family:system-ui,sans-serif;font-weight:600;text-align:center;padding:6px 0;}",
      // Input area
      "#opsph-form{display:flex;padding:10px 12px;border-top:1px solid #e2e8f0;gap:8px;flex-shrink:0;background:#fff;}",
      "#opsph-input{flex:1;padding:9px 13px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:system-ui,sans-serif;outline:none;resize:none;min-height:38px;max-height:100px;line-height:1.4;transition:border-color .15s;color:#1e293b;background:#f8fafc;}",
      "#opsph-input:focus{border-color:" + COLOR + ";background:#fff;}",
      "#opsph-send{width:38px;height:38px;border-radius:12px;border:none;background:" + COLOR + ";cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}",
      "#opsph-send:disabled{opacity:.45;cursor:default;}",
      // Mobile
      "@media(max-width:480px){#opsph-wrap{width:calc(100vw - 20px);bottom:88px;" + (pos?"left:10px":"right:10px") + ";}#opsph-btn{bottom:18px;" + (pos?"left:18px":"right:18px") + ";}}"
    ].join("");

    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  function buildDOM() {
    // Toggle button — avatar letter
    var btn = document.createElement("button");
    btn.id = "opsph-btn";
    btn.setAttribute("aria-label", "Открыть чат с " + CHAR_NAME);
    btn.innerHTML = '<div id="opsph-btn-avatar">' + escHtml(AVATAR_LETTER) + '</div>';
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);

    // Chat window
    var wrap = document.createElement("div");
    wrap.id = "opsph-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = [
      '<div id="opsph-head">',
        '<div id="opsph-head-avatar">' + escHtml(AVATAR_LETTER) + '</div>',
        '<div id="opsph-head-info">',
          '<div id="opsph-head-name">' + escHtml(CHAR_NAME) + '</div>',
          '<div id="opsph-head-status">● Онлайн · отвечает мгновенно</div>',
        '</div>',
        '<button id="opsph-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-msgs" aria-live="polite"></div>',
      '<form id="opsph-form" autocomplete="off">',
        '<textarea id="opsph-input" placeholder="Напишите вопрос…" rows="1" aria-label="Введите сообщение"></textarea>',
        '<button id="opsph-send" type="submit" aria-label="Отправить">' + sendIcon() + '</button>',
      '</form>'
    ].join("");
    document.body.appendChild(wrap);

    wrap.querySelector("#opsph-close").addEventListener("click", toggle);
    wrap.querySelector("#opsph-form").addEventListener("submit", onSubmit);

    var input = wrap.querySelector("#opsph-input");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        wrap.querySelector("#opsph-form").dispatchEvent(new Event("submit", { bubbles: true }));
      }
    });
    input.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 100) + "px";
    });
  }

  // ── Toggle ───────────────────────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    var wrap = document.getElementById("opsph-wrap");
    var btn  = document.getElementById("opsph-btn");
    if (isOpen) {
      wrap.classList.add("open");
      btn.innerHTML = '<div id="opsph-btn-avatar">✕</div>';
      btn.setAttribute("aria-label", "Закрыть чат");
      if (messages.length === 0) showGreeting();
      setTimeout(function () {
        var i = document.getElementById("opsph-input");
        if (i) i.focus();
      }, 60);
    } else {
      wrap.classList.remove("open");
      btn.innerHTML = '<div id="opsph-btn-avatar">' + escHtml(AVATAR_LETTER) + '</div>';
      btn.setAttribute("aria-label", "Открыть чат с " + CHAR_NAME);
    }
  }

  // ── Greeting ─────────────────────────────────────────────────────────────────
  function showGreeting() {
    var text = GREETING || ("Здравствуйте! Я " + CHAR_NAME + " — ваш медицинский ассистент. Помогу записаться к врачу или ответить на вопросы о клинике.");
    appendBotRow(text);
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  function onSubmit(e) {
    e.preventDefault();
    if (isStreaming) return;
    var input = document.getElementById("opsph-input");
    var text  = input.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "auto";
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
          reader.read().then(function (result) {
            if (result.done) {
              // Strip [SAVE_LEAD] from display, show form if present
              var cleaned = full.replace(/\[SAVE_LEAD\]/g, "").trimEnd();
              bubble.textContent = cleaned;
              messages.push({ role: "assistant", content: cleaned });
              if (full.indexOf("[SAVE_LEAD]") !== -1 && !leadFormShown) {
                showLeadForm();
              }
              isStreaming = false;
              setSendDisabled(false);
              scrollToBottom();
              return;
            }
            var chunk = decoder.decode(result.value, { stream: true });
            full += chunk;
            // Stream without the marker (hide it progressively)
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
        appendBotRow("Произошла ошибка. Попробуйте ещё раз.");
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
      if (!phone) {
        card.querySelector("#opsph-lead-phone").focus();
        return;
      }
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
          card.innerHTML = '<div class="opsph-lead-success">✓ Заявка принята! Перезвоним в ближайшее время.</div>';
          appendBotRow("Отлично! Администратор позвонит вам для подтверждения. Если хотите — можете позвонить сами: +7 (978) 788-77-22.");
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Попробовать снова";
        });
    });

    // Enter on phone submits
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
    av.className = "opsph-row-avatar";
    av.textContent = AVATAR_LETTER;
    var bubble = document.createElement("div");
    bubble.className = "opsph-msg opsph-bot";
    row.appendChild(av);
    row.appendChild(bubble);
    return row;
  }

  function appendBotRow(text) {
    var row    = createBotRow();
    var bubble = row.querySelector(".opsph-bot");
    bubble.textContent = text;
    msgs().appendChild(row);
    scrollToBottom();
    return bubble;
  }

  function appendTypingRow() {
    var row = document.createElement("div");
    row.className = "opsph-typing-row";
    var av = document.createElement("div");
    av.className = "opsph-row-avatar";
    av.textContent = AVATAR_LETTER;
    var typing = document.createElement("div");
    typing.className = "opsph-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    row.appendChild(av);
    row.appendChild(typing);
    msgs().appendChild(row);
    scrollToBottom();
    return row;
  }

  function msgs()          { return document.getElementById("opsph-msgs"); }
  function scrollToBottom(){ var m = msgs(); if (m) m.scrollTop = m.scrollHeight; }
  function setSendDisabled(v) { var b = document.getElementById("opsph-send"); if (b) b.disabled = v; }
  function escHtml(s)      { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // ── Icons ─────────────────────────────────────────────────────────────────────
  function sendIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    injectCSS();
    buildDOM();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
