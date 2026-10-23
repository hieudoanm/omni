package io.github.hieudoanm.nfc.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import io.github.hieudoanm.omni.R

private val DarkColorScheme = darkColorScheme(
    primary = HudPrimary,
    onPrimary = HudBackground,
    primaryContainer = HudPrimaryDim,
    onPrimaryContainer = HudText,
    secondary = HudSecondary,
    onSecondary = HudBackground,
    background = HudBackground,
    onBackground = HudText,
    surface = HudSurface,
    onSurface = HudText,
    surfaceVariant = HudSurfaceVariant,
    onSurfaceVariant = HudMuted,
    outline = HudBorder,
)

private val LightColorScheme = lightColorScheme(
    primary = HudLightPrimary,
    onPrimary = Color.White,
    primaryContainer = HudLightSurfaceVariant,
    onPrimaryContainer = HudLightText,
    secondary = HudLightSecondary,
    onSecondary = Color.White,
    background = HudLightBackground,
    onBackground = HudLightText,
    surface = HudLightSurface,
    onSurface = HudLightText,
    surfaceVariant = HudLightSurfaceVariant,
    onSurfaceVariant = HudLightMuted,
    outline = HudLightBorder,
)

private val Orbitron = FontFamily(Font(R.font.orbitron))
private val DMMono = FontFamily(
    Font(R.font.dmmono_regular),
    Font(R.font.dmmono_medium, FontWeight.Medium),
)

private fun hudStyle(family: FontFamily, weight: FontWeight, size: Int) =
    TextStyle(fontFamily = family, fontWeight = weight, fontSize = size.sp)

// Orbitron for display/title/label roles, DM Mono for body text — matching the
// web baseline's HUD typography.
private val HudTypography = Typography(
    displayLarge = hudStyle(Orbitron, FontWeight.Black, 57),
    displayMedium = hudStyle(Orbitron, FontWeight.Black, 45),
    displaySmall = hudStyle(Orbitron, FontWeight.Bold, 36),
    headlineLarge = hudStyle(Orbitron, FontWeight.Bold, 32),
    headlineMedium = hudStyle(Orbitron, FontWeight.Bold, 28),
    headlineSmall = hudStyle(Orbitron, FontWeight.Bold, 24),
    titleLarge = hudStyle(Orbitron, FontWeight.Bold, 22),
    titleMedium = hudStyle(Orbitron, FontWeight.Bold, 16),
    titleSmall = hudStyle(Orbitron, FontWeight.Bold, 14),
    labelLarge = hudStyle(Orbitron, FontWeight.Bold, 14),
    labelMedium = hudStyle(Orbitron, FontWeight.Bold, 12),
    labelSmall = hudStyle(Orbitron, FontWeight.Bold, 11),
    bodyLarge = hudStyle(DMMono, FontWeight.Normal, 16),
    bodyMedium = hudStyle(DMMono, FontWeight.Normal, 14),
    bodySmall = hudStyle(DMMono, FontWeight.Normal, 12),
)

@Composable
fun NfcToolkitTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            @Suppress("DEPRECATION")
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = HudTypography,
        content = content,
    )
}
