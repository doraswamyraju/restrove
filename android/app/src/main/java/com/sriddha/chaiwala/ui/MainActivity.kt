package com.sriddha.chaiwala.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.sriddha.chaiwala.data.api.OrderSseListener
import com.sriddha.chaiwala.ui.theme.ChaiWalaTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Start real-time order listener for live notifications & chime
        OrderSseListener.startListening(this)

        setContent {
            ChaiWalaTheme {
                MainScreen()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        OrderSseListener.stopListening()
    }
}
