// INIT ICONS
lucide.createIcons();

let completedCourses = JSON.parse(localStorage.getItem("courses")) || [];

/* PAGE NAVIGATION */
function showPage(pageId) {
  let pages = document.querySelectorAll(".page");
  let items = document.querySelectorAll(".sidebar li");

  pages.forEach(p => p.style.display = "none");
  items.forEach(i => i.classList.remove("active"));

  document.getElementById(pageId).style.display = "block";

  event.target.classList.add("active");
}

/* COURSES */
function completeCourse(name) {
  if (!completedCourses.includes(name)) {
    completedCourses.push(name);
    localStorage.setItem("courses", JSON.stringify(completedCourses));
    addPoints(20);
    alert(name + " completed!");
    updateProgress();
  }
}

function addPoints(x){
  pts = parseInt(localStorage.getItem("points")) || 0;
  pts += x;
  localStorage.setItem("points", pts);
  document.getElementById("points").innerText = pts;
}

function updateProgress() {
  let count = completedCourses.length;
  document.getElementById("progressText").innerText =
    count + " Courses Completed";
}

updateProgress();

/* SETTINGS */
function saveSettings() {
  let newName = document.getElementById("newName").value;
  localStorage.setItem("user", newName);
  alert("Name updated!");
}

function logout() {
  localStorage.clear();
  location.reload();
}

/* DARK MODE */
function toggleDark() {
  document.body.classList.toggle("dark");
}

/* PROFILE DROPDOWN */
function toggleProfile() {
  let menu = document.getElementById("profileMenu");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/* NOTIFICATIONS */
function toggleNotif() {
  let panel = document.getElementById("notifPanel");
  panel.style.display = (panel.style.display === "block") ? "none" : "block";
}

/* CHART */
let chart;

function loadChart() {
  const ctx = document.getElementById('myChart');

  let data = JSON.parse(localStorage.getItem("studyData")) || [2,3,1,4,2];

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri'],
      datasets: [{
        label: 'Study Hours',
        data: data,
        borderWidth: 3,
        tension: 0.4
      }]
    }
  });
}

loadChart();

function updateChart() {
  let data = JSON.parse(localStorage.getItem("studyData")) || [2,3,1,4,2];
  
  data.push(Math.floor(Math.random()*5)+1);
  data.shift();

  localStorage.setItem("studyData", JSON.stringify(data));

  chart.data.datasets[0].data = data;
  chart.update();
}

updateChart();

/* CERTIFICATE */
function generateCertificate() {
  let name = localStorage.getItem("user") || "Student";
  let courses = completedCourses.join(", ");

  let text = `
  Certificate of Completion

  This is to certify that ${name}
  has successfully completed:
  ${courses}
  `;

  let blob = new Blob([text], { type: "text/plain" });
  let link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "certificate.txt";
  link.click();
}

/* Q&A */
function answer() {
  let q = document.getElementById("question").value.toLowerCase();
  let res = "";

  if(q.includes("python")){
    res = "Python is a programming language used for AI, web, and data science.";
  }
  else if(q.includes("html")){
    res = "HTML is used to structure web pages.";
  }
  else if(q.includes("css")){
    res = "CSS is used to style websites.";
  }
  else{
    res = "This topic is important. Try breaking it into smaller concepts.";
  }

  document.getElementById("response").innerText = res;
  addPoints(5);
}

/* WELCOME MESSAGE */
if(document.getElementById("welcome")) {
  document.getElementById("welcome").innerText =
    "Welcome, " + (localStorage.getItem("user") || "User");
}