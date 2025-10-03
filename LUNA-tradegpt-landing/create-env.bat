@echo off
echo Creating .env file...

echo VITE_API_BASE_URL=https://superbai.io/api > .env
echo VITE_GOOGLE_CLIENT_ID=751661411790-o290dkk1g3jdeivjqcmg5j8fa2ejn8pd.apps.googleusercontent.com >> .env
echo VITE_WS_URL=wss://superbai.io/ws >> .env
echo VITE_PAYPAL_CLIENT_ID=AQhtqAHPEzjovnQluOAY7tuUVuiiYxpXbYlXqQMdy4zFiGkdMKkk59G0pSpNBNW1I5TeKFvzWpJhv4M- >> .env
echo VITE_AI_SERVICE_BASE_URL=https://aiapi.superbai.io/api/v1 >> .env
echo VITE_AI_SERVICE_SECRET_KEY=155792625553b3e0f95baf5034611266 >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo 📋 Next steps:
echo 1. Restart Vite server: npm run dev
echo 2. Test API connection in browser
echo 3. Try login with real credentials
echo.
pause
