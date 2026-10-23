package io.github.hieudoanm.block.navigation

import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class NavGraphTest {
    @Test
    fun `Routes constants are defined`() {
        org.junit.Assert.assertEquals("home", Routes.HOME)
        org.junit.Assert.assertEquals("app_list", Routes.APP_LIST)
        org.junit.Assert.assertEquals("settings", Routes.SETTINGS)
    }
}
