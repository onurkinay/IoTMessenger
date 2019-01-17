import React, { Component } from 'react'; 
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
 

//AZURE IOT HUB -- BEGIN
var connectionString = 'HostName=messenger.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=5Tnmp1ItP/r/Sr3pM98uQauTwlXxVus0pi1R+WVbjns=';
var {
  EventHubClient,
  EventPosition
} = require('@azure/event-hubs');

var uuid = require('uuid');

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;


var connectionStringDevice = "HostName=messenger.azure-devices.net;DeviceId=pi;SharedAccessKey=8a26D9kC5PJLVfrEFcWA/1tdk0K8hlt3WNHDZJcHDaQ=";

if (!connectionStringDevice) {
    console.log('Please set the DEVICE_CONNECTION_STRING environment variable.');
    process.exit(-1);
}

var client = Client.fromConnectionString(connectionStringDevice, Protocol);
client.open(function (err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Client connected');

        client.on('error', function (err) {
           console.error(err.message);
            process.exit(-1);
        });
    }
});
 
var printMessage = function (message) {
   if(message.body.idfP != null){
       
 }
 };
 var printError = function (err) {
   console.log(err.message);
 };
 
 var ehClient;
 EventHubClient.createFromIotHubConnectionString(connectionString).then(function (clientE) {
     console.log("Successully created the EventHub Client from iothub connection string.");
     ehClient = clientE;
     return ehClient.getPartitionIds();
 }).then(function (ids) {
     console.log("The partition ids are: ", ids); 
     return ids.map(function (id) {
         return ehClient.receive(id, printMessage, printError, {
             eventPosition: EventPosition.fromEnqueuedTime(Date.now())
         });
     });
 }).catch(printError);
// AZURE IOT HUB -- END

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
   var messageID = Math.floor((Math.random() * 1000) + 1);
   var message = new Message(JSON.stringify( {id: messageID, mes: lcd} ));

   message.messageId = uuid.v4();

   console.log('Sending message: ' + message.getData());
   client.sendEvent(message, function (err) {
       if (err) {
           console.error('Could not send: ' + err.toString());
       } else {
           console.log('Message sent: ' + message.messageId);
       }
   }); 
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
            </ScrollView >   
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
