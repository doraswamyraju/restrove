package com.sriddha.chaiwala.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.sriddha.chaiwala.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen() {
    val scope = rememberCoroutineScope()
    var settings by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var outletName by remember { mutableStateOf("CHAI WALA ORIGINAL") }
    var gstin by remember { mutableStateOf("37AAAAA0000A1Z5") }
    var paperFormat by remember { mutableStateOf("3inch") }
    var showGst by remember { mutableStateOf(true) }
    var serverUrl by remember { mutableStateOf(RetrofitClient.baseUrl) }
    var isSaved by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        try {
            val res = RetrofitClient.api.getSettings()
            settings = res
            outletName = res["outletName"] ?: "CHAI WALA ORIGINAL"
            gstin = res["gstin"] ?: "37AAAAA0000A1Z5"
            paperFormat = res["printerPaperWidth"] ?: "3inch"
            showGst = res["showGstBreakdown"] != "false"
        } catch (e: Exception) {}
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceParchment)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            item {
                Text("Cafeteria Settings", fontWeight = FontWeight.Black, fontSize = 17.sp, color = BrandGreenPrimary)
                Text("Configure outlet details, thermal printer width, and GST disclosure.", color = TextMuted, fontSize = 11.sp)
            }

            // Outlet Details Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Outlet Branding", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)

                        OutlinedTextField(
                            value = outletName,
                            onValueChange = { outletName = it },
                            label = { Text("Outlet Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = gstin,
                            onValueChange = { gstin = it },
                            label = { Text("GSTIN") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // GST Disclosure Toggle
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("GST Billing Disclosure", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
                        Text("Choose whether to display 5% GST breakdown on customer tokens & receipts.", color = TextMuted, fontSize = 11.sp)

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(1.dp, if (showGst) BrandGreenPrimary else CardBorder, RoundedCornerShape(10.dp))
                                    .background(if (showGst) Color(0xFFECFDF5) else Color.White)
                                    .clickable { showGst = true }
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Text("Keep GST", fontWeight = FontWeight.Black, fontSize = 12.sp, color = if (showGst) BrandGreenPrimary else TextDark)
                                    Text("Calculates 5% GST itemized", fontSize = 10.sp, color = TextMuted)
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(1.dp, if (!showGst) BrandGreenPrimary else CardBorder, RoundedCornerShape(10.dp))
                                    .background(if (!showGst) Color(0xFFECFDF5) else Color.White)
                                    .clickable { showGst = false }
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Text("Don't Keep GST", fontWeight = FontWeight.Black, fontSize = 12.sp, color = if (!showGst) BrandGreenPrimary else TextDark)
                                    Text("All-inclusive flat total", fontSize = 10.sp, color = TextMuted)
                                }
                            }
                        }
                    }
                }
            }

            // Printer Paper Format
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Thermal Printer Paper Width", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)
                        Text("Select your counter thermal printer roll dimension.", color = TextMuted, fontSize = 11.sp)

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf("3inch" to "3\" Thermal (80mm)", "2inch" to "2\" Thermal (58mm)", "a4" to "Standard A4").forEach { (code, label) ->
                                val isSelected = paperFormat == code
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .border(1.dp, if (isSelected) BrandGreenPrimary else CardBorder, RoundedCornerShape(10.dp))
                                        .background(if (isSelected) Color(0xFFECFDF5) else Color.White)
                                        .clickable { paperFormat = code }
                                        .padding(vertical = 8.dp, horizontal = 4.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 10.sp,
                                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                                        color = if (isSelected) BrandGreenPrimary else TextDark
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Server Connection URL
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Backend Connection", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BrandGreenPrimary)

                        OutlinedTextField(
                            value = serverUrl,
                            onValueChange = { serverUrl = it },
                            label = { Text("Server API URL") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // Save Button
            item {
                Button(
                    onClick = {
                        RetrofitClient.baseUrl = serverUrl
                        scope.launch {
                            RetrofitClient.api.saveSettings(
                                mapOf(
                                    "outletName" to outletName,
                                    "gstin" to gstin,
                                    "printerPaperWidth" to paperFormat,
                                    "showGstBreakdown" to showGst.toString()
                                )
                            )
                            isSaved = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandGreenPrimary)
                ) {
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (isSaved) "Settings Saved!" else "Save Settings", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}

