import { Query } from "appwrite";
import {
  COLLECTION_USER_PLAYLIST_ID,
  DATABASE_USERS_ID,
  database,
} from "../../appwriteConfig";

// user playlist data
export async function UserPlayListData(userId) {
  const userPlayListData = await database.listDocuments(
    DATABASE_USERS_ID,
    COLLECTION_USER_PLAYLIST_ID,
    [Query.equal("userId", userId), Query.limit(500)]
  );
  return userPlayListData.documents;
}
