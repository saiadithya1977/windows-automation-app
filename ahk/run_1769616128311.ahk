
#NoTrayIcon
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2
DetectHiddenWindows, On
SetKeyDelay, 30, 30
SetControlDelay, 10

tempFile := A_AppData . "\ahk_temp.txt"
FileDelete, % tempFile

Run, notepad.exe
WinWait, ahk_exe notepad.exe
WinActivate, ahk_exe notepad.exe
Sleep, 1500

WinWait, ahk_exe notepad.exe

WinActivate, ahk_exe notepad.exe

; Write text to file for reliable input
FileAppend, Hello from Automation!, % tempFile
Sleep, 100

Sleep, 500

Click, 500, 300
Sleep, 300

Sleep, 1000
 
Send, {Tab}Test Action

Sleep, 300
FileRead, content, % tempFile
Sleep, 100
A_Clipboard := content
Sleep, 100
ControlFocus, Edit1, ahk_exe notepad.exe
Sleep, 100
ControlSend, Edit1, ^v, ahk_exe notepad.exe
Sleep, 500
FileDelete, % tempFile

Sleep, 500
ExitApp
