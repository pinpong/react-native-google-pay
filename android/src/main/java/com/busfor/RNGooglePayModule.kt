package com.busfor

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.wallet.AutoResolveHelper
import com.google.android.gms.wallet.IsReadyToPayRequest
import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.PaymentDataRequest
import com.google.android.gms.wallet.PaymentsClient
import com.google.android.gms.wallet.Wallet
import org.json.JSONObject
import java.util.Locale

@ReactModule(name = RNGooglePayModule.NAME)
class RNGooglePayModule(reactContext: ReactApplicationContext) :
    NativeRNGooglePaySpec(reactContext) {
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
                            val paymentData = data?.let { PaymentData.getFromIntent(it) }
                            handlePaymentSuccess(paymentData)
                        }

                        Activity.RESULT_CANCELED -> rejectRequestPaymentPromise(
                            Activity.RESULT_CANCELED.toString(), "Payment has been canceled"
                        )

                        AutoResolveHelper.RESULT_ERROR -> {
                            val status = AutoResolveHelper.getStatusFromIntent(data)
                            val statusCode = status?.statusCode
                            val errorMessage = String.format(
                                Locale.getDefault(),
                                "loadPaymentData failed. Error code: %d",
                                statusCode
                            )
                            rejectRequestPaymentPromise(
                                AutoResolveHelper.RESULT_ERROR.toString(),
                                errorMessage
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

    override fun setEnvironment(environment: Double, promise: Promise) {
        reactApplicationContext.currentActivity?.let { activity ->
            val walletOptions =
                Wallet.WalletOptions.Builder().setEnvironment(environment.toInt()).build()
            paymentsClient = Wallet.getPaymentsClient(activity, walletOptions)
            promise.resolve(true)
        } ?: promise.reject(
            CommonStatusCodes.ERROR.toString(),
            "Failed to init payment client",
            null
        )
    }

    override fun isReadyToPay(requestData: ReadableMap, promise: Promise) {
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

    override fun requestPayment(requestData: ReadableMap, promise: Promise) {
        val request = PaymentDataRequest.fromJson(requestData.toString())

        val activity = reactApplicationContext.currentActivity
        val client = paymentsClient
        if (activity == null || client == null) {
            promise.reject(
                CommonStatusCodes.ERROR.toString(),
                "Payment client not initialized, setEnvironment() called?",
                null
            )
            return
        }

        rejectRequestPaymentPromise(
            CommonStatusCodes.CANCELED.toString(),
            "Payment request was superseded by a new request."
        )
        requestPaymentPromise = promise

        client.loadPaymentData(request).addOnCompleteListener { completedTask ->
            try {
                handlePaymentSuccess(completedTask.getResult(ApiException::class.java))
            } catch (exception: ResolvableApiException) {
                try {
                    activity.startIntentSenderForResult(
                        exception.resolution.intentSender,
                        LOAD_PAYMENT_DATA_REQUEST_CODE,
                        null,
                        0,
                        0,
                        0
                    )
                } catch (sendException: IntentSender.SendIntentException) {
                    rejectRequestPaymentPromise(
                        CommonStatusCodes.ERROR.toString(),
                        sendException.message
                    )
                }
            } catch (exception: ApiException) {
                rejectRequestPaymentPromise(
                    exception.statusCode.toString(),
                    exception.message
                )
            }
        }
    }

    private fun handlePaymentSuccess(paymentData: PaymentData?) {
        paymentData?.let { data ->
            val map = jsonToMap(JSONObject(data.toJson()))
            requestPaymentPromise?.resolve(Arguments.makeNativeMap(map))
            requestPaymentPromise = null
        } ?: rejectRequestPaymentPromise(
            CommonStatusCodes.INTERNAL_ERROR.toString(), "Unexpected empty result data."
        )
    }

    private fun rejectRequestPaymentPromise(code: String, message: String?) {
        requestPaymentPromise?.reject(code, message, null)
        requestPaymentPromise = null
    }

    private fun jsonToMap(jsonObject: JSONObject): Map<String, Any?> =
        jsonObject.keys().asSequence().associateWith { key ->
            when (val value = jsonObject.get(key)) {
                is JSONObject -> jsonToMap(value)
                else -> value
            }
        }

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "RNGooglePay"
        private const val LOAD_PAYMENT_DATA_REQUEST_CODE = 991
    }
}

