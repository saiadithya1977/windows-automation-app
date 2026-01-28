
    #NoTrayIcon
    #SingleInstance Force
    SendMode Input
    SetTitleMatchMode, 2
    SetKeyDelay, 50, 50
    
        Run, notepad.exe
        WinWait, ahk_exe notepad.exe
        WinActivate, ahk_exe notepad.exe
        WinWaitActive, ahk_exe notepad.exe
        Sleep, 800
        Sleep, 500
SendInput,{Text}hey adithya Sleep, 300
Sleep, 500 
            ExitApp
