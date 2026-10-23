package io.github.hieudoanm.block.ui.home

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class HomeScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    private fun createViewModel(): HomeViewModel {
        val repository = mockk<io.github.hieudoanm.block.repository.FocusRepository>(relaxed = true) {
            every { accessibilityEnabled } returns flowOf(true)
            every { blockingEnabled } returns flowOf(true)
            every { observeBlockedAppCount() } returns flowOf(0)
            every { lastBlockedTime } returns flowOf(0L)
        }
        return HomeViewModel(repository)
    }

    @Test
    fun `displays focus blocker title`() {
        composeTestRule.setContent {
            HomeScreen(
                onNavigateToAppList = {},
                onNavigateToSettings = {},
                viewModel = createViewModel(),
            )
        }
        composeTestRule.onNodeWithText("Focus Blocker").assertExists()
    }

    @Test
    fun `displays manage apps button`() {
        composeTestRule.setContent {
            HomeScreen(
                onNavigateToAppList = {},
                onNavigateToSettings = {},
                viewModel = createViewModel(),
            )
        }
        composeTestRule.onNodeWithText("Manage Apps").assertExists()
    }

    @Test
    fun `displays settings button`() {
        composeTestRule.setContent {
            HomeScreen(
                onNavigateToAppList = {},
                onNavigateToSettings = {},
                viewModel = createViewModel(),
            )
        }
        composeTestRule.onNodeWithText("Settings").assertExists()
    }

    @Test
    fun `blocked apps card triggers navigate callback`() {
        var clicked = false
        composeTestRule.setContent {
            HomeScreen(
                onNavigateToAppList = { clicked = true },
                onNavigateToSettings = {},
                viewModel = createViewModel(),
            )
        }
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("Blocked Apps").performClick()
        composeTestRule.waitForIdle()
        assert(clicked)
    }
}
