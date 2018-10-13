'use strict';
var fs = require('fs');

const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = 'ff34dad7dda642ea973b1f3131f3a2a3';
// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0';

var image = fs.readFileSync('daniel.jpg');

// Request parameters.
const params = {
    'returnFaceId': 'true'
};

const options = {
    uri: uriBase + '/detect',
    qs: params,
    body: image,
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};

request.post(options, (error, response, body) => {
  if (error) {
    console.log('Error: ', error);
    return;
  }
  let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
  console.log('JSON Response\n');
  console.log(jsonResponse);
});