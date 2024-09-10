import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { account } from "../appwriteConfig";
import { ID } from "appwrite";
import { useToast } from "react-native-toast-notifications";
import { storage } from "../components/Data/LocalStorage";
import { useMMKVString } from "react-native-mmkv";

export default function Login({ navigation }) {
  const toast = useToast();
  const { width, height } = Dimensions.get("window");
  const [userId, setUserId] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [userPhoneNumber, setuserPhoneNumber] = useState("");
  const [InputOTPVisible, setOTPInputVisibale] = useState(false);

  // user variable
  const [userFirstName] = useMMKVString("userfirstname");

  // check phone number
  function checkingPhoneNumber() {
    if (userPhoneNumber.length == 10) {
      gettingPhoneNumber();
    } else {
      toast.show("Please enter a valid number :(", {
        type: "success",
        placement: "top",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    }
  }

  // getting phone number'
  function gettingPhoneNumber() {
    const promise = account.createPhoneToken(
      ID.unique(),
      "+91" + userPhoneNumber
    );
    promise.then(
      function (response) {
        setOTPInputVisibale(true);
        toast.show("OTP send successfully", {
          type: "success",
          placement: "top",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
          successColor: "#D90026",
        });
        setUserId(response.userId);
      },
      function (error) {
        console.log(error);
      }
    );
  }

  // getting phone number'
  async function verifyPhoneNumber() {
    if (secretCode.length == 6) {
      account
        .createSession(userId, secretCode)
        .then(() => {
          toast.show("Login successfully", {
            type: "success",
            placement: "center",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
            successColor: "#D90026",
          });
          // set phone number and user id to local storage
          storage.set("userphonenumber", userPhoneNumber);
          storage.set("userId", userId);

          // check iff user name exist
          if (userFirstName == undefined) {
            navigation.replace("UserDetails");
          } else {
            navigation.replace("BottomNavigater");
          }
        })

        .catch((error) => {
          toast.show("wrong otp", {
            type: "warning",
            placement: "top",
            duration: 4000,
            offset: 30,
            animationType: "slide-in",
            successColor: "#D90026",
          });
          console.log(error);
        });
    } else {
      toast.show("Please enter a valid OTP", {
        type: "success",
        placement: "top",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
        successColor: "#D90026",
      });
    }
  }

  return (
    <ImageBackground
      source={require("../Images/ARRahman.jpg")}
      className="flex-1"
    >
      <LinearGradient
        start={{ x: 0.1, y: 0.4 }}
        end={{ x: 0.1, y: 0 }}
        style={{
          height: height,
          width: width,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          display: "flex",
        }}
        colors={[
          "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
          "transparent",
        ]}
      >
        <View className="flex-col items-center p-2 w-[`${width}`]">
          {InputOTPVisible == true ? (
            <Animated.View>
              <Text
                style={{
                  fontFamily: "Raleway-Bold",
                  color: "white",
                  fontSize: 30,
                  marginRight: 30,
                }}
              >
                Enter the OTP
              </Text>

              <View
                style={{
                  justifyContent: "center",
                  padding: 7,
                  borderRadius: 7,
                  borderWidth: 1,
                  marginTop: 15,
                  borderColor: "gray",
                  flexDirection: "row",
                }}
              >
                <TextInput
                  maxLength={6}
                  placeholderTextColor="gray"
                  placeholder="OTP"
                  inputMode="numeric"
                  value={secretCode}
                  style={{
                    width: "70%",
                    margin: 1,
                    padding: 1,
                    fontFamily: "Raleway-Bold",
                    fontSize: 20,
                    color: "gray",
                    textAlign: "center",
                    alignSelf: "center",
                  }}
                  onChangeText={(text) => setSecretCode(text)}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View className="flex-col">
              <Text
                style={{
                  fontFamily: "Raleway-Bold",
                  color: "white",
                  fontSize: 30,
                  marginRight: 30,
                }}
              >
                Login with phone
              </Text>

              <View
                style={{
                  justifyContent: "center",
                  padding: 7,
                  borderRadius: 7,
                  borderWidth: 1,
                  marginTop: 15,
                  borderColor: "gray",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Raleway-Bold",
                    color: "white",
                    fontSize: 25,
                    marginRight: 5,
                  }}
                >
                  +91 |
                </Text>
                <TextInput
                  maxLength={10}
                  placeholderTextColor="gray"
                  placeholder="Enter phone number"
                  inputMode="numeric"
                  value={userPhoneNumber}
                  style={{
                    width: "70%",
                    margin: 1,
                    padding: 1,
                    fontFamily: "Raleway-Bold",
                    fontSize: 20,
                    color: "gray",
                  }}
                  onChangeText={(text) => setuserPhoneNumber(text)}
                />
              </View>
              <Text
                style={{
                  fontFamily: "Raleway-Light",
                  color: "white",
                  fontSize: 10,
                  width: "70%",
                  alignSelf: "flex-start",
                  marginTop: 7,
                  marginLeft: 10,
                }}
              >
                We will send you OTP to given number !
              </Text>
            </Animated.View>
          )}
        </View>
        {InputOTPVisible == true ? (
          <TouchableOpacity
            className="p-4 mt-2 bg-[#D90026] w-72 items-center self-center rounded-md"
            onPress={verifyPhoneNumber}
          >
            <Text
              style={{
                fontFamily: "Raleway-Bold",
                fontSize: 15,
                color: "white",
              }}
            >
              Verify OTP
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="p-4 mt-2 bg-[#D90026] w-72 items-center self-center rounded-md"
            onPress={checkingPhoneNumber}
          >
            <Text
              style={{
                fontFamily: "Raleway-Bold",
                fontSize: 15,
                color: "white",
              }}
            >
              Get OTP
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}
