package com.sriddha.chaiwala.ui.customers

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
import com.sriddha.chaiwala.data.model.Customer
import com.sriddha.chaiwala.data.model.CustomerStatsResponse
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun CustomersScreen() {
    val scope = rememberCoroutineScope()
    var stats by remember { mutableStateOf(CustomerStatsResponse()) }
    var customers by remember { mutableStateOf<List<Customer>>(emptyList()) }
    var searchQuery by remember { mutableStateOf("") }
    var isAddOpen by remember { mutableStateOf(false) }

    var newName by remember { mutableStateOf("") }
    var newPhone by remember { mutableStateOf("") }
    var newEmail by remember { mutableStateOf("") }

    fun loadData() {
        scope.launch {
            try {
                stats = RetrofitClient.api.getCustomerStats()
                customers = RetrofitClient.api.getCustomers(search = searchQuery.ifBlank { null }).customers
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(searchQuery) {
        loadData()
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Regular Customers & CRM", fontWeight = FontWeight.Black, fontSize = 17.sp, color = BrandGreenPrimary)
                        Text("Customer database, advance balances, and visits.", color = TextMuted, fontSize = 11.sp)
                    }

                    Button(
                        onClick = { isAddOpen = true },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreenLight),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Top KPI Summary Cards (2x2 grid)
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("CUSTOMERS", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("${stats.totalCustomers}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = BrandGreenPrimary)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("ADVANCE HELD", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("₹${"%.0f".format(stats.totalWalletBalance)}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color(0xFF047857))
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("REVENUE", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("₹${"%.0f".format(stats.totalLifetimeSpent)}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = BrandGold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("AVG VISITS", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("${stats.avgVisits} times", fontSize = 18.sp, fontWeight = FontWeight.Black, color = TextDark)
                        }
                    }
                }
            }

            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by name, phone or email...", fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            items(customers) { cust ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
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
                            Column {
                                Text(cust.name, fontWeight = FontWeight.Black, fontSize = 14.sp)
                                Text(cust.phone, color = TextMuted, fontSize = 12.sp)
                            }
                            Surface(
                                color = Color(0xFFECFDF5),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    "₹${"%.2f".format(cust.walletBalance)}",
                                    color = Color(0xFF047857),
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Spent ₹${cust.totalSpent.toInt()} • ${cust.visitCount} visits",
                                color = TextMuted,
                                fontSize = 11.sp
                            )

                            IconButton(
                                onClick = {
                                    scope.launch {
                                        RetrofitClient.api.deleteCustomer(cust.id)
                                        loadData()
                                    }
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.DeleteOutline, contentDescription = null, tint = Color.Red, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }

        // Add Customer Dialog
        if (isAddOpen) {
            AlertDialog(
                onDismissRequest = { isAddOpen = false },
                title = { Text("Add Customer", fontWeight = FontWeight.Black) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = newName,
                            onValueChange = { newName = it },
                            placeholder = { Text("Customer Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = newPhone,
                            onValueChange = { newPhone = it },
                            placeholder = { Text("Mobile Number") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = newEmail,
                            onValueChange = { newEmail = it },
                            placeholder = { Text("Email (Optional)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (newName.isNotBlank() && newPhone.isNotBlank()) {
                                scope.launch {
                                    RetrofitClient.api.createCustomer(
                                        mapOf("name" to newName, "phone" to newPhone, "email" to newEmail)
                                    )
                                    isAddOpen = false
                                    newName = ""
                                    newPhone = ""
                                    newEmail = ""
                                    loadData()
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                    ) {
                        Text("Add Customer")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { isAddOpen = false }) { Text("Cancel") }
                }
            )
        }
    }
}
