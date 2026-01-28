const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("api", {
//   getRoutines: () => ipcRenderer.invoke("get-routines"),
//   getLogs: () => ipcRenderer.invoke("get-logs"),
//   addRoutine: r => ipcRenderer.invoke("add-routine", r),
//   deleteRoutine: id => ipcRenderer.invoke("delete-routine", id),
//   toggleRoutine: (id, enabled) =>
//     ipcRenderer.invoke("toggle-routine", { id, enabled }),
//   runNow: id => ipcRenderer.invoke("run-now", id)
// });
// const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getRoutines: () => ipcRenderer.invoke("get-routines"),
  getLogs: () => ipcRenderer.invoke("get-logs"),

  addRoutine: routine =>
    ipcRenderer.invoke("add-routine", routine),

  deleteRoutine: id =>
    ipcRenderer.invoke("delete-routine", id),

  toggleRoutine: (id, enabled) =>
    ipcRenderer.invoke("toggle-routine", { id, enabled }),

  runNow: id =>
    ipcRenderer.invoke("run-now", id)   
});
