package io.github.hieudoanm.block.ui.theme

import androidx.compose.ui.graphics.Color
import org.junit.Test
import kotlin.test.assertEquals

class ColorTest {
    @Test
    fun `DarkBackground has correct hex`() {
        assertEquals(Color(0xFF1A1A2E), DarkBackground)
    }

    @Test
    fun `DarkSurface has correct hex`() {
        assertEquals(Color(0xFF16213E), DarkSurface)
    }

    @Test
    fun `DarkPrimary has correct hex`() {
        assertEquals(Color(0xFF0F3460), DarkPrimary)
    }

    @Test
    fun `DarkAccent has correct hex`() {
        assertEquals(Color(0xFFE94560), DarkAccent)
    }

    @Test
    fun `DarkText has correct hex`() {
        assertEquals(Color(0xFFEEEEEE), DarkText)
    }

    @Test
    fun `LightBackground has correct hex`() {
        assertEquals(Color(0xFFF5F5F5), LightBackground)
    }

    @Test
    fun `LightSurface has correct hex`() {
        assertEquals(Color(0xFFFFFFFF), LightSurface)
    }

    @Test
    fun `LightPrimary has correct hex`() {
        assertEquals(Color(0xFF0F3460), LightPrimary)
    }

    @Test
    fun `LightAccent has correct hex`() {
        assertEquals(Color(0xFFE94560), LightAccent)
    }

    @Test
    fun `LightText has correct hex`() {
        assertEquals(Color(0xFF1A1A2E), LightText)
    }

    @Test
    fun `dark and light accent are the same`() {
        assertEquals(DarkAccent, LightAccent)
    }

    @Test
    fun `dark and light primary are the same`() {
        assertEquals(DarkPrimary, LightPrimary)
    }
}
