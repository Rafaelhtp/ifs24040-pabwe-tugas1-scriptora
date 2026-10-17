# ✦ Scriptora — Aplikasi Catatan Berbasis Blok Modular

**Scriptora** adalah aplikasi web pencatatan dan manajemen dokumen berbasis blok (*block-based note-taking app*) ala mini Notion yang dibangun menggunakan **HTML5, CSS3 (Custom Properties & Flexbox), dan Vanilla JavaScript** tanpa *framework* eksternal.

Proyek ini dikembangkan untuk memenuhi **Tugas I Mata Kuliah 11S3133 - Pengembangan Aplikasi Berbasis Web (PABWE)** di Institut Teknologi Del.

## ✨ Fitur Utama
- **Manajemen Multi-Halaman:** Membuat, memilih, menyunting judul, dan menghapus halaman dokumen secara dinamis melalui *sidebar*.
- **Editor Berbasis Blok Modular:** Mendukung penambahan dan penghapusan tiga tipe blok konten (*Heading 1*, *Paragraf*, dan *To-Do Checklist*).
- **Interaksi Keyboard ala Notion:** Menekan tombol `Enter` di dalam blok akan otomatis membuat blok baru tepat di bawahnya dan memindahkan fokus kursor.
- **Auto-Save Persisten (`localStorage`):** Seluruh perubahan dokumen, isi blok, status centang *To-Do*, dan preferensi tema tersimpan otomatis di peramban.
- **Dark & Light Mode:** Mendukung pergantian tema gelap dan terang dengan palet warna yang nyaman di mata.

## 📁 Struktur Direktori
```text
scriptora-pabwe/
├── index.html          # Struktur utama antarmuka aplikasi
├── css/
│   └── style.css       # Styling layout Flexbox, komponen blok, dan variabel tema
├── js/
│   └── app.js          # Logika state management, manipulasi DOM, dan localStorage
├── docs/
│   └── Proposal_Tugas1_PABWE_Rafael.pdf  # Dokumen laporan & proposal tugas
└── README.md           # Dokumentasi repositori proyek
```
