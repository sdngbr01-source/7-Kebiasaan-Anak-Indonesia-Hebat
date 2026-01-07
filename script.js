// =============================================
// SISTEM MANAJEMEN USER & 7 KEBISAAN ANAK HEBAT
// =============================================

// Database user untuk simulasi (bisa diganti dengan upload Excel)
let usersDatabase = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

// Data default jika belum ada
if (usersDatabase.length === 0) {
    usersDatabase = [
        { id: 'USER_001', name: 'Ahmad Fauzi', code: 'AF2024', class: '5A', isActive: true },
        { id: 'USER_002', name: 'Siti Rahma', code: 'SR2024', class: '5B', isActive: true },
        { id: 'USER_003', name: 'Budi Santoso', code: 'BS2024', class: '6A', isActive: true }
    ];
    localStorage.setItem('registeredUsers', JSON.stringify(usersDatabase));
}

// =============================================
// FUNGSI LOGIN USER (TANPA PASSWORD)
// =============================================

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const userCode = document.getElementById('userCode').value.trim();
    
    console.log("Login attempt:", { username, userCode });
    
    // Cari user di database
    const user = usersDatabase.find(u => 
        u.name.toLowerCase() === username.toLowerCase() ||
        (u.code && u.code === userCode)
    );
    
    if (user) {
        if (!user.isActive) {
            alert('Akun ini tidak aktif. Hubungi admin.');
            return;
        }
        
        console.log("Login berhasil:", user.name);
        
        // Simpan session
        localStorage.setItem('currentUser', user.name);
        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('userCode', user.code || '');
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirect ke dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Nama tidak terdaftar atau kode salah!\n\nHubungi admin untuk registrasi.');
    }
}

// =============================================
// FUNGSI LOGOUT
// =============================================

function handleLogout() {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('userCode');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// =============================================
// VALIDASI DASHBOARD
// =============================================

function validateDashboardAccess() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    const currentUserId = localStorage.getItem('currentUserId');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !currentUser || !currentUserId) {
        alert('Anda belum login!');
        window.location.href = 'login.html';
        return false;
    }
    
    // Cek apakah user terdaftar
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = users.some(u => 
        u.id === currentUserId && u.name === currentUser
    );
    
    if (!userExists) {
        alert('Akun tidak terdaftar atau telah dihapus!');
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// =============================================
// SETUP DASHBOARD (7 KEBISAAN)
// =============================================

function setupDashboard() {
    if (!validateDashboardAccess()) {
        return;
    }
    
    const currentUser = localStorage.getItem('currentUser');
    const currentUserId = localStorage.getItem('currentUserId');
    
    // Tampilkan data user
    document.getElementById('userName').textContent = currentUser;
    
    // Buat avatar dari inisial
    const initials = currentUser.split(' ').map(n => n[0]).join('').toUpperCase();
    if (initials && document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').textContent = initials.substring(0, 2);
    }
    
    // Tampilkan tanggal
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (document.getElementById('currentDate')) {
        document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
    }
    
    // Setup form submission
    const habitsForm = document.getElementById('habitsForm');
    if (habitsForm) {
        habitsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveHabitsData(currentUser, currentUserId);
        });
    }
    
    // Setup progress indicator
    setupProgressIndicator();
    
    // Setup logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// =============================================
// SIMPAN DATA 7 KEBISAAN
// =============================================

