package com.sriddha.chaiwala.data.api

import android.content.Context
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.sriddha.chaiwala.data.model.Order
import com.sriddha.chaiwala.sound.SoundHelper
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import okhttp3.Request
import okhttp3.Response
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources

object OrderSseListener {

    private val _newOrderEvents = MutableSharedFlow<Order>(extraBufferCapacity = 10)
    val newOrderEvents = _newOrderEvents.asSharedFlow()

    private val _statusUpdateEvents = MutableSharedFlow<Pair<String, String>>(extraBufferCapacity = 10)
    val statusUpdateEvents = _statusUpdateEvents.asSharedFlow()

    private var eventSource: EventSource? = null
    private val gson = Gson()

    fun startListening(context: Context) {
        if (eventSource != null) return

        val sseUrl = "${RetrofitClient.baseUrl}orders/live-stream"
        val request = Request.Builder()
            .url(sseUrl)
            .header("Accept", "text/event-stream")
            .build()

        val factory = EventSources.createFactory(RetrofitClient.rawOkHttpClient)
        eventSource = factory.newEventSource(request, object : EventSourceListener() {
            override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                try {
                    val json = gson.fromJson(data, JsonObject::class.java)
                    val eventType = json.get("type")?.asString

                    if (eventType == "new_order") {
                        val orderJson = json.get("order")
                        val order = gson.fromJson(orderJson, Order::class.java)
                        if (order != null) {
                            SoundHelper.playCounterChime(context)
                            SoundHelper.showOrderNotification(
                                context,
                                "🔔 New Order: ${order.orderNumber}",
                                "${order.serviceType} • ₹${order.amount} - ${order.customerName ?: "Guest"}"
                            )
                            _newOrderEvents.tryEmit(order)
                        }
                    } else if (eventType == "order_status_update") {
                        val orderNumber = json.get("orderNumber")?.asString ?: ""
                        val status = json.get("status")?.asString ?: ""
                        _statusUpdateEvents.tryEmit(orderNumber to status)
                    }
                } catch (e: Exception) {
                    // Ignore malformed ping
                }
            }

            override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                // Reconnect will happen on next poll or lifecycle resume
            }
        })
    }

    fun stopListening() {
        eventSource?.cancel()
        eventSource = null
    }
}

