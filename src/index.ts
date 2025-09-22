import RNGooglePay from './NativeRNGooglePay';
import { Platform } from 'react-native';

export enum EnvironmentType {
  ENVIRONMENT_PRODUCTION = 1,
  ENVIRONMENT_TEST = 3,
}

export const BaseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

export const GooglePay = {
  requestPayment,
  isReadyToPay,
  setEnvironment,
  BaseRequest,
  EnvironmentType,
};

function requestPayment(
  requestData: google.payments.api.PaymentDataRequest
): Promise<google.payments.api.PaymentData> {
  if (Platform.OS === 'ios') throw new Error('Not supported');
  return RNGooglePay.requestPayment(requestData);
}

function isReadyToPay(
  requestData: google.payments.api.IsReadyToPayRequest
): Promise<boolean> {
  if (Platform.OS === 'ios') throw new Error('Not supported');
  return RNGooglePay.isReadyToPay(requestData);
}

function setEnvironment(environment: EnvironmentType): Promise<boolean> {
  if (Platform.OS === 'ios') throw new Error('Not supported');
  return RNGooglePay.setEnvironment(environment);
}
