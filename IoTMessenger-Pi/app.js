/*  
OPEN MESSAGE -- BCM 35 -- GPIO 19
DOWN MESSAGE -- BCM 38 -- GPIO 20
UP MESSAGE -- BCM 36 -- GPIO 16
*/
const gpio = require("gpio");
var Lcd = require('lcd'),
  lcd = new Lcd({
    rs: 12,
    e: 21,
    data: [5, 6, 17, 18],
    cols: 8,
    rows: 2
  });

//AZURE IOT HUB -- BEGIN

//MUST CHANGE
var connectionString = '{your IoT Hub Connection String, you get from your IoT Hubs Shared access policies}'; 
var {
  EventHubClient,
  EventPosition
} = require('@azure/event-hubs');

var uuid = require('uuid');

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;


var connectionStringDevice = "{ IoT Hub Device Connection String }"; //MUST CHANGE

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
// AZURE IOT HUB -- END
var messageID = 0;

var sample = []
var i = 0;

var up = gpio.export(16, {
  direction: gpio.DIRECTION.IN,
  ready: function () {}
});

var down = gpio.export(20, {
  direction: gpio.DIRECTION.IN,

  ready: function () {}
});

var open = gpio.export(19, {
  direction: gpio.DIRECTION.IN,

  ready: function () {}
}); 

function fixForLCD(message) {//THIS CODE CAN FIX MESSAGE WHICH HAS 16 CHARACTERS OR MORE FOR LCD
 
  var list = [];
  var sixteen = "";
  for (var i = 1; i <= message.length; i++) {
    if (i % 16 == 0) {
      sixteen += message[i - 1];
      list.push(sixteen)
      sixteen = "";

    } else if (message.length == i) {
      sixteen += message[i - 1];
      list.push(sixteen)
    } else {
      sixteen += message[i - 1];
    }
  }
  return list;

}

function writeLCD(m) { // THE FUNCTION CAN WRITE MESSAGE WHICH COME FROM ANDROID
  lcd.clear();
  lcd.setCursor(0, 0); 
  lcd.print(sample[m]);  
  lcd.once('printed', function () {
    lcd.setCursor(0, 1);  
    lcd.print(sample[m + 1]);  

  });
}

function writeOutput(m1, m2){ // THE FUNCTION IS STANDARD LCD WRITE CODES
  lcd.clear(); 
  lcd.setCursor(0, 0);  
  lcd.print(m1);  
  lcd.once('printed', function () {
    lcd.setCursor(0, 1); 
    lcd.print(m2); 
  });
}

up.on("change", function (val) {//IF UP BUTTON IS PRESSED
  if (val == 0) {
    i -= 1;
    if (i < 0) i = 0;
    writeLCD(i);
  }
});


down.on("change", function (val) {//IF DOWN BUTTON IS PRESSED
  if (val == 0) {
    i += 1;
    if (sample.length - 1 <= i) i = sample.length - 2;
    writeLCD(i)
  }
});


open.on("change", function (val) {//IF OPEN BUTTON IS PRESSED
  if (val == 0) { 
    i = 0;
    writeLCD(i); 

    //SEND READ STATUS
    var message = new Message(JSON.stringify( {idfP: messageID} ));

    message.messageId = uuid.v4();

    console.log('Sending message: ' + message.getData());
    client.sendEvent(message, function (err) {
        if (err) {
            console.error('Could not send: ' + err.toString());
        } else {
            console.log('Message sent: ' + message.messageId);
        }
    }); 
    //!!SEND READ STATUS

  }
});


lcd.on('ready', function () {
  
});

process.on('SIGINT', function () {//EXIT PROGRAM
  lcd.clear();
  lcd.close();
  process.exit();
});


// IF THE APPLICATION GETS FROM AZURE D2C MESSAGE
var printMessage = function (message) {// PRINT MESSAGE
  if(message.body.idfP == null){// CHECK MESSAGE IS READ STATUS OR ISN'T

  //IF MESSAGE COMES FROM ANDROID
  sample = fixForLCD(message.body.mes);
  messageID = message.body.id;

  console.log("Message ID: "+messageID);
  console.log(message.body.mes);

  lcd.setCursor(0, 0);  
  lcd.print("There's message");  
  lcd.once('printed', function () {
    lcd.setCursor(0, 1);  
    lcd.print("press the button");  
  }); 
  //!!IF MESSAGE COMES FROM ANDROID
}
};
var printError = function (err) {
  console.log(err.message);// THERE IS ERROR
};

var ehClient;
EventHubClient.createFromIotHubConnectionString(connectionString).then(function (clientE) {
    console.log("Successully created the EventHub Client from iothub connection string.");
    ehClient = clientE;
    return ehClient.getPartitionIds();
}).then(function (ids) {
    console.log("The partition ids are: ", ids);
  
    writeOutput("All system ready", "Stand by...");//SUCCESSFUL RUN APPLICATION

    return ids.map(function (id) {
        return ehClient.receive(id, printMessage, printError, {
            eventPosition: EventPosition.fromEnqueuedTime(Date.now())
        });
    });
}).catch(printError);
//!!IF THE APPLICATION GETS FROM AZURE D2C MESSAGE