import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';

// Auth / User Sync
export async function syncUser(firebaseUser: any) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  try {
    const snap = await getDoc(userRef);
    let data = snap.exists() ? snap.data() : null;
    let isAdmin = data ? data.isAdmin : false;

    if (firebaseUser.email === 'ava.ingenieria1@gmail.com' || firebaseUser.email === 'admin@bodegon.com') {
       isAdmin = true;
    }

    if (!snap.exists()) {
      const newUser = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'No Name',
        isAdmin: false,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newUser);
      return { uid: firebaseUser.uid, ...newUser, isAdmin }; // Keep local isAdmin override true
    }
    return { uid: firebaseUser.uid, ...data, isAdmin };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
  }
}

export async function getUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

// Categories
export async function getCategories() {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'categories');
  }
}

export async function addCategory(id: string, name: string, description: string, icon: string) {
  try {
    await setDoc(doc(db, 'categories', id), { name, description, icon });
  } catch(error) {
    handleFirestoreError(error, OperationType.CREATE, 'categories');
  }
}

// Products
export async function getProducts() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
}

export async function addProduct(id: string, product: any) {
  try {
    await setDoc(doc(db, 'products', id), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch(error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
  }
}

export async function updateProduct(id: string, product: any) {
  try {
    await updateDoc(doc(db, 'products', id), {
      ...product,
      updatedAt: serverTimestamp()
    });
  } catch(error) {
    handleFirestoreError(error, OperationType.UPDATE, 'products');
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch(error) {
    handleFirestoreError(error, OperationType.DELETE, 'products');
  }
}

export async function deleteCategory(id: string) {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch(error) {
    handleFirestoreError(error, OperationType.DELETE, 'categories');
  }
}

// Orders
export async function createOrder(items: any[], total: number, details?: any) {
  if (!auth.currentUser) throw new Error("Must be logged in");
  try {
    const realId = doc(collection(db, 'orders')).id;
    await setDoc(doc(db, 'orders', realId), {
      userId: auth.currentUser.uid,
      items,
      total,
      status: 'pending',
      ...details,
      createdAt: serverTimestamp()
    });
    return realId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
}

export async function getUserOrders(userId: string) {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function getAllOrders() {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch(error) {
    handleFirestoreError(error, OperationType.UPDATE, 'orders');
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch(error) {
    handleFirestoreError(error, OperationType.DELETE, 'orders');
  }
}
