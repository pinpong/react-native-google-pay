import { TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  requestPayment(request: Object): Promise<any>;
  isReadyToPay(request: Object): Promise<boolean>;
  setEnvironment(environment: number): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGooglePay');
