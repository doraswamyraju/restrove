package com.sriddha.chaiwala.ui.menu

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.data.api.RetrofitClient
import com.sriddha.chaiwala.data.model.Category
import com.sriddha.chaiwala.data.model.MenuItem
import com.sriddha.chaiwala.ui.components.VegIndicator
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuScreen() {
    val scope = rememberCoroutineScope()

    var categories by remember { mutableStateOf<List<Category>>(emptyList()) }
    var items by remember { mutableStateOf<List<MenuItem>>(emptyList()) }
    var selectedCatId by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }

    var isAddModalOpen by remember { mutableStateOf(false) }
    var newItemName by remember { mutableStateOf("") }
    var newItemPrice by remember { mutableStateOf("") }
    var newItemTag by remember { mutableStateOf("Fresh") }
    var newItemDesc by remember { mutableStateOf("") }

    fun loadData() {
        scope.launch {
            try {
                categories = RetrofitClient.api.getCategories().categories
                items = RetrofitClient.api.getMenuItems().items
            } catch (e: Exception) {}
        }
    }

    LaunchedEffect(Unit) {
        loadData()
    }

    val filteredItems = items.filter { item ->
        val matchesCat = selectedCatId == "All" || item.categoryId == selectedCatId
        val matchesSearch = item.name.contains(searchQuery, ignoreCase = true)
        matchesCat && matchesSearch
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Surface(color = Color.White, shadowElevation = 1.dp) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Menu & Catalog Editor", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)
                            Text("${items.size} Menu Items in SQLite", color = TextMuted, fontSize = 11.sp)
                        }

                        Button(
                            onClick = { isAddModalOpen = true },
                            colors = ButtonDefaults.buttonColors(containerColor = BrandGreenLight),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("New Item", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search menu items...", fontSize = 12.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().height(46.dp),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }

            // Categories
            LazyRow(
                modifier = Modifier.fillMaxWidth().background(Color.White).padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedCatId == "All",
                        onClick = { selectedCatId = "All" },
                        label = { Text("All", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    )
                }
                items(categories) { c ->
                    FilterChip(
                        selected = selectedCatId == c.id,
                        onClick = { selectedCatId = c.id },
                        label = { Text(c.name, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    )
                }
            }

            // Menu Items List
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(filteredItems) { item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                                Text(item.imageEmoji ?: "☕", fontSize = 24.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        VegIndicator(item.isVeg == 1)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(item.name, fontWeight = FontWeight.Black, fontSize = 13.sp)
                                    }
                                    Text(
                                        text = item.description ?: (item.tag ?: "Fresh"),
                                        fontSize = 11.sp,
                                        color = TextMuted,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = "₹${"%.2f".format(item.price)}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 13.sp,
                                        color = BrandGreenPrimary
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                // Availability Switch
                                Switch(
                                    checked = item.isAvailable == 1,
                                    onCheckedChange = { checked ->
                                        scope.launch {
                                            RetrofitClient.api.toggleItemAvailability(item.id, mapOf("isAvailable" to checked))
                                            loadData()
                                        }
                                    },
                                    colors = SwitchDefaults.colors(checkedThumbColor = BrandGreenPrimary)
                                )

                                IconButton(
                                    onClick = {
                                        scope.launch {
                                            RetrofitClient.api.deleteMenuItem(item.id)
                                            loadData()
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = Color.Red, modifier = Modifier.size(20.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        // Add Item Modal
        if (isAddModalOpen) {
            ModalBottomSheet(
                onDismissRequest = { isAddModalOpen = false },
                containerColor = Color.White
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(20.dp).padding(bottom = 30.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("Add Menu Item", fontWeight = FontWeight.Black, fontSize = 16.sp, color = BrandGreenPrimary)

                    OutlinedTextField(
                        value = newItemName,
                        onValueChange = { newItemName = it },
                        placeholder = { Text("Item Name (e.g. Masala Chai)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = newItemPrice,
                        onValueChange = { newItemPrice = it },
                        placeholder = { Text("Price (₹)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = newItemTag,
                        onValueChange = { newItemTag = it },
                        placeholder = { Text("Tag (e.g. Bestseller, Immunity)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    OutlinedTextField(
                        value = newItemDesc,
                        onValueChange = { newItemDesc = it },
                        placeholder = { Text("Description") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Button(
                        onClick = {
                            val price = newItemPrice.toDoubleOrNull() ?: 0.0
                            if (newItemName.isNotBlank() && price > 0) {
                                scope.launch {
                                    RetrofitClient.api.saveMenuItem(
                                        mapOf(
                                            "name" to newItemName,
                                            "price" to price,
                                            "categoryId" to (if (selectedCatId == "All") categories.firstOrNull()?.id else selectedCatId),
                                            "tag" to newItemTag,
                                            "description" to newItemDesc,
                                            "isAvailable" to true
                                        )
                                    )
                                    isAddModalOpen = false
                                    newItemName = ""
                                    newItemPrice = ""
                                    loadData()
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                    ) {
                        Text("Save Item to Menu", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
