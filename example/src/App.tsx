import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import GooglePay from 'react-native-google-pay';

const gatewayIsReadyToPayRequest: google.payments.api.IsReadyToPayRequest = {
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
};

const directIsReadyToPayRequest: google.payments.api.IsReadyToPayRequest = {
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
      },
      tokenizationSpecification: {
        type: 'DIRECT',
        parameters: {
          protocolVersion: 'ECv2',
          publicKey:
            'BOdoXP+9Aq473SnGwg3JU1aiNpsd9vH2ognq4PtDtlLGa3Kj8TPf+jaQNPyDSkh3JUhiS0KyrrlWhAgNZKHYF2Y=',
        },
      },
    },
  ],
};

const stripeIsReadyToPayRequest: google.payments.api.IsReadyToPayRequest = {
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
          gateway: 'stripe',
          gatewayMerchantId: '',
          'stripe:publishableKey': 'pk_test_TYooMQauvdEDq54NiTphI7jx',
          'stripe:version': '2018-11-08',
        },
      },
    },
  ],
};

const gatewayRequestData: google.payments.api.PaymentDataRequest = {
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
  merchantInfo: {
    merchantName: 'Example Merchant',
    merchantId: 'Example Merchant',
  },
  transactionInfo: {
    totalPrice: '123',
    totalPriceStatus: 'FINAL',
    currencyCode: 'RUB',
  },
};

const directRequestData: google.payments.api.PaymentDataRequest = {
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
      },
      tokenizationSpecification: {
        type: 'DIRECT',
        parameters: {
          protocolVersion: 'direct',
          publicKey:
            'BOdoXP+9Aq473SnGwg3JU1aiNpsd9vH2ognq4PtDtlLGa3Kj8TPf+jaQNPyDSkh3JUhiS0KyrrlWhAgNZKHYF2Y=',
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
};

const stripeRequestData: google.payments.api.PaymentDataRequest = {
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
          gateway: 'stripe',
          gatewayMerchantId: '',
          publishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
          version: '2018-11-08',
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
};

export default function App() {
  useEffect(() => {
    GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST).catch(res =>
      Alert.alert(`setEnvironment failed: ${res}`),
    );
  }, []);

  const handleSuccess = useCallback(
    (result: google.payments.api.PaymentData) => {
      Alert.alert('Success', `${result}`);
    },
    [],
  );

  const handleError = useCallback((error: any) => {
    Alert.alert('Error', `${error.code}\n${error.message}`);
  }, []);

  const payWithGooglePay = useCallback(
    (
      isReadyToPayRequestData: google.payments.api.IsReadyToPayRequest,
      paymentDataRequestData: google.payments.api.PaymentDataRequest,
    ) => {
      // Check if Google Pay is available
      GooglePay.isReadyToPay(isReadyToPayRequestData)
        .then(ready => {
          if (ready) {
            // Request payment token
            GooglePay.requestPayment(paymentDataRequestData)
              .then(handleSuccess)
              .catch(handleError);
          } else {
            Alert.alert('Error, not ready to pay!');
          }
        })
        .catch(handleError);
    },
    [handleError, handleSuccess],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to react-native-google-pay!</Text>
      <TouchableHighlight
        style={styles.button}
        onPress={() =>
          payWithGooglePay(gatewayIsReadyToPayRequest, gatewayRequestData)
        }>
        <Text style={styles.buttonText}>PAYMENT_GATEWAY</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={[styles.button, styles.direct]}
        onPress={() =>
          payWithGooglePay(directIsReadyToPayRequest, directRequestData)
        }>
        <Text style={styles.buttonText}>DIRECT</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={[styles.button, styles.stripe]}
        onPress={() =>
          payWithGooglePay(stripeIsReadyToPayRequest, stripeRequestData)
        }>
        <Text style={styles.buttonText}>Stripe</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  welcome: {
    fontSize: 18,
    color: '#222',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginVertical: 8,
  },
  direct: {
    backgroundColor: '#db7d35',
  },
  stripe: {
    backgroundColor: '#556cd6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
