package io.github.hieudoanm.block.activity

import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class MainActivityTest {
    @Test
    fun `activity class can be loaded`() {
        org.junit.Assert.assertNotNull(MainActivity::class.java)
    }
}
