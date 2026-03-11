// SCRIPT DE IMPORTACIÓN - Ejecutar una sola vez
// Carga todos los productos del Excel a Firebase

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import productos from "./productos_import.js";

// REEMPLAZÁ estos valores con los de tu firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAaLM8CjQ-ObD0lNGWRfvRL8MwoAgTF1fk",
  authDomain: "stock-ml-b6fb9.firebaseapp.com",
  projectId: "stock-ml-b6fb9",
  storageBucket: "stock-ml-b6fb9.firebasestorage.app",
  messagingSenderId: "1070705170988",
  appId: "1:1070705170988:web:f277480bd46f92dc4f8f89"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importar() {
  console.log(`Importando ${productos.length} productos...`);
  let ok = 0;
  for (const p of productos) {
    try {
      await addDoc(collection(db, "productos"), p);
      ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${productos.length} cargados...`);
    } catch (e) {
      console.error("Error en", p.sku, e.message);
    }
  }
  console.log(`✅ Listo! ${ok} productos cargados en Firebase.`);
}

importar();
