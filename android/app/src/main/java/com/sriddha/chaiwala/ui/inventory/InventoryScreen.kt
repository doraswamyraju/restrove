package com.sriddha.chaiwala.ui.inventory

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.InventoryAdjustRequest
import com.sriddha.chaiwala.data.model.InventoryItem
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun InventoryScreen() {
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<InventoryItem>>(emptyList()) }
    var itemToAdjust by remember { mutableStateOf<InventoryItem?>(null) }
    var adjustAmount by remember { mutableStateOf("") }
    var adjustReason by remember { mutableStateOf("Fresh Stock Received") }

    fun loadInventory() {
        scope.launch {
            try {
                items = RetrofitClient.api.getInventory().items
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(Unit) {
        loadInventory()
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                Text("Milk & Stock Inventory", fontWeight = FontWeight.Black, fontSize = 17.sp, color = BrandGreenPrimary)
                Text("Track raw materials, milk, tea powder, sugar, and buns in SQLite.", color = TextMuted, fontSize = 11.sp)
            }

            items(items) { item ->
                val isLowStock = item.currentStock <= item.minStockAlert
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(item.name, fontWeight = FontWeight.Black, fontSize = 14.sp)
                            Text("Category: ${item.category}", color = TextMuted, fontSize = 11.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                color = if (isLowStock) Color(0xFFFEE2E2) else Color(0xFFECFDF5),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = if (isLowStock) "Low Stock Alert (<${item.minStockAlert}${item.unit})" else "Good Stock",
                                    color = if (isLowStock) Color(0xFFDC2626) else Color(0xFF047857),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${"%.1f".format(item.currentStock)} ${item.unit}",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                color = if (isLowStock) Color.Red else BrandGreenPrimary
                            )
                            Button(
                                onClick = { itemToAdjust = item },
                                colors = ButtonDefaults.buttonColors(containerColor = BrandGreenLight),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text("Adjust", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Adjust Dialog
        if (itemToAdjust != null) {
            val it = itemToAdjust!!
            AlertDialog(
                onDismissRequest = { itemToAdjust = null },
                title = { Text("Adjust ${it.name}", fontWeight = FontWeight.Black) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Current stock: ${it.currentStock} ${it.unit}", fontSize = 12.sp)
                        OutlinedTextField(
                            value = adjustAmount,
                            onValueChange = { adjustAmount = it },
                            placeholder = { Text("Delta (e.g. +10 or -2)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = adjustReason,
                            onValueChange = { adjustReason = it },
                            placeholder = { Text("Reason (e.g. Restock, Spoilage)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val amt = adjustAmount.toDoubleOrNull() ?: 0.0
                            scope.launch {
                                RetrofitClient.api.adjustInventory(
                                    InventoryAdjustRequest(it.id, amt, adjustReason)
                                )
                                itemToAdjust = null
                                adjustAmount = ""
                                loadInventory()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                    ) {
                        Text("Apply")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { itemToAdjust = null }) { Text("Cancel") }
                }
            )
        }
    }
}
