
# react-native-google-pay
[![react-native version](https://img.shields.io/badge/react--native-0.41-0ba7d3.svg?style=flat-square)](https://github.com/facebook/react-native/releases/tag/v0.41.0)
![npm](https://img.shields.io/npm/dw/react-native-google-pay.svg?style=flat-square)
[![npm (tag)](https://img.shields.io/npm/v/react-native-google-pay/latest.svg?style=flat-square)](https://github.com/busfor/react-native-google-pay/tree/master)

Accept Payments with Google Pay for React Native apps.

<div>
<img width="280px" src="emulator.gif" />
</div>

---
## Getting started

`$ yarn add react-native-google-pay`

### Android

#### Enable Android Pay in your Manifest

To enable Google Pay in your app, you need to add the following Google Pay API meta-data element to the `<application>` element of your project's AndroidManifest.xml file.

```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

### IOS

IOS is not supported



## Usage
```typescript jsx
import { GooglePay } from 'react-native-google-pay'

const isReadyToPayRequest: google.payments.api.IsReadyToPayRequest = {
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'example',
          gatewayMerchantId: 'exampleGatewayMerchantId',
        },
      },
    },
  ],
}

const requestData: google.payments.api.PaymentDataRequest = {
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'adyen',
          gatewayMerchantId: 'exampleGatewayMerchantId',
        },
      },
    },
  ],
  merchantInfo: {
    merchantName: 'Example Merchant',
    merchantId: 'Example Merchant',
  },
  transactionInfo: {
    totalPrice: '123',
    totalPriceStatus: 'FINAL',
    currencyCode: 'RUB',
  },
}

// Set the environment before the payment request
GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST).catch((error) => {
    console.log(error.code, error.message)
  },
)

// Check if Google Pay is available
GooglePay.isReadyToPay(isReadyToPayRequest)
  .then((ready) => {
    if (ready) {
      // Request payment data
      GooglePay.requestPayment(requestData)
        .then((data: google.payments.api.PaymentData) => {
          // Send a token to your payment gateway
          console.log(data)
        })
        .catch((error) => console.log(error.code, error.message))
    }
  })
  .catch((error) => {
    console.log(error.code, error.message)
  })
```

## Demo
You can run the demo by cloning the project and running:

`$ yarn demo`
