import { View, Text, FlatList } from "react-native";
import React, { memo, useEffect, useState } from "react";
import {
  DATABASE_USERS_ID,
  USER_RECENTLY_PLAYED_COLLECTION_ID,
  database,
} from "../../appwriteConfig";
import { Query } from "appwrite";
import RenderRencentlyPlayedMusicFlatList from "../RenderRencentlyPlayedMusicFlatList";
import { useProgress } from "react-native-track-player";
import { FlashList } from "@shopify/flash-list";
function RecentlyPlayed({ currentvideoId, userId, showBottomSheet }) {
  // variable
  const [RecentlyPlyedSongData, setRecentlyPlyedSongData] = useState([]);
  const reverseData = [...RecentlyPlyedSongData].reverse();

  const { position } = useProgress();

  // refresh recently playlist
  useEffect(() => {
    getRecentalySongData();
  }, []);

  async function getRecentalySongData() {
    const recentlySongData = await database.listDocuments(
      DATABASE_USERS_ID,
      USER_RECENTLY_PLAYED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(300)]
    );
    setRecentlyPlyedSongData(recentlySongData.documents);
  }

  // refresh recently playlist
  useEffect(() => {
    async function refresh() {
      const recentlySongData = await database.listDocuments(
        DATABASE_USERS_ID,
        USER_RECENTLY_PLAYED_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(300)]
      );
      setRecentlyPlyedSongData(recentlySongData.documents);
    }
    refresh();
  }, [position >= 5]);

  // show bottom sheet
  // adding songs to queue
  function AddingSongIntoQueue(song) {
    showBottomSheet(song);
  }

  return (
    <View className="mt-1 ml-1">
      <Text className="text-white font-[Raleway-Bold] text-[20px] mt-2 mb-2">
        Recently played
      </Text>

      <FlatList
        horizontal
        overScrollMode="never"
        scrollToOverflowEnabled={false}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={30}
        windowSize={5}
        data={reverseData.slice(0, 30)}
        renderItem={({ item, index }) => {
          return (
            <RenderRencentlyPlayedMusicFlatList
              item={item}
              index={index}
              AddingSongIntoQueue={AddingSongIntoQueue}
              currentvideoId={currentvideoId}
            />
          );
        }}
      />
    </View>
  );
}
export default memo(RecentlyPlayed);
