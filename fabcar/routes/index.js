'use strict';
/*
 * Hyperledger Fabric Sample Query Program
 */
 var express = require('express');
 var router = express.Router();
 var hfc = require('fabric-client');
 var path = require('path');
 var util = require('util');
 var options = require('./options');
 var channel = {};
 var client = null;
 var targets = [];
 var tx_id = null;

//This promise initializes HFC and configures the wallet
Promise.resolve().then(() => {
  console.log("Create a client and set the wallet location");
  client = new hfc();
  return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
}).then((wallet) => {
  console.log("Set wallet path, and associate user ", options.user_id, " with application");
  client.setStateStore(wallet);
  return client.getUserContext(options.user_id, true);
}).then((user) => {
  console.log("Check user is enrolled, and set a query URL in the network");
  if (user === undefined || user.isEnrolled() === false) {
    console.error("User not defined, or not enrolled - error");
  }
  channel = client.newChannel(options.channel_id);
  var peerObj = client.newPeer(options.peer_url);
  channel.addPeer(peerObj);
  channel.addOrderer(client.newOrderer(options.orderer_url));
  targets.push(peerObj);
  return;
});

router.get('/cars', function(req, res, next) {
  Promise.resolve().then(() => {
    console.log("Make query");
    var transaction_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", transaction_id._transaction_id);

    // queryCar - requires 1 argument, ex: args: ['CAR4'],
    // queryAllCars - requires no arguments , ex: args: [''],
    const request = {
      chaincodeId: options.chaincode_id,
      txId: transaction_id,
      fcn: 'queryAllCars',
      args: ['']
    };
    // console.log("Query is:" + req.query.car);
    return channel.queryByChaincode(request);
  }).then((query_responses) => {
    console.log("returned from query");
    if (!query_responses.length) {
      console.log("No payloads were returned from query");
    } else {
      console.log("Query result count = ", query_responses.length)
    }
    if (query_responses[0] instanceof Error) {
      console.error("error from query = ", query_responses[0]);
    }
    console.log(query_responses[0].toString());
    var responseString = query_responses[0].toString();
    var data = JSON.parse(responseString);
    res.setHeader('Content-Type', 'application/json');
    res.json({ data: data });
  }).catch((err) => {
    console.error("Caught Error", err);
  });
});

router.get('/cars/:car', function(req, res, next) {
  Promise.resolve().then(() => {
    console.log("Make query");
    var transaction_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", transaction_id._transaction_id);
    // queryCar - requires 1 argument, ex: args: ['CAR4'],
    // queryAllCars - requires no arguments , ex: args: [''],
    const request = {
      chaincodeId: options.chaincode_id,
      txId: transaction_id,
      fcn: 'queryCar',
      args: [req.params.car]
    };
    console.log('QUERY' + req.params.car)
    return channel.queryByChaincode(request);
  }).then((query_responses) => {
    console.log("returned from query");
    if (!query_responses.length) {
      console.log("No payloads were returned from query");
    } else {
      console.log("Query result count = ", query_responses.length)
    }
    if (query_responses[0] instanceof Error) {
      console.error("error from query = ", query_responses[0]);
    }
    console.log(query_responses[0].toString());
    var responseString = query_responses[0].toString();
    var data = JSON.parse(responseString);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  }).catch((err) => {
    console.error("Caught Error", err);
  });
});

