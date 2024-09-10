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
import { Query } from "appwrite";
import { UserPlayListData } from "../components/Data/LoadAllSongDataForSeacrh";
import SongsPlayAndRedirectToMusicPlayer from "../functions/SongsPlayAndRedirectToMusicPlayer";
import { useMMKVString } from "react-native-mmkv";
import axios from "axios";

export default function SeeAllPlayListToPlay({ route }) {
  const playListName = route.params.playListData.title;
  const PlayListImage = route.params.playListData.playListImage;
  const userId = route.params.userId;
  const description = route.params.description;
  const playlistId = route.params.playlistId;

  // songs state variable
  const [titleOfSong] = useMMKVString("title");
  const [AllPlayListSongsData, setAllPlayListSongsData] = useState([]);
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

  // ref
  const navigation = useNavigation();

  const AnimatedLinearGradient =
    Animated.createAnimatedComponent(LinearGradient);

  // animation variable

  const posterSize = Dimensions.get("screen").height / 2;
  const headerTop = 44 - 16;

  const layoutY = useSharedValue(0);

  // getting play list data to play songs
  useEffect(() => {
    async function gettingAllPlayListSongs() {
      const PlayListData = await axios.get(
        "http://192.168.1.9:5000/playListData"
      );
    }

    loadUserPlayList();
    gettingAllPlayListSongs();
  }, [playListName]);

  // load current user play list
  async function loadUserPlayList() {
    const userPlayListData = await UserPlayListData(userId);
    userPlayListData.map((data) => {
      if (data.playListImage == null) {
        setPlayListData((pre) => [...pre, data]);
      }
    });
  }

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
            {playListName}
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
            uri: PlayListImage,
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
              {playListName}
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
    // track variable

    useEffect(() => {
      // scroll to position
      scrollRef.current.scrollTo({
        y: ScrollPosition.value,
        animated: true,
      });
    }, [titleOfSong]);
    //
    const sv = useSharedValue(0);
    const inset = useSafeAreaInsets();
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
    async function playAllSongsInQueue() {
      // database id and collection id
      const database_id = AllPlayListSongsData[0].$databaseId;
      const collection_id = AllPlayListSongsData[0].$collectionId;
      const category = AllPlayListSongsData[0].category;

      await TrackPlayer.reset().then(async () => {
        await TrackPlayer.add(AllPlayListSongsData[0]).then(async () => {
          await TrackPlayer.play().then(async () => {
            // make player to queue played
            addingRandomSongToPlayer(database_id, collection_id, category);
          });
        });
      });
    }

    // adding random songs
    async function addingRandomSongToPlayer(
      database_id,
      collection_id,
      category
    ) {
      const songData = await database.listDocuments(
        database_id,
        collection_id,
        [Query.equal("category", category)]
      );

      // random data
      const randomSongData = shuffleArray(songData.documents);
      // all player variable
      await TrackPlayer.add(randomSongData).then(async () => {
        await TrackPlayer.play();
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

    // create current playlist id
    function AddingCurrentPlayListId(database_id, collection_id, category) {
      const AddingCurrentPlayListIdRef = ref(
        firebaseDatabase,
        "users/" + userId
      );
      update(AddingCurrentPlayListIdRef, {
        currentPlayListId: collection_id,
        databaseType: "appwrite",
        databaseId: database_id,
        category: category,
      });
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
                className="flex items-end justify-center z-10 pb-4 pt-4"
                onLayout={(event) => {
                  "worklet";
                  layoutY.value = event.nativeEvent.layout.y;
                }}
                style={[stickyElement]}
              >
                <Pressable
                  className="bg-[#D90026] px-2 py-2 items-center rounded-full mr-2"
                  onPress={playAllSongsInQueue}
                >
                  <View className="flex-row p-2 items-center">
                    <AntDesign name="play" color="white" size={20} />
                    <Text className="text-white ml-2 text-[14px] font-[Raleway-SemiBold]">
                      Shuffle Play
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
              <Animated.View className="flex items-start justify-center pb-3 pt-4 bg-black">
                <View className="px-10 items-start rounded-full">
                  <Text className="text-[18px] tracking-[.15] font-bold text-white">
                    Top songs
                  </Text>
                </View>
              </Animated.View>
              {/* Songs List */}
              {AllPlayListSongsData.map((item, index) => {
                return (
                  <View className="flex-col mx-2" key={index}>
                    <TouchableNativeFeedback
                      onPress={() => {
                        // check if title is similer to current title
                        if (item.title == titleOfSong) {
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
                                borderColor: "white",
                                borderWidth: 0.5,
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
                        <View className="flex-row items-center mr-1">
                          {item.title == titleOfSong ? (
                            <LottieView
                              style={{ height: 30, width: 30, marginRight: 20 }}
                              loop
                              autoPlay
                              source={require("../LottiAnimation/music.json")}
                            />
                          ) : null}
                          <TouchableOpacity
                            onPress={() => playListSongMenu(item)}
                          >
                            <Entypo
                              name="dots-three-vertical"
                              size={17}
                              color="white"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                );
              })}
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
                className="text-white text-[20] font-[Raleway-SemiBold] mt-1 max-w-[250px]"
              >
                {SelectPlayListData.title}
              </Text>
              <Text className="text-white text-sm font-[Raleway-Regular] mt-1">
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
