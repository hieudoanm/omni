package io.github.hieudoanm.block.ui.block

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
class BlockScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `displays stay focused heading`() {
        composeTestRule.setContent {
            BlockScreen(
                packageName = "com.example.app",
                onGoHome = {},
            )
        }
        composeTestRule.onNodeWithText("Stay Focused").assertExists()
    }

    @Test
    fun `displays app is blocked message`() {
        composeTestRule.setContent {
            BlockScreen(
                packageName = "com.example.app",
                onGoHome = {},
            )
        }
        composeTestRule.onNodeWithText("com.example.app is blocked.").assertExists()
    }

    @Test
    fun `displays go home button`() {
        composeTestRule.setContent {
            BlockScreen(
                packageName = "com.example.app",
                onGoHome = {},
            )
        }
        composeTestRule.onNodeWithText("Go Home").assertExists()
    }

    @Test
    fun `go home button triggers callback`() {
        var clicked = false
        composeTestRule.setContent {
            BlockScreen(
                packageName = "com.example.app",
                onGoHome = { clicked = true },
            )
        }
        composeTestRule.onNodeWithText("Go Home").performClick()
        assert(clicked)
    }
}
