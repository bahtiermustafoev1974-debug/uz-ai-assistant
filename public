const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");

const historyBox = document.getElementById("history");
const searchInput = document.getElementById("searchInput");

const newChat = document.getElementById("newChat");
const newChatTop = document.getElementById("newChatTop");

const themeBtn = document.getElementById("themeBtn");
const themeTop = document.getElementById("themeTop");

const clearAll = document.getElementById("clearAll");

const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");

const CHATS_KEY = "uz_ai_chats";
const THEME_KEY = "uz_ai_theme";

let chats = [];
let currentChatId = null;


/* ID */

function id() {
  return Date.now() + "-" + Math.random()
    .toString(36)
    .slice(2);
}


/* CURRENT CHAT */

function currentChat() {
  return chats.find(x => x.id === currentChatId);
}


/* SAVE */

function save() {
  localStorage.setItem(
    CHATS_KEY,
    JSON.stringify(chats)
  );
}


/* NEW CHAT */

function createChat() {

  const newChatData = {
    id: id(),
    title: "Yangi chat",
    messages: [
      {
        type: "ai",
        text: "Salom! Men UZ AI. Sizga qanday yordam bera olaman? 😊"
      }
    ]
  };

  chats.unshift(newChatData);

  currentChatId = newChatData.id;

  save();

  renderHistory();
  renderChat();
}


/* LOAD */

function load() {

  const saved =
    localStorage.getItem(CHATS_KEY);

  if (saved) {

    try {
      chats = JSON.parse(saved);
    } catch {
      chats = [];
    }

  }

  if (!chats.length) {

    createChat();

  } else {

    currentChatId = chats[0].id;

    renderHistory();
    renderChat();

  }
}


/* HISTORY */

function renderHistory(filter = "") {

  historyBox.innerHTML = "";

  chats
    .filter(x =>
      x.title
        .toLowerCase()
        .includes(filter.toLowerCase())
    )
    .forEach(item => {

      const row =
        document.createElement("div");

      row.className = "history-item";

      if (item.id === currentChatId) {
        row.classList.add("active");
      }

      const name =
        document.createElement("span");

      name.className = "history-name";

      name.textContent =
        "💬 " + item.title;

      const del =
        document.createElement("button");

      del.className =
        "delete-chat";

      del.textContent = "×";

      del.onclick = e => {

        e.stopPropagation();

        chats =
          chats.filter(x =>
            x.id !== item.id
          );

        if (!chats.length) {

          createChat();
          return;

        }

        if (currentChatId === item.id) {
          currentChatId = chats[0].id;
        }

        save();

        renderHistory();
        renderChat();

      };

      row.appendChild(name);
      row.appendChild(del);

      row.onclick = () => {

        currentChatId = item.id;

        renderHistory();
        renderChat();

        sidebar.classList.remove("open");

      };

      historyBox.appendChild(row);

    });
}


/* CHAT */

function renderChat() {

  const current = currentChat();

  if (!current) return;

  chat.innerHTML = "";

  current.messages.forEach(m => {

    addMessage(
      m.text,
      m.type,
      false
    );

  });

  chat.scrollTop =
    chat.scrollHeight;
}


/* MARKDOWN */

function formatText(text) {

  const parts =
    text.split(/```([\s\S]*?)```/g);

  let html = "";

  parts.forEach((part, index) => {

    if (index % 2 === 1) {

      const lines =
        part.split("\n");

      let language = "code";

      if (
        lines[0] &&
        lines[0].trim().length < 20
      ) {

        language =
          lines.shift().trim() || "code";

      }

      const code =
        lines.join("\n");

      const safe =
        code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      html += `
        <div class="code-box">

          <div class="code-head">

            <span>${language}</span>

            <button
              class="code-copy"
              onclick="copyCode(this)">
              📋 Copy
            </button>

          </div>

          <pre class="code-content">${safe}</pre>

        </div>
      `;

    } else {

      const safe =
        part
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      html += safe;

    }

  });

  return html;
}


/* ADD MESSAGE */

