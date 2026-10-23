package io.github.hieudoanm.omni.ui.home

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
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

    @Test
    fun `displays hub title`() {
        composeTestRule.setContent {
            HomeScreen(
                onOpenBlock = {},
                onOpenNfc = {},
            )
        }
        composeTestRule.onNodeWithText("Omni").assertExists()
    }

    @Test
    fun `displays both app cards`() {
        composeTestRule.setContent {
            HomeScreen(
                onOpenBlock = {},
                onOpenNfc = {},
            )
        }
        composeTestRule.onNodeWithText("Focus Blocker").assertExists()
        composeTestRule.onNodeWithText("NFC Toolkit").assertExists()
    }

    @Test
    fun `block card triggers open callback`() {
        var clicked = false
        composeTestRule.setContent {
            HomeScreen(
                onOpenBlock = { clicked = true },
                onOpenNfc = {},
            )
        }
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("Focus Blocker").performClick()
        composeTestRule.waitForIdle()
        assert(clicked)
    }

    @Test
    fun `nfc card triggers open callback`() {
        var clicked = false
        composeTestRule.setContent {
            HomeScreen(
                onOpenBlock = {},
                onOpenNfc = { clicked = true },
            )
        }
        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("NFC Toolkit").performClick()
        composeTestRule.waitForIdle()
        assert(clicked)
    }
}