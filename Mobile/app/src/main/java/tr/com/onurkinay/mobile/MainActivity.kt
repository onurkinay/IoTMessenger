package tr.com.onurkinay.mobile

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast

import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.android.synthetic.main.content_main.*

import com.microsoft.azure.eventhubs.EventHubClient
import com.microsoft.azure.eventhubs.ConnectionStringBuilder

import java.util.concurrent.Executors
import java.net.URI

class MainActivity : AppCompatActivity() {

    private val azure = AzureClass(this) //start azure class. Look AzureClass.kt

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)

        //azure starts
        try {
            azure.initClient()//connect azure iothub
        } catch (e: Exception) {
        }

        val connStr = ConnectionStringBuilder()
            .setEndpoint(URI(azure.eventHubsCompatibleEndpoint))
            .setEventHubName(azure.eventHubsCompatiblePath)
            .setSasKeyName(azure.iotHubSasKeyName)
            .setSasKey(azure.iotHubSasKey)

        // Create an EventHubClient instance to connect to the
        // IoT Hub Event Hubs-compatible endpoint.
        var executorService = Executors.newSingleThreadScheduledExecutor()
        val ehClient = EventHubClient.createSync(connStr.toString(), executorService)

        // Use the EventHubRunTimeInformation to find out how many partitions
        // there are on the hub.
        val eventHubInfo = ehClient.runtimeInformation.get()

        // Create a PartitionReciever for each partition on the hub.
        for (partitionId in eventHubInfo.partitionIds) {
            azure.receiveMessages(ehClient, partitionId)
        }
        //azure ends

        fab.setOnClickListener { view ->
            run {
                if(textMessage.isEnabled){
                azure.send(textMessage.text.toString())
                textMessage.isEnabled = false
            }else{
                    Toast.makeText(this@MainActivity, "You can't send message because your message hasn't been read yet", Toast.LENGTH_SHORT).show()
                }
            }
        }


    }
    fun getMessage(mes: String?) {
        txtStatus.text = mes
        if(txtStatus.text.toString().contains("READ", ignoreCase = true)){
            textMessage.isEnabled = true
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

}
