import { useProgress } from "react-native-track-player";

export default async function DurationAndPosition() {
  const position = useProgress();
  return position.duration;
}
