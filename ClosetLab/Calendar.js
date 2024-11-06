import { SafeAreaView } from "react-native-web"
import { Text } from "react-native"
import styles from "./Stylesheet"


const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarView() {

    const today = new Date()
    const cur_month = month[today.getMonth()]
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Hello, [USER]!</Text>
            <Text style={styles.text}>{cur_month}</Text>
        </SafeAreaView>
    )
}