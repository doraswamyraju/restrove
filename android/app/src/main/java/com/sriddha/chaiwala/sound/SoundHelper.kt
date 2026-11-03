package com.sriddha.chaiwala.sound

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

object SoundHelper {

    private const val CHANNEL_ID = "chai_wala_orders"
    private const val CHANNEL_NAME = "Live Cafeteria Orders"

    fun playCounterChime(context: Context) {
        CoroutineScope(Dispatchers.Default).launch {
            try {
                val toneGen = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
                // Pleasant 2-tone restaurant chime (High G -> High C)
                toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 150)
                delay(120)
                toneGen.startTone(ToneGenerator.TONE_PROP_ACK, 200)
                delay(250)
                toneGen.release()
            } catch (e: Exception) {
                // Ignore audio hardware error
            }
        }
    }

    fun initNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time alerts for incoming cafeteria token orders"
                enableVibration(true)
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    fun showOrderNotification(context: Context, title: String, message: String) {
        initNotificationChannel(context)
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .build()

        manager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
