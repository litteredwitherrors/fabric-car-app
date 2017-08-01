'use strict';
/*
 * Chaincode Invoke
 */


 router.post('/cars/:id', function(req, res, next) {
   Promise.resolve().then(() => {
       tx_id = client.newTransactionID();
       console.log("Assigning transaction_id: ", tx_id._transaction_id);
       // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
       // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
       // send proposal to endorser
       var request = {
           targets: targets,
           chaincodeId: options.chaincode_id,
           fcn: '',
           args: [''],
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
       console.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
           err);
       return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
           err;


   }).then((response) => {
       if (response.status === 'SUCCESS') {
           console.log('Successfully sent transaction to the orderer.');
           return tx_id.getTransactionID();
       } else {
           console.error('Failed to order the transaction. Error code: ' + response.status);
           return 'Failed to order the transaction. Error code: ' + response.status;
       }
   }, (err) => {
       console.error('Failed to send transaction due to error: ' + err.stack ? err
           .stack : err);
       return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
           err;
   });
 });
