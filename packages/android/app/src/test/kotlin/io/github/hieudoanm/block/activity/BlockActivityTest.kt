package io.github.hieudoanm.block.activity

import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import kotlin.test.assertEquals

@RunWith(RobolectricTestRunner::class)
class BlockActivityTest {
    @Test
    fun `EXTRA_PACKAGE_NAME constant is correct`() {
        assertEquals("extra_package_name", BlockActivity.EXTRA_PACKAGE_NAME)
    }
}
