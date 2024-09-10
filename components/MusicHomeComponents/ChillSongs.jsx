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
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import SongsPlayAndRedirectToMusicPlayer from "../../functions/SongsPlayAndRedirectToMusicPlayer";
import axios from "axios";
import { useMMKVString } from "react-native-mmkv";
import { storage } from "../Data/LocalStorage";

function ChillSongs({ userId, currentvideoId, showBottomSheet }) {
  // loacal data for ui
  const [ChillSongsData, setChillSongsData] = useState([]);

  // set video id
  const [firstvideoIdInitiate] = useState("OtLcqr3RQJY");
  const [videoId] = useMMKVString("chill-songs-videoId");

  // navigation
  const navigation = useNavigation();

  const { width } = Dimensions.get("window");

  // getting new realease song
  useEffect(() => {
    async function gettingTrendingSongs() {
      // getting song data
      const GamingMixData = await axios.get(
        `http://15.235.207.2/home?id=${videoIdCheck()}`
      );
      const { related } = GamingMixData.data;

      // set gaming mix data
      setChillSongsData(related);
    }

    function videoIdCheck() {
      if (videoId == undefined || videoId == null) {
        return firstvideoIdInitiate;
      } else {
        return videoId;
      }
    }
    gettingTrendingSongs();
  }, []);

  // redirect to see all songs playlist
  function redirectToSeeAllSongsPlaylist() {
    // image for page
    const ImageForPage = ChillSongsData[0];
    navigation.navigate("SeeAllSongsPlayList", {
      pageTitle: "FeelPlay chill Mix",
      SongPlayListData: ChillSongsData,
      userId: userId,
      PageImage: ImageForPage.artwork,
    });
  }

  // show bottom sheet in home page
  function showBottomSheetInHomePage(item) {
    showBottomSheet(item);
  }

  // rencently played flatlist
  const renderChillSongData = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        onPress={async () => {
          // check if title is similer to current title
          if (item.videoId == currentvideoId) {
            navigation.navigate("MusicPlayer");
          } else {
            // set video id for future play releted
            storage.set("chill-songs-videoId", item.videoId);
            SongsPlayAndRedirectToMusicPlayer(item, userId);
          }
        }}
        onLongPress={() => AddingSongIntoQueue(item)}
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
                    style={{ height: 40, width: 45 }}
                    loop
                    autoPlay
                    source={require("../../LottiAnimation/music.json")}
                  />
                ) : (
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ borderRadius: 3 }}
                    height={45}
                    width={45}
                  />
                )}
              </View>
            )}
            <View className="ml-3 w-52">
              <Text
                numberOfLines={2}
                className="text-white font-[Raleway-SemiBold] "
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={2}
                className="text-gray-300 font-[Raleway-Regular] text-xs"
              >
                {item.artist}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center ml-10">
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => showBottomSheetInHomePage(item)}
            >
              <Entypo name="dots-three-vertical" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View className="m-1 mb-14">
      <View className=" flex-1 flex-row justify-between items-center mb-2">
        <View>
          <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2">
            FeelPlay Chill Mix
          </Text>
          <Text className="text-white font-[Raleway-Regular] text-[14px]">
            Listen chill songs with feelPlay mix
          </Text>
        </View>
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
          data={ChillSongsData.slice(0, 36)}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          scrollToOverflowEnabled={false}
          maxToRenderPerBatch={16}
          numColumns={6}
          renderItem={renderChillSongData}
        />
      </ScrollView>
    </View>
  );
}
export default memo(ChillSongs);
