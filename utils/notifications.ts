import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// Configure how notifications are handled when the app is in the foreground
// (Notifications will still work when app is in background or closed)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permissions from the user.
 * @returns {Promise<boolean>} True if permissions are granted, otherwise false.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Return true if permissions are granted, otherwise false
  return finalStatus === 'granted';
}

/**
 * Schedules a daily notification at the specified time.
 * Cancels all existing notifications before scheduling the new one.
 * @param {number} hour - The hour (0-23) for the notification.
 * @param {number} minute - The minute (0-59) for the notification.
 * @param {string} quote - The quote to display in the notification.
 * @returns {Promise<boolean>} True if scheduling is successful, otherwise false.
 */
export async function scheduleDailyNotification(
  hour: number,
  minute: number,
  quote: string
): Promise<boolean> {
  // Validate input time
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.error('Invalid time input for notification');
    return false;
  }

  // Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Create trigger for the specified time
  const trigger: Notifications.DailyTriggerInput = {
    type: SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  try {
    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Helaas Pindakaas',
        body: quote,
        sound: true,
      },
      trigger,
    });
    console.log(`Notification scheduled for ${hour}:${minute}`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
}

/**
 * Cancels all scheduled notifications.
 * @returns {Promise<void>}
 */
export async function cancelNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}
