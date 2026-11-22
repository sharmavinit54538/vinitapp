import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Handles Android hardware back navigation natively.
 * Return `true` from `onBackPress` to consume the back gesture/button event.
 */
export function useAndroidBackNavigation(onBackPress: () => boolean) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [onBackPress]);
}
