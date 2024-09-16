import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableNativeFeedback,
  Modal,
  VirtualizedList,
  ScrollView,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Entypo,
  EvilIcons,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import LottieView from "lottie-react-native";
import TrackPlayer from "react-native-track-player";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import RBSheet from "react-native-raw-bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import SongsPlayAndRedirectToMusicPlayer from "../functions/SongsPlayAndRedirectToMusicPlayer";
import { useMMKVString } from "react-native-mmkv";
import axios from "axios";
import { storage } from "../components/Data/LocalStorage";

export default function SearchAllSongs({ navigation, route }) {
  // firebase databse
  const firebaseDatabase = getDatabase(App);

  // user id and current play list id
  const userId = route.params.userId;
  // track title
  const [currentvideoId] = useMMKVString("videoId");
  // streaming url
  const [url] = useMMKVString("url");

  // getting current playing songs details in bottom sheet
  const [getCurrentSongDetails, setgetCurrentSongDetails] = useState({});
  const [PlayListData, setPlayListData] = useState([]);
  // all categories name and image
  const [ALlSearchSongData, setALlSearchSongData] = useState([]);
  // variable
  const [SearchAllSongsData, setSearchAllSongsData] = useState([]);
  const [SearchInputText, setSearchInputText] = useState("");
  const [loadingSongList, setLoadingSongList] = useState(true);
  const [showAllSongList, setShowAllSongList] = useState(false);
  // toast message
  const toast = useToast();
  // use ref
  const inputFocusRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const showPlayListBottomSheetRef = useRef(null);

  // getting all categories  name and image
  useEffect(() => {
    // focus on input
    if (inputFocusRef.current != null) {
      inputFocusRef.current.focus();
    }
  }, []);

  // use effect
  useEffect(() => {
    async function dataSong() {
      setSearchAllSongsData([]);
      if (SearchInputText != "") {
        const searchSuggetionsData = await axios.get(
          `http://15.235.207.2/suggetions?search=${SearchInputText}`
        );
        const data = searchSuggetionsData.data;
        setSearchAllSongsData(data);
      } else {
        // set false to song list to not show
        setShowAllSongList(false);

        // set false not to loading
        setLoadingSongList(true);
      }
    }
    dataSong();
  }, [SearchInputText]);

  // song details bottom sheet
  function getSongsDetails(songsDetails) {
    bottomSheetRef.current.open();
    setgetCurrentSongDetails(songsDetails);
  }

  // show play list bottom sheet
  function showPlayListBottomSheet() {
    loadUserPlayList();
  }

  // load current user play list
  async function loadUserPlayList() {
    const playListData = await UserPlayListData(userId);
    playListData.map((data) => {
      setPlayListData;
      if (data.playListImage == null) {
        setPlayListData((pre) => [...pre, data]);
      }
    });

    showPlayListBottomSheetRef.current.open();
    bottomSheetRef.current.close();
  }

  // adding song to playlist
  function addingSongToSelectedPlayList(playlistname) {
    // current song details
    const currentSongData = {
      title: getCurrentSongDetails.title,
      artist: getCurrentSongDetails.artist,
      artwork: getCurrentSongDetails.artwork,
      duration: getCurrentSongDetails.duration,
      videoId: getCurrentSongDetails.videoId,
      url: `${url}/stream?id=${getCurrentSongDetails.videoId}`,
    };

    const createCurrentUserLikePlayListRef = ref(
      firebaseDatabase,
      "users/" +
        userId +
        "/" +
        playlistname +
        "/" +
        getCurrentSongDetails.videoId
    );
    update(createCurrentUserLikePlayListRef, currentSongData).then(() => {
      toast.show("song added to " + playlistname, {
        type: "success",
        placement: "top",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    });
  }

  // adding songs in to queue
  async function AddingSongIntoQueue() {
    await TrackPlayer.add({
      title: getCurrentSongDetails.title,
      artist: getCurrentSongDetails.artist,
      artwork: getCurrentSongDetails.artwork,
      duration: getCurrentSongDetails.duration,
      videoId: getCurrentSongDetails.videoId,
      url: `${url}/stream?id=${getCurrentSongDetails.videoId}`,
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
      bottomSheetRef.current.close();
    });
  }

  // song play after current song
  async function SongPlayNextAfterCurrentSong() {
    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.add(
      {
        title: getCurrentSongDetails.title,
        artist: getCurrentSongDetails.artist,
        artwork: getCurrentSongDetails.artwork,
        duration: getCurrentSongDetails.duration,
        videoId: getCurrentSongDetails.videoId,
        url: `${url}/stream?id=${getCurrentSongDetails.videoId}`,
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
      bottomSheetRef.current.close();
    });
  }

  // handle Search All Songs From Suggetion
  function handleSearchAllSongsFromSuggetion(searchSong) {
    if (searchSong !== "") {
      // empy list for pure data
      setALlSearchSongData([]);

      // set value to text input
      setSearchInputText(searchSong);
      // set show list
      setShowAllSongList(true);
      searchAllSongsFromSuggetions(searchSong);
    }
  }

  // get all song from search suggetions
  async function searchAllSongsFromSuggetions(searchSong) {
    const searchSongData = await axios.get(
      `http://15.235.207.2/search?search=${searchSong}`
    );
    const allSuggetionSongs = searchSongData.data;
    // set all search songs to list
    allSuggetionSongs.map((item) => {
      setALlSearchSongData((pre) => [
        ...pre,
        {
          artist: item.artists.map((artist) => artist.name).join(", "),
          title: item.title,
          artwork: item.thumbnails.length > 0 ? item.thumbnails[0].url : null,
          albumId: item.album ? item.album.id : null,
          albumName: item.album ? item.album.name : null,
          videoId: item.videoId,
          duration: item.duration_seconds,
          artistsId: item.artists.map((artist) => artist.id).join(", "),
        },
      ]);
    });
    setLoadingSongList(false);
  }

  // render all songs search flatlist
  function renderAllSearchSuggetionsSongsList({ item, index }) {
    if (SearchInputText == "") {
      return <View key={index}></View>;
    } else {
      return (
        <View className="flex-1 justify-center p-1 mt-3 mb-3 mx-2" key={index}>
          <TouchableNativeFeedback
            onPress={() => handleSearchAllSongsFromSuggetion(item)}
          >
            <View className="flex-1 items-center flex-row justify-between">
              <View className="flex-row">
                {/* search icon */}
                <EvilIcons name="search" color="gray" size={25} />
                {/* search title */}
                <Text className="font-[Raleway-SemiBold] text-gray-400 text-[16px] ml-5">
                  {item}
                </Text>
              </View>
              <Feather name="arrow-up-left" color="gray" size={25} />
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }
  }

  // render all search song list
  // rencently played flatlist
  const renderAllSearchSongsList = ({ item, index }) => {
    return (
      <TouchableNativeFeedback
        key={index}
        onPress={() => {
          if (item.videoId == currentvideoId) {
            return;
          } else {
            // set video id for quick picks to future play related
            storage.set("quick-videoId", item.videoId);
            SongsPlayAndRedirectToMusicPlayer(item, userId);

            // check if user streaming or not or either connected to room
            storage.set("checkUserConnectedToStreamEitherUserStreaming", true);
          }
        }}
      >
        <View className="flex-row items-center justify-between p-1  mx-1">
          <View className="flex-row items-center">
            {item.videoId == currentvideoId ? (
              <LottieView
                style={{ height: 50, width: 50 }}
                loop
                autoPlay
                source={require("../LottiAnimation/music.json")}
              />
            ) : (
              <Image
                style={{ borderRadius: 3 }}
                source={{ uri: item.artwork }}
                height={50}
                width={50}
              />
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
              onPress={() => getSongsDetails(item)}
            >
              <Entypo name="dots-three-vertical" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View className="flex-1 flex-col bg-black p-1" behavior="height">
      <StatusBar translucent barStyle="light-content" />
      {/* back arrow */}

      <View className="flex-row items-center mt-7">
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 30,
            backgroundColor: "gray",
            opacity: 0.5,
            alignSelf: "flex-start",
          }}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-gray-400 font-[Raleway-Bold] text-[17px] ml-3">
          Search songs
        </Text>
      </View>

      <View className="flex-col">
        {/* search bar */}
        <View className="flex-row items-center rounded-[20px] bg-gray-800  p-2 mt-3 mb-2">
          <EvilIcons name="search" color="gray" size={25} />

          <TextInput
            ref={inputFocusRef}
            placeholder="Search for songs, artists"
            placeholderTextColor="gray"
            value={SearchInputText}
            showSoftInputOnFocus
            returnKeyType="search"
            onSubmitEditing={(event) =>
              handleSearchAllSongsFromSuggetion(event.nativeEvent.text)
            }
            style={{
              color: "white",
              marginStart: 10,
              fontSize: 15,
              fontFamily: "Raleway-Regular",
              width: "70%",
            }}
            onChangeText={(text) => {
              if (!text.startsWith(" ")) {
                setSearchInputText(text);
              }
            }}
          />
        </View>
        {/* // search suggetion list */}

        {showAllSongList == false ? (
          <VirtualizedList
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            onEndReachedThreshold={0.1}
            style={{ marginBottom: 200 }}
            windowSize={5}
            data={SearchAllSongsData}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item) => item.id}
            getItemCount={() => SearchAllSongsData.length}
            getItem={(data, index) => SearchAllSongsData[index]}
            renderItem={renderAllSearchSuggetionsSongsList}
            ListHeaderComponent={() => {
              return (
                <View className="mt-1 ml-2">
                  {SearchInputText != "" ? (
                    <Text className="text-gray-500 font-[Raleway-SemiBold] text-base">
                      Search results
                    </Text>
                  ) : null}
                </View>
              );
            }}
          />
        ) : (
          <View>
            {loadingSongList ? (
              <View className="flex-row self-center">
                <LottieView
                  source={require("../LottiAnimation/loading.json")}
                  style={{ height: 100, width: 100 }}
                  autoPlay
                  loop
                />
              </View>
            ) : (
              <FlatList
                windowSize={5}
                initialNumToRender={16}
                contentContainerStyle={{ paddingBottom: 250 }}
                data={ALlSearchSongData}
                keyboardShouldPersistTaps="always"
                renderItem={renderAllSearchSongsList}
                ListHeaderComponent={() => {
                  return (
                    <View className="mt-1 ml-2">
                      {SearchInputText != "" ? (
                        <Text className="text-gray-500 font-[Raleway-SemiBold] text-base mb-2">
                          All search related songs
                        </Text>
                      ) : null}
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomSheetRef}
        height={250}
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
                uri: getCurrentSongDetails.artwork,
              }}
              height={50}
              width={50}
            />
            <View className="flex-col ml-2">
              <Text
                numberOfLines={1}
                className="text-white text-[16px] font-[Raleway-Bold] mt-1 max-w-[250px]"
              >
                {getCurrentSongDetails.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 text-sm font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
                {getCurrentSongDetails.artist}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderBottomWidth: 0.2,
              borderBottomColor: "white",
              margin: 5,
            }}
          />
          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={showPlayListBottomSheet}
          >
            <MaterialIcons name="playlist-add" size={24} color="white" />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              Save to playlist
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

      {/* play list bottom sheet */}
      <RBSheet
        ref={showPlayListBottomSheetRef}
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
    </View>
  );
}
