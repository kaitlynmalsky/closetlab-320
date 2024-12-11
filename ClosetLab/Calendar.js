import React, { useState, useEffect, createElement } from 'react';
import { SafeAreaView, Text, View, Pressable, TextInput, StyleSheet, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Stylesheet';
import { OutfitListView } from './Outfits';
import { addOutfitToCalendar } from './OutfitAddToCalendar';
import { base_url, getAllOutfitsForUser, getOutfit } from './APIContainer';
import { ImageBackground } from 'react-native-web';



export function CalendarView() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [botModalVisible, setBotModalVisible] = useState(false);
    const [topModalVisible, setTopModalVisible] = useState(false);
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBot, setSelectedBot] = useState(null);
    const [calendarObject, setCalendarObject] = useState(null);
    const [outfitsArray, setOutfitsArray] = useState(null);
    const [daysArray, setDaysArray] = useState([]);

    const dummyUser = "67057228f80354e361ae2bf5";

    options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*"
        },
    }
    if (calendarObject == null) {
        fetch(base_url + 'v1/calendar/' + dummyUser, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonData) {
                setCalendarObject(jsonData);
            });
    }
    if (outfitsArray == null) {
        fetch(base_url + 'v1/outfits-get-all/' + dummyUser)
            .then(function (response) {
                return response.json();
            }).then(function (jsonData) {
                setOutfitsArray(jsonData);
            })
    }
    console.log('calendarObject is', calendarObject);
    console.log('outfitsArray is ', outfitsArray);

    if (calendarObject != null) {
        console.log('calendarObject is', calendarObject);
        // fetch(base_url + 'v1/days')
    }



    const onGoToHome = () => {
        navigation.navigate('Home');
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthDays, setMonthDays] = useState([]);
    const [monthEvents, setMonthEvents] = useState({});
    const [monthOutfits, setMonthOutfits] = useState({});

    const [outfitList, setOutfitList] = useState(<View><Text style={styles.modalText}>Outfits are loading...</Text></View>);
    async function printOutfitSet() {
        console.log(outfitSet);
    }
    const outfitSet = getAllOutfitsForUser(dummyUser); // load all outfits when opening the calendar
    const outfitObjects = []

    function updateOutfitList() {
        if (outfitSet.length === 0) {
            console.log("Outfits still aren't loaded.")
            return;
        }
        console.log(outfitSet);
        console.log("outfitObjects is", outfitObjects);
        console.log("outfitSet.length is " + outfitSet.length);
        children = []
        for (let i = 0; i < outfitSet.length; i++) {
            children.push(<Text key={outfitSet[i]} style={styles.modalText}>{outfitSet[i]}</Text>)
        }
        console.log("children is ", children);
        console.log("Outfits are updated!", outfitSet);
        setOutfitList(<View>{children}</View>);

    }


    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + delta);
        setCurrentDate(newDate);
    };


    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let calendarDays = Array(firstDay).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(i);
        }

        while (calendarDays.length < 35) {
            calendarDays.push(null);
        }

        setMonthDays(calendarDays);
    }, [currentDate]);

    const handleEventChange = (day, text) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        setMonthEvents(prev => ({
            ...prev,
            [monthKey]: text
        }));
    };

    const handleOutfitButtonPress = (dayNumber) => {
        setSelectedDay(dayNumber);
        setModalVisible(true);
        updateOutfitList();
    };

    const handleOutfitSelect = (selection) => {
        if (selection === 'Top') {
            setModalVisible(false);
            setTopModalVisible(true);
        } else if (selection === 'Bot') {
            setModalVisible(false);
            setBotModalVisible(true);
        } else {
            setModalVisible(false);
        }
    };

    const handleBotSelection = (botChoice) => {
        setSelectedBot(botChoice);
        // Don't close modal immediately so user can see selection
    };

    const handleTopSelection = (topChoice) => {
        setSelectedTop(topChoice);
        // Don't close modal immediately so user can see selection
    };

    const getEventValue = (day) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        return monthEvents[monthKey] || '';
    };

    const getOutfitValue = (day) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        return monthOutfits[monthKey] || '';
    };

    //Demo
    const getDayImage = (dayIndex, weekIndex) => {
        day_int = weekIndex * 7 + (dayIndex + 1)
        // if (day_int == 24) {
        //     return <Text>Cool outfit</Text>
        // }
        return;

    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <Pressable style={styles.monthButton} onPress={() => changeMonth(-1)}>
                        <Text style={styles.monthButtonText}>←</Text>
                    </Pressable>
                    <Text style={styles.calendarTitle}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Pressable style={styles.monthButton} onPress={() => changeMonth(1)}>
                        <Text style={styles.monthButtonText}>→</Text>
                    </Pressable>
                </View>

                <View style={styles.calendarRow}>
                    {days.map((day, index) => (
                        <View key={index} style={styles.calendarHeaderCell}>
                            <Text style={styles.calendarHeaderText}>{day}</Text>
                        </View>
                    ))}
                </View>

                {Array(5).fill(null).map((_, weekIndex) => (
                    <View key={weekIndex} style={styles.calendarRow}>
                        {Array(7).fill(null).map((_, dayIndex) => {
                            const dayNumber = monthDays[weekIndex * 7 + dayIndex];
                            return (
                                <View key={dayIndex} style={[
                                    styles.calendarCell,
                                    dayIndex === 6 && { borderRightWidth: 0 },
                                    weekIndex === 4 && { borderBottomWidth: 0 }
                                ]}>
                                    {dayNumber && (
                                        <View style={styles.calendarDayContent}>
                                            <Text style={styles.calendarDayNumber}>{dayNumber}</Text>
                                        </View>
                                    )}
                                    {getDayImage(dayIndex, weekIndex)}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>

            <Pressable style={[styles.button, styles.calendarBackButton]} onPress={onGoToHome}>
                <Text style={styles.button_text}>Back to Home</Text>
            </Pressable>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Text style={styles.text}>Select Outfit</Text>
                        <Pressable style={styles.button} onPress={() => updateOutfitList()}>
                            <Text styles={styles.button_text}>Print Outfits</Text>
                        </Pressable>
                        {outfitList}
                        <Pressable style={styles.button} onPress={() => setModalVisible(false)}>
                            <Text style={styles.button_text}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 200,
    },
    modalButton: {
        backgroundColor: '#2196F3',
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        marginVertical: 5,
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    imageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
    },
    imageButton: {
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 5,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        borderRadius: 5,
    },
    selectedImage: {
        borderColor: '#4CAF50',
        borderWidth: 2,
    },
    checkmark: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


//import { SafeAreaView, Text, View } from "react-native"
//import styles from "./Stylesheet"
//
//
//const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//
//export function CalendarView() {
//
//    //suggested system for tracking user info: not implemented anywhere but here yet
//    window.global_userInfo = {name: "DummyUser", _id:"67057228f80354e361ae2bf5"}
//
//    const today = new Date()
//    const cur_month = month[today.getMonth()]
//    return (
//        <SafeAreaView style={styles.container}>
//            <View>
//                <Text style={styles.title}>Hello, {window.global_userInfo.name}!</Text>
//                <Text style={styles.text}>{cur_month}</Text>
//            </View>
//        </SafeAreaView>
//    )
//}