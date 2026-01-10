// firebase-db.js
// =============================================
// FIREBASE DATABASE SYSTEM
// =============================================

// ⚠️ GANTI dengan config dari STEP 5
const firebaseConfig = {
  apiKey: "AIzaSyCDmui8vy85LQDgh_LG1llsOxocQhD5JFo",
  authDomain: "kebiasaan-indonesia.firebaseapp.com",
  projectId: "kebiasaan-indonesia",
  storageBucket: "kebiasaan-indonesia.firebasestorage.app",
  messagingSenderId: "1083238000129",
  appId: "1:1083238000129:web:b4aa1f596fbfc37c3a0200"
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
