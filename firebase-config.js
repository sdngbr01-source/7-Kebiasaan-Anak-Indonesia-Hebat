// ==============================================
// FIREBASE CONFIG - GANTI DENGAN MILIK ANDA!
// ==============================================

// ⚠️ GANTI DENGAN CONFIG DARI FIREBASE CONSOLE ⚠️
const firebaseConfig = {
   apiKey: "AIzaSyDMbpeTLhgD1doC0yk1luyJhnLvQ8C7i5U",
  authDomain: "kaih-2.firebaseapp.com",
  projectId: "kaih-2",
  storageBucket: "kaih-2.firebasestorage.app",
  messagingSenderId: "287927426712",
  appId: "1:287927426712:web:87c0e518145f8cdae4faed"
};

// ==============================================
// INISIALISASI FIREBASE - SIMPLE
// ==============================================

// Global variables
let db;
let firebaseInitialized = false;

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("📁 Loading Firebase...");
    
    try {
        // Check if firebase is available
        if (typeof firebase === 'undefined') {
            console.error("❌ Firebase SDK not loaded!");
            return;
        }
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized");
        
        // Initialize Firestore
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log("✅ Firestore ready");
        
        // Buat admin default di database
        createDefaultAdmin();
        
    } catch (error) {
        console.error("❌ Firebase init error:", error);
        firebaseInitialized = false;
    }
});

// ==============================================
// AUTH SYSTEM - NON-MODULE VERSION
// ==============================================

// Fungsi untuk membuat admin default
async function createDefaultAdmin() {
    if (!firebaseInitialized) return;
    
    try {
        // Cek apakah admin sudah ada
        const snapshot = await db.collection('users')
            .where('nama', '==', 'admin')
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            // Buat admin default
            await db.collection('users').add({
                nama: 'admin',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString(),
                isDefault: true
            });
            console.log("✅ Default admin created");
        }
    } catch (error) {
        console.error("❌ Error creating admin:", error);
    }
}

// Fungsi login
async function loginUser(nama, password = '') {
    console.log("🔐 Login attempt:", nama);
    
    // 1. CEK ADMIN DEFAULT (HARDCODED - PASTI BISA)
    if (nama === 'admin' && password === 'admin123') {
        console.log("✅ Default admin login");
        saveSession({ nama: 'admin', role: 'admin', id: 'admin-default' });
        return { success: true, role: 'admin' };
    }
    
    // 2. CEK DI DATABASE
    if (!firebaseInitialized) {
        return { success: false, message: 'Database offline' };
    }
    
    try {
        const snapshot = await db.collection('users')
            .where('nama', '==', nama)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return { success: false, message: 'Nama tidak terdaftar' };
        }
        
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        // Untuk admin di database, cek password
        if (userData.role === 'admin' && userData.password !== password) {
            return { success: false, message: 'Password salah' };
        }
        
        saveSession({
            nama: userData.nama,
            role: userData.role || 'user',
            id: userDoc.id
        });
        
        return { success: true, role: userData.role || 'user' };
        
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: 'Error database' };
    }
}

// Fungsi simpan session
function saveSession(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('loginTime', new Date().toISOString());
    localStorage.setItem('isLoggedIn', 'true');
}

// Cek apakah sudah login
function isLoggedIn() {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (!loggedIn || !loginTime) return false;
    
    // Cek session expiry (24 jam)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        logout();
        return false;
    }
    
    return true;
}

