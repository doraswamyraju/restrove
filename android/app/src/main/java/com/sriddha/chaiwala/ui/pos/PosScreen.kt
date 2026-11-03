package com.sriddha.chaiwala.ui.pos

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.*
import com.sriddha.chaiwala.printer.ThermalPrinterHelper
import com.sriddha.chaiwala.ui.components.VegIndicator
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

data class CartLineItem(
    val item: MenuItem,
    var quantity: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var categories by remember { mutableStateOf<List<Category>>(emptyList()) }
    var menuItems by remember { mutableStateOf<List<MenuItem>>(emptyList()) }
    var selectedCategoryId by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    var serviceType by remember { mutableStateOf("Takeaway") }

    // Cart State
    val cart = remember { mutableStateListOf<CartLineItem>() }
    var isCartOpen by remember { mutableStateOf(false) }

    // Customer Autosuggest
    var customerPhoneQuery by remember { mutableStateOf("") }
    var selectedCustomer by remember { mutableStateOf<Customer?>(null) }
    var customerSuggestions by remember { mutableStateOf<List<Customer>>(emptyList()) }

    // Payment & Print State
    var paymentMethod by remember { mutableStateOf("UPI") }
    var isSubmitting by remember { mutableStateOf(false) }
    var lastOrderForReceipt by remember { mutableStateOf<Order?>(null) }

    // Fetch Initial Data
    LaunchedEffect(Unit) {
        try {
            val catsRes = RetrofitClient.api.getCategories()
            val itemsRes = RetrofitClient.api.getMenuItems()
            categories = catsRes.categories
            menuItems = itemsRes.items.filter { it.isAvailable == 1 }
        } catch (e: Exception) {
            // Error handling
        }
    }

    // Customer Lookup
    LaunchedEffect(customerPhoneQuery) {
        if (customerPhoneQuery.length >= 3 && selectedCustomer == null) {
            try {
                val res = RetrofitClient.api.getCustomers(search = customerPhoneQuery)
                customerSuggestions = res.customers
            } catch (e: Exception) {
                customerSuggestions = emptyList()
            }
        } else {
            customerSuggestions = emptyList()
        }
    }

    // Cart calculations
    val subtotal = cart.sumOf { it.item.price * it.quantity }
    val gstAmount = Math.round(subtotal * 0.05 * 100) / 100.0
    val totalPayable = subtotal + gstAmount
    val totalItemsCount = cart.sumOf { it.quantity }

    val filteredItems = menuItems.filter { item ->
        val matchesCat = selectedCategoryId == "All" || item.categoryId == selectedCategoryId
        val matchesSearch = item.name.contains(searchQuery, ignoreCase = true)
        matchesCat && matchesSearch
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. Search Bar & Service Type Toggle
            Surface(
                color = Color.White,
                shadowElevation = 1.dp
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search chai, coffee, buns...", fontSize = 12.sp) },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(12.dp)
                        )

                        // Dine In / Takeaway Switch
                        Row(
                            modifier = Modifier
                                .background(Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
                                .padding(2.dp)
                        ) {
                            listOf("Takeaway", "Dine In").forEach { mode ->
                                val isSelected = serviceType == mode
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(if (isSelected) BrandGreenPrimary else Color.Transparent)
                                        .clickable { serviceType = mode }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = mode,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White else TextDark
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Customer Auto-suggest search field
                    Box {
                        OutlinedTextField(
                            value = if (selectedCustomer != null) "${selectedCustomer!!.name} (${selectedCustomer!!.phone}) • Wallet ₹${selectedCustomer!!.walletBalance}" else customerPhoneQuery,
                            onValueChange = {
                                customerPhoneQuery = it
                                selectedCustomer = null
                            },
                            placeholder = { Text("Customer mobile or name for advance balance...", fontSize = 11.sp) },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = TextMuted) },
                            trailingIcon = {
                                if (selectedCustomer != null) {
                                    IconButton(onClick = {
                                        selectedCustomer = null
                                        customerPhoneQuery = ""
                                    }) {
                                        Icon(Icons.Default.Clear, contentDescription = null)
                                    }
                                }
                            },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth().height(46.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = if (selectedCustomer != null) Color(0xFFECFDF5) else Color.White,
                                unfocusedContainerColor = if (selectedCustomer != null) Color(0xFFECFDF5) else Color.White
                            )
                        )

                        // Suggestions Dropdown
                        if (customerSuggestions.isNotEmpty() && selectedCustomer == null) {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 48.dp),
                                shape = RoundedCornerShape(12.dp),
                                shadowElevation = 6.dp,
                                color = Color.White
                            ) {
                                Column(modifier = Modifier.padding(6.dp)) {
                                    customerSuggestions.take(4).forEach { cust ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable {
                                                    selectedCustomer = cust
                                                    customerSuggestions = emptyList()
                                                }
                                                .padding(8.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text(cust.name, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                                Text(cust.phone, color = TextMuted, fontSize = 10.sp)
                                            }
                                            Surface(
                                                color = Color(0xFFECFDF5),
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Text(
                                                    "₹${cust.walletBalance.toInt()} Wallet",
                                                    color = Color(0xFF047857),
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 2. Category Chips Bar
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                item {
                    val isSelected = selectedCategoryId == "All"
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategoryId = "All" },
                        label = { Text("All Items", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandGreenLight,
                            selectedLabelColor = Color.White
                        )
                    )
                }

                items(categories) { cat ->
                    val isSelected = selectedCategoryId == cat.id
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategoryId = cat.id },
                        label = { Text(cat.name, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandGreenLight,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // 3. Catalog Grid (2 columns on mobile, packed nicely)
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 90.dp)
            ) {
                items(filteredItems) { item ->
                    val inCart = cart.find { it.item.id == item.id }
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(115.dp)
                            .clickable {
                                if (inCart != null) {
                                    inCart.quantity++
                                } else {
                                    cart.add(CartLineItem(item, 1))
                                }
                            },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(10.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(item.imageEmoji ?: "☕", fontSize = 20.sp)
                                VegIndicator(item.isVeg == 1)
                            }

                            Column {
                                Text(
                                    text = item.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    color = TextDark
                                )
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "₹${"%.0f".format(item.price)}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp,
                                        color = BrandGreenPrimary
                                    )

                                    if (inCart != null) {
                                        Surface(
                                            color = BrandGreenPrimary,
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Text(
                                                text = "${inCart.quantity} in cart",
                                                color = Color.White,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    } else {
                                        Surface(
                                            color = Color(0xFFF0FDF4),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = "+ Add",
                                                color = Color(0xFF16A34A),
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. Floating Cart Summary Bar
        if (cart.isNotEmpty()) {
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(12.dp),
                shape = RoundedCornerShape(20.dp),
                color = BrandGreenDark,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "$totalItemsCount Items • ₹${"%.2f".format(totalPayable)}",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "$serviceType • 5% GST Included",
                            color = Color(0xFFA7F3D0),
                            fontSize = 11.sp
                        )
                    }

                    Button(
                        onClick = { isCartOpen = true },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGold),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "View Cart & Bill",
                            fontWeight = FontWeight.Black,
                            color = BrandGreenDark,
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null, tint = BrandGreenDark, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        // 5. Cart Bottom Sheet
        if (isCartOpen) {
            ModalBottomSheet(
                onDismissRequest = { isCartOpen = false },
                containerColor = Color.White
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp)
                        .padding(bottom = 20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Counter Token Billing",
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            color = BrandGreenPrimary
                        )
                        Text(
                            text = "$totalItemsCount Items",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Line Items
                    LazyColumn(
                        modifier = Modifier.heightIn(max = 240.dp)
                    ) {
                        items(cart) { line ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(line.item.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text("₹${line.item.price} each", color = TextMuted, fontSize = 11.sp)
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    IconButton(
                                        onClick = {
                                            if (line.quantity > 1) {
                                                line.quantity--
                                            } else {
                                                cart.remove(line)
                                            }
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.RemoveCircleOutline, contentDescription = null)
                                    }

                                    Text(
                                        text = "${line.quantity}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 13.sp
                                    )

                                    IconButton(
                                        onClick = { line.quantity++ },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.AddCircleOutline, contentDescription = null)
                                    }

                                    Text(
                                        text = "₹${"%.2f".format(line.item.price * line.quantity)}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        modifier = Modifier.width(60.dp)
                                    )
                                }
                            }
                        }
                    }

                    Divider(modifier = Modifier.padding(vertical = 10.dp))

                    // Payment Method selector
                    Text("Payment Method", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("UPI", "Cash", "Wallet", "Card").forEach { method ->
                            val isSelected = paymentMethod == method
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(
                                        1.dp,
                                        if (isSelected) BrandGreenPrimary else CardBorder,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .background(if (isSelected) Color(0xFFECFDF5) else Color.White)
                                    .clickable { paymentMethod = method }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = method,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                    color = if (isSelected) BrandGreenPrimary else TextDark
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Totals
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Subtotal", color = TextMuted, fontSize = 12.sp)
                        Text("₹${"%.2f".format(subtotal)}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("GST (5%)", color = TextMuted, fontSize = 12.sp)
                        Text("₹${"%.2f".format(gstAmount)}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total Payable", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)
                        Text("₹${"%.2f".format(totalPayable)}", fontWeight = FontWeight.Black, fontSize = 18.sp, color = BrandGreenPrimary)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Checkout & Print Button
                    Button(
                        onClick = {
                            scope.launch {
                                isSubmitting = true
                                try {
                                    val req = CreateOrderRequest(
                                        customerPhone = selectedCustomer?.phone ?: customerPhoneQuery.ifBlank { null },
                                        customerName = selectedCustomer?.name,
                                        serviceType = serviceType,
                                        details = if (serviceType == "Dine In") "Table Order" else "Counter Pickup",
                                        items = cart.map {
                                            CreateOrderItemRequest(
                                                itemId = it.item.id,
                                                name = it.item.name,
                                                rate = it.item.price,
                                                quantity = it.quantity
                                            )
                                        },
                                        paymentMethod = paymentMethod,
                                        status = "Completed"
                                    )
                                    val res = RetrofitClient.api.createOrder(req)
                                    if (res.success && res.order != null) {
                                        lastOrderForReceipt = res.order
                                        ThermalPrinterHelper.printReceipt(context as Activity, res.order)
                                        cart.clear()
                                        selectedCustomer = null
                                        customerPhoneQuery = ""
                                        isCartOpen = false
                                    }
                                } catch (e: Exception) {
                                    // Handle failure
                                } finally {
                                    isSubmitting = false
                                }
                            }
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                    ) {
                        Icon(Icons.Default.Print, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isSubmitting) "Generating Token..." else "Print Token & Pay (₹${"%.2f".format(totalPayable)})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

