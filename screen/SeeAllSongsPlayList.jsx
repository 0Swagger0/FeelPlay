import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableNativeFeedback,
  ScrollView,
  VirtualizedList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TrackPlayer, { RepeatMode } from "react-native-track-player";
import { useToast } from "react-native-toast-notifications";
import { getDatabase, ref, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import LottieView from "lottie-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import SongsPlayAndRedirectToMusicPlayer from "../functions/SongsPlayAndRedirectToMusicPlayer";
import { useMMKVString } from "react-native-mmkv";

export default function SeeAllSongsPlayList({ route }) {
  //
  const PageTitle = route.params.pageTitle;
  const SongPlayListData = route.params.SongPlayListData;
  const userId = route.params.userId;
  const PageImage = route.params.PageImage;

  // songs state variable
  const [currentvideoId] = useMMKVString("videoId");
  // streaming url
  const [url] = useMMKVString("url");
  const [SelectPlayListData, setSelectPlayListData] = useState({});

  // user play list data
  const [PlayListData, setPlayListData] = useState([]);

  // scroll ref
  const scrollRef = useRef(null);

  // bottom sheet
  const showBottomSheet = useRef(null);
  const playListBottomSheetRef = useRef(null);
  const toast = useToast();

  // databse
  const firebaseDatabase = getDatabase(App);
  // scroll position
  const ScrollPosition = useSharedValue(0);
  const layoutY = useSharedValue(0);

  // ref
  const navigation = useNavigation();

  const AnimatedLinearGradient =
    Animated.createAnimatedComponent(LinearGradient);

  // animation variable
  const posterSize = Dimensions.get("screen").height / 2;
  const headerTop = 44 - 16;

  // get current songs details
  useEffect(() => {
    // load current user play list
    async function loadUserPlayList() {
      const userPlayListData = await UserPlayListData(userId);
      userPlayListData.map((data) => {
        if (data.playListImage == null) {
          setPlayListData((pre) => [...pre, data]);
        }
      });
    }

    loadUserPlayList();
  }, []);

  function ScreenHeader({ sv }) {
    const inset = useSafeAreaInsets();
    const opacityAnim = useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          sv.value,
          [
            ((posterSize - (headerTop + inset.top)) / 4) * 3,
            posterSize - (headerTop + inset.top) + 1,
          ],
          [0, 1]
        ),
        transform: [
          {
            scale: interpolate(
              sv.value,
              [
                ((posterSize - (headerTop + inset.top)) / 4) * 3,
                posterSize - (headerTop + inset.top) + 1,
              ],
              [0.98, 1],
              Extrapolation.CLAMP
            ),
          },
          {
            translateY: interpolate(
              sv.value,
              [
                ((posterSize - (headerTop + inset.top)) / 4) * 3,
                posterSize - (headerTop + inset.top) + 1,
              ],
              [-10, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
        paddingTop: inset.top === 0 ? 8 : inset.top,
      };
    });
    return (
      <Animated.View
        className="absolute w-full px-4 pb-2 flex flex-row items-start justify-between z-10 bg-black"
        style={[opacityAnim]}
      >
        <Animated.View className="flex-row items-center">
          <Animated.View>
            <MaterialIcons
              style={{ marginLeft: 5, marginRight: 5 }}
              onPress={() => navigation.goBack()}
              name="arrow-back-ios"
              size={20}
              color="white"
            />
          </Animated.View>
          <Animated.Text className="text-xl text-white font-medium">
            {PageTitle}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    );
  }

  const PosterImage = ({ sv }) => {
    const inset = useSafeAreaInsets();
    const layoutY = useSharedValue(0);
    const opacityAnim = useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          sv.value,
          [0, posterSize - (headerTop + inset.top) / 0.9],
          [1, 0],
          Extrapolation.CLAMP
        ),
      };
    });
    const textAnim = useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          sv.value,
          [-posterSize / 8, 0, posterSize - (headerTop + inset.top) / 0.8],
          [0, 1, 0],
          Extrapolation.CLAMP
        ),
        transform: [
          {
            scale: interpolate(
              sv.value,
              [-posterSize / 8, 0, (posterSize - (headerTop + inset.top)) / 2],
              [1.1, 1, 0.95],
              "clamp"
            ),
          },
          {
            translateY: interpolate(
              sv.value,
              [layoutY.value - 1, layoutY.value, layoutY.value + 1],
              [0, 0, -1]
            ),
          },
        ],
      };
    });
    const scaleAnim = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: interpolate(sv.value, [-50, 0], [1.3, 1], {
              extrapolateLeft: "extend",
              extrapolateRight: "clamp",
            }),
          },
        ],
      };
    });

    return (
      <Animated.View style={[styles.imageContainer, opacityAnim]}>
        <Animated.Image
          style={[styles.imageStyle, scaleAnim]}
          source={{
            uri: PageImage,
          }}
        />

        <LinearGradient
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0.5 }}
          colors={[
            "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
            "transparent",
          ]}
        >
          <Animated.View
            onLayout={(event) => {
              "worklet";
              layoutY.value = event.nativeEvent.layout.y;
            }}
            className="absolute bottom-0 top-0 left-0 right-0 justify-end px-5 z-10"
            style={[textAnim]}
          >
            <Animated.Text
              numberOfLines={2}
              className="font-bold text-white font-[Raleway-Bold] text-[40px]"
            >
              {PageTitle}
            </Animated.Text>
          </Animated.View>
        </LinearGradient>

        <AnimatedLinearGradient
          className="absolute inset-0"
          style={[scaleAnim]}
          colors={[
            `rgba(0,0,0,${0})`,
            `rgba(0,0,0,${0.1})`,
            `rgba(0,0,0,${0.3})`,
            `rgba(0,0,0,${0.5})`,
            `rgba(0,0,0,${0.8})`,
            `rgba(0,0,0,${1})`,
          ]}
        />
      </Animated.View>
    );
  };

  // scroll handler
  function FeelPlayScreen() {
    useEffect(() => {
      // scroll to position
      scrollRef.current.scrollTo({
        y: ScrollPosition.value,
        animated: true,
      });
    }, [currentvideoId]);
    // track variable
    const inset = useSafeAreaInsets();
    const sv = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        "worklet";
        sv.value = event.contentOffset.y;
        ScrollPosition.value = event.contentOffset.y;
      },
    });

    const initialTranslateValue = posterSize;

    const animatedScrollStyle = useAnimatedStyle(() => {
      return {
        paddingTop: initialTranslateValue,
      };
    });

    const stickyElement = useAnimatedStyle(() => {
      return {
        backgroundColor: "black",
        transform: [
          {
            translateY: interpolate(
              sv.value,
              [
                layoutY.value - (headerTop + inset.top) - 1,
                layoutY.value - (headerTop + inset.top),
                layoutY.value - (headerTop + inset.top) + 1,
              ],
              [0, 0, 1]
            ),
          },
        ],
      };
    });

    // platllist song menu
    function playListSongMenu(playListData) {
      showBottomSheet.current.open();
      setSelectPlayListData(playListData);
    }

    // play all song in Queue
    async function playAllSongsInQueue(QueueData) {
      const queuefirstsongdata = {
        title: QueueData[0].title,
        artist: QueueData[0].artist,
        artwork: QueueData[0].artwork,
        duration: QueueData[0].duration,
        videoId: QueueData[0].videoId,
        url: `${url}/stream?id=${QueueData[0].videoId}`,
      };
      // database id and collection id

      const currentSongIndex = await TrackPlayer.getActiveTrackIndex();
      await TrackPlayer.add(queuefirstsongdata, currentSongIndex).then(
        async () => {
          await TrackPlayer.skip(currentSongIndex);
          await TrackPlayer.play();
          // adding random songs
          addingRandomSongToPlayer();
        }
      );
    }

    // adding random songs
    async function addingRandomSongToPlayer() {
      // random data
      const randomSongData = shuffleArray(SongPlayListData);

      const allshufflequeuesongdata = randomSongData.map((data) => ({
        title: data.title,
        artist: data.artist,
        artwork: data.artwork,
        duration: data.duration,
        videoId: data.videoId,
        url: `${url}/stream?id=${data.videoId}`,
      }));
      TrackPlayer.add(allshufflequeuesongdata);
      TrackPlayer.play();
    }
    // shuffle array
    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    function renderSongsForUser({ item, index }) {
      return (
        <View className="flex-col mx-2">
          <TouchableNativeFeedback
            onPress={() => {
              if (item.videoId == currentvideoId) {
                navigation.navigate("MusicPlayer");
              } else {
                SongsPlayAndRedirectToMusicPlayer(item, userId);
              }
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row p-1 items-center">
                {item.artwork == "" ? (
                  <Image
                    source={require("../Icons/icons8-music-240.png")}
                    height={40}
                    width={40}
                    style={{ borderRadius: 5 }}
                  />
                ) : (
                  <View className="items-center justify-center">
                    {item.videoId == currentvideoId ? (
                      <LottieView
                        style={{
                          height: 45,
                          width: 45,
                        }}
                        loop
                        autoPlay
                        source={require("../LottiAnimation/music.json")}
                      />
                    ) : (
                      <Image
                        defaultSource={require("../Icons/icons8-music-240.png")}
                        source={{ uri: item.artwork }}
                        height={47}
                        width={47}
                        style={{
                          borderRadius: 3,
                          borderColor: "white",
                          borderWidth: 0.3,
                        }}
                      />
                    )}
                  </View>
                )}
                <View className="ml-3 w-52">
                  <Text
                    numberOfLines={2}
                    className="text-white font-[Raleway-Bold] text-[15px] max-w-[200px]"
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-gray-300 font-[Raleway-Regular] text-xs max-w-[200px]"
                  >
                    {item.artist}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => playListSongMenu(item)}>
                <Entypo
                  name="dots-three-vertical"
                  size={17}
                  color="white"
                  style={{ marginRight: 5 }}
                />
              </TouchableOpacity>
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <Animated.View className="flex-1 bg-black">
        <ScreenHeader sv={sv} />
        <PosterImage sv={sv} />
        <Animated.View className="flex-1">
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[animatedScrollStyle]} className="pb-10">
              {/* Button Section */}
              <Animated.View
                className="flex items-center justify-center z-10 pb-4 pt-4"
                onLayout={(event) => {
                  "worklet";
                  layoutY.value = event.nativeEvent.layout.y;
                }}
                style={[stickyElement]}
              >
                <Pressable
                  className="bg-[#D90026] px-10 py-2 items-center rounded-full"
                  onPress={() => playAllSongsInQueue(SongPlayListData)}
                >
                  <View className="flex-row p-1 items-end">
                    <Text className="text-base font-bold text-white uppercase mr-2">
                      Shuffle Play
                    </Text>
                    <AntDesign name="play" color="white" size={25} />
                  </View>
                </Pressable>
              </Animated.View>
              <Animated.View className="flex items-start justify-center pb-3 pt-4 bg-black">
                <Pressable className="px-10 items-start rounded-full">
                  <Text className="text-[18px] tracking-[.15] font-bold text-white">
                    Popular
                  </Text>
                </Pressable>
              </Animated.View>
              {/* Songs List */}

              <VirtualizedList
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                onEndReachedThreshold={0.1}
                style={{ marginBottom: 200 }}
                windowSize={5}
                data={SongPlayListData}
                keyExtractor={(item) => item.id}
                getItemCount={() => SongPlayListData.length}
                getItem={(data, index) => SongPlayListData[index]}
                renderItem={renderSongsForUser}
              />
            </Animated.View>
          </Animated.ScrollView>
        </Animated.View>
      </Animated.View>
    );
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
      title: SelectPlayListData.title,
      artist: SelectPlayListData.artist,
      artwork: SelectPlayListData.artwork,
      duration: SelectPlayListData.duration,
      videoId: SelectPlayListData.videoId,
      url: `h${url}/stream?id=${SelectPlayListData.videoId}`,
    };

    const createCurrentUserPlayListRef = ref(
      firebaseDatabase,
      "users/" + userId + "/" + playlistname + "/" + SelectPlayListData.videoId
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

  // adding songs in to queue
  async function AddingSongIntoQueue() {
    await TrackPlayer.add({
      title: SelectPlayListData.title,
      artist: SelectPlayListData.artist,
      artwork: SelectPlayListData.artwork,
      duration: SelectPlayListData.duration,
      url: `${url}/stream?id=${SelectPlayListData.videoId}`,
      videoId: SelectPlayListData.videoId,
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
        title: SelectPlayListData.title,
        artist: SelectPlayListData.artist,
        artwork: SelectPlayListData.artwork,
        duration: SelectPlayListData.duration,
        url: `${url}/stream?id=${SelectPlayListData.videoId}`,
        videoId: SelectPlayListData.videoId,
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

  return (
    <SafeAreaProvider>
      <FeelPlayScreen />

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
              <Text
                numberOfLines={1}
                className="text-white text-[16px] font-[Raleway-Bold] mt-1 max-w-[250px]"
              >
                {SelectPlayListData.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-gray-400 text-sm font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: Dimensions.get("screen").height / 2,
    width: Dimensions.get("screen").width,
    position: "absolute",
  },
  imageStyle: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
});
