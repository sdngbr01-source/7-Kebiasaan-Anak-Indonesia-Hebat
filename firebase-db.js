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
try {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized");
} catch (error) {
  console.error("Firebase init error:", error);
}

const database = firebase.database();

// =============================================
// FUNGSI SIMPAN DATA KE CLOUD
// =============================================

async function saveHabitToCloud(habitData) {
  try {
    const userId = localStorage.getItem('currentUserId') || 'guest_' + Date.now();
    const habitId = 'habit_' + Date.now();
    
    await database.ref(`habits/${userId}/${habitId}`).set({
      ...habitData,
      savedAt: new Date().toISOString()
    });
    
    console.log("✅ Data saved to cloud");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Cloud save error:", error);
    
    // Save to localStorage as backup
    const pending = JSON.parse(localStorage.getItem('pendingHabits') || '[]');
    pending.push({
      data: habitData,
      timestamp: Date.now()
    });
    localStorage.setItem('pendingHabits', JSON.stringify(pending));
    
    return { success: false, error: error.message };
  }
}

// =============================================
// FUNGSI BACA DATA DARI CLOUD
// =============================================

async function getAllHabitsFromCloud() {
  try {
    const snapshot = await database.ref('habits').once('value');
    const allHabits = snapshot.val();
    
    if (!allHabits) return [];
    
    // Convert ke array
    let habitsArray = [];
    
    Object.keys(allHabits).forEach(userId => {
      Object.keys(allHabits[userId] || {}).forEach(habitId => {
        habitsArray.push({
          userId: userId,
          habitId: habitId,
          ...allHabits[userId][habitId]
        });
      });
    });
    
    console.log(`📊 Loaded ${habitsArray.length} habits from cloud`);
    return habitsArray;
    
  } catch (error) {
    console.error("❌ Cloud load error:", error);
    return [];
  }
}

// Export functions
window.FirebaseDB = {
  saveHabit: saveHabitToCloud,
  getAllHabits: getAllHabitsFromCloud
};
