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
      // Remove deprecated channel if present to clear previous default sounds
      if (Notifications.deleteNotificationChannelAsync) {
        try {
          await Notifications.deleteNotificationChannelAsync('daily-alarms');
        } catch {}
      }

      // Loud, long alarm channel with ALARM audio attributes & intense vibration pattern
      await Notifications.setNotificationChannelAsync('daily-loud-alarms-v2', {
        name: 'Loud Alarms (Wake-up, Creatine, Vitamin B)',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'alarm_loud.wav',
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage ? Notifications.AndroidAudioUsage.ALARM : 4,
          contentType: Notifications.AndroidAudioContentType ? Notifications.AndroidAudioContentType.SONIFICATION : 4,
          flags: {
            enforceAudibility: true,
            requestHardwareAudioVideoSynchronization: false,
          },
        },
        // 6+ seconds intense vibration sequence
        vibrationPattern: [0, 800, 300, 800, 300, 800, 300, 1200, 400, 1200],
        lightColor: '#FF3B30',
        enableVibrate: true,
        bypassDnd: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Hydration reminder channel (regular notification sound)
      await Notifications.setNotificationChannelAsync('hydration-reminders', {
        name: 'Hydration Notifications',
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
        sound: 'alarm_loud.wav',
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: 'daily-loud-alarms-v2',
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
 * - 10:00 PM: Vitamin B (Night dose + clean eating reminder)
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

  // 3. 10:00 PM: Vitamin B alarm (22:00)
  await scheduleDailyAlarm({
    identifier: 'alarm-vitamin-b',
    title: 'Vitamin B Reminder, Om (10:00 PM)',
    body: 'Take your Vitamin B complex dose before winding down. Keep nutrition 100% clean: Zero sugar, No junk.',
    hour: 22,
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

    await setupNotificationChannels();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Loud Alarm Test (Om)',
        body: 'Loud & long alarm test. Urgent 10s audio + multi-pulse vibration.',
        sound: 'alarm_loud.wav',
        channelId: 'daily-loud-alarms-v2',
        priority: Notifications.AndroidNotificationPriority.MAX,
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
