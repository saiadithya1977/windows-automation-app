
  #NoTrayIcon
  SendMode Input
  SetTitleMatchMode, 2
  
        Run, notepad.exe
        WinWaitActive, ahk_exe notepad.exe
        Sleep, 300
        Sleep, 500
Send,{Text}hey adithya
ExitApp
