'use strict';
var fs = require('fs');

const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = 'ff34dad7dda642ea973b1f3131f3a2a3';
// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/';

exports.initialize = function (groupId, groupName) {

    const options = {
        uri: uriBase + 'persongroups/' + groupId,
        body: JSON.stringify({'name': groupName}),
        headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
    };

    request.put(options, (error, response, body) => {
    if (error) {
        console.log('Error: ', error);
        return;
    }});
}

exports.createUser = function (groupId, userName) {
    
    const options = {
        uri: uriBase + 'persongroups/' + groupId + '/persons',
        body: JSON.stringify({'name': userName}),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };
    
    request.post(options, (error, response, body) => {
      if (error) {
        console.log('Error: ', error);
        return;
      }
      let jsonResponse = JSON.parse(body);
      return(jsonResponse.personId);
    });
}

exports.addFaces = function (groupId, personId, fileNames) {
    for (var i = 0; i < 3; i++) {
        fs.readFile(fileNames[i], function(err, data) {
            const options = {
                uri: uriBase + 'persongroups/' + groupId + '/persons/' + personId + '/persistedFaces',
                body: data,
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
            return 1;
            });
        });
    }  
}

exports.update = function (groupId) {
    const options = {
        uri: uriBase + 'persongroups/' + groupId + '/',
        headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
    };

    request.patch(options, (error, response, body) => {
        if (error) {
            console.log('Error: ', error);
            return;
        } else return("Update started");
    });
}

exports.getUpdateStatus = function (groupId) {
    const options = {
        uri: uriBase + 'persongroups/' + groupId + '/training',
        headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
    };

    request.get(options, (error, response, body) => {
        if (error) {
            console.log('Error: ', error);
            return;
        }
        let jsonResponse = JSON.parse(body);
        switch (jsonResponse.status) {
            case 'succeeded':
                return 1;
        
            default:
                return 0;
        }
    });
}

exports.identify = function (fileName) {
    var faceIds = [];
    fs.readFile(fileName, function(err, data) {
        // Request parameters.
        
        const params = {
            'returnFaceId': 'true'
        };

        const options = {
            uri: uriBase + '/detect',
            qs: params,
            body: data,
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
            let jsonResponse = JSON.parse(body);
            //console.log(JSON.stringify(jsonResponse, null, '  '));
            jsonResponse.forEach((response) => {
                faceIds.push(response.faceId);
            });
            module.exports.identify2('pppppp', faceIds);
        });
    });
}

exports.identify2 = function (groupId, faceIds) {
    const options = {
        uri: uriBase + 'identify',
        body: JSON.stringify({
            'faceIds': faceIds,
            'personGroupId': groupId,
            'maxNumofCandidatesReturned': 1,
            'confidenceThreshold': 0.5
        }),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };
    
    request.post(options, (error, response, body) => {
      if (error) {
        console.log('Error: ', error);
        return;
      }
    //   let jsonResponse = JSON.parse(body);
    //   console.log('JSON Response for identify\n');
    //   console.log(JSON.stringify(jsonResponse, null, '  '));
    //   jsonResponse.forEach(face => {
    //       console.log(face.candidates[0].personId + ' ' + face.candidates[0].confidence + '\n');
    //   });
    });
}