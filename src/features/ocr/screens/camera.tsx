import { CameraButton } from "@/features/ocr/components/CameraButton";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo.uri);
        console.log("Picture URI:", photo.uri);
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <CameraButton onPress={takePicture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  message: {
    textAlign: "center",
    paddingBottom: 10,
  },

  camera: {
    flex: 1,
  },

  buttonContainer: {
    position: "absolute",
    bottom: 64,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    paddingHorizontal: 64,

    backgroundColor: "transparent",
  },
});
