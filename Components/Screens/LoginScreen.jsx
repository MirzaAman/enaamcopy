import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, useColorScheme, TextInput, Button, TouchableOpacity, Alert, KeyboardAvoidingView } from 'react-native';
import { auth } from '../Firebase/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [btn, setBtn] = useState('Login');

    const isDark = useColorScheme() == 'dark';

    const navigation = useNavigation();

    const [showHide, setShowHide] = useState('eye-off');
    const [passText, setPassText] = useState('Show Password');

    const [togglePass, setTogglePass] = useState(true);

    const handleLogin = () => {
        if (email.length > 0) {
            if (password.length > 0) {
                setBtn('Login..')
                try {
                    signInWithEmailAndPassword(auth, email, password).then(userCredentials => {
                        const user = userCredentials.user;
                        console.log("Logged in as : ", user.email);
                        setBtn('Login')
                        setEmail('');
                        setPassword('');
                    }).catch((err) => {
                        alert('Bad credentials or something went wrong')
                        setBtn('Login');
                        setEmail('');
                        setPassword('');
                    })
                } catch (error) {
                    setBtn('Login');
                    setEmail('');
                    setPassword('');
                    alert('Bad credentials or something went wrong')
                }
            } else {
                alert('Please enter your password')
            }
        } else {
            alert('Please enter your ID')
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                navigation.navigate("Home");
            }
        })

        return unsubscribe;
    }, []);


    const handlePassoword = () => {
        if (showHide === 'eye-off' && passText === 'Show Password') {
            setShowHide('eye')
            setPassText('Hide Password')
            setTogglePass(false)
        } else if (showHide === 'eye' && passText === 'Hide Password') {
            setShowHide('eye-off')
            setPassText('Show Password')
            setTogglePass(true);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='ID'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry={togglePass}
                />
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 20, marginRight: 20, flexDirection: 'row', alignItems: 'center', }} onPress={handlePassoword} >
                    <Text style={{ fontSize: 16, marginRight: 10 }} >{passText}</Text>
                    <MaterialCommunityIcons name={showHide} size={30} color="black" />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>{btn}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 25,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    button: {
        backgroundColor: '#0782F9',
        width: '60%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',

    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});