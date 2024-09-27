import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  Alert,
  Share,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ArtistTicker, TitleTicker } from "./TickerText";
import LikeSongsExists from "./LikeSongsExists";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import ProgressAndDuration from "./CommonComponents/ProgressAndDuration";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import { useToast } from "react-native-toast-notifications";
import { getDatabase, ref, remove, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { storage } from "./Data/LocalStorage";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import { getColors } from "react-native-image-colors";
import Lyrics from "./Lyrics";

function CustomLinearGradient({ item, setvisibleModel }) {
  const toast = useToast();
  // image color
  const [ImageColor, setImageColor] = useState("");
  const [repeatMode, setrepeatMode] = useState("off");
  // /firebase database
  const fireDatabase = getDatabase(App);

  // streaming variable
  const [userId] = useMMKVString("userId");
  const [RoomConnectedTo] = useMMKVString("RoomConnectedTo");
  const [isStreaming] = useMMKVBoolean("isStreaming");
  const [userFirstName] = useMMKVString("userfirstname");
  const [connectedToStream] = useMMKVBoolean("connectedToStream");
  // change color according to image

  useEffect(() => {
    getColors(item.artwork, {
      fallback: "#36454F",
      cache: true,
      quality: "high",
      key: item.artwork,
    }).then(setImageColor);
  }, [item]);

  // repeat mode
  function checkRepeatMode() {
    if (repeatMode == "off") {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      toast.show("Shuffle Play", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      setrepeatMode("track");
    }
    if (repeatMode == "track") {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      toast.show("Repeat 1", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      setrepeatMode("repeat-once");
    }
    if (repeatMode == "repeat-once") {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      toast.show("Repeat all", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      setrepeatMode("off");
    }
  }

  // stop stream by host
  function stopStreamByHost() {
    const stopStreamByHostRef = ref(fireDatabase, "Streaming/" + userId);
    remove(stopStreamByHostRef)
      .then(() => {
        toast.show("Streaming was stop", {
          type: "success",
          placement: "center",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
      })
      .then(() => {
        // update value in local storage
        storage.set("isStreaming", false);
        // remove listeners chats
        removeListenersChats();
      });
  }

  // remove listener chats
  function removeListenersChats() {
    // remove listeners chats
    const removeListenerChatRef = ref(fireDatabase, "ListenersChats/" + userId);
    remove(removeListenerChatRef);
  }

  // diconnected from stream
  function disconnectedFromStream() {
    Alert.alert("", "Are you sure to disconnect with stream", [
      {
        text: "Yes",
        onPress: () => {
          const disconnectedRef = ref(
            fireDatabase,
            "Streaming/" + RoomConnectedTo + "/" + userId
          );
          remove(disconnectedRef).then(() => {
            // set empty value in local storage
            storage.delete("RoomConnectedTo");
            storage.set("connectedToStream", false);

            // toas message
            toast.show("Disconnected from stream", {
              type: "success",
              placement: "center",
              duration: 4000,
              offset: 30,
              animationType: "slide-in",
              successColor: "#D90026",
            });
          });
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }

  // open sharing
  async function openShare() {
    Share.share({
      message:
        "Listen songs with your friend with FeelPlay" +
        "\n" +
        "Copy RoomId: " +
        userId,
    })
      .then(({ action, activityType }) => {
        if (action === Share.dismissedAction) console.log("Share dismissed");
        else createStreamingChildInFirebase();
      })
      .catch(() => {
        console.log("cencelled");
      });
  }

  // create streaming child in firebase
  function createStreamingChildInFirebase() {
    const createStreamingRef = ref(
      fireDatabase,
      "Streaming/" + userId + "/" + userId
    );
    update(createStreamingRef, {
      host: true,
      userName: userFirstName,
      userId: userId,
      RoomId: userId,
    }).then(() => {
      setvisibleModel(true);
    });
  }
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
      }}
    >
      <LinearGradient
        start={{ x: 0.1, y: 0.7 }}
        end={{ x: 0.1, y: 0.2 }}
        colors={[
          ImageColor != null ? ImageColor.darkVibrant : null,
          "transparent",
          ImageColor != null ? ImageColor.darkVibrant : null,
        ]}
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
        }}
      >
        {/* lyrics */}
        <View className="flex">
          <Lyrics LinearGradientColor={ImageColor.darkVibrant} />
        </View>
        <View className="flex-1 justify-end mb-14">
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                padding: 5,
                marginBottom: 25,
              }}
            >
              <View className="flex-col p-2">
                <View className="flex-col">
                  {/* title */}
                  <TitleTicker title={item.title} />
                  {/* artist title */}
                  <ArtistTicker artist={item.artist} />
                </View>

                <View className="flex-row items-center mt-2 mb-[-15]">
                  {/* check song already added in life songs */}
                  <LikeSongsExists />

                  {/* check repeat mode */}
                  <View>
                    {repeatMode == "off" ? (
                      <TouchableOpacity onPress={checkRepeatMode}>
                        <MaterialCommunityIcons
                          style={{ marginRight: 20 }}
                          name="repeat-off"
                          size={24}
                          color={repeatMode == "off" ? "white" : "#D90026"}
                        />
                      </TouchableOpacity>
                    ) : repeatMode == "track" ? (
                      <TouchableOpacity onPress={checkRepeatMode}>
                        <MaterialCommunityIcons
                          style={{ marginRight: 20 }}
                          name="repeat"
                          size={24}
                          color={repeatMode == "off" ? "white" : "#D90026"}
                        />
                      </TouchableOpacity>
                    ) : repeatMode == "repeat-once" ? (
                      <TouchableOpacity onPress={checkRepeatMode}>
                        <MaterialCommunityIcons
                          style={{ marginRight: 20 }}
                          name="repeat-once"
                          size={24}
                          color={repeatMode == "off" ? "white" : "#D90026"}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* streming with friends */}

                  {isStreaming ? (
                    <TouchableNativeFeedback onPress={stopStreamByHost}>
                      <View className="flex-row items-center p-1 ml-[-5px]">
                        <Text className="text-white text- font-[Raleway-SemiBold]">
                          Stop streaming
                        </Text>
                        <LottieView
                          style={{ height: 30, width: 30 }}
                          loop
                          autoPlay
                          source={require("../LottiAnimation/Streaming.json")}
                        />
                      </View>
                    </TouchableNativeFeedback>
                  ) : (
                    <View>
                      {connectedToStream ? (
                        <TouchableNativeFeedback
                          onPress={disconnectedFromStream}
                        >
                          <View className="flex-row items-center p-1 ml-[-5px]">
                            <Text className="text-white text- font-[Raleway-SemiBold]">
                              Disconnect
                            </Text>
                            <LottieView
                              style={{ height: 30, width: 30 }}
                              loop
                              autoPlay
                              source={require("../LottiAnimation/Streaming.json")}
                            />
                          </View>
                        </TouchableNativeFeedback>
                      ) : (
                        <TouchableNativeFeedback onPress={openShare}>
                          <View className="flex-row items-center p-1 ml-[-5px]">
                            <Text className="text-white text- font-[Raleway-SemiBold]">
                              Streaming
                            </Text>
                            <LottieView
                              style={{ height: 30, width: 30 }}
                              loop
                              autoPlay
                              source={require("../LottiAnimation/Streaming.json")}
                            />
                          </View>
                        </TouchableNativeFeedback>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* progress bar */}
              <ProgressAndDuration />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default memo(CustomLinearGradient);
