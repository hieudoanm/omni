package io.github.hieudoanm.block.activity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.block.ui.block.BlockScreen

@AndroidEntryPoint
class BlockActivity : ComponentActivity() {

    companion object {
        const val EXTRA_PACKAGE_NAME = "extra_package_name"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val packageName = intent?.getStringExtra(EXTRA_PACKAGE_NAME) ?: return finish()

        setContent {
            BlockScreen(
                packageName = packageName,
                onGoHome = { finish() },
            )
        }
    }
}
