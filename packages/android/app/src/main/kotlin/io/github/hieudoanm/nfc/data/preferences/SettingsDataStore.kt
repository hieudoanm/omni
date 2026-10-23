package io.github.hieudoanm.nfc.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "nfc_settings")

class SettingsDataStore(private val context: Context) {

    private object Keys {
        val AUTO_OPEN_URL = booleanPreferencesKey("auto_open_url")
        val DARK_MODE = booleanPreferencesKey("dark_mode")
    }

    val autoOpenUrl: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.AUTO_OPEN_URL] ?: false
    }

    val darkMode: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[Keys.DARK_MODE] ?: false
    }

    suspend fun setAutoOpenUrl(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.AUTO_OPEN_URL] = enabled }
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { prefs -> prefs[Keys.DARK_MODE] = enabled }
    }
}
