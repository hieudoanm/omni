package io.github.hieudoanm.block.activity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import dagger.hilt.android.AndroidEntryPoint
import io.github.hieudoanm.block.navigation.AppNavGraph
import io.github.hieudoanm.block.repository.FocusRepository
import io.github.hieudoanm.block.ui.theme.FocusBlockTheme
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var repository: FocusRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val darkMode by repository.darkMode.collectAsState(initial = true)
            FocusBlockTheme(darkTheme = darkMode) {
                AppNavGraph()
            }
        }
    }
}