// Dapatkan user yang sedang login
function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return null;
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Tambah user baru
async function addUser(nama, role = 'user') {
    if (!firebaseInitialized) {
        return { success: false, message: 'Database offline' };
    }
    
    try {
        // Cek jika nama sudah ada
        const check = await db.collection('users')
            .where('nama', '==', nama)
            .limit(1)
            .get();
        
        if (!check.empty) {
            return { success: false, message: 'Nama sudah terdaftar' };
        }
        
        // Tambah user baru
        await db.collection('users').add({
            nama: nama,
            role: role,
            createdAt: new Date().toISOString()
        });
        
        return { success: true, message: 'User berhasil ditambahkan' };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Dapatkan semua user
async function getAllUsers() {
    if (!firebaseInitialized) return [];
    
    try {
        const snapshot = await db.collection('users').get();
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
}

// Hapus user
async function deleteUser(userId) {
    if (!firebaseInitialized) {
        return { success: false, message: 'Database offline' };
    }
    
    try {
        await db.collection('users').doc(userId).delete();
        return { success: true, message: 'User dihapus' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Test koneksi Firebase
async function testFirebaseConnection() {
    if (!firebaseInitialized) {
        return { success: false, message: 'Firebase not initialized' };
    }
    
    try {
        // Test write
        const testRef = await db.collection('test').add({
            test: 'connection',
            timestamp: new Date().toISOString()
        });
        
        // Test read
        const doc = await testRef.get();
        
        // Cleanup
        await db.collection('test').doc(testRef.id).delete();
        
        return { success: true, message: 'Firebase connected!' };
        
    } catch (error) {
        return { success: false, message: 'Error: ' + error.message };
    }
}
// ==============================================
// HABITS-SPECIFIC FUNCTIONS
// ==============================================

// Get user's habits for specific date
async function getHabitsByDate(userId, date) {
    if (!firebaseInitialized) return null;
    
    try {
        const snapshot = await db.collection('habits')
            .where('userId', '==', userId)
            .where('date', '==', date)
            .get();
        
        if (!snapshot.empty) {
            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            };
        }
        return null;
    } catch (error) {
        console.error("Get habits error:", error);
        return null;
    }
}

// Get all habits for user
async function getUserHabits(userId, limit = 30) {
    if (!firebaseInitialized) return [];
    
    try {
        const snapshot = await db.collection('habits')
            .where('userId', '==', userId)
            .get();
        
        const habits = [];
        snapshot.forEach(doc => {
            habits.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by date descending manually
        return habits.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        }).slice(0, limit);
        
    } catch (error) {
        console.error("Get user habits error:", error);
        return [];
    }
}

// Save habits
async function saveHabits(userId, userName, date, habitsData) {
    if (!firebaseInitialized) {
        // Save to localStorage as fallback
        const key = `habits_${userName}_${date}`;
        localStorage.setItem(key, JSON.stringify(habitsData));
        return { success: true, message: 'Saved locally', source: 'localStorage' };
    }
    
    try {
        // Check if exists
        const existing = await getHabitsByDate(userId, date);
        
        const habitDoc = {
            userId: userId,
            userName: userName,
            date: date,
            habits: habitsData,
            points: calculatePoints(habitsData),
            updatedAt: new Date().toISOString(),
            timestamp: new Date().getTime()
        };
        
        if (existing) {
            // Update
            await db.collection('habits').doc(existing.id).update(habitDoc);
            return { success: true, message: 'Updated', id: existing.id };
        } else {
            // Create new
            const result = await db.collection('habits').add({
                ...habitDoc,
                createdAt: new Date().toISOString()
            });
            return { success: true, message: 'Created', id: result.id };
        }
        
    } catch (error) {
        console.error("Save habits error:", error);
        
        // Fallback to localStorage
        const key = `habits_${userName}_${date}`;
        localStorage.setItem(key, JSON.stringify(habitsData));
        return { success: true, message: 'Saved locally due to error', source: 'localStorage' };
    }
}

// Delete habits
async function deleteHabits(userId, date) {
    if (!firebaseInitialized) {
        const user = getCurrentUser();
        const key = `habits_${user.nama}_${date}`;
        localStorage.removeItem(key);
        return { success: true, message: 'Deleted locally' };
    }
    
    try {
        const snapshot = await db.collection('habits')
            .where('userId', '==', userId)
            .where('date', '==', date)
            .get();
        
        if (!snapshot.empty) {
            await db.collection('habits').doc(snapshot.docs[0].id).delete();
            return { success: true, message: 'Deleted from database' };
        }
        return { success: false, message: 'Not found' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Calculate points for habits
function calculatePoints(habitsData) {
    if (!habitsData) return 0;
    
    let points = 0;
    
    // Habit 1: Bangun pagi (2 points if before 6 AM)
    if (habitsData.bangunPagi) {
        const hour = parseInt(habitsData.bangunPagi.split(':')[0]);
        if (hour < 6) points += 2;
        else if (hour < 8) points += 1;
    }
    
    // Habit 2: Ibadah
    const prayers = ['subuh', 'dzuhur', 'ashar', 'magrib', 'isya'];
    const completedPrayers = prayers.filter(p => habitsData[p]).length;
    points += completedPrayers * 1.5; // 1 for prayer + 0.5 for doa
    
    // Add doa points if checked separately
    const doas = ['doaSubuh', 'doaDzuhur', 'doaAshar', 'doaMagrib', 'doaIsya'];
    const completedDoas = doas.filter(d => habitsData[d]).length;
    points += completedDoas * 0.5;
    
    // Habit 3: Olahraga (2 points if filled)
    if (habitsData.olahragaWaktu && habitsData.olahragaJenis) points += 2;
    
    // Habit 4: Makan (1 point per meal)
    const meals = ['makanPagi', 'makanSiang', 'makanMalam'];
    const completedMeals = meals.filter(m => habitsData[m]).length;
    points += completedMeals;
    
    // Habit 5: Belajar (2 points if filled)
    if (habitsData.belajarWaktu && habitsData.belajarMateri) points += 2;
    
    // Habit 6: Bermasyarakat (2 points)
    if (habitsData.bantuOrangTua && habitsData.halDibantu) points += 2;
    
    // Habit 7: Tidur (2 points if before 10 PM)
    if (habitsData.tidurWaktu) {
        const hour = parseInt(habitsData.tidurWaktu.split(':')[0]);
        if (hour < 22) points += 2;
        else if (hour < 24) points += 1;
    }
    
    return points;
}

// Add to window object
window.getHabitsByDate = getHabitsByDate;
window.getUserHabits = getUserHabits;
window.saveHabits = saveHabits;
window.deleteHabits = deleteHabits;
window.calculatePoints = calculatePoints;

// ==============================================
// EXPOSE FUNCTIONS TO WINDOW OBJECT
// ==============================================

// Buat semua fungsi bisa diakses global
window.loginUser = loginUser;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.logout = logout;
window.addUser = addUser;
window.getAllUsers = getAllUsers;
window.deleteUser = deleteUser;
window.testFirebaseConnection = testFirebaseConnection;
window.db = db;
window.firebaseReady = firebaseInitialized;

console.log("✅ Auth system loaded");