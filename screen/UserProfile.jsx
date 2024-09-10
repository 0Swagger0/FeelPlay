import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { useToast } from "react-native-toast-notifications";
import {
  COLLECTION_USER_PLAYLIST_ID,
  DATABASE_USERS_ID,
  account,
  database,
} from "../appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import { App } from "../FirebaseConfig";
import LottieView from "lottie-react-native";
import { useMMKVString } from "react-native-mmkv";

export default function UserProfile({ navigation, route }) {
  // variables
  const bottomSheetRef = useRef(null);
  const [visibleModel, setvisibleModel] = useState(false);
  const [userData, setUserData] = useState({});
  const [userId, setUserId] = useState("");
  const [playListText, setPlayListText] = useState("");
  const [PlayListData, setPlayListData] = useState([]);
  // user details variable
  const [userFirstName] = useMMKVString("userfirstname");
  const [userLastName] = useMMKVString("userlastname");

  // firebase database
  const firebaseDatabase = getDatabase(App);

  // toast
  const toast = useToast();
  // model variable
  const [selectedPlayListText, setselectedPlayListText] = useState({});
  const [checkPlayListDataLoaded, setcheckPlayListDataLoaded] = useState(true);

  useEffect(() => {
    getUserDetails();
  }, [route]);

  // load current user info
  async function getUserDetails() {
    try {
      await account.get().then((data) => {
        setUserData(data);
        setUserId(data.$id);
        loadUserPlayList(data.$id);
      });
    } catch (error) {
      console.log(error);
    }
  }

  // // user name and details
  // function gettingUserFirstAndLastName() {
  //   // firebase user account name details
  //   const gettinguserDetailsRef = ref(
  //     firebaseDatabase,
  //     "users/" + userId + "/"
  //   );
  //   onValue(gettinguserDetailsRef, (snapshort) => {
  //     // user first and last name
  //     const userfirstname = snapshort.child("FirstName").val();
  //     const userlastname = snapshort.child("LastName").val();
  //     if (userfirstname != null && userlastname != null) {
  //       setUserFirstName(userfirstname);
  //       setUserLastName(userlastname);
  //     }
  //   });
  // }

  // load current user play list
  async function loadUserPlayList(currentUserId) {
    try {
      const loadPlayListData = database.listDocuments(
        DATABASE_USERS_ID,
        COLLECTION_USER_PLAYLIST_ID,
        [Query.equal("userId", currentUserId)]
      );

      loadPlayListData.then((data) => {
        setPlayListData(data.documents);
        setcheckPlayListDataLoaded(false);
      });
    } catch (error) {
      console.log(error);
    }
  }

  // redirect to selected play list
  function redirectToSelectedPlayList(item) {
    if (item.playListImage == null) {
      navigation.navigate("UserPlayList", {
        playListName: item.playListName,
        userId: userId,
        PlayListData: PlayListData,
      });
    } else {
      navigation.navigate("SeeAllSongsPlayList", {
        pageTitle: "Hindi Romance",
        collectinId: item.collection_id,
        databaseId: item.database_id,
        SongPlayListData: "",
        userId: userId,
        PageImage: item.playListImage,
      });
    }
  }
  // remove play list
  function removePlayList(item) {
    setselectedPlayListText(item);
    setvisibleModel(true);
  }

  // remove playe list function
  function removePlayListFromDatabase() {
    const removePlayList = database.deleteDocument(
      DATABASE_USERS_ID,
      COLLECTION_USER_PLAYLIST_ID,
      selectedPlayListText.$id
    );
    removePlayList.then(() => {
      toast.show(selectedPlayListText.playListName + " playList removed", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      removePlayListFromFirebase();
      setvisibleModel(false);
      getUserDetails();
    });
  }

  // remove from firebase
  function removePlayListFromFirebase() {
    const removePlayListRef = ref(
      firebaseDatabase,
      "users/" + userId + "/" + selectedPlayListText.playListName
    );
    remove(removePlayListRef);
  }

  // check playlist input
  function checkPlayListInput() {
    if (playListText == "") {
      toast.show("Please enter the name of playlist", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    } else {
      const createDocument = database.createDocument(
        DATABASE_USERS_ID,
        COLLECTION_USER_PLAYLIST_ID,
        ID.unique(),
        {
          userId: userId,
          playListName: playListText,
        },
        [Permission.read(Role.any()), Permission.update(Role.any())]
      );
      createDocument.then(() => {
        toast.show(playListText + " created", {
          type: "success",
          placement: "center",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
        getUserDetails();
        setPlayListText("");
        bottomSheetRef.current.close();
      });
    }
  }

  // open bottom sheet
  function openBottomSheet() {
    bottomSheetRef.current.open();
  }

  // redirect to like playlist
  function redirectToLikePlayList() {
    navigation.navigate("LikePlayList", {
      userId: userId,
      PlayListData: PlayListData,
    });
  }

  // render playlist flatlist
  function renderPlayListFlatlist({ item, index }) {
    return (
      <View className="flex-col mb-2 mx-2" key={index}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#020819",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "80%",
            }}
            onPress={() => redirectToSelectedPlayList(item)}
          >
            {item.playListImage == null ? (
              <Entypo
                name="music"
                size={40}
                color="white"
                style={{
                  backgroundColor: "#D90026",
                  padding: 10,
                  borderRadius: 7,
                }}
              />
            ) : (
              <Image
                source={{ uri: item.playListImage }}
                height={60}
                width={60}
                style={{ borderWidth: 0.5, borderColor: "white" }}
              />
            )}

            <Text className="text-white font-bold ml-5">
              {item.playListName}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignSelf: "center", margin: 2 }}
            onPress={() => removePlayList(item)}
          >
            <MaterialIcons name="highlight-remove" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // render footer componet
  function renderFooter() {
    return (
      <View className="flex-col  mx-2 mb-11">
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 7,
          }}
          onPress={openBottomSheet}
        >
          <Entypo
            name="folder-music"
            size={40}
            color="white"
            style={{
              backgroundColor: "#D90026",
              padding: 10,
              borderTopLeftRadius: 7,
            }}
          />

          <Text className="text-gray-900 font-bold ml-5">+ Add playlist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // loding component
  if (checkPlayListDataLoaded) {
    return (
      <View className="flex-1 bg-black flex-col justify-center">
        <View className="flex-row self-center">
          <LottieView
            source={require("../LottiAnimation/loading.json")}
            style={{ height: 100, width: 100 }}
            autoPlay
            loop
          />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-col flex-1 bg-black">
      <View>
        <View className="flex-col">
          <Image
            style={{ width: "100%", height: 200 }}
            source={require("../Images/nainoa.jpg")}
          />
          <View
            style={{
              position: "absolute",
              marginHorizontal: 10,
              marginTop: 30,
            }}
          >
            <Text
              style={{
                fontFamily: "Raleway-SemiBold",
                color: "white",
                fontSize: 20,
              }}
            >
              user{userId}
            </Text>
            {userFirstName != "" ? (
              <Text
                style={{
                  fontFamily: "Raleway-SemiBold",
                  color: "white",
                  marginTop: 5,
                  fontSize: 15,
                }}
              >
                {userFirstName + " " + userLastName}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-col mx-2">
          <Text
            style={{
              fontFamily: "Raleway-SemiBold",
              color: "white",
              fontSize: 22,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            Playlist
          </Text>
          <View className="flex-col">
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#020819",
              }}
              onPress={redirectToLikePlayList}
            >
              <AntDesign
                name="heart"
                size={40}
                color="white"
                style={{ backgroundColor: "#D90026", padding: 10 }}
              />
              <Text className="text-white font-bold ml-5">Like Playlist</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* model */}
        <Modal
          visible={visibleModel}
          style={{ alignSelf: "center" }}
          animationType={"fade"}
          aria-disabled={true}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(52, 52, 52, 0.8)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View className="flex-col bg-black rounded-[10px] p-2">
              <View className="flex-col p-2">
                <Text className="text-white text-sm font-[Raleway-Bold]">
                  Are you sure to remove {selectedPlayListText.playListName}{" "}
                  playList ?
                </Text>

                <View className="flex-row mt-3">
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#D90026",
                      padding: 10,
                      justifyContent: "center",
                      borderRadius: 5,
                    }}
                    onPress={removePlayListFromDatabase}
                  >
                    <Text className="text-white font-[Raleway-SemiBold]">
                      Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#D90026",
                      padding: 10,
                      justifyContent: "center",
                      borderRadius: 5,
                      marginLeft: 10,
                    }}
                    onPress={() => setvisibleModel(false)}
                  >
                    <Text className="text-white font-[Raleway-SemiBold]">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <FlatList
        style={{ marginTop: 10 }}
        data={PlayListData}
        initialNumToRender={16}
        renderItem={renderPlayListFlatlist}
        ListFooterComponent={renderFooter}
      />
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        animationType="slide"
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "white",
          },
          container: {
            backgroundColor: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <View className="flex-col items-center">
          <View className="flex-col">
            <Text
              style={{
                fontFamily: "Raleway-SemiBold",
                color: "white",
                fontSize: 17,
                marginVertical: 5,
              }}
            >
              + add playlist
            </Text>

            <View className="p-5 bg-[#D90026] flex-row w-[300px] rounded-[10px]">
              <TextInput
                placeholder="Name of playlist"
                placeholderTextColor="white"
                style={{
                  fontFamily: "Raleway-Bold",
                  color: "white",
                  width: 200,
                }}
                onChangeText={(text) => setPlayListText(text)}
              />
            </View>

            <TouchableOpacity
              style={{
                padding: 10,
                width: 130,
                backgroundColor: "#D90026",
                marginTop: 10,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={checkPlayListInput}
            >
              <Text className="text-white text-xs font-[Raleway-Bold]">
                + Add playlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
    </GestureHandlerRootView>
  );
}
