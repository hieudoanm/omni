package io.github.hieudoanm.block.repository

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
class FocusRepositoryTest {
    private lateinit var dao: AppDao
    private lateinit var settingsDataStore: SettingsDataStore
    private lateinit var repository: FocusRepository

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        dao = io.mockk.mockk()
        settingsDataStore = io.mockk.mockk(relaxed = true)
        repository = FocusRepository(
            context = context,
            appDao = dao,
            settingsDataStore = settingsDataStore,
        )
    }

    @Test
    fun `observeBlockedApps delegates to dao`() = runTest {
        val apps = listOf(BlockedApp("com.example.a", "A"))
        io.mockk.every { dao.observeAllBlockedApps() } returns flowOf(apps)

        repository.observeBlockedApps().test {
            assertEquals(apps, awaitItem())
            awaitComplete()
        }
    }

    @Test
    fun `observeBlockedAppCount delegates to dao`() = runTest {
        io.mockk.every { dao.observeBlockedAppCount() } returns flowOf(5)

        repository.observeBlockedAppCount().test {
            assertEquals(5, awaitItem())
            awaitComplete()
        }
    }

    @Test
    fun `isBlocked delegates to dao`() = runTest {
        io.mockk.coEvery { dao.isBlocked("com.example.app") } returns true

        assertTrue(repository.isBlocked("com.example.app"))
    }

    @Test
    fun `toggleBlockedApp inserts when blocked`() = runTest {
        val app = InstalledApp(
            packageName = "com.example.app",
            label = "Example",
            icon = io.mockk.mockk(relaxed = true),
            isSystemApp = false,
        )
        io.mockk.coEvery { dao.upsertBlockedApp(any()) } returns Unit

        repository.toggleBlockedApp(app, blocked = true)

        io.mockk.coVerify {
            dao.upsertBlockedApp(eq(
                BlockedApp(packageName = "com.example.app", label = "Example").copy(enabled = true)
            ))
        }
    }

    @Test
    fun `toggleBlockedApp removes when not blocked`() = runTest {
        val app = InstalledApp("com.example.app", "Example", io.mockk.mockk(), false)
        io.mockk.coEvery { dao.removeBlockedApp(any()) } returns Unit

        repository.toggleBlockedApp(app, blocked = false)

        io.mockk.coVerify { dao.removeBlockedApp("com.example.app") }
    }

    @Test
    fun `blockingEnabled emits from settings`() = runTest {
        io.mockk.every { settingsDataStore.blockingEnabled } returns MutableStateFlow(true)

        repository.blockingEnabled.test {
            assertEquals(true, awaitItem())
            cancelAndConsumeRemainingEvents()
        }
    }

    @Test
    fun `setBlockingEnabled delegates to settings`() = runTest {
        io.mockk.coEvery { settingsDataStore.setBlockingEnabled(any()) } returns Unit

        repository.setBlockingEnabled(true)

        io.mockk.coVerify { settingsDataStore.setBlockingEnabled(true) }
    }
}
