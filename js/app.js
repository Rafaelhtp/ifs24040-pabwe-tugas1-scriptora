/**
 * ==========================================================================
 * SCRIPTORA — CORE LOGIC (Vanilla JavaScript)
 * Manajemen dokumen, blok catatan, dan penyimpanan otomatis ke localStorage
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. KONSTANTA & STATE APLIKASI
// --------------------------------------------------------------------------
const STORAGE_KEY_DATA = 'scriptora-data';
const STORAGE_KEY_ACTIVE_DOC = 'scriptora-active-doc';
const STORAGE_KEY_THEME = 'scriptora-theme';

let documents = [];
let activeDocumentId = null;

// --------------------------------------------------------------------------
// 2. REFERENSI ELEMEN DOM
// --------------------------------------------------------------------------
const pageListEl = document.getElementById('page-list');
const btnNewPage = document.getElementById('btn-new-page');
const btnThemeToggle = document.getElementById('btn-theme-toggle');

const pageTitleInput = document.getElementById('page-title-input');
const pageLastEditedEl = document.getElementById('page-last-edited');
const pageBlockCountEl = document.getElementById('page-block-count');
const blocksContainerEl = document.getElementById('blocks-container');

const btnAddH1 = document.getElementById('btn-add-h1');
const btnAddP = document.getElementById('btn-add-p');
const btnAddTodo = document.getElementById('btn-add-todo');

// --------------------------------------------------------------------------
// 3. FUNGSI UTILITAS & PEMBUAT ID / OBJEK
// --------------------------------------------------------------------------

/**
 * Menghasilkan ID unik menggunakan crypto.randomUUID() atau fallback Date.now()
 */
function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Membuat objek blok baru sesuai struktur data
 */
function createBlockObject(type = 'p', content = '', checked = false) {
  return {
    id: generateId('block'),
    type,
    content,
    checked: type === 'todo' ? Boolean(checked) : false,
  };
}

/**
 * Membuat objek dokumen baru (default berjudul "Untitled" dengan 1 blok paragraf kosong)
 */
function createDocumentObject(title = 'Untitled') {
  return {
    id: generateId('doc'),
    title,
    blocks: [createBlockObject('p', '')],
  };
}

/**
 * Menghasilkan 3 dokumen awal (Initial Seed Data) sesuai contoh di index.html
 * saat localStorage masih kosong ketika web pertama kali dibuka.
 */
function getInitialSeedDocuments() {
  return [
    {
      id: 'page-1',
      title: 'Selamat Datang di Scriptora',
      blocks: [
        {
          id: 'block-1',
          type: 'h1',
          content: 'Mulai Menulis dengan Blok',
          checked: false,
        },
        {
          id: 'block-2',
          type: 'p',
          content:
            'Scriptora dirancang dengan estetika minimalis ala Notion. Setiap bagian tulisan Anda tersusun sebagai blok independen yang rapi, bersih, dan nyaman dibaca baik dalam mode terang maupun gelap.',
          checked: false,
        },
        {
          id: 'block-3',
          type: 'todo',
          content: 'Membuat struktur layout HTML5 & CSS3 dengan CSS Variables',
          checked: true,
        },
        {
          id: 'block-4',
          type: 'todo',
          content:
            'Menambahkan interaksi dinamis menggunakan Vanilla JavaScript pada tahap berikutnya',
          checked: false,
        },
      ],
    },
    {
      id: 'page-2',
      title: 'Rencana Proyek Semester 5',
      blocks: [
        {
          id: generateId('block'),
          type: 'h1',
          content: 'Target Akademik & Proyek',
          checked: false,
        },
        {
          id: generateId('block'),
          type: 'todo',
          content: 'Menyelesaikan Tugas 1 Pengembangan Aplikasi Berbasis Web (PABWE)',
          checked: true,
        },
        {
          id: generateId('block'),
          type: 'todo',
          content: 'Merancang arsitektur penyimpanan lokal dan komponen blok interaktif',
          checked: false,
        },
      ],
    },
    {
      id: 'page-3',
      title: 'Catatan Kuliah PABWE',
      blocks: [
        {
          id: generateId('block'),
          type: 'h1',
          content: 'DOM Manipulation & Web Storage API',
          checked: false,
        },
        {
          id: generateId('block'),
          type: 'p',
          content:
            'Event delegation memungkinkan kita menangani event pada banyak elemen anak secara efisien cukup dengan mendaftarkan satu event listener pada elemen induknya.',
          checked: false,
        },
      ],
    },
  ];
}

