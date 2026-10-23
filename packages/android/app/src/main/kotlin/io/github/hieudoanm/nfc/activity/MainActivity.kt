package io.github.hieudoanm.nfc.activity

import android.nfc.NfcAdapter
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.nfc.data.nfc.TagDispatcher
import io.github.hieudoanm.nfc.data.preferences.SettingsDataStore
import io.github.hieudoanm.nfc.navigation.AppNavGraph
import io.github.hieudoanm.nfc.ui.theme.NfcToolkitTheme
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tagDispatcher: TagDispatcher

    @Inject
    lateinit var settingsDataStore: SettingsDataStore

    private var nfcAdapter: NfcAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        tagDispatcher.setup(this)

        handleIntent(intent)

        setContent {
            val darkMode by settingsDataStore.darkMode.collectAsState(initial = false)
            NfcToolkitTheme(darkTheme = darkMode) {
                AppNavGraph()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        tagDispatcher.enable(this, nfcAdapter)
    }

    override fun onPause() {
        super.onPause()
        tagDispatcher.disable(this, nfcAdapter)
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: android.content.Intent?) {
        intent?.let { tagDispatcher.handleIntent(it) }
    }
}
