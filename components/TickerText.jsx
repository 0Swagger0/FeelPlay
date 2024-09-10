import { View } from "react-native";
import TextTicker from "react-native-text-ticker";

export function TitleTicker({ title }) {
  return (
    <View>
      <TextTicker
        style={{
          fontSize: 24,
          fontFamily: "Raleway-Bold",
          color: "white",
          marginBottom: 7,
        }}
        duration={5000}
        scrollSpeed={5000}
        selectable={false}
        marqueeDelay={3000}
        repeatSpacer={10}
        animationType="auto"
        marqueeOnMount
      >
        {title}
      </TextTicker>
    </View>
  );
}

export function ArtistTicker({ artist }) {
  return (
    <View>
      <TextTicker
        style={{
          fontSize: 15,
          fontFamily: "Raleway-SemiBold",
          color: "white",
          marginBottom: 3,
          padding: 2,
        }}
        duration={5000}
        scrollSpeed={5000}
        marqueeDelay={3000}
        selectable={false}
        repeatSpacer={10}
        animationType="auto"
        marqueeOnMount
      >
        {artist}
      </TextTicker>
    </View>
  );
}
