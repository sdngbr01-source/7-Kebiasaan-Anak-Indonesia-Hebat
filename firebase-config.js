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
    },
  // Inisialisasi Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const db = firebase.firestore();

// ==============================================
// SIMPLE AUTH SYSTEM - PASTI WORK
// ==============================================
const SimpleAuth = {
    // DEFAULT ADMIN - SELALU ADA
    defaultAdmin: {
        nama: "admin",
        password: "admin123",
        role: "admin"
    },

    // Login function - SIMPLE
    async login(nama, password = "") {
        console.log("Login attempt:", nama);
        
        // 1. CEK DEFAULT ADMIN DULU
        if (nama === "admin" && password === "admin123") {
            console.log("Default admin login successful");
            this.saveUserSession({
                nama: "admin",
                role: "admin",
                id: "default-admin-001"
            });
            return { success: true, role: "admin" };
        }
        
        try {
            // 2. CEK DI DATABASE
            const snapshot = await db.collection("users")
                .where("nama", "==", nama)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                console.log("User not found in database");
                return { 
                    success: false, 
                    message: "Nama tidak terdaftar! Hubungi admin." 
                };
            }
            
            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            
            // 3. SIMPAN SESSION
            this.saveUserSession({
                nama: userData.nama,
                role: userData.role || "user",
                id: userDoc.id
            });
            
            console.log("User login successful:", userData.nama);
            return { 
                success: true, 
                role: userData.role || "user" 
            };
            
        } catch (error) {
            console.error("Database error:", error);
            return { 
                success: false, 
                message: "Error database: " + error.message 
            };
        }
    },

    // Simpan session ke localStorage
    saveUserSession(user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userNama", user.nama);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user.id);
        
        // Tambahkan timestamp
        localStorage.setItem("loginTime", new Date().toISOString());
    },

    // Cek apakah user sudah login
    isLoggedIn() {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userData = localStorage.getItem("currentUser");
        
        if (!loggedIn || !userData) {
            return false;
        }
        
        // Cek session masih valid (24 jam)
        const loginTime = localStorage.getItem("loginTime");
        if (loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.logout();
                return false;
            }
        }
        
        return true;
    },

    // Get current user
    getCurrentUser() {
        if (!this.isLoggedIn()) return null;
        
        try {
            const userData = localStorage.getItem("currentUser");
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userNama");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("loginTime");
        
        // Redirect ke login
        window.location.href = "login.html";
    },

    // Tambah user baru (admin only)
    async addUser(nama, role = "user") {
        try {
            // Cek apakah nama sudah ada
            const check = await db.collection("users")
                .where("nama", "==", nama)
                .limit(1)
                .get();
            
            if (!check.empty) {
                return { success: false, message: "Nama sudah terdaftar!" };
            }
            
            // Tambah user baru
            await db.collection("users").add({
                nama: nama,
                role: role,
                createdAt: new Date().toISOString(),
                createdBy: this.getCurrentUser()?.nama || "system"
            });
            
            return { success: true, message: "User berhasil ditambahkan!" };
            
        } catch (error) {
            console.error("Add user error:", error);
            return { success: false, message: "Error: " + error.message };
        }
    },

    // Get all users (admin only)
    async getAllUsers() {
        try {
            const snapshot = await db.collection("users").get();
            const users = [];
            
            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return users;
        } catch (error) {
            console.error("Get users error:", error);
            return [];
        }
    },

    // Hapus user (admin only)
    async deleteUser(userId) {
        try {
            await db.collection("users").doc(userId).delete();
            return { success: true, message: "User berhasil dihapus!" };
        } catch (error) {
            return { success: false, message: "Error: " + error.message };
        }
    },

    // Initialize default admin di database
    async initDefaultAdmin() {
        try {
            const check = await db.collection("users")
                .where("nama", "==", "admin")
                .limit(1)
                .get();
            
            if (check.empty) {
                await db.collection("users").add({
                    nama: "admin",
                    password: "admin123",
                    role: "admin",
                    createdAt: new Date().toISOString(),
                    createdBy: "system"
                });
                console.log("Default admin created in database");
            }
        } catch (error) {
            console.error("Init admin error:", error);
        }
    }
};

// Auto-initialize default admin
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            SimpleAuth.initDefaultAdmin();
        }, 2000);
    });
}

// Global variable
window.SimpleAuth = SimpleAuth;
window.db = db;
