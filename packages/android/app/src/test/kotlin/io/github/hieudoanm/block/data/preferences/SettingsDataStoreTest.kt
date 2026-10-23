package io.github.hieudoanm.block.data.preferences

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class SettingsDataStoreTest {
    private lateinit var dataStore: SettingsDataStore

    @Before
    fun setup() = kotlinx.coroutines.test.runTest {
        val context = ApplicationProvider.getApplicationContext<Context>()
        java.io.File(context.filesDir, "datastore/settings.preferences_pb").delete()
        dataStore = SettingsDataStore(context)
        dataStore.setBlockingEnabled(false)
        dataStore.setFirstLaunch(true)
        dataStore.setDarkMode(false)
        dataStore.setLastBlockedTime(0L)
        dataStore.setIgnoreSystemApps(true)
        dataStore.setLaunchOnBoot(false)
        dataStore.setAccessibilityEnabled(false)
    }

    @Test
    fun `default blockingEnabled is false`() = runTest {
        assertFalse(dataStore.blockingEnabled.first())
    }

    @Test
    fun `set and get blockingEnabled`() = runTest {
        dataStore.setBlockingEnabled(true)
        assertTrue(dataStore.blockingEnabled.first())

        dataStore.setBlockingEnabled(false)
        assertFalse(dataStore.blockingEnabled.first())
    }

    @Test
    fun `default firstLaunch is true`() = runTest {
        assertTrue(dataStore.firstLaunch.first())
    }

    @Test
    fun `set and get firstLaunch`() = runTest {
        dataStore.setFirstLaunch(false)
        assertFalse(dataStore.firstLaunch.first())
    }

    @Test
    fun `default darkMode is false`() = runTest {
        assertFalse(dataStore.darkMode.first())
    }

    @Test
    fun `set and get darkMode`() = runTest {
        dataStore.setDarkMode(true)
        assertTrue(dataStore.darkMode.first())
    }

    @Test
    fun `default ignoreSystemApps is true`() = runTest {
        assertTrue(dataStore.ignoreSystemApps.first())
    }

    @Test
    fun `set and get ignoreSystemApps`() = runTest {
        dataStore.setIgnoreSystemApps(false)
        assertFalse(dataStore.ignoreSystemApps.first())
    }

    @Test
    fun `default lastBlockedTime is 0`() = runTest {
        assertEquals(0L, dataStore.lastBlockedTime.first())
    }

    @Test
    fun `set and get lastBlockedTime`() = runTest {
        val time = 123456789L
        dataStore.setLastBlockedTime(time)
        assertEquals(time, dataStore.lastBlockedTime.first())
    }
}
