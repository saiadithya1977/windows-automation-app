
  #NoTrayIcon
  SendMode Input
  SetTitleMatchMode, 2
  
        Run, notepad.exe
        WinWaitActive, ahk_exe notepad.exe
        Sleep, 300
        Sleep, 2000
Send,{Text}hey adithya manual
ExitApp
