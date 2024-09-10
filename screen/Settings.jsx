import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { account } from "../appwriteConfig";
import { useToast } from "react-native-toast-notifications";
import { useNavigation } from "@react-navigation/native";
import TrackPlayer from "react-native-track-player";
import { storage } from "../components/Data/LocalStorage";
import { StatusBar } from "expo-status-bar";

export default function Settings() {
  // toat message
  const toast = useToast();
  const navigation = useNavigation();

  // log out user
  function LogOutUser() {
    account.deleteSession("current").then(() => {
      toast.show("User Logouted", {
        type: "success",
        placement: "top",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    });

    TrackPlayer.stop();
    storage.delete("userphonenumber");
    navigation.replace("Login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 2 }}>
      <StatusBar translucent style="light" />
      <View className="flex-col p-2">
        {/* back arrow */}
        <View className="flex-row items-center mt-5">
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
          <Text className="text-white font-[Raleway-Bold] text-lg ml-3">
            Settings
          </Text>
        </View>

        {/* Select option list */}
        <View className="bg-gray-900 mt-3">
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 50,
            }}
            onPress={LogOutUser}
          >
            <MaterialIcons
              style={{ marginLeft: 10 }}
              name="logout"
              color="white"
              size={25}
            />
            <Text className="text-white text-base font-[Raleway-SemiBold] ml-2">
              LogOut
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* develop by swagger */}
      <View
        style={{
          flex: 2,
          width: "100%",
          padding: 5,
          justifyContent: "flex-end",
          alignItems: "center",
          alignSelf: "flex-end",
          flexDirection: "column",
        }}
      >
        <Text className="text-xs font-[Raleway-Regular] text-white ">
          Develop by Swagger v0.1
        </Text>
      </View>
    </View>
  );
}
