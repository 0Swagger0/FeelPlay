import TrackPlayer, { RepeatMode } from "react-native-track-player";
import CheckTheTrackExistInRecentlyPlayed from "./CheckTheTrackExistInRecentlyPlayed";
import { storage } from "../components/Data/LocalStorage";
import CreateStreamingInUsers from "./CreateStreamingInUsers";
import { Alert } from "react-native";

export default async function SongsPlayAndRedirectToMusicPlayer(item, userId) {
  // check if user streming or not
  const isStreaming = storage.getBoolean("isStreaming");
  const RoomConnectedTo = storage.getString("RoomConnectedTo");
  const url = storage.getString("url");

  //https://transcoder-9w41.onrender.com/

  // song child details
  const videoId = item.videoId;

  // clear user queue
  storage.delete("user-queue");

  // check if user streaming
  if (isStreaming) {
    CreateStreamingInUsers(item, userId);
  }

  // check if is connected to stream
  if (RoomConnectedTo) {
    CreateStreamingInUsers(item, RoomConnectedTo);
  }

  // getting url from ytcore server
  const baseUrlPython = `http://15.235.207.2`; // Use your local IP address

  try {
    const response = await fetch(`${baseUrlPython}/related?id=${videoId}`);

    const json = await response.json();

    if (json.error) {
      throw new Error(json.error);
    }

    const { related } = json;

    // song play and add more tracks to track player
    const tracks = related.map((track, index) => ({
      id: index.toString(),
      url: `${url}/stream?id=${track.videoId}`,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
      videoId: track.videoId,
    }));

    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentTrackIndex >= 0) {
      await TrackPlayer.add(tracks, 1 + currentTrackIndex);
      await TrackPlayer.skip(1 + currentTrackIndex).then(
        async () => await TrackPlayer.play()
      );
    } else {
      await TrackPlayer.add(tracks);
      await TrackPlayer.play();
    }

    // set queue to local storage
    storage.set("user-queue", JSON.stringify(tracks));
    // set queue to local storage
  } catch (error) {
    console.error("Error playing audio:", error);
    Alert.alert("Playback error", error.message);
  }

  // add song to recently played
  CheckTheTrackExistInRecentlyPlayed(videoId);

  // //

  // shuffle array
  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 20);
  };
}
