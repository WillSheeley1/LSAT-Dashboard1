let points = 0;
let activities = JSON.parse(localStorage.getItem("activities")) || [];
let lastActivity = localStorage.getItem("lastActivity") || null;

function updateDashboard() {
  document.getElementById("totalPoints").textContent = points;
  updateRecordList();
  checkInactivity();
}

function logPracticeTest() {
  const score = parseInt(document.getElementById("testScore").value);
  if (score >= 165) {
    const pts = score >= 170 ? 5 : 3;
    points += pts;
    addActivity("Practice Test", `Score: ${score}`, pts);
  }
}

function logDrill() {
  const hours = parseFloat(document.getElementById("drillHours").value);
  const wrong = document.getElementById("drillWrong").value;
  if (hours > 0) {
    const pts = 5;
    points += pts;
    addActivity("Drilling", `Hours: ${hours}, Wrong: ${wrong}`, pts);
  }
}

function logSection() {
  const right = document.getElementById("sectionRight").value;
  const wrong = document.getElementById("sectionWrong").value;
  const pts = 5;
  points += pts;
  addActivity("Practice Section", `Right: ${right}, Wrong: ${wrong}`, pts);
}

function addActivity(type, detail, pts) {
  const timestamp = new Date().toISOString();
  const entry = { type, detail, pts, timestamp };
  activities.push(entry);
  lastActivity = timestamp;
  localStorage.setItem("activities", JSON.stringify(activities));
  localStorage.setItem("lastActivity", timestamp);
  updateDashboard();
}

function updateRecordList() {
  const list = document.getElementById("recordList");
  list.innerHTML = "";
  activities.slice().reverse().forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.type} - ${entry.detail} (+${entry.pts} pts)`;
    list.appendChild(li);
  });
}

function checkInactivity() {
  if (!lastActivity) return;
  const last = new Date(lastActivity);
  const now = new Date();
  const diffHours = (now - last) / 1000 / 60 / 60;
  if (diffHours > 24) {
    document.getElementById("alertBox").textContent =
      "⚠️ You haven't studied in over a day!";
  } else {
    document.getElementById("alertBox").textContent = "";
  }
}

updateDashboard();
