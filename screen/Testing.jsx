import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  Image,
  FlatList,
  Alert,
} from "react-native";

import * as FileSystem from "expo-file-system";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { useState } from "react";

const API_KEY = "AIzaSyBpctfB4xmAQOJ903s-Me4ehga4PnDu6pc";

export default function Testing({ route }) {
  const songData = [
    {
      id: 1,
      url: "https://mp3api.ytjar.info/mp3.php?id=NBtPMSLeLm99u30iT%2FJae6qY9AuXscMaCttfVmZW3Z0TutZitezPEzHFCFJlRPg",
      title: "Soniye",
      artist: "KK, Sunidhi Chauhan, Vishal Shekhar, Sameer",
      duration: 273,
      artwork:
        "https://i.scdn.co/image/ab67616d0000b2735a03d432fc1428df7876c4bd",
    },
    {
      id: 2,
      url: "https://firebasestorage.googleapis.com/v0/b/feelplay-fd7ce.appspot.com/o/Songs%2FAashiqui_ZHizn_vo_imya_lyubvi_-_Dheere_Dheere_Se_Meri_Zindagi_Main_Aana_(Rilds.com).mp3?alt=media&token=ed1076f5-85b4-45df-8a34-5ed69cee3202",
      title: "Dheere Dheere Se Meri Zindagi Mein Aana",
      artist: "Anuradha Paudwal, Kumar Sanu",
      duration: 316.2,
      artwork:
        "https://c.saavncdn.com/088/Aashiqui-Hindi-1989-20221118014024-500x500.jpg",
    },
    {
      id: 3,
      url: "https://firebasestorage.googleapis.com/v0/b/feelplay-fd7ce.appspot.com/o/Songs%2FNevidomij_-_Khuda_Jaane_(Rilds.com).mp3?alt=media&token=9d473a5c-f330-43d5-b0a8-86804467ea67",
      title: "Khuda Jaane",
      artist: "Vishal & Shekhar, KK, Shilpa Rao, Anvita Dutt Guptan",
      duration: 319.8,
      artwork:
        "https://i1.sndcdn.com/artworks-000560550684-k8zk6b-t500x500.jpg",
    },
  ];

  // compressed function
  async function playSongs(songdetails) {
    // file storage
    const title = songdetails.title;
    try {
      // check if directory exist
      await FileSystem.readDirectoryAsync(
        "file:///data/user/0/com.FeelPLay/files/dash/" + title
      )
        .then(() => {
          alreadyDownloadedJustPlayDashAudio(songdetails);
        })
        .catch((error) => {
          createDirecortyAndPlayDashAudioFile(songdetails);
        });
    } catch (error) {
      console.error("Error processing file:", error);
    }
  }

  const [query] = useState("YALvuUpY_b0");

  // create directory and play dash file with compression file
  async function createDirecortyAndPlayDashAudioFile(songdetails) {
    // track details
    const id = songdetails.id;
    const url = songdetails.url; // <=== Appwrite Remote Url
    const title = songdetails.title;
    const artist = songdetails.artist;
    const duration = songdetails.duration;
    const artwork = songdetails.artwork;

    const response = await fetch(
      `http://192.168.1.4:3000/audio?videoId=${encodeURIComponent(query)}`
    );
  }

  //already Downloaded JustPlay Dash Audio
  async function alreadyDownloadedJustPlayDashAudio(songdetails) {
    // restart track player
    TrackPlayer.reset().then(() => {
      // adding dash audio file to track player
      TrackPlayer.add({
        id: songdetails.id,
        url:
          "file:///data/user/0/com.FeelPLay/files/dash/" +
          songdetails.title +
          "/" +
          "manifest.mpd",
        title: songdetails.title,
        artist: songdetails.artist,
        contentType: "dash",
        type: "dash",
        duration: songdetails.duration,
        artwork: songdetails.artwork,
      });

      TrackPlayer.play();
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
    });
  }
  //

  // getting files
  async function fileGetting(data) {
    // get url of compressed fill
    const files = await FileSystem.deleteAsync(
      "file:///data/user/0/com.FeelPLay/files/dash/" + data.title
    );

    const info = await FileSystem.getInfoAsync(
      "file:///data/user/0/com.FeelPLay/files/dash/" + data.title
    );

    console.log("file Read:", files);
    console.log("file info:", info);
  }

  // getting files
  async function detail(data) {
    // get url of compressed fill
    const files = await FileSystem.readDirectoryAsync(
      "file:///data/user/0/com.FeelPLay/files/dash/" + data.title
    );

    const info = await FileSystem.getInfoAsync(
      "file:///data/user/0/com.FeelPLay/files/dash/" + data.title
    );

    console.log("file Read:", files);
    console.log("file info:", info);
  }
  // rencently played flatlist
  const TestingList = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        key={index}
        onPress={() => playSongs(item)}
        onLongPress={() => fileGetting(item)}
      >
        <View className="flex-col mr-2">
          <Image
            defaultSource={require("../Icons/icons8-music-240.png")}
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
          ></LinearGradient>
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

          <TouchableOpacity
            className="m-2 p-2 bg-green-400"
            onPress={() => detail(item)}
          >
            <Text className="text-white">details</Text>
          </TouchableOpacity>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View className="flex-1 bg-black">
      {/* button */}
      {/* <TouchableOpacity
        className="bg-green-600 p-2 flex-1 m-5 items-center justify-center"
        onPress={() => compressedMusic()}
      >
        <Text className="text-white font-[20px] text-center">compressed</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-600 p-2 flex-1 m-5 items-center justify-center"
        onPress={fileGetting}
      >
        <Text className="text-white font-[20px] text-center">File getting</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-600 p-2 flex-1 m-5 items-center justify-center"
        onPress={playAudioInHls}
      >
        <Text className="text-white font-[20px] text-center">play audio</Text>
      </TouchableOpacity> */}

      {/* <Video
        source={{
          uri: "file:///data/user/0/com.FeelPLay/files/dash/manifest.mpd",
        }}
        controls={true}
        ref={refAudio}
        resizeMode="contain"
        onError={(error) => console.log("Video Error:", error)}
      /> */}

      <View className="flex-1 m-1 mb-2">
        <View className=" flex-1 flex-row justify-between items-center mb-2">
          <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2">
            Testing
          </Text>
          <TouchableOpacity>
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
          data={songData.slice(0, 20)}
          keyExtractor={(item) => item.id}
          renderItem={TestingList}
        />
      </View>
    </View>
  );
}
