
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
Sleep, 1200

Sleep, 1000

; Ensure Notepad is active and ready
Loop, 15 {
  WinActivate, ahk_exe notepad.exe
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 100
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1") {
    break
  }
}

; Use clipboard method for reliable text entry
A_Clipboard := "hey 25 adithya"
Sleep, 100
ControlSend, Edit1, ^v, ahk_exe notepad.exe
Sleep, 500

Sleep, 300
ExitApp
