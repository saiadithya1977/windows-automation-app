const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { runAhk } = require("./ahkRunner");

/* ================= CONFIG ================= */

const BACKEND_URL = "http://localhost:4000";
const USER_ID = "test-user-123";

let win = null;
let tray = null;
let isQuitting = false;
let routines = [];

/* ================= API HELPER ================= */

async function api(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${url} → ${text}`);
  }
  return res.json();
}

const fetchRoutines = () => api(`${BACKEND_URL}/routines/${USER_ID}`);
const fetchLogs = () => api(`${BACKEND_URL}/logs/${USER_ID}`);

const createRoutine = routine =>
  api(`${BACKEND_URL}/routines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine)
  });

const deleteRoutine = id =>
  api(`${BACKEND_URL}/routines/${id}`, { method: "DELETE" });

const toggleRoutine = (id, enabled) =>
  api(`${BACKEND_URL}/routines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled })
  });

const writeLog = payload =>
  api(`${BACKEND_URL}/logs/${USER_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

/* ================= MAPPING ================= */

function mapRoutine(r) {
  return {
    id: r.id,
    name: r.name,
    enabled: !!r.enabled,
    schedule: {
      time: r.time ?? "",
      days: Array.isArray(r.days) ? r.days : []
    },
    actions: (r.actions || []).map(a =>
      a.type === "run_command"
        ? { type: a.type, command: a.value, args: a.args || [] }
        : { type: a.type, value: a.value }
    ),
    lastRunAt: r.lastRunAt ?? null
  };
}

/* ================= EXECUTION ================= */

function executeAction(action) {
  console.log("Executing action:", action);

  if (action.type === "open_url") {
    shell.openExternal(action.value);
  }

  if (action.type === "open_app") {
    spawn(action.value, [], { shell: true });
  }

  if (action.type === "run_command") {
    spawn(action.command, action.args || [], { shell: true });
  }

  return Promise.resolve();
}

function hasRunThisMinute(routine, now) {
  if (!routine.lastRunAt) return false;
  const last = new Date(routine.lastRunAt);
  return (
    last.getHours() === now.getHours() &&
    last.getMinutes() === now.getMinutes()
  );
}

// async function executeRoutine(routine, source = "scheduler") {
//   console.log(`Executing routine "${routine.name}" from ${source}`);

//   if (!routine.enabled) return;

//   const now = new Date();
//   // if (source === "scheduler" && hasRunThisMinute(routine, now)) return;
//   if(hasRunThisMinute(routine, now)) return;

//   try {

//     routine.lastRunAt = now.toISOString();
//     // 1️⃣ Run NON-AHK actions
//     for (const action of routine.actions) {
//       if (!action.type.startsWith("ahk_")) {
//         executeAction(action);
//       }
//     }

//     // 2️⃣ Run AHK actions ONCE
//     const ahkActions = routine.actions.filter(a =>
//       a.type.startsWith("ahk_")
//     );

//     if (ahkActions.length > 0) {
//       console.log("Running AHK actions:", ahkActions);
//       await runAhk(ahkActions);
//     }

    

//     await writeLog({
//       routineId: routine.id,
//       actionType: "routine",
//       status: "success",
//       message: source
//     });

//   } catch (err) {
//     console.error("Routine failed:", err);
//     await writeLog({
//       routineId: routine.id,
//       actionType: "routine",
//       status: "failed",
//       message: err.message || "Execution failed"
//     });
//   }
// }
// async function executeRoutine(routine, source = "scheduler") {
//   console.log(`Executing routine "${routine.name}" from ${source}`);

//   if (!routine.enabled) return;

//   const now = new Date();

//   // 🔒 HARD LOCK: one execution per minute
//   if (hasRunThisMinute(routine, now)) {
//     console.log("⛔ Skipped (already ran this minute)");
//     return;
//   }

//   // 🔐 LOCK IMMEDIATELY
//   routine.lastRunAt = now.toISOString();

//   try {
//     const normalActions = [];
//     const ahkActions = [];

//     for (const action of routine.actions) {
//       if (action.type.startsWith("ahk_")) {
//         ahkActions.push(action);
//       } else {
//         normalActions.push(action);
//       }
//     }

//     // 1️⃣ Execute normal actions
//     for (const action of normalActions) {
//       executeAction(action);
//     }

//     // 2️⃣ Execute AHK actions ONCE
//     if (ahkActions.length > 0) {
//       await runAhk(ahkActions);
//     }

//     await writeLog({
//       routineId: routine.id,
//       actionType: "routine",
//       status: "success",
//       message: source
//     });

//   } catch (err) {
//     await writeLog({
//       routineId: routine.id,
//       actionType: "routine",
//       status: "failed",
//       message: err.message || "Execution failed"
//     });
//   }
// }
async function executeRoutine(routine, source = "scheduler") {

  if (!routine.enabled) return;

  try {
    console.log(`▶ Executing "${routine.name}" [${source}]`);

    // Separate AHK and non-AHK actions
    const ahkActions = routine.actions.filter(a => a.type.startsWith("ahk_"));
    const normalActions = routine.actions.filter(a => !a.type.startsWith("ahk_"));

    // Run normal actions
    for (const action of normalActions) {
      await executeAction(action);
    }

    // Run AHK ONCE
    if (ahkActions.length > 0) {
      await runAhk(ahkActions);
    }

    routine.lastRunAt = new Date().toISOString();

    await writeLog({
      routineId: routine.id,
      actionType: "routine",
      status: "success",
      message: source
    });

  } catch (err) {
    await writeLog({
      routineId: routine.id,
      actionType: "routine",
      status: "failed",
      message: err.message
    });
  }
}



/* ================= SCHEDULER ================= */

function startScheduler() {
  const executedRoutines = new Map(); // Track routines by ID + minute
  
  setInterval(() => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const day = now.toLocaleString("en-US", { weekday: "short" });
    const currentMinute = `${time}_${day}`; // Unique key per minute

    routines.forEach(routine => {
      if (routine.enabled &&
          routine.schedule.time === time &&
          routine.schedule.days.includes(day)
      ) {
        const execKey = `${routine.id}_${currentMinute}`;
        
        // Only execute if NOT already executed this minute
        if (!executedRoutines.has(execKey)) {
          executedRoutines.set(execKey, true);
          executeRoutine(routine, "scheduler");
          
          // Clean up old entries
          for (const [key] of executedRoutines) {
            if (!key.includes(currentMinute)) {
              executedRoutines.delete(key);
            }
          }
        }
      }
    });
  }, 1000);
}

/* ================= WINDOW ================= */

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("main.html");

  win.on("close", e => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, "assets", "tray.ico"));
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open", click: () => win.show() },
      { label: "Quit", click: () => { isQuitting = true; app.quit(); } }
    ])
  );
}

/* ================= IPC ================= */

ipcMain.handle("get-routines", async () => {
  routines = (await fetchRoutines()).map(mapRoutine);
  return routines;
});

ipcMain.handle("get-logs", fetchLogs);

ipcMain.handle("add-routine", async (_, routine) => {
  await createRoutine(routine);
  routines = (await fetchRoutines()).map(mapRoutine);
  return routines;
});

ipcMain.handle("delete-routine", async (_, id) => {
  await deleteRoutine(id);
  routines = (await fetchRoutines()).map(mapRoutine);
  return routines;
});

ipcMain.handle("toggle-routine", async (_, { id, enabled }) => {
  await toggleRoutine(id, enabled);
  routines = (await fetchRoutines()).map(mapRoutine);
  return routines;
});

ipcMain.handle("run-now", async (_, id) => {
  const routine = routines.find(r => r.id === id);
  if (routine) await executeRoutine(routine, "manual");
});

/* ================= START ================= */

app.whenReady().then(async () => {
  createWindow();
  createTray();
  routines = (await fetchRoutines()).map(mapRoutine);
  startScheduler();
});
