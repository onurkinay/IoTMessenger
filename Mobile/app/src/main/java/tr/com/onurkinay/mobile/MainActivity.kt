package tr.com.onurkinay.mobile


import android.os.Bundle
import android.os.Handler
import android.support.v7.app.AppCompatActivity;
import android.view.Menu
import android.view.MenuItem

import com.microsoft.azure.sdk.iot.device.*
import kotlinx.android.synthetic.main.activity_main.*
import com.microsoft.azure.sdk.iot.device.IotHubClientProtocol
import com.microsoft.azure.sdk.iot.device.DeviceClient
import com.microsoft.azure.sdk.iot.device.IotHubStatusCode
import com.microsoft.azure.sdk.iot.device.IotHubEventCallback
import kotlinx.android.synthetic.main.content_main.*

import java.util.*

import com.microsoft.azure.sdk.iot.service.devicetwin.MethodResult

import com.microsoft.azure.eventhubs.ConnectionStringBuilder;
import com.microsoft.azure.eventhubs.EventData;
import com.microsoft.azure.eventhubs.EventHubClient;
import com.microsoft.azure.eventhubs.EventHubException;
import com.microsoft.azure.eventhubs.EventPosition;
import com.microsoft.azure.eventhubs.EventHubRuntimeInformation;
import com.microsoft.azure.eventhubs.PartitionReceiver;

import java.io.IOException
import java.time.Instant
import java.util.ArrayList
import java.util.concurrent.ExecutionException
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.nio.charset.Charset
import java.net.URI
import java.net.URISyntaxException
import java.util.concurrent.ScheduledExecutorService
import java.util.function.Consumer

class MainActivity : AppCompatActivity() {
    private var connString = "HostName=messenger.azure-devices.net;DeviceId=pi;SharedAccessKey=8a26D9kC5PJLVfrEFcWA/1tdk0K8hlt3WNHDZJcHDaQ="
   // private var connStringEvent = "HostName=messenger.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=5Tnmp1ItP/r/Sr3pM98uQauTwlXxVus0pi1R+WVbjns="
    private var sendMessage: Message = Message("{ \"mes\":\"Hi World\", \"id\":65 }")
    var protocol = IotHubClientProtocol.MQTT
    private var client: DeviceClient= DeviceClient(connString, protocol)

    var result: MethodResult? = null

    // az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
    private val eventHubsCompatibleEndpoint = "sb://ihsuprodblres025dednamespace.servicebus.windows.net/"

    // az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
    private val eventHubsCompatiblePath = "iothub-ehub-messenger-1204997-c892a2c5ba"

    // az iot hub policy show --name iothubowner --query primaryKey --hub-name {your IoT Hub name}
    private val iotHubSasKey = "5Tnmp1ItP/r/Sr3pM98uQauTwlXxVus0pi1R+WVbjns="
    private val iotHubSasKeyName = "iothubowner"

    // Track all the PartitionReciever instances created.
    private val receivers = ArrayList<PartitionReceiver>()


    override fun onCreate(savedInstanceState: Bundle?)  {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)
        try {
            initClient()
        } catch (e: Exception) {
        }


        val connStr = ConnectionStringBuilder()
            .setEndpoint(URI(eventHubsCompatibleEndpoint))
            .setEventHubName(eventHubsCompatiblePath)
            .setSasKeyName(iotHubSasKeyName)
            .setSasKey(iotHubSasKey)

        // Create an EventHubClient instance to connect to the
        // IoT Hub Event Hubs-compatible endpoint.
        var executorService = Executors.newSingleThreadScheduledExecutor()
        val ehClient = EventHubClient.createSync(connStr.toString(), executorService)

        // Use the EventHubRunTimeInformation to find out how many partitions
        // there are on the hub.
        val eventHubInfo = ehClient.runtimeInformation.get()

        // Create a PartitionReciever for each partition on the hub.
        for (partitionId in eventHubInfo.partitionIds) {
            receiveMessages(ehClient, partitionId)
        }

        fab.setOnClickListener { view ->
           run {
                send(textMessage.text.toString())
            }
        }


    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        return when (item.itemId) {
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }

    internal inner class EventCallback : IotHubEventCallback {
        override fun execute(status: IotHubStatusCode, context: Any) {
            val i = context as Int
            println(
                "IoT Hub responded to message " + i!!.toString()
                        + " with status " + status.name
            )

            if ((status == IotHubStatusCode.OK) || (status == IotHubStatusCode.OK_EMPTY)) {
                //ok
            } else {
                //problem
            }
        }
    }

    @Throws(URISyntaxException::class, IOException::class)
    private fun initClient() {

        try {

            client.open()


        } catch (e2: Exception) {
            System.err.println("Exception while opening IoTHub connection: " + e2.message)
            client.closeNow()
            println("Shutting down...")
        }

    }


    private fun send(value: String) {

        try {
            val random = Random()
            sendMessage = Message("{ \"mes\":\""+value+"\", \"id\": "+ random.nextInt(5000) + 1 +" }")
            sendMessage.setMessageId(java.util.UUID.randomUUID().toString())

            txtStatus.text = "Your message was sent!"

            val eventCallback = EventCallback()
            client.sendEventAsync(sendMessage, eventCallback, 1)
        } catch (e: Exception) {
        }

    }

    @Throws(EventHubException::class, ExecutionException::class, InterruptedException::class)
    private fun receiveMessages(ehClient: EventHubClient, partitionId: String) {

        val executorService = Executors.newSingleThreadExecutor()

        // Create the receiver using the default consumer group.
        // For the purposes of this sample, read only messages sent since
        // the time the receiver is created. Typically, you don't want to skip any messages.
        ehClient.createReceiver(
            EventHubClient.DEFAULT_CONSUMER_GROUP_NAME, partitionId,
            EventPosition.fromEnqueuedTime(Instant.now())
        ).thenAcceptAsync( Consumer<PartitionReceiver> {  receiver ->
            println(String.format("Starting receive loop on partition: %s", partitionId))
            println(String.format("Reading messages sent since: %s", Instant.now().toString()))

            receivers.add(receiver)

            while (true) {
                try {
                    // Check for EventData - this methods times out if there is nothing to retrieve.
                    val receivedEvents = receiver.receiveSync(100)

                    // If there is data in the batch, process it.
                    if (receivedEvents != null) {
                        for (receivedEvent in receivedEvents!!) {
                            var message = String(receivedEvent.bytes, Charsets.ISO_8859_1)
                            if(message.contains("idfP", ignoreCase = true)){
                                txtStatus.text ="The message was read"
                            }
                        }
                    }
                } catch (e: EventHubException) {
                    println("Error reading EventData")
                }

            }
        }, executorService)
    }

}
