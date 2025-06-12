import { openDB } from 'idb';
import CONFIG from '../../scripts/config.js';

const DB_NAME = 'segarikanDB';
const DB_VERSION = 3;
const STORE_HISTORY = 'history';
const STORE_USERS = 'users';

// Membuka atau menginisialisasi IndexedDB
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

// Fungsi inisialisasi awal DB
export async function initDB() {
  return getDB();
}

// Menyimpan data user ke IndexedDB
export async function saveUser(user) {
  if (!user || !user.email) {
    console.warn('⚠️ Data user tidak valid:', user);
    return false;
  }

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_USERS, 'readwrite');
    const store = tx.objectStore(STORE_USERS);
    await store.add(user);
    await tx.done;
    return true;
  } catch (error) {
    console.error('❌ Gagal menyimpan user:', error);
    return false;
  }
}

// Mengambil user berdasarkan email
export async function getUserByEmail(email) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_USERS, 'readonly');
    const store = tx.objectStore(STORE_USERS);
    const allUsers = await store.getAll();
    await tx.done;
    return allUsers.find((user) => user.email === email);
  } catch (error) {
    console.error('❌ Gagal mengambil user:', error);
    return null;
  }
}

// Mengubah base64 ke Blob
function base64ToBlob(base64) {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; i++) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

// Menyimpan riwayat ke IndexedDB dan mengirim ke server (jika ada token)
export async function saveHistoryToDB(data) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    const insertedId = await store.add(data);
    await tx.done;

    const token = data.token || localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Token tidak ditemukan, data hanya disimpan di IndexedDB.');
      return insertedId;
    }

    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.name) formData.append('name', data.name);
    if (data.savedAt) formData.append('savedAt', data.savedAt);
    if (data.result) formData.append('result', JSON.stringify(data.result));
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
    console.error('❌ Error saat menyimpan/mengirim riwayat:', error);
    return null;
  }
}

// Mengambil semua data riwayat dari IndexedDB
export async function getAllHistoryFromDB() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_HISTORY, 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const allHistory = await store.getAll();
    await tx.done;
    return allHistory;
  } catch (error) {
    console.error('❌ Gagal mengambil data riwayat:', error);
    return [];
  }
}
