var express = require('express');
var app = express();
var request = require('request');

// var rp = require('request-promise');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
var hi = {};
hi.body = '';
hi.statusCode = '';
hi.haschanged = false;

var headers = {
    'accept': 'application/json',
    'X-Tenant-ID': '1',
    'SCP-Virtual-Host-Token': 'a27b0361f160d2ffaa696c51851b2793',
    'SCP-ServiceLayer-Cookie': 'B1SESSION=a194d1f0-9d0d-11e7-8000-90b11c3a7c2c'

};

var options = {
    url: 'https://slcDemo.cfapps.sap.hana.ondemand.com/b1s/v1/AccountCategory',
    headers: headers
};

function callback(error, response, body) {
    hi.body = body;
    hi.statusCode = response.statusCode;
    hi.haschanged = true;
    // console.log("error Code: " + response.statusCode);

    if (!error) {
        console.log("success");

    }
    else {
        console.log("error");
    }
}


app.get('/', function (req, res) {
    request(options, callback);

    res.send("send");
});

function parseCurl(curl, cookie, sel) {
    var url = (curl.split('\"', 2)[1]).toString();
    url = url.split('(')[0];
    // console.log(url);
    var method = curl.split(' ', 3)[2];
    var hasBody = false;
    if (curl.split('-d').length > 1) {
        hasBody = true;
        // console.log(curl.split('-d').length);
        var temp = (curl.split('-d')[1]);
        var inputbody = temp.substring(2, temp.length - 1);
        // console.log(method);
        inputbody = inputbody.replace(/[\\]/g, '');

        var tst = JSON.parse(inputbody);
        // console.log(tst);
    }
    url = 'https://' + url.split("//")[1];

    var headers = {
        'accept': 'application/json',
        'X-Tenant-ID': '1',
        'SCP-Virtual-Host-Token': 'a27b0361f160d2ffaa696c51851b2793',
        'SCP-ServiceLayer-Cookie': 'B1SESSION=' + cookie
    };
    if (hasBody) {
        var option = {
            method: method,
            json: true,
            body: tst,
            url: url,
            headers: headers
        };
        return option;
    }
    else {
        var option2 = {
            method: method,
            json: true,
            url: url + sel,
            headers: headers
        };
        return option2;

    }


}

var lastCurl = '';
app.post('/', function (req, res, next) {
    var curl = req.body.curl;
    var sel = req.body.selector;
    var cookie = req.body.sid;
    if (lastCurl !== curl) {
        hi.haschanged = false;
        hi.body = '';
        hi.statusCode = '';
        // console.log(lastCurl);
        console.log(cookie);

        var option = parseCurl(curl, cookie, sel);

        request(option, callback);
    }


    var result = {'backResult': req.body.curl};
    lastCurl = curl;

    res.send(result);
});

app.get('/hi', function (req, res) {
    // request(options, callback);

    var stu = JSON.stringify(hi);
    var constu = JSON.parse(stu);
    res.send(constu);
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});

