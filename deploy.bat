@echo off
echo Building app...
call npm run build
echo Deploying to Vercel...
call vercel --prod --yes
echo Done! Your link is above.
pause
