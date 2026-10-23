package io.github.hieudoanm.block.ui.settings

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import io.github.hieudoanm.block.repository.FocusRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
class SettingsViewModelTest {
    private val testDispatcher = UnconfinedTestDispatcher()

    private lateinit var repository: FocusRepository
    private lateinit var viewModel: SettingsViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        val dao = io.mockk.mockk<AppDao>()
        val settingsDataStore = io.mockk.mockk<SettingsDataStore>(relaxed = true)

        io.mockk.every { settingsDataStore.blockingEnabled } returns MutableStateFlow(false)
        io.mockk.every { settingsDataStore.launchOnBoot } returns MutableStateFlow(false)
        io.mockk.every { settingsDataStore.darkMode } returns MutableStateFlow(true)
        io.mockk.every { settingsDataStore.ignoreSystemApps } returns MutableStateFlow(true)

        val context = ApplicationProvider.getApplicationContext<Context>()
        repository = FocusRepository(
            context = context,
            appDao = dao,
            settingsDataStore = settingsDataStore,
        )
        viewModel = SettingsViewModel(repository)
    }

    @After
    fun teardown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state reflects repository`() = runTest(testDispatcher) {
        viewModel.state.test {
            val state = awaitItem()
            assertFalse(state.blockingEnabled)
            assertFalse(state.launchOnBoot)
            assertTrue(state.darkMode)
            assertTrue(state.ignoreSystemApps)
            cancel()
        }
    }

    @Test
    fun `setBlockingEnabled delegates to repository`() = runTest(testDispatcher) {
        io.mockk.coEvery { repository.setBlockingEnabled(true) } returns Unit

        viewModel.setBlockingEnabled(true)

        io.mockk.coVerify { repository.setBlockingEnabled(true) }
    }

    @Test
    fun `setDarkMode delegates to repository`() = runTest(testDispatcher) {
        io.mockk.coEvery { repository.setDarkMode(false) } returns Unit

        viewModel.setDarkMode(false)

        io.mockk.coVerify { repository.setDarkMode(false) }
    }

    @Test
    fun `setIgnoreSystemApps delegates to repository`() = runTest(testDispatcher) {
        io.mockk.coEvery { repository.setIgnoreSystemApps(false) } returns Unit

        viewModel.setIgnoreSystemApps(false)

        io.mockk.coVerify { repository.setIgnoreSystemApps(false) }
    }

    @Test
    fun `setLaunchOnBoot delegates to repository`() = runTest(testDispatcher) {
        io.mockk.coEvery { repository.setLaunchOnBoot(true) } returns Unit

        viewModel.setLaunchOnBoot(true)

        io.mockk.coVerify { repository.setLaunchOnBoot(true) }
    }
}
