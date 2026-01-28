
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2
DetectHiddenWindows, On
SetKeyDelay, 30, 30

Run, notepad.exe
WinWait, ahk_exe notepad.exe
WinActivate, ahk_exe notepad.exe
Sleep, 700

Sleep, 1000

Loop {
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 100
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1")
    break
}
SendInput, hey adithya
Sleep, 300

ExitApp
