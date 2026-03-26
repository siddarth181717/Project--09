/* ===== CURSOR GLOW ===== */
document.addEventListener("mousemove", e => {
  const glow = document.querySelector(".cursor-glow");
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* ===== TYPING EFFECT ===== */
const text = "Analyzing student behavior... optimizing productivity...";
let i = 0;

function typingEffect() {
  if (i < text.length) {
    document.getElementById("typingText").innerHTML += text.charAt(i);
    i++;
    setTimeout(typingEffect, 40);
  }
}
typingEffect();

/* ===== TASK SYSTEM ===== */
let tasks = [];

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  tasks.push({text: input.value, done: false});
  input.value = "";
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.text;

    li.onclick = () => {
      tasks[i].done = !tasks[i].done;
      renderTasks();
    };

    list.appendChild(li);
  });

  updateProgress();
}

/* ===== PROGRESS ===== */
function updateProgress() {
  let done = tasks.filter(t => t.done).length;
  let percent = tasks.length ? (done / tasks.length) * 100 : 0;

  document.getElementById("progress").style.width = percent + "%";
  document.getElementById("statsText").innerText = Math.round(percent) + "% Completed";
}

/* ===== TIMER ===== */
function startTimer() {
  let time = 1500;

  let interval = setInterval(() => {
    let m = Math.floor(time / 60);
    let s = time % 60;

    document.getElementById("timer").innerText =
      `${m}:${s < 10 ? '0' : ''}${s}`;

    time--;

    if (time < 0) clearInterval(interval);
  }, 1000);
}

/* ===== AI ENGINE ===== */
async function runAI() {
  const input = document.getElementById("aiInput").value;
  const output = document.getElementById("aiOutput");

  output.innerHTML = "🤖 Thinking...";

  const res = await fetch("http://localhost:3000/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();
  output.innerHTML = data.reply;

  speak(data.reply);
}
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.lang = "en-US";

  recognition.onresult = function(event) {
    const text = event.results[0][0].transcript;
    document.getElementById("aiInput").value = text;
  };

  recognition.start();
}
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 1;
  speech.pitch = 1;
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}