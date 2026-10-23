package io.github.hieudoanm.block.ui.theme

import androidx.compose.ui.graphics.Color
import org.junit.Test
import kotlin.test.assertEquals

class ColorTest {
    @Test
    fun `HudBackground has correct hex`() {
        assertEquals(Color(0xFF020813), HudBackground)
    }

    @Test
    fun `HudSurface has correct hex`() {
        assertEquals(Color(0xFF0A1424), HudSurface)
    }

    @Test
    fun `HudSurfaceVariant has correct hex`() {
        assertEquals(Color(0xFF0F1E33), HudSurfaceVariant)
    }

    @Test
    fun `HudBorder has correct hex`() {
        assertEquals(Color(0xFF14304A), HudBorder)
    }

    @Test
    fun `HudPrimary has correct hex`() {
        assertEquals(Color(0xFF16DFFF), HudPrimary)
    }

    @Test
    fun `HudPrimaryDim has correct hex`() {
        assertEquals(Color(0xFF008CFF), HudPrimaryDim)
    }

    @Test
    fun `HudSecondary has correct hex`() {
        assertEquals(Color(0xFF8AFAFF), HudSecondary)
    }

    @Test
    fun `HudText has correct hex`() {
        assertEquals(Color(0xFFEDEDED), HudText)
    }

    @Test
    fun `HudMuted has correct hex`() {
        assertEquals(Color(0xFF7D93AD), HudMuted)
    }

    @Test
    fun `HudLightBackground has correct hex`() {
        assertEquals(Color(0xFFF2F7FB), HudLightBackground)
    }

    @Test
    fun `HudLightSurface has correct hex`() {
        assertEquals(Color(0xFFFFFFFF), HudLightSurface)
    }

    @Test
    fun `HudLightSurfaceVariant has correct hex`() {
        assertEquals(Color(0xFFE8F0F8), HudLightSurfaceVariant)
    }

    @Test
    fun `HudLightBorder has correct hex`() {
        assertEquals(Color(0xFFC4D8EC), HudLightBorder)
    }

    @Test
    fun `HudLightPrimary has correct hex`() {
        assertEquals(Color(0xFF008CFF), HudLightPrimary)
    }

    @Test
    fun `HudLightSecondary has correct hex`() {
        assertEquals(Color(0xFF0090C8), HudLightSecondary)
    }

    @Test
    fun `HudLightText has correct hex`() {
        assertEquals(Color(0xFF0B1526), HudLightText)
    }

    @Test
    fun `HudLightMuted has correct hex`() {
        assertEquals(Color(0xFF4A5D75), HudLightMuted)
    }
}
