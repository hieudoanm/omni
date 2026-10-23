package io.github.hieudoanm.block.data.entity

import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class BlockedAppTest {
    @Test
    fun `default enabled is true`() {
        val app = BlockedApp(packageName = "com.example.app", label = "Example")
        assertTrue(app.enabled)
    }

    @Test
    fun `equals compares all fields`() {
        val a = BlockedApp("com.example.a", "A")
        val b = BlockedApp("com.example.a", "B")
        assertNotEquals(a, b)
    }

    @Test
    fun `different packageNames are not equal`() {
        val a = BlockedApp("com.example.a", "A")
        val b = BlockedApp("com.example.b", "B")
        assertNotEquals(a, b)
    }

    @Test
    fun `copy with enabled changed`() {
        val original = BlockedApp("com.example.app", "App", enabled = true)
        val disabled = original.copy(enabled = false)
        assertEquals(false, disabled.enabled)
        assertEquals(original.packageName, disabled.packageName)
    }
}
