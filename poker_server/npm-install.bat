::npm-install.bat
@echo off
::install web server dependencies && game server dependencies
cd web-server && cnpm install -d && cd .. && cd game-server && cnpm install -d