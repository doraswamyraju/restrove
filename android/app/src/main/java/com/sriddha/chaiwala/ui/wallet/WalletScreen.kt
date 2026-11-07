package com.sriddha.chaiwala.ui.wallet

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.*
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun WalletScreen() {
    val scope = rememberCoroutineScope()

    var searchQuery by remember { mutableStateOf("") }
    var customers by remember { mutableStateOf<List<Customer>>(emptyList()) }
    var selectedCustomer by remember { mutableStateOf<Customer?>(null) }
    var transactions by remember { mutableStateOf<List<WalletTransaction>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

    // Deposit State
    var depositAmount by remember { mutableStateOf("") }
    var paymentRail by remember { mutableStateOf("UPI") }
    var depositNotes by remember { mutableStateOf("") }
    var isSubmittingDeposit by remember { mutableStateOf(false) }

    fun loadCustomerData(cust: Customer) {
        selectedCustomer = cust
        scope.launch {
            try {
                val detail = RetrofitClient.api.getCustomerDetails(cust.id)
                if (detail.customer != null) {
                    selectedCustomer = detail.customer
                }
                transactions = detail.transactions
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(searchQuery) {
        try {
            val res = RetrofitClient.api.getCustomers(search = searchQuery.ifBlank { null }, filter = "has_balance")
            customers = res.customers
            if (selectedCustomer == null && customers.isNotEmpty()) {
                loadCustomerData(customers.first())
            }
        } catch (e: Exception) {}
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // Header
            item {
                Text(
                    text = "Customer Wallet & Advance Ledger",
                    fontWeight = FontWeight.Black,
                    fontSize = 17.sp,
                    color = BrandGreenPrimary
                )
                Text(
                    text = "Accept advance deposits, view real-time balances, and track deductions.",
                    color = TextMuted,
                    fontSize = 11.sp
                )
            }

            // Customer Selector Strip
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search customer by name or mobile...", fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(customers) { cust ->
                        val isSelected = selectedCustomer?.id == cust.id
                        FilterChip(
                            selected = isSelected,
                            onClick = { loadCustomerData(cust) },
                            label = {
                                Text(
                                    text = "${cust.name} (₹${cust.walletBalance.toInt()})",
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandGreenPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }

            // Active Balance Hero Card
            if (selectedCustomer != null) {
                val cust = selectedCustomer!!
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = BrandGreenDark)
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Wallet, contentDescription = null, tint = Color(0xFFA7F3D0), modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("ACTIVE ADVANCE BALANCE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA7F3D0))
                                }
                                Surface(
                                    color = Color(0x33A7F3D0),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = cust.phone,
                                        color = Color(0xFFA7F3D0),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "₹${"%.2f".format(cust.walletBalance)}",
                                fontWeight = FontWeight.Black,
                                fontSize = 32.sp,
                                color = Color.White
                            )

                            Text(
                                text = "Customer: ${cust.name} • Available for Token Deductions",
                                color = Color(0xFFD1FAE5),
                                fontSize = 11.sp
                            )

                            Spacer(modifier = Modifier.height(14.dp))
                            Divider(color = Color(0x22FFFFFF))
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("TOTAL LIFETIME SPENT", fontSize = 9.sp, color = Color(0xFFA7F3D0), fontWeight = FontWeight.Bold)
                                    Text("₹${"%.2f".format(cust.totalSpent)}", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                                Column {
                                    Text("TOTAL VISITS", fontSize = 9.sp, color = Color(0xFFA7F3D0), fontWeight = FontWeight.Bold)
                                    Text("${cust.visitCount} tokens", fontSize = 13.sp, fontWeight = FontWeight.Black, color = Color.White)
                                }
                            }
                        }
                    }
                }

                // Deposit Advance Section
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "Deposit Advance to Wallet",
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                color = BrandGreenPrimary
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            // Quick Amount Chips
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf("200", "500", "1000", "2000").forEach { chipAmount ->
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(8.dp))
                                            .background(Color(0xFFECFDF5))
                                            .clickable { depositAmount = chipAmount }
                                            .padding(vertical = 6.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("+₹$chipAmount", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF047857))
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = depositAmount,
                                onValueChange = { depositAmount = it },
                                placeholder = { Text("Enter custom amount (₹)", fontSize = 12.sp) },
                                leadingIcon = { Text("₹", fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 12.dp)) },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(10.dp)
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            // Payment Rail
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf("UPI", "Cash", "Card").forEach { rail ->
                                    val isSelected = paymentRail == rail
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .border(1.dp, if (isSelected) BrandGreenPrimary else CardBorder, RoundedCornerShape(8.dp))
                                            .background(if (isSelected) Color(0xFFECFDF5) else Color.White)
                                            .clickable { paymentRail = rail }
                                            .padding(vertical = 6.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(rail, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = if (isSelected) BrandGreenPrimary else TextDark)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Button(
                                onClick = {
                                    val amt = depositAmount.toDoubleOrNull() ?: 0.0
                                    if (amt > 0) {
                                        scope.launch {
                                            isSubmittingDeposit = true
                                            try {
                                                RetrofitClient.api.adjustCustomerWallet(
                                                    cust.id,
                                                    WalletAdjustRequest(
                                                        amount = amt,
                                                        type = "deposit",
                                                        paymentRail = paymentRail,
                                                        notes = "Advance deposit via Android POS"
                                                    )
                                                )
                                                depositAmount = ""
                                                loadCustomerData(cust)
                                            } catch (e: Exception) {}
                                            finally { isSubmittingDeposit = false }
                                        }
                                    }
                                },
                                enabled = !isSubmittingDeposit && depositAmount.isNotBlank(),
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandGreenLight)
                            ) {
                                Text(if (isSubmittingDeposit) "Depositing..." else "Submit Advance Deposit", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }

                // Live Ledger Section
                item {
                    Text(
                        text = "Live Wallet Ledger & Deductions (${transactions.size})",
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp,
                        color = BrandGreenPrimary
                    )
                }

                items(transactions) { tx ->
                    val isPositive = tx.amount > 0
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = tx.notes ?: if (isPositive) "Advance Deposit" else "Order Token Payment",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = TextDark
                                )
                                Text(
                                    text = "${tx.type} • ${tx.createdAt?.take(16) ?: ""}",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = if (isPositive) "+₹${"%.2f".format(tx.amount)}" else "-₹${"%.2f".format(-tx.amount)}",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    color = if (isPositive) Color(0xFF16A34A) else Color(0xFFDC2626)
                                )
                                Text(
                                    text = "Bal: ₹${"%.2f".format(tx.balanceAfter)}",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

