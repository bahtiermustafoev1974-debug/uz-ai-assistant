const chat = document.getElementById("chat");
const chatInner = document.getElementById("chatInner");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const welcome = document.getElementById("welcome");

const history = document.getElementById("history");
const newChatBtn = document.getElementById("newChat");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");

const searchInput = document.getElementById("searchInput");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

let messages = [];
let currentChatId = Date.now();
let isLoading = false;

/* =========================
   LOCAL STORAGE
========================= */

function saveMessages() {
  localStorage.setItem(
    "uzai_messages",
    JSON.stringify(messages)
  );
}

function loadMessages() {
  try {
    const saved = localStorage.getItem("uzai_messages");

    if (saved) {
      messages = JSON.parse(saved);
    }
  } catch {
    messages = [];
  }

  renderMessages();
}

function saveTheme(theme) {
  localStorage.setItem("uzai_theme", theme);
}

function loadTheme() {
  const theme = localStorage.getItem("uzai_theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
  }
}

/* =========================
   MESSAGE RENDER
========================= */

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderMessages() {
  chatInner.innerHTML = "";

  if (!messages.length) {
    chatInner.appendChild(createWelcome());
    return;
  }

  messages.forEach((msg, index) => {
    chatInner.appendChild(
      createMessage(msg.role, msg.content, index)
    );
  });

  scrollBottom();
}

function createWelcome() {
  const div = document.createElement("div");

  div.className = "welcome";

  div.innerHTML = `
    <div class="welcome-logo">U</div>

    <h1>Salom 👋</h1>

    <p>
      Men UZ AI — sizga savollar, kod, g‘oyalar
      va boshqa vazifalarda yordam beraman.
    </p>

    <div class="quick-actions">

      <button class="quick">
        💻 Kod yozib ber
      </button>

      <button class="quick">
        📚 Menga biror narsa o‘rgat
      </button>

      <button class="quick">
        💡 G‘oya ber
      </button>

      <button class="quick">
        ✍️ Matn yozib ber
      </button>

    </div>
  `;

  return div;
}

function createMessage(role, content, index) {
  const wrapper = document.createElement("div");

  wrapper.className =
    `message ${role === "user" ? "user" : "ai"}`;

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    role === "user" ? "S" : "U";

  const contentBox = document.createElement("div");

  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.innerHTML = escapeHTML(content);

  contentBox.appendChild(bubble);

  if (role === "assistant") {
    const tools = document.createElement("div");

    tools.className = "message-tools";

    tools.innerHTML = `
      <button class="tool" data-copy="${index}">
        📋 Nusxalash
      </button>

      <button class="tool" data-regenerate="${index}">
        🔄 Qayta
      </button>
    `;

    contentBox.appendChild(tools);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(contentBox);

  return wrapper;
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage(text = null) {

  if (isLoading) return;

  const message =
    text !== null
      ? text.trim()
      : messageInput.value.trim();

  if (!message) return;

  isLoading = true;
  sendBtn.disabled = true;

  if (welcome) {
    welcome.remove();
  }

  messages.push({
    role: "user",
    content: message
  });

  saveMessages();
  renderMessages();

  messageInput.value = "";
  autoResize();

  showTyping();

  try {

    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message
      })
    });

    const data = await response.json();

    removeTyping();

    if (!response.ok || !data.success) {
      throw new Error(
        data.details ||
        data.error ||
        "Server xatosi"
      );
    }

    messages.push({
      role: "assistant",
      content: data.answer
    });

    saveMessages();
    renderMessages();

  } catch (error) {

    removeTyping();

    messages.push({
      role: "assistant",
      content:
        "❌ AI bilan bog‘lanishda xatolik yuz berdi.\n\n" +
        error.message
    });

    saveMessages();
    renderMessages();

    console.error(error);

  } finally {

    isLoading = false;
    sendBtn.disabled = false;

    messageInput.focus();
  }
}

/* =========================
   TYPING
========================= */

