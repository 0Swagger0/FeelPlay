import { useFonts } from "expo-font";
import { useCallback, useEffect } from "react";
import SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ToastProvider } from "react-native-toast-notifications";
// screens
import Login from "./loginScreens/Login";
import Welcome from "./loginScreens/Welcome";
import BottomNavigater from "./components/BottomNavigater/BottomNavigater";
import MusicPlayer from "./screen/MusicPlayer";
import UserPlayList from "./screen/UserPlayList";
import LikePlayList from "./screen/LikePlayList";
import SeeAllSongsPlayList from "./screen/SeeAllSongsPlayList";
import SeeAllPlayListToPlay from "./screen/SeeAllPlayListToPlay";
import UserDetails from "./loginScreens/UserDetails";
import SearchAllSongs from "./screen/SearchAllSongs";
import Settings from "./screen/Settings";
import { PlaybackService } from "./PlaybackService";
import TrackPlayer, {
  AndroidAudioContentType,
  AppKilledPlaybackBehavior,
  Capability,
} from "react-native-track-player";
import JoinStreaming from "./screen/JoinStreaming";
import GroupListnerChats from "./screen/GroupListnerChats";
import Testing from "./screen/Testing";

// setup player
async function setUpPlayer() {
  await TrackPlayer.setupPlayer({
    autoHandleInterruptions: true,
    autoUpdateMetadata: true,
  }).then(() => {
    TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      icon: require("./assets/notification.png"),
    });
  });
}

export default function App() {
  // load fonts
  const [fontsLoaded] = useFonts({
    "Raleway-Bold": require("./Fonts/Raleway-Bold.ttf"),
    "Raleway-Light": require("./Fonts/Raleway-Light.ttf"),
    "Raleway-ExtraBold": require("./Fonts/Raleway-ExtraBold.ttf"),
    "Raleway-ExtraLight": require("./Fonts/Raleway-ExtraLight.ttf"),
    "Raleway-Heavy": require("./Fonts/Raleway-Heavy.ttf"),
    "Raleway-Medium": require("./Fonts/Raleway-Medium.ttf"),
    "Raleway-Regular": require("./Fonts/Raleway-Regular.ttf"),
    "Raleway-SemiBold": require("./Fonts/Raleway-SemiBold.ttf"),
  });

  const Stack = createNativeStackNavigator();

  useEffect(() => {
    setUpPlayer();

    // register track player
    TrackPlayer.registerPlaybackService(() => PlaybackService);
  }, []);

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
    startPlayer();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <ToastProvider>
        <Stack.Navigator>
          {/* music home screen */}
          <Stack.Screen
            name="BottomNavigater"
            component={BottomNavigater}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
            }}
          />

          {/* Search Screen */}
          <Stack.Screen
            name="SearchAllSongs"
            component={SearchAllSongs}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_bottom",
            }}
          />

          {/* Setting Screen */}
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              headerShown: false,
              animation: "slide_from_right",
              statusBarTranslucent: true,
            }}
          />

          {/* Tessting Screen */}
          <Stack.Screen
            name="Testing"
            component={Testing}
            options={{
              headerShown: false,
              animation: "slide_from_right",
              statusBarTranslucent: true,
            }}
          />

          {/* music player */}
          <Stack.Screen
            name="MusicPlayer"
            component={MusicPlayer}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_bottom",
            }}
          />

          {/* Welcome screen */}
          <Stack.Screen
            name="Welcome"
            component={Welcome}
            options={{ headerShown: false, statusBarTranslucent: true }}
          />

          {/* Login Screen */}
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_bottom",
            }}
          />

          {/* User details */}
          <Stack.Screen
            name="UserDetails"
            component={UserDetails}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_right",
            }}
          />

          {/* User play list screen */}
          <Stack.Screen
            name="UserPlayList"
            component={UserPlayList}
            options={{
              headerShown: false,
              animation: "slide_from_right",
              statusBarTranslucent: true,
            }}
          />

          {/* Like play list screen */}
          <Stack.Screen
            name="LikePlayList"
            component={LikePlayList}
            options={{
              headerShown: false,
              animation: "slide_from_right",
              statusBarTranslucent: true,
            }}
          />

          {/* See all songs playlist */}
          <Stack.Screen
            name="SeeAllSongsPlayList"
            component={SeeAllSongsPlayList}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_right",
            }}
          />

          {/* See all  playlist to play */}
          <Stack.Screen
            name="SeeAllPlayListToPlay"
            component={SeeAllPlayListToPlay}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_right",
            }}
          />

          {/* Join Stream screen */}
          <Stack.Screen
            name="JoinStreaming"
            component={JoinStreaming}
            options={{
              headerShown: false,
              animation: "slide_from_left",
              statusBarTranslucent: true,
            }}
          />

          {/* group listner chat screen */}
          <Stack.Screen
            name="GroupListnerChats"
            component={GroupListnerChats}
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              animation: "slide_from_right",
            }}
          />
        </Stack.Navigator>
      </ToastProvider>
    </NavigationContainer>
  );
}
