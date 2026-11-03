package com.sriddha.chaiwala.data.model

import com.google.gson.annotations.SerializedName

data class Category(
    val id: String,
    val name: String,
    val slug: String? = null
)

data class CategoriesResponse(
    val categories: List<Category> = emptyList()
)

data class MenuItem(
    val id: String,
    @SerializedName("category_id") val categoryId: String? = null,
    val name: String,
    val price: Double,
    @SerializedName("is_veg") val isVeg: Int = 1,
    @SerializedName("tax_rate") val taxRate: Double = 5.0,
    val tag: String? = null,
    val description: String? = null,
    @SerializedName("image_emoji") val imageEmoji: String? = "☕",
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("is_available") val isAvailable: Int = 1
)

data class ItemsResponse(
    val items: List<MenuItem> = emptyList()
)

data class OrderItem(
    val id: String? = null,
    @SerializedName("item_name") val itemName: String? = null,
    val name: String? = null,
    val quantity: Int = 1,
    val qty: Int = 1,
    val rate: Double = 0.0,
    val amount: Double = 0.0,
    val notes: String? = null
) {
    val displayName: String get() = name ?: itemName ?: "Item"
    val displayQty: Int get() = if (quantity > 0) quantity else qty
}

data class Order(
    val id: String,
    val orderNumber: String,
    val serviceType: String = "Takeaway",
    val details: String = "Counter Pickup",
    val amount: Double = 0.0,
    val subtotal: Double? = null,
    val taxAmount: Double? = null,
    val discountAmount: Double? = null,
    val paymentMethod: String = "Cash",
    val paymentStatus: String = "Paid",
    val orderStatus: String = "Completed",
    val customerName: String? = null,
    val customerPhone: String? = null,
    val time: String? = null,
    val items: List<OrderItem> = emptyList()
)

data class OrdersCounts(
    val all: Int = 0,
    val dineIn: Int = 0,
    val takeaway: Int = 0,
    val delivery: Int = 0,
    val online: Int = 0,
    val today: Int = 0
)

data class OrdersResponse(
    val orders: List<Order> = emptyList(),
    val counts: OrdersCounts = OrdersCounts()
)

data class CreateOrderItemRequest(
    val itemId: String,
    val name: String,
    val rate: Double,
    val quantity: Int,
    val notes: String? = null
)

data class CreateOrderRequest(
    val customerPhone: String? = null,
    val customerName: String? = null,
    val serviceType: String = "Takeaway",
    val details: String = "Counter Pickup",
    val items: List<CreateOrderItemRequest>,
    val discountAmount: Double = 0.0,
    val paymentMethod: String = "Cash",
    val status: String = "Completed"
)

data class CreateOrderResponse(
    val success: Boolean,
    val orderId: String? = null,
    val orderNumber: String? = null,
    val totalAmount: Double? = null,
    val order: Order? = null,
    val error: String? = null
)

data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val notes: String? = null,
    @SerializedName("wallet_balance") val walletBalance: Double = 0.0,
    @SerializedName("total_spent") val totalSpent: Double = 0.0,
    @SerializedName("visit_count") val visitCount: Int = 0,
    @SerializedName("created_at") val createdAt: String? = null
)

data class WalletTransaction(
    val id: String,
    @SerializedName("customer_id") val customerId: String,
    val amount: Double,
    @SerializedName("balance_after") val balanceAfter: Double,
    val type: String,
    @SerializedName("reference_order_id") val referenceOrderId: String? = null,
    val notes: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class CustomersResponse(
    val customers: List<Customer> = emptyList()
)

data class CustomerStatsResponse(
    val totalCustomers: Int = 0,
    val totalWalletBalance: Double = 0.0,
    val totalLifetimeSpent: Double = 0.0,
    val avgVisits: Double = 0.0
)

data class CustomerDetailResponse(
    val customer: Customer? = null,
    val transactions: List<WalletTransaction> = emptyList(),
    val orders: List<Order> = emptyList(),
    val error: String? = null
)

data class WalletAdjustRequest(
    val amount: Double,
    val type: String = "deposit",
    val paymentRail: String = "UPI",
    val notes: String? = null
)

data class InventoryItem(
    val id: String,
    val name: String,
    val category: String = "Raw Materials",
    val unit: String = "kg",
    @SerializedName("current_stock") val currentStock: Double = 0.0,
    @SerializedName("min_stock_alert") val minStockAlert: Double = 5.0,
    @SerializedName("cost_per_unit") val costPerUnit: Double = 0.0
)

data class InventoryResponse(
    val items: List<InventoryItem> = emptyList()
)

data class InventoryAdjustRequest(
    val itemId: String,
    val adjustmentAmount: Double,
    val reason: String
)

data class PaymentMethodBreakdown(
    val method: String,
    val count: Int = 0,
    val total: Double = 0.0
)

data class TopSellingItem(
    val name: String,
    @SerializedName("qty_sold") val qtySold: Int = 0,
    val revenue: Double = 0.0
)

data class ReportsSummary(
    val range: String = "Today",
    val totalRevenue: Double = 0.0,
    val totalOrders: Int = 0,
    val avgOrderValue: Double = 0.0,
    val cashCollected: Double = 0.0,
    val paymentBreakdown: List<PaymentMethodBreakdown> = emptyList(),
    val topItems: List<TopSellingItem> = emptyList()
)

data class ReportsResponse(
    val summary: ReportsSummary? = null
)

data class OrderStatusRequest(
    val status: String
)

data class ApiResponse(
    val success: Boolean = true,
    val message: String? = null,
    val error: String? = null
)
