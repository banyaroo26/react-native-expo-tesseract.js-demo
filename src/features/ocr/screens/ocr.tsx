import {
  OcrWebView,
  OcrWebViewRef,
  TextBlock,
} from "@/features/ocr/components/OcrWebView";
import { theme } from "@/theme/theme";
import { File } from "expo-file-system";
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from 'react-native';

export default function OcrScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const ocrRef = useRef<OcrWebViewRef>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ocrResults, setOcrResults] = useState<TextBlock[]>([]);
  const [ocrText, setOcrText] = useState<string>("");

  useEffect(() => {
    if (imageUri) {
      processStoreImage();
    }
  }, [imageUri])

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const processStoreImage = async (): Promise<void> => {
    if (!imageUri) {
      return;
    }

    try {
      let formattedImageInput = imageUri;
      
      setLoading(true);
      setOcrResults([]);
      setOcrText("");

      // Convert local file:// URIs to Base64 using the Expo File API
      if (imageUri.startsWith("file://")) {
        const file = new File(imageUri);
        const base64Data = await file.base64();
        formattedImageInput = `data:image/jpeg;base64,${base64Data}`;
      }

      // Run recognition via ref
      if (ocrRef.current) {
        const results: TextBlock[] =
          await ocrRef.current.recognize(formattedImageInput);
        
        // Store output bounding boxes coordinates & text
        setOcrResults(results);
        console.log(ocrResults);

        const text = results.map((result) => result.text).join(" ");
        setOcrText(text);
      }
    } catch (error) {
      console.error("Failed to recognize text from store image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hidden OCR Engine */}
      <OcrWebView ref={ocrRef} />
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <View style={styles.imageContainer}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      </View>
      {loading && <Text style={styles.waitText}>Please wait...</Text>}
      {
        ocrText && 
          <View style={styles.textContainer}>
            <Text>{ocrText}</Text>
          </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  imageContainer: {
    marginTop: 30,
  },

  textContainer: {
    marginTop: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.black,
  },

  waitText: {
    marginTop: 20,
  },

  image: {
    width: 200,
    height: 200,
  },
});
