package io.github.hieudoanm.omni.activity

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.omni.ui.home.HomeScreen
import io.github.hieudoanm.omni.ui.theme.OmniTheme

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OmniTheme {
                HomeScreen(
                    onOpenBlock = {
                        startActivity(Intent(this, io.github.hieudoanm.block.activity.MainActivity::class.java))
                    },
                    onOpenNfc = {
                        startActivity(Intent(this, io.github.hieudoanm.nfc.activity.MainActivity::class.java))
                    },
                )
            }
        }
    }
}