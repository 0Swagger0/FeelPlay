import { View, Text } from "react-native";
import React from "react";
import { storage } from "../components/Data/LocalStorage";
import axios from "axios";

export default async function getLyricsData(title, artist) {
  try {
    const lyrics = await axios.get(
      `https://transcoder-9w41.onrender.com/lyrics?title=${
        title + " " + artist
      }`
    );

    // set lyrics to local storage
    storage.set("lyrics", JSON.stringify(lyrics.data));
  } catch (error) {
    // set lyrics to local storage
    storage.set("lyrics", JSON.stringify([]));
  }
}
