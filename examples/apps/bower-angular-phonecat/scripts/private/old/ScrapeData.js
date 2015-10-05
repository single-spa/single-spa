#!/usr/bin/env node

// Script which scrapes http://google.com/phone and generates JSON files used by this application
// To run this file you will need node.js and dependencies listed below

var httpAgent = require('http-agent'),
    jsdom = require('jsdom'),
    fs = require('fs'),
    sys = require('sys');


var agent = httpAgent.create('www.google.com', ['/phone/']);
var baseDir = __dirname + '/../app/phones/';
var phones = [];

function boolean (text) {
  return /true/i.test(text);  
}

agent.addListener('next', function (error, agent) {
  var htmlPage = agent.body.replace('</head>', '</head><body>').
                            replace(/<script[\s\S]*?<\/script>/gi, '');
//  console.log(htmlPage);                            
  var window = jsdom.jsdom(htmlPage).createWindow();
  jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js', function (window, jquery) {
    var body = jquery('body');
    if (phones.length) {
      var c1 = body.find('.g-section .g-unit:nth-child(1)');
      var c2 = body.find('.g-section .g-unit:nth-child(2)');
      var phone = {};
      phone.id = agent.url.split(/\//).pop();
      phone.name = body.find('h2').text().trim();
      phone.description = body.find('.description').text().trim();
      phone.availability = c1.find('table:nth-child(1) th:contains("Availability")+td').text().trim().split(/\s*\n\s*/),
      phone.battery = {
        type: c1.find('table:nth-child(2) th:contains("Type")+td').text(),
        talkTime:  c1.find('table:nth-child(2) th:contains("Talk time")+td').text(),
        standbyTime:  c1.find('table:nth-child(2) th:contains("Standby time")+td').text()
      };
      phone.storage = {
        ram: c1.find('table:nth-child(3) th:contains("RAM")+td').text(),
        flash: c1.find('table:nth-child(3) th:contains("Internal storage")+td').text()
      };
      phone.connectivity = {
        cell:  c1.find('table:nth-child(4) th:contains("Network support")+td').text(),
        wifi:  c1.find('table:nth-child(4) th:contains("WiFi")+td').text(),
        bluetooth:  c1.find('table:nth-child(4) th:contains("Bluetooth")+td').text(),
        infrared:  boolean(c1.find('table:nth-child(4) th:contains("Infrared")+td img').attr('src')),
        gps:  boolean(c1.find('table:nth-child(4) th:contains("GPS")+td img').attr('src'))
      };
      phone.android = {
        os: c2.find('table:nth-child(1) th:contains("OS Version")+td').text(),
        ui: c2.find('table:nth-child(1) th:contains("UI")+td').text()
      };
      phone.sizeAndWeight = {
        dimensions: c2.find('table:nth-child(2) th:contains("Dimensions")+td').text().trim().split(/\s*\n\s*/),
        weight: c2.find('table:nth-child(2) th:contains("Weight")+td').text().trim()
      };
      phone.display = {
        screenSize:  c2.find('table:nth-child(3) th:contains("Screen size")+td').text(),
        screenResolution:  c2.find('table:nth-child(3) th:contains("Screen resolution")+td').text(),
        touchScreen:  boolean(c2.find('table:nth-child(3) th:contains("Touch screen")+td img').attr('src'))
      };
      phone.hardware = {
        fmRadio:  boolean(c2.find('table:nth-child(4) th:contains("FM Radio")+td img').attr('src')),
        physicalKeyboard: c2.find('table:nth-child(4) th:contains("Physical keyboard")+td img').attr('src'),
        accelerometer: boolean(c2.find('table:nth-child(4) th:contains("Accelerometer")+td img').attr('src')),
        cpu: c2.find('table:nth-child(4) th:contains("CPU")+td').text(),
        usb: c2.find('table:nth-child(4) th:contains("USB")+td').text(),
        audioJack: c2.find('table:nth-child(4) th:contains("Audio / headphone jack")+td').text()
      };
      phone.camera= {
        primary: c2.find('table:nth-child(5) th:contains("Primary")+td').text(),
        features: c2.find('table:nth-child(5) th:contains("Features")+td').text().trim().split(/\s*\n\s*/)
      };
      phone.additionalFeatures = c2.find('table:nth-child(6) td').text();
      phone.images = [];
      body.find('#thumbs img').each(function(){
        var imgUrl = 'http://www.google.com' + jquery(this).attr('src');
        phone.images.push({
          small: imgUrl,
          large: imgUrl.replace(/\/small$/, '/large')
        });
      });
      fs.writeSync(fs.openSync(baseDir + phone.id + '.json', 'w'), JSON.stringify(phone));
    } else {
      var age = 0;
      body.find('ul.phonelist li.list').each(function(a){
        var url = jquery(this).find('.name a').attr('href');
        console.log('=======>', url);
        var phone = {};
        phone.id = url.split(/\//).pop();
        phone.age = age++;
        phone.imageUrl = 'http://google.com' + 
          jquery(this).find('img.phone').attr('src');
        phone.snippet = jquery(this).find('.description').text().trim();
        phone.name = jquery(this).find('strong').text().trim();
        phone.carrier = jquery(this).find('.buy-from img').attr('alt');
        phone.buyUrl = jquery(this).find('.buy-from a').attr('href');
        console.log(phone);
        phones.push(phone);
        agent.addUrl(url);
      });
      fs.writeSync(fs.openSync(baseDir + '.json', 'w'), JSON.stringify(phones));
    }
    console.log(phone);
    agent.next();
  });
});

agent.addListener('stop', function (error, agent) {
  sys.puts('the agent has stopped');
});

agent.start();