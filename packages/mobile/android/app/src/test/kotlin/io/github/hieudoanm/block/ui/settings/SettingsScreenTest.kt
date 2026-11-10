package io.github.hieudoanm.block.ui.settings

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import io.mockk.mockk
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class SettingsScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `displays settings title`() {
        val vm = SettingsViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            SettingsScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Settings").assertExists()
    }

    @Test
    fun `displays enable blocker toggle`() {
        val vm = SettingsViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            SettingsScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Enable Blocker").assertExists()
    }

    @Test
    fun `displays launch on boot toggle`() {
        val vm = SettingsViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            SettingsScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Launch on Boot").assertExists()
    }

    @Test
    fun `displays dark mode toggle`() {
        val vm = SettingsViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            SettingsScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Dark Mode").assertExists()
    }

    @Test
    fun `displays ignore system apps toggle`() {
        val vm = SettingsViewModel(mockk(relaxed = true))
        composeTestRule.setContent {
            SettingsScreen(
                onNavigateBack = {},
                viewModel = vm,
            )
        }
        composeTestRule.onNodeWithText("Ignore System Apps").assertExists()
    }
}
