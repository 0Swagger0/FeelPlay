import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TouchableNativeFeedback,
  Modal,
} from "react-native";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import MusicForYou from "../components/MusicHomeComponents/MusicForYou";
import RecentlyPlayed from "../components/MusicHomeComponents/RecentlyPlayed";
import TrackPlayer, {
  AndroidAudioContentType,
  Event,
  RepeatMode,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { App } from "../FirebaseConfig";
import { getDatabase, onValue, ref, set, update } from "firebase/database";
import NewReleaseSongs from "../components/MusicHomeComponents/NewReleaseSongs";
import ChillSongs from "../components/MusicHomeComponents/ChillSongs";
import HindiRomantic from "../components/MusicHomeComponents/HindiRomantic";
import PunjabiSongs from "../components/MusicHomeComponents/PunjabiSongs";
import EnglishSongs from "../components/CommonComponents/EnglishSongs";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import { useToast } from "react-native-toast-notifications";
import RBSheet from "react-native-raw-bottom-sheet";
import { StatusBar } from "expo-status-bar";
import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from "react-native-mmkv";
import LottieView from "lottie-react-native";
import { storage } from "../components/Data/LocalStorage";
import RemoveAllStreamRelatedThings from "../functions/RemoveAllStreamRelatedThings";
import CreateStreamingInUsers from "../functions/CreateStreamingInUsers";
import GamingMix from "../components/MusicHomeComponents/GamingMix";
import Testing from "./Testing";
import axios from "axios";
import getLyricsData from "../functions/getLyricsData";

export default function MusicHome({ navigation }) {
  // databse
  const firebaseDatabase = getDatabase(App);

  // useref
  const bottomSheet = useRef(null);
  const bottomSheetPlayList = useRef(null);

  // check user phone number login or not
  const [userphonenumber] = useMMKVString("userphonenumber");

  // toast message
  const toast = useToast();
  const [currentvideoId, setcurrentvideoId] = useState("");
  // user
  const [userId] = useMMKVString("userId");

  const [userFirstName] = useMMKVString("userfirstname");
  const [userLastName] = useMMKVString("userlastname");

  // get song queue
  const [streamQueue] = useMMKVObject("streamQueue");

  // check if user alery readed about the app
  const [checkIfUserAleryReaded] = useMMKVBoolean("checkIfUserAleryReaded");

  // check if user connected to stream either user streaming that could not be dublicated stream
  const [checkUserConnectedToStreamEitherUserStreaming] = useMMKVBoolean(
    "checkUserConnectedToStreamEitherUserStreaming"
  );

  // navigate use to player screen first time play
  const [
    navigateToPlayerScreenFirstTimePlay,
    setnavigateToPlayerScreenFirstTimePlay,
  ] = useState(true);

  // stream
  const [isStreaming] = useMMKVBoolean("isStreaming");
  const [RoomConnectedTo] = useMMKVString("RoomConnectedTo");
  const [url] = useMMKVString("url");
  // track details
  const [SongDataForBottomSheet, setSongDataForBottomSheet] = useState({});
  // user play list data
  const [PlayListData, setPlayListData] = useState([]);

  // loading
  const [checkPlayListDataLoaded, setcheckPlayListDataLoaded] = useState(true);
  // check if user exists
  useEffect(() => {
    storage.set("isStreaming", false);
    // delete roomId and connected to false in local storage
    storage.delete("RoomConnectedTo");
    storage.set("connectedToStream", false);
    // delet title for new title
    storage.delete("videoId");
    // navigating false when app load first time
    storage.delete("navigateToPlayerScreenFirstTimePlay");
    // chcek user id and user name empty
    if (userphonenumber == undefined) {
      navigation.replace("Welcome");
    } else if (userFirstName == undefined || userLastName == undefined) {
      navigation.replace("userDetails");
    }

    gettingUserInfo();
    gettingUserPlayListData();

    // remove Stream related things
    RemoveAllStreamRelatedThings();
  }, []);

  // getting streaming url
  useEffect(() => {
    const getStreamingUrlRef = ref(firebaseDatabase, "streamingUrl");
    onValue(getStreamingUrlRef, (snapshort) => {
      const url = snapshort.child("url").val();
      if (url) {
        storage.set("url", url);
      }
    });
  }, []);

  // set user play list data
  async function gettingUserPlayListData() {
    // set user play list data
    const userplaylistdata = await UserPlayListData(userId);
    userplaylistdata.map((data) => {
      setPlayListData([]);
      if (data.playListImage == null) {
        setPlayListData((pre) => [...pre, data]);
      }
    });
  }

  // user info
  function gettingUserInfo() {
    const userDetailsRef = ref(firebaseDatabase, `users/${userId}/Streaming`);
    onValue(userDetailsRef, (snapshort) => {
      if (snapshort.exists()) {
        try {
          getStreamDataAndAddToTrackPlayer(snapshort.val());
        } catch (error) {
          console.error("Error in gettingUserInfo in Home screen:", error);
        }
      }
    });
  }

  // get streaming songs
  async function getStreamDataAndAddToTrackPlayer(songsData) {
    if (songsData == null) return;

    const currentSongIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentSongIndex == null) {
      // check if user already streaming or not either user streaming that could not be dublicated stream
      storage.set("checkUserConnectedToStreamEitherUserStreaming", true);
      await TrackPlayer.add(songsData);
      await TrackPlayer.play();
      // set stream queue
      storage?.set("streamQueue", JSON.stringify(songsData));
    } else {
      // check if user already streaming or not either user streaming that could not be dublicated stream
      storage.set("checkUserConnectedToStreamEitherUserStreaming", true);
      // get cuurent song index

      await TrackPlayer.add(songsData, 1 + currentSongIndex);
      await TrackPlayer.skip(1 + currentSongIndex);
      await TrackPlayer.play();

      // set stream queue
      storage?.set("streamQueue", JSON.stringify(songsData));
    }
  }

  // navigate user to music player first time play
  function navigateUserToMusicPlayer() {
    // set to false of navigation
    setTimeout(() => {
      navigation.navigate("MusicPlayer");
      setnavigateToPlayerScreenFirstTimePlay(false);
    }, 2000);
  }

  // currentSongData change event for currentSongData details
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (
      event.type == Event.PlaybackActiveTrackChanged &&
      event.track !== null
    ) {
      // clear local current song data
      const { artwork, videoId, title, artist } = event.track;
      if (videoId && artwork) {
        setcurrentvideoId(videoId);
        // set title in local storage
        storage.set("videoId", videoId);
        // track details
        // quick pick video Id
        storage.set("quick-pick-videoId", videoId);
        storage.set("songIndex", event.index);
        storage.set("currentSongDetails", JSON.stringify(event.track));
        storage.set("artwork", artwork);
      }

      // get lyrics data
      await getLyricsData(title, artist);

      // navigate user to music player first time play
      if (navigateToPlayerScreenFirstTimePlay) {
        navigateUserToMusicPlayer();
      }
      // check if queue has been ended
      await checkIfQueueHasBeenEnded(event.index, videoId);
    }

    if (checkUserConnectedToStreamEitherUserStreaming == false) {
      if (isStreaming) {
        CreateStreamingInUsers(event.track, userId);
      } else {
        CreateStreamingInUsers(event.track, RoomConnectedTo);
      }
    }
  });

  // check if queue has been ended
  async function checkIfQueueHasBeenEnded(index, videoId) {
    // check queue length
    const queue = await TrackPlayer.getQueue();
    if (queue.length - 4 == index) {
      // clear add more data on flatlist
      storage.delete("adddataonflatlist");
      // adding more songs in queue
      addingmoresongsinqueue(videoId);
    }
  }

  // adding more song is queue
  async function addingmoresongsinqueue(videoId) {
    const addmoredatatoqueue = await axios.get(
      `http://15.235.207.2/related?id=${videoId}`
    );
    const { related } = addmoredatatoqueue.data;

    const addingDataToQueue = related.map((track) => ({
      url: `${url}/stream?id=${track.videoId}`,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
      videoId: track.videoId,
    }));

    // get active track index from track player
    const currentSongIndex = await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.add(addingDataToQueue, 4 + currentSongIndex).then(
      async () => TrackPlayer.play()
    );
    // add more queue data to flashlist to view all new data added
    storage.set("adddataonflatlist", JSON.stringify(addingDataToQueue));
  }

  // show bottom sheet
  function showBottomSheet(song) {
    setSongDataForBottomSheet(song);
    bottomSheetPlayList.current.close();
    bottomSheet.current.open();
  }

  // open bottom sheet play list
  function openBottomSheetPlayList() {
    bottomSheet.current.close();
    bottomSheetPlayList.current.open();
  }

  // adding song to playlist
  function addingSongToSelectedPlayList(playlistname) {
    // current song details
    const currentSongData = {
      title: SongDataForBottomSheet.title,
      artist: SongDataForBottomSheet.artist,
      artwork: SongDataForBottomSheet.artwork,
      duration: SongDataForBottomSheet.duration,
      videoId: SongDataForBottomSheet.videoId,
      url: `${url}/stream?id=${SongDataForBottomSheet.videoId}`,
    };

    const createCurrentUserLikePlayListRef = ref(
      firebaseDatabase,
      "users/" +
        userId +
        "/" +
        playlistname +
        "/" +
        SongDataForBottomSheet.videoId
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

      bottomSheet.current.close();
      bottomSheetPlayList.current.close();
    });
  }

  // adding songs in to queue
  async function AddingSongIntoQueue() {
    await TrackPlayer.add({
      title: SongDataForBottomSheet.title,
      artist: SongDataForBottomSheet.artist,
      artwork: SongDataForBottomSheet.artwork,
      duration: SongDataForBottomSheet.duration,
      url: `${url}/stream?id=${SongDataForBottomSheet.videoId}`,
      videoId: SongDataForBottomSheet.videoId,
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
      bottomSheet.current.close();
    });
  }

  // song play after current song
  async function SongPlayNextAfterCurrentSong() {
    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    await TrackPlayer.add(
      {
        title: SongDataForBottomSheet.title,
        artist: SongDataForBottomSheet.artist,
        artwork: SongDataForBottomSheet.artwork,
        duration: SongDataForBottomSheet.duration,
        url: `${url}/stream?id=${SongDataForBottomSheet.videoId}`,
        videoId: SongDataForBottomSheet.videoId,
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
      bottomSheet.current.close();
    });
  }

  // user readed about app
  async function userReadedAboutApp() {
    storage?.set("checkIfUserAleryReaded", false);
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar translucent style="light" />

      {/* loading page */}
      {checkPlayListDataLoaded ? (
        <View className="flex-row h-[100%] self-center items-center">
          <LottieView
            source={require("../LottiAnimation/loading.json")}
            style={{ height: 100, width: 100 }}
            autoPlay
            loop
          />
        </View>
      ) : null}
      {/* loading page */}
      <View style={{ flexGrow: 1 }}>
        <View style={{ flex: 8 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* main layout of music home screen */}
            <View style={{ flexDirection: "column", padding: 3 }}>
              {/* user name and tagline */}
              <View className="flex-col p-2 mt-7">
                {userFirstName != null ? (
                  <Text className="text-white font-[Raleway-SemiBold] text-[14px]">
                    Hii {userFirstName + " " + userLastName}
                  </Text>
                ) : null}
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-[Raleway-Bold] text-[20px]">
                    Find your favorite music!
                  </Text>

                  {/* streaming icon lottie animation */}
                  <TouchableNativeFeedback
                    onPress={() => navigation.navigate("JoinStreaming")}
                  >
                    <LottieView
                      style={{ height: 45, width: 40 }}
                      autoPlay
                      loop
                      source={require("../LottiAnimation/Streaming.json")}
                    />
                  </TouchableNativeFeedback>

                  <TouchableOpacity
                    style={{ padding: 3, marginRight: 10 }}
                    onPress={() => navigation.navigate("Settings")}
                  >
                    <MaterialIcons name="settings" color="white" size={23} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* searchbar */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("SearchAllSongs", {
                    userId: userId,
                  })
                }
              >
                <View className="flex-row items-center p-3 mx-1 rounded-lg border-x-[0.5px] border-[0.5px] border-white">
                  <Feather
                    name="search"
                    size={20}
                    color="white"
                    style={{ marginHorizontal: 2 }}
                  />
                  <Text className="text-white font-[Raleway-SemiBold] text-[17px] ml-3">
                    Search for music,artists
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Music for you layout */}
              <MusicForYou
                userFirstName={userFirstName}
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
                setcheckPlayListDataLoaded={setcheckPlayListDataLoaded}
              />

              {/* recently played music layout */}
              <RecentlyPlayed
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* new release song */}
              <NewReleaseSongs
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* Gamming mix */}
              <GamingMix
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* Hindi romantic mix */}
              <HindiRomantic
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* Punjabi songs */}
              <PunjabiSongs
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* English songs */}
              <EnglishSongs
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* Chill songs */}
              <ChillSongs
                userId={userId}
                currentvideoId={currentvideoId}
                showBottomSheet={showBottomSheet}
              />

              {/* 
              Testing Component */}
              {/* <Testing /> */}
            </View>
          </ScrollView>
        </View>

        {/* model for user to read about app */}
        <Modal
          visible={checkIfUserAleryReaded}
          style={{ alignSelf: "center" }}
          animationType={"fade"}
          aria-disabled={true}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(52, 52, 52, 0.8)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View className="flex-col border-[0.7px] rounded-lg border-[#D90026] p-3 m-2 bg-black">
              <Text className="text-white text-sm font-[Raleway-SemiBold]">
                Feelplay application provides audio playing directly without
                utilizing your phone's storage, in contrast to other music
                services like spotify that typically save audio files,
                potentially increasing storage consumption. although Feelplay
                may encounter a minor delay of one to two seconds during audio
                playback, it guarantees that the app's size is not impacted by
                extra storage demands.
              </Text>

              <Text className="text-white text-md font-[Raleway-Bold] mt-5">
                thank you team FeelPlay.{" "}
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: "#D90026",
                  padding: 7,
                  borderRadius: 5,
                  alignSelf: "flex-end",
                }}
                onPress={() => userReadedAboutApp()}
              >
                <Text className="text-white font-[Raleway-SemiBold] text-xs">
                  I understand
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomSheet}
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
                uri: SongDataForBottomSheet.artwork,
              }}
              height={50}
              width={50}
            />
            <View className="flex-col ml-2">
              <Text
                numberOfLines={1}
                className="text-white text-[16px] font-[Raleway-Bold] mt-1 max-w-[250px]"
              >
                {SongDataForBottomSheet.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 text-sm font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
                {SongDataForBottomSheet.artist}
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
            onPress={openBottomSheetPlayList}
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
        ref={bottomSheetPlayList}
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
