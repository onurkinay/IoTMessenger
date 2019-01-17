/* 
BUZZER AND LED -- BCM 37 -- GPIO 26
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

var alarm = gpio.export(26, {
  direction: gpio.DIRECTION.OUT,

  ready: function () {}
});

function fixForLCD(message) {

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

function writeLCD(m) {
  lcd.clear();
  lcd.setCursor(0, 0); // col 0, row 0
  lcd.print(sample[m]); // print time
  lcd.once('printed', function () {
    lcd.setCursor(0, 1); // col 0, row 1
    lcd.print(sample[m + 1]); // print date 

  });
}

var sample = []
var i = 0;
up.on("change", function (val) {
  if (val == 0) {
    i -= 1;
    if (i < 0) i = 0;
    writeLCD(i);
  }
});


down.on("change", function (val) {
  if (val == 0) {
    i += 1;
    if (sample.length - 1 <= i) i = sample.length - 2;
    writeLCD(i)
  }
});


open.on("change", function (val) {
  if (val == 0) {
    alarm.unexport();
    writeLCD(i)
  }
});


lcd.on('ready', function () {
  sample = fixForLCD("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.");

  lcd.setCursor(0, 0); // col 0, row 0
  lcd.print("There's message"); // print time
  lcd.once('printed', function () {
    lcd.setCursor(0, 1); // col 0, row 1
    lcd.print("press the button"); // print date 
  });
  alarm.set();

});

process.on('SIGINT', function () {
  lcd.clear();
  lcd.close();
  process.exit();
});
 