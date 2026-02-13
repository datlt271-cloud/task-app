const supabase = window.supabase.createClient(
  "https://klpugkhbbkmujqydaanu.supabase.co",
  "sb_publishable_6Hyze7JOr76psF3h7v1d4w_YqNTxSvF"
);

async function addTask() {
  const title = document.getElementById("taskInput").value;

  if (!title) return;

  await supabase.from("tasks").insert([
    { title: title, progress: 0, risk: 0 }
  ]);

  document.getElementById("taskInput").value = "";
  loadTasks();
}

function calculateRisk(progress, days) {
  return Math.min(100, days * 5 - progress);
}

function getRiskClass(risk) {
  if (risk > 60) return "risk-high";
  if (risk > 30) return "risk-medium";
  return "risk-low";
}

async function loadTasks() {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("taskList");
  container.innerHTML = "";

  data.forEach(task => {
    const days = Math.floor(
      (new Date() - new Date(task.created_at)) / (1000 * 60 * 60 * 24)
    );

    const risk = calculateRisk(task.progress, days);

    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <b>${task.title}</b><br>
      Progress: 
      <input type="number" min="0" max="100" value="${task.progress}" 
      onchange="updateProgress('${task.id}', this.value)">
      %<br>
      Days Open: ${days}<br>
      Risk: <span class="${getRiskClass(risk)}">${risk}</span>
    `;

    container.appendChild(div);
  });
}

async function updateProgress(id, value) {
  await supabase
    .from("tasks")
    .update({ progress: value })
    .eq("id", id);

  loadTasks();
}

loadTasks();
