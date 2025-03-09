@echo off
REM Чтение переменных из .env файла
for /f "tokens=1,2 delims==" %%i in (.env) do (
    set %%i=%%j
)

REM Выполнение резервного копирования
pg_dump -U %DB_USER% -h %DB_HOST% -d %DB_NAME% -f %~dp0%BACKUP_DIR%\backup_%date:~0,4%-%date:~5,2%-%date:~8,2%.sql

REM Логирование
echo Резервное копирование завершено: %BACKUP_PATH%\backup_%date:~0,4%-%date:~5,2%-%date:~8,2%.sql