function showTyping() {

  removeTyping();

  const wrapper = document.createElement("div");

  wrapper.id = "typingMessage";
  wrapper.className = "message ai";

  wrapper.innerHTML = `
    <div class="avatar">U</div>

    <div class="bubble">

      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  `;

  chatInner.appendChild(wrapper);

  scrollBottom();
}

function removeTyping() {
  document
    .getElementById("typingMessage")
    ?.remove();
}

/* =========================
   SCROLL
========================= */

function scrollBottom() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

/* =========================
   TEXTAREA
========================= */

function autoResize() {

  messageInput.style.height = "auto";

  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 150) + "px";
}

messageInput.addEventListener(
  "input",
  autoResize
);

messageInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  }
);

/* =========================
   SEND BUTTON
========================= */

sendBtn.addEventListener(
  "click",
  () => sendMessage()
);

/* =========================
   QUICK ACTIONS
========================= */

document.addEventListener(
  "click",
  event => {

    const quick =
      event.target.closest(".quick");

    if (!quick) return;

    sendMessage(quick.textContent);
  }
);

/* =========================
   COPY / REGENERATE
========================= */

document.addEventListener(
  "click",
  async event => {

    const copyButton =
      event.target.closest("[data-copy]");

    if (copyButton) {

      const index =
        Number(copyButton.dataset.copy);

      const text =
        messages[index]?.content;

      if (!text) return;

      await navigator.clipboard.writeText(text);

      copyButton.textContent =
        "✓ Nusxalandi";

      setTimeout(() => {
        copyButton.textContent =
          "📋 Nusxalash";
      }, 1500);
    }

    const regenerate =
      event.target.closest("[data-regenerate]");

    if (regenerate) {

      const index =
        Number(regenerate.dataset.regenerate);

      const previousUser =
        messages[index - 1];

      if (
        previousUser &&
        previousUser.role === "user"
      ) {

        messages.splice(index);

        saveMessages();

        renderMessages();

        await sendMessage(
          previousUser.content
        );
      }
    }
  }
);

/* =========================
   NEW CHAT
========================= */

newChatBtn.addEventListener(
  "click",
  () => {

    messages = [];

    currentChatId = Date.now();

    saveMessages();

    renderMessages();

    sidebar.classList.remove("open");

    messageInput.focus();
  }
);

/* =========================
   CLEAR CHAT
========================= */

clearBtn.addEventListener(
  "click",
  () => {

    if (!messages.length) return;

    const ok =
      confirm("Barcha chatlarni o‘chirishni xohlaysizmi?");

    if (!ok) return;

    messages = [];

    saveMessages();

    renderMessages();
  }
);

/* =========================
   THEME
========================= */

themeBtn.addEventListener(
  "click",
  () => {

    document.body.classList.toggle("dark");

    const dark =
      document.body.classList.contains("dark");

    themeBtn.textContent =
      dark ? "☀️" : "🌙";

    saveTheme(
      dark ? "dark" : "light"
    );
  }
);

/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  () => {

    const query =
      searchInput.value.toLowerCase().trim();

    const items =
      document.querySelectorAll(".history-item");

    items.forEach(item => {

      item.style.display =
        item.textContent
          .toLowerCase()
          .includes(query)
            ? ""
            : "none";
    });
  }
);

/* =========================
   SIDEBAR MOBILE
========================= */

menuBtn.addEventListener(
  "click",
  () => {

    sidebar.classList.toggle("open");
  }
);

/* =========================
   HISTORY
========================= */

function renderHistory() {

  history.innerHTML = "";

  if (!messages.length) {
    history.innerHTML = `
      <div
        style="
          color:var(--muted);
          font-size:12px;
          padding:10px;
        "
      >
        Hali chatlar yo‘q
      </div>
    `;

    return;
  }

  const firstUser =
    messages.find(
      message => message.role === "user"
    );

  const title =
    firstUser?.content ||
    "Yangi suhbat";

  const item =
    document.createElement("div");

  item.className =
    "history-item active";

  item.textContent = title;

  history.appendChild(item);
}

/* =========================
   INITIALIZE
========================= */

loadTheme();
loadMessages();
renderHistory();

setInterval(
  renderHistory,
  1000
);

messageInput.focus();