import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { useToast } from "react-native-toast-notifications";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  ref,
  update,
  getDatabase,
  remove,
  onValue,
  query,
  limitToFirst,
} from "firebase/database";
import { App } from "../FirebaseConfig";
import LottieView from "lottie-react-native";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVObject,
  useMMKVString,
} from "react-native-mmkv";
import { storage } from "../components/Data/LocalStorage";
import { FlashList } from "@shopify/flash-list";
import CustomLinearGradient from "../components/CustomLinearGradient";

function MusicPlayer({ navigation, route }) {
  // variable
  const { height, width } = Dimensions.get("window");

  // toast message and useRef
  const toast = useToast();
  const bottomSheetRef = useRef(null);
  const FlashListRef = useRef(null);
  const showPlayListBottomSheetRef = useRef(null);

  // firebase database
  const fireDatabase = getDatabase(App);
  const playBackState = usePlaybackState();
  const [connectedUserName, setConnectedUserName] = useState("");
  const [visibleModel, setvisibleModel] = useState(false);

  // get song details
  const [PlayListData, setPlayListData] = useState([]);
  const [QueueData, setQueueData] = useState([]);

  // user variable
  const [userId] = useMMKVString("userId");
  const [isStreaming] = useMMKVBoolean("isStreaming");
  const [connectedToStream] = useMMKVBoolean("connectedToStream");
  const [adddataonflatlist] = useMMKVObject("adddataonflatlist");

  // streaming url
  const [url] = useMMKVString("url");

  // user queue
  const [userQueue] = useMMKVObject("user-queue");
  const [songIndex] = useMMKVNumber("songIndex");
  // stream queue data
  const [streamQueueData] = useMMKVObject("streamQueue");

  // track details
  const [currentSongDetails] = useMMKVObject("currentSongDetails");
  const OnTouchMovement = useRef(false);

  // // track change event for track details

  useEffect(() => {
    getQueue();

    getCurrentUserPlayList();

    return () => {
      OnTouchMovement.current = false;
    };
  }, [route]);

  // get stream data
  useEffect(() => {
    getStreamingDetails();
  }, []);

  // change stream data
  useEffect(() => {
    if (streamQueueData !== null && streamQueueData !== undefined) {
      getStreamQueue();
      setQueueData([]);
    }
  }, [streamQueueData]);

  // add more data to flatlist
  useEffect(() => {
    if (adddataonflatlist !== null && adddataonflatlist !== undefined) {
      async function addMoreDataToQueue() {
        const addingmoresongsinqueue = adddataonflatlist.map((data) => data);

        setQueueData((pre) => [...pre, ...addingmoresongsinqueue]);
      }
      addMoreDataToQueue();
    }
  }, [adddataonflatlist]);

  // event listener
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(Event.RemoteNext, () => {
      OnTouchMovement.current = false;
      storage.set("checkUserConnectedToStreamEitherUserStreaming", false);
    });
    const subscription2 = TrackPlayer.addEventListener(
      Event.RemotePrevious,
      () => {
        OnTouchMovement.current = false;
        storage.set("checkUserConnectedToStreamEitherUserStreaming", false);
      }
    );

    return () => {
      subscription.remove();
      subscription2.remove();
    };
  }, []);

  // get queue data
  async function getQueue() {
    const queue = await TrackPlayer.getQueue();
    if (queue !== null && queue !== undefined) {
      setQueueData(queue.length ? queue : userQueue);
      const currentsongindex = await TrackPlayer.getActiveTrackIndex();
      if (currentsongindex >= 0) {
        setTimeout(
          () =>
            FlashListRef.current?.scrollToIndex({
              animated: true,
              index: currentsongindex,
            }),
          100
        );
      } else {
        playsongfromuserqueue();
      }
    }
  }

  // play song from user queue
  async function playsongfromuserqueue() {
    if (userQueue !== null && userQueue !== undefined) {
      await TrackPlayer.add(userQueue);
      await TrackPlayer.skip(songIndex);
      await TrackPlayer.play();
    }
  }
  // get stream queue
  function getStreamQueue() {
    if (connectedToStream == true || isStreaming == true) {
      setQueueData((pre) => [...pre, streamQueueData]);
    }
  }

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (
      event.type == Event.PlaybackActiveTrackChanged &&
      event.track !== null
    ) {
      if (connectedToStream == true || isStreaming == true) {
        getQueue();
      }

      if (OnTouchMovement.current == false)
        changeScrollPositionToIndex(event.index);
    }
  });

  // change position to index
  function changeScrollPositionToIndex(index) {
    if (FlashListRef.current !== null && FlashListRef.current !== undefined)
      FlashListRef.current.scrollToIndex({ animated: true, index: index });
  }

  // streaming details
  function getStreamingDetails() {
    const getStreamRef = ref(fireDatabase, "Streaming/" + userId);
    onValue(
      getStreamRef,
      (snapshort) => {
        if (snapshort && snapshort.exists()) {
          const data = snapshort.size;
          if (data >= 2) {
            setvisibleModel(false);
            storage.set("isStreaming", true);
            // show toast message and show which user was join
            showToastMessageWithUserName();
          }
        }
      },
      (error) => {
        console.error("Error in getStreamingDetails:", error);
      }
    );
  }

  // show tost message and user name
  function showToastMessageWithUserName() {
    const getLastUserNameRef = query(
      ref(fireDatabase, "Streaming/" + userId),
      limitToFirst(1)
    );
    onValue(
      getLastUserNameRef,
      (snapshort) => {
        if (!snapshort) {
          console.error(
            "Error in showToastMessageWithUserName: snapshort is null"
          );
          return;
        }
        snapshort.forEach((data) => {
          const name = data?.child("userName")?.val();
          if (name) {
            setConnectedUserName(name);
          }
        });
      },
      (error) => {
        console.error("Error in showToastMessageWithUserName:", error);
      }
    );
  }

  // show message
  useEffect(() => {
    if (connectedUserName != "") {
      toast.show(connectedUserName + " has join the stream", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    }
  }, [connectedUserName]);

  // toogle player state
  async function togglePlayer(playeBack) {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack != null) {
      if (playeBack.state == State.Paused) {
        await TrackPlayer.play();
        // if (videoPlay != null && videoRef.current != undefined) {
        //   videoRef.current.playAsync();
        // }
      } else {
        await TrackPlayer.pause();
        // if (videoPlay != null && videoRef.current != undefined) {
        //   videoRef.current.pauseAsync();
        // }
      }
      if (playeBack.state == State.Ready) {
        await TrackPlayer.play();
      }
    }
  }

  // go to back screen
  function goBack() {
    navigation.goBack();
  }

  // song details bottom sheet
  function getSongsDetails() {
    bottomSheetRef.current.open();
  }

  // show play list bottom sheet
  function showPlayListBottomSheet() {
    showPlayListBottomSheetRef.current.open();
    bottomSheetRef.current.close();
  }

  // load current user playlist
  async function getCurrentUserPlayList() {
    const userplaylistdata = await UserPlayListData(userId);
    setPlayListData([]);
    if (userplaylistdata !== null && userplaylistdata !== undefined) {
      userplaylistdata.map((data) => {
        if (data.playListImage === null) {
          setPlayListData((pre) => [...pre, data]);
        }
      });
    }
  }

  // adding song to playlist
  function addingSongToSelectedPlayList(playlistname) {
    // current song details
    const currentSongData = {
      title: currentSongDetails.title,
      artist: currentSongDetails.artist,
      artwork: currentSongDetails.artwork,
      duration: currentSongDetails.duration,
      videoId: currentSongDetails.videoId,
      url: `${url}/stream?id=${currentSongDetails.videoId}`,
    };

    const createCurrentUserPlayListRef = ref(
      fireDatabase,
      "users/" + userId + "/" + playlistname + "/" + currentSongDetails.videoId
    );
    update(createCurrentUserPlayListRef, currentSongData).then(() => {
      toast.show("song added to " + playlistname, {
        type: "success",
        placement: "top",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      bottomSheetRef.current.close();
      showPlayListBottomSheetRef.current.close();
    });
  }

  // stop streaming
  function stopStreaming() {
    const removeStreamingRef = ref(fireDatabase, "Streaming/" + userId);
    remove(removeStreamingRef).then(() => setvisibleModel(false));
  }

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Set to 90% for triggering at 50% scroll
    waitForInteraction: true,
    minimumViewTime: 5,
  }).current;

  const onViewableItemsChanged = useCallback(
    async ({ viewableItems, changed }) => {
      if (changed && changed.length > 0) {
        // check User Connected To Stream Either User Streaming
        storage.set("checkUserConnectedToStreamEitherUserStreaming", false);
        const index = changed[0].index;

        if (OnTouchMovement.current === true) {
          await TrackPlayer.skip(index);

          // Reset OnTouchMovement after 3 seconds
          setTimeout(() => {
            OnTouchMovement.current = false;
          }, 3000);
        }
      }
    },
    []
  );
  // render queue song list
  function renderQueueData({ item, index }) {
    return (
      <View
        style={{
          height: height,
          width: width,
          justifyContent: "center",
        }}
      >
        <Image
          resizeMode="cover"
          source={{ uri: item.artwork != null ? item.artwork : null }}
          style={{ height: "50%", width: "100%", marginTop: -75 }}
        />

        {/* custom linearGradient color for artwork image */}

        <CustomLinearGradient setvisibleModel={setvisibleModel} item={item} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-800">
      <StatusBar translucent barStyle="light-content" />
      <View style={{ flexGrow: 1 }}>
        {/* list of songs in queue list */}
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/*  */}
          {/* FlatList */}

          <View
            style={{
              flexDirection: "row",
              height: height,
            }}
          >
            <FlashList
              contentInsetAdjustmentBehavior="automatic"
              estimatedItemSize={200}
              ref={FlashListRef}
              bounces={false}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              data={QueueData != null ? QueueData : null}
              renderItem={renderQueueData}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onScrollBeginDrag={() => (OnTouchMovement.current = true)}
              scrollEventThrottle={15}
            />
          </View>

          {/* player controll buttons */}
          <View
            style={{
              position: "absolute",
              alignItems: "center",
              width: "100%",
              height: 70,
              marginTop: 10,
            }}
          >
            <View className="justify-between items-center flex-row">
              {/* play pause button */}

              <TouchableOpacity
                style={{
                  padding: 5,
                  marginTop: -20,
                  borderRadius: 50,
                  borderColor: "white",
                  borderWidth: 1.5,
                }}
                onPress={() => togglePlayer(playBackState)}
              >
                {playBackState.state == State.Buffering ? (
                  <ActivityIndicator color="#D90026" size={30} />
                ) : (
                  <Ionicons
                    name={
                      playBackState.state == State.Ready ||
                      playBackState.state == State.Paused
                        ? "play"
                        : "pause"
                    }
                    size={30}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 2,
            position: "absolute",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: 30,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 12,
              borderRadius: 30,
              backgroundColor: "black",
              alignSelf: "flex-start",
              opacity: 0.5,
              marginLeft: 10,
            }}
            onPress={goBack}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-col items-start">
            {/* details */}
            <TouchableOpacity
              style={{
                padding: 12,
                borderRadius: 30,
                backgroundColor: "black",
                alignSelf: "flex-start",
                opacity: 0.5,
                marginRight: 10,
              }}
              onPress={getSongsDetails}
            >
              <Entypo name="dots-three-horizontal" size={20} color="white" />
            </TouchableOpacity>
            {/* chats */}
            {isStreaming || connectedToStream ? (
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 30,
                  backgroundColor: "black",
                  opacity: 0.5,
                  marginTop: 5,
                }}
                onPress={() => navigation.navigate("GroupListnerChats")}
              >
                <Entypo name="chat" size={20} color="white" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* model */}
      <Modal
        visible={visibleModel}
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
          <View className="flex-col bg-black rounded-[10px] p-2">
            <View className="flex-col p-2">
              <View className="flex-col items-center bg-black p-2 rounded-sm">
                <Text className="text-white text-sm font-[Raleway-SemiBold]">
                  Waiting for another listener
                </Text>

                <LottieView
                  style={{ height: 40, width: 40 }}
                  autoPlay
                  loop
                  source={require("../LottiAnimation/loading.json")}
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#D90026",
                  padding: 7,
                  borderRadius: 5,
                  alignSelf: "center",
                }}
                onPress={() => stopStreaming()}
              >
                <Text className="text-white font-[Raleway-Regular] text-xs">
                  Stop streaming
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* bottom sheet */}
      <RBSheet
        ref={bottomSheetRef}
        height={150}
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
                uri: currentSongDetails.artwork,
              }}
              height={50}
              width={50}
            />
            <View className="flex-col ml-2">
              <Text
                numberOfLines={1}
                className="text-white text-[16px] font-[Raleway-Bold] mt-1 max-w-[250px]"
              >
                {currentSongDetails.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 text-sm font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
                {currentSongDetails.artist}
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
export default memo(MusicPlayer);
