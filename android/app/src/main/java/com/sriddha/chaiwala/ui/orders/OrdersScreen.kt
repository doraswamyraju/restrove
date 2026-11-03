package com.sriddha.chaiwala.ui.orders

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.OrderSseListener
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.Order
import com.sriddha.chaiwala.data.model.OrderStatusRequest
import com.sriddha.chaiwala.data.model.OrdersCounts
import com.sriddha.chaiwala.printer.ThermalPrinterHelper
import com.sriddha.chaiwala.ui.components.StatusBadge
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var orders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var counts by remember { mutableStateOf(OrdersCounts()) }
    var activeFilter by remember { mutableStateOf("All Orders") }
    var searchQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    var selectedOrder by remember { mutableStateOf<Order?>(null) }
    var orderToDelete by remember { mutableStateOf<Order?>(null) }

    fun loadOrders() {
        scope.launch {
            isLoading = true
            try {
                val serviceTypeParam = if (activeFilter == "All Orders") null else activeFilter
                val res = RetrofitClient.api.getOrders(serviceType = serviceTypeParam, search = searchQuery.ifBlank { null })
                orders = res.orders
                counts = res.counts
            } catch (e: Exception) {
                // handle error
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(activeFilter, searchQuery) {
        loadOrders()
    }

    // Auto-refresh when new order arrives via SSE
    LaunchedEffect(Unit) {
        OrderSseListener.newOrderEvents.collect {
            loadOrders()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Bar & Search
            Surface(color = Color.White, shadowElevation = 1.dp) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Orders Management", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)
                            Text("Live SQLite Database Orders", color = TextMuted, fontSize = 11.sp)
                        }

                        IconButton(onClick = { loadOrders() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = BrandGreenPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search by Order # or Mobile...", fontSize = 12.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().height(46.dp),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }

            // Real DB Filter Chips
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val filterList = listOf(
                    "All Orders" to counts.all,
                    "Dine In" to counts.dineIn,
                    "Takeaway" to counts.takeaway,
                    "Delivery" to counts.delivery,
                    "Online" to counts.online
                )

                items(filterList) { (name, count) ->
                    val isSelected = activeFilter == name
                    FilterChip(
                        selected = isSelected,
                        onClick = { activeFilter = name },
                        label = {
                            Text(
                                text = "$name ($count)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandGreenPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Orders List
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(orders) { order ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedOrder = order },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = order.orderNumber,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp,
                                        color = BrandGreenPrimary
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "• ${order.serviceType}",
                                        fontSize = 12.sp,
                                        color = TextMuted,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }

                                StatusBadge(order.orderStatus)
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (!order.customerName.isNullOrEmpty()) "${order.customerName} (${order.details})" else order.details,
                                    fontSize = 12.sp,
                                    color = TextDark
                                )

                                Text(
                                    text = "₹${"%.2f".format(order.amount)}",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 15.sp,
                                    color = BrandGreenPrimary
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${order.paymentMethod} • ${order.time ?: ""}",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )

                                Row {
                                    IconButton(
                                        onClick = {
                                            ThermalPrinterHelper.printReceipt(context as Activity, order)
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Print, contentDescription = "Print", tint = BrandGreenLight, modifier = Modifier.size(18.dp))
                                    }

                                    IconButton(
                                        onClick = { orderToDelete = order },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = Color.Red, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Order Details Bottom Sheet
        if (selectedOrder != null) {
            val order = selectedOrder!!
            ModalBottomSheet(
                onDismissRequest = { selectedOrder = null },
                containerColor = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp)
                        .padding(bottom = 24.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(order.orderNumber, fontWeight = FontWeight.Black, fontSize = 18.sp, color = BrandGreenPrimary)
                            Text("${order.serviceType} • ${order.details}", color = TextMuted, fontSize = 12.sp)
                        }

                        StatusBadge(order.orderStatus)
                    }

                    // Quick "Mark as Completed" Banner if In Progress
                    if (order.orderStatus != "Completed") {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            color = Color(0xFFECFDF5),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFA7F3D0))
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Order in progress", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF065F46))
                                Button(
                                    onClick = {
                                        scope.launch {
                                            RetrofitClient.api.updateOrderStatus(order.id, OrderStatusRequest("Completed"))
                                            loadOrders()
                                            selectedOrder = order.copy(orderStatus = "Completed")
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandGreenLight),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Mark Completed", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text("Ordered Items", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextMuted)
                    Spacer(modifier = Modifier.height(6.dp))

                    LazyColumn(modifier = Modifier.heightIn(max = 200.dp)) {
                        items(order.items) { it ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("${it.displayQty} × ${it.displayName}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                Text("₹${"%.2f".format(if (it.amount > 0) it.amount else it.displayQty * it.rate)}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }

                    Divider(modifier = Modifier.padding(vertical = 10.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Subtotal", color = TextMuted, fontSize = 12.sp)
                        Text("₹${"%.2f".format(order.subtotal ?: (order.amount * 0.95))}", fontSize = 12.sp)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("GST (5%)", color = TextMuted, fontSize = 12.sp)
                        Text("₹${"%.2f".format(order.taxAmount ?: (order.amount * 0.05))}", fontSize = 12.sp)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Paid", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)
                        Text("₹${"%.2f".format(order.amount)}", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                ThermalPrinterHelper.printReceipt(context as Activity, order)
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                        ) {
                            Icon(Icons.Default.Print, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Print Bill", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = { selectedOrder = null },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Close", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Delete Confirmation Dialog
        if (orderToDelete != null) {
            AlertDialog(
                onDismissRequest = { orderToDelete = null },
                title = { Text("Delete Order", fontWeight = FontWeight.Black) },
                text = { Text("Are you sure you want to permanently delete order ${orderToDelete!!.orderNumber} from SQLite database?") },
                confirmButton = {
                    Button(
                        onClick = {
                            val order = orderToDelete!!
                            scope.launch {
                                RetrofitClient.api.deleteOrder(order.id)
                                loadOrders()
                                orderToDelete = null
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                    ) {
                        Text("Delete", color = Color.White)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { orderToDelete = null }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
