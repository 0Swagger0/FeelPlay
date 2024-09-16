import {
  View,
  Text,
  TouchableOpacity,
  VirtualizedList,
  Image,
  TextInput,
  FlatList,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { useMMKVString } from "react-native-mmkv";
import { App } from "../FirebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { BounceIn } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";

export default function GroupListnerChats({ route }) {
  const [backgroundImage, setBackgroundImage] = useState("");
  // naviation
  const [userId] = useMMKVString("userId");
  const navigation = useNavigation();
  const firebaseDatabase = getDatabase(App);
  const [RoomConnectedTo] = useMMKVString("RoomConnectedTo");
  const [HostName, setHostName] = useState("");
  const [Message, setMessage] = useState("");
  const [userfirstname] = useMMKVString("userfirstname");
  const [ListenerChatsData, setListenerChatsData] = useState([]);

  // ref
  const scrollRef = useRef();

  // get image url from track player event
  // currentSongData change event for currentSongData details
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (
      event.type == Event.PlaybackActiveTrackChanged &&
      event.track !== null
    ) {
      const { artwork } = event.track;
      if (artwork != null && artwork != "") {
        setBackgroundImage(artwork);
      }
    }
  });

  // get host name
  useEffect(() => {
    function getHostName() {
      if (RoomConnectedTo == undefined) {
        const getHostNameRef = ref(firebaseDatabase, "users/" + userId);
        onValue(getHostNameRef, (snaspshort) => {
          const hostName = snaspshort.child("FirstName").val();
          if (hostName) {
            setHostName(hostName);
          }
        });
      } else {
        const getHostNameRef = ref(
          firebaseDatabase,
          "users/" + RoomConnectedTo
        );
        onValue(getHostNameRef, (snaspshort) => {
          const hostName = snaspshort.child("FirstName").val();
          if (hostName) {
            setHostName(hostName);
          }
        });
      }
    }

    // get all chat data
    function getChatData() {
      if (RoomConnectedTo == undefined) {
        const getChatRef = ref(firebaseDatabase, "ListenersChats/" + userId);
        onValue(getChatRef, (snaspshort) => {
          setListenerChatsData([]);
          snaspshort.forEach((data) => {
            const chatData = data.val();
            if (chatData) {
              setListenerChatsData((pre) => [...pre, chatData]);
            }
          });
        });
      } else {
        const getChatRef = ref(
          firebaseDatabase,
          "ListenersChats/" + RoomConnectedTo
        );
        onValue(getChatRef, (snaspshort) => {
          setListenerChatsData([]);
          snaspshort.forEach((data) => {
            const chatData = data.val();
            if (chatData) {
              setListenerChatsData((pre) => [...pre, chatData]);
            }
          });
        });
      }
    }

    // load chats
    getBackgrounImage();
    getChatData();
    getHostName();
  }, []);

  // get backgroun image
  async function getBackgrounImage() {
    const trackDetail = await TrackPlayer.getActiveTrack();
    if (trackDetail != null) {
      setBackgroundImage(trackDetail.artwork);
    }
  }

  // send message
  function sendMessage() {
    // id as a time
    const time = new Date().valueOf();

    const messageData = {
      id: time,
      name: userfirstname,
      message: Message,
      senderId: userId,
      time: time,
    };

    // create child
    if (RoomConnectedTo == undefined) {
      const createMessageChildRef = ref(
        firebaseDatabase,
        "ListenersChats/" + userId + "/" + time
      );
      set(createMessageChildRef, messageData).then(() => {
        scrollRef.current.scrollToEnd({ animated: true });
        // set empty state
        setMessage("");
      });
    } else {
      const createMessageChildRef = ref(
        firebaseDatabase,
        "ListenersChats/" + RoomConnectedTo + "/" + time
      );
      set(createMessageChildRef, messageData).then(() => {
        scrollRef.current.scrollToEnd({ animated: true });
        // set empty state
        setMessage("");
      });
    }
  }

  // render group chats
  function renderGroupChats({ item, index }) {
    const time = new Date(item.time);

    const hourTime = time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return (
      <View className="flex-col mx-1 mb-[2px] mt-[2px]" key={index}>
        <StatusBar translucent style="light" />
        <View className="flex-col">
          {item.senderId == userId ? (
            <View className="flex-col max-w-[250px] self-end bg-gray-700 p-2 rounded-l-[15px]">
              <Text className="text-white text-xs font-[Raleway-Light]">
                Me*
              </Text>

              <Text className="text-white mt-1 font-[Raleway-SemiBold] text-[13px]">
                {item.message}
              </Text>
              <Text className="text-white font-[Raleway-Light] text-[10px] self-end mt-1">
                {hourTime}
              </Text>
            </View>
          ) : (
            <View className="flex-col max-w-[250px]  self-start bg-black p-2 rounded-r-[15px] border-gray-700 border-x-[0.5px] border-y-[0.5px]">
              {item.senderId == RoomConnectedTo ? (
                <Text className="text-white text-xs font-[Raleway-Light]">
                  {item.name + " (Host)"}
                </Text>
              ) : (
                <Text className="text-white text-xs font-[Raleway-Light]">
                  {item.name}
                </Text>
              )}
              <Text className="text-white mt-1 font-[Raleway-SemiBold] text-[13px]">
                {item.message}
              </Text>
              <Text className="text-white font-[Raleway-Light] text-[10px] self-end mt-1">
                {hourTime}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-col flex-1 justify-between bg-black">
      <StatusBar translucent barStyle="light-content" />
      {/* tool bar */}
      <View className="flex-row p-2 bg-[#D90026] items-center">
        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 30,
            backgroundColor: "black",
            opacity: 0.5,
            alignSelf: "flex-start",
            marginTop: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="white" />
        </TouchableOpacity>

        {/*title  */}
        <View className="flex-col mt-5">
          <Text className="text-white text-[17px] font-[Raleway-Bold] ml-3">
            Listeners Chats
          </Text>

          <Text className="text-white text-[13px] font-[Raleway-SemiBold] ml-3 mt-1">
            Host : {HostName}
          </Text>
        </View>
      </View>

      {/* backgroung linergradient image and color */}

      <View className="flex-1 flex-col mb-2">
        <Image height={"100%"} source={{ uri: backgroundImage }} />
        <LinearGradient
          start={{ x: 0.5, y: 0.9 }}
          end={{ x: 2, y: 0 }}
          colors={[
            "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
            "transparent",
          ]}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            justifyContent: "flex-end",
          }}
        >
          {/* flatlist of chats */}
          <FlashList
            ref={scrollRef}
            estimatedItemSize={88}
            data={ListenerChatsData}
            renderItem={renderGroupChats}
            keyboardShouldPersistTaps="always"
          />
        </LinearGradient>
      </View>
      {/* text input and button */}
      <View className="flex-row items-center mb-2 mr-1 ml-2">
        <View className="flex-1 items-center flex-row justify-between rounded-r-[20px] rounded-l-[10px] bg-gray-700 p-1">
          <TextInput
            placeholder="Type message..."
            placeholderTextColor="white"
            multiline
            value={Message}
            onChangeText={(text) => setMessage(text)}
            style={{
              color: "white",
              fontFamily: "Raleway-Regular",
              padding: 5,
              maxWidth: "100%",
              width: "85%",
              maxHeight: 70,
            }}
          />
          {/* send button */}
          <Animated.View entering={BounceIn}>
            {Message != "" ? (
              <TouchableOpacity
                style={{
                  padding: 7,
                  borderColor: "white",
                  borderWidth: 0.5,
                  borderRadius: 20,
                }}
                onPress={sendMessage}
              >
                <MaterialIcons name="send" color="white" size={20} />
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