router.post('/cars/', function(req, res, next) {
  var request_data = req.body.data
  var carId = request_data.id;
  var carMake = request_data.make;
  var carModel = request_data.model;
  var carColor = request_data.color;
  var carOwner = request_data.owner;

  console.log([carId, carMake, carModel, carColor, carOwner]);
  console.log(request_data)
  console.log(typeof request_data);
  Promise.resolve().then(() => {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    var request = {
      targets: targets,
      chaincodeId: options.chaincode_id,
      fcn: 'createCar',
      args: [carId, carMake, carModel, carColor, carOwner],
      chainId: options.channel_id,
      txId: tx_id
    };
    return channel.sendTransactionProposal(request);
  }).then((results) => {
    var proposalResponses = results[0];
    var proposal = results[1];
    var header = results[2];
    let isProposalGood = false;
    if (proposalResponses && proposalResponses[0].response &&
      proposalResponses[0].response.status === 200) {
      isProposalGood = true;
      console.log('transaction proposal was good');
    } else {
      console.error('transaction proposal was bad');
    }
    if (isProposalGood) {
      console.log(util.format(
        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
        proposalResponses[0].response.status, proposalResponses[0].response.message,
        proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature)
      );
      var request = {
        proposalResponses: proposalResponses,
        proposal: proposal,
        header: header
      };
      // set the transaction listener and set a timeout of 30sec
      // if the transaction did not get committed within the timeout period,
      // fail the test
      var transactionID = tx_id.getTransactionID();
      var eventPromises = [];
      let eh = client.newEventHub();
      eh.setPeerAddr(options.event_url);
      eh.connect();

      let txPromise = new Promise((resolve, reject) => {
        let handle = setTimeout(() => {
          eh.disconnect();
          reject();
        }, 30000);

        eh.registerTxEvent(transactionID, (tx, code) => {
          clearTimeout(handle);
          eh.unregisterTxEvent(transactionID);
          eh.disconnect();

          if (code !== 'VALID') {
            console.error(
             'The transaction was invalid, code = ' + code);
            reject();
          } else {
            console.log(
             'The transaction has been committed on peer ' +
             eh._ep._endpoint.addr);
            resolve();
          }
        });
      });
      eventPromises.push(txPromise);
      var sendPromise = channel.sendTransaction(request);

      return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
        console.log(' event promise all complete and testing complete');
        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
      }).catch((err) => {
        console.error(
          'Failed to send transaction and get notifications within the timeout period.'
        );
        return 'Failed to send transaction and get notifications within the timeout period.';
      });
    } else {
       console.error(
        'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
       );
       return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
    }
  }, (err) => {
    var prop_error = err.stack ? err.stack : err
    console.error('Failed to send proposal due to error: ' + prop_error );
    return 'Failed to send proposal due to error: ' + prop_error;
  }).then((response) => {
     if (response.status === 'SUCCESS') {
        console.log('Successfully sent transaction to the orderer.');
        return tx_id.getTransactionID();
     } else {
        console.error('Failed to order the transaction. Error code: ' + response.status);
        return 'Failed to order the transaction. Error code: ' + response.status;
     }
  }, (err) => {
    var trans_error = err.stack ? err.stack : err
    console.error('Failed to send transaction due to error: ' + trans_error);
    return 'Failed to send transaction due to error: ' + trans_error;
  });
});

router.put('/cars/', function(req, res, next) {
  var request_data = req.body.data
  var carId = request_data.carId;
  var recipient = request_data.recipient;

  console.log([carId, recipient]);
  console.log(request_data)
  console.log(typeof request_data);
  Promise.resolve().then(() => {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    var request = {
      targets: targets,
      chaincodeId: options.chaincode_id,
      fcn: 'changeCarOwner',
      args: [carId, recipient],
      chainId: options.channel_id,
      txId: tx_id
    };
    return channel.sendTransactionProposal(request);
  }).then((results) => {
     var proposalResponses = results[0];
     var proposal = results[1];
     var header = results[2];
     let isProposalGood = false;
     if (proposalResponses && proposalResponses[0].response &&
         proposalResponses[0].response.status === 200) {
         isProposalGood = true;
         console.log('transaction proposal was good');
     } else {
         console.error('transaction proposal was bad');
     }
     if (isProposalGood) {
         console.log(util.format(
             'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
             proposalResponses[0].response.status, proposalResponses[0].response.message,
             proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
         var request = {
             proposalResponses: proposalResponses,
             proposal: proposal,
             header: header
         };
         // set the transaction listener and set a timeout of 30sec
         // if the transaction did not get committed within the timeout period,
         // fail the test
         var transactionID = tx_id.getTransactionID();
         var eventPromises = [];
         let eh = client.newEventHub();
         eh.setPeerAddr(options.event_url);
         eh.connect();

         let txPromise = new Promise((resolve, reject) => {
             let handle = setTimeout(() => {
                 eh.disconnect();
                 reject();
             }, 30000);

             eh.registerTxEvent(transactionID, (tx, code) => {
                 clearTimeout(handle);
                 eh.unregisterTxEvent(transactionID);
                 eh.disconnect();

                 if (code !== 'VALID') {
                     console.error(
                         'The transaction was invalid, code = ' + code);
                     reject();
                 } else {
                     console.log(
                         'The transaction has been committed on peer ' +
                         eh._ep._endpoint.addr);
                     resolve();
                 }
             });
         });
         eventPromises.push(txPromise);
         var sendPromise = channel.sendTransaction(request);
         return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
             console.log(' event promise all complete and testing complete');
             return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
         }).catch((err) => {
             console.error(
                 'Failed to send transaction and get notifications within the timeout period.'
             );
             return 'Failed to send transaction and get notifications within the timeout period.';
         });
     } else {
         console.error(
             'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
         );
         return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
     }
  }, (err) => {
    var prop_error = err.stack ? err.stack : err
    console.error('Failed to send proposal due to error: ' + prop_error );
    return 'Failed to send proposal due to error: ' + prop_error;
  }).then((response) => {
     if (response.status === 'SUCCESS') {
         console.log('Successfully sent transaction to the orderer.');
         return tx_id.getTransactionID();
     } else {
         console.error('Failed to order the transaction. Error code: ' + response.status);
         return 'Failed to order the transaction. Error code: ' + response.status;
     }
  }, (err) => {
    var trans_error = err.stack ? err.stack : err
    console.error('Failed to send transaction due to error: ' + trans_error);
    return 'Failed to send transaction due to error: ' + trans_error;
  });
});

module.exports = router;