function addMessage(
  text,
  type,
  saveMessage = true
) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${type}`;

  const avatar =
    document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    type === "user"
      ? "👤"
      : "🤖";

  const content =
    document.createElement("div");

  content.className =
    "message-content";

  const name =
    document.createElement("div");

  name.className =
    "message-name";

  name.textContent =
    type === "user"
      ? "Siz"
      : "UZ AI";

  const textBox =
    document.createElement("div");

  textBox.className =
    "message-text";

  if (type === "ai") {

    textBox.innerHTML =
      formatText(text);

  } else {

    textBox.textContent =
      text;

  }

  content.appendChild(name);
  content.appendChild(textBox);

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);

  chat.appendChild(wrapper);

  if (saveMessage) {

    const current =
      currentChat();

    if (!current) return;

    current.messages.push({
      type,
      text
    });

    if (
      type === "user" &&
      current.title === "Yangi chat"
    ) {

      current.title =
        text.substring(0, 30);

      if (text.length > 30) {
        current.title += "...";
      }

    }

    save();
    renderHistory();

  }

  chat.scrollTop =
    chat.scrollHeight;
}


/* COPY CODE */

window.copyCode =
  async function(button) {

    const code =
      button
        .closest(".code-box")
        .querySelector(".code-content")
        .innerText;

    await navigator.clipboard.writeText(code);

    button.textContent =
      "✅ Nusxalandi";

    setTimeout(() => {

      button.textContent =
        "📋 Copy";

    }, 1500);
  };


/* TYPING */

function showTyping() {

  const typing =
    document.createElement("div");

  typing.id =
    "typingMessage";

  typing.className =
    "message ai";

  typing.innerHTML = `
    <div class="avatar">🤖</div>

    <div class="message-content">

      <div class="message-name">
        UZ AI
      </div>

      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  `;

  chat.appendChild(typing);

  chat.scrollTop =
    chat.scrollHeight;
}


/* SEND */

async function sendMessage() {

  const message =
    input.value.trim();

  if (!message) return;

  addMessage(
    message,
    "user"
  );

  input.value = "";

  showTyping();

  try {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          message
        })

      });


    const data =
      await response.json();


    const typing =
      document.getElementById(
        "typingMessage"
      );

    if (typing) {
      typing.remove();
    }


    const reply =
      data.reply ||
      "Javob kelmadi.";

    addMessage(
      reply,
      "ai"
    );


  } catch (error) {

    console.error(error);

    const typing =
      document.getElementById(
        "typingMessage"
      );

    if (typing) {
      typing.remove();
    }

    addMessage(
      "Server bilan bog‘lanishda xatolik.",
      "ai"
    );

  }
}


/* BUTTONS */

send.onclick =
  sendMessage;

newChat.onclick =
  createChat;

newChatTop.onclick =
  createChat;


/* ENTER */

input.addEventListener(
  "keydown",
  e => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();

    }

  }
);


/* SEARCH */

searchInput.addEventListener(
  "input",
  () => {

    renderHistory(
      searchInput.value
    );

  }
);


/* THEME */

function updateTheme() {

  const light =
    document.body.classList.contains(
      "light"
    );

  themeBtn.textContent =
    light ? "🌙" : "☀️";

  themeTop.textContent =
    light ? "🌙" : "☀️";
}


function toggleTheme() {

  document.body.classList.toggle(
    "light"
  );

  localStorage.setItem(
    THEME_KEY,
    document.body.classList.contains(
      "light"
    )
      ? "light"
      : "dark"
  );

  updateTheme();
}


themeBtn.onclick =
  toggleTheme;

themeTop.onclick =
  toggleTheme;


/* SAVED THEME */

if (
  localStorage.getItem(
    THEME_KEY
  ) === "light"
) {

  document.body.classList.add(
    "light"
  );

}

updateTheme();


/* CLEAR ALL */

clearAll.onclick =
  () => {

    if (
      !confirm(
        "Barcha chatlarni o‘chirishni xohlaysizmi?"
      )
    ) return;

    localStorage.removeItem(
      CHATS_KEY
    );

    chats = [];

    createChat();

  };


/* MOBILE */

mobileMenu.onclick =
  () => {

    sidebar.classList.toggle(
      "open"
    );

  };


/* START */

load();

input.focus();
