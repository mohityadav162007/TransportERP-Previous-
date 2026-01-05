@echo off

REM === PostgreSQL credentials ===
set PGPASSWORD=Jaishreeram@123

REM === Paths ===
set PG_DUMP="D:\PostgreSQL\bin\pg_dump.exe"
set BACKUP_DIR=D:\TransportERP\backup
set DB_NAME=transport_erp

REM === Date format (YYYY-MM-DD) ===
set YYYY=%DATE:~10,4%
set MM=%DATE:~4,2%
set DD=%DATE:~7,2%
set DATESTAMP=%YYYY%-%MM%-%DD%

REM === Backup command ===
%PG_DUMP% -U postgres %DB_NAME% > "%BACKUP_DIR%\erp_backup_%DATESTAMP%.sql"

REM === Delete backups older than 30 days ===
forfiles /p "%BACKUP_DIR%" /m *.sql /d -30 /c "cmd /c del @path"
