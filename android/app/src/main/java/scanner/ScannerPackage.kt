// android/app/src/main/java/com/statuschecker/scanner/ScannerPackage.kt
package com.statuschecker.scanner

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ScannerPackage : ReactPackage {

    // Этот метод создает нативные модули
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        val modules = mutableListOf<NativeModule>()

        // Добавляем наш модуль сканера
        modules.add(ScannerModule(reactContext))

        // Можно добавить другие модули
        // modules.add(OtherModule(reactContext))

        return modules
    }

    // Этот метод создает нативные View-компоненты (если нужны)
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}