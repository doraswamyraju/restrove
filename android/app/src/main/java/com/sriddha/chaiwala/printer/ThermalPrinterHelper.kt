package com.sriddha.chaiwala.printer

import android.app.Activity
import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView
import android.webkit.WebViewClient
import com.sriddha.chaiwala.data.model.Order

object ThermalPrinterHelper {

    fun printReceipt(
        activity: Activity,
        order: Order,
        storeName: String = "CHAI WALA ORIGINAL",
        storeAddress: String = "Shop #4, Near Clock Tower, Main Branch",
        gstin: String = "37AAAAA0000A1Z5",
        paperWidth: String = "3inch",
        showGst: Boolean = true
    ) {
        val widthPx = if (paperWidth == "2inch") "280px" else "380px"

        val itemsHtml = buildString {
            for (it in order.items) {
                val qty = it.displayQty
                val rate = it.rate
                val total = if (it.amount > 0) it.amount else (qty * rate)
                append("""
                    <tr>
                        <td style="padding: 4px 0; text-align: left;">${it.displayName}</td>
                        <td style="padding: 4px 0; text-align: center;">$qty</td>
                        <td style="padding: 4px 0; text-align: right;">₹${"%.2f".format(rate)}</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold;">₹${"%.2f".format(total)}</td>
                    </tr>
                """.trimIndent())
            }
        }

        val gstRow = if (showGst) {
            """
            <tr>
                <td colspan="3" style="padding: 2px 0;">GST (5%):</td>
                <td style="padding: 2px 0; text-align: right;">₹${"%.2f".format(order.taxAmount ?: (order.amount * 0.05))}</td>
            </tr>
            """.trimIndent()
        } else ""

        val htmlReceipt = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        color: #000;
                        margin: 0;
                        padding: 10px;
                        width: $widthPx;
                        max-width: $widthPx;
                    }
                    .text-center { text-align: center; }
                    .header { margin-bottom: 8px; }
                    .header h2 { margin: 0; font-size: 16px; font-weight: bold; letter-spacing: 1px; }
                    .header p { margin: 2px 0; font-size: 10px; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { border-bottom: 1px dashed #000; padding: 4px 0; font-size: 10px; text-transform: uppercase; }
                    .total-row { font-size: 14px; font-weight: bold; border-top: 1px dashed #000; padding-top: 4px; }
                    .footer { margin-top: 12px; text-align: center; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="header text-center">
                    <h2>$storeName</h2>
                    <p>$storeAddress</p>
                    ${if (showGst && gstin.isNotEmpty()) "<p>GSTIN: $gstin</p>" else ""}
                </div>

                <div class="divider"></div>

                <div style="font-size: 11px; margin-bottom: 4px;">
                    <div><strong>TOKEN: ${order.orderNumber}</strong> (${order.serviceType})</div>
                    <div>Date: ${order.time ?: "Today"}</div>
                    ${if (!order.customerName.isNullOrEmpty()) "<div>Customer: ${order.customerName} (${order.customerPhone ?: ""})</div>" else ""}
                </div>

                <div class="divider"></div>

                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Amt</th>
                        </tr>
                    </thead>
                    <tbody>
                        $itemsHtml
                    </tbody>
                </table>

                <div class="divider"></div>

                <table>
                    <tr>
                        <td colspan="3" style="padding: 2px 0;">Subtotal:</td>
                        <td style="padding: 2px 0; text-align: right;">₹${"%.2f".format(order.subtotal ?: (order.amount * 0.95))}</td>
                    </tr>
                    $gstRow
                    <tr class="total-row">
                        <td colspan="3" style="padding-top: 6px;">TOTAL PAID:</td>
                        <td style="padding-top: 6px; text-align: right;">₹${"%.2f".format(order.amount)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding-top: 4px; font-size: 10px;">Payment Rail:</td>
                        <td style="padding-top: 4px; text-align: right; font-size: 10px; font-weight: bold;">${order.paymentMethod} (PAID)</td>
                    </tr>
                </table>

                <div class="divider"></div>

                <div class="footer">
                    <p>Thank you for visiting Chai Wala Original!</p>
                    <p>Have a fresh cutting chai day ☕</p>
                </div>
            </body>
            </html>
        """.trimIndent()

        activity.runOnUiThread {
            val webView = WebView(activity)
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    val printManager = activity.getSystemService(Context.PRINT_SERVICE) as PrintManager
                    val printAdapter = webView.createPrintDocumentAdapter("Receipt_${order.orderNumber}")
                    val builder = PrintAttributes.Builder()
                        .setColorMode(PrintAttributes.COLOR_MODE_MONOCHROME)
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                    printManager.print("Receipt_${order.orderNumber}", printAdapter, builder.build())
                }
            }
            webView.loadDataWithBaseURL(null, htmlReceipt, "text/html", "utf-8", null)
        }
    }
}

