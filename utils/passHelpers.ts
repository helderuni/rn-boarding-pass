import * as RNWallet from '@premieroctet/react-native-wallet';
import { Alert } from 'react-native';

export const onAddPass = async (urlOrToken: string) => {
  try {
    const isAdded = await RNWallet.addPass(urlOrToken);
    Alert.alert('Pass added', isAdded ? 'Yes' : 'No');
  } catch (error) {
    Alert.alert('Error', (error as Error).message);
  }
};
export const onCheckPassExists = async (url: string) => {
  try {
    const passExists = await RNWallet.hasPass(url);

    Alert.alert('Pass exists', passExists ? 'Yes' : 'No');
  } catch (error) {
    Alert.alert('Error', (error as Error).message);
  }
};

export const onRemovePass = async (url: string) => {
  try {
    await RNWallet.removePass(url);

    Alert.alert('Pass removed');
  } catch (error) {
    Alert.alert('Error', (error as Error).message);
  }
};

export const onCanAddPasses = async () => {
  try {
    const canAddPasses = await RNWallet.canAddPasses();

    Alert.alert('Can add passes', canAddPasses ? 'Yes' : 'No');
  } catch (error) {
    Alert.alert('Error', (error as Error).message);
  }
};
