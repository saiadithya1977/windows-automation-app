
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

Sleep, 500

Click, 500, 300
Sleep, 300

Sleep, 1000
 
Send, {Tab}Test Action

Sleep, 300
A_Clipboard := "Hello from Automation!"
Sleep, 100
Loop, 10 {
  ControlFocus, Edit1, ahk_exe notepad.exe
  Sleep, 50
  ControlGetFocus, focused, ahk_exe notepad.exe
  if (focused = "Edit1") {
    break
  }
}
Sleep, 100
ControlSend, Edit1, ^v, ahk_exe notepad.exe
Sleep, 500

Sleep, 500
ExitApp
