import {
  View,
  Text,
  TouchableNativeFeedback,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useMMKVString } from "react-native-mmkv";
import SongsPlayAndRedirectToMusicPlayer from "../../functions/SongsPlayAndRedirectToMusicPlayer";
import axios from "axios";
import { storage } from "../Data/LocalStorage";

export default function GamingMix({ currentvideoId, showBottomSheet }) {
  // navigation
  const navigation = useNavigation();
  // Gaming song data
  const [GamingMixSongData, setGamingMixSongData] = useState([]);
  const [userId] = useMMKVString("userId");

  // video id initilize
  const [firstvideoIdInitiate] = useState("zVWqRdA2Go4");
  const [videoId] = useMMKVString("gaming-videoId");

  // load Gaming song data
  useEffect(() => {
    async function GetGamingMixSongData() {
      // getting gaming mix song data
      const GamingMixData = await axios.get(
        `http://15.235.207.2/home?id=${videoIdCheck()}`
      );
      const { related } = GamingMixData.data;

      // set gaming mix data
      setGamingMixSongData(related);
    }
    // check if videoId initiated
    function videoIdCheck() {
      if (videoId == undefined || videoId == null) {
        return firstvideoIdInitiate;
      } else {
        return videoId;
      }
    }

    GetGamingMixSongData();
  }, []);

  // redirect to see all songs playlist
  function redirectToSeeAllSongsPlaylist() {
    // image for page
    const ImageForPage = GamingMixSongData[0];
    navigation.navigate("SeeAllSongsPlayList", {
      pageTitle: "Gaming Mix",
      SongPlayListData: GamingMixSongData,
      userId: userId,
      PageImage: ImageForPage.artwork,
    });
  }

  // adding songs to queue
  function AddingSongIntoQueue(song) {
    showBottomSheet(song);
  }

  // rencently played flatlist
  const GamingMixSongsRenderList = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        onPress={() => {
          // check if title is similer to current title
          if (item.videoId == currentvideoId) {
            navigation.navigate("MusicPlayer");
          } else {
            // set video id for future to get releted data
            storage.set("gaming-videoId", item.videoId);
            SongsPlayAndRedirectToMusicPlayer(item, userId);
          }
        }}
        onLongPress={() => AddingSongIntoQueue(item)}
        key={index}
      >
        <View className="flex-col mr-2">
          <Image
            defaultSource={require("../../Icons/icons8-music-240.png")}
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
              alignItems: "flex-end",
              justifyContent: "flex-end",
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
                  <Text className="text-white font-[Raleway-Regular] text-[13px]">
                    Let's play
                  </Text>
                  <AntDesign
                    style={{ marginLeft: 3 }}
                    name="play"
                    color="white"
                    size={15}
                  />
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
    <View className="flex-1 m-1 mb-2">
      <View className=" flex-1 flex-row justify-between items-center mb-2">
        <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2">
          Gaming Mix
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
        maxToRenderPerBatch={16}
        data={GamingMixSongData.slice(0, 20)}
        renderItem={GamingMixSongsRenderList}
      />
    </View>
  );
}
