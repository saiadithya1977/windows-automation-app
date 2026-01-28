
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
Sleep, 800

Sleep, 1000

maxRetries := 10
retryCount := 0
Loop, % maxRetries {
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 50
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1") {
    break
  }
  retryCount++
  Sleep, 100
}
SendInput, hey adithya
Sleep, 300

Sleep, 200
ExitApp
