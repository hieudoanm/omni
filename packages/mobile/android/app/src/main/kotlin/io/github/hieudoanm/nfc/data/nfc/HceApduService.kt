package io.github.hieudoanm.nfc.data.nfc

import android.nfc.cardemulation.HostApduService
import android.os.Bundle

class HceApduService : HostApduService() {

    override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
        if (commandApdu.size >= 12 &&
            commandApdu[0] == 0x00.toByte() &&
            commandApdu[1] == 0xA4.toByte()
        ) {
            return SELECT_OK
        }
        return UNKNOWN
    }

    override fun onDeactivated(reason: Int) {
    }

    companion object {
        private val SELECT_OK = byteArrayOf(0x90.toByte(), 0x00)
        private val UNKNOWN = byteArrayOf(0x6A.toByte(), 0x82.toByte())
    }
}
