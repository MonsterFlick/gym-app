import { Platform } from 'react-native';

let Notifications: any = null;

try {
  // Safe import to prevent unhandled crashes in restricted environments like Expo Go Android
  Notifications = require('expo-notifications');
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldPresentAlert: true,
        shouldShowList: true,
      }),
    });
  }
} catch (error) {
  console.warn('[Notifications] Could not initialize expo-notifications:', error);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
    try {
      await Notifications.setNotificationChannelAsync('daily-alarms', {
        name: 'Daily Alarms & Routine',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF3B30',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync('hydration-reminders', {
        name: 'Hydration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    } catch (e) {
      console.warn('Error configuring notification channels:', e);
    }
  }
}

/**
 * Schedule a repeating daily notification at a specific hour and minute
 */
export async function scheduleDailyAlarm(params: {
  identifier: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Ensure channels are set up on Android
    await setupNotificationChannels();

    // Cancel existing notification with same identifier
    try {
      await Notifications.cancelScheduledNotificationAsync(params.identifier);
    } catch {}

    const id = await Notifications.scheduleNotificationAsync({
      identifier: params.identifier,
      content: {
        title: params.title,
        body: params.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'daily-alarms',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: params.hour,
        minute: params.minute,
      } as any,
    });

    return id;
  } catch (error) {
    console.warn('Error scheduling daily alarm:', error);
    return null;
  }
}

/**
 * Schedule repeating water reminder every interval minutes (e.g. 30 mins)
 */
export async function scheduleWaterIntervalReminder(intervalMinutes: number = 30): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    await setupNotificationChannels();

    const identifier = 'water-interval-reminder';
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {}

    const seconds = Math.max(60, intervalMinutes * 60);

    const id = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Hydration Check, Om',
        body: 'Time to drink water! Keep up your hydration. Remember: Zero Sugar, No Junk Food.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'hydration-reminders',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      } as any,
    });

    return id;
  } catch (error) {
    console.warn('Error scheduling water reminder:', error);
    return null;
  }
}

/**
 * Setup all user-requested alarms:
 * - 6:30 AM: Wake up (Weigh-in + No sugar / No junk oath)
 * - 8:00 AM: Creatine (5g dose + discipline reminder)
 * - 10:00 AM: Vitamin B (Daily dose + clean eating reminder)
 * - Every 30 mins: Water reminder + discipline reminder
 */
export async function initializeAllAlarms(): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await setupNotificationChannels();

  // 1. 6:30 AM: Wake up alarm
  await scheduleDailyAlarm({
    identifier: 'alarm-wake-up',
    title: 'Rise & Shine, Om (6:30 AM)',
    body: 'Time to wake up! Log morning weigh-in and drink water. Rule today: Zero Sugar, No Junk Food.',
    hour: 6,
    minute: 30,
  });

  // 2. 8:00 AM: Creatine alarm
  await scheduleDailyAlarm({
    identifier: 'alarm-creatine',
    title: 'Creatine Reminder, Om (8:00 AM)',
    body: 'Take your 5g Creatine Monohydrate with water. Stay disciplined: Clean fuel only, No sugar.',
    hour: 8,
    minute: 0,
  });

  // 3. 10:00 AM: Vitamin B alarm
  await scheduleDailyAlarm({
    identifier: 'alarm-vitamin-b',
    title: 'Vitamin B Reminder, Om (10:00 AM)',
    body: 'Take your Vitamin B complex dose. Keep nutrition 100% clean: No junk, No refined sugar.',
    hour: 10,
    minute: 0,
  });

  // 4. Every 30 minutes: Water reminder with discipline check
  await scheduleWaterIntervalReminder(30);
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm System Test',
        body: 'Active Alarms: 6:30 AM Wake Up | 8:00 AM Creatine (5g) | 10:00 AM Vitamin B | Every 30m Water.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      } as any,
    });
    return true;
  } catch (error) {
    console.warn('Error sending test notification:', error);
    return false;
  }
}
