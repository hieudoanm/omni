package io.github.hieudoanm.block.activity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.block.navigation.AppNavGraph
import io.github.hieudoanm.block.ui.theme.FocusBlockTheme

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FocusBlockTheme {
                AppNavGraph()
            }
        }
    }
}
