package io.github.hieudoanm.block.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ThemeTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `FocusBlockTheme renders content`() {
        composeTestRule.setContent {
            FocusBlockTheme {
                MaterialTheme {
                }
            }
        }
        composeTestRule.waitForIdle()
    }

    @Test
    fun `FocusBlockTheme provides colorScheme`() {
        composeTestRule.setContent {
            FocusBlockTheme(darkTheme = false, dynamicColor = false) {
                val scheme = MaterialTheme.colorScheme
                assertNotNull(scheme)
                assertEquals(Color(0xFF0F3460), LightPrimary)
            }
        }
    }
}
