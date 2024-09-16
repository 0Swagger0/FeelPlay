import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import TrackPlayer from "react-native-track-player";
import { storage } from "../components/Data/LocalStorage";

const fireDatabase = getDatabase(App);

// user details and url
const url = storage.getString("url");
const userId = storage.getString("userId");

export default async function LikeSongAdding({
  HeratIconShow,
  setHeratIconShow,
}) {
  const getActiveTrack = await TrackPlayer.getActiveTrack();

  if (!userId || !getActiveTrack?.videoId) return;

  const likeSongRef = ref(
    fireDatabase,
    `users/${userId}/Like PlayList/${getActiveTrack.videoId}`
  );
  try {
    await (HeratIconShow
      ? remove(likeSongRef)
      : update(likeSongRef, {
          videoId: getActiveTrack.videoId,
          title: getActiveTrack.title,
          artist: getActiveTrack.artist,
          artwork: getActiveTrack.artwork,
          url: `${url}/stream?id=${getActiveTrack.videoId}`,
          duration: getActiveTrack.duration,
        }));
    setHeratIconShow(!HeratIconShow);
  } catch (error) {
    console.log(error);
  }
}
