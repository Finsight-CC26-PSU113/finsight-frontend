<div align="center">

# 💰 Finsight — Frontend

**Platform Literasi Keuangan untuk Generasi Muda Indonesia**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

> Bagian dari Capstone Project **Coding Camp 2026 powered by DBS Foundation**
> Team ID: **CC26-PSU113**

</div>

---

## 📖 Tentang

Repo ini berisi source code **frontend** aplikasi Finsight — antarmuka web yang memungkinkan pengguna mengunggah foto struk belanja, melihat hasil ekstraksi transaksi secara otomatis, dan memantau pola pengeluaran melalui dashboard interaktif.

---

## 🗂️ Struktur Folder

```
finsight-frontend/
├── public/
├── src/
│   ├── assets/              # Gambar, icon, font
│   ├── components/
│   │   ├── layout/          # Layout, Navbar, Sidebar
│   │   └── ui/              # Komponen reusable (Button, Card, dll)
│   ├── context/             # React Context (Auth, dll)
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Halaman utama
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── UploadPage.jsx
│   │   └── TransactionPage.jsx
│   ├── services/
│   │   └── api.js           # Axios instance (auto JWT)
│   ├── utils/               # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## ⚙️ Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 18 | UI Framework |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Styling |
| React Router DOM | 6 | Client-side routing |
| Axios | latest | HTTP client ke backend |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js >= 18
- Backend (`finsight-backend`) sudah berjalan di port `3000`

### Langkah-langkah

```bash
# 1. Clone repo
git clone https://github.com/finsight-cc26/finsight-frontend.git
cd finsight-frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Jalankan dev server
npm run dev
```

Aplikasi akan berjalan di **http://localhost:5173**

---

## 🌍 Environment Variables

Buat file `.env` dari `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ML_SERVICE_URL=http://localhost:8000
```

---

## 📜 Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview hasil build |

---

## 🔗 Koneksi ke Service Lain

```
Browser
  └── Frontend (React :5173)
        └── /api/* → Backend (Express :3000)  [via Vite proxy]
```

> Proxy dikonfigurasi di `vite.config.js` — tidak perlu setting CORS di dev environment.

---

## 🚢 Deployment

Frontend di-deploy ke **Vercel**.

```bash
npm run build   # output: dist/
```

Push ke branch `main` → Vercel otomatis deploy.

---

## 👤 Maintainer

**Nisa Nur Rahmadani** — Frontend Developer
> Coding Camp 2026 | CC26-PSU113

