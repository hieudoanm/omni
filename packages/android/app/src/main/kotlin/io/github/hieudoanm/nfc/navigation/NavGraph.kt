package io.github.hieudoanm.nfc.navigation

import android.nfc.NfcAdapter
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import io.github.hieudoanm.nfc.ui.home.HomeScreen
import io.github.hieudoanm.nfc.ui.history.HistoryScreen
import io.github.hieudoanm.nfc.ui.settings.SettingsScreen

object Routes {
    const val HOME = "home"
    const val HISTORY = "history"
    const val SETTINGS = "settings"
    const val READ_DETAIL = "read_detail/{tagId}"
}

@Composable
fun AppNavGraph(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            val context = LocalContext.current
            val nfcAdapter = remember { NfcAdapter.getDefaultAdapter(context) }
            HomeScreen(
                onNavigateToHistory = { navController.navigate(Routes.HISTORY) },
                onNavigateToSettings = { navController.navigate(Routes.SETTINGS) },
                nfcSupported = nfcAdapter != null,
                nfcEnabled = nfcAdapter?.isEnabled == true,
            )
        }
        composable(Routes.HISTORY) {
            HistoryScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }
    }
}
