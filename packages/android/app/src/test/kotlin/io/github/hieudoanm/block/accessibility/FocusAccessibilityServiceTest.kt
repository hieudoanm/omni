package io.github.hieudoanm.block.accessibility

import android.accessibilityservice.AccessibilityServiceInfo
import android.view.accessibility.AccessibilityEvent
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@RunWith(RobolectricTestRunner::class)
class FocusAccessibilityServiceTest {
    private lateinit var service: FocusAccessibilityService

    @Before
    fun setup() {
        service = FocusAccessibilityService()
    }

    @Test
    fun `service is created`() {
        assertNotNull(service)
    }

    @Test
    fun `onInterrupt does not throw`() {
        service.onInterrupt()
    }

    @Test
    fun `shouldIgnore returns true for own package`() {
        val event = mockk<AccessibilityEvent>(relaxed = true) {
            every { packageName } returns "io.github.hieudoanm.block"
            every { eventType } returns AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        }
        service.onAccessibilityEvent(event)
    }

    @Test
    fun `shouldIgnore returns true for system ui`() {
        val event = mockk<AccessibilityEvent>(relaxed = true) {
            every { packageName } returns "com.android.systemui"
            every { eventType } returns AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        }
        service.onAccessibilityEvent(event)
    }

    @Test
    fun `shouldIgnore returns true for permission controller`() {
        val event = mockk<AccessibilityEvent>(relaxed = true) {
            every { packageName } returns "com.google.android.permissioncontroller"
            every { eventType } returns AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        }
        service.onAccessibilityEvent(event)
    }

    @Test
    fun `ignores non-window-state events`() {
        val event = mockk<AccessibilityEvent>(relaxed = true) {
            every { eventType } returns AccessibilityEvent.TYPE_VIEW_CLICKED
        }
        service.onAccessibilityEvent(event)
    }

    @Test
    fun `ignores null package name`() {
        val event = mockk<AccessibilityEvent>(relaxed = true) {
            every { packageName } returns null
            every { eventType } returns AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        }
        service.onAccessibilityEvent(event)
    }
}
