window.addEventListener("DOMContentLoaded", () => {
  console.log("Renderer loaded");

  const routinesDiv = document.getElementById("routines");
  const actionsDiv = document.getElementById("actions");

  const addActionBtn = document.getElementById("addAction");
  const saveRoutineBtn = document.getElementById("saveRoutine");

  // 🔒 HARD SAFETY CHECK
  if (!routinesDiv || !actionsDiv || !addActionBtn || !saveRoutineBtn) {
    console.error("❌ Required DOM elements missing");
    return;
  }

  /* ================= ADD ACTION ================= */

  addActionBtn.onclick = () => {
    const div = document.createElement("div");
    div.className = "action-box";

    div.innerHTML = `
      <select class="actionType">
        <option value="open_url">Open URL</option>
        <option value="open_app">Open App</option>
        <option value="run_command">Run Command</option>

        <!-- Phase 4.2 AHK -->
        <option value="ahk_type">AHK: Type Text</option>
        <option value="ahk_wait">AHK: Wait (ms)</option>
        <option value="ahk_run">AHK: Run Program</option>
        <option value="ahk_raw">AHK: Custom Script</option>
        <option value="ahk_hotkey">AHK Hotkey</option>
        <option value="ahk_click">AHK Click</option>
        <option value="ahk_wait_window">Wait Window</option>
        <option value="ahk_focus_window">Focus Window</option>
      </select>

      <input class="actionValue" placeholder="Value / command / script" />
      <button class="remove">Remove</button>
    `;

    div.querySelector(".remove").onclick = () => div.remove();
    actionsDiv.appendChild(div);
  };

  /* ================= SAVE ROUTINE ================= */

  saveRoutineBtn.onclick = async () => {
    const name = document.getElementById("routineName").value.trim();
    const time = document.getElementById("routineTime").value;

    const days = [
      ...document.querySelectorAll("#daySelector input:checked")
    ].map(cb => cb.value);

    if (!name || !time || days.length === 0) {
      alert("Fill name, time, and days");
      return;
    }

    const actionBoxes = document.querySelectorAll(".action-box");
    if (actionBoxes.length === 0) {
      alert("Add at least one action");
      return;
    }

    const actions = [...actionBoxes].map(box => {
      const type = box.querySelector(".actionType").value;
      const value = box.querySelector(".actionValue").value.trim();

      if (!value) {
        throw new Error("Empty action value");
      }

      // command split only for run_command
      if (type === "run_command") {
        const [cmd, ...args] = value.split(" ");
        return { type, command: cmd, args };
      }

      // ALL AHK + URL/app use value directly
      return { type, value };
    });

    await window.api.addRoutine({
      name,
      enabled: true,
      schedule: { time, days },
      actions
    });

    clearForm();
    refreshUI();
  };

  /* ================= RENDER UI ================= */

  async function refreshUI() {
    const routines = await window.api.getRoutines();
    routinesDiv.innerHTML = "";

    routines.forEach(r => {
      const div = document.createElement("div");
      div.className = "box";

      div.innerHTML = `
        <strong>${r.name}</strong><br>
        Time: ${r.schedule.time}<br>
        Days: ${r.schedule.days.join(", ")}<br>
        Actions: ${r.actions.map(a => a.type).join(", ")}<br>

        <label>
          <input type="checkbox" ${r.enabled ? "checked" : ""}>
          Enabled
        </label><br>

        <button class="run">Run Now</button>
        <button class="delete">Delete</button>
      `;

      div.querySelector(".run").onclick = () => {
        console.log(`Running routine "${r.name}" now`);
        window.api.runNow(r.id);
      };

      div.querySelector("input").onchange = e => {
        window.api.toggleRoutine(r.id, e.target.checked);
      };

      div.querySelector(".delete").onclick = async () => {
        const ok = confirm(`Delete routine "${r.name}"?`);
        if (!ok) return;
        await window.api.deleteRoutine(r.id);
        refreshUI();
      };

      routinesDiv.appendChild(div);
    });
  }

  /* ================= HELPERS ================= */

  function clearForm() {
    document.getElementById("routineName").value = "";
    document.getElementById("routineTime").value = "";
    document
      .querySelectorAll("#daySelector input")
      .forEach(cb => (cb.checked = false));
    actionsDiv.innerHTML = "";
  }

  /* ================= START ================= */

  refreshUI();
});
