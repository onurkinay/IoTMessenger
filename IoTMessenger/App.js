import React, { Component } from 'react'; 
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
 

export default class App extends React.Component {
  state = {
    lcd: '',
    names: [
      {'name': 'Onur', 'read': 1}
   ]
  }
  handleLCD = (text) => {
    this.setState({lcd: text})
  }
  sending = (lcd) => {
    alert(lcd)
  }

  updateState = () => this.setState({state1: 'On pressed'})
  render() {
    return (
     <View style= {styles.container}>
       <TextInput style={styles.input}
        underlineColorAndroid="transparent" 
        placeholder="LCD" 
        placeholderTextColor="#9a73ef" 
        autoCapitalize="none" onChangeText={this.handleLCD} />

             <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => this.sending(this.state.lcd)
               }>
               <Text style = {styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>
            <ScrollView>
               {
                  this.state.names.map((item, index) => (
                     <View key = {item.read} style = {styles.item}>
                        <Text>{item.name}</Text>  
                     </View>
                  ))
               }
            </ScrollView>   
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 23
 },
 input: {
    margin: 15,
    height: 40,
    borderColor: '#7a42f4',
    borderWidth: 1
 },
 submitButton: {
    backgroundColor: '#7a42f4',
    padding: 10,
    margin: 15,
    height: 40,
 },
 submitButtonText:{
    color: 'white'
 },
 item: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 30,
  margin: 2,
  borderColor: '#2a4944',
  borderWidth: 1,
  backgroundColor: '#d2f7f1'
}
});
