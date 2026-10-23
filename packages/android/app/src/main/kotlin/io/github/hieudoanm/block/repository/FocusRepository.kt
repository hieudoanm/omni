package io.github.hieudoanm.block.repository

import android.content.Context
import android.content.pm.PackageManager
import dagger.hilt.android.qualifiers.ApplicationContext
import android.graphics.drawable.Drawable
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.entity.Schedule
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

data class InstalledApp(
    val packageName: String,
    val label: String,
    val icon: Drawable,
    val isSystemApp: Boolean,
)

@Singleton
class FocusRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val appDao: AppDao,
    private val settingsDataStore: SettingsDataStore,
) {
    private val packageManager = context.packageManager

    fun getInstalledApps(ignoreSystem: Boolean = true): List<InstalledApp> {
        val intent = android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
            addCategory(android.content.Intent.CATEGORY_LAUNCHER)
        }
        return packageManager.queryIntentActivities(intent, 0)
            .map { resolveInfo ->
                val appLabel = resolveInfo.loadLabel(packageManager).toString()
                val pkgName = resolveInfo.activityInfo.packageName
                val isSystem = isSystemPackage(resolveInfo)
                InstalledApp(
                    packageName = pkgName,
                    label = appLabel,
                    icon = resolveInfo.loadIcon(packageManager),
                    isSystemApp = isSystem,
                )
            }
            .filter { !ignoreSystem || !it.isSystemApp }
            .sortedBy { it.label.lowercase() }
    }

    fun observeBlockedApps(): Flow<List<BlockedApp>> = appDao.observeAllBlockedApps()

    fun observeEnabledBlockedPackages(): Flow<List<BlockedApp>> = appDao.observeEnabledBlockedApps()

    fun observeBlockedAppCount(): Flow<Int> = appDao.observeBlockedAppCount()

    suspend fun isBlocked(packageName: String): Boolean = appDao.isBlocked(packageName)

    suspend fun toggleBlockedApp(app: InstalledApp, blocked: Boolean) {
        if (blocked) {
            appDao.upsertBlockedApp(
                BlockedApp(
                    packageName = app.packageName,
                    label = app.label,
                    enabled = true,
                )
            )
        } else {
            appDao.removeBlockedApp(app.packageName)
        }
    }

    suspend fun setBlockedAppEnabled(packageName: String, enabled: Boolean) {
        val existing = appDao.getBlockedApp(packageName)
        if (existing != null) {
            appDao.upsertBlockedApp(existing.copy(enabled = enabled))
        }
    }

    fun getAppLabel(packageName: String): String {
        return try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            appInfo.loadLabel(packageManager).toString()
        } catch (_: PackageManager.NameNotFoundException) {
            packageName
        }
    }

    // Settings

    val blockingEnabled: Flow<Boolean> by lazy { settingsDataStore.blockingEnabled }
    val darkMode: Flow<Boolean> by lazy { settingsDataStore.darkMode }
    val accessibilityEnabled: Flow<Boolean> by lazy { settingsDataStore.accessibilityEnabled }
    val ignoreSystemApps: Flow<Boolean> by lazy { settingsDataStore.ignoreSystemApps }
    val launchOnBoot: Flow<Boolean> by lazy { settingsDataStore.launchOnBoot }
    val firstLaunch: Flow<Boolean> by lazy { settingsDataStore.firstLaunch }
    val lastBlockedTime: Flow<Long> by lazy { settingsDataStore.lastBlockedTime }

    suspend fun setBlockingEnabled(enabled: Boolean) = settingsDataStore.setBlockingEnabled(enabled)
    suspend fun setDarkMode(enabled: Boolean) = settingsDataStore.setDarkMode(enabled)
    suspend fun setAccessibilityEnabled(enabled: Boolean) = settingsDataStore.setAccessibilityEnabled(enabled)
    suspend fun setIgnoreSystemApps(enabled: Boolean) = settingsDataStore.setIgnoreSystemApps(enabled)
    suspend fun setLaunchOnBoot(enabled: Boolean) = settingsDataStore.setLaunchOnBoot(enabled)
    suspend fun setFirstLaunch(value: Boolean) = settingsDataStore.setFirstLaunch(value)
    suspend fun setLastBlockedTime(time: Long) = settingsDataStore.setLastBlockedTime(time)

    private fun isSystemPackage(resolveInfo: android.content.pm.ResolveInfo): Boolean {
        return try {
            val flags = resolveInfo.activityInfo.applicationInfo.flags
            flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM != 0
        } catch (_: Exception) {
            false
        }
    }

    fun getInstalledApp(packageName: String): InstalledApp? {
        return getInstalledApps(false).find { it.packageName == packageName }
    }
}
