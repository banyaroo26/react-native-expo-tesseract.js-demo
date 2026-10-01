import { Redirect } from "expo-router";

export default function Index() {
  /*
  useEffect(() => {
    nodejs.start("main.js");
    nodejs.channel.addListener("message", (msg: any) => {
      alert("From node: " + msg);
    });
  }, []);
  */
  return <Redirect href="/ocr/camera" />;
}
