import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import * as RNWallet from '@premieroctet/react-native-wallet';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';
import Toast from 'react-native-toast-message';

const URL = 'https://skyport.com';
const COLORS = {
  primary: '#c82f26',
  white: '#fff',
  black: '#000',
  gray: '#E5E7EB',
};
const polygonPoints = '0,0 200,0 170,30 30,30';
const blobToDataUrl = async (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

export const BoardingPass = () => {
  const insets = useSafeAreaInsets();

  const name = 'Helder Correia';
  const [isLoadingPass, setIsLoadingPass] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoadingPass(true);
      const pass = await fetch('http://localhost:3000', {
        // const pass = await fetch(
        //   'https://94eb-2a0a-ef40-127f-f201-3ce6-195d-1915-98cb.ngrok-free.app',
        //   {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
        }),
      });
      const passBlob = await pass.blob();
      const passDataUrl = await blobToDataUrl(passBlob);
      const isAdded = await RNWallet.addPass(
        // 'https://github.com/dev-family/react-native-wallet-manager/blob/main/example/resources/SamplePasses/BoardingPass.pkpass?raw=true'
        passDataUrl
      );

      if (isAdded) {
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'Pass added successfully!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Pass not added',
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPass(false);
    }
  };

  const handleShare = async () => {
    try {
      await Sharing.shareAsync(URL);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View className="bg-primary flex-1" style={{ paddingTop: insets.top }}>
      <View className=" gap-y-6 px-4 ">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="rounded-xl bg-black/10 p-2">
            <Entypo name="chevron-small-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white">Boarding pass</Text>
          <TouchableOpacity className="rounded-xl bg-black/10 p-2" onPress={handleShare}>
            <AntDesign name="sharealt" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-white">Nº N1337-1476-88</Text>
          <Text className="text-sm text-white">25 June, 2025</Text>
        </View>

        <View className="gap-y-3 rounded-xl bg-white">
          <View className="flex-row items-center justify-between  p-4">
            <View className="flex-row items-center gap-x-2">
              <Image source={require('../assets/images/logo.png')} className="h-6 w-7" />
              <View className="">
                <Text className="text-lg font-semibold">China Eastern Airlines</Text>
                <Text className="text-sm text-slate-500">MU 1337</Text>
              </View>
            </View>
            <View className="">
              <Text className="text-lg font-semibold">1 seats</Text>
              <Text className="text-sm text-gray-500">11h 40m</Text>
            </View>
          </View>

          <View className=" w-full  ">
            <Svg height="20" width="100%">
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke={COLORS.gray}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </Svg>
          </View>

          <View className="flex-row  justify-between gap-x-4 px-4">
            <View className="flex-grow  gap-1 rounded-md bg-gray-50 p-2">
              <Text>Departure</Text>
              <Text className="text-xl font-semibold">02:25 PM</Text>
              <Text className="text-sm  text-gray-500">25 June,2025</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text>Arrival</Text>
              <Text className="text-xl font-semibold">01:05 AM</Text>
              <Text className="text-sm  text-gray-500">26 June, 2025</Text>
            </View>
          </View>
          <View className="flex-row  justify-between gap-x-4 px-4">
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">17A</Text>
              <Text className="text-sm  text-gray-500">Seats</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">T5</Text>
              <Text className="text-sm  text-gray-500">Terminal</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">23</Text>
              <Text className="text-sm  text-gray-500">Gate</Text>
            </View>
          </View>

          <View className=" w-full  ">
            <Svg height="16" width="100%">
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke={COLORS.gray}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <Circle cx="0" cy="50%" r="8" fill={COLORS.primary} />
              <Circle cx="100%" cy="50%" r="8" fill={COLORS.primary} />
            </Svg>
          </View>

          <View className="mb-4 flex  py-2">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-x-2"
              onPress={handleSubmit}
              disabled={isLoadingPass}>
              <ActivityIndicator
                animating={isLoadingPass}
                color={COLORS.primary}
                className="-ml-6"
              />
              <Text className="text-center  text-slate-600">Add to Apple Wallet</Text>
              <Image source={require('../assets/images/apple_wallet.png')} className="h-5 w-7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="mt-8 flex-1 items-center justify-center rounded-t-3xl bg-white">
        <View className="absolute top-0 flex items-center justify-center ">
          <Svg height="80" width="100" viewBox="0 0 200 200">
            <Polygon
              points={polygonPoints}
              fill={COLORS.primary}
              stroke={COLORS.primary}
              strokeWidth="1"
            />
            <Line x1="30%" y1="0%" x2="55%" y2="0%" stroke={COLORS.white} strokeWidth="16" />
          </Svg>
        </View>

        <QRCode value={URL} size={160} color="#111" backgroundColor={COLORS.white} />
        <Text className="mt-6 text-sm text-slate-500">Show the QR code at the boarding gate</Text>
        <Toast position="bottom" />
      </View>
    </View>
  );
};
