import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableNativeFeedback,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import { App } from "../FirebaseConfig";
import { useToast } from "react-native-toast-notifications";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import { storage } from "../components/Data/LocalStorage";
import { StatusBar } from "expo-status-bar";

export default function JoinStreaming() {
  // inpute variable
  const [RoomIdText, setRoomIdText] = useState("");
  const [userfirstname] = useMMKVString("userfirstname");
  const [RoomConnectedTo] = useMMKVString("RoomConnectedTo");
  const [connectedToStream] = useMMKVBoolean("connectedToStream");
  const [userId] = useMMKVString("userId");
  const [checkToRoomIdExist, setCheckToRoomIdExist] = useState(false);
  // navigation
  const navigation = useNavigation();
  // firebase database
  const firebaseDatabase = getDatabase(App);
  // toast message
  const toast = useToast();

  // check room id exist or not
  const checkRoomIdExistOrNote = () => {
    if (RoomIdText.length != 20) {
      toast.show("Invalid Room Id", {
        type: "success",
        placement: "center",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    } else {
      const checkRoomIdRef = ref(firebaseDatabase, "Streaming/" + RoomIdText);
      onValue(checkRoomIdRef, (snapshort) => {
        const check = snapshort.exists();
        if (check == true) {
          setCheckToRoomIdExist(true);
        } else {
          setCheckToRoomIdExist(false);
        }
      });
    }
  };

  // // check room id
  useCallback(() => {
    toast.show("Invalid Room Id", {
      type: "success",
      placement: "center",
      duration: 4000,
      offset: 30,
      animationType: "slide-in",
      successColor: "#D90026",
    });
  }, [checkToRoomIdExist]);

  // create streaming child
  useEffect(() => {
    const createStreamingRef = ref(
      firebaseDatabase,
      "Streaming/" + RoomIdText + "/" + userId.toString()
    );
    if (checkToRoomIdExist == true) {
      update(createStreamingRef, {
        userName: userfirstname,
        userId: userId,
      }).then(() => {
        // joined stream room
        toast.show("Successfully join", {
          type: "success",
          placement: "center",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });

        // set roomId to local storage
        storage.set("RoomConnectedTo", RoomIdText);
        storage.set("connectedToStream", true);

        // wait for host to play songs
        setTimeout(() => {
          toast.show("Wait for host to play songs", {
            type: "success",
            placement: "center",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
            successColor: "#D90026",
          });
        }, 1000);
      });
    }
  }, [checkToRoomIdExist]);

  // disconnect from stream
  function disconnectFromStream() {
    const disconnectRef = ref(
      firebaseDatabase,
      "Streaming/" + RoomConnectedTo + "/" + userId
    );
    remove(disconnectRef)
      .then(() => {
        toast.show("Disconnected from stream", {
          type: "success",
          placement: "center",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
      })
      .then(() => {
        // update values in local storage
        storage.set("connectedToStream", false);
        storage.delete("RoomConnectedTo");
        setCheckToRoomIdExist(false);
      });
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar translucent style="light" />
      {/* justify between */}
      <View className="flex-1 justify-between flex-col">
        {/* back arrow */}
        <View className="flex-col mt-7 ml-3">
          <TouchableOpacity
            style={{
              padding: 12,
              borderRadius: 30,
              backgroundColor: "gray",
              opacity: 0.5,
              alignSelf: "flex-start",
            }}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {/* back arrow */}

        {/* title text */}
        <View className="flex-1 flex-col p-4">
          <Text className="text-white text-[30px] font-[Raleway-Bold] max-w-[250px]">
            Listen songs with your friends
          </Text>
          {/* input for room id */}

          {connectedToStream == true ? (
            <TouchableOpacity
              style={{
                backgroundColor: "#D90026",
                padding: 17,
                borderRadius: 7,
                marginVertical: 15,
                marginHorizontal: 15,
                alignItems: "center",
              }}
              onPress={disconnectFromStream}
            >
              <Text className="text-white font-[Raleway-SemiBold] text-base">
                Disconnect to stream
              </Text>
            </TouchableOpacity>
          ) : (
            <View className=" mt-4 p-4 border-x-[0.5px] border-y-[0.5px] border-[#D90026] rounded-md">
              <TextInput
                style={{
                  color: "white",
                  fontFamily: "Raleway-SemiBold",
                  fontSize: 20,
                }}
                value={RoomIdText}
                placeholder="Enter Room Id"
                placeholderTextColor="white"
                onChangeText={(text) => setRoomIdText(text)}
              />
            </View>
          )}
        </View>

        {/* Button for check user id as a room id */}

        {connectedToStream == false ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#D90026",
              padding: 17,
              borderRadius: 7,
              marginVertical: 15,
              marginHorizontal: 15,
              alignItems: "center",
            }}
            onPress={checkRoomIdExistOrNote}
          >
            <Text className="text-white font-[Raleway-SemiBold] text-[15px]">
              Join to streaming
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
