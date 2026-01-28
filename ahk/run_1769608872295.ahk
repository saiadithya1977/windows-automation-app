
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2
DetectHiddenWindows, On

Run, notepad.exe
WinWait, ahk_exe notepad.exe
WinActivate, ahk_exe notepad.exe
ControlFocus, Edit1, ahk_exe notepad.exe

Sleep, 1000

ControlSend, Edit1, hey adithya, ahk_exe notepad.exe
Sleep, 300

ExitApp
