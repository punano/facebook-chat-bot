// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);

var SimsimiAnswered;
var text;
var botkey = "http://www.simsimi.com/getRealtimeReq?uuid=UwmPMKoqosEETKleXWGOJ6lynN1TQq18wwvrmCy6IRt&lc=vn&ft=1&reqText=";
// var botkey = "http://www.simsimi.com/getRealtimeReq?uuid=m0njJQ6vh8ElgCfIsaZ6Zp8yYoZ0O1szQWaIvPOlpXg&lc=vi&ft=0&reqText="; // Key thay thế
// mục botkey, có đoạn ft=0 (tức là không lọc chát - sẽ chát cả từ thô tục), ft=1 là để lọc 

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'ga_nguy_hiem') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          var text = message.message.text;
          simsimiBot(senderId, text)
        }
      }
    }
  }

  res.status(200).send("OK");
});

function simsimiBot(senderId, message){
  //   if(message.body === "/logout") { //khi nhận được tin nhắn có nội dung "/logout" thì bot sẽ logout khỏi facebook, bot sẽ dừng
		// 	sendMessage(" Sim Trả Lời:\nSim đi ngủ nhé, tạm biệt ạ.", message.threadID); // auto gửi tin nhắn đi đọc
		// }
		if (message==="Getid"||message==="getid"||message==="get id"||message==="Get id") {
			console.log("FromID: " + senderId + '->Message: '+message);
			sendMessage(senderId, "Your ID: "+ senderId); // auto gửi tin nhắn đio
		} else if (senderId==="id_loại_trừ_1"||senderId=="id_loại_trừ_2") {
		// id_loại_trừ: thêm id người dùng mà bot không tự trả lời
		// hiện tại mình để cho 2 id, có thể viết thêm theo cấu trúc như trên			 
			console.log("FromID: " + senderId + '->Message: '+message);
			return;
		} else if (senderId==="184857308369687") {
			console.log("FromID: " + senderId + '->Message: '+message);
			return;
		} else if (message)
		{
			console.log("FromID: " + senderId + '->Message: '+message);
			request(botkey + encodeURI(message),  // gửi tin nhắn của người dùng lên máy chủ Simsimi
			function(error, response, body)
			{    // trả về tin nhắn khi lấy từ máy chủ Simsimi
				if (error) sendMessage(senderId, "Message bot: Đang đơ, không trả lời được :)"); //trả về tin nhắn khi thất bại
				if (body.indexOf("502 Bad Gateway") > 0 || body.indexOf("respSentence") < 0)
					sendMessage(senderId, "Bot Message: Viết gì khó hiểu vl..."); //trả về tin nhắn khi thất bại
				
				text = JSON.parse(body);
				if (text.status == "200")
				{
					SimsimiAnswered = text.respSentence; // trả về tin nhắn được lấy thành công
					if (message===text.respSentence) {
						return;
					} else
					SimsimiAnswered = text.respSentence; // trả về tin nhắn được lấy thành công
					sendMessage(senderId,"Bot Message: "+SimsimiAnswered);
					console.log("Answered:"+SimsimiAnswered);
				}
			});
		}
}


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAACOpZBHywK8BAGdFF0ic6krVXwuLr6Ui6l0bEncvXcQE1XVAMTNZA0I35dsxGvypkFVlXVdMDV8QZCUODWGbTTyPuXtKpa37Fp9QSrFxzWIpSp6YsKQxLRTg3P8VWWby83kDxwRHKGSiDLvbsl4ObJ6LgXT70lUqXhoZAeeZBgZDZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

server.listen(process.env.PORT, process.env.IP, function() {
  console.log("Chat bot server listening at %s:%d ", process.env.IP, process.env.PORT);
});
