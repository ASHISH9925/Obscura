# OBSCURA

**Secure File Encryption with Invisible Key Storage**

Obscura is a full-stack web application that provides military-grade file encryption using AES-256-GCM and stores encryption keys invisibly inside PNG images using LSB (Least Significant Bit) steganography. The system ensures zero-knowledge architecture where encryption keys never touch the server in plain form.

---

## 🎯 Project Overview

Obscura solves the problem of secure file storage and key management by:
- Encrypting files with AES-256-GCM (authenticated encryption)
- Hiding the encryption key inside a random dog image using steganography
- Storing only encrypted file data on the server
- Providing automatic file expiration based on user-defined time limits
- Tracking encryption analytics for file types

The user uploads a file, receives an encrypted file URL and a key-image. To decrypt, they provide both the file URL and the key-image. Without the key-image, the encrypted file is completely secure.

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB** with **Mongoose** - Database for encrypted files
- **Multer** - File upload handling
- **Sharp** - Image processing for steganography
- **Node.js Crypto module** - AES-256-GCM encryption
- **Pexels API** - Random dog images

**Frontend:**
- **React** with **Vite** - UI framework and build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Framer Motion (motion)** - Animations
- **Lucide React** - Icons

---

## 📂 Project Structure

```
Obscura_Fullstack/
├── backend/
│   ├── app.js                          # Express app entry point
│   ├── package.json                    # Backend dependencies
│   ├── vercel.json                     # Vercel deployment config
│   ├── controllers/
│   │   ├── Encode.js                   # File encryption logic
│   │   ├── Decode.js                   # File decryption logic
│   │   ├── FileHandlers.js             # MongoDB file upload/retrieval
│   │   ├── GraphController.js          # Analytics endpoint
│   │   ├── ImageSteganography.js       # Stego wrapper (Sharp integration)
│   │   ├── StegoLogic.js               # Core LSB hide/show algorithms
│   │   └── HealthCheck.js              # Server health endpoint
│   ├── models/
│   │   ├── File.js                     # Mongoose schema for encrypted files
│   │   └── EncryptionAnalytics.js      # Mongoose schema for file type stats
│   ├── routes/
│   │   ├── EncodeRoutes.js             # POST /api/encode
│   │   ├── DecodeRoutes.js             # POST /api/decode
│   │   ├── FileRoutes.js               # GET /api/file/:id
│   │   ├── GraphRoutes.js              # GET /api/graph
│   │   └── HealthCheckRoute.js         # GET /api/health
│   └── utils/
│       ├── ApiError.js                 # Custom error class
│       ├── ApiResponse.js              # Standardized response wrapper
│       └── AsyncHandler.js             # Async route error handler
├── frontend/
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── vercel.json                     # Frontend deployment config
│   ├── public/
│   │   ├── favicon.png                 # Favicon
│   │   ├── github.png                  # GitHub icon
│   │   └── linkedin.png                # LinkedIn icon
│   └── src/
│       ├── App.jsx                     # Root component
│       ├── main.jsx                    # React entry point
│       ├── index.css                   # Global styles
│       ├── components/
│       │   ├── Dropdown.jsx            # Expiry time dropdown
│       │   ├── GraphCard.jsx           # Analytics visualization
│       │   ├── Navigation.jsx          # Navigation bar
│       │   └── ui/                     # Reusable UI components
│       ├── pages/
│       │   ├── IntroPage.jsx           # Landing page
│       │   ├── EncryptPage.jsx         # File encryption interface
│       │   ├── DecryptPage.jsx         # File decryption interface
│       │   └── FileViewPage.jsx        # File viewing page
│       └── services/
│           └── api.js                  # API client functions
└── README.md
```

---

## 🔐 Encryption Pipeline (End-to-End)

### Step 1: File Upload (`EncryptPage.jsx` → `api.encryptFile()`)

User selects a file (max 15MB) and expiry time from dropdown. Frontend sends:
```javascript
FormData {
  file: <File>,
  expiryMinutes: "1440" // default 24 hours
}
```

### Step 2: Backend Receives File (`Encode.js` → `processFile()`)

**File Encoding (`encodeFileToBinary`):**
```
<filename>\n<mimetype>\n<file_bytes>
```
This format allows the system to reconstruct the original file with its name and type after decryption.

