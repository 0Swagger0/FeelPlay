import {
  View,
  Text,
  Image,
  FlatList,
  TouchableNativeFeedback,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { useMMKVString } from "react-native-mmkv";
import SongsPlayAndRedirectToMusicPlayer from "../../functions/SongsPlayAndRedirectToMusicPlayer";
import { Entypo } from "@expo/vector-icons";
import axios from "axios";
import { storage } from "../Data/LocalStorage";

function EasyMorningPlayList({ currentvideoId, userId, showBottomSheet }) {
  // variables
  const [HindiRomanticData, setHindiRomanticData] = useState([]);
  const [firstvideoIdInitiate] = useState("kHq1zNTnPSY");
  const [videoId] = useMMKVString("hindi-romantic-videoId");
  // navigation

  const { width } = Dimensions.get("window");

  // navigation
  const navigation = useNavigation();

  // getting top playlist
  useEffect(() => {
    async function gettingSecondPageData() {
      // getting song data
      const HindiRomanceData = await axios.get(
        `http://15.235.207.2/home?id=${videoIdCheck()}`
      );
      const { related } = HindiRomanceData.data;
      // set gaming mix data
      setHindiRomanticData(related);
    }

    // check if videoId initiated
    function videoIdCheck() {
      if (videoId == undefined || videoId == null) {
        return firstvideoIdInitiate;
      } else {
        return videoId;
      }
    }
    gettingSecondPageData();
  }, []);

  // redirect to see all songs playlist
  function redirectToSeeAllSongsPlaylist() {
    navigation.navigate("SeeAllSongsPlayList", {
      pageTitle: "Hindi Romance",
      SongPlayListData: HindiRomanticData,
      userId: userId,
      PageImage:
        "https://cloud.appwrite.io/v1/storage/buckets/650ca72d222dcdab8694/files/6525622aac85cf467242/view?project=648f5e20288beef91b21&mode=admin",
    });
  }

  // show bottom sheet in home page
  function showBottomSheetInHomePage(item) {
    showBottomSheet(item);
  }
  // rencently played flatlist
  const HindiRomanticRender = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        onLongPress={() => fileGetting(item)}
        onPress={async () => {
          // check if title is similer to current title
          if (item.videoId == currentvideoId) {
            navigation.navigate("MusicPlayer");
          } else {
            // set video id for future play related
            storage.set("hindi-romantic-videoId", item.videoId);
            SongsPlayAndRedirectToMusicPlayer(item, userId);
          }
        }}
        key={index}
      >
        <View
          style={{ width: width - 45, margin: 3 }}
          className="flex-row items-center justify-between"
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
            <View className="ml-3 max-w-[200px]">
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
    <View className="mt-5 bg-gray-800 rounded-[15px] p-4">
      <View className=" flex-1 flex-row justify-between items-center  mt-2 mb-2">
        {/* lottie animation */}
        <LottieView
          loop
          autoPlay
          source={require("../../LottiAnimation/MusicWaves.json")}
          style={{ height: 100, width: 100, position: "absolute" }}
        />
        <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2">
          FeelPlay Top Hindi Mix
        </Text>

        <TouchableOpacity onPress={redirectToSeeAllSongsPlaylist}>
          <View className="px-2 py-1 bg-gray-900 rounded-[20px]">
            <Text className="text-white font-[Raleway] text-[10px]">
              View all
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center mt-2">
        {/* playlist page image */}
        <Image
          source={{
            uri: "https://cloud.appwrite.io/v1/storage/buckets/650ca72d222dcdab8694/files/6525622aac85cf467242/view?project=648f5e20288beef91b21&mode=admin",
          }}
          height={100}
          width={100}
          style={{
            borderRadius: 5,
          }}
        />
        <View className="flex-col p-2 ml-2">
          <Text className="text-white font-[Raleway-Heavy] text-[20px] mt-2">
            Hindi Romance
          </Text>
          <Text className="text-white max-w-[200px] font-[Raleway-Regular] text-[14px]">
            Best bollywood romantic songs
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        style={{ flex: 1, marginTop: 10 }}
      >
        <FlatList
          columnWrapperStyle={{ alignItems: "center", padding: 2 }}
          data={HindiRomanticData.slice(0, 20)}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          scrollToOverflowEnabled={false}
          maxToRenderPerBatch={16}
          numColumns={4}
          renderItem={HindiRomanticRender}
        />
      </ScrollView>
    </View>
  );
}
export default memo(EasyMorningPlayList);
