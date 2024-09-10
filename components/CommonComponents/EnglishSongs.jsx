import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableNativeFeedback,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SongsPlayAndRedirectToMusicPlayer from "../../functions/SongsPlayAndRedirectToMusicPlayer";
import { storage } from "../Data/LocalStorage";
import { useMMKVString } from "react-native-mmkv";
import axios from "axios";

export default function EnglishSongs({
  userId,
  currentvideoId,
  showBottomSheet,
}) {
  const [EnglishSongsData, setEnglishSongsData] = useState([]);

  // set video id
  const [firstvideoIdInitiate] = useState("3_g2un5M350");
  const [videoId] = useMMKVString("english-song-videoId");

  // navigation
  const navigation = useNavigation();

  // getting new realease song
  http: useEffect(() => {
    async function gettingEnglishSongs() {
      // getting song data
      const EnglishSongData = await axios.get(
        `http://15.235.207.2/home?id=${videoIdCheck()}`
      );
      const { related } = EnglishSongData.data;

      setEnglishSongsData(related);
    }

    // check if videoId initiated
    function videoIdCheck() {
      if (videoId == undefined || videoId == null) {
        return firstvideoIdInitiate;
      } else {
        return videoId;
      }
    }
    gettingEnglishSongs();
  }, []);

  // redirect to see all songs playlist
  function redirectToSeeAllSongsPlaylist() {
    // image for page
    const ImageForPage = EnglishSongsData[0];
    navigation.navigate("SeeAllSongsPlayList", {
      pageTitle: "Top english songs",
      SongPlayListData: EnglishSongsData,
      userId: userId,
      PageImage: ImageForPage.artwork,
    });
  }

  // adding songs to queue
  function AddingSongIntoQueue(song) {
    showBottomSheet(song);
  }

  // render english songs
  const renderEnglishSongs = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        key={index}
        onPress={() => {
          // check if title is similer to current title
          if (item.videoId == currentvideoId) {
            navigation.navigate("MusicPlayer");
          } else {
            // set videoId
            storage.set("english-song-videoId", item.videoId);
            SongsPlayAndRedirectToMusicPlayer(item, userId);
          }
        }}
        onLongPress={() => AddingSongIntoQueue(item)}
      >
        <View className="flex-col mr-2">
          <Image
            source={{ uri: item.artwork }}
            style={{
              height: 130,
              width: 130,
              borderRadius: 5,
              shadowColor: "black",
              shadowOpacity: 0.3,
            }}
          />
          <LinearGradient
            style={{
              position: "absolute",
              height: 130,
              width: 130,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0.5 }}
            colors={[
              "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
              "transparent",
            ]}
          >
            <View>
              {item.videoId == currentvideoId ? (
                <LottieView
                  style={{ height: 40, width: 40 }}
                  loop
                  autoPlay
                  source={require("../../LottiAnimation/music.json")}
                />
              ) : (
                <View className="flex-row items-center m-3">
                  <MaterialIcons name="play-arrow" color="white" size={25} />
                </View>
              )}
            </View>
          </LinearGradient>
          <View className="flex-col mt-1">
            <Text
              numberOfLines={1}
              style={{
                color: "white",
                fontFamily: "Raleway-Bold",
                fontSize: 13,
                maxWidth: 130,
              }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: "white",
                fontFamily: "Raleway-Regular",
                fontSize: 12,
                maxWidth: 130,
              }}
            >
              {item.artist}
            </Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View className="m-1">
      {/* English songs */}
      <View className="flex-row justify-between items-center  mt-2 mb-2">
        <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2">
          Top english
        </Text>
        <TouchableOpacity onPress={redirectToSeeAllSongsPlaylist}>
          <View className="px-2 py-1 bg-gray-900 rounded-[20px]">
            <Text className="text-white font-[Raleway] text-[10px]">
              View all
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        overScrollMode="never"
        scrollToOverflowEnabled={false}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={16}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={21}
        data={EnglishSongsData.slice(0, 20)}
        renderItem={renderEnglishSongs}
      />
    </View>
  );
}
