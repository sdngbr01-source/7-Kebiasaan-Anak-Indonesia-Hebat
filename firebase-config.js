// firebase-db.js
// =============================================
// FIREBASE DATABASE SYSTEM
// =============================================

// ⚠️ GANTI dengan config dari STEP 5
const firebaseConfig = {
  apiKey: "AIzaSyD5eyduaLigPJGqKYQJAZFZx3xvdm-l7s0",
  authDomain: "kaih-2bea0.firebaseapp.com",
  databaseURL: "https://kaih-2bea0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kaih-2bea0",
  storageBucket: "kaih-2bea0.firebasestorage.app",
  messagingSenderId: "644778400874",
  appId: "1:644778400874:web:979b195a6152e7ed87fe13"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Initialize Firebase Authentication with custom names only
const customAuth = {
    async loginUser(nama) {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('nama', '==', nama).get();
            
            if (snapshot.empty) {
                throw new Error('Nama tidak terdaftar');
            }
            
            const userData = snapshot.docs[0].data();
            localStorage.setItem('userNama', nama);
            localStorage.setItem('userRole', userData.role || 'user');
            localStorage.setItem('userId', snapshot.docs[0].id);
            
            return { success: true, role: userData.role };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Initialize Firebase Authentication with custom names only
const customAuth = {
    async loginUser(nama) {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('nama', '==', nama).get();
            
            if (snapshot.empty) {
                throw new Error('Nama tidak terdaftar');
            }
            
            const userData = snapshot.docs[0].data();
            localStorage.setItem('userNama', nama);
            localStorage.setItem('userRole', userData.role || 'user');
            localStorage.setItem('userId', snapshot.docs[0].id);
            
            return { success: true, role: userData.role };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async registerUser(nama, role = 'user') {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('nama', '==', nama).get();
            
            if (!snapshot.empty) {
                throw new Error('Nama sudah terdaftar');
            }
            
            await usersRef.add({
                nama: nama,
                role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    logout() {
        localStorage.removeItem('userNama');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        return {
            nama: localStorage.getItem('userNama'),
            role: localStorage.getItem('userRole'),
            id: localStorage.getItem('userId')
        };
    },

    isLoggedIn() {
        return localStorage.getItem('userNama') !== null;
    }
};
