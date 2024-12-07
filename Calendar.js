import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, Pressable, TextInput, StyleSheet, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Stylesheet';

export default function CalendarView() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [botModalVisible, setBotModalVisible] = useState(false);
    const [topModalVisible, setTopModalVisible] = useState(false);
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBot, setSelectedBot] = useState(null);
    
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

    const handleOutfitButtonPress = (dayNumber) => {
        setSelectedDay(dayNumber);
        setModalVisible(true);
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
                                            <Pressable 
                                                style={styles.outfitButton}
                                                onPress={() => handleOutfitButtonPress(dayNumber)}
                                            >
                                                <Text style={styles.outfitButtonText}>
                                                    {getOutfitValue(dayNumber) || '                   Outfit'}
                                                </Text>
                                            </Pressable>
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

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Pressable
                            style={modalStyles.modalButton}
                            onPress={() => handleOutfitSelect('Top')}
                        >
                            <Text style={modalStyles.modalButtonText}>Top</Text>
                        </Pressable>
                        <Pressable
                            style={modalStyles.modalButton}
                            onPress={() => handleOutfitSelect('Bot')}
                        >
                            <Text style={modalStyles.modalButtonText}>Bot</Text>
                        </Pressable>
                        <Pressable
                            style={[modalStyles.modalButton, modalStyles.cancelButton]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={modalStyles.modalButtonText}>Create</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={botModalVisible}
                onRequestClose={() => setBotModalVisible(false)}
            >
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <View style={modalStyles.imageContainer}>
                            <Pressable 
                                style={[
                                    modalStyles.imageButton,
                                    selectedBot === 'bot1' && modalStyles.selectedImage
                                ]}
                                onPress={() => handleBotSelection('bot1')}
                            >
                                <Image 
                                    source={require('./assets/images/placeholder_blue_shirt.jpg')}
                                    style={modalStyles.image}
                                />
                                {selectedBot === 'bot1' && (
                                    <View style={modalStyles.checkmark}>
                                        <Text style={modalStyles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable 
                                style={[
                                    modalStyles.imageButton,
                                    selectedBot === 'bot2' && modalStyles.selectedImage
                                ]}
                                onPress={() => handleBotSelection('bot2')}
                            >
                                <Image 
                                    source={require('./assets/images/placeholder_blue_shirt.jpg')}
                                    style={modalStyles.image}
                                />
                                {selectedBot === 'bot2' && (
                                    <View style={modalStyles.checkmark}>
                                        <Text style={modalStyles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                        <Pressable
                            style={[modalStyles.modalButton, modalStyles.cancelButton]}
                            onPress={() => {
                                setSelectedBot(null);
                                setBotModalVisible(false);
                            }}
                        >
                            <Text style={modalStyles.modalButtonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={topModalVisible}
                onRequestClose={() => setTopModalVisible(false)}
            >
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <View style={modalStyles.imageContainer}>
                            <Pressable 
                                style={[
                                    modalStyles.imageButton,
                                    selectedTop === 'top1' && modalStyles.selectedImage
                                ]}
                                onPress={() => handleTopSelection('top1')}
                            >
                                <Image 
                                    source={require('./assets/images/placeholder_blue_shirt.jpg')}
                                    style={modalStyles.image}
                                />
                                {selectedTop === 'top1' && (
                                    <View style={modalStyles.checkmark}>
                                        <Text style={modalStyles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable 
                                style={[
                                    modalStyles.imageButton,
                                    selectedTop === 'top2' && modalStyles.selectedImage
                                ]}
                                onPress={() => handleTopSelection('top2')}
                            >
                                <Image 
                                    source={require('./assets/images/placeholder_blue_shirt.jpg')}
                                    style={modalStyles.image}
                                />
                                {selectedTop === 'top2' && (
                                    <View style={modalStyles.checkmark}>
                                        <Text style={modalStyles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                        <Pressable
                            style={[modalStyles.modalButton, modalStyles.cancelButton]}
                            onPress={() => {
                                setSelectedTop(null);
                                setTopModalVisible(false);
                            }}
                        >
                            <Text style={modalStyles.modalButtonText}>Cancel</Text>
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