**AES-256-GCM Encryption (`encryptBinaryData`):**
```javascript
const key = crypto.randomBytes(32);  // 256-bit key
const iv = crypto.randomBytes(12);   // 96-bit initialization vector
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
const authTag = cipher.getAuthTag(); // 128-bit authentication tag

// Output format: IV (12 bytes) | Ciphertext | Auth Tag (16 bytes)
const encryptedData = Buffer.concat([iv, encrypted, authTag]);
```

**Why AES-256-GCM?**
- **AES-256**: Industry-standard symmetric encryption, 256-bit key provides maximum security
- **GCM Mode**: Galois/Counter Mode provides both encryption AND authentication
- **Auth Tag**: Prevents tampering - decryption fails if data is modified
- **Unique IV**: Each encryption uses a fresh random IV, preventing pattern analysis

### Step 3: Key Steganography (`ImageSteganography.js`)

**Process:** Fetch random dog image from Pexels → Convert to raw RGBA pixels using Sharp → Hide key using LSB

**Hide Key using LSB (`StegoLogic.js` → `hide()`):**

The `hide()` function embeds the AES key (as hex string) into the least significant bit of each pixel byte:

1. **Write message length (32 bits):**
   ```javascript
   for (let i = 0; i < 32; i++) {
     const bit = (msgLen >> i) & 1;
     modifiedBuffer[offset] = (modifiedBuffer[offset] & 0xfe) | bit;
     offset++;
   }
   ```
   Stores the length of the key string in the first 32 bytes.

2. **Write each character (8 bits per character):**
   ```javascript
   for (let i = 0; i < msgLen; i++) {
     const charByte = messageBuffer[i];
     for (let j = 0; j < 8; j++) {
       const bit = (charByte >> j) & 1;
       modifiedBuffer[offset] = (modifiedBuffer[offset] & 0xfe) | bit;
       offset++;
     }
   }
   ```
   Each character takes 8 bytes. The operation `& 0xfe` clears the LSB, then `| bit` sets it.

**Example:** Pixel byte `11010110` becomes `11010111` - only LSB changed, invisible to the eye.

Modified pixels are re-encoded to PNG using Sharp.

### Step 4: Store Encrypted File (`FileHandlers.js` → `uploadFile()`)

```javascript
const newFile = new File({
  data: encryptedData,  // Buffer containing IV|ciphertext|authTag
  expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
});
await newFile.save();
```

MongoDB TTL index automatically deletes expired files:
```javascript
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

**Analytics Update:**
```javascript
await EncryptionAnalytics.findOneAndUpdate(
  { mimetype: mimetype },
  { $inc: { count: 1 } },
  { upsert: true }
);
```

### Step 5: Response to Client

```javascript
res.json({
  accessUrl: `${BASE_URL}/api/file/${fileId}`,
  keyImageDataUrl: `data:image/png;base64,${imageBuffer.toString('base64')}`,
  keyImageName: `key-${Date.now()}.png`
});
```

User downloads the key-image (contains hidden AES key) and saves the file URL.

---

## 🔓 Decryption Pipeline (End-to-End)

### Step 1: User Provides Inputs (`DecryptPage.jsx`)

User enters:
- **File URL**: `https://obscura.com/api/file/676a9b8c123456789`
- **Key Image**: Uploads the PNG with hidden key

### Step 2: Backend Receives Request (`Decode.js` → `processFile()`)

**Process:** Extract File ID from URL → Convert key-image to raw pixels → Extract hidden key using LSB

**LSB Extraction (`StegoLogic.js` → `show()`):**

1. **Read message length:**
   ```javascript
   let msgLen = 0;
   for (let i = 0; i < 32; i++) {
     const bit = rawBuffer[offset] & 1;  // Extract LSB
     msgLen = msgLen | (bit << i);
     offset++;
   }
   ```

2. **Read each character:**
   ```javascript
   for (let i = 0; i < msgLen; i++) {
     let charByte = 0;
     for (let j = 0; j < 8; j++) {
       const bit = rawBuffer[offset] & 1;
       charByte = charByte | (bit << j);
       offset++;
     }
     messageBuffer[i] = charByte;
   }
   ```

Result: The original AES key as a hex string.

