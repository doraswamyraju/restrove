package com.sriddha.chaiwala.ui.reports

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.ReportsSummary
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ReportsScreen() {
    val scope = rememberCoroutineScope()
    var selectedRange by remember { mutableStateOf("Today") }
    var summary by remember { mutableStateOf<ReportsSummary?>(null) }

    fun loadReports() {
        scope.launch {
            try {
                val res = RetrofitClient.api.getReportsSummary(selectedRange)
                summary = res.summary
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(selectedRange) {
        loadReports()
    }

    val sum = summary ?: ReportsSummary()

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                Text("Reports & Daily Analytics", fontWeight = FontWeight.Black, fontSize = 17.sp, color = BrandGreenPrimary)
                Text("Daily cafeteria sales breakdown, cash reconciliation, and performance.", color = TextMuted, fontSize = 11.sp)
            }

            // Date Range Chips
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("Today", "Yesterday", "Last 7 Days", "This Month").forEach { range ->
                        val isSelected = selectedRange == range
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedRange = range },
                            label = { Text(range, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandGreenPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }

            // Hero KPI Cards
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("NET REVENUE", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("₹${"%.2f".format(sum.totalRevenue)}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = BrandGreenPrimary)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("TOKEN ORDERS", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("${sum.totalOrders} Tokens", fontSize = 20.sp, fontWeight = FontWeight.Black, color = BrandGold)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("CASH IN DRAWER CLOSING", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("₹${"%.2f".format(sum.cashCollected)}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color(0xFF047857))
                        }
                        Surface(color = Color(0xFFECFDF5), shape = RoundedCornerShape(6.dp)) {
                            Text("Session Active", color = Color(0xFF047857), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                }
            }

            // Payment Breakdown
            item {
                Text("Payment Rail Breakdown", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
            }

            items(sum.paymentBreakdown) { p ->
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(p.method, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("₹${"%.2f".format(p.total)} (${p.count} bills)", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
                    }
                }
            }

            // Top Selling Items
            item {
                Text("Top-Selling Items", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
            }

            items(sum.topItems) { it ->
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(it.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("${it.qtySold} portions sold", fontSize = 11.sp, color = TextMuted)
                        }
                        Text("₹${"%.2f".format(it.revenue)}", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
                    }
                }
            }
        }
    }
}

