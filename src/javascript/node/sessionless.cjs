'use strict';

var secp256k1 = require('ethereum-cryptography/secp256k1');
var keccak_js = require('ethereum-cryptography/keccak.js');
var utils_js = require('ethereum-cryptography/utils.js');
var random_js = require('ethereum-cryptography/random.js');

let getKeysFromDisk;

const AsyncFunction = (async () => {}).constructor;

const generateKeys = async (saveKeys, getKeys) => {
  if(!saveKeys || !getKeys) {
    return console.warn(`Since this can be run on any machine with node, there is no default secure storage. You will need to provide a saveKeys and getKeys function`);
  }
  const privateKey = secp256k1.secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.secp256k1.getPublicKey(privateKey);
  saveKeys && (saveKeys instanceof AsyncFunction ? await saveKeys({
    privateKey,
    publicKey
  }) : saveKeys({
    privateKey,
    publicKey
  }));
  getKeysFromDisk = getKeys;
};

const getKeys = async () => {
  if(!getKeysFromDisk) {
    return console.error(`Since this can be run on any machine with node, there is no default secure storage. You will need to have your own getKeys function.`);
  } else {
    return getKeysFromDisk instanceof AsyncFunction ? await getKeysFromDisk() : getKeysFromDisk();
  }
};

const sign = (message) => {
  const { privateKey } = getKeys();
  const messageHash = keccak_js.keccak256(utils_js.utf8ToBytes(message));
  return secp256k1.secp256k1.sign(messageHash, privateKey);
};

const verifySignature = (signature, message, publicKey) => {
  signature.r + signature.s;
  const messageHash = keccak_js.keccak256(utils_js.utf8ToBytes(message.slice(0,32)));
  let hex = signature.r;
  if (hex.length % 2) { hex = '0' + hex; }

  var bn = BigInt('0x' + hex);

  bn.toString(10);
  let hex2 = signature.s;
  if (hex2.length % 2) { hex2 = '0' + hex2; }

  var bn2 = BigInt('0x' + hex2);

  const signature2 = {
    r: bn,
    s: bn2
  };
  const res = secp256k1.secp256k1.verify(signature2, messageHash, publicKey);
  return res;
};

const generateUUID = () => {
  return  utils_js.bytesToHex(random_js.getRandomBytesSync(32));
};

const sessionless = {
  generateKeys,
  getKeys,
  sign,
  verifySignature,
  generateUUID
};

module.exports = sessionless;