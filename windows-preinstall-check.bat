@echo off
setlocal EnableDelayedExpansion
title ASynX Pre-Installation Checker

echo ====================================================================
echo                ASynX Pre-Installation System Checker
echo ====================================================================
echo.

set PASSED=1

echo [*] Checking Windows Architecture and OS Version...
for /f "tokens=4-5 delims=. " %%i in ('ver') do set WIN_VER=%%i.%%j
echo     - OS Version detected: %WIN_VER%
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo     - Architecture: 64-bit [OK]
) else (
    echo     - Architecture: %PROCESSOR_ARCHITECTURE%
    echo     - WARNING: ASynX Electron builds target x64. You may encounter issues on x86.
)
echo.

echo [*] Verifying APPDATA Write Permissions (Database Persistence)...
set "TEST_FILE=%APPDATA%\asynx_precheck_test.tmp"
echo test > "%TEST_FILE%" 2>nul
if exist "%TEST_FILE%" (
    echo     - Write access verified to %APPDATA%
    echo     - Status: [OK]
    del "%TEST_FILE%"
) else (
    echo     - ERROR: Cannot write to %APPDATA%. ASynX local encrypted database requires this.
    echo     - Status: [FAIL]
    set PASSED=0
)
echo.

echo [*] Checking Registry: Pending System Reboots...
reg query "HKLM\System\CurrentControlSet\Control\Session Manager" /v PendingFileRenameOperations >nul 2>&1
if %errorlevel% equ 0 (
    echo     - WARNING: A pending reboot is flagged in the Windows Registry.
    echo     - NSIS Installer may block or fail until you restart your PC.
    echo     - Status: [WARN]
) else (
    echo     - No pending system reboots detected in Registry.
    echo     - Status: [OK]
)
echo.

echo [*] Checking Registry: Visual C++ Redistributable (x64)...
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" /v Installed >nul 2>&1
if %errorlevel% equ 0 (
    echo     - Microsoft Visual C++ 2015-2022 Redistributable (x64) found.
    echo     - Status: [OK]
) else (
    echo     - WARNING: Visual C++ Redistributable (x64) registry key not found.
    echo     - Electron framework dependencies and underlying Node binaries may require this.
    echo     - Status: [WARN]
)
echo.

echo ====================================================================
if %PASSED% equ 1 (
    echo [SUCCESS] Your system meets the requirements to install and run ASynX.
) else (
    echo [ERROR] One or more critical checks failed. Please review the logs above.
)
echo ====================================================================
echo.
pause
