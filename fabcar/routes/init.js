// 'use strict';
//
// var express = require('express');
// var hfc = require('fabric-client');
// var path = require('path');
// var util = require('util');
// var options = require('./options');
// var channel = {};
// var client = null;
// var targets = [];
//
// var init = function(req, res, next) {
//   Promise.resolve().then(() => {
//       console.log("Create a client and set the wallet location");
//       client = new hfc();
//       return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
//   }).then((wallet) => {
//       console.log("Set wallet path, and associate user ", options.user_id, " with application");
//       client.setStateStore(wallet);
//       return client.getUserContext(options.user_id, true);
//   }).then((user) => {
//       console.log("Check user is enrolled, and set a query URL in the network");
//       if (user === undefined || user.isEnrolled() === false) {
//           console.error("User not defined, or not enrolled - error");
//       }
//       channel = client.newChannel(options.channel_id);
//       var peerObj = client.newPeer(options.peer_url);
//       channel.addPeer(peerObj);
//       channel.addOrderer(client.newOrderer(options.orderer_url));
//       targets.push(peerObj);
//       return;
//   });
// };
//
// module.exports = init;
