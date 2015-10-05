@echo off

REM Windows script for changing step
REM This script just copies content of given step into sandbox

set SB_DIR=%~dp0
set STEP=%1

rd /Q /S "%SB_DIR%/app/js" ^
         "%SB_DIR%/app/partials" ^
         "%SB_DIR%/app/css" ^
         "%SB_DIR%/test/unit" ^
         "%SB_DIR%/test/e2e"

xcopy "%SB_DIR%\..\step-%STEP%" "%SB_DIR%" /E /Y
