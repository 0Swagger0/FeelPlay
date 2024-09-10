import { ID, Query } from "appwrite";
import {
  DATABASE_USERS_ID,
  USER_RECENTLY_PLAYED_COLLECTION_ID,
  database,
} from "../appwriteConfig";
import TrackPlayer from "react-native-track-player";
import { storage } from "../components/Data/LocalStorage";

// function call
export default async function CheckTheTrackExistInRecentlyPlayed({ videoId }) {
  // track details
  const track = await TrackPlayer.getActiveTrack();
  const userId = storage.getString("userId");
  const currentvideoId = track.videoId;
  const artist = track.artist;
  const artwork = track.artwork;
  const currentTitle = track.title;
  const url = track.url;
  const duration = track.duration;

  // check if title exist in recently list
  await database
    .listDocuments(DATABASE_USERS_ID, USER_RECENTLY_PLAYED_COLLECTION_ID, [
      Query.equal("userId", [userId]),
      Query.equal("videoId", [currentvideoId]),
    ])
    .then((data) => {
      if (data.total == 0) {
        createRecentlyPlayed();
      } else {
        deletSongAndCreateInRecentPlayed(data.documents);
      }
    });

  async function createRecentlyPlayed() {
    const recentlyData = {
      videoId: currentvideoId,
      title: currentTitle,
      artist: artist,
      artwork: artwork,
      url: url,
      duration: duration,
      userId: userId,
    };

    await database.createDocument(
      DATABASE_USERS_ID,
      USER_RECENTLY_PLAYED_COLLECTION_ID,
      ID.unique(),
      recentlyData
    );
  }

  // delete song and create in recent plyed
  async function deletSongAndCreateInRecentPlayed(songData) {
    const documentId = songData.map((data) => data.$id);
    console.log(documentId);
    await database
      .deleteDocument(
        DATABASE_USERS_ID,
        USER_RECENTLY_PLAYED_COLLECTION_ID,
        ...documentId
      )
      .then(() => createRecentlyPlayed());
  }
}