function saveHabitsData(username, userId) {
    // Kumpulkan data dari form
    const formData = {
        userId: userId,
        username: username,
        date: new Date().toISOString().split('T')[0],
        habits: {
            // Kebiasaan 1: Bangun Pagi
            wakeupTime: document.getElementById('wakeupTime').value,
            
            // Kebiasaan 2: Ibadah
            sholat: Array.from(document.querySelectorAll('input[name="sholat[]"]:checked')).map(cb => cb.value),
            
            // Kebiasaan 3: Olahraga
            exerciseTime: document.getElementById('exerciseTime').value,
            exerciseType: document.getElementById('exerciseType').value,
            exerciseOther: document.getElementById('exerciseOther').value,
            
            // Kebiasaan 4: Makan
            breakfastTime: document.getElementById('breakfastTime').value,
            breakfastMenu: document.getElementById('breakfastMenu').value,
            lunchTime: document.getElementById('lunchTime').value,
            lunchMenu: document.getElementById('lunchMenu').value,
            dinnerTime: document.getElementById('dinnerTime').value,
            dinnerMenu: document.getElementById('dinnerMenu').value,
            
            // Kebiasaan 5: Belajar
            studyTime: document.getElementById('studyTime').value,
            studySubject: document.getElementById('studySubject').value,
            studyDuration: document.getElementById('studyDuration').value,
            
            // Kebiasaan 6: Bermasyarakat
            helpParents: document.getElementById('helpParents').checked,
            helpDescription: document.getElementById('helpDescription').value,
            
            // Kebiasaan 7: Tidur
            bedtime: document.getElementById('bedtime').value
        },
        submittedAt: new Date().toISOString()
    };
    
    // Validasi data wajib
    if (!formData.habits.wakeupTime) {
        alert('Harap isi jam bangun pagi!');
        document.getElementById('wakeupTime').focus();
        return;
    }
    
    if (!formData.habits.bedtime) {
        alert('Harap isi jam tidur malam!');
        document.getElementById('bedtime').focus();
        return;
    }
    
    // Simpan ke localStorage
    const existingData = JSON.parse(localStorage.getItem('habitsData') || '[]');
    
    // Cek apakah sudah ada data untuk hari ini
    const today = new Date().toISOString().split('T')[0];
    const existingTodayIndex = existingData.findIndex(item => 
        item.userId === userId && item.date === today
    );
    
    if (existingTodayIndex >= 0) {
        if (confirm('Anda sudah mengisi data hari ini. Update data yang ada?')) {
            existingData[existingTodayIndex] = formData;
        } else {
            return;
        }
    } else {
        existingData.push(formData);
    }
    
    localStorage.setItem('habitsData', JSON.stringify(existingData));
    
    // Tampilkan konfirmasi
    alert('✅ Data 7 kebiasaan berhasil disimpan!\n\nTerima kasih sudah menjadi Anak Indonesia Hebat!');
    
    // Reset form (opsional)
    // document.getElementById('habitsForm').reset();
}

// =============================================
// PROGRESS INDICATOR
// =============================================

function setupProgressIndicator() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const habitForms = document.querySelectorAll('.habit-form');
    
    if (progressSteps.length === 0 || habitForms.length === 0) return;
    
    // Scroll ke form saat step diklik
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            habitForms[index].scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Update progress indicator saat scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        progressSteps.forEach((step, index) => {
            const habitForm = habitForms[index];
            if (!habitForm) return;
            
            const formTop = habitForm.offsetTop;
            const formBottom = formTop + habitForm.offsetHeight;
            
            step.classList.remove('step-active');
            
            if (scrollPosition >= formTop && scrollPosition < formBottom) {
                step.classList.add('step-active');
            }
        });
    });
}

// =============================================
// USER MANAGEMENT (UNTUK ADMIN)
// =============================================