/**
 * Mengambil objek dokumen yang sedang aktif
 */
function getActiveDocument() {
  return documents.find((doc) => doc.id === activeDocumentId) || null;
}

// --------------------------------------------------------------------------
// 4. MANAJEMEN PENYIMPANAN (LOCALSTORAGE)
// --------------------------------------------------------------------------

/**
 * Menyimpan array documents dan activeDocumentId ke localStorage
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(documents));
    if (activeDocumentId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_DOC, activeDocumentId);
    }
  } catch (error) {
    console.error('Gagal menyimpan data ke localStorage:', error);
  }
}

/**
 * Memuat data dari localStorage dengan validasi & fallback ke Initial Seed Data
 */
function loadData() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_DATA);
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_DOC);

    if (rawData) {
      const parsedData = JSON.parse(rawData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        documents = parsedData;
      }
    }

    // Jika localStorage masih kosong, gunakan 3 halaman contoh dari getInitialSeedDocuments()
    if (!Array.isArray(documents) || documents.length === 0) {
      documents = getInitialSeedDocuments();
      activeDocumentId = documents[0].id;
      saveData();
      return;
    }

    // Cek apakah savedActiveId masih ada di dalam daftar dokumen
    const isSavedIdValid = documents.some((doc) => doc.id === savedActiveId);
    activeDocumentId = isSavedIdValid ? savedActiveId : documents[0].id;
    saveData();
  } catch (error) {
    console.warn('Data localStorage kosong atau rusak, memuat data awal default:', error);
    documents = getInitialSeedDocuments();
    activeDocumentId = documents[0].id;
    saveData();
  }
}

// --------------------------------------------------------------------------
// 5. RENDERING ANTARMUKA (SIDEBAR, META, & BLOK)
// --------------------------------------------------------------------------

/**
 * Memperbarui informasi jumlah blok pada header halaman aktif
 */
function updatePageMeta() {
  const activeDoc = getActiveDocument();
  if (!activeDoc) return;

  const count = Array.isArray(activeDoc.blocks) ? activeDoc.blocks.length : 0;
  if (pageBlockCountEl) {
    pageBlockCountEl.textContent = `${count} blok catatan`;
  }
  if (pageLastEditedEl) {
    pageLastEditedEl.textContent = 'Terakhir disunting baru saja';
  }
}

/**
 * Merender daftar dokumen di sidebar kiri
 */
function renderSidebar() {
  if (!pageListEl) return;
  pageListEl.innerHTML = '';

  documents.forEach((doc) => {
    const li = document.createElement('li');
    li.className = `page-list__item${doc.id === activeDocumentId ? ' is-active' : ''}`;
    li.dataset.pageId = doc.id;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'page-list__icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = '📄';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'page-list__title';
    titleSpan.textContent = doc.title.trim() || 'Untitled';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'page-delete-btn';
    deleteBtn.title = 'Hapus Halaman';
    deleteBtn.textContent = '×';

    li.appendChild(iconSpan);
    li.appendChild(titleSpan);
    li.appendChild(deleteBtn);
    pageListEl.appendChild(li);
  });
}

/**
 * Membuat elemen DOM untuk satu blok catatan
 */
