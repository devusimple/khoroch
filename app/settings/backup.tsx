import { font } from "@/utils/constant";
import { Pressable, Text, View } from "react-native";

export default function Backup() {
    return (
        <View style={{
            flex: 1,
            padding: 16,
            backgroundColor: '#fff',
        }}>
            <Pressable style={{
                backgroundColor: "#eee",
                borderRadius: 6,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Text style={{ fontFamily: font.HindSiliguri, fontSize: 16, fontWeight: "bold" }}>Select a folder</Text>
            </Pressable>
        </View>
    )
}