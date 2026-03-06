@echo off
REM Maven Wrapper Helper Batch File
REM This sets up the environment and runs the Maven wrapper

set "PATH=%PATH%;C:\Windows\System32\WindowsPowerShell\v1.0"
set "JAVA_HOME=C:\Program Files\Java\jdk-23.0.2"

cd /d "%~dp0"
call mvnw.cmd %*
