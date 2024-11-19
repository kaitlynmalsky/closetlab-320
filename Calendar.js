import React, { useState } from 'react';
import { SafeAreaView, Text, View, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Stylesheet';

export default function CalendarView() {
    const navigation = useNavigation();
    
    const onGoToHome = () => {
        navigation.navigate('Home');
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const [row1Values, setRow1Values] = useState(Array(7).fill(''));
    const [row2Values, setRow2Values] = useState(Array(7).fill(''));

    const handleRow1Change = (text, index) => {
        const newValues = [...row1Values];
        newValues[index] = text;
        setRow1Values(newValues);
    };

    const handleRow2Change = (text, index) => {
        const newValues = [...row2Values];
        newValues[index] = text;
        setRow2Values(newValues);
    };

    const renderCell = (content, index, isHeader = false) => (
        <View key={index} style={[
            styles.calendarCell,
            index === 6 && { borderRightWidth: 0 },
        ]}>
            {isHeader ? (
                <Text style={styles.calendarHeaderText}>{content}</Text>
            ) : (
                <TextInput
                    style={styles.calendarInput}
                    value={content}
                    onChangeText={(text) => handleRow1Change(text, index)}
                    placeholder="Add Events"
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendarContainer}>
                <View style={styles.calendarRow}>
                    {days.map((day, index) => renderCell(day, index, true))}
                </View>

                <View style={styles.calendarRow}>
                    {days.map((_, index) => (
                        <View key={index} style={[
                            styles.calendarCell,
                            index === 6 && { borderRightWidth: 0 }
                        ]}>
                            <TextInput
                                style={styles.calendarInput}
                                value={row1Values[index]}
                                onChangeText={(text) => handleRow1Change(text, index)}
                                placeholder="Add Events"
                                placeholderTextColor="#999"
                            />
                        </View>
                    ))}
                </View>

                <View style={[styles.calendarRow, { borderBottomWidth: 0 }]}>
                    {days.map((_, index) => (
                        <View key={index} style={[
                            styles.calendarCell,
                            index === 6 && { borderRightWidth: 0 }
                        ]}>
                            <TextInput
                                style={styles.calendarInput}
                                value={row2Values[index]}
                                onChangeText={(text) => handleRow2Change(text, index)}
                                placeholder="Add Outfit"
                                placeholderTextColor="#999"
                            />
                        </View>
                    ))}
                </View>
            </View>

            <Pressable style={[styles.button, styles.calendarBackButton]} onPress={onGoToHome}>
                <Text style={styles.button_text}>Back to Home</Text>
            </Pressable>
        </SafeAreaView>
    );
} 