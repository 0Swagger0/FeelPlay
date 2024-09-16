import { View, TouchableOpacity } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { useToast } from "react-native-toast-notifications";
import { useMMKV, useMMKVObject, useMMKVString } from "react-native-mmkv";

function LikeSongsExists() {
  // locall storage
  const [currentSongDetails] = useMMKVObject("currentSongDetails");
  const [userId] = useMMKVString("userId");
  const [url] = useMMKVString("url");

  const toast = useToast();
  const fireDatabase = getDatabase(App);

  const [HeratIconShow, setHeratIconShow] = useState(false);

  // check current track exist in like playlist
  useEffect(() => {
    const likeSongRef = ref(
      fireDatabase,
      "users/" + userId + "/" + "Like PlayList/" + currentSongDetails.videoId
    );
    onValue(likeSongRef, (snapshort) => {
      const title = snapshort.child("title").val();
      if (title) {
        setHeratIconShow(true);
      } else {
        setHeratIconShow(false);
      }
    });
  }, [, userId]);

  // adding to like musicgetCurrentSongDetails
  async function AddToLikeMusic() {
    // current song details
    const currentSongData = {
      videoId: currentSongDetails.videoId,
      title: currentSongDetails.title,
      artist: currentSongDetails.artist,
      artwork: currentSongDetails.artwork,
      url: `${url}/stream?id=${currentSongDetails.videoId}`,
      duration: currentSongDetails.duration,
    };
    if (HeratIconShow == true) {
      setHeratIconShow(false);
      // remove from like playlist
      const RemoveCurrentUserLikePlayListRef = ref(
        fireDatabase,
        "users/" +
          userId +
          "/" +
          "Like PlayList" +
          "/" +
          currentSongDetails.videoId
      );
      remove(RemoveCurrentUserLikePlayListRef).then(() => {
        toast.show("Song remove from like playlist", {
          type: "success",
          placement: "top",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
      });
    } else {
      setHeratIconShow(true);
      // adding to like playlist
      const createCurrentUserLikePlayListRef = ref(
        fireDatabase,
        "users/" +
          userId +
          "/" +
          "Like PlayList" +
          "/" +
          currentSongDetails.videoId
      );
      update(createCurrentUserLikePlayListRef, currentSongData).then(() => {
        toast.show("Song added to like playlist", {
          type: "success",
          placement: "top",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
      });
    }
  }
  return (
    <View>
      <TouchableOpacity onPress={AddToLikeMusic}>
        <AntDesign
          style={{ marginRight: 15 }}
          name={HeratIconShow == true ? "heart" : "heart"}
          size={24}
          color={HeratIconShow == true ? "#D90026" : "white"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default memo(LikeSongsExists);
