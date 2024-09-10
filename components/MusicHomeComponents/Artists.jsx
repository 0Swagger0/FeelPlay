import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { UserPlayListData } from "../Data/LoadAllSongDataForSeacrh";

function Artists({ userId }) {
  // loacal data for ui
  const navigation = useNavigation();
  const [PlayListData, setPlayListData] = useState([]);
  const [ArtistListData, setArtistListData] = useState([]);

  // load playList
  useEffect(() => {
    // load current user play list
    async function loadUserPlayList() {
      const playListData = await UserPlayListData(userId);
      playListData.map((data) => {
        if (data.playListImage == null) {
          setPlayListData((pre) => [...pre, data]);
        }
      });
    }
    loadUserPlayList();
  }, [userId]);
  // all artists data
  const AllArtistsData = [
    {
      id: 1,
      image: "https://c.saavncdn.com/artists/Ed_Sheeran_500x500.jpg",
      title: "Ed Sheeran",
    },
    {
      id: 2,
      image:
        "https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg",
      title: "AR Rahman",
    },
    {
      id: 4,
      image:
        "https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg",
      title: "Arijit singh",
    },
    {
      id: 5,
      image:
        "https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20221216102650_500x500.jpg",
      title: "Honey Singh",
    },
    {
      id: 6,
      image: "https://c.saavncdn.com/artists/The_Weeknd_500x500.jpg",
      title: "The Weeknd",
    },
    {
      id: 7,
      image:
        "https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg",
      title: "Justin Beeber",
    },
    {
      id: 8,
      image:
        "https://c.saavncdn.com/artists/Badshah_005_20230608084021_500x500.jpg",
      title: "Badshah",
    },
    {
      id: 9,
      image:
        "https://c.saavncdn.com/artists/Neha_Kakkar_006_20200822042626_500x500.jpg",
      title: "Neha Kakker",
    },
    {
      id: 10,
      image: "https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg",
      title: "Atif Aslam",
    },
    {
      id: 11,
      image: "https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg",
      title: "Sonu Nigam",
    },
    {
      id: 12,
      image: "https://c.saavncdn.com/artists/Sanam_Puri_500x500.jpg",
      title: "Sanam puri",
    },
    {
      id: 13,
      image:
        "https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg",
      title: "Raftaar",
    },
    {
      id: 14,
      image:
        "https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg",
      title: "Taylor Swift",
    },
    {
      id: 15,
      image:
        "https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg",
      title: "Dua Lipa",
    },
    {
      id: 16,
      image:
        "https://c.saavncdn.com/707/Happier-Than-Ever-English-2021-20210730053930-500x500.jpg",
      title: "Billie Eilish",
    },
    {
      id: 17,
      image: "https://c.saavncdn.com/artists/Zayn_Malik_500x500.jpg",
      title: "Zayn",
    },
    {
      id: 18,
      image:
        "https://c.saavncdn.com/artists/Selena_Gomez_003_20231023065157_500x500.jpg",
      title: "Selena Gomez",
    },
    {
      id: 19,
      image:
        "https://c.saavncdn.com/artists/Anne-Marie_20190923095331_500x500.jpg",
      title: "Anne Marie",
    },
    {
      id: 20,
      image:
        "https://c.saavncdn.com/artists/Halsey_002_20231227080519_500x500.jpg",
      title: "Halsey",
    },
    {
      id: 21,
      image:
        "https://c.saavncdn.com/artists/Ariana_Grande_005_20201127111716_500x500.jpg",
      title: "Ariana Grande",
    },
  ];

  useEffect(() => {
    const randomArtistList = shuffleArray(AllArtistsData);
    setArtistListData(randomArtistList);
  }, []);

  // shuffle array
  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // play artists music
  function seeAllArtistsPageRedirect() {
    navigation.navigate("SeeAllArtists", {
      userId: userId,
      PlayListData: PlayListData,
    });
  }

  // redirect to artists play list
  function redirectToArtistsPlayList(data) {
    navigation.navigate("ArtistsPlayList", {
      userId: userId,
      title: data.title,
      pageImage: data.image,
      PlayListData: PlayListData,
    });
  }

  // rencently played flatlist
  const ArtistsFlatList = ({ item, index }) => {
    return (
      <View className="flex-col mr-2" key={index}>
        <TouchableOpacity onPress={() => redirectToArtistsPlayList(item)}>
          <Image
            source={{ uri: item.image }}
            style={{
              height: 100,
              width: 100,
              borderRadius: 50,
              shadowColor: "black",
              shadowOpacity: 0.3,
            }}
          />
          <LinearGradient
            style={{
              position: "absolute",
              height: 100,
              width: 100,
              borderRadius: 5,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0.1 }}
            colors={[
              "linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%)",
              "transparent",
            ]}
          >
            <Text
              style={{
                fontFamily: "Raleway-Bold",
                color: "white",
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              {item.title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View className="m-1">
      <View className=" flex-1 flex-row justify-between items-center  mt-2 mb-2">
        <Text className="text-white font-[Raleway-Bold] text-[20px]">
          Artists
        </Text>
        <TouchableOpacity onPress={seeAllArtistsPageRedirect}>
          <View className="px-2 py-1 bg-gray-900 rounded-[20px]">
            <Text className="text-white font-[Raleway] text-[10px]">
              View all
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        overScrollMode="never"
        scrollToOverflowEnabled={false}
        showsHorizontalScrollIndicator={false}
        maxToRenderPerBatch={16}
        data={ArtistListData.slice(0, 10)}
        keyExtractor={(item) => item.id}
        renderItem={ArtistsFlatList}
      />
    </View>
  );
}
export default memo(Artists);
