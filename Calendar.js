import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Stylesheet';
//Test19

export default function CalendarView() {
    const navigation = useNavigation();
    
    const onGoToHome = () => {
        navigation.navigate('Home');
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthDays, setMonthDays] = useState([]);
    const [monthEvents, setMonthEvents] = useState({});
    const [monthOutfits, setMonthOutfits] = useState({});

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

    const handleOutfitChange = (day, text) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        setMonthOutfits(prev => ({
            ...prev,
            [monthKey]: text
        }));
    };

    const getEventValue = (day) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        return monthEvents[monthKey] || '';
    };

    const getOutfitValue = (day) => {
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
        return monthOutfits[monthKey] || '';
    };

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
                                            <TextInput
                                                style={styles.calendarInput}
                                                value={getEventValue(dayNumber)}
                                                onChangeText={(text) => handleEventChange(dayNumber, text)}
                                                placeholder="Event"
                                                placeholderTextColor="#999"
                                            />
                                            <TextInput
                                                style={styles.calendarInput}
                                                value={getOutfitValue(dayNumber)}
                                                onChangeText={(text) => handleOutfitChange(dayNumber, text)}
                                                placeholder="Outfit"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>

            <Pressable style={[styles.button, styles.calendarBackButton]} onPress={onGoToHome}>
                <Text style={styles.button_text}>Back to Home</Text>
            </Pressable>
        </SafeAreaView>
    );
} 