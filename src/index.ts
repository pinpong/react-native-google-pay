import { NativeModules, Platform } from 'react-native';
const RNGooglePay = NativeModules.RNGooglePay;

export enum EnvironmentType {
  ENVIRONMENT_PRODUCTION = 1,
  ENVIRONMENT_TEST = 3,
}

const ENVIRONMENT_PRODUCTION = 1;
const ENVIRONMENT_TEST = 3;

const BaseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

async function setEnvironment(
  environment: EnvironmentType,
): Promise<boolean> | never {
  if (Platform.OS === 'ios') throw new Error('Not supported');

  return RNGooglePay.setEnvironment(environment);
}

async function isReadyToPay(
  requestData: google.payments.api.IsReadyToPayRequest,
): Promise<boolean> | never {
  if (Platform.OS === 'ios') throw new Error('Not supported');

  return RNGooglePay.isReadyToPay(requestData);
}

async function requestPayment(
  requestData: google.payments.api.PaymentDataRequest,
): Promise<google.payments.api.PaymentData> | never {
  if (Platform.OS === 'ios') throw new Error('Not supported');

  return RNGooglePay.requestPayment(requestData);
}

const GooglePay = {
  ENVIRONMENT_PRODUCTION,
  ENVIRONMENT_TEST,
  BaseRequest,
  setEnvironment,
  isReadyToPay,
  requestPayment,
};

export default GooglePay;
