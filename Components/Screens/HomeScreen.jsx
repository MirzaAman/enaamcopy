import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, useColorScheme, ActivityIndicator, Modal, RefreshControl, FlatList, ClipboardStatic, TextInput, Button, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, BackHandler } from 'react-native';
import { auth, db } from '../Firebase/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, getDocs, orderBy, query, onSnapshot, setDoc, doc, getDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';


const HomeScreen = () => {

  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [systemLoad, setSystemLoad] = useState(true);

  const [listener, setListener] = useState(null);

  const navigation1 = useNavigation();

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchText('');
    try {
      const userEntriesRef = collection(db, 'entries');
      const querySnapshot = await getDocs(query(userEntriesRef, orderBy('createdAt', 'desc')));
      const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const fetchDataFromFirestore = async (user) => {
    setSystemLoad(true);
    try {
      const userEntriesRef = collection(db, 'entries');
      const querySnapshot = await getDocs(query(userEntriesRef, orderBy('createdAt', 'desc')));
      const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    } finally {
      setSystemLoad(false);
    }
  };


  const startDataListener = async (user) => {
    const userEntriesRef = collection(db, 'entries');
    const unsubscribe = onSnapshot(userEntriesRef, (snapshot) => {
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(newData);
    });
    setListener(unsubscribe);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const fetchedData = await fetchDataFromFirestore(user);
        setData(fetchedData);
        setload('Final Candidate')
        startDataListener(user);
      } else {
        navigation1.navigate("Login");
      }
    });

    return () => {
      if (listener) {
        listener();
      }
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation1.addListener('focus', async () => {
      await onRefresh();
      console.log('gotcha');
    });

    return unsubscribe;
  }, [navigation1]);


  const fetchCandidates1 = async () => {
    try {
      const userEntriesRef = collection(db, 'entries');
      const querySnapshot = await getDocs(query(userEntriesRef, orderBy('createdAt', 'desc')));
      const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(userData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };


  const [Job, setJob] = useState('');
  const [workPlace, setWorkPlace] = useState('');
  const [Location, setLocation] = useState('');
  const [Salary, setSalary] = useState('');
  const [Ref, setRef] = useState('');
  const [Qualification, setQualification] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [Vacancies, setVacancies] = useState('');

  const [addBtn, setAddBtn] = useState('Add Entry');
  const [addBtn2, setAddBtn2] = useState('Submit');

  const handleSubmit = async () => {
    if (Job.length > 0) {
      if (workPlace.length > 0) {
        if (Location.length > 0) {
          if (Salary.length > 0) {
            if (Qualification.length > 0) {
              if (workExperience.length > 0) {
                if (Vacancies.length > 0) {
                  if (Ref.length > 0) {
                    setAddBtn('Adding..')
                    const date = new Date();
                    const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

                    try {
                      const refDoc = doc(db, 'ref', 'counter');
                      const refDocSnapshot = await getDoc(refDoc);
                      let counter = 0; // Default value if counter document doesn't exist

                      if (refDocSnapshot.exists()) {
                        counter = refDocSnapshot.data().count;
                      }

                      // Update the counter value
                      await setDoc(refDoc, { count: counter + 1 });
                      const data = {
                        job: Job,
                        workPlace: workPlace,
                        location: Location,
                        salary: Salary,
                        qualification: Qualification,
                        workExp: workExperience,
                        Vacancies: Vacancies,
                        ref: Ref,
                        createdAt: formattedDate,
                        cStatus: false,
                        merge: false,
                        count: `ENM0${counter + 1}/24`,
                      }
                      // await addDoc(collection(db, 'entries'), data)
                      await addDoc(collection(db, 'entries'), data).then(async () => {
                        await fetchDataFromFirestore(user).then(() => {
                          setJob('');
                          setWorkPlace('');
                          setWorkExperience('');
                          setQualification('');
                          setLocation('');
                          setSalary('');
                          setRef('');
                          setAddBtn('Add Entry')
                          setModalVisible(false)
                          alert('Entry Added')
                          fetchCandidates1();
                        })
                      })
                      // console.log('Data Added', data);

                    } catch (error) {
                      console.log(error.message);
                      setAddBtn('Add Entry')
                      alert(error)
                    }
                  } else {
                    alert("Please enter Ref")
                  }
                }
              }
            }
          } else {
            alert("Please enter Salary")
          }
        } else {
          alert("Please enter Location")
        }
      } else {
        alert("Please enter work Place")
      }
    } else {
      alert("Please enter Job")
    }
  }

  const logout = async () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to logout?',
      [
        {
          text: "Cancel",
          style: 'cancel',
        },
        {
          text: "Yes, logout",
          onPress: async () => {
            try {
              await signOut(auth).then(() => {
                console.log('Logout')
                navigation1.navigate("Login")
              })
            } catch (error) {
              alert("Something went wrong!")
            }
          }
        }
      ]
    )
  }

  const [ModalVisible, setModalVisible] = useState(false);

  const handleEditPress = (item) => {
    setSelectedItem(item);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        job: Job,
        workPlace: workPlace,
        location: Location,
        salary: Salary,
        ref: Ref,
        createdAt: selectedItem.createdAt,
      };
      await setDoc(doc(db, 'entries', 'users', user.uid, selectedItem.id), updatedData, { merge: true });
      setEditModalVisible(false);
      alert('Entry Updated');
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Unable to update entry');
    }
  };

  const handleCandidates = async (item) => {
    // Do something when "Cname" field doesn't exist in confirmedCandidates
    navigation1.navigate("Candidates", { personId: item.id });
  };



  const [confirmedCandidates, setConfirmedCandidates] = useState([]);
  const [confirmedCandidatesModalVisible, setConfirmedCandidatesModalVisible] = useState(false);
  const [refCode, setRefCode] = useState('');

  const fetchConfirmedCandidates = async (docId) => {
    const confirmedCandidatesRef = collection(db, 'entries', docId, 'confirmedCandidates');
    try {
      const querySnapshot = await getDocs(confirmedCandidatesRef);
      const confirmedCandidatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConfirmedCandidates(confirmedCandidatesData);
      console.log();
      setConfirmedCandidatesModalVisible(true);
    } catch (error) {
      console.error('Error fetching confirmed candidates:', error);
      // Handle error
    }
  };

  const [load, setload] = useState('Final Candidate');

  const fetchLoad = (id) => {
    setload('Loading..')
    fetchConfirmedCandidates(id).then(() => {
      setload('Final Candidate')
    })
  }

  const [loadingStates, setLoadingStates] = useState({});

  const fetchLoad2 = (item) => {
    setTempId(item.id)
    setLoadingStates(prevStates => ({
      ...prevStates,
      [item.id]: 'Loading..'
    }));

    fetchConfirmedCandidates(item.id).then(() => {
      setRefCode(`${item.count}`)
      setLoadingStates(prevStates => ({
        ...prevStates,
        [item.id]: 'Final Candidate'
      }));
    });
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  const [onRemoveLoad, setOnRemoveLoad] = useState(false);

  const handleRemovePress = async (item) => {
    Alert.alert(
      'Confirmaton',
      `Are you sure you want to delete this Entry (#${item.count})`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          onPress: async () => {
            try {
              setOnRemoveLoad(true)
              // Delete the document from the 'entries' collection using its ID
              await deleteDoc(doc(db, 'entries', item.id)).then(() => {
                setOnRemoveLoad(false)
                onRefresh()
                alert('Entry Removed');
              });
            } catch (error) {
              console.error('Error removing entry:', error);
              alert('Unable to remove entry');
            }
          }
        }
      ]
    )
  };

  const [tempId, setTempId] = useState('');
  const [docTempID, setDocTempID] = useState('');
  const [visaModel, setVisaModel] = useState(false)

  const [visaNumber, setVisaNumber] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [submitButton, setSubmitButton] = useState('Submit');

  const handleVisa = async (id) => {
    setDocTempID(id)
    setVisaModel(true)
  };

  const submitVisa = async () => {
    if (visaNumber.length > 0) {
      if (sponsorId.length > 0) {
        setAddBtn2('Submitting..')
        try {
          const data = {
            visaNo: visaNumber,
            sponsorId: sponsorId,
            visaStatus: true,
          }
          const docRef = doc(db, 'entries', tempId, 'confirmedCandidates', docTempID);
          await updateDoc(docRef, data).then(() => {
            setAddBtn2('Submit')
            setVisaNumber('');
            setSponsorId('');
            setConfirmedCandidatesModalVisible(false);
            setVisaModel(false);
          })
        } catch (error) {
          setAddBtn2('Submit')
          alert(error)
        }
      } else {
        alert('Please enter Sponsor ID')
      }
    } else {
      alert('Please enter Visa Number')
    }
  }

  const [topBarHeight, setTopBarHeight] = useState('8%'); // Initial height of topBar
  const [searchText, setSearchText] = useState('');

  const handleKeyboardDidShow = () => {
    setTopBarHeight('17%'); // Adjust the height of topBar when keyboard is shown
  };

  const handleKeyboardDidHide = () => {
    setTopBarHeight('8%'); // Restore the initial height of topBar when keyboard is hidden
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

    // Remove specific event listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const handleSearch = async (text) => {
    const searchText = text.toUpperCase(); // Convert user input to uppercase
    setSearchText(text);
    setSystemLoad(true)
    try {
      const userEntriesRef = collection(db, 'entries');
      let querySnapshot;
      if (searchText === '') {
        querySnapshot = await getDocs(query(userEntriesRef, orderBy('createdAt', 'desc')));
      } else {
        querySnapshot = await getDocs(query(userEntriesRef, where('count', '==', searchText)));
      }
      const searchData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(searchData);
    } catch (error) {
      console.error('Error searching data:', error);
    } finally {
      setSystemLoad(false)
    }
  };
  
  

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp(); // Close the app when back button is pressed
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup the event listener when the component unmounts
  }, []);

  useEffect(() => {
    const unsubscribe = navigation1.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault(); // Prevent default behavior of back navigation
        BackHandler.exitApp(); // Close the app
      }
    });

    return unsubscribe;
  }, [navigation1]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { height: topBarHeight }]}>
        {/* <Text style={styles.text}>Hi, Samsudheen K A</Text> */}
        <View style={styles.searchContainer} >
          <TextInput
            value={searchText}
            onChangeText={(text) => handleSearch(text)}
            style={styles.searchInput}
            placeholder='Search with file no'
          />

        </View>
        <View style={styles.actionBar}>
          <TouchableOpacity style={{marginLeft:10}} onPressIn={() => setModalVisible(true)}  >
            <MaterialCommunityIcons name="plus-box" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{marginLeft:15}} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentBody}>
        {
          onRemoveLoad ?
            <View style={styles.loadingContainer2}>
              <ActivityIndicator size="large" color="white" />
            </View>
            :
            null
        }
        {
          systemLoad ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : (
            data.length === 0 ? (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 100
              }} >
                <Text style={{ color: 'white', fontSize: 25 }} >No Data</Text>
              </View>
            ) : (
              <FlatList
                data={data}
                renderItem={({ item }) => (
                  <View style={styles.contentCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
                      <TouchableOpacity onPress={() => copyToClipboard(`#${item.count}`)}><Text style={{ textAlign: 'right' }}  >File No : {item.count}</Text></TouchableOpacity>
                      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => copyToClipboard(`#${item.count}`)} >
                        <MaterialCommunityIcons name="content-copy" size={20} color="#0c98ca" />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={styles.itemText}>Job: {item.job}</Text>
                      <Text style={styles.itemText}>Work Place: {item.workPlace}</Text>
                      <Text style={styles.itemText}>Location: {item.location}</Text>
                      <Text style={styles.itemText}>Salary: {item.salary}</Text>
                    </View>
                    <View style={styles.contentAction}>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.editBtn2} onPress={() => handleRemovePress(item)} ><Text style={{ color: 'white' }} >Remove</Text></TouchableOpacity>
                      </View>
                      {item.cStatus ? (
                        <TouchableOpacity style={styles.editBtn} onPress={() => fetchLoad2(item)} >
                          <Text>{loadingStates[item.id] || 'Final Candidate'}</Text>
                        </TouchableOpacity>

                      ) : (
                        <TouchableOpacity onPress={() => handleCandidates(item)} style={styles.editBtn}><Text>Candidates</Text></TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />

            )
          )
        }

        <View style={{ marginBottom: 10 }}></View>
      </View>
      <Modal visible={ModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, paddingBottom: 20 }}>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 20, marginTop: 20 }}>
              <Text style={{ fontSize: 18,fontWeight:'700', color:'#015689' }}>New Entry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-box" size={35} color="#0c98ca" />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
              <TextInput
                placeholder='Job'
                style={styles.input}
                value={Job}
                onChangeText={(name) => setJob(name)}
              />
              <TextInput
                placeholder='Work Place'
                style={styles.input}
                value={workPlace}
                onChangeText={(workPlace) => setWorkPlace(workPlace)}
              />
              <TextInput
                placeholder='Employer'
                style={styles.input}
                value={Location}
                onChangeText={(Location) => setLocation(Location)}
              />
              <TextInput
                placeholder='Total Salary'
                style={styles.input}
                value={Salary}
                onChangeText={(Salary) => setSalary(Salary)}
              />
              <TextInput
                placeholder='Qualification'
                style={styles.input}
                value={Qualification}
                onChangeText={(Qualification) => setQualification(Qualification)}
              />
              <TextInput
                placeholder='Work Experience'
                style={styles.input}
                value={workExperience}
                onChangeText={(workExperience) => setWorkExperience(workExperience)}
              />
              <TextInput
                placeholder='Vacancies'
                style={styles.input}
                onChangeText={(Vacancies) => setVacancies(Vacancies)}
              />
              <TextInput
                placeholder='Remark'
                style={styles.input}
                value={Ref}
                onChangeText={(Ref) => setRef(Ref)}
              />
              {/* Other TextInput components */}
              <TouchableOpacity style={styles.addBtn} onPressIn={handleSubmit}>
                <Text style={{ fontWeight: '700', color: 'white', fontSize: 18 }}>{addBtn}</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </ScrollView>
      </Modal>

      <Modal visible={confirmedCandidatesModalVisible} onRequestClose={() => setConfirmedCandidatesModalVisible(false)}>
        <View style={styles.mainPromt}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} >
            <Text style={{ textAlign: 'center', fontSize: 20, marginLeft: 30, fontWeight: '600', color: 'white' }} >{refCode}</Text>
            <TouchableOpacity onPress={() => setConfirmedCandidatesModalVisible(false)} style={{ marginRight: 30 }}>
              <MaterialCommunityIcons name="close-box" size={35} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.fl}>
            <FlatList
              data={confirmedCandidates}
              renderItem={({ item }) => (
                <View style={styles.modalContainer2}>
                  <View style={styles.dataContainer} >
                    <Text style={styles.cTitle2}> Confirmed on : {item.Cdate}</Text>
                    <Text style={styles.cTitle}> Name: <Text style={{ color: 'green', fontWeight: '700' }}>{item.Cname}</Text></Text>
                    <Text style={styles.cTitle}> Phone: <Text style={{ color: 'green', fontWeight: '700' }}>{item.Cphone}</Text></Text>
                    <Text style={styles.cTitle}> Local Exp: <Text style={{ color: 'green', fontWeight: '700' }}>{item.ClocalExp}</Text></Text>
                    <Text style={styles.cTitle}> Abroad Exp: <Text style={{ color: 'green', fontWeight: '700' }}>{item.CabroadExp}</Text></Text>
                    <Text style={styles.cTitle}> Remarks: <Text style={{ color: 'green', fontWeight: '700' }}>{item.Cremarks}</Text></Text>
                    <Text style={styles.cTitle}> Application date: <Text style={{ color: 'green', fontWeight: '700' }}>{item.CappDate}</Text></Text>
                    {
                      item.visaStatus ?
                        <>
                          <Text style={styles.cTitle}> Visa No: <Text style={{ color: 'red', fontWeight: '700' }}>{item.visaNo}</Text></Text>
                          <Text style={styles.cTitle}> Sponsor ID: <Text style={{ color: 'red', fontWeight: '700' }}>{item.sponsorId}</Text></Text>
                        </> : null
                    }
                  </View>
                  {
                    item.visaStatus ?
                      null
                      :
                      <View style={{ marginTop: 20, marginBottom: 10, width: '40%', alignSelf: 'center' }}>
                        <Button color='#014a95' title='Visa Details' onPress={() => handleVisa(item.id)} />
                      </View>
                  }
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

          </View>
        </View>
      </Modal>

      <Modal visible={visaModel} onRequestClose={() => setVisaModel(false)}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, paddingBottom: 20 }}>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 20, marginTop: 20 }}>
              <Text style={{ fontSize: 18 }}>New Entry</Text>
              <TouchableOpacity onPress={() => setVisaModel(false)}>
                <MaterialCommunityIcons name="close-box" size={35} color="#b21719" />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
              <TextInput
                placeholder='Visa Number'
                style={styles.input}
                value={visaNumber}
                onChangeText={(visanumber) => setVisaNumber(visanumber)}
              />
              <TextInput
                placeholder='Sponsor ID'
                style={styles.input}
                value={sponsorId}
                onChangeText={(sponsorId) => setSponsorId(sponsorId)}
              />
              {/* Other TextInput components */}
              <TouchableOpacity style={styles.addBtn} onPress={() => submitVisa()}>
                <Text style={{ fontWeight: '700', color: 'white', fontSize: 18 }}>{addBtn2}</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </ScrollView>
      </Modal>

      {/* Edit menu */}
      <Modal visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text onPress={() => setEditModalVisible(false)} >Edit Entry</Text>
          <TextInput
            placeholder='Job'
            style={styles.input}
            value={Job}
            onChangeText={(name) => setJob(name)}
          />
          <TextInput
            placeholder='Job'
            style={styles.input}
            value={Job}
            onChangeText={(job) => setJob(job)}
          />
          <TextInput
            placeholder='Location'
            style={styles.input}
            value={Location}
            onChangeText={(location) => setLocation(location)}
          />
          <TextInput
            placeholder='Salary'
            style={styles.input}
            value={Salary}
            onChangeText={(salary) => setSalary(salary)}
          />
          <TextInput
            placeholder='Ref'
            style={styles.input}
            value={Ref}
            onChangeText={(ref) => setRef(ref)}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleEditSubmit}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#96dbf3',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  text: {
    color: 'white',
    fontSize: 18
  },
  topBar: {
    width: '100%',
    backgroundColor: '#0c98ca',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionBar: {
    flexDirection: 'row',
    width: '18%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 20,
  },
  contentBody: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  contentCard: {
    flex: 1,
    width: '95%',
    minHeight: 250,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    marginTop: 10
  },
  itemText: {
    fontWeight: '500',
    fontSize: 17,
    textAlign: 'left',
    marginTop: 5,
  },
  contentAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentActionBtns: {
    flexDirection: 'row',
    backgroundColor: 'red',
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
    borderColor: '#0c98ca',
    marginLeft: 5,
    backgroundColor:'#96dbf3'
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
    borderColor: '#0194cd',
    marginLeft: 5,
    backgroundColor: '#015689',
  },
  inputContainer: {
    flex: 1,

    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
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
  addBtn: {
    alignSelf: 'center',
    backgroundColor: '#f40202',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginBottom: 20,
    width: '55%',
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor:'#0c98ca',
    borderWidth:1.5,
    backgroundColor:'#014a95',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPromt: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#04a0c8'
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  modalContainer2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    backgroundColor: 'white',
    minHeight: 500,
    maxHeight: 590,
    minWidth: '95%',
    borderRadius: 30,
    justifyContent: 'center',
    paddingLeft: 30,
    paddingBottom: 20,
    paddingTop: 20
  },
  cTitle: {
    color: '#014a95',
    marginTop: 25,
    fontSize: 20,
    fontWeight:'500'
  },
  fl: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 50,
    height: '100%'
  },
  cTitle2: {
    fontSize: 15,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'grey'
  },
  loadingContainer2: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    width: '60%',
    height: '60%',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'grey',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'blue'
  },
  searchInput: {
    height: '100%',
    width: '100%',
    color: 'black',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    fontSize: 15
  },
})