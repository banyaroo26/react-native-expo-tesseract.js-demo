import { Redirect } from "expo-router";
import nodejs from "nodejs-mobile-react-native";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    nodejs.start("main.js");
    nodejs.channel.addListener("message", (msg: any) => {
      console.log("From node: " + msg);
    });
  }, []);
  
  return <Redirect href="/ocr/ocr" />;
}
