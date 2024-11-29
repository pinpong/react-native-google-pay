package com.busfor

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.wallet.AutoResolveHelper
import com.google.android.gms.wallet.IsReadyToPayRequest
import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.PaymentDataRequest
import com.google.android.gms.wallet.PaymentsClient
import com.google.android.gms.wallet.Wallet
import java.util.Locale

class RNGooglePayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    reactContext
) {
    private var paymentsClient: PaymentsClient? = null

    private var requestPaymentPromise: Promise? = null

    private val activityEventListener: ActivityEventListener =
        object : BaseActivityEventListener() {
            override fun onActivityResult(
                activity: Activity,
                requestCode: Int,
                resultCode: Int,
                data: Intent?
            ) {
                when (requestCode) {
                    LOAD_PAYMENT_DATA_REQUEST_CODE -> when (resultCode) {
                        Activity.RESULT_OK -> {
                            data?.let { intent ->
                                val paymentData = PaymentData.getFromIntent(intent)
                                handlePaymentSuccess(paymentData)
                            }
                        }

                        Activity.RESULT_CANCELED -> requestPaymentPromise?.reject(
                            Activity.RESULT_CANCELED.toString(), "Payment has been canceled", null
                        )

                        AutoResolveHelper.RESULT_ERROR -> {
                            val status = AutoResolveHelper.getStatusFromIntent(data)
                            val statusCode = status?.statusCode
                            val errorMessage = String.format(
                                Locale.getDefault(),
                                "loadPaymentData failed. Error code: %d",
                                statusCode
                            )
                            requestPaymentPromise?.reject(
                                AutoResolveHelper.RESULT_ERROR.toString(),
                                errorMessage,
                                null
                            )
                        }

                        else -> {}
                    }
                }
            }
        }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    @ReactMethod
    fun setEnvironment(environment: Int, promise: Promise) {
        currentActivity?.let { activity ->
            val walletOptions = Wallet.WalletOptions.Builder().setEnvironment(environment).build()
            paymentsClient = Wallet.getPaymentsClient(activity, walletOptions)
            promise.resolve(true)
        } ?: promise.reject(
            CommonStatusCodes.ERROR.toString(),
            "Failed to init payment client",
            null
        )
    }

    @ReactMethod
    fun isReadyToPay(requestData: ReadableMap, promise: Promise) {
        val request = IsReadyToPayRequest.fromJson(requestData.toString())

        paymentsClient?.isReadyToPay(request)?.addOnCompleteListener { completedTask ->
            try {
                val result = completedTask.getResult(ApiException::class.java)
                promise.resolve(result)
            } catch (exception: Exception) {
                promise.reject(
                    CommonStatusCodes.DEVELOPER_ERROR.toString(),
                    exception.message,
                    null
                )
            }
        } ?: promise.reject(
            CommonStatusCodes.ERROR.toString(),
            "Payment client not initialized, setEnvironment() called?",
            null
        )
    }

    @ReactMethod
    fun requestPayment(requestData: ReadableMap, promise: Promise) {
        requestPaymentPromise = promise

        val request = PaymentDataRequest.fromJson(requestData.toString())

        paymentsClient?.loadPaymentData(request)?.let { task ->
            currentActivity?.let { activity ->
                AutoResolveHelper.resolveTask(
                    task,
                    activity,
                    LOAD_PAYMENT_DATA_REQUEST_CODE
                )
            }
        } ?: promise.reject(
            CommonStatusCodes.ERROR.toString(),
            "Payment client not initialized, setEnvironment() called?",
            null
        )
    }

    private fun handlePaymentSuccess(paymentData: PaymentData?) {
        paymentData?.let { data ->
            requestPaymentPromise?.resolve(data.toJson())
        } ?: requestPaymentPromise?.reject(
            CommonStatusCodes.INTERNAL_ERROR.toString(), "Unexpected empty result data.", null
        )
    }

    override fun getName(): String {
        return "RNGooglePay"
    }

    companion object {
        private const val LOAD_PAYMENT_DATA_REQUEST_CODE = 991
    }
}
