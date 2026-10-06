import { Stack, Link } from 'expo-router';

import { TravelCard } from '~/components/TravelCard';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      <TravelCard />
    </>
  );
}
