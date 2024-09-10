import {
  View,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useToast } from "react-native-toast-notifications";
import { App } from "../FirebaseConfig";
import { MMKV, useMMKVString } from "react-native-mmkv";
import { account } from "../appwriteConfig";

export default function UserDetails({ navigation }) {
  // variables
  const { width, height } = Dimensions.get("screen");

  const storage = new MMKV();

  // user details variable
  const [userId, setUserId] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLasttName, setUserLastName] = useState("");

  // firebase database
  const firebaseDatabase = getDatabase(App);

  // toast messages
  const toast = useToast();

  const videpRef = useRef(null);

  useEffect(() => {
    videpRef.current.playAsync();
    account.get().then((user) => {
      setUserId(user.$id);
      // set phone number locally
      storage.set("userphonenumber", user.phone);
    });

    // getting streaming url
    const getStreamingUrlRef = ref(firebaseDatabase, "streamingUrl");
    onValue(getStreamingUrlRef, (snapshort) => {
      const url = snapshort.child("url").val();
      if (url) {
        addSongToUserWhenFirstTime(url);
      }
    });
  }, []);

  // set some song to user when come first time to the app
  async function addSongToUserWhenFirstTime(url) {
    // getting url from ytcore server
    const baseUrlPython = `http://15.235.207.2`; // Use your local IP address

    const response = await fetch(`${baseUrlPython}/related?id=iP872SycxjI`);
    const json = await response.json();

    if (json.error) {
      throw new Error(json.error);
    }

    const { related } = json;

    const tracks = related.map((track, index) => ({
      id: index.toString(),
      url: `${url}/stream?id=${track.videoId}`,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
      videoId: track.videoId,
    }));

    // set song to local storage
    storage.set("user-queue", JSON.stringify(tracks));
  }

  // check input details
  function checkInputForUSerDetails() {
    if (userFirstName == "") {
      Alert.alert("", "Please enter first name");
    } else if (userFirstName.length <= 4) {
      Alert.alert("", "Enter valid first name");
    } else if (userLasttName == "") {
      Alert.alert("", "Please enter last name");
    } else if (userLasttName.length <= 4) {
      Alert.alert("", "Enter valid last name");
    } else {
      storeUserDetailsInDatabase();
    }
  }

  // store user details to database
  function storeUserDetailsInDatabase() {
    const storeUserDetailsRef = ref(firebaseDatabase, "users/" + userId);
    update(storeUserDetailsRef, {
      FirstName: userFirstName,
      LastName: userLasttName,
    }).then(() => {
      // store user data in local storage
      storage.set("userfirstname", userFirstName);
      storage.set("userlastname", userLasttName);
      // store user data in local storage

      toast.show("Details Saved", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
      setUserFirstName("");
      setUserLastName("");
      navigation.replace("BottomNavigater");
    });
  }

  return (
    <View>
      <Video
        isMuted
        isLooping
        ref={videpRef}
        source={require("../video/Welcome.mp4")}
        style={{ height: height, width: width }}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
      />

      {/* lineargradient */}
      <LinearGradient
        start={{ x: 0.2, y: 1 }}
        end={{ x: 2, y: 0.5 }}
        colors={[
          "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
          "transparent",
        ]}
        style={{
          height: height,
          width: width,
          position: "absolute",
        }}
      >
        <View className="flex-col p-2 shadow-red-300 mt-36">
          <View className="flex-col">
            <Text className="text-white text-[30px] font-[Raleway-Bold] ml-6">
              Enter your details
            </Text>
            <View className="flex-col mt-3">
              <View
                style={{
                  flexDirection: "column",
                  borderRadius: 5,
                  borderColor: "#D90026",
                  padding: 10,
                  borderWidth: 1,
                  marginHorizontal: 20,
                }}
              >
                <TextInput
                  placeholder="First name"
                  placeholderTextColor="white"
                  style={{
                    color: "white",
                    fontFamily: "Raleway-Bold",
                    fontSize: 16,
                  }}
                  onChangeText={(text) => setUserFirstName(text)}
                />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  borderRadius: 5,
                  borderColor: "#D90026",
                  padding: 10,
                  marginTop: 10,
                  borderWidth: 1,
                  marginHorizontal: 20,
                }}
              >
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor="white"
                  style={{
                    color: "white",
                    fontFamily: "Raleway-Bold",
                    fontSize: 16,
                  }}
                  onChangeText={(text) => setUserLastName(text)}
                />
              </View>
            </View>

            {/* submit button */}

            <TouchableOpacity
              style={{
                backgroundColor: "#D90026",
                padding: 10,
                marginHorizontal: 20,
                marginTop: 20,
                alignItems: "center",
                borderRadius: 5,
              }}
              onPress={checkInputForUSerDetails}
            >
              <Text className="text-white font-[Raleway-SemiBold] text-base">
                Let's play songs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
