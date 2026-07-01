import sodium from 'libsodium-wrappers';
let ready = false;
async function ensureReady() {
  if (!ready) {
    await sodium.ready;
    ready = true;
  }
}

// --------------------------------------------------------------
// Stockage local de la clé privée (IndexedDB, jamais envoyée au serveur)
// --------------------------------------------------------------
const DB_NAME = 'arc-en-ciel-keys';
const STORE_NAME = 'keys';

function openKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePrivateKey(userId: string, privateKey: Uint8Array) {
  const db = await openKeyDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(privateKey, userId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePublicKey(userId: string, publicKey: Uint8Array) {
  const db = await openKeyDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(publicKey, userId + ':public');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPublicKey(userId: string): Promise<Uint8Array | null> {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(userId + ':public');
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getPrivateKey(userId: string): Promise<Uint8Array | null> {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(userId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

// --------------------------------------------------------------
// Génération de la paire de clés (à l'onboarding, une seule fois)
// --------------------------------------------------------------
export async function generateKeyPair() {
  await ensureReady();
  const kp = sodium.crypto_box_keypair();
  return { publicKey: kp.publicKey, privateKey: kp.privateKey };
}

// --------------------------------------------------------------
// Chiffrement / déchiffrement de messages (crypto_box — E2E réel,
// pas de clé partagée à gérer côté serveur)
// --------------------------------------------------------------
export async function encryptMessage(
  plaintext: string,
  myPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
) {
  await ensureReady();
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(plaintext),
    nonce,
    theirPublicKey,
    myPrivateKey
  );
  return sodium.to_base64(new Uint8Array([...nonce, ...ciphertext]));
}

export async function decryptMessage(
  blobBase64: string,
  myPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
) {
  await ensureReady();
  const blob = sodium.from_base64(blobBase64);
  const nonce = blob.slice(0, sodium.crypto_box_NONCEBYTES);
  const ciphertext = blob.slice(sodium.crypto_box_NONCEBYTES);
  const plaintext = sodium.crypto_box_open_easy(ciphertext, nonce, theirPublicKey, myPrivateKey);
  return sodium.to_string(plaintext);
}
