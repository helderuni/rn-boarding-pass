import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import * as RNWallet from '@premieroctet/react-native-wallet';
import { useState } from 'react';
// import { ChevronLeftIcon, Share2Icon } from 'lucide-react-native';
// import * as ExpoWallet from '@giulio987/expo-wallet';
import {
  Image,
  Text,
  TouchableOpacity,
  Alert,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';
import WalletManager from 'react-native-wallet-manager';

import { pass, token } from '~/utils';

const URL = 'https://google.com';

const blobToDataUrl = async (blob) =>
  new Promise((r) => {
    const a = new FileReader();
    a.onload = r;
    a.readAsDataURL(blob);
  }).then((e) => e.target.result);

export const BoardingPass = () => {
  const insets = useSafeAreaInsets();

  // const tokenURL = pass;

  // const onAdd = async () => {
  //   try {
  //     const isAdded = await RNWallet.addPass(
  //       'https://github.com/dev-family/react-native-wallet-manager/blob/main/example/resources/SamplePasses/BoardingPass.pkpass?raw=true'
  //     );

  //     Alert.alert('Pass added', isAdded ? 'Yes' : 'No');
  //   } catch (error) {
  //     Alert.alert('Error', (error as Error).message);
  //   }
  // };

  const onCheckPassExists = async () => {
    try {
      const passExists = await RNWallet.hasPass('<PassUrlOrToken>');

      Alert.alert('Pass exists', passExists ? 'Yes' : 'No');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const onRemovePass = async () => {
    try {
      await RNWallet.removePass('<PassUrlOrToken>');

      Alert.alert('Pass removed');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const onCanAddPasses = async () => {
    try {
      const canAddPasses = await RNWallet.canAddPasses();

      Alert.alert('Can add passes', canAddPasses ? 'Yes' : 'No');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  // const addToWallet = async () => {
  //   try {
  //     const res = await ExpoWallet.addPass(Platform.OS === 'ios' ? pass : token);
  //     console.log(res);
  //   } catch (error) {}
  // };

  // const isAvailable = async () => {
  //   const res = await ExpoWallet.isAvailable();
  //   if (res) {
  //     alert('Available');
  //   } else {
  //     alert('Not available');
  //   }
  // };

  // New data
  const name = 'Helder Correia';
  const [isLoadingPass, setIsLoadingPass] = useState(false);

  const handleSubmit = async () => {
    // Skip if the name is not set
    if (!name) return;
    try {
      setIsLoadingPass(true);
      const pass = await fetch('http://localhost:3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
        }),
      });
      const passBlob = await pass.blob();
      const passDataUrl = await blobToDataUrl(passBlob);
      // await WalletManager.addPassFromUrl(await blobToDataUrl(passBlob));
      // console.log(passDataUrl.slice(0, 100));
      const isAdded = await RNWallet.addPass(
        // 'https://github.com/dev-family/react-native-wallet-manager/blob/main/example/resources/SamplePasses/BoardingPass.pkpass?raw=true'
        passDataUrl
      );
      // await WalletManager.addPassFromUrl(
      //   'https://github.com/dev-family/react-native-wallet-manager/blob/main/example/resources/SamplePasses/BoardingPass.pkpass?raw=true'
      // );
      Alert.alert('Pass added', isAdded ? 'Yes' : 'No');
      // Alert.alert('Pass added');
      setIsLoadingPass(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View className="flex-1 bg-[#c82f26]" style={{ paddingTop: insets.top }}>
      <View className=" gap-y-6 px-4 ">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="rounded-xl bg-black/10 p-2">
            {/* <ChevronLeftIcon size={24} color="white" /> */}
            <Entypo name="chevron-small-left" size={24} color="white" />
            {/* <Text>Back</Text> */}
          </TouchableOpacity>
          <Text className="text-white">Boarding pass</Text>
          <TouchableOpacity className="rounded-xl bg-black/10 p-2">
            <AntDesign name="sharealt" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-white">Nº N1337-1476-88</Text>
          <Text className="text-base text-white ">5 May, 2025</Text>
        </View>

        <View className="gap-y-3 rounded-xl bg-white">
          <View className="flex-row items-center justify-between  p-4">
            <View className="flex-row items-center gap-x-2">
              <Image source={require('../assets/images/logo.png')} className="h-6 w-7" />
              <View className="">
                <Text className="text-lg font-semibold">China Eastern Airlines</Text>
                <Text className="text-base text-slate-400">N1337</Text>
              </View>
            </View>
            <View className="">
              <Text className="text-lg font-semibold">2 seats</Text>
              <Text className="text-base text-slate-400">11h 40m</Text>
            </View>
          </View>

          <View className=" w-full  ">
            <Svg height="20" width="100%">
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </Svg>
          </View>

          <View className="flex-row  justify-between gap-x-4 px-4">
            <View className="flex-grow  gap-1 rounded-md bg-gray-50 p-2">
              <Text>Departure</Text>
              <Text className="text-xl font-semibold">9:10 PM</Text>
              <Text className="text-slate-400">14 June, 2023</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text>Arrival</Text>
              <Text className="text-xl font-semibold">2:25 PM</Text>
              <Text className="text-slate-400">25 June, 2025</Text>
            </View>
          </View>
          <View className="flex-row  justify-between gap-x-4 px-4">
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">3G, 3H</Text>
              <Text className="text-slate-400">Seats</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">T5</Text>
              <Text className="text-slate-400">Terminal</Text>
            </View>
            <View className=" flex-grow  gap-1  rounded-md bg-gray-50 p-2">
              <Text className="text-xl font-semibold">512</Text>
              <Text className="text-slate-400">Gate</Text>
            </View>
          </View>

          <View className=" w-full  ">
            <Svg height="16" width="100%">
              <Line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <Circle cx="0" cy="50%" r="8" fill="#c82f26" />
              <Circle cx="100%" cy="50%" r="8" fill="#c82f26" />
            </Svg>
          </View>

          <View className="mb-4 flex  py-2">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-x-2"
              onPress={handleSubmit}
              disabled={isLoadingPass}>
              <ActivityIndicator animating={isLoadingPass} color="#c82f26" className="-ml-6" />
              <Text className="text-center  text-slate-600">Add to Apple Wallet</Text>
              <Image source={require('../assets/images/apple_wallet.png')} className="h-5 w-7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View className="mt-8 flex-1 items-center justify-center rounded-t-3xl bg-white">
        <View className="absolute top-0 flex items-center justify-center ">
          <Svg height="80" width="100" viewBox="0 0 200 200">
            {/* Drawing the custom shape based on the uploaded image */}
            <Polygon
              points="0,0 200,0 170,30 30,30"
              fill="#c82f26"
              stroke="#c82f26"
              strokeWidth="1"
            />
            <Line x1="30%" y1="0%" x2="55%" y2="0%" stroke="#FFF" strokeWidth="16" />
          </Svg>
        </View>

        <QRCode
          value={URL}
          size={160}
          color="#111"
          backgroundColor="#fff"
          // logo={logo}
          // logoSize={40}
          // logoBackgroundColor="transparent"
        />
        <Text className="mt-6 text-slate-400">Show the QR code at the boarding gate</Text>
      </View>
    </View>
  );
};
