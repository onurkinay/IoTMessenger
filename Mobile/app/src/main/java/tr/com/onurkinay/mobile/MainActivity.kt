package tr.com.onurkinay.mobile


import android.os.Bundle
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


import java.io.IOException
import java.net.URISyntaxException
import java.util.*


class MainActivity : AppCompatActivity() {
    private var connString = "HostName=messenger.azure-devices.net;DeviceId=pi;SharedAccessKey=8a26D9kC5PJLVfrEFcWA/1tdk0K8hlt3WNHDZJcHDaQ="
    private var sendMessage: Message = Message("{ \"mes\":\"Hi World\", \"id\":65 }")
    var protocol = IotHubClientProtocol.MQTT
    private var client: DeviceClient= DeviceClient(connString, protocol)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)
        try {
            initClient()
        } catch (e: Exception) {
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
            println(value)
            txtStatus.text = "Your message was sent!"
            val eventCallback = EventCallback()
            client.sendEventAsync(sendMessage, eventCallback, 1)
        } catch (e: Exception) {
        }

    }

}
