package io.github.hieudoanm.block.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsDataStore(private val context: Context) {

    private object Keys {
        val BLOCKING_ENABLED = booleanPreferencesKey("blocking_enabled")
        val FIRST_LAUNCH = booleanPreferencesKey("first_launch")
        val DARK_MODE = booleanPreferencesKey("dark_mode")
        val LAST_BLOCKED_TIME = longPreferencesKey("last_blocked_time")
        val ACCESSIBILITY_ENABLED = booleanPreferencesKey("accessibility_enabled")
        val IGNORE_SYSTEM_APPS = booleanPreferencesKey("ignore_system_apps")
        val LAUNCH_ON_BOOT = booleanPreferencesKey("launch_on_boot")
    }

    val blockingEnabled: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.BLOCKING_ENABLED] ?: false
    }

    val firstLaunch: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.FIRST_LAUNCH] ?: true
    }

    val darkMode: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.DARK_MODE] ?: false
    }

    val accessibilityEnabled: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.ACCESSIBILITY_ENABLED] ?: false
    }

    val ignoreSystemApps: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.IGNORE_SYSTEM_APPS] ?: true
    }

    val launchOnBoot: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.LAUNCH_ON_BOOT] ?: false
    }

    val lastBlockedTime: Flow<Long> = context.dataStore.data.map { prefs ->
        prefs[Keys.LAST_BLOCKED_TIME] ?: 0L
    }

    suspend fun setBlockingEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.BLOCKING_ENABLED] = enabled }
    }

    suspend fun setFirstLaunch(value: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.FIRST_LAUNCH] = value }
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.DARK_MODE] = enabled }
    }

    suspend fun setAccessibilityEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.ACCESSIBILITY_ENABLED] = enabled }
    }

    suspend fun setIgnoreSystemApps(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.IGNORE_SYSTEM_APPS] = enabled }
    }

    suspend fun setLaunchOnBoot(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.LAUNCH_ON_BOOT] = enabled }
    }

    suspend fun setLastBlockedTime(time: Long) {
        context.dataStore.edit { prefs -> prefs[Keys.LAST_BLOCKED_TIME] = time }
    }
}
