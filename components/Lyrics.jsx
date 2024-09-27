import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableNativeFeedback,
} from "react-native";
import { useProgress } from "react-native-track-player";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import RBSheet from "react-native-raw-bottom-sheet";
import { useMMKVObject } from "react-native-mmkv";

const { height: screenHeight } = Dimensions.get("window");

const LyricsComponent = ({ LinearGradientColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);
  const flatListRef1 = useRef(null);
  const lyricsbottomSheet = useRef(null);

  // Set lyrics
  const [lyricsData] = useMMKVObject("lyrics");

  // Progress
  const { position } = useProgress();

  // Automatically scroll the lyrics based on the current time
  useEffect(() => {
    const index = lyricsData.findIndex((item) => item.seconds > position) - 1;

    if (index !== currentIndex && index >= 0) {
      setCurrentIndex(index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Center the active lyric
      });
    }

    if (index !== currentIndex && index >= 0) {
      flatListRef1.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Center the active lyric
      });
    }
  }, [position]);

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.lyricContainer}>
        <TouchableNativeFeedback
          onPress={() => lyricsbottomSheet.current.open()}
        >
          <Text
            style={[
              styles.lyricText,
              index === currentIndex
                ? styles.activeLyricText
                : styles.inactiveLyricText,
            ]}
          >
            {item.lyrics}
          </Text>
        </TouchableNativeFeedback>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Blur Effect */}
      <LinearGradient
        colors={[LinearGradientColor, "transparent", LinearGradientColor]}
        style={styles.topFade}
      />

      <FlashList
        estimatedItemSize={200}
        data={lyricsData}
        ref={flatListRef}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        extraData={currentIndex}
        onScrollToIndexFailed={(error) => {
          // Handle the scroll failure gracefully
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: error.index,
              animated: true,
              viewPosition: 0.5,
            });
          }, 100);
        }}
      />
      {/* Bottom Blur Effect */}
      <LinearGradient colors={["transparent", LinearGradientColor]} />

      {/* make button sheet */}
      {/* bottom sheet */}
      <RBSheet
        ref={lyricsbottomSheet}
        height={800}
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
            <Text className="text-white font-[Raleway-Bold] text-[20px] m-2 ">
              Lyrics
            </Text>
          </View>

          <View className="h-[90%] ">
            <FlashList
              estimatedItemSize={200}
              data={lyricsData}
              ref={flatListRef1}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              extraData={currentIndex}
              onScrollToIndexFailed={(error) => {
                // Handle the scroll failure gracefully
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index: error.index,
                    animated: true,
                    viewPosition: 0.5,
                  });
                }, 100);
              }}
            />
          </View>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.25, // Adjust height of FlashList, e.g., 35% of screen height
    marginTop: 60,
  },
  lyricContainer: {
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "flex-start", // Align text to the left
    paddingHorizontal: 10,
  },
  lyricText: {
    textAlign: "left", // Ensure text is left-aligned
  },
  activeLyricText: {
    fontSize: 22,
    fontFamily: "Raleway-Bold",
    color: "#FFFFFF",
  },
  inactiveLyricText: {
    fontSize: 16,
    fontFamily: "Raleway-SemiBold",
    color: "rgba(255, 255, 255, 0.5)", // Slightly faded effect for inactive lyrics
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 25, // Adjust the fade height for the top gradient
    zIndex: 1,
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    opacity: 0.5,
    left: 0,
    right: 0,
    height: 50, // Adjust the fade height for the bottom gradient
  },
});

export default LyricsComponent;
