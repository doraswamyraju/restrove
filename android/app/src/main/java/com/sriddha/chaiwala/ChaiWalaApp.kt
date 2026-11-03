package com.sriddha.chaiwala

import android.app.Application
import com.sriddha.chaiwala.sound.SoundHelper

class ChaiWalaApp : Application() {

    override fun onCreate() {
        super.onCreate()
        SoundHelper.initNotificationChannel(this)
    }
}

