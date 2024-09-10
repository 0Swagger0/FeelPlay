import {
  View,
  Text,
  Image,
  FlatList,
  TouchableNativeFeedback,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import SongsPlayAndRedirectToMusicPlayer from "../../functions/SongsPlayAndRedirectToMusicPlayer";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { useMMKVString } from "react-native-mmkv";

function MusicForYou({
  userId,
  userFirstName,
  currentvideoId,
  showBottomSheet,
  setcheckPlayListDataLoaded,
}) {
  // variable
  const [MusicForYouData, setMusicForYouData] = useState([]);

  // initialize video id
  const [firstvideoIdInitiate] = useState("iP872SycxjI");
  const [videoId] = useMMKVString("quick-pick-videoId");

  // navigation
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  // getting all songs data for user
  useEffect(() => {
    async function gettingSongForUser() {
      // get data for quick picks
      const QuickPicksData = await axios.get(
        `http://15.235.207.2/home?id=${videoIdCheck()}`
      );
      const { related } = QuickPicksData.data;

      setMusicForYouData(related);
      // loading false
      setcheckPlayListDataLoaded(false);
    }

    // check if videoId initiated
    function videoIdCheck() {
      if (videoId == undefined || videoId == null) {
        return firstvideoIdInitiate;
      } else {
        return videoId;
      }
    }

    gettingSongForUser();
  }, []);

  // redirect to see all songs playlist
  function redirectToSeeAllSongsPlaylist() {
    // image for page
    const ImageForPage = MusicForYouData[0];
    navigation.navigate("SeeAllSongsPlayList", {
      pageTitle: "Quick picks for " + userFirstName,
      SongPlayListData: MusicForYouData,
      userId: userId,
      PageImage: ImageForPage.artwork,
    });
  }

  // adding songs to queue
  function showPlayListBottomSheet(song) {
    showBottomSheet(song);
  }

  // rencently played flatlist
  const MusicForYouFlatList = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        onPress={async () => {
          // check if title is similer to current title
          if (item.videoId == currentvideoId) {
            navigation.navigate("MusicPlayer");
          } else {
            SongsPlayAndRedirectToMusicPlayer(item, userId);
          }
        }}
        key={index}
      >
        <View
          style={{ width: width - 15 }}
          className="flex-row items-center justify-between p-1"
        >
          <View className="flex-row items-center">
            {item.artwork == "" ? (
              <Image
                height={50}
                width={50}
                defaultSource={require("../../Icons/icons8-music-240.png")}
              />
            ) : (
              <View>
                {item.videoId == currentvideoId ? (
                  <LottieView
                    style={{ height: 42, width: 50 }}
                    loop
                    autoPlay
                    source={require("../../LottiAnimation/music.json")}
                  />
                ) : (
                  <Image
                    style={{ borderRadius: 3 }}
                    source={{ uri: item.artwork }}
                    height={50}
                    width={50}
                  />
                )}
              </View>
            )}
            <View className="ml-3 max-w-[230px]">
              <Text
                numberOfLines={1}
                className="text-white font-[Raleway-Bold] text-[15px]"
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 font-[Raleway-SemiBold] text-xs"
              >
                {item.artist}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center ml-5">
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => showPlayListBottomSheet(item)}
            >
              <Entypo name="dots-three-vertical" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View className="m-1">
      <View className=" flex-1 flex-row justify-between items-center  mt-2 mb-2">
        <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2 ">
          Quick picks for {userFirstName}
        </Text>

        <TouchableOpacity onPress={redirectToSeeAllSongsPlaylist}>
          <View className="px-2 py-1 bg-gray-900 rounded-[20px]">
            <Text className="text-white font-[Raleway] text-[10px]">
              View all
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        style={{ flex: 1 }}
      >
        <FlatList
          columnWrapperStyle={{ alignItems: "center", padding: 2 }}
          data={MusicForYouData.slice(0, 20)}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          scrollToOverflowEnabled={false}
          maxToRenderPerBatch={16}
          numColumns={4}
          renderItem={MusicForYouFlatList}
        />
      </ScrollView>
    </View>
  );
}
export default memo(MusicForYou);
