import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const productosRef = collection(db, "productos");

// Traer todos los productos
export async function getProductos() {
  const snapshot = await getDocs(productosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Agregar un producto nuevo
export async function addProducto(producto) {
 return await addDoc(productosRef, producto);
}

// Actualizar stock de un producto
export async function updateStock(id, nuevoStock) {
  const ref = doc(db, "productos", id);
  await updateDoc(ref, { stock: nuevoStock });
}

// Eliminar un producto
export async function deleteProducto(id) {
  const ref = doc(db, "productos", id);
  await deleteDoc(ref);
}