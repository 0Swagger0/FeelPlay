import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { storage } from "../components/Data/LocalStorage";
export default function RemoveAllStreamRelatedThings() {
  // firebase databse
  const firebaseDatabase = getDatabase(App);
  const userId = storage.getString("userId");

  const removeStreamChildRef = ref(
    firebaseDatabase,
    "users/" + userId + "/" + "Streaming"
  );
  remove(removeStreamChildRef);

  // remove Stream child from current user
  const removeStreamRoomIdRef = ref(firebaseDatabase, "Streaming/" + userId);
  remove(removeStreamRoomIdRef);

  // remove listeners chats
  const removeListenerChatRef = ref(
    firebaseDatabase,
    "ListenersChats/" + userId
  );
  remove(removeListenerChatRef);
}
