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
  const insertedId = await store.add(data);
  await tx.done;

  // Ambil token dari data.token jika ada, jika tidak ada coba dari localStorage
  const token = data.token || localStorage.getItem('token');

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
    if (data.result) formData.append('result', data.result);
    if (data.savedAt) formData.append('savedAt', data.savedAt);

    if (data.imageData) {
      const photoBlob = base64ToBlob(data.imageData);
      formData.append('photo', photoBlob, 'photo.png');
    } else {
      console.warn('⚠️ Data imageData kosong, API mungkin akan menolak request');
    }

    const response = await fetch(`${CONFIG.BASE_URL}/v1/stories`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorJson = await response.json();
      console.error('❌ Gagal mengirim data ke API:', response.status, errorJson);
    } else {
      const result = await response.json();
      console.log('✅ Data history berhasil dikirim ke API:', result);
    }
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat mengirim ke API:', error);
  }

  return insertedId;
}

// Perbaikan: saat getAllHistoryFromDB, kita format savedAt jadi Date object untuk memudahkan grafik nanti
export async function getAllHistoryFromDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORY, 'readonly');
  const store = tx.objectStore(STORE_HISTORY);
  const allHistory = await store.getAll();
  await tx.done;

  // Format savedAt ke Date, supaya mudah dipakai di grafik
  return allHistory.map(item => ({
    ...item,
    savedAt: item.savedAt ? new Date(item.savedAt) : null,
  }));
}
