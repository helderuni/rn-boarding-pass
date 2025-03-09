import { Stack, Link } from 'expo-router';

import { BoardingPass } from '~/components/BoardingPass';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      <BoardingPass />
    </>
  );
}
