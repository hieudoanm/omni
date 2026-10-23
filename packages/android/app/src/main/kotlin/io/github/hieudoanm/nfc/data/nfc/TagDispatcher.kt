package io.github.hieudoanm.nfc.data.nfc

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.nfc.NfcAdapter.ACTION_NDEF_DISCOVERED
import android.nfc.NfcAdapter.ACTION_TAG_DISCOVERED
import android.nfc.NfcAdapter.ACTION_TECH_DISCOVERED
import android.nfc.Tag
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TagDispatcher @Inject constructor() {

    private val _tagFlow = MutableSharedFlow<Tag>(extraBufferCapacity = 1)
    val tagFlow: SharedFlow<Tag> = _tagFlow.asSharedFlow()

    private var pendingIntent: PendingIntent? = null
    private var intentFilters: Array<IntentFilter>? = null
    private var techLists: Array<Array<String>>? = null

    // ACTION_TAG_DISCOVERED is deprecated in API 35 in favour of the NDEF and
    // TECH filters, but it is kept so that tags with no NDEF data and an
    // unrecognised technology still reach the app.
    @Suppress("DEPRECATION")
    fun setup(activity: Activity) {
        pendingIntent = PendingIntent.getActivity(
            activity,
            0,
            Intent(activity, activity.javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        intentFilters = arrayOf(
            IntentFilter(ACTION_NDEF_DISCOVERED),
            IntentFilter(ACTION_TECH_DISCOVERED),
            IntentFilter(ACTION_TAG_DISCOVERED),
        )

        techLists = arrayOf(
            arrayOf(android.nfc.tech.NfcA::class.java.name),
            arrayOf(android.nfc.tech.NfcB::class.java.name),
            arrayOf(android.nfc.tech.NfcF::class.java.name),
            arrayOf(android.nfc.tech.NfcV::class.java.name),
            arrayOf(android.nfc.tech.IsoDep::class.java.name),
            arrayOf(android.nfc.tech.MifareClassic::class.java.name),
            arrayOf(android.nfc.tech.MifareUltralight::class.java.name),
            arrayOf(android.nfc.tech.Ndef::class.java.name),
            arrayOf(android.nfc.tech.NdefFormatable::class.java.name),
        )
    }

    fun enable(activity: Activity, nfcAdapter: NfcAdapter?) {
        nfcAdapter?.enableForegroundDispatch(
            activity,
            pendingIntent,
            intentFilters,
            techLists,
        )
    }

    fun disable(activity: Activity, nfcAdapter: NfcAdapter?) {
        nfcAdapter?.disableForegroundDispatch(activity)
    }

    @Suppress("DEPRECATION")
    fun handleIntent(intent: Intent) {
        val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG) ?: return
        _tagFlow.tryEmit(tag)
    }
}
