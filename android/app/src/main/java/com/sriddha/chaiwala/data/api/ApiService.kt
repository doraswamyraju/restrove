package com.sriddha.chaiwala.data.api

import com.sriddha.chaiwala.data.model.*
import okhttp3.MultipartBody
import retrofit2.http.*

interface ApiService {

    // Catalog
    @GET("catalog/categories")
    suspend fun getCategories(): CategoriesResponse

    @GET("catalog/items")
    suspend fun getMenuItems(
        @Query("categoryId") categoryId: String? = null,
        @Query("search") search: String? = null
    ): ItemsResponse

    @POST("catalog/items")
    suspend fun saveMenuItem(@Body item: Map<String, Any?>): ApiResponse

    @PATCH("catalog/items/{id}/availability")
    suspend fun toggleItemAvailability(
        @Path("id") id: String,
        @Body payload: Map<String, Boolean>
    ): ApiResponse

    @DELETE("catalog/items/{id}")
    suspend fun deleteMenuItem(@Path("id") id: String): ApiResponse

    // Orders
    @GET("orders")
    suspend fun getOrders(
        @Query("status") status: String? = null,
        @Query("serviceType") serviceType: String? = null,
        @Query("search") search: String? = null
    ): OrdersResponse

    @GET("orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Map<String, Any?>

    @POST("orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): CreateOrderResponse

    @PATCH("orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body status: OrderStatusRequest
    ): ApiResponse

    @DELETE("orders/{id}")
    suspend fun deleteOrder(@Path("id") id: String): ApiResponse

    // Customers & CRM
    @GET("customers/stats")
    suspend fun getCustomerStats(): CustomerStatsResponse

    @GET("customers")
    suspend fun getCustomers(
        @Query("search") search: String? = null,
        @Query("filter") filter: String? = null,
        @Query("sort") sort: String? = null
    ): CustomersResponse

    @GET("customers/{id}")
    suspend fun getCustomerDetails(@Path("id") idOrPhone: String): CustomerDetailResponse

    @POST("customers")
    suspend fun createCustomer(@Body data: Map<String, Any?>): ApiResponse

    @PUT("customers/{id}")
    suspend fun updateCustomer(@Path("id") id: String, @Body data: Map<String, Any?>): ApiResponse

    @POST("customers/{id}/wallet-adjust")
    suspend fun adjustCustomerWallet(
        @Path("id") id: String,
        @Body payload: WalletAdjustRequest
    ): ApiResponse

    @DELETE("customers/{id}")
    suspend fun deleteCustomer(@Path("id") id: String): ApiResponse

    // Inventory
    @GET("inventory")
    suspend fun getInventory(): InventoryResponse

    @POST("inventory/adjust")
    suspend fun adjustInventory(@Body payload: InventoryAdjustRequest): ApiResponse

    // Reports
    @GET("reports/summary")
    suspend fun getReportsSummary(@Query("range") range: String = "Today"): ReportsResponse

    // Settings
    @GET("settings")
    suspend fun getSettings(): Map<String, String>

    @POST("settings")
    suspend fun saveSettings(@Body settings: Map<String, String>): ApiResponse
}

