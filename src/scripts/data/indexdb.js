import { openDB } from 'idb';
import CONFIG from '../../scripts/config.js';

const DB_NAME = 'segarikanDB';
const DB_VERSION = 3;
const STORE_HISTORY = 'history';
const STORE_USERS = 'users';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
}

export async function initDB() {
  return getDB();
}

export async function saveUser(user) {
  const db = await getDB();
  const tx = db.transaction(STORE_USERS, 'readwrite');
  const store = tx.objectStore(STORE_USERS);
  await store.add(user);
  await tx.done;
  return true;
}

export async function getUserByEmail(email) {
  const db = await getDB();
  const tx = db.transaction(STORE_USERS, 'readonly');
  const store = tx.objectStore(STORE_USERS);
  const allUsers = await store.getAll();
  await tx.done;
  return allUsers.find((user) => user.email === email);
}

export async function saveHistoryToDB(data) {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORY, 'readwrite');
  const store = tx.objectStore(STORE_HISTORY);
  
  // pastikan data.result disimpan sebagai array / object (tidak berubah)
  const insertedId = await store.add(data);
  
  await tx.done;

  const token = data.token || localStorage.getItem('token');

  if (!token) {
    console.warn('⚠️ Token tidak ditemukan, data hanya disimpan di IndexedDB.');
    return insertedId;
  }

  try {
    const base64ToBlob = (base64) => {
      const parts = base64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    };

    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.name) formData.append('name', data.name);

    // Perbaikan di sini: pastikan result dikirim sebagai JSON string, supaya server bisa membaca array
    if (data.result) formData.append('result', JSON.stringify(data.result));

    if (data.savedAt) formData.append('savedAt', data.savedAt);

    if (data.imageData) {
      const photoBlob = base64ToBlob(data.imageData);
      formData.append('photo', photoBlob, 'photo.png');
    }

    const response = await fetch(`${CONFIG.BASE_URL}/v1/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const resultJson = await response.json();

    if (!response.ok) {
      console.warn('⚠️ Gagal mengirim data ke server:', resultJson);
    } else {
      console.info('✅ Berhasil mengirim data ke server API:', resultJson);
    }

    return insertedId;
  } catch (error) {
    console.error('❌ Error saat mengirim data ke server:', error);
    return insertedId;
  }
}

export async function getAllHistoryFromDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORY, 'readonly');
  const store = tx.objectStore(STORE_HISTORY);
  const allHistory = await store.getAll();
  await tx.done;
  return allHistory;
}
