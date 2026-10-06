import * as RNWallet from '@premieroctet/react-native-wallet';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { TravelPass } from './TravelPass';
import { travelCardStyles as styles } from './tenantStyles';

import { getTenant, passengerName } from '~/utils/tenants';

const tenant = getTenant('helderville');

function passServerUrl() {
  if (Platform.OS === 'android') {
    return 'http://127.0.0.1:3000';
  }

  return 'http://localhost:3000';
}

const blobToDataUrl = async (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

export function TravelCard() {
  const insets = useSafeAreaInsets();
  const [isLoadingPass, setIsLoadingPass] = useState(false);

  const showPassResult = (isAdded: boolean) => {
    Toast.show({
      type: isAdded ? 'success' : 'error',
      text1: isAdded ? 'Added' : 'Error',
      text2: isAdded ? 'Pass added successfully!' : 'Pass not added',
    });
  };

  const handleAddToAppleWallet = async () => {
    try {
      setIsLoadingPass(true);
      const response = await fetch(passServerUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: passengerName,
          tenantId: tenant.id,
          reference: tenant.reference,
        }),
      });

      if (!response.ok) {
        throw new Error('Pass request failed');
      }

      const passBlob = await response.blob();
      const passDataUrl = await blobToDataUrl(passBlob);
      showPassResult(await RNWallet.addPass(passDataUrl));
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Pass not added',
      });
    } finally {
      setIsLoadingPass(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    if (isLoadingPass) {
      return;
    }

    try {
      setIsLoadingPass(true);
      const response = await fetch(`${passServerUrl()}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: passengerName,
          tenantId: tenant.id,
        }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.message || 'Pass request failed');
      }

      const body = await response.json();

      if (!body.jwt) {
        throw new Error('No wallet token');
      }

      showPassResult(await RNWallet.addPass(body.jwt));
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Pass not added',
      });
    } finally {
      setIsLoadingPass(false);
    }
  };

  return (
    <View className={`flex-1 ${styles.screen}`} style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 16,
        }}>
        <Text className={styles.eyebrow}>Travel card</Text>
        <Text className={`mt-1 ${styles.title}`}>{tenant.name}</Text>
        <View className="mt-6 flex-1 justify-center">
          <TravelPass />
        </View>
        {Platform.OS === 'android' ? (
          <View className="mt-6 items-center">
            {isLoadingPass ? <ActivityIndicator color={tenant.colors.accent} /> : null}
            <RNWallet.RNWalletView
              buttonType={RNWallet.ButtonType.PRIMARY}
              onPress={handleAddToGoogleWallet}
            />
          </View>
        ) : (
          <TouchableOpacity
            className={styles.button}
            onPress={handleAddToAppleWallet}
            disabled={isLoadingPass}
            style={{
              backgroundColor: tenant.colors.accent,
              shadowColor: tenant.colors.ink,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 4,
            }}>
            {isLoadingPass ? <ActivityIndicator color={tenant.colors.onButton} /> : null}
            <Text className={styles.buttonText}>Add to Apple Wallet</Text>
            <Image source={require('../assets/images/apple_wallet.png')} className="h-5 w-7" />
          </TouchableOpacity>
        )}
      </ScrollView>
      <Toast position="bottom" />
    </View>
  );
}
