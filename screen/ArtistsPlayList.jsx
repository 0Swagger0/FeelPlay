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
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import TrackPlayer, {
  usePlaybackState,
  State,
  RepeatMode,
} from "react-native-track-player";
import LottieView from "lottie-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { useToast } from "react-native-toast-notifications";
import {
  ALL_ARTIST_SONGS_COLLECTION,
  ALL_SONGS_DATABASE_ID,
  GETTING_ALL_SONGS_COLLECTION,
  database,
} from "../appwriteConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Query } from "appwrite";
import SongsPlayAndRedirectToMusicPlayer from "../functions/SongsPlayAndRedirectToMusicPlayer";
import { useMMKVString } from "react-native-mmkv";

export default function ArtistsPlayList({ navigation, route }) {
  // artist data
  const PlayListData = route.params.PlayListData;
  // user id
  const userId = route.params.userId;
  // title
  const artistTitle = route.params.title;
  // artists image
  const artistImage = route.params.pageImage;

  const [artistsPlayListData, setArtistsPlayListData] = useState([]);
  const [checkPlayListDataLoaded, setcheckPlayListDataLoaded] = useState(true);
  const [SelectPlayListData, setSelectPlayListData] = useState({});

  // title of song
  const [titleOfSong] = useMMKVString("title");

  // playback state
  const playBackState = usePlaybackState();
  const [numberOfSongs, setNumberOfSongs] = useState(0);

  // bottom sheet
  const showBottomSheet = useRef(null);
  const playListBottomSheetRef = useRef(null);
  const toast = useToast();

  // databse
  const firebaseDatabase = getDatabase(App);

  useEffect(() => {
    // load artists play list songs
    async function loadPlayListSongs() {
      const AllSongs = await database.listDocuments(
        ALL_SONGS_DATABASE_ID,
        GETTING_ALL_SONGS_COLLECTION,
        [Query.limit(500)]
      );

      // number of  songs
      const filterArtistSongs = AllSongs.documents.filter((song) =>
        song.artist.toLowerCase().includes(artistTitle.toLowerCase())
      );
      setNumberOfSongs(filterArtistSongs.length);
      // random song data
      const randomSongData = randomSongPlayListArray(filterArtistSongs);
      // adding data to render list

      setArtistsPlayListData(randomSongData);
      setcheckPlayListDataLoaded(false);
    }

    loadPlayListSongs();
  }, []);

  // shuffle array
  const randomSongPlayListArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // go to back screen
  function goBack() {
    navigation.goBack();
  }

  // platllist song menu
  function playListSongMenu(playListData) {
    showBottomSheet.current.open();
    setSelectPlayListData(playListData);
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
      id: SelectPlayListData.id,
      title: SelectPlayListData.title,
      artist: SelectPlayListData.artist,
      artwork: SelectPlayListData.artwork,
      url: SelectPlayListData.url,
      video: SelectPlayListData.video != null ? SelectPlayListData.video : "",
      duration: SelectPlayListData.duration,
    };

    const createCurrentUserPlayListRef = ref(
      firebaseDatabase,
      "users/" + userId + "/" + playlistname + "/" + SelectPlayListData.id
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

  // play all song in Queue
  async function playAllSongsInQueue() {
    // database id and collection id
    const database_id = artistsPlayListData[0].$databaseId;
    const collection_id = artistsPlayListData[0].$collectionId;
    const findArtist = artistsPlayListData[0].findArtist;

    await TrackPlayer.reset().then(async () => {
      await TrackPlayer.add(artistsPlayListData[0]).then(async () => {
        await TrackPlayer.play();

        // adding random songs
        addingRandomSongToPlayer(database_id, collection_id, findArtist);
      });
    });
  }

  // adding random songs
  async function addingRandomSongToPlayer(
    database_id,
    collection_id,
    findArtist
  ) {
    const songData = await database.listDocuments(database_id, collection_id, [
      Query.equal("findArtist", findArtist),
    ]);

    // random data
    const randomSongData = shuffleArray(songData.documents);
    // all player variable
    await TrackPlayer.add(randomSongData).then(async () => {
      await TrackPlayer.play();
      // make player to queue played
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    });
  }

  // shuffle array
  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // adding songs in to queue
  async function AddingSongIntoQueue() {
    await TrackPlayer.add(SelectPlayListData).then(async () => {
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
    await TrackPlayer.add(SelectPlayListData, currentTrackIndex + 1).then(
      () => {
        toast.show("This song will be play after current song", {
          type: "success",
          placement: "center",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
        showBottomSheet.current.close();
      }
    );
  }

  // toogle player state
  async function togglePlayer(playBack) {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack != null) {
      if (playBack.state == State.Paused) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.pause();
      }
      if (playBack.state == State.Ready) {
        await TrackPlayer.play();
      }
    }
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

  // render playlist flatlist
  function renderPlayList({ item, index }) {
    return (
      <View className="flex-col" key={index}>
        <View
          style={{
            flexDirection: "column",
            padding: 7,
            backgroundColor: titleOfSong == item.title ? "#D90026" : "black",
            borderRadius: 10,
            marginTop: 1,
            marginHorizontal: 5,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {item.artwork == "" ? (
                <Image
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
              {item.title == titleOfSong ? (
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
                    SongsPlayAndRedirectToMusicPlayer(item, userId);
                  }}
                >
                  <Foundation name="play" size={20} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => playListSongMenu(item)}>
                <Entypo name="dots-three-vertical" size={15} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-col flex-1 bg-black">
      <StatusBar translucent barStyle="light-content" />
      <View className="flex-col">
        <Image source={{ uri: artistImage }} height={200} />
        <LinearGradient
          style={{
            height: 200,
            width: "100%",
            position: "absolute",
            justifyContent: "space-between",
          }}
          start={{ x: 0.1, y: 1 }}
          end={{ x: 2, y: 0.1 }}
          colors={[
            "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
            "transparent",
          ]}
        >
          <TouchableOpacity
            style={{
              padding: 12,
              borderRadius: 30,
              backgroundColor: "black",
              opacity: 0.5,
              alignSelf: "flex-start",
              marginTop: 30,
              marginLeft: 10,
            }}
            onPress={goBack}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-col mt-5 ml-3">
            <Text className="text-white font-[Raleway-Bold] text-[25px]">
              {artistTitle}
            </Text>
            <Text className="text-white font-[Raleway-Regular] mt-2 text-[12px]">
              songs found {"(" + numberOfSongs + ")"}
            </Text>
          </View>
          <View
            style={{
              width: 50,
            }}
          />
        </LinearGradient>

        <TouchableOpacity
          style={{
            backgroundColor: "#D90026",
            borderRadius: 10,
            width: 100,
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-end",
            marginTop: -17,
            marginRight: 10,
          }}
          onPress={playAllSongsInQueue}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="play" size={25} color="white" />
            <Text className="text-white font-[Raleway-Bold] text-[15px] ml-1">
              Play all
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* play list flatlist */}
      {checkPlayListDataLoaded == false ? (
        <FlatList
          style={{ marginTop: 10 }}
          data={artistsPlayListData}
          initialNumToRender={16}
          renderItem={renderPlayList}
        />
      ) : null}

      {/* bottom sheet */}
      <RBSheet
        ref={showBottomSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        animationType="slide"
        height={250}
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
                uri: SelectPlayListData.artwork,
              }}
              height={50}
              width={50}
            />
            <View className="flex-col ml-2">
              <Text className="text-white text-sm font-[Raleway-SemiBold] mt-1">
                {SelectPlayListData.title}
              </Text>
              <Text className="text-white text-sm font-[Raleway-SemiBold] mt-1">
                {SelectPlayListData.artist}
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
            onPress={saveToPlayList}
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

      {/* save to playlist bottom sheet */}
      <RBSheet
        ref={playListBottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        animationType="slide"
        height={200}
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