function createBlockElement(block) {
  const blockEl = document.createElement('div');
  blockEl.className = `block-item block-item--${block.type}`;
  if (block.type === 'todo' && block.checked) {
    blockEl.classList.add('is-completed');
  }
  blockEl.dataset.blockId = block.id;
  blockEl.dataset.blockType = block.type;

  // Indikator Kiri: Checkbox untuk 'todo', atau Handle untuk 'h1' & 'p'
  if (block.type === 'todo') {
    const label = document.createElement('label');
    label.className = 'todo-checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = Boolean(block.checked);

    const checkmark = document.createElement('span');
    checkmark.className = 'todo-checkmark';
    checkmark.setAttribute('aria-hidden', 'true');

    label.appendChild(checkbox);
    label.appendChild(checkmark);
    blockEl.appendChild(label);
  } else {
    const handle = document.createElement('div');
    handle.className = 'block-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.title = block.type === 'h1' ? 'Tipe Blok: Heading 1' : 'Tipe Blok: Paragraf';
    handle.textContent = block.type === 'h1' ? 'H1' : '¶';
    blockEl.appendChild(handle);
  }

  // Area Konten Teks (contenteditable)
  const contentEl = document.createElement('div');
  contentEl.className = 'block-content';
  contentEl.contentEditable = 'true';

  if (block.type === 'h1') {
    contentEl.dataset.placeholder = 'Heading 1...';
  } else if (block.type === 'todo') {
    contentEl.dataset.placeholder = 'Daftar tugas...';
  } else {
    contentEl.dataset.placeholder = 'Ketik sesuatu untuk memulai paragraf...';
  }

  // Gunakan innerText agar baris baru (line break dengan Shift+Enter) tetap terjaga
  contentEl.innerText = block.content || '';
  blockEl.appendChild(contentEl);

  // Tombol Hapus Blok di Sisi Kanan
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'block-delete-btn';
  deleteBtn.title = 'Hapus Blok';
  deleteBtn.textContent = '×';
  blockEl.appendChild(deleteBtn);

  return blockEl;
}

/**
 * Merender seluruh blok milik dokumen yang sedang aktif ke area editor
 */
function renderBlocks() {
  const activeDoc = getActiveDocument();
  if (!activeDoc || !blocksContainerEl) return;

  // Sinkronkan input judul halaman dengan judul dokumen aktif
  if (pageTitleInput && document.activeElement !== pageTitleInput) {
    pageTitleInput.value = activeDoc.title;
  } else if (pageTitleInput && pageTitleInput.value !== activeDoc.title) {
    pageTitleInput.value = activeDoc.title;
  }

  blocksContainerEl.innerHTML = '';

  activeDoc.blocks.forEach((block) => {
    const blockEl = createBlockElement(block);
    blocksContainerEl.appendChild(blockEl);
  });

  updatePageMeta();
}

/**
 * Memfokuskan kursor ke bagian akhir teks pada blok tertentu
 */
