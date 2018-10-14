'use strict';
var fs = require('fs');

const request = require('request-promise-native');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = 'ff34dad7dda642ea973b1f3131f3a2a3';
// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0';

exports.initialize = function (groupId, groupName) {
    const options = {
        uri: uriBase + '/persongroups/' + groupId,
        body: JSON.stringify({'name': groupName}),
        headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
    };

    request.put(options).then((body) => {}).catch((err) => {
        // console.log(err);
    });
}

exports.createUser = function (groupId, userName) {
  const options = {
      uri: `${uriBase}/persongroups/${groupId}/persons`,
      // body: JSON.stringify({ 'name': userName }),
      body: { 'name': userName },
      headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key' : subscriptionKey
      },
      json: true,
  };
  return request.post(options).then((body) => {
    return body.personId;
  });
}

exports.addFaces = function (groupId, personId, files) {
  return Promise.all(files.map(file => {
    const options = {
      uri: `${uriBase}/persongroups/${groupId}/persons/${personId}/persistedFaces`,
      body: file,
      headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key' : subscriptionKey
      }
    };

    return request.post(options);
  }));
}

exports.update = function (groupId) {
  const options = {
      uri: `${uriBase}/persongroups/${groupId}/train`,
      headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
  };
  return request.post(options);
}

// exports.getUpdateStatus = function (groupId) {
//     const options = {
//         uri: uriBase + 'persongroups/' + groupId + '/training',
//         headers: {'Ocp-Apim-Subscription-Key' : subscriptionKey}
//     };
//
//     request.get(options, (error, response, body) => {
//         if (error) {
//             console.log('Error: ', error);
//             return;
//         }
//         let jsonResponse = JSON.parse(body);
//         switch (jsonResponse.status) {
//             case 'succeeded':
//                 return 1;
//
//             default:
//                 return 0;
//         }
//     });
// }

exports.identify = function (groupId, file) {
  let faceIds = [];
  const options = {
    uri: `${uriBase}/detect`,
    qs: {
      'returnFaceId': 'true'
    },
    body: file,
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    },
  };
  return request.post(options).then((body) => {
    body = JSON.parse(body);
    const faceIds = body.map(response => response.faceId);
    if(faceIds.length == 0) {
      return [];
    } else {
      return request.post({
        uri: `${uriBase}/identify`,
        body: {
            faceIds,
            'personGroupId': groupId,
            'maxNumofCandidatesReturned': 1,
            'confidenceThreshold': 0.7
        },
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        },
        json: true
      });
    }
  }).then((body) => {
    // console.log(body.map(face => face.candidates[0].personId));
    return body.map(face => face.candidates[0].personId);
  });

  // return new Promise((resolve, reject) => {
  //   let faceIds = [];
  //   const options = {
  //     uri: `${uriBase}/detect`,
  //     qs: {
  //       'returnFaceId': 'true'
  //     },
  //     body: file,
  //     headers: {
  //         'Content-Type': 'application/octet-stream',
  //         'Ocp-Apim-Subscription-Key' : subscriptionKey
  //     },
  //     json: true
  //   };
  //   request.post(options, (error, response, body) => {
  //       if (error) {
  //           console.log('Error: ', error);
  //           reject(error);
  //       } else if(response.statusCode != 200) {
  //         reject(body);
  //       }
  //       let jsonResponse = JSON.parse(body);
  //       console.log(jsonResponse);
  //       console.log('--');
  //       const faceIds = jsonResponse.map(response => response.faceId);
  //       console.log(faceIds);
  //       request.post({
  //         uri: `${uriBase}/identify`,
  //         body: JSON.stringify({
  //             faceIds,
  //             'personGroupId': groupId,
  //             'maxNumofCandidatesReturned': 1,
  //             'confidenceThreshold': 0.7
  //         }),
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'Ocp-Apim-Subscription-Key' : subscriptionKey
  //         }
  //       }, (error, response, body) => {
  //         if (error) {
  //           console.log('Error: ', error);
  //           reject(error);
  //         } else if(response.statusCode != 200){
  //           reject(body);
  //         } else {
  //           let res = JSON.parse(body);
  //           resolve(res.map(face => face.candidate[0].personId));
  //         }
  //       });
  //   });
  // });
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
