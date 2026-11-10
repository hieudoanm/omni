package io.github.hieudoanm.block.ui.apps

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import io.github.hieudoanm.block.repository.FocusRepository
import io.github.hieudoanm.block.repository.InstalledApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
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
class AppListViewModelTest {
    private val testDispatcher = UnconfinedTestDispatcher()

    private lateinit var repository: FocusRepository
    private lateinit var viewModel: AppListViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        val dao = io.mockk.mockk<AppDao>()
        val settingsDataStore = io.mockk.mockk<SettingsDataStore>(relaxed = true)

        io.mockk.every { dao.observeEnabledBlockedApps() } returns MutableStateFlow(
            listOf(BlockedApp("com.example.a", "A"))
        )

        val context = ApplicationProvider.getApplicationContext<Context>()
        repository = io.mockk.spyk(
            FocusRepository(
                context = context,
                appDao = dao,
                settingsDataStore = settingsDataStore,
            )
        )

        io.mockk.every { repository.getInstalledApps() } returns listOf(
            InstalledApp("com.example.a", "Alpha", io.mockk.mockk(relaxed = true), false),
            InstalledApp("com.example.b", "Beta", io.mockk.mockk(relaxed = true), false),
            InstalledApp("com.example.c", "Charlie", io.mockk.mockk(relaxed = true), false),
        )

        viewModel = AppListViewModel(repository)
    }

    @After
    fun teardown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state loads installed apps`() = runTest(testDispatcher) {
        viewModel.state.test {
            val state = awaitItem()
            assertEquals(3, state.installedApps.size)
            assertFalse(state.loading)
            cancel()
        }
    }

    @Test
    fun `blockedPackages contains blocked app`() = runTest(testDispatcher) {
        viewModel.state.test {
            val state = awaitItem()
            assertTrue(state.blockedPackages.contains("com.example.a"))
            assertEquals(1, state.blockedPackages.size)
            cancel()
        }
    }

    @Test
    fun `filteredApps returns all when no search query`() {
        val filtered = viewModel.getFilteredApps()
        assertEquals(3, filtered.size)
    }

    @Test
    fun `filteredApps filters by search query`() {
        viewModel.onSearchQueryChanged("beta")
        val filtered = viewModel.getFilteredApps()
        assertEquals(1, filtered.size)
        assertEquals("Beta", filtered[0].label)
    }

    @Test
    fun `filteredApps is case insensitive`() {
        viewModel.onSearchQueryChanged("ALPHA")
        val filtered = viewModel.getFilteredApps()
        assertEquals(1, filtered.size)
        assertEquals("Alpha", filtered[0].label)
    }

    @Test
    fun `filteredApps returns empty for no match`() {
        viewModel.onSearchQueryChanged("nonexistent")
        val filtered = viewModel.getFilteredApps()
        assertTrue(filtered.isEmpty())
    }

    @Test
    fun `toggleApp delegates to repository`() = runTest(testDispatcher) {
        val app = InstalledApp("com.example.b", "Beta", io.mockk.mockk(), false)
        io.mockk.coEvery { repository.toggleBlockedApp(app, true) } returns Unit

        viewModel.toggleApp(app)

        io.mockk.coVerify { repository.toggleBlockedApp(app, true) }
    }
}
