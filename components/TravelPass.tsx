import { Image, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { travelCardStyles as styles } from './tenantStyles';

import { cardStatus, cardType, getTenant, issuedOn, passengerName } from '~/utils/tenants';

const tenant = getTenant('helderville');

function Perforation() {
  return (
    <View className="h-8 flex-row items-center">
      <View className={`-ml-3.5 ${styles.notch}`} />
      <View className="mx-3 h-1 flex-1 flex-row items-center justify-between">
        {Array.from({ length: 16 }, (_, index) => (
          <View key={index} className="h-1 w-1.5 rounded-full bg-helderville-sand/80" />
        ))}
      </View>
      <View className={`-mr-3.5 ${styles.notch}`} />
    </View>
  );
}

export function TravelPass() {
  return (
    <View
      className={`rounded-[32px] ${styles.card}`}
      style={{
        backgroundColor: tenant.colors.card,
        shadowColor: tenant.colors.ink,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
        elevation: 10,
      }}>
      <View className={`overflow-hidden rounded-[32px] ${styles.card}`}>
        <View className={styles.accentBar} />
        <View className="px-6 pb-2 pt-6">
          <View className="flex-row items-center justify-between">
            <View className="rounded-xl bg-helderville-cream p-1.5">
              <Image
                source={require('../imgs/logo.png')}
                style={{ width: 72, height: 72 }}
                resizeMode="contain"
                accessibilityLabel="Helderville Council"
              />
            </View>
            <View className={styles.statusPill}>
              <View className={styles.statusDot} />
              <Text className={styles.statusText}>{cardStatus}</Text>
            </View>
          </View>
          <Text className={`mt-5 ${styles.label}`}>Passenger</Text>
          <Text className={styles.name}>{passengerName}</Text>
          <Text className={styles.cardMuted}>{cardType}</Text>
          <View className="mt-5 flex-row">
            <View className="flex-1 pr-3">
              <Text className={styles.label}>Organisation</Text>
              <Text className={styles.fieldValue}>{tenant.organizationName}</Text>
            </View>
            <View className="flex-1">
              <Text className={styles.label}>Issued</Text>
              <Text className={styles.fieldValue}>{issuedOn}</Text>
            </View>
          </View>
        </View>
        <Perforation />
        <View className="items-center px-6 pb-7 pt-3">
          <View className={styles.qrPanel}>
            <QRCode
              value={tenant.reference}
              size={176}
              color={tenant.colors.qr}
              backgroundColor={tenant.colors.qrBackground}
            />
          </View>
          <Text className={styles.hint}>Show this code when you travel</Text>
          <Text className={styles.reference}>{tenant.reference}</Text>
        </View>
      </View>
    </View>
  );
}
