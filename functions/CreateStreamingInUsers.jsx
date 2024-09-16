import { getDatabase, onValue, ref, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { storage } from "../components/Data/LocalStorage";

// user id
const userId = storage.getString("userId");
//streaming url
const streamingUrl = storage.getString("url");

export default async function CreateStreamingInUsers(item, roomId) {
  // firebase databse
  const firebaseDatabase = getDatabase(App);

  const getAllUserIdRef = ref(firebaseDatabase, "Streaming/" + roomId);
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
    if (userId === AllUserIds) return;

    const updateStreamChildRef = ref(
      firebaseDatabase,
      `users/${AllUserIds}/Streaming`
    );
    const data = {
      title: item.title,
      artwork: item.artwork,
      artist: item.artist,
      url: `${streamingUrl}/stream?id=${item.videoId}`,
      videoId: item.videoId,
      duration: item.duration,
    };

    update(updateStreamChildRef, data);
  }
}
