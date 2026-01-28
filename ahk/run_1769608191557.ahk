
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2

Run, notepad.exe
WinWait, ahk_exe notepad.exe

Sleep, 2000

ControlSend,, hey testing, ahk_exe notepad.exe
Sleep, 300

ExitApp
