# Website 7 Kebiasaan Anak Indonesia Hebat

Website interaktif dengan database online menggunakan Firebase.

## 🔧 **Setup Firebase**

### Langkah 1: Buat Project Firebase
1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik "Add project"
3. Beri nama: `7kebiasaan-anak-indonesia`
4. Non-aktifkan Google Analytics (opsional)
5. Klik "Create project"

### Langkah 2: Tambahkan Web App
1. Di dashboard Firebase, klik ikon web (</>)
2. Register app dengan nama "7 Kebiasaan Website"
3. Copy konfigurasi Firebase
4. Paste ke file `firebase-config.js` pada bagian:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    // ... dll
};
