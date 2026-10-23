package io.github.hieudoanm.block.ui.apps

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import io.github.hieudoanm.block.data.database.AppDao
import io.github.hieudoanm.block.data.entity.BlockedApp
import io.github.hieudoanm.block.data.preferences.SettingsDataStore
import io.github.hieudoanm.block.repository.FocusRepository
import io.github.hieudoanm.block.repository.InstalledApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
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
        val state = viewModel.state.first { it.installedApps.size == 3 }
        assertFalse(state.loading)
    }

    @Test
    fun `blockedPackages contains blocked app`() = runTest(testDispatcher) {
        val state = viewModel.state.first { it.blockedPackages.isNotEmpty() }
        assertTrue(state.blockedPackages.contains("com.example.a"))
        assertEquals(1, state.blockedPackages.size)
    }

    @Test
    fun `filteredApps returns all when no search query`() = runTest(testDispatcher) {
        viewModel.state.first { it.installedApps.size == 3 }
        assertEquals(3, viewModel.getFilteredApps().size)
    }

    @Test
    fun `filteredApps filters by search query`() = runTest(testDispatcher) {
        viewModel.state.first { it.installedApps.size == 3 }
        viewModel.onSearchQueryChanged("beta")
        val filtered = viewModel.getFilteredApps()
        assertEquals(1, filtered.size)
        assertEquals("Beta", filtered[0].label)
    }

    @Test
    fun `filteredApps is case insensitive`() = runTest(testDispatcher) {
        viewModel.state.first { it.installedApps.size == 3 }
        viewModel.onSearchQueryChanged("ALPHA")
        val filtered = viewModel.getFilteredApps()
        assertEquals(1, filtered.size)
        assertEquals("Alpha", filtered[0].label)
    }

    @Test
    fun `filteredApps returns empty for no match`() = runTest(testDispatcher) {
        viewModel.state.first { it.installedApps.size == 3 }
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
