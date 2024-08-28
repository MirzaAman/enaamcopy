// Import necessary libraries and components
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Modal, Alert, Keyboard, ActivityIndicator, ScrollView } from 'react-native';
import { addDoc, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const Candidates = ({ route, navigation }) => {
    const { personId } = route.params;

    const nNavigation = useNavigation();

    const [candidates, setCandidates] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);


    const [btn, setBtn] = useState('Add Candidate')



    const [isLoading, setIsLoading] = useState(true);

    // form
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [localExp, setLocalExp] = useState('');
    const [abroadExp, setAbroadExp] = useState('');
    const [remarks, setRemarks] = useState('');
    const [appDate, setAppDate] = useState('')

    const fetchCandidates1 = async () => {
        try {
            const userEntriesRef = collection(db, 'entries', personId, 'candidates');
            const querySnapshot = await getDocs(userEntriesRef);
            const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCandidates(userData);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoading(true);
            try {
                const userEntriesRef = collection(db, 'entries', personId, 'candidates');
                const querySnapshot = await getDocs(userEntriesRef);
                const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCandidates(userData);
            } catch (error) {
                console.error('Error fetching candidates:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const handleSubmit = async () => {
        if (name.length > 0) {
            if (phoneNumber.length > 0) {
                if (localExp.length > 0) {
                    if (abroadExp.length > 0) {
                        if (appDate.length > 0) {
                            if (remarks.length > 0) {
                                Keyboard.dismiss()
                                setBtn('Adding..')
                                const data = {
                                    name: name,
                                    phone: phoneNumber,
                                    localExp: localExp,
                                    abroadExp: abroadExp,
                                    appDate : appDate,
                                    remarks: remarks,
                                }
                                try {
                                    await addDoc(collection(db, 'entries', personId, 'candidates'), data).then(() => {
                                        setName('')
                                        setPhoneNumber('')
                                        setLocalExp('')
                                        setAbroadExp('')
                                        setRemarks('')
                                        fetchCandidates1()
                                        setBtn('Add Candidate')
                                        alert("Added");
                                        setIsModalVisible(false);
                                    })
                                } catch (error) {
                                    setBtn('Add Candidate')
                                    alert(error)
                                }
                            } else {
                                alert("Please enter any Remarks")
                            }
                        }else{
                            alert("Please enter Application Date")
                        }
                    } else {
                        alert("Please enter Abroad Experience")
                    }
                } else {
                    alert("Please enter Local Experience")
                }
            } else {
                alert("Please enter Candidate's Phone Number")
            }
        } else {
            alert("Please enter Candidate's Name")
        }
    }

    const handleRemoveWorkExperience = async (id) => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to remove this candidate',
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'entries', personId, 'candidates', id));
                            fetchCandidates1()
                            setCandidates(prevCandidates => prevCandidates.filter(candidate => candidate.id !== id));
                        } catch (error) {
                            console.error('Error removing work experience:', error);
                        }
                    }
                }
            ]
        )
    };

    const handleConfirmCandidate = (item) => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to Confirm this candidate?',
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes, Confirm",
                    onPress: async () => {

                        const date = new Date();
                        const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

                        const cData = {
                            Cname: item.name,
                            Cphone: item.phone,
                            ClocalExp: item.localExp,
                            CabroadExp: item.abroadExp,
                            CappDate : item.appDate,
                            Cremarks: item.remarks,
                            Cdate: formattedDate,
                            visaNo:'',
                            sponsorId:'',
                            visaStatus: false,
                        }
                        try {
                            await setDoc(doc(db, 'entries', personId), { cStatus: true }, { merge: true });
                            await addDoc(collection(db, 'entries', personId, 'confirmedCandidates'), cData).then(() => {
                                alert('Done')
                                nNavigation.navigate('Home')
                            })
                        } catch (error) {
                            console.error('Error removing work experience:', error);
                        }
                    }
                }
            ]
        )
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {
                candidates.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>No Data</Text>
                    </View>
                    :
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={candidates}
                        renderItem={({ item }) => (
                            <View style={styles.contentCard}>
                                <View>
                                    <Text style={styles.itemText}>Name: {item.name} </Text>
                                    <Text style={styles.itemText}>Phone number: {item.phone} </Text>
                                    <Text style={styles.itemText}>local Exp: {item.localExp} </Text>
                                    <Text style={styles.itemText}>Abroad Exp: {item.abroadExp} </Text>
                                    <Text style={styles.itemText}>Remarks: {item.remarks} </Text>
                                    <Text style={styles.itemText}>Applicaton Date: {item.appDate} </Text>
                                </View>
                                <View style={styles.contentAction}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => handleConfirmCandidate(item)} style={styles.editBtn2}><Text style={{ color: 'white' }} >Confirm</Text></TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemoveWorkExperience(item.id)} style={styles.editBtn}><Text style={{ color: 'white' }} >Remove</Text></TouchableOpacity>
                                </View>
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                    />
            }

            <TouchableOpacity style={styles.addExpBtn} onPress={() => setIsModalVisible(true)}>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 17 }} >Add Candidate</Text>
            </TouchableOpacity>
            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={name}
                            onChangeText={(text) => setName(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChangeText={(text) => setPhoneNumber(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Local EXP"
                            value={localExp}
                            onChangeText={(text) => setLocalExp(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Abroad EXP"
                            value={abroadExp}
                            onChangeText={(text) => setAbroadExp(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Application Date"
                            value={appDate}
                            onChangeText={(text) => setAppDate(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Remarks"
                            value={remarks}
                            onChangeText={(text) => setRemarks(text)}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
                            <Text style={{ color: 'white', fontSize: 17 }} >{btn}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addBtn2} onPress={() => setIsModalVisible(false)}>
                            <Text style={{ color: 'white', fontSize: 17 }} >Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>


        </View>
    )
}

export default Candidates;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 50,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    removeBtn: {
        color: 'red',
    },
    addBtn: {
        backgroundColor: 'blue',
        color: 'white',
        borderRadius: 5,
        marginTop: 20,
        width: 185,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#024e9a',
    },
    addBtn2: {
        backgroundColor: 'blue',
        color: 'white',
        borderRadius: 5,
        marginTop: 15,
        marginBottom: 20,
        width: 185,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#024e9a',
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'black',
        width: '85%',
        minHeight: '8%',
        alignSelf: 'center',
        fontSize: 17,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addExpBtn: {
        alignSelf: 'center',
        backgroundColor: '#024e9a',
        width: 260,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    contentCard: {
        flex: 1,
        width: '95%',
        minHeight: 280,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20
    },
    itemText: {
        fontWeight: '500',
        fontSize: 18,
        textAlign: 'left',
        marginTop: 5,
    },
    contentAction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editBtn: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderColor: '#85c3d7',
        marginLeft: 5,
        backgroundColor: '#01a4e2'
    },
    editBtn2: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderColor: '#90d6e5',
        marginLeft: 5,
        backgroundColor: '#04438d'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
