@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "MAVEN_HOME=D:\apache-maven-3.10.0-bin\apache-maven-3.10.0"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"
cd /d "%~dp0backend"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo Java 21 was not found at:
  echo %JAVA_HOME%
  echo Edit start-backend.bat and correct the JAVA_HOME path.
  pause
  exit /b 1
)
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Maven was not found at:
  echo %MAVEN_HOME%
  echo Edit start-backend.bat and correct the MAVEN_HOME path.
  pause
  exit /b 1
)
echo Starting SkillProof API. Keep this window open while using the website.
call "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run
echo.
echo SkillProof API stopped. Review the messages above if it failed to start.
pause
