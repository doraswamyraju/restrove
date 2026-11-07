package com.sriddha.chaiwala.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sriddha.chaiwala.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChaiWalaTopBar(
    title: String,
    subtitle: String = "Online • SQLite Database",
    onRefresh: (() -> Unit)? = null
) {
    TopAppBar(
        title = {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFF2E7D32)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Coffee,
                            contentDescription = null,
                            tint = Color(0xFFA7F3D0),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = title,
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
                Text(
                    text = subtitle,
                    fontSize = 10.sp,
                    color = Color(0xFFA7F3D0),
                    fontWeight = FontWeight.Medium
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = BrandGreenDark,
            titleContentColor = Color.White
        )
    )
}

@Composable
fun StatusBadge(status: String) {
    val (bgColor, textColor, borderColor) = when (status) {
        "Completed" -> Triple(Color(0xFFD1FAE5), Color(0xFF065F46), Color(0xFFA7F3D0))
        "In Service" -> Triple(Color(0xFFDBEAFE), Color(0xFF1E40AF), Color(0xFFBFDBFE))
        "Preparing" -> Triple(Color(0xFFFEF3C7), Color(0xFF92400E), Color(0xFFFDE68A))
        "Ready" -> Triple(Color(0xFFEDE9FE), Color(0xFF5B21B6), Color(0xFFDDD6FE))
        else -> Triple(Color(0xFFF3F4F6), Color(0xFF374151), Color(0xFFE5E7EB))
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
    ) {
        Text(
            text = status,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun VegIndicator(isVeg: Boolean) {
    val color = if (isVeg) Color(0xFF16A34A) else Color(0xFFDC2626)
    Box(
        modifier = Modifier
            .size(14.dp)
            .border(1.dp, color, RoundedCornerShape(3.dp))
            .padding(2.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(color)
        )
    }
}

