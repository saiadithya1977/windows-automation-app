
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2
DetectHiddenWindows, On
SetKeyDelay, 30, 30
SetControlDelay, 10

Run, notepad.exe
WinWait, ahk_exe notepad.exe
WinActivate, ahk_exe notepad.exe
Sleep, 1500

WinWait, ahk_exe notepad.exe

WinActivate, ahk_exe notepad.exe

Loop, 20 {
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 75
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1") {
    break
  }
}
Sleep, 300
SendInput, Hello from Automation!
Sleep, 400

Sleep, 500

Click, 500, 300
Sleep, 300

Sleep, 1000
 
Send, {Tab}Test Action

Sleep, 500
ExitApp
