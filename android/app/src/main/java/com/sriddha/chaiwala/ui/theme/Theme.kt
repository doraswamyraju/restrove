package com.sriddha.chaiwala.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BrandGreenPrimary,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = BrandGreenDark,
    onPrimaryContainer = androidx.compose.ui.graphics.Color.White,
    secondary = BrandGold,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = SurfaceParchment,
    surface = androidx.compose.ui.graphics.Color.White,
    onSurface = TextDark
)

@Composable
fun ChaiWalaTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = BrandGreenDark.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