function focusBlockById(blockId) {
  if (!blocksContainerEl) return;
  const targetContentEl = blocksContainerEl.querySelector(
    `.block-item[data-block-id="${blockId}"] .block-content`
  );
  if (!targetContentEl) return;

  targetContentEl.focus();

  // Posisikan caret di akhir teks jika ada isi
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(targetContentEl);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

// --------------------------------------------------------------------------
// 6. OPERASI DOKUMEN & BLOK
// --------------------------------------------------------------------------

/**
 * Mengganti dokumen aktif dan merender ulang tampilan
 */
function setActiveDocument(id) {
  const targetDoc = documents.find((doc) => doc.id === id);
  if (!targetDoc) return;

  activeDocumentId = targetDoc.id;
  saveData();
  renderSidebar();
  renderBlocks();
}

/**
 * Menambahkan dokumen baru ("Untitled") dan menjadikannya dokumen aktif
 */
function addDocument() {
  const newDoc = createDocumentObject('Untitled');
  documents.push(newDoc);
  activeDocumentId = newDoc.id;

  saveData();
  renderSidebar();
  renderBlocks();

  if (pageTitleInput) {
    pageTitleInput.focus();
    pageTitleInput.select();
  }
}

/**
 * Menghapus dokumen berdasarkan ID (dengan fallback jika dokumen terakhir dihapus)
 */
function deleteDocument(id) {
  documents = documents.filter((doc) => doc.id !== id);

  // Jika semua dokumen terhapus, buat 1 dokumen default baru
  if (documents.length === 0) {
    const defaultDoc = createDocumentObject('Untitled');
    documents.push(defaultDoc);
    activeDocumentId = defaultDoc.id;
  } else if (activeDocumentId === id) {
    activeDocumentId = documents[0].id;
  }

  saveData();
  renderSidebar();
  renderBlocks();
}

/**
 * Menambahkan blok baru ke dokumen aktif (di bagian akhir atau tepat setelah blok tertentu),
 * merender ulang, dan memfokuskan kursor ke blok baru.
 */
function addBlock(type = 'p', afterBlockId = null) {
  const activeDoc = getActiveDocument();
  if (!activeDoc) return;

  const newBlock = createBlockObject(type, '');

  if (afterBlockId) {
    const targetIndex = activeDoc.blocks.findIndex((b) => b.id === afterBlockId);
    if (targetIndex !== -1) {
      activeDoc.blocks.splice(targetIndex + 1, 0, newBlock);
    } else {
      activeDoc.blocks.push(newBlock);
    }
  } else {
    activeDoc.blocks.push(newBlock);
  }

  saveData();
  renderBlocks();
  focusBlockById(newBlock.id);
}

/**
 * Menghapus blok berdasarkan ID dari dokumen aktif.
 * Jika seluruh blok terhapus, otomatis dibuatkan 1 blok paragraf kosong baru.
 */
function deleteBlock(blockId) {
  const activeDoc = getActiveDocument();
  if (!activeDoc) return;

  activeDoc.blocks = activeDoc.blocks.filter((block) => block.id !== blockId);

  // Proteksi Hapus Blok Terakhir: jangan biarkan editor kosong melompong
  let fallbackBlockId = null;
  if (activeDoc.blocks.length === 0) {
    const emptyBlock = createBlockObject('p', '');
    activeDoc.blocks.push(emptyBlock);
    fallbackBlockId = emptyBlock.id;
  }

  saveData();
  renderBlocks();

  if (fallbackBlockId) {
    focusBlockById(fallbackBlockId);
  }
}

// --------------------------------------------------------------------------
// 7. TEMA (DARK / LIGHT MODE)
// --------------------------------------------------------------------------

/**
 * Memperbarui ikon (.theme-icon) dan teks (.theme-text) pada tombol toggle tema
 */
function updateThemeButtonUI(theme) {
  if (!btnThemeToggle) return;

  const themeIconEl = btnThemeToggle.querySelector('.theme-icon');
  const themeTextEl = btnThemeToggle.querySelector('.theme-text');

  if (theme === 'dark') {
    if (themeIconEl) themeIconEl.textContent = '☀️';
    if (themeTextEl) themeTextEl.textContent = 'Light Mode';
  } else {
    if (themeIconEl) themeIconEl.textContent = '🌙';
    if (themeTextEl) themeTextEl.textContent = 'Dark Mode';
  }
}

/**
 * Memuat dan menerapkan tema yang tersimpan di localStorage
 */
function loadTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonUI(savedTheme);
}

