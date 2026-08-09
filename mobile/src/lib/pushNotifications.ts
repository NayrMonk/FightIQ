import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// ponytail: no EAS projectId configured in app.json yet (no expo.extra.eas.projectId).
// getExpoPushTokenAsync() can still succeed in Expo Go's dev environment without one;
// if it can't, we just no-op and push registration stays a silent skip until EAS is set up.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let status = existingStatus;
    if (status !== "granted") {
      const { status: requested } = await Notifications.requestPermissionsAsync();
      status = requested;
    }
    if (status !== "granted") return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data;
  } catch {
    return null;
  }
}
