package io.github.hieudoanm.block.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import io.github.hieudoanm.block.ui.apps.AppListScreen
import io.github.hieudoanm.block.ui.home.HomeScreen
import io.github.hieudoanm.block.ui.settings.SettingsScreen

object Routes {
    const val HOME = "home"
    const val APP_LIST = "app_list"
    const val SETTINGS = "settings"
}

@Composable
fun AppNavGraph(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(
                onNavigateToAppList = { navController.navigate(Routes.APP_LIST) },
                onNavigateToSettings = { navController.navigate(Routes.SETTINGS) },
            )
        }
        composable(Routes.APP_LIST) {
            AppListScreen(
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