/**
 * Toggle antara Light Mode dan Dark Mode beserta pembaruan tombol UI
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
  updateThemeButtonUI(nextTheme);
}

// --------------------------------------------------------------------------
// 8. EVENT LISTENERS & DELEGATION
// --------------------------------------------------------------------------

function initEventListeners() {
  // 1. Tombol "+ Halaman Baru"
  if (btnNewPage) {
    btnNewPage.addEventListener('click', addDocument);
  }

  // 2. Tombol Toggle Dark / Light Mode
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', toggleTheme);
  }

  // 3. Event Delegation untuk Daftar Dokumen di Sidebar (Pilih & Hapus Halaman)
  if (pageListEl) {
    pageListEl.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('.page-delete-btn');
      const pageItem = event.target.closest('.page-list__item');

      if (!pageItem) return;
      const pageId = pageItem.dataset.pageId;

      if (deleteBtn) {
        event.stopPropagation();
        deleteDocument(pageId);
        return;
      }

      if (pageId && pageId !== activeDocumentId) {
        setActiveDocument(pageId);
      }
    });
  }

  // 4. Input Judul Dokumen (Auto-save & Update judul di sidebar tanpa re-render penuh)
  if (pageTitleInput) {
    pageTitleInput.addEventListener('input', (event) => {
      const activeDoc = getActiveDocument();
      if (!activeDoc) return;

      activeDoc.title = event.target.value;
      saveData();
      updatePageMeta();

      // Update teks judul langsung di item sidebar aktif agar kursor tidak terganggu
      const activeSidebarTitle = pageListEl?.querySelector(
        `.page-list__item[data-page-id="${activeDoc.id}"] .page-list__title`
      );
      if (activeSidebarTitle) {
        activeSidebarTitle.textContent = activeDoc.title.trim() || 'Untitled';
      }
    });
  }

  // 5. Event Delegation pada Kontainer Blok
  if (blocksContainerEl) {
    // 5a. Ketikan Teks (input) — menggunakan innerText agar line break tersimpan
    blocksContainerEl.addEventListener('input', (event) => {
      const contentEl = event.target.closest('.block-content');
      if (!contentEl) return;

      const blockItem = contentEl.closest('.block-item');
      if (!blockItem) return;

      const blockId = blockItem.dataset.blockId;
      const activeDoc = getActiveDocument();
      if (!activeDoc) return;

      const targetBlock = activeDoc.blocks.find((b) => b.id === blockId);
      if (!targetBlock) return;

      // Update data langsung tanpa memanggil renderBlocks() agar posisi kursor tetap terjaga
      targetBlock.content = contentEl.innerText;
      saveData();
      updatePageMeta();
    });

    // 5b. Tombol Enter pada Blok (keydown) — membuat blok paragraf baru tepat di bawahnya
    blocksContainerEl.addEventListener('keydown', (event) => {
      const contentEl = event.target.closest('.block-content');
      if (!contentEl) return;

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();

        const blockItem = contentEl.closest('.block-item');
        if (!blockItem) return;

        const currentBlockId = blockItem.dataset.blockId;
        addBlock('p', currentBlockId);
      }
    });

    // 5c. Checkbox To-Do (change)
    blocksContainerEl.addEventListener('change', (event) => {
      const checkbox = event.target.closest('.todo-checkbox');
      if (!checkbox) return;

      const blockItem = checkbox.closest('.block-item');
      if (!blockItem) return;

      const blockId = blockItem.dataset.blockId;
      const activeDoc = getActiveDocument();
      if (!activeDoc) return;

      const targetBlock = activeDoc.blocks.find((b) => b.id === blockId);
      if (!targetBlock) return;

      targetBlock.checked = checkbox.checked;
      blockItem.classList.toggle('is-completed', checkbox.checked);
      saveData();
      updatePageMeta();
    });

    // 5d. Tombol Hapus Blok (click)
    blocksContainerEl.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('.block-delete-btn');
      if (!deleteBtn) return;

      const blockItem = deleteBtn.closest('.block-item');
      if (!blockItem) return;

      deleteBlock(blockItem.dataset.blockId);
    });
  }

  // 6. Tombol Tambah Blok pada Floating Action Bar
  if (btnAddH1) {
    btnAddH1.addEventListener('click', () => addBlock('h1'));
  }
  if (btnAddP) {
    btnAddP.addEventListener('click', () => addBlock('p'));
  }
  if (btnAddTodo) {
    btnAddTodo.addEventListener('click', () => addBlock('todo'));
  }
}

// --------------------------------------------------------------------------
// 9. INISIALISASI APLIKASI SAAT DOM SIAP
// --------------------------------------------------------------------------
function initApp() {
  loadTheme();
  loadData();
  renderSidebar();
  renderBlocks();
  initEventListeners();
}

document.addEventListener('DOMContentLoaded', initApp);
