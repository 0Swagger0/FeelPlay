import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

export default function Welcome({ navigation }) {
  const { width, height } = Dimensions.get("window");
  const FlatListRef = useRef(null);
  const [Index, setIndex] = useState(0);
  const translationX = useSharedValue(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: true,
    minimumViewTime: 5,
  });

  const onViewableItemsChanged = React.useRef(({ viewableItems, changed }) => {
    if (changed && changed.length > 0) {
      const index = changed[0].index;
      setIndex(index);
    }
  });

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationX.value = withSpring(event.contentOffset.x);
  });

  const SliderData = [
    {
      id: 1,
      text: "There's a song for every mood",
      imageUrl: require("../Images/arijitsingh.jpg"),
      button: false,
    },
    {
      id: 2,
      text: "Let the Music Blown your Minds",
      imageUrl: require("../Images/musicArtists.jpg"),
      button: false,
    },
    {
      id: 3,
      text: "Keep a song in your heart.",
      imageUrl: require("../Images/peakpx.jpg"),
      button: true,
    },
  ];

  function NextPosition(INDEX) {
    FlatListRef.current.scrollToIndex({ animated: true, index: INDEX });
    setIndex(INDEX);
  }

  function navigateToLoginScreen() {
    navigation.replace("Login");
  }

  return (
    <View className="flex-col">
      <StatusBar hidden />
      <Animated.FlatList
        ref={FlatListRef}
        data={SliderData}
        keyExtractor={(item) => item.id}
        horizontal
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        bounces={false}
        pagingEnabled
        onScroll={scrollHandler}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                height: height,
                width: width,
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Image
                source={item.imageUrl}
                style={{ width: width, height: height }}
              />
              <LinearGradient
                start={{ x: 0.1, y: 0.4 }}
                end={{ x: 0.1, y: 0 }}
                colors={[
                  "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
                  "transparent",
                ]}
                style={{
                  height: 200,
                  width: "100%",
                  position: "absolute",
                }}
              >
                <Animated.View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 35,
                      fontFamily: "Raleway-Bold",
                      margin: 10,
                    }}
                  >
                    {item.text}
                  </Text>

                  {item.button == true ? (
                    <TouchableOpacity
                      className="p-4 bg-[#D90026] w-80 items-center self-center rounded-md"
                      onPress={navigateToLoginScreen}
                    >
                      <Text
                        style={{
                          fontFamily: "Raleway-Bold",
                          fontSize: 15,
                          color: "white",
                        }}
                      >
                        Get Started
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="p-4 bg-[#D90026] w-80 items-center self-center rounded-md"
                      onPress={() => NextPosition(item.id)}
                    >
                      <Text
                        style={{
                          fontFamily: "Raleway-Bold",
                          fontSize: 15,
                          color: "white",
                        }}
                      >
                        Next {" >"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </LinearGradient>
            </View>
          );
        }}
      />
    </View>
  );
}
