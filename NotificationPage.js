import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NotificationPage() {
    const navigation = useNavigation();
    const [selectedShirt, setSelectedShirt] = useState(null);
    const [visibleShirts, setVisibleShirts] = useState([1, 2]);
    const [laundryClicked, setLaundryClicked] = useState(false);

    const onBackPress = () => {
        navigation.goBack();
    };

    const onDonationPress = () => {
        if (selectedShirt) {
            setVisibleShirts(visibleShirts.filter(shirt => shirt !== selectedShirt));
            setSelectedShirt(null);
        }
    };

    const onLaundryPress = () => {
        if (!laundryClicked) {
            setVisibleShirts([...visibleShirts, 3, 4]);
            setLaundryClicked(true);
        } else if (selectedShirt && selectedShirt > 2) {
            setVisibleShirts(visibleShirts.filter(shirt => shirt !== selectedShirt));
            setSelectedShirt(null);
        }
    };

    const onShirtPress = (shirtNumber) => {
        setSelectedShirt(shirtNumber === selectedShirt ? null : shirtNumber);
    };

    const renderShirt = (shirtNumber) => (
        <Pressable key={shirtNumber} onPress={() => onShirtPress(shirtNumber)}>
            <View style={[
                styles.tshirtWrapper,
                selectedShirt === shirtNumber && styles.selectedTshirt
            ]}>
                <Image 
                    source={require('./assets/images/placeholder_blue_shirt.jpg')}
                    style={styles.tshirtImage}
                />
                {selectedShirt === shirtNumber && (
                    <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                )}
                {shirtNumber <= 2 ? (
                    <View style={[styles.laundryLabel, styles.donationLabel]}>
                        <Text style={styles.laundryLabelText}>D</Text>
                    </View>
                ) : (
                    <View style={[styles.laundryLabel]}>
                        <Text style={styles.laundryLabelText}>L</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tshirtContainer}>
                {visibleShirts.map(shirtNumber => (
                    visibleShirts.includes(shirtNumber) && renderShirt(shirtNumber)
                ))}
            </View>
            <View style={styles.buttonContainer}>
                <Pressable 
                    style={styles.button} 
                    onPress={onDonationPress}
                >
                    <Text style={styles.buttonText}>Donation</Text>
                </Pressable>
                <View style={styles.laundryButtonContainer}>
                    <Pressable 
                        style={[
                            styles.button,
                            styles.laundryButton,
                            (!selectedShirt || selectedShirt <= 2) && !laundryClicked && styles.disabledButton
                        ]} 
                        onPress={onLaundryPress}
                        disabled={(!selectedShirt || selectedShirt <= 2) && laundryClicked}
                    >
                        <Text style={styles.buttonText}>Laundry</Text>
                    </Pressable>
                    {!laundryClicked && <View style={styles.notificationDot} />}
                </View>
                <Pressable style={[styles.button, styles.backButton]} onPress={onBackPress}>
                    <Text style={styles.buttonText}>Back</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8B0000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tshirtContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 30,
        justifyContent: 'center',
        maxWidth: '90%',
    },
    tshirtWrapper: {
        padding: 5,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTshirt: {
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    tshirtImage: {
        width: 150,
        height: 150,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    checkmark: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    buttonContainer: {
        gap: 20,
        alignItems: 'center',
    },
    button: {
        padding: 20,
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        minWidth: 150,
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: '#444',
    },
    laundryButton: {
        backgroundColor: '#1976D2',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    laundryLabel: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#1976D2',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    laundryLabelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    donationLabel: {
        backgroundColor: '#FF0000',
    },
    notificationDot: {
        width: 10,
        height: 10,
        backgroundColor: '#FF0000',
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        right: 10,
    },
    laundryButtonContainer: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: -5,
        left: -5,
        width: 12,
        height: 12,
        backgroundColor: '#FF0000',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
}); 