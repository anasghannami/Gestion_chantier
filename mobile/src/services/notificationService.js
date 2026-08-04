import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

// ─── Configuration par défaut de l'affichage des notifications ───
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const priority = notification.request.content.data?.priority || 'ALERTE';
    
    // Déclenchement haptique selon la priorité
    if (priority === 'CRITIQUE') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
    } else if (priority === 'ALERTE') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: priority !== 'INFO',
      shouldSetBadge: true,
    };
  },
});

// ─── Initialisation & Canaux Android ───
export async function registerForPushNotificationsAsync() {
  let token = null;

  if (Platform.OS === 'android') {
    // Canal CRITIQUE (Rouge, haute priorité, vibration lourde)
    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Alertes Critiques',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
      enableLights: true,
      enableVibrate: true,
      sound: 'default',
    });

    // Canal ALERTE (Orange, priorité standard)
    await Notifications.setNotificationChannelAsync('alert', {
      name: 'Alertes Standards',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      enableLights: true,
      enableVibrate: true,
    });

    // Canal INFO (Silencieux)
    await Notifications.setNotificationChannelAsync('info', {
      name: 'Informations',
      importance: Notifications.AndroidImportance.LOW,
      enableVibrate: false,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission de notification refusée');
    return null;
  }

  try {
    const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
    if (!isExpoGo) {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token Expo:', token);
    } else {
      console.log('Mode Expo Go: Notifications locales et alertes activées.');
    }
  } catch (e) {
    console.log('Notifications locales actives.');
  }

  return token;
}

// ─── Programmer une notification locale ───
export async function scheduleLocalNotification({
  title,
  body,
  data = {},
  priority = 'ALERTE', // 'CRITIQUE' | 'ALERTE' | 'INFO'
  seconds = 1,
}) {
  const channelId = priority === 'CRITIQUE' ? 'critical' : priority === 'INFO' ? 'info' : 'alert';

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, priority },
      sound: priority !== 'INFO',
      badge: 1,
      categoryIdentifier: priority,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
}

// ─── Gestion du badge de l'icône de l'app ───
export async function updateAppBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (e) {
    console.log('Mise à jour du badge non supportée sur cette plateforme');
  }
}

// ─── Écouteurs de notifications ───
export function addNotificationListeners({ onNotificationReceived, onNotificationResponse }) {
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived?.(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationResponse?.(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
