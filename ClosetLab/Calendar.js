import { SafeAreaView } from "react-native-web"
import { Text } from "react-native"
import styles from "./Stylesheet"

export function CalendarView() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Hello, [USER]!</Text>
        </SafeAreaView>
    )
}