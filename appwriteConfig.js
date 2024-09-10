import { Account, Client, Databases } from "appwrite";
const client = new Client();

export const DATABASE_USERS_ID = "64e9f15178c61debb9fb";

// user playlist collection
export const COLLECTION_USER_PLAYLIST_ID = "64e9f1939605da804a64";
export const USER_RECENTLY_PLAYED_COLLECTION_ID = "66a60746001fdc5bee7c";

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("648f5e20288beef91b21");

export const database = new Databases(client);
export const account = new Account(client);
export default client;
