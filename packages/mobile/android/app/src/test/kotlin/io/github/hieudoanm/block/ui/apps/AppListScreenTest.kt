package io.github.hieudoanm.block.ui.apps

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.lifecycle.viewmodel.compose.viewModel
import io.mockk.mockk
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class AppListScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `displays blocked apps title`() {
        val vm = AppListViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            AppListScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Blocked Apps").assertExists()
    }

    @Test
    fun `displays search placeholder`() {
        val vm = AppListViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            AppListScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Search apps\u2026").assertExists()
    }
}