### Step 3: Retrieve Encrypted File from MongoDB

### Step 4: Decrypt File (`decryptBinaryData()`)

```javascript
const iv = encryptedData.slice(0, 12);
const authTag = encryptedData.slice(-16);
const encrypted = encryptedData.slice(12, -16);

const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(authTag);

const decrypted = Buffer.concat([
  decipher.update(encrypted),
  decipher.final()  // Throws error if auth tag verification fails
]);
```

**Auth Tag Verification:** If tampered, `decipher.final()` throws an error.

### Step 5: Decode File Format (`decodeBinaryToFile()`)

```javascript
const firstNewlineIndex = data.indexOf('\n');
const nameBuffer = data.slice(0, firstNewlineIndex);

const secondNewlineIndex = data.indexOf('\n', firstNewlineIndex + 1);
const mimeBuffer = data.slice(firstNewlineIndex + 1, secondNewlineIndex);

const fileBuffer = data.slice(secondNewlineIndex + 1);

return {
  originalName: nameBuffer.toString("utf8"),
  mimeType: mimeBuffer.toString("utf8"),
  fileBuffer: fileBuffer
};
```

### Step 6: Stream File to User

User receives the original file with name and MIME type preserved.

---

## ✨ Features

- ✅ **AES-256-GCM Encryption**: Military-grade authenticated encryption
- ✅ **LSB Steganography**: Invisible key storage in PNG images
- ✅ **Zero-Knowledge Architecture**: Keys never stored on server
- ✅ **Automatic File Expiration**: User-configurable TTL (10 min to 7 days)
- ✅ **15MB File Limit**: Supports files up to 15MB
- ✅ **Universal File Support**: Any file type (detected by MIME type)
- ✅ **Encryption Analytics**: Live statistics of file type usage
- ✅ **Random Image Selection**: Keys hidden in random dog images from Pexels
- ✅ **Original Filename Preservation**: Decrypted files retain original names
- ✅ **Tamper Detection**: Auth tag verification prevents modified files from decrypting
- ✅ **Responsive UI**: Mobile-friendly interface with animations
- ✅ **One-Click Download**: Easy download of key-images and decrypted files

---

## 🚀 Setup

### Prerequisites
- Node.js v18+, MongoDB, Pexels API Key

### Backend
```bash
cd backend
npm install
# Create .env with: PORT, MONGO_URI, APIKEY
npm run dev  # or npm start
```

### Frontend
```bash
cd frontend
npm install
# Create .env with: VITE_REACT_APP_BACKEND_BASEURL
npm run dev
```

---

## 📖 Usage

### Encrypting a File

1. **Navigate to Encrypt Page** - Click on "Encrypt" in the navigation
2. **Upload File** - Drag and drop or click to select a file (max 15MB)
3. **Set Expiry Time** - Choose from dropdown:
   - 10 minutes
   - 1 hour
   - 24 hours (default)
   - 7 days
4. **Click Encrypt** - Wait for processing
5. **Download Key-Image** - Save the PNG image containing your encryption key
   - ⚠️ **Keep this safe!** Without it, your file cannot be decrypted
6. **Copy File URL** - Save the URL to access your encrypted file later

### Decrypting a File

1. **Navigate to Decrypt Page** - Click on "Decrypt" in the navigation
2. **Paste File URL** - Enter the URL you received during encryption
3. **Upload Key-Image** - Select the PNG image you downloaded earlier
4. **Click Decrypt** - The system will extract the key and decrypt your file
5. **Download File** - Your original file will be downloaded with its original name

### Important Notes

- **File Expiration**: Files are automatically deleted after the selected expiry time
- **Key Security**: The key-image is the ONLY way to decrypt your file - store it securely
- **No Recovery**: Lost key-images cannot be recovered - files are permanently inaccessible
- **File Size**: Maximum file size is 15MB due to MongoDB document size limits

---

## 📄 License

MIT License - **Ashish Ajay Sharma** ([LinkedIn](https://www.linkedin.com/in/ashish-sharma-31a229281/))

See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Pexels API** for free stock images
- **Sharp** library for image processing
- **MongoDB** for document storage
- **Vercel & Render** for deployment

---

**Built with ❤️ using Node.js, React, and modern cryptography**
