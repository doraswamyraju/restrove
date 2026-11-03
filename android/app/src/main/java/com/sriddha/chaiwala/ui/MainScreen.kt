package com.sriddha.chaiwala.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.OrderSseListener
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.ui.components.ChaiWalaTopBar
import com.sriddha.chaiwala.ui.customers.CustomersScreen
import com.sriddha.chaiwala.ui.inventory.InventoryScreen
import com.sriddha.chaiwala.ui.menu.MenuScreen
import com.sriddha.chaiwala.ui.orders.OrdersScreen
import com.sriddha.chaiwala.ui.pos.PosScreen
import com.sriddha.chaiwala.ui.reports.ReportsScreen
import com.sriddha.chaiwala.ui.settings.SettingsScreen
import com.sriddha.chaiwala.ui.theme.*
import com.sriddha.chaiwala.ui.wallet.WalletScreen

enum class MainTab(val title: String, val icon: ImageVector) {
    POS("POS", Icons.Default.PointOfSale),
    ORDERS("Orders", Icons.Default.ReceiptLong),
    WALLET("Wallet", Icons.Default.AccountBalanceWallet),
    MENU("Menu", Icons.Default.LocalCafe),
    MORE("More", Icons.Default.MoreHoriz)
}

@Composable
fun MainScreen() {
    var currentTab by remember { mutableStateOf(MainTab.POS) }
    var moreSubTab by remember { mutableStateOf("inventory") } // "inventory", "customers", "reports", "settings"
    var ordersCount by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        try {
            val res = RetrofitClient.api.getOrders()
            ordersCount = res.counts.all
        } catch (e: Exception) {}

        OrderSseListener.newOrderEvents.collect {
            ordersCount++
        }
    }

    Scaffold(
        topBar = {
            ChaiWalaTopBar(
                title = "CHAI WALA ORIGINAL",
                subtitle = "Main Branch • Cashier Counter"
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                MainTab.values().forEach { tab ->
                    val isSelected = currentTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentTab = tab },
                        icon = {
                            BadgedBox(
                                badge = {
                                    if (tab == MainTab.ORDERS && ordersCount > 0) {
                                        Badge(containerColor = BrandGreenLight) {
                                            Text("$ordersCount")
                                        }
                                    }
                                }
                            ) {
                                Icon(
                                    tab.icon,
                                    contentDescription = tab.title,
                                    tint = if (isSelected) BrandGreenPrimary else TextMuted
                                )
                            }
                        },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                color = if (isSelected) BrandGreenPrimary else TextMuted
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = Color(0xFFECFDF5)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            when (currentTab) {
                MainTab.POS -> PosScreen()
                MainTab.ORDERS -> OrdersScreen()
                MainTab.WALLET -> WalletScreen()
                MainTab.MENU -> MenuScreen()
                MainTab.MORE -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Sub navigation bar inside More
                        Surface(color = Color.White, shadowElevation = 1.dp) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 8.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                listOf(
                                    "inventory" to "Inventory",
                                    "customers" to "CRM",
                                    "reports" to "Reports",
                                    "settings" to "Settings"
                                ).forEach { (key, label) ->
                                    val isSelected = moreSubTab == key
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { moreSubTab = key },
                                        label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = BrandGreenPrimary,
                                            selectedLabelColor = Color.White
                                        )
                                    )
                                }
                            }
                        }

                        Box(modifier = Modifier.fillMaxSize()) {
                            when (moreSubTab) {
                                "inventory" -> InventoryScreen()
                                "customers" -> CustomersScreen()
                                "reports" -> ReportsScreen()
                                "settings" -> SettingsScreen()
                            }
                        }
                    }
                }
            }
        }
    }
}
