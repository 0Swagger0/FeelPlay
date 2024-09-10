import { getDatabase, onValue, ref, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { storage } from "../components/Data/LocalStorage";

// user id
const userId = storage.getString("userId");
//streaming url
const streamingUrl = storage.getString("url");

export default async function CreateStreamingInUsers(item) {
  // firebase databse
  const firebaseDatabase = getDatabase(App);

  const getAllUserIdRef = ref(firebaseDatabase, "Streaming/" + userId);
  onValue(getAllUserIdRef, (snapshort) => {
    snapshort.forEach((data) => {
      const AllUserIds = data.key;
      if (AllUserIds) {
        updateStreamChildInUsers(AllUserIds);
      }
    });
  });

  //create stream child in all users
  function updateStreamChildInUsers(AllUserIds) {
    const title = item.title;
    const artwork = item.artwork;
    const artist = item.artist;
    const url = `${streamingUrl}/stream?id=${item.videoId}`;
    const videoId = item.videoId;
    const duration = item.duration;

    if (userId != AllUserIds) {
      const updateStreamChildRef = ref(
        firebaseDatabase,
        "users/" + AllUserIds + "/" + "Streaming"
      );
      update(updateStreamChildRef, {
        title: title,
        artwork: artwork,
        artist: artist,
        url: url,
        videoId: videoId,
        duration: duration,
      });
    }
  }
}
