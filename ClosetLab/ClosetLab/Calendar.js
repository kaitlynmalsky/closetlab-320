import { SafeAreaView, Text, View } from "react-native"
import styles from "./Stylesheet"


const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarView() {

    //suggested system for tracking user info: not implemented anywhere but here yet
    window.global_userInfo = {name: "DummyUser", _id:"67057228f80354e361ae2bf5"}

    const today = new Date()
    const cur_month = month[today.getMonth()]
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.title}>Hello, {window.global_userInfo.name}!</Text>
                <Text style={styles.text}>{cur_month}</Text>
            </View>
        </SafeAreaView>
    )
}

//