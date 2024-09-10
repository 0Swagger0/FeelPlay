import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { App } from "../FirebaseConfig";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import TrackPlayer, {
  usePlaybackState,
  State,
} from "react-native-track-player";
import LottieView from "lottie-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import BottomPlayerLayout from "../components/BottomPlayerLayout/BottomPlayerLayout";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import { useMMKVString } from "react-native-mmkv";

export default function UserPlayList({ navigation, route }) {
  // variables
  const playListName = "Like PlayList";
  const userId = route.params.userId;

  const [PlayListData, setPlayListData] = useState([]);
  const [likePlayListData, setLikeplayListData] = useState([]);
  const [checkPlayListDataLoaded, setcheckPlayListDataLoaded] = useState(true);
  const [SelectLikePlayListData, setSelectLikePlayListData] = useState({});
  const [showEmptyPlayList, setshowEmptyPlayList] = useState(false);

  // video id
  const [currentvideoId] = useMMKVString("videoId");
  // streaming url
  const [url] = useMMKVString("url");

  // playback state
  const playBackState = usePlaybackState();
  const [showPlayerBottomLayout, setShowPlayerBottomLayout] = useState(false);

  // bottom sheet
  const showBottomSheet = useRef(null);
  const playListBottomSheetRef = useRef(null);
  const toast = useToast();

  // databse
  const firebaseDatabase = getDatabase(App);

  useEffect(() => {
    async function setup() {
      loadLikePlayListSongs();

      const playListData = await UserPlayListData(userId);
      playListData.map((data) => {
        if (data.playListImage == null) {
          setPlayListData((pre) => [...pre, data]);
        }
      });
    }
    setup();
  }, []);

  // load play list songs
  function loadLikePlayListSongs() {
    const getCurrentUserPlayListRef = ref(
      firebaseDatabase,
      "users/" + userId + "/" + playListName
    );
    onValue(getCurrentUserPlayListRef, (snapshort) => {
      setLikeplayListData([]);
      // check playlist
      const checkPlayList = snapshort.val();
      if (checkPlayList == null) {
        setcheckPlayListDataLoaded(false);
        setshowEmptyPlayList(true);
      }
      snapshort.forEach((songList) => {
        const playList = songList.val();
        if (playList != null) {
          setLikeplayListData((old) => [...old, playList]);
          setcheckPlayListDataLoaded(false);
        }
      });
    });
  }

  // skip track
  async function skeekToSelectedIndex(index) {
    const currentSongIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentSongIndex >= 0) {
      TrackPlayer.add(likePlayListData, currentSongIndex).then(() => {
        TrackPlayer.skip(currentSongIndex).then(() => TrackPlayer.play());
      });
    } else {
      const title = likePlayListData[index].title;
      const filterData = likePlayListData.filter(
        (data) => data.title !== title
      );
      TrackPlayer.load(likePlayListData[index]);
      TrackPlayer.add(filterData).then(() => TrackPlayer.play());
    }
    // show bottom layout
    setShowPlayerBottomLayout(true);
  }

  // go to back screen
  function goBack() {
    navigation.goBack();
  }

  // platllist song menu
  function playLikeListSongMenu(likePlayListData) {
    showBottomSheet.current.open();
    setSelectLikePlayListData(likePlayListData);
  }

  // remove selected play list data from playelist
  function removeSelectedListDataFromLikePlayList() {
    const removeSelectedLikePlayListRef = ref(
      firebaseDatabase,
      "users/" +
        userId +
        "/" +
        playListName +
        "/" +
        SelectLikePlayListData.videoId
    );
    remove(removeSelectedLikePlayListRef).then(() => {
      toast.show("song remove from like playlist", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      showBottomSheet.current.close();
    });
  }

  // save to playlist
  function saveToPlayList() {
    showBottomSheet.current.close();
    playListBottomSheetRef.current.open();
  }

  // adding song to playlist
  function addingSongToSelectedPlayList(playlistname) {
    // current song details
    const currentSongData = {
      title: SelectLikePlayListData.title,
      artist: SelectLikePlayListData.artist,
      artwork: SelectLikePlayListData.artwork,
      duration: SelectLikePlayListData.duration,
      videoId: SelectLikePlayListData.videoId,
      url: `http://15.235.207.2/stream?id=${SelectLikePlayListData.videoId}`,
    };

    const createCurrentUserPlayListRef = ref(
      firebaseDatabase,
      "users/" +
        userId +
        "/" +
        playlistname +
        "/" +
        SelectLikePlayListData.videoId
    );
    update(createCurrentUserPlayListRef, currentSongData).then(() => {
      toast.show("song added to " + playlistname, {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      playListBottomSheetRef.current.close();
    });
  }

  // toogle player state
  async function togglePlayer(playBack) {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack != null) {
      if (playBack.state == State.Paused) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
        // show bottom layout
        setShowPlayerBottomLayout(true);
      }
      if (playBack.state == State.Ready) {
        await TrackPlayer.play();
        // show bottom layout
        setShowPlayerBottomLayout(true);
      }
    }
  }

  // adding songs in to queue
  async function AddingSongIntoQueue() {
    await TrackPlayer.add({
      title: SelectLikePlayListData.title,
      artist: SelectLikePlayListData.artist,
      artwork: SelectLikePlayListData.artwork,
      duration: SelectLikePlayListData.duration,
      url: `http://15.235.207.2/stream?id=${SelectLikePlayListData.videoId}`,
      videoId: SelectLikePlayListData.videoId,
    }).then(async () => {
      toast.show("Songs added to queue", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      await TrackPlayer.play();
      showBottomSheet.current.close();
    });
  }

  // song play after current song
  async function SongPlayNextAfterCurrentSong() {
    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.add(
      {
        title: SelectLikePlayListData.title,
        artist: SelectLikePlayListData.artist,
        artwork: SelectLikePlayListData.artwork,
        duration: SelectLikePlayListData.duration,
        url: `http://15.235.207.2/stream?id=${SelectLikePlayListData.videoId}`,
        videoId: SelectLikePlayListData.videoId,
      },
      currentTrackIndex + 1
    ).then(() => {
      toast.show("This song will be play after current song", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      showBottomSheet.current.close();
    });
  }

  // render playlist flatlist
  function renderLikePlayList({ item, index }) {
    return (
      <View className="flex-col" key={index}>
        <View
          style={{
            flexDirection: "column",
            padding: 7,
            backgroundColor:
              currentvideoId == item.videoId ? "#D90026" : "black",
            borderRadius: 10,
            marginTop: 1,
            marginHorizontal: 5,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {item.artwork == "" ? (
                <Image
                  defaultSource={require("../Icons/icons8-music-240.png")}
                  source={require("../Icons/icons8-music-240.png")}
                  height={40}
                  width={40}
                  style={{ borderRadius: 5 }}
                />
              ) : (
                <Image
                  defaultSource={require("../Icons/icons8-music-240.png")}
                  source={{ uri: item.artwork }}
                  height={40}
                  width={40}
                  style={{
                    borderRadius: 5,
                    borderWidth: 0.5,
                    borderColor: "white",
                  }}
                />
              )}
              <View className="ml-3 w-52">
                <Text className="text-white font-[Raleway-SemiBold]">
                  {item.title}
                </Text>
                <Text className="text-white font-[Raleway-Regular] text-xs">
                  {item.artist}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mr-2">
              {item.videoId == currentvideoId ? (
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      playBackState.state == State.Ready ||
                      playBackState.state == State.Paused
                        ? "#D90026"
                        : null,
                    alignSelf: "center",
                    justifyContent: "center",
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: 30,
                    marginRight: 15,
                    borderWidth: 1,
                    borderColor: "white",
                  }}
                  onPress={() => {
                    togglePlayer(playBackState);
                    setShowPlayerBottomLayout(true);
                  }}
                >
                  <Foundation
                    name={
                      playBackState.state == State.Ready ||
                      playBackState.state == State.Paused
                        ? "play"
                        : "pause"
                    }
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#D90026",
                    alignSelf: "center",
                    justifyContent: "center",
                    paddingVertical: 5,
                    paddingHorizontal: 9,
                    borderRadius: 30,
                    marginRight: 15,
                  }}
                  onPress={() => {
                    skeekToSelectedIndex(index);
                  }}
                >
                  <Foundation name="play" size={20} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => playLikeListSongMenu(item)}>
                <Entypo name="dots-three-vertical" size={15} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // loding component
  if (checkPlayListDataLoaded) {
    return (
      <View className="flex-1 bg-black flex-col justify-center">
        <View className="flex-row self-center">
          <LottieView
            source={require("../LottiAnimation/loading.json")}
            style={{ height: 100, width: 100 }}
            autoPlay
            loop
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-col flex-1 bg-black">
      <StatusBar translucent barStyle="light-content" />
      <View className="flex-col h-20 justify-between mt-7 ml-3">
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 30,
            backgroundColor: "gray",
            opacity: 0.5,
            alignSelf: "flex-start",
          }}
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center mt-3">
          <Text className="text-white font-[Raleway-Bold] text-[25px]">
            {playListName}
          </Text>
          <AntDesign
            style={{ marginLeft: 7 }}
            name="heart"
            size={24}
            color="white"
          />
        </View>
        <View
          style={{
            borderBottomColor: "white",
            width: 50,
            borderBottomWidth: 0.2,
            marginTop: 10,
          }}
        />
      </View>

      {/* show empty play list layout */}
      {showEmptyPlayList == true ? (
        <View className="flex-col justify-center self-center mt-10">
          <Text className="text-white text-base font-[Raleway-SemiBold]">
            Empty playlist
          </Text>
        </View>
      ) : null}

      {/* play list flatlist */}
      {checkPlayListDataLoaded == false ? (
        <FlatList
          style={{ marginTop: 10 }}
          data={likePlayListData}
          initialNumToRender={16}
          renderItem={renderLikePlayList}
        />
      ) : null}

      {/* bottom sheet */}
      <RBSheet
        ref={showBottomSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        animationType="slide"
        height={270}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "white",
          },
          container: {
            backgroundColor: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <View className="flex-col">
          <View className="flex-row items-center">
            <Image
              style={{
                borderRadius: 5,
                borderColor: "white",
                borderWidth: 0.5,
                marginLeft: 7,
                marginBottom: 5,
                marginTop: 7,
                marginRight: 4,
              }}
              source={{
                uri: SelectLikePlayListData.artwork,
              }}
              height={50}
              width={50}
            />
            <View className="flex-col ml-2">
              <Text
                numberOfLines={1}
                className="text-white text-[16px] font-[Raleway-Bold] mt-1 max-w-[250px]"
              >
                {SelectLikePlayListData.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 text-sm font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
                {SelectLikePlayListData.artist}
              </Text>
            </View>
          </View>

          {/* border */}
          <View
            style={{
              borderBottomWidth: 0.3,
              borderBottomColor: "white",
              width: 100,
              margin: 5,
            }}
          />
          {/* border */}
          <TouchableOpacity
            onPress={saveToPlayList}
            className="flex-row items-center p-2"
          >
            <MaterialIcons name="playlist-add" size={24} color="white" />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              Save to playlist
            </Text>
          </TouchableOpacity>

          {/* delete song from user playlist */}

          <TouchableOpacity
            onPress={removeSelectedListDataFromLikePlayList}
            className="flex-row items-center p-2"
          >
            <MaterialIcons name="highlight-remove" size={24} color="white" />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              Delete from playlist
            </Text>
          </TouchableOpacity>
          {/* adding song in to queue */}
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={AddingSongIntoQueue}
          >
            <Ionicons name="musical-note" size={24} color="white" />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              Add in queue
            </Text>
          </TouchableOpacity>

          {/* play next after current song */}
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={SongPlayNextAfterCurrentSong}
          >
            <MaterialIcons name="playlist-play" size={24} color="white" />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              Play next
            </Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      {/* save to playlist bottom sheet */}
      <RBSheet
        ref={playListBottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        animationType="slide"
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "white",
          },
          container: {
            backgroundColor: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <View className="flex-col mb-8">
          <Text className="text-white text-base font-[Raleway-SemiBold] m-2">
            Select playlist to add this song
          </Text>
          <ScrollView>
            <View>
              {PlayListData.map((data, index) => {
                return (
                  <View className="flex-col" key={index}>
                    <TouchableOpacity
                      className="flex-row items-center p-2"
                      onPress={() =>
                        addingSongToSelectedPlayList(data.playListName)
                      }
                    >
                      <MaterialCommunityIcons
                        name="playlist-music"
                        size={24}
                        color="white"
                      />
                      <Text className="text-white text-xs ml-2 font-[Raleway-SemiBold]">
                        {data.playListName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </RBSheet>

      {showPlayerBottomLayout && <BottomPlayerLayout />}
    </View>
  );
}
