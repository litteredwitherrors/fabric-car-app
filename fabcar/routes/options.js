'use strict';

var path = require('path');

var options = {
  wallet_path: path.join(__dirname, '../network/creds'),
  user_id: 'PeerAdmin',
  channel_id: 'mychannel',
  chaincode_id: 'fabcar',
  network_url: 'grpc://localhost:7051',
  peer_url: 'grpc://localhost:7051',
  event_url: 'grpc://localhost:7053',
  orderer_url: 'grpc://localhost:7050'
};

module.exports = options;
