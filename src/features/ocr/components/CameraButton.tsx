import Camera from "@/assets/icons/ui/camera.svg";
import { theme } from "@/theme/theme";
import { Pressable, StyleSheet } from "react-native";

type CameraButtonProps = {
  onPress: () => void;
};

export function CameraButton({ onPress }: CameraButtonProps) {
  return (
    <Pressable style={styles.cameraButton} onPress={onPress}>
      <Camera width={32} height={32} color={theme.colors.black} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    alignItems: "center",
    justifyContent: "center",

    width: 75,
    height: 75,
    borderRadius: 120,
    borderWidth: 4,

    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
  },
});