// Fungsi untuk menampilkan modal user management
function showUserManagement() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const modalBody = document.getElementById('modalBody');
    
    if (!modalBody) {
        console.error('Modal body tidak ditemukan!');
        return;
    }
    
    modalBody.innerHTML = `
        <div style="margin-bottom: 25px;">
            <h3 class="modal-title"><i class="fas fa-users"></i> Manajemen User</h3>
            <p>Kelola user yang bisa login ke sistem</p>
        </div>
     // =============================================
// FUNGSI TAMBAHAN UNTUK ADMIN DASHBOARD
// =============================================

// Show upload users modal (untuk di script.js)
function showUploadUsers() {
    const modalBody = document.getElementById('modalBody');
    
    if (!modalBody) {
        console.error('Modal body tidak ditemukan di showUploadUsers');
        return;
    }
    
    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 class="modal-title"><i class="fas fa-user-plus"></i> Upload User dari Excel</h3>
            <p>Upload file Excel berisi data user yang akan didaftarkan</p>
        </div>
        
        <div class="upload-area" id="userUploadArea" onclick="document.getElementById('userFileInput').click()">
            <div class="upload-icon">
                <i class="fas fa-file-excel"></i>
            </div>
            <h4>Klik atau tarik file Excel ke sini</h4>
            <p>Format harus .xlsx (Excel) dengan kolom sesuai template</p>
            <input type="file" id="userFileInput" accept=".xlsx,.xls" style="display:none" 
                   onchange="handleUserUpload(this.files[0])">
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h5><i class="fas fa-info-circle"></i> Format Kolom:</h5>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 0.9rem;">
                <li><strong>Kolom A:</strong> Nama Lengkap (wajib)</li>
                <li><strong>Kolom B:</strong> Kelas (opsional)</li>
                <li><strong>Kolom C:</strong> Kode User (opsional, jika kosong akan digenerate)</li>
                <li><strong>Kolom D:</strong> Catatan (opsional)</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="action-btn" onclick="downloadUserTemplate()">
                <i class="fas fa-download"></i> Download Template
            </button>
        </div>
    `;
    
    openModal();
}

// =============================================
// FUNGSI MODAL (jika belum ada di file script.js)
// =============================================

function openModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('Modal dengan ID "uploadModal" tidak ditemukan');
    }
}

function closeModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// =============================================
// INISIALISASI GLOBAL UNTUK ADMIN
// =============================================

// Tambahkan event listener untuk modal close
document.addEventListener('DOMContentLoaded', function() {
    // Close modal ketika klik di luar konten
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal dengan Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

});
// =============================================
// GITHUB DATABASE SYNC
// =============================================

const GITHUB_TOKEN = 'your_token_here';
const REPO_OWNER = 'username';
const REPO_NAME = '7kebiasaan-data';
const DB_FILE = 'db.json';

// Fungsi untuk sync data ke GitHub
async function syncToGitHub() {
    try {
        // Get current data from localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const habits = JSON.parse(localStorage.getItem('habitsData') || '[]');
        
        // Get current db.json from GitHub
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DB_FILE}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        let currentData = { users: [], habits: [] };
        let sha = '';
        
        if (response.ok) {
            const data = await response.json();
            currentData = JSON.parse(atob(data.content));
            sha = data.sha;
        }
        
        // Merge data (prevent duplicates)
        const mergedUsers = mergeArrays(currentData.users, users);
        const mergedHabits = mergeArrays(currentData.habits, habits);
        
        // Save back to GitHub
        const newData = {
            users: mergedUsers,
            habits: mergedHabits,
            lastSync: new Date().toISOString()
        };
        
        const updateResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DB_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Sync data ${new Date().toLocaleString()}`,
                    content: btoa(JSON.stringify(newData, null, 2)),
                    sha: sha
                })
            }
        );
        
        if (updateResponse.ok) {
            console.log('✅ Data synced to GitHub');
            // Update localStorage dengan merged data
            localStorage.setItem('registeredUsers', JSON.stringify(mergedUsers));
            localStorage.setItem('habitsData', JSON.stringify(mergedHabits));
        }
        
    } catch (error) {
        console.error('Sync error:', error);
    }
}

function mergeArrays(arr1, arr2) {
    const merged = [...arr1];
    const ids = new Set(arr1.map(item => item.id));
    
    arr2.forEach(item => {
        if (!ids.has(item.id)) {
            merged.push(item);
            ids.add(item.id);
        }
    });
    
    return merged;
}

// Sync every 5 minutes
setInterval(syncToGitHub, 5 * 60 * 1000);

// Sync on page load
document.addEventListener('DOMContentLoaded', syncToGitHub);
