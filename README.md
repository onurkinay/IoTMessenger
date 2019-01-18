# IoTMessenger
The project has an Android application and Raspberry Pi application. The project use Azure IoTHub. There is a video and a sketch about the project 

Video: https://youtu.be/ctx3zeiXDxM

## Android Application can...

 1. Send message
 2. See message status (sent message, has been read message )

## RasPi Application can...

 1. Read message which Android application send
 2. Send read status
 3. Scroll message using buttons

## Must change with yours...
There are two connection string in...
 1. app.js which is in IoTMessenger-Pi directory
 2. AzureClass.kt which is in the Android Project

## How to use

 1. Firstly, you have to do "Must change with yours..." 
 2. In Raspberry Pi, you can write first `sudo npm install` 
 3. After install required packages, you can write `sudo node app.js`on your Pi's terminal.
 4. If you can see "All system ready. Stand by..." from LCD, you will send message from the Android application
 5. For use your Android phone, you can install the application using Android Studio

 If you have a question, send me email -> onurkinay@outlook.com
 If you have found a bug, please submit issue
