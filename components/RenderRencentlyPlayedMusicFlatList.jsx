import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import SongsPlayAndRedirectToMusicPlayer from "../functions/SongsPlayAndRedirectToMusicPlayer";
import { useMMKVString } from "react-native-mmkv";

export default function RenderRencentlyPlayedMusicFlatList({
  item,
  index,
  AddingSongIntoQueue,
  currentvideoId,
}) {
  // navigation
  const navigation = useNavigation();
  const [userId] = useMMKVString("userId");

  // redirect to music player
  async function PlayMusicToSelectedIndex(songDetails) {
    const videoId = songDetails.videoId;

    if (currentvideoId == videoId) {
      navigation.navigate("MusicPlayer");
    } else {
      SongsPlayAndRedirectToMusicPlayer(songDetails, userId);
    }
  }

  return (
    <View className="flex-col mr-2">
      <TouchableOpacity
        onPress={() => PlayMusicToSelectedIndex(item)}
        onLongPress={() => AddingSongIntoQueue(item)}
        key={index}
      >
        <Image
          defaultSource={require("../Icons/icons8-music-240.png")}
          source={{ uri: item.artwork }}
          style={{
            height: 100,
            width: 100,
            borderRadius: 5,
            shadowColor: "black",
            shadowOpacity: 0.3,
          }}
        />

        <LinearGradient
          style={{
            position: "absolute",
            height: 100,
            width: 100,
            borderRadius: 5,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.4, y: 0.4 }}
          colors={[
            "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
            "transparent",
          ]}
        />
        <Text
          style={{
            color: "white",
            fontFamily: "Raleway-Bold",
            fontSize: 13,
            marginTop: 5,
            maxWidth: 100,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-white font-[Raleway-Light] text-xs max-w-[100px]"
        >
          {item.artist}
        </Text>
        {item.videoId == currentvideoId ? (
          <Ionicons
            style={{ position: "absolute", alignSelf: "baseline", margin: 2 }}
            name="pause-circle-outline"
            size={24}
            color="white"
          />
        ) : (
          <Ionicons
            style={{ position: "absolute", alignSelf: "baseline", margin: 2 }}
            name="play-circle-outline"
            size={24}
            color="white"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
