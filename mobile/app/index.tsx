import { Redirect } from 'expo-router';

export default function EntryIndex() {
  return <Redirect href="/(auth)/splash" />;
}
