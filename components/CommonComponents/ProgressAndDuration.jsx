import { View, Text } from "react-native";
import React, { memo } from "react";
import TrackPlayer, { useProgress } from "react-native-track-player";
import Slider from "@react-native-community/slider";

function ProgressAndDuration() {
  const { position, duration } = useProgress();

  // duration in second
  function format(seconds) {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, "0");
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }
  return (
    <View>
      <View className="flex-row self-end mr-5 ml-3 mt-[-6]">
        <Text className="text-white font-[Raleway-Bold] text-base">
          {format(position)}
        </Text>
      </View>

      <Slider
        style={{ width: "100%", height: 20, marginBottom: 10 }}
        value={position}
        minimumValue={0}
        maximumValue={duration}
        thumbTintColor="#D90026"
        minimumTrackTintColor="#D90026"
        maximumTrackTintColor="white"
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
      />
    </View>
  );
}

export default memo(ProgressAndDuration);
