@echo off
title BTP Manager - Application Bureau
color 0B
cls
echo ====================================================================
echo               🏗️ BTP MANAGER - APPLICATION BUREAU
echo ====================================================================
echo.
echo  Lancement de l'application en mode hors-ligne...
echo  Veuillez patienter quelques secondes.
echo.

cd /d "%~dp0"
npx electron .

exit
