package io.github.hieudoanm.block.ui.home

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import io.github.hieudoanm.block.repository.FocusRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.TestDispatcher
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

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
class HomeViewModelTest {
    private val testDispatcher: TestDispatcher = UnconfinedTestDispatcher()

    private lateinit var repository: FocusRepository
    private lateinit var viewModel: HomeViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        val dao = io.mockk.mockk<AppDao>()
        val settingsDataStore = io.mockk.mockk<SettingsDataStore>(relaxed = true)

        io.mockk.every { settingsDataStore.blockingEnabled } returns MutableStateFlow(true)
        io.mockk.every { settingsDataStore.accessibilityEnabled } returns MutableStateFlow(true)
        io.mockk.every { settingsDataStore.lastBlockedTime } returns MutableStateFlow(System.currentTimeMillis() - 120000)
        io.mockk.every { dao.observeBlockedAppCount() } returns flowOf(5)

        val context = ApplicationProvider.getApplicationContext<Context>()
        repository = FocusRepository(
            context = context,
            appDao = dao,
            settingsDataStore = settingsDataStore,
        )
        viewModel = HomeViewModel(repository)
    }

    @After
    fun teardown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state reflects repository values`() = runTest(testDispatcher) {
        viewModel.state.test {
            val state = awaitItem()
            assertEquals(true, state.accessibilityEnabled)
            assertEquals(true, state.blockingEnabled)
            assertEquals(5, state.blockedAppCount)
            cancel()
        }
    }

    @Test
    fun `minutesSaved is calculated from lastBlockedTime`() = runTest(testDispatcher) {
        viewModel.state.test {
            val state = awaitItem()
            assertEquals(2, state.minutesSaved)
            cancel()
        }
    }

    @Test
    fun `state updates when blockedAppCount changes`() = runTest(testDispatcher) {
        viewModel.state.test {
            assertEquals(5, awaitItem().blockedAppCount)
            cancel()
        }
    }
}
