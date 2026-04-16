(function () {
  "use strict";

  // ── Config from script tag ──────────────────────────────────────────────────
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var BOT_SLUG   = script.getAttribute("data-bot") || "default";
  var API_BASE   = script.getAttribute("data-api") || "https://optisphere.tech";
  var PRIMARY    = script.getAttribute("data-color") || null; // overrides server color
  var TITLE      = script.getAttribute("data-title") || null;
  var POSITION   = script.getAttribute("data-position") || "right"; // "right" | "left"

  // ── State ───────────────────────────────────────────────────────────────────
  var messages   = [];
  var sessionId  = "s-" + Math.random().toString(36).slice(2);
  var isOpen     = false;
  var isStreaming= false;
  var botConfig  = null; // loaded from meta endpoint (optional)

  // ── Styles ──────────────────────────────────────────────────────────────────
  var COLOR = PRIMARY || "#2563eb";

  function injectCSS() {
    var css = [
      "#opsph-btn{position:fixed;bottom:24px;" + (POSITION === "left" ? "left:24px" : "right:24px") + ";z-index:9999;width:56px;height:56px;border-radius:50%;background:" + COLOR + ";border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transition:transform .2s;}",
      "#opsph-btn:hover{transform:scale(1.1);}",
      "#opsph-btn svg{pointer-events:none;}",
      "#opsph-wrap{position:fixed;bottom:92px;" + (POSITION === "left" ? "left:16px" : "right:16px") + ";z-index:9998;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;transition:opacity .2s,transform .2s;opacity:0;transform:translateY(16px) scale(.97);pointer-events:none;}",
      "#opsph-wrap.open{opacity:1;transform:none;pointer-events:all;}",
      "#opsph-head{background:" + COLOR + ";color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}",
      "#opsph-head-title{font-weight:700;font-size:15px;font-family:system-ui,sans-serif;}",
      "#opsph-close{background:rgba(255,255,255,.2);border:none;color:#fff;cursor:pointer;border-radius:50%;width:28px;height:28px;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;}",
      "#opsph-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;font-family:system-ui,sans-serif;font-size:14px;}",
      "#opsph-msgs::-webkit-scrollbar{width:4px;}",
      "#opsph-msgs::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}",
      ".opsph-msg{max-width:82%;padding:10px 14px;border-radius:12px;line-height:1.5;word-break:break-word;white-space:pre-wrap;}",
      ".opsph-user{align-self:flex-end;background:" + COLOR + ";color:#fff;border-bottom-right-radius:4px;}",
      ".opsph-bot{align-self:flex-start;background:#f1f5f9;color:#1e293b;border-bottom-left-radius:4px;}",
      ".opsph-typing{align-self:flex-start;background:#f1f5f9;padding:10px 14px;border-radius:12px;border-bottom-left-radius:4px;}",
      ".opsph-typing span{display:inline-block;width:6px;height:6px;background:#94a3b8;border-radius:50%;margin:0 2px;animation:opsph-bounce .8s infinite;}",
      ".opsph-typing span:nth-child(2){animation-delay:.15s;}",
      ".opsph-typing span:nth-child(3){animation-delay:.3s;}",
      "@keyframes opsph-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}",
      "#opsph-form{display:flex;padding:12px;border-top:1px solid #e2e8f0;gap:8px;flex-shrink:0;}",
      "#opsph-input{flex:1;padding:9px 13px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:system-ui,sans-serif;outline:none;resize:none;min-height:38px;max-height:100px;line-height:1.4;transition:border-color .15s;}",
      "#opsph-input:focus{border-color:" + COLOR + ";}",
      "#opsph-send{width:38px;height:38px;border-radius:10px;border:none;background:" + COLOR + ";cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}",
      "#opsph-send:disabled{opacity:.5;cursor:default;}",
      "#opsph-send svg{pointer-events:none;}",
      "@media(max-width:480px){#opsph-wrap{width:calc(100vw - 20px);bottom:80px;" + (POSITION === "left" ? "left:10px" : "right:10px") + ";}#opsph-btn{bottom:18px;" + (POSITION === "left" ? "left:18px" : "right:18px") + ";}}"
    ].join("");

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  function buildDOM() {
    // Toggle button
    var btn = document.createElement("button");
    btn.id = "opsph-btn";
    btn.setAttribute("aria-label", "Открыть чат");
    btn.innerHTML = chatIcon();
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);

    // Chat window
    var wrap = document.createElement("div");
    wrap.id = "opsph-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");

    var title = TITLE || "Ассистент";

    wrap.innerHTML = [
      '<div id="opsph-head">',
        '<span id="opsph-head-title">' + escHtml(title) + '</span>',
        '<button id="opsph-close" aria-label="Закрыть">✕</button>',
      '</div>',
      '<div id="opsph-msgs" aria-live="polite"></div>',
      '<form id="opsph-form" autocomplete="off">',
        '<textarea id="opsph-input" placeholder="Напишите вопрос…" rows="1" aria-label="Введите сообщение"></textarea>',
        '<button id="opsph-send" type="submit" aria-label="Отправить">',
          sendIcon(),
        '</button>',
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
      btn.innerHTML = closeIcon();
      btn.setAttribute("aria-label", "Закрыть чат");
      if (messages.length === 0) showGreeting();
      setTimeout(function () { document.getElementById("opsph-input").focus(); }, 50);
    } else {
      wrap.classList.remove("open");
      btn.innerHTML = chatIcon();
      btn.setAttribute("aria-label", "Открыть чат");
    }
  }

  // ── Greeting ─────────────────────────────────────────────────────────────────
  function showGreeting() {
    appendBotMsg("Здравствуйте! Я AI-ассистент. Чем могу помочь?");
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
    sendMessage(text);
  }

  function sendMessage(text) {
    messages.push({ role: "user", content: text });
    appendUserMsg(text);
    streamBot();
  }

  // ── Stream ────────────────────────────────────────────────────────────────────
  function streamBot() {
    isStreaming = true;
    setSendDisabled(true);

    var typing = appendTyping();

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
        typing.remove();
        var botEl = appendBotMsgEl("");
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var full = "";

        function read() {
          reader.read().then(function (result) {
            if (result.done) {
              messages.push({ role: "assistant", content: full });
              isStreaming = false;
              setSendDisabled(false);
              return;
            }
            var chunk = decoder.decode(result.value, { stream: true });
            full += chunk;
            botEl.textContent = full;
            scrollToBottom();
            read();
          }).catch(function () {
            typing.remove();
            isStreaming = false;
            setSendDisabled(false);
          });
        }
        read();
      })
      .catch(function () {
        typing.remove();
        appendBotMsg("Произошла ошибка. Попробуйте ещё раз.");
        isStreaming = false;
        setSendDisabled(false);
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

  function appendBotMsg(text) {
    var el = appendBotMsgEl(text);
    scrollToBottom();
    return el;
  }

  function appendBotMsgEl(text) {
    var el = document.createElement("div");
    el.className = "opsph-msg opsph-bot";
    el.textContent = text;
    msgs().appendChild(el);
    scrollToBottom();
    return el;
  }

  function appendTyping() {
    var el = document.createElement("div");
    el.className = "opsph-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    msgs().appendChild(el);
    scrollToBottom();
    return el;
  }

  function msgs() { return document.getElementById("opsph-msgs"); }
  function scrollToBottom() {
    var m = msgs();
    if (m) m.scrollTop = m.scrollHeight;
  }

  function setSendDisabled(v) {
    var btn = document.getElementById("opsph-send");
    if (btn) btn.disabled = v;
  }

  function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ── Icons ─────────────────────────────────────────────────────────────────────
  function chatIcon() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.527 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  }
  function closeIcon() {
    return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  }
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
