const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const AHK_PATH = "C:\\Program Files\\AutoHotkey\\AutoHotkey.exe";
const TMP_DIR = path.join(__dirname, "ahk");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

// function generateAhk(actions) {
//   // let script = `#NoTrayIcon\nSendMode Input\n`;
//     let script = `
//     #NoTrayIcon
//     #SingleInstance Force
//     SendMode Input
//     SetTitleMatchMode, 2
//     SetKeyDelay, 50, 50
//     `;

//   for (const a of actions) {
//     switch (a.type) {
//       case "ahk_type":
//         script += `SendInput,{Text}${a.value} Sleep, 300\n`;
//         break;

//       case "ahk_wait":
//         script += `Sleep, ${Number(a.value) || 1000}\n`;
//         break;

//       case "ahk_run":
//          script += `
//         Run, ${a.value}
//         WinWait, ahk_exe notepad.exe
//         WinActivate, ahk_exe notepad.exe
//         WinWaitActive, ahk_exe notepad.exe
//         Sleep, 800
//         `;
//         // script += `Run, ${a.value}\n`;
//         break;

//       case "ahk_raw":
//         script += `${a.value}\n`;
//         break;
//     }
//   }
//   script+= `Sleep, 500 
//             ExitApp\n`;
//   return script;
// }

// function generateAhk(actions) {
//   let script = `
// #NoTrayIcon
// #SingleInstance Force
// SendMode Input
// SetTitleMatchMode, 2
// DetectHiddenWindows, On
// `;

//   let notepadStarted = false;

//   for (const a of actions) {
//     switch (a.type) {

//       case "ahk_run":
//         script += `
// Run, ${a.value}
// WinWait, ahk_exe notepad.exe
// WinActivate, ahk_exe notepad.exe
// ControlFocus, Edit1, ahk_exe notepad.exe
// `;
//         notepadStarted = true;
//         break;

//       case "ahk_type":
//         script += `
// ControlSend, Edit1, ${a.value}, ahk_exe notepad.exe
// Sleep, 300
// `;
//         break;

//       case "ahk_wait":
//         script += `
// Sleep, ${Number(a.value) || 1000}
// `;
//         break;

//       case "ahk_raw":
//         script += `
// ${a.value}
// `;
//         break;
//     }
//   }

//   script += `
// ExitApp
// `;

//   return script;
// }
// function generateAhk(actions) {
//   let script = `
// #NoTrayIcon
// #SingleInstance Force
// SendMode Input
// SetTitleMatchMode, 2
// DetectHiddenWindows, On
// SetKeyDelay, 30, 30
// `;

//   let launched = false;

//   for (const a of actions) {
//     switch (a.type) {

//       case "ahk_run":
//         script += `
// Run, ${a.value}
// WinWait, ahk_exe notepad.exe
// WinActivate, ahk_exe notepad.exe
// Sleep, 700
// `;
//         launched = true;
//         break;

//       case "ahk_type":
//         script += `
// Loop {
//   ControlFocus, Edit1, ahk_exe notepad.exe
//   Sleep, 100
//   ControlGetFocus, focused, ahk_exe notepad.exe
//   if (focused = "Edit1")
//     break
// }
// SendInput, ${a.value}
// Sleep, 300
// `;
//         break;

//       case "ahk_wait":
//         script += `
// Sleep, ${Number(a.value) || 1000}
// `;
//         break;

//       case "ahk_raw":
//         script += `
// ${a.value}
// `;
//         break;
//     }
//   }

//   script += `
// ExitApp
// `;

//   return script;
// }
function generateAhk(actions) {
  let script = `
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2
DetectHiddenWindows, On
SetKeyDelay, 30, 30
SetControlDelay, 10
`;

  let launched = false;

  for (const a of actions) {
    switch (a.type) {

      case "ahk_run":
        script += `
Run, ${a.value}
WinWait, ahk_exe notepad.exe
WinActivate, ahk_exe notepad.exe
Sleep, 1500
`;
        launched = true;
        break;

      case "ahk_type":
        script += `
Loop, 20 {
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 75
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1") {
    break
  }
}
Sleep, 300
SendInput, ${a.value}
Sleep, 400
`;
        break;

      case "ahk_wait":
        script += `
Sleep, ${Number(a.value) || 1000}
`;
        break;

      case "ahk_raw":
        script += `
${a.value}
`;
        break;

      case "ahk_hotkey":
        script += ` 
${a.value}
`;
        break;

      case "ahk_click":
        script += `
Click, ${a.value}
Sleep, 300
`;
        break;

      case "ahk_wait_window":
        script += `
WinWait, ${a.value}
`;
        break;

      case "ahk_focus_window":
        script += `
WinActivate, ${a.value}
`;
        break;
    }
  }

  script += `
Sleep, 500
ExitApp
`;

  return script;
}


function runAhk(actions) {
  console.log("Running AHK actions:", actions);
  return new Promise((resolve, reject) => {
    const script = generateAhk(actions);
    const file = path.join(TMP_DIR, `run_${Date.now()}.ahk`);

    try {
      fs.writeFileSync(file, script);
      console.log("Generated AHK script:", script);
    } catch (err) {
      console.error("Failed to write AHK file:", err);
      return reject(err);
    }

    const p = spawn(AHK_PATH, [file], { windowsHide: true });

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      console.warn("AHK process timeout - killing");
      p.kill();
      reject(new Error("AHK process timeout"));
    }, 10000); // 10 second timeout

    p.stderr?.on("data", data => {
      console.error("AHK stderr:", data.toString());
    });

    p.on("exit", code => {
      clearTimeout(timeout);
      if (!timedOut) {
        if (code === 0) {
          console.log("AHK completed successfully");
          resolve();
        } else {
          console.error(`AHK failed with code ${code}`);
          reject(new Error(`AHK process exited with code ${code}`));
        }
      }
    });

    p.on("error", err => {
      clearTimeout(timeout);
      console.error("AHK spawn error:", err);
      reject(err);
    });
  });
}

module.exports = { runAhk };
