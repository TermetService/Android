Write-Host "Сборка APK..." -ForegroundColor Green
cd android
./gradlew assembleDebug
cd ..

# Копируем APK в корень
$apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath "StatusChecker.apk" -Force
    Write-Host "✅ APK создан: StatusChecker.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка сборки APK!" -ForegroundColor Red
}