package io.github.hieudoanm.nfc

import org.junit.Assert.assertNotNull
import org.junit.Test

class NfcModuleSmokeTest {

    @Test
    fun `core classes can be loaded`() {
        assertNotNull(io.github.hieudoanm.nfc.data.nfc.HceApduService::class.java)
        assertNotNull(io.github.hieudoanm.nfc.activity.MainActivity::class.java)
    }
}