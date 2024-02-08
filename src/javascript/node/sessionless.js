import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { bytesToHex } from "ethereum-cryptography/utils.js";
import { getRandomBytesSync } from "ethereum-cryptography/random.js";

let getKeysFromDisk;

const AsyncFunction = (async () => {}).constructor;

const generateKeys = (saveKeys, getKeys) => {
  if(!saveKeys || !getKeys) {
    return console.warn(`Since this can be run on any machine with node, there is no default secure storage. You will need to provide a saveKeys and getKeys function`);
  }
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
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
  const messageHash = keccak256(utf8ToBytes(message));
  return secp256k1.sign(messageHash, privateKey);
};

const verifySignature = (signature, message) => {
  const { publicKey } = getKeys();
  const messageHash = keccak256(utf8ToBytes(message));
  return secp256k1.verify(signature, messageHash, publicKey);
};

const generateUUID = () => {
  return  bytesToHex(getRandomBytesSync(32));
};

const sessionless = {
  generateKeys,
  getKeys,
  sign,
  verifySignature,
  generateUUID
};

export default sessionless;