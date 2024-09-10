import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { memo, useEffect, useState } from "react";
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import LottieView from "lottie-react-native";

function BottomPlayerLayout() {
  const navigation = useNavigation();
  // play back state
  const playBackState = usePlaybackState();
  // progress bar
  const { position, duration } = useProgress();
  // title and artwork and artist
  const [titleOfSong, settitleOfSong] = useState("");
  const [artistsName, setartistsName] = useState("");
  const [artwork, setartwork] = useState("");

  useEffect(() => {
    async function getTrackDetails() {
      try {
        const trackDetail = await TrackPlayer.getActiveTrack();
        if (trackDetail.title != null) {
          setartwork(trackDetail.artwork);
          setartistsName(trackDetail.artist);
          settitleOfSong(trackDetail.title);
        }
      } catch (error) {}
    }
    getTrackDetails();
  }, []);

  // track change event for track details
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (
      event.type == Event.PlaybackActiveTrackChanged &&
      event.track !== null
    ) {
      const title = event.track.title;
      const artist = event.track.artist;
      const artwork = event.track.artwork;

      if (title && artist && artwork) {
        settitleOfSong(title);
        setartistsName(artist);
        setartwork(artwork);
      }
    }
  });

  // duration in second
  function format(seconds) {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, "0");
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
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

  // next track
  async function nextTrack() {
    await TrackPlayer.skipToNext();
  }

  // next track
  async function previousTrack() {
    await TrackPlayer.skipToPrevious();
  }

  return (
    <View className="bg-black">
      {artwork != "" ? (
        <View className="flex-col p-1 bg-[#14162e] mx-1 rounded-[10px] mb-3">
          <View>
            <View className="flex-row p-1 items-center justify-between">
              <View className="flex-row items-center">
                <Image
                  style={{
                    borderRadius: 5,
                    borderColor: "white",
                    borderWidth: 1,
                  }}
                  source={{ uri: artwork }}
                  height={40}
                  width={40}
                />

                <View className="flex-col ml-2">
                  <Text
                    numberOfLines={1}
                    className="text-white max-w-[200px] text-xs font-[Raleway-SemiBold]"
                  >
                    {titleOfSong}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-white max-w-[200px] mt-1 text-[10px] font-[Raleway-SemiBold]"
                  >
                    {artistsName}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-around items-center">
                <TouchableOpacity className="p-1" onPress={previousTrack}>
                  <Ionicons name="play-skip-back" size={15} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => togglePlayer(playBackState)}
                >
                  <Ionicons
                    name={
                      playBackState.state == State.Ready ||
                      playBackState.state == State.Paused
                        ? "play"
                        : "pause"
                    }
                    size={25}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity className="p-1" onPress={nextTrack}>
                  <Ionicons name="play-skip-forward" size={15} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* duration text */}
            <View className="flex-row justify-between items-center mr-3 ml-3 self-end">
              <Text className="text-white font-[Raleway-SemiBold] text-[10px]">
                {format(position)} / {format(duration)}
              </Text>
            </View>
          </View>

          <Slider
            style={{ height: 12 }}
            minimumTrackTintColor="#D90026"
            maximumTrackTintColor="gray"
            thumbTintColor="#D90026"
            value={position}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={async (value) => {
              await TrackPlayer.seekTo(value);
            }}
          />
        </View>
      ) : (
        <View className="flex-col items-center justify-center">
          {playBackState.state == State.Loading ||
          playBackState.state == State.Ready ? (
            <LottieView
              source={require("../../LottiAnimation/loading.json")}
              style={{ height: 100, width: 100 }}
              autoPlay
              loop
            />
          ) : null}
        </View>
      )}
    </View>
  );
}
export default memo(BottomPlayerLayout);
