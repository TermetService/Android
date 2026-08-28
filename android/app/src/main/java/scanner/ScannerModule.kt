// android/app/src/main/java/com/statuschecker/scanner/ScannerModule.kt
package com.statuschecker.scanner

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.xcheng.scanner.XcBarcodeScanner
import com.xcheng.scanner.ScannerResult

class ScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "ScannerModule"
        private const val MODULE_NAME = "ScannerModule"
    }

    private var isInitialized = false

    override fun getName(): String = MODULE_NAME

    // Инициализация SDK
    @ReactMethod
    fun initSDK(promise: Promise) {
        try {
            if (!isInitialized) {
                val context = reactApplicationContext

                XcBarcodeScanner.init(context, object : ScannerResult {
                    override fun onResult(result: String) {
                        Log.d(TAG, "✅ Scan result: $result")
                        sendScanResultToJS(result)
                        // Останавливаем сканер через reflection
                        stopScannerInternal()
                    }
                })

                isInitialized = true
                Log.d(TAG, "✅ SDK initialized successfully")
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error initializing SDK: ${e.message}", e)
            promise.reject("INIT_ERROR", "Failed to initialize SDK", e)
        }
    }

    // Запуск сканирования
    @ReactMethod
    fun startScan(promise: Promise) {
        try {
            if (!isInitialized) {
                val context = reactApplicationContext
                XcBarcodeScanner.init(context, object : ScannerResult {
                    override fun onResult(result: String) {
                        Log.d(TAG, "✅ Scan result: $result")
                        sendScanResultToJS(result)
                        // Останавливаем сканер через reflection
                        stopScannerInternal()
                    }
                })
                isInitialized = true
            }

            // Используем reflection с правильным синтаксисом Kotlin
            val method = XcBarcodeScanner::class.java.getMethod("startScan")
            method.invoke(null)

            Log.d(TAG, "✅ Scan started via SDK")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error starting scan: ${e.message}", e)
            promise.reject("SCAN_ERROR", "Failed to start scan: ${e.message}", e)
        }
    }

    // Остановка сканирования
    @ReactMethod
    fun stopScan(promise: Promise) {
        try {
            stopScannerInternal()
            Log.d(TAG, "✅ Scan stopped via SDK")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping scan: ${e.message}", e)
            promise.reject("SCAN_ERROR", "Failed to stop scan: ${e.message}", e)
        }
    }

    // Внутренний метод для остановки сканера (доступен из любого места класса)
    private fun stopScannerInternal() {
        try {
            val method = XcBarcodeScanner::class.java.getMethod("stopScan")
            method.invoke(null)
            Log.d(TAG, "✅ Scanner stopped after successful scan")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping scanner: ${e.message}", e)
        }
    }

    // Деинициализация SDK
    @ReactMethod
    fun deinitSDK(promise: Promise) {
        try {
            if (isInitialized) {
                // Используем reflection с правильным синтаксисом Kotlin
                val method = XcBarcodeScanner::class.java.getMethod(
                    "deInit",
                    android.content.Context::class.java
                )
                method.invoke(null, reactApplicationContext)
                isInitialized = false
                Log.d(TAG, "✅ SDK deinitialized")
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error deinitializing SDK: ${e.message}", e)
            promise.reject("DEINIT_ERROR", "Failed to deinitialize SDK", e)
        }
    }

    // Проверка доступности сканера
    @ReactMethod
    fun isScannerAvailable(promise: Promise) {
        try {
            // Используем reflection с правильным синтаксисом Kotlin
            val getServiceVersionMethod = XcBarcodeScanner::class.java.getMethod("getServiceVersion")
            val serviceVersion = getServiceVersionMethod.invoke(null) as String

            val getSdkVersionMethod = XcBarcodeScanner::class.java.getMethod("getSdkVersion")
            val sdkVersion = getSdkVersionMethod.invoke(null) as String

            Log.d(TAG, "Service version: $serviceVersion")
            Log.d(TAG, "SDK version: $sdkVersion")

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error checking scanner: ${e.message}", e)
            promise.resolve(false)
        }
    }

    // Получение версии SDK
    @ReactMethod
    fun getSDKVersion(promise: Promise) {
        try {
            val method = XcBarcodeScanner::class.java.getMethod("getSdkVersion")
            val version = method.invoke(null) as String

            Log.d(TAG, "SDK version: $version")
            promise.resolve(version)
        } catch (e: Exception) {
            promise.reject("VERSION_ERROR", "Failed to get SDK version", e)
        }
    }

    // Отправка результата сканирования в React Native
    private fun sendScanResultToJS(result: String) {
        try {
            val params = Arguments.createMap().apply {
                putString("data", result)
                putLong("timestamp", System.currentTimeMillis())
            }

            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onScanData", params)

            Log.d(TAG, "📤 Scan result sent to RN: $result")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error sending result to RN: ${e.message}")
        }
    }
}