// ============================================================================
// E-LEARNING UT 2026.2 - APLIKASI WEB UTAMA
// Tutor Pengampu: Bagoes Panca Wiratama, S.Pd., M.Pd.
// ============================================================================

// Global Application State
var state = {
  view: 'home', // 'home' | 'dashboard' | 'tutorial-detail' | 'tutor-view'
  currentUser: null, // student object or tutor object
  currentClassId: '5A', // '5A' | '6A' | '7C1' | '7D1'
  currentSesi: 1, // 1 to 8
  currentTab: 'kelompok', // 'kelompok' | 'rat_sat' | 'pemantik' | 'materi' | 'video' | 'lkpd' | 'asesmen' | 'refleksi'
  loginRole: 'mahasiswa', // 'mahasiswa' | 'tutor'
  tutorTab: 'gradebook', // 'gradebook' | 'lkpd' | 'diskusi' | 'kelompok'
  tutorSesiFilter: 1,
  phonePreview: false,
  comments: {}, // session comments stored by key `${classId}_sesi${sesi}`
  submissions: {}, // lkpd submissions
  reflections: {}, // reflections
  quizScores: {}, // quiz results
  grades: {} // student grades by NIM: { tugas1, tugas2, tugas3, partisipasi, catatan }
};
if (typeof window !== 'undefined') window.state = state;

// Default Grades - returns empty object (clean state, no dummy data)
function generateDefaultGrades() {
  return {};
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  initApp();
  renderApp();
});

// Load state from localStorage
function loadLocalState() {
  try {
    const savedUser = localStorage.getItem('ut_user');
    if (savedUser) state.currentUser = JSON.parse(savedUser);

    const savedClass = localStorage.getItem('ut_class');
    if (savedClass) state.currentClassId = savedClass;

    const savedView = localStorage.getItem('ut_view');
    if (savedView && state.currentUser) state.view = savedView;

    const savedComments = localStorage.getItem('ut_comments');
    if (savedComments) state.comments = JSON.parse(savedComments);

    const savedSubmissions = localStorage.getItem('ut_submissions');
    if (savedSubmissions) state.submissions = JSON.parse(savedSubmissions);

    const savedReflections = localStorage.getItem('ut_reflections');
    if (savedReflections) state.reflections = JSON.parse(savedReflections);

    const savedQuiz = localStorage.getItem('ut_quiz');
    if (savedQuiz) state.quizScores = JSON.parse(savedQuiz);

    const savedGrades = localStorage.getItem('ut_grades');
    const gradesVersion = localStorage.getItem('ut_grades_v');
    if (savedGrades && gradesVersion === 'v2_clean') {
      state.grades = JSON.parse(savedGrades);
    } else {
      localStorage.removeItem('ut_grades');
      localStorage.setItem('ut_grades_v', 'v2_clean');
      state.grades = {};
    }
  } catch (e) {
    console.error('Error loading local storage state', e);
  }
}

function saveLocalState() {
  try {
    if (state.currentUser) {
      localStorage.setItem('ut_user', JSON.stringify(state.currentUser));
      localStorage.setItem('ut_view', state.view);
      localStorage.setItem('ut_class', state.currentClassId);
    } else {
      localStorage.removeItem('ut_user');
      localStorage.setItem('ut_view', 'home');
    }
    localStorage.setItem('ut_comments', JSON.stringify(state.comments));
    localStorage.setItem('ut_submissions', JSON.stringify(state.submissions));
    localStorage.setItem('ut_reflections', JSON.stringify(state.reflections));
    localStorage.setItem('ut_quiz', JSON.stringify(state.quizScores));
    localStorage.setItem('ut_grades', JSON.stringify(state.grades));
  } catch (e) {
    console.error('Error saving local storage state', e);
  }
}

// Navigation Router
function navigateTo(view, params = {}) {
  state.view = view;
  if (params.classId) state.currentClassId = params.classId;
  if (params.sesi) state.currentSesi = parseInt(params.sesi);
  if (params.tab) state.currentTab = params.tab;
  
  saveLocalState();
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: Get Current Course
function getCurrentCourse() {
  return COURSES_DATA[state.currentClassId] || COURSES_DATA['5A'];
}

// Helper: Get Current Tutorial Data
function getCurrentTutorial() {
  const classTutorials = TUTORIALS_DATA[state.currentClassId] || TUTORIALS_DATA['5A'];
  return classTutorials.find(t => t.sesi === state.currentSesi) || classTutorials[0];
}

// Helper: Find Student by Email or NIM
function authenticateStudent(identifier, password) {
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Check Tutor Credentials
  const isTutorUser = (
    cleanId === 'bagoespancawiratama@gmail.com' ||
    cleanId === 'bagoespancawiratama' ||
    cleanId === 'bagus.panca@ecampus.ut.ac.id' ||
    cleanId === 'tutor' ||
    cleanId === 'admin' ||
    cleanId === 'bagus' ||
    cleanId === '198805122019031008' ||
    cleanId === '198710262024011001'
  );
  const isTutorPass = (
    cleanPass === '18004313*' ||
    cleanPass === 'tutor123' ||
    cleanPass === '123456' ||
    cleanPass === 'admin' ||
    cleanPass === 'tutor' ||
    cleanPass === '198805122019031008'
  );

  if (isTutorUser && isTutorPass) {
    return {
      role: 'tutor',
      nama: TUTOR_DATA.nama,
      email: 'bagoespancawiratama@gmail.com',
      nip: TUTOR_DATA.nip,
      foto: TUTOR_DATA.foto,
      gelar: TUTOR_DATA.gelar
    };
  }

  // Check Students Data
  const student = STUDENTS_DATA.find(s => {
    const emailMatch = s.email.toLowerCase() === cleanId;
    const nimMatch = s.nim === cleanId;
    const emailPrefixMatch = s.email.split('@')[0].toLowerCase() === cleanId;
    return (emailMatch || nimMatch || emailPrefixMatch);
  });

  if (student) {
    // Password must be NIM
    if (student.nim === cleanPass) {
      return {
        role: 'mahasiswa',
        id: student.id,
        nama: student.nama,
        nim: student.nim,
        email: student.email,
        kelas: student.kelas
      };
    }
  }

  return null;
}

// Switch Login Role (Mahasiswa / Tutor)
window.switchLoginRole = function(role) {
  state.loginRole = role;
  const tabMhs = document.getElementById('tab-login-mahasiswa');
  const tabTut = document.getElementById('tab-login-tutor');
  const title = document.getElementById('login-title');
  const desc = document.getElementById('login-desc');
  const userLabel = document.getElementById('login-user-label');
  const userField = document.getElementById('login-username');
  const pwLabel = document.getElementById('login-pw-label');
  const pwField = document.getElementById('login-password');
  const btnText = document.getElementById('login-btn-text');
  const errBox = document.getElementById('login-error');

  if (errBox) errBox.classList.add('hidden');

  if (role === 'tutor') {
    if (tabTut) tabTut.className = 'flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition bg-[#003367] text-white shadow-xs';
    if (tabMhs) tabMhs.className = 'flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition text-slate-600 hover:text-slate-900';
    if (title) title.innerText = 'Login Tutor Pengampu';
    if (desc) desc.innerHTML = 'Portal khusus Tutor (<strong class="text-[#003367]">' + TUTOR_DATA.nama + '</strong>) untuk memantau aktivitas dan memberikan penilaian mahasiswa.';
    if (userLabel) userLabel.innerText = 'Username / Email Tutor';
    if (userField) {
      userField.placeholder = 'bagoespancawiratama@gmail.com';
      userField.value = '';
    }
    if (pwLabel) pwLabel.innerText = 'Password Tutor';
    if (pwField) {
      pwField.placeholder = 'Masukkan Password Tutor (18004313*)';
      pwField.value = '';
    }
    if (btnText) btnText.innerText = 'Masuk ke Dasbor Penilaian Tutor';
  } else {
    if (tabMhs) tabMhs.className = 'flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition bg-[#003367] text-white shadow-xs';
    if (tabTut) tabTut.className = 'flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition text-slate-600 hover:text-slate-900';
    if (title) title.innerText = 'Login Mahasiswa';
    if (desc) desc.innerHTML = 'Sesuai ketentuan akademik UT, gunakan <strong class="text-[#003367]">Email Kampus</strong> sebagai Username dan <strong class="text-[#003367]">NIM</strong> sebagai Password untuk mengakses kelas & materi perkuliahan.';
    if (userLabel) userLabel.innerText = 'Username (Email Kampus atau NIM)';
    if (userField) {
      userField.placeholder = 'Contoh: 860080512@ecampus.ut.ac.id atau 860080512';
      userField.value = '';
    }
    if (pwLabel) pwLabel.innerText = 'Password (Nomor Induk Mahasiswa / NIM)';
    if (pwField) {
      pwField.placeholder = 'Masukkan NIM Anda';
      pwField.value = '';
    }
    if (btnText) btnText.innerText = 'Masuk ke Kelas Saya';
  }
};

// Handle Login Submit
function handleLogin(e) {
  if (e) e.preventDefault();
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorBox = document.getElementById('login-error');

  const username = usernameInput ? usernameInput.value : '';
  const password = passwordInput ? passwordInput.value : '';

  const user = authenticateStudent(username, password);

  if (user) {
    state.currentUser = user;
    if (user.role === 'mahasiswa') {
      state.currentClassId = user.kelas;
      navigateTo('dashboard', { classId: user.kelas });
      showToast(`Selamat datang, ${user.nama} (${user.kelas})!`, 'success');
    } else {
      navigateTo('tutor-view');
      showToast(`Selamat datang Tutor: ${user.nama}!`, 'success');
    }
  } else {
    if (errorBox) {
      errorBox.classList.remove('hidden');
      if (state.loginRole === 'tutor') {
        errorBox.innerText = 'Username atau Password Tutor salah. Gunakan Username: bagoespancawiratama@gmail.com dan Password: 18004313*';
      } else {
        errorBox.innerText = 'Username (Email Kampus) atau Password (NIM) tidak cocok. Pastikan data NIM dan Email sudah benar.';
      }
    }
  }
}

// Interactive Login Modal Handlers
window.openLoginModal = function(targetClassId) {
  const modal = document.getElementById('login-modal');
  const badge = document.getElementById('modal-target-class-badge');
  const title = document.getElementById('modal-login-title');
  const desc = document.getElementById('modal-login-desc');
  const errorBox = document.getElementById('modal-login-error');

  if (errorBox) errorBox.classList.add('hidden');

  if (targetClassId && COURSES_DATA[targetClassId]) {
    const c = COURSES_DATA[targetClassId];
    if (badge) badge.innerText = `Login Mahasiswa: Kelas ${c.id} (${c.kode})`;
    if (title) title.innerText = `Login Mahasiswa Kelas ${c.id}`;
    if (desc) desc.innerHTML = `Silakan masuk dengan <strong>Email Kampus</strong> dan <strong>NIM</strong> Anda untuk mengakses tutorial <strong>Kelas ${c.id} (${c.nama})</strong>.`;
  } else {
    if (badge) badge.innerText = 'E-LEARNING UT 2026.2 • Bagoes Panca Wiratama, S.Pd., M.Pd.';
    if (title) title.innerText = 'Login Mahasiswa';
    if (desc) desc.innerHTML = 'Silakan masukkan <strong>Email Kampus</strong> (Username) dan <strong>NIM</strong> (Password) untuk membuka akses tutorial.';
  }

  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const uField = document.getElementById('modal-login-username');
      if (uField) uField.focus();
    }, 100);
  }
};

window.closeLoginModal = function() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

// Tutor Grading Modal Handlers
window.openGradeModal = function(nim) {
  const student = STUDENTS_DATA.find(s => s.nim === String(nim));
  if (!student) return;
  const g = (state.grades && state.grades[nim]) || null;

  const modal = document.getElementById('tutor-grade-modal');
  if (!modal) return;

  const namaEl = document.getElementById('grade-student-nama');
  const nimEl = document.getElementById('grade-student-nim');
  const targetNimEl = document.getElementById('grade-student-target-nim');

  if (namaEl) namaEl.innerText = student.nama;
  if (nimEl) nimEl.innerText = `NIM: ${student.nim} • Kelas ${student.kelas}`;
  if (targetNimEl) targetNimEl.value = student.nim;

  const t1El = document.getElementById('input-grade-t1');
  const t2El = document.getElementById('input-grade-t2');
  const t3El = document.getElementById('input-grade-t3');
  const partEl = document.getElementById('input-grade-part');
  const notesEl = document.getElementById('input-grade-notes');

  if (t1El) t1El.value = (g && g.tugas1 !== undefined && g.tugas1 !== null && g.tugas1 !== '') ? g.tugas1 : '';
  if (t2El) t2El.value = (g && g.tugas2 !== undefined && g.tugas2 !== null && g.tugas2 !== '') ? g.tugas2 : '';
  if (t3El) t3El.value = (g && g.tugas3 !== undefined && g.tugas3 !== null && g.tugas3 !== '') ? g.tugas3 : '';
  if (partEl) partEl.value = (g && g.partisipasi !== undefined && g.partisipasi !== null && g.partisipasi !== '') ? g.partisipasi : '';
  if (notesEl) notesEl.value = (g && g.catatan) ? g.catatan : '';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

window.closeGradeModal = function() {
  const modal = document.getElementById('tutor-grade-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

window.handleSaveGrade = function(e) {
  if (e) e.preventDefault();
  const nim = document.getElementById('grade-student-target-nim')?.value;
  if (!nim) return;

  const rawT1 = document.getElementById('input-grade-t1')?.value.trim();
  const rawT2 = document.getElementById('input-grade-t2')?.value.trim();
  const rawT3 = document.getElementById('input-grade-t3')?.value.trim();
  const rawPart = document.getElementById('input-grade-part')?.value.trim();
  const notes = document.getElementById('input-grade-notes')?.value.trim() || '';

  if (!state.grades) state.grades = {};
  state.grades[nim] = {
    tugas1: rawT1 !== '' ? parseFloat(rawT1) : '',
    tugas2: rawT2 !== '' ? parseFloat(rawT2) : '',
    tugas3: rawT3 !== '' ? parseFloat(rawT3) : '',
    partisipasi: rawPart !== '' ? parseFloat(rawPart) : '',
    catatan: notes
  };

  localStorage.setItem('ut_grades', JSON.stringify(state.grades));
  closeGradeModal();
  renderApp();
  showToast('Nilai mahasiswa berhasil disimpan & diperbarui!', 'success');
};

window.resetClassGrades = function(classId) {
  if (confirm(`Apakah Anda yakin ingin mengosongkan seluruh data nilai mahasiswa Kelas ${classId}?`)) {
    const studentsInClass = STUDENTS_DATA.filter(s => s.kelas === classId);
    if (!state.grades) state.grades = {};
    studentsInClass.forEach(s => {
      delete state.grades[s.nim];
    });
    localStorage.setItem('ut_grades', JSON.stringify(state.grades));
    renderApp();
    showToast(`Data nilai Kelas ${classId} telah berhasil dikosongkan.`, 'info');
  }
};

window.exportGradebookCSV = function(classId) {
  const students = STUDENTS_DATA.filter(s => s.kelas === classId);
  const course = COURSES_DATA[classId] || COURSES_DATA['5A'];
  let csv = `REKAPITULASI NILAI AKADEMIK TUTORIAL UNIVERSITAS TERBUKA\n`;
  csv += `Portal E-LEARNING UT 2026.2\n`;
  csv += `Mata Kuliah: ${course.nama} (${course.kode})\n`;
  csv += `Tutor Pengampu: ${TUTOR_DATA.nama}\n`;
  csv += `Kelas: ${classId}\n\n`;
  csv += `No,NIM,Nama Mahasiswa,Tugas 1,Tugas 2,Tugas 3,Rata-rata Tugas (70%),Partisipasi (30%),Nilai Akhir,Predikat,Catatan Masukan Tutor\n`;

  students.forEach((s, idx) => {
    const g = (state.grades && state.grades[s.nim]) || null;
    const t1 = (g && g.tugas1 !== undefined) ? g.tugas1 : '';
    const t2 = (g && g.tugas2 !== undefined) ? g.tugas2 : '';
    const t3 = (g && g.tugas3 !== undefined) ? g.tugas3 : '';
    const part = (g && g.partisipasi !== undefined) ? g.partisipasi : '';

    let avgTugas = '';
    let finalScore = '';
    let gradeLetter = '';

    if (t1 !== '' || t2 !== '' || t3 !== '' || part !== '') {
      const numT1 = parseFloat(t1) || 0;
      const numT2 = parseFloat(t2) || 0;
      const numT3 = parseFloat(t3) || 0;
      const numPart = parseFloat(part) || 0;
      avgTugas = ((numT1 + numT2 + numT3) / 3).toFixed(1);
      finalScore = ((0.7 * parseFloat(avgTugas)) + (0.3 * numPart)).toFixed(1);
      if (parseFloat(finalScore) >= 85) gradeLetter = 'A';
      else if (parseFloat(finalScore) >= 75) gradeLetter = 'B';
      else if (parseFloat(finalScore) >= 65) gradeLetter = 'C';
      else gradeLetter = 'D';
    }

    const safeName = `"${s.nama.replace(/"/g, '""')}"`;
    const safeNote = `"${((g && g.catatan) || '').replace(/"/g, '""')}"`;
    csv += `${idx + 1},${s.nim},${safeName},${t1},${t2},${t3},${avgTugas},${part},${finalScore},${gradeLetter},${safeNote}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Nilai_UT_2026.2_Kelas_${classId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Rekap nilai Kelas ${classId} berhasil diunduh (CSV)!`, 'success');
};

window.switchTutorTab = function(tab) {
  state.tutorTab = tab;
  state.currentTab = tab;
  saveLocalState();
  renderApp();
};

window.switchTutorSesi = function(sesi) {
  state.tutorSesiFilter = parseInt(sesi);
  state.currentSesi = parseInt(sesi);
  saveLocalState();
  renderApp();
};
window.switchTutorSesiFilter = window.switchTutorSesi;

window.switchTutorClass = function(classId) {
  state.currentClassId = classId;
  saveLocalState();
  renderApp();
};

window.quickLoginTutor = function() {
  if (state.currentUser && state.currentUser.role === 'tutor') {
    navigateTo('tutor-view');
  } else {
    openLoginModal();
    switchLoginRole('tutor');
  }
};

window.handleNavClassClick = function(classId) {
  const user = state.currentUser;
  // If user is already logged in as a verified student of THIS specific class:
  if (user && user.role === 'mahasiswa' && user.kelas === classId) {
    navigateTo('dashboard', { classId: classId });
    return;
  }
  
  // For anyone else (not logged in, tutor, or different class):
  // JANGAN TAMPILKAN ISINYA! Langsung arahkan ke login modal mahasiswa!
  openLoginModal(classId);
  switchLoginRole('mahasiswa');
};

window.saveInlineGrade = function(nim, type, sesi) {
  const student = STUDENTS_DATA.find(s => s.nim === String(nim));
  if (!student) return;
  if (!state.grades) state.grades = {};
  if (!state.grades[nim]) {
    state.grades[nim] = { tugas1: '', tugas2: '', tugas3: '', partisipasi: '', catatan: '' };
  }

  if (type === 'tugas') {
    const valEl = document.getElementById(`input-grade-tugas-${nim}`);
    const noteEl = document.getElementById(`input-note-tugas-${nim}`);
    const val = valEl ? valEl.value.trim() : '';
    const note = noteEl ? noteEl.value.trim() : '';

    if (sesi === 3) state.grades[nim].tugas1 = val !== '' ? parseFloat(val) : '';
    else if (sesi === 5) state.grades[nim].tugas2 = val !== '' ? parseFloat(val) : '';
    else if (sesi === 7) state.grades[nim].tugas3 = val !== '' ? parseFloat(val) : '';
    else {
      if (!state.grades[nim].kuis) state.grades[nim].kuis = {};
      state.grades[nim].kuis[sesi] = val !== '' ? parseFloat(val) : '';
    }
    if (note) state.grades[nim].catatan = note;
  } else if (type === 'lkpd') {
    const valEl = document.getElementById(`input-grade-lkpd-${nim}`);
    const noteEl = document.getElementById(`input-note-lkpd-${nim}`);
    const val = valEl ? valEl.value.trim() : '';
    const note = noteEl ? noteEl.value.trim() : '';

    if (!state.grades[nim].lkpd) state.grades[nim].lkpd = {};
    state.grades[nim].lkpd[sesi] = val !== '' ? parseFloat(val) : '';
    if (val !== '' && (state.grades[nim].partisipasi === '' || state.grades[nim].partisipasi === undefined)) {
      state.grades[nim].partisipasi = parseFloat(val);
    }
    if (note) state.grades[nim].catatan = note;
  } else if (type === 'partisipasi') {
    const valEl = document.getElementById(`input-grade-part-${nim}`);
    const noteEl = document.getElementById(`input-note-part-${nim}`);
    const val = valEl ? valEl.value.trim() : '';
    const note = noteEl ? noteEl.value.trim() : '';

    state.grades[nim].partisipasi = val !== '' ? parseFloat(val) : '';
    if (note) state.grades[nim].catatan = note;
  }

  localStorage.setItem('ut_grades', JSON.stringify(state.grades));
  renderApp();
  showToast(`Nilai mahasiswa ${student.nama} (${student.nim}) berhasil disimpan!`, 'success');
};

window.saveAllInlineGrades = function(classId, type, sesi) {
  const students = STUDENTS_DATA.filter(s => s.kelas === classId);
  if (!state.grades) state.grades = {};
  let count = 0;

  students.forEach(s => {
    if (!state.grades[s.nim]) {
      state.grades[s.nim] = { tugas1: '', tugas2: '', tugas3: '', partisipasi: '', catatan: '' };
    }

    if (type === 'tugas') {
      const valEl = document.getElementById(`input-grade-tugas-${s.nim}`);
      const noteEl = document.getElementById(`input-note-tugas-${s.nim}`);
      const val = valEl ? valEl.value.trim() : '';
      const note = noteEl ? noteEl.value.trim() : '';
      if (val !== '') {
        if (sesi === 3) state.grades[s.nim].tugas1 = parseFloat(val);
        else if (sesi === 5) state.grades[s.nim].tugas2 = parseFloat(val);
        else if (sesi === 7) state.grades[s.nim].tugas3 = parseFloat(val);
        else {
          if (!state.grades[s.nim].kuis) state.grades[s.nim].kuis = {};
          state.grades[s.nim].kuis[sesi] = parseFloat(val);
        }
        count++;
      }
      if (note) state.grades[s.nim].catatan = note;
    } else if (type === 'lkpd') {
      const valEl = document.getElementById(`input-grade-lkpd-${s.nim}`);
      const noteEl = document.getElementById(`input-note-lkpd-${s.nim}`);
      const val = valEl ? valEl.value.trim() : '';
      const note = noteEl ? noteEl.value.trim() : '';
      if (val !== '') {
        if (!state.grades[s.nim].lkpd) state.grades[s.nim].lkpd = {};
        state.grades[s.nim].lkpd[sesi] = parseFloat(val);
        if (state.grades[s.nim].partisipasi === '' || state.grades[s.nim].partisipasi === undefined) {
          state.grades[s.nim].partisipasi = parseFloat(val);
        }
        count++;
      }
      if (note) state.grades[s.nim].catatan = note;
    } else if (type === 'partisipasi') {
      const valEl = document.getElementById(`input-grade-part-${s.nim}`);
      const noteEl = document.getElementById(`input-note-part-${s.nim}`);
      const val = valEl ? valEl.value.trim() : '';
      const note = noteEl ? noteEl.value.trim() : '';
      if (val !== '') {
        state.grades[s.nim].partisipasi = parseFloat(val);
        count++;
      }
      if (note) state.grades[s.nim].catatan = note;
    }
  });

  localStorage.setItem('ut_grades', JSON.stringify(state.grades));
  renderApp();
  showToast(`Berhasil menyimpan seluruh nilai mahasiswa Kelas ${classId}!`, 'success');
};

window.handleModalLogin = function(e) {
  if (e) e.preventDefault();
  const username = document.getElementById('modal-login-username')?.value || '';
  const password = document.getElementById('modal-login-password')?.value || '';
  const errorBox = document.getElementById('modal-login-error');

  const user = authenticateStudent(username, password);
  if (user) {
    state.currentUser = user;
    closeLoginModal();
    if (user.role === 'mahasiswa') {
      state.currentClassId = user.kelas;
      navigateTo('dashboard', { classId: user.kelas });
    } else {
      navigateTo('tutor-view');
    }
    showToast(`Selamat datang, ${user.nama}!`, 'success');
  } else {
    if (errorBox) {
      errorBox.classList.remove('hidden');
      errorBox.innerText = 'Username atau Password tidak cocok. Mahasiswa: gunakan Email Kampus & NIM. Tutor: gunakan bagoespancawiratama@gmail.com.';
    }
  }
};

window.toggleModalPassword = function() {
  const pw = document.getElementById('modal-login-password');
  const icon = document.getElementById('modal-pw-icon');
  if (pw) {
    if (pw.type === 'password') {
      pw.type = 'text';
      if (icon) icon.innerText = 'visibility_off';
    } else {
      pw.type = 'password';
      if (icon) icon.innerText = 'visibility';
    }
  }
};

// Logout Handler
function handleLogout() {
  state.currentUser = null;
  saveLocalState();
  navigateTo('home');
  showToast('Anda telah berhasil keluar dari portal E-Learning.', 'info');
}

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-800';
  
  toast.className = `flex items-center gap-2 px-4 py-3 rounded-xl text-white shadow-xl ${bgColor} text-xs font-semibold transform translate-y-4 opacity-0 transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">
      ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Toggle Phone Mockup Preview on Desktop
function togglePhonePreview() {
  state.phonePreview = !state.phonePreview;
  const wrapper = document.getElementById('app-frame-wrapper');
  const btnText = document.getElementById('preview-btn-text');
  const btnIcon = document.getElementById('preview-btn-icon');

  if (state.phonePreview) {
    wrapper.classList.add('phone-frame-active');
    if (btnText) btnText.innerText = 'Tampilan Web Penuh';
    if (btnIcon) btnIcon.innerText = 'desktop_windows';
  } else {
    wrapper.classList.remove('phone-frame-active');
    if (btnText) btnText.innerText = 'Pratinjau Mode HP';
    if (btnIcon) btnIcon.innerText = 'smartphone';
  }
}

// ============================================================================
// MAIN RENDER ENGINE
// ============================================================================

function initApp() {
  // Mobile drawer listener
  window.closeDrawer = () => {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
  };

  window.openDrawer = () => {
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('-translate-x-full');
    if (overlay) overlay.classList.remove('hidden');
  };
}

function renderApp() {
  renderNavbar();
  renderDrawer();
  renderBottomNav();

  const mainContainer = document.getElementById('app-content');
  if (!mainContainer) return;

  if (state.view === 'home') {
    mainContainer.innerHTML = renderHomeView();
    attachHomeEvents();
  } else if (state.view === 'dashboard') {
    mainContainer.innerHTML = renderDashboardView();
  } else if (state.view === 'tutorial-detail') {
    mainContainer.innerHTML = renderTutorialDetailView();
    attachTutorialEvents();
  } else if (state.view === 'tutor-view') {
    mainContainer.innerHTML = renderTutorManagementView();
    attachTutorEvents();
  }

  // Update document title
  if (state.view === 'home') {
    document.title = 'E-LEARNING UT 2026.2 | Bagoes Panca Wiratama, S.Pd., M.Pd.';
  } else if (state.view === 'dashboard') {
    const course = getCurrentCourse();
    document.title = `E-LEARNING UT 2026.2 | ${course.kode} (${course.id}) - Dashboard Kelas`;
  } else if (state.view === 'tutorial-detail') {
    const tut = getCurrentTutorial();
    document.title = `E-LEARNING UT 2026.2 | Tutorial ${tut.sesi} - Kelas ${state.currentClassId}`;
  } else if (state.view === 'tutor-view') {
    document.title = 'E-LEARNING UT 2026.2 | Panel Tutor: Bagoes Panca Wiratama, S.Pd., M.Pd.';
  }
}

// ============================================================================
// NAVBAR & MOBILE NAVIGATION
// ============================================================================

window.handleBottomNavProfile = function() {
  if (state.currentUser) {
    if (state.currentUser.role === 'tutor') {
      navigateTo('tutor-view');
    } else {
      navigateTo('dashboard', { classId: state.currentUser.kelas });
    }
  } else {
    openLoginModal();
  }
};

window.handleDrawerLogin = function() {
  closeDrawer();
  openLoginModal();
};

function renderNavbar() {
  const navContainer = document.getElementById('app-navbar');
  if (!navContainer) return;

  const isLogged = !!state.currentUser;
  const user = state.currentUser;

  navContainer.innerHTML = `
    <div class="h-14 sm:h-16 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto flex items-center justify-between gap-2">
      <!-- Left: Mobile Menu Trigger & UT Identity -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <button onclick="openDrawer()" type="button" aria-label="Menu" class="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition flex-shrink-0">
          <span class="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <a href="javascript:void(0)" onclick="navigateTo('home')" class="flex items-center gap-2 group min-w-0">
          <img src="favicon.png" 
               alt="Logo UT" class="h-8 sm:h-9 w-auto object-contain flex-shrink-0 group-hover:scale-105 transition" />
          <div class="flex flex-col min-w-0">
            <span class="text-xs sm:text-sm font-extrabold text-[#003367] tracking-tight leading-tight group-hover:text-[#004990] truncate whitespace-nowrap">E-LEARNING UT 2026.2</span>
            <span class="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate whitespace-nowrap hidden xs:block sm:block">Bagoes Panca Wiratama, S.Pd., M.Pd.</span>
          </div>
        </a>
      </div>

      <!-- Center: Desktop Navigation Links -->
      <div class="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
        <button onclick="navigateTo('home')" class="px-3 py-2 rounded-xl hover:text-[#004990] hover:bg-blue-50/70 transition ${state.view === 'home' ? 'text-[#004990] bg-blue-50 font-extrabold' : ''}">
          Beranda
        </button>
        ${isLogged && user.role === 'tutor' ? `
          <button onclick="navigateTo('tutor-view')" class="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${state.view === 'tutor-view' ? 'text-amber-950 bg-amber-400 font-black shadow-xs' : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-extrabold border border-amber-200'}">
            <span class="material-symbols-outlined text-[17px]">school</span>
            <span>Dasbor Penilaian Tutor</span>
          </button>
        ` : ''}
        <button onclick="handleNavClassClick('5A')" class="px-3 py-2 rounded-xl hover:text-[#004990] hover:bg-blue-50/70 transition ${state.view === 'dashboard' && state.currentClassId === '5A' && isLogged && user.role === 'mahasiswa' && user.kelas === '5A' ? 'text-[#004990] bg-blue-50 font-extrabold' : ''}">
          Kelas 5A
        </button>
        <button onclick="handleNavClassClick('6A')" class="px-3 py-2 rounded-xl hover:text-[#004990] hover:bg-blue-50/70 transition ${state.view === 'dashboard' && state.currentClassId === '6A' && isLogged && user.role === 'mahasiswa' && user.kelas === '6A' ? 'text-[#004990] bg-blue-50 font-extrabold' : ''}">
          Kelas 6A
        </button>
        <button onclick="handleNavClassClick('7C1')" class="px-3 py-2 rounded-xl hover:text-[#004990] hover:bg-blue-50/70 transition ${state.view === 'dashboard' && state.currentClassId === '7C1' && isLogged && user.role === 'mahasiswa' && user.kelas === '7C1' ? 'text-[#004990] bg-blue-50 font-extrabold' : ''}">
          Kelas 7C1
        </button>
        <button onclick="handleNavClassClick('7D1')" class="px-3 py-2 rounded-xl hover:text-[#004990] hover:bg-blue-50/70 transition ${state.view === 'dashboard' && state.currentClassId === '7D1' && isLogged && user.role === 'mahasiswa' && user.kelas === '7D1' ? 'text-[#004990] bg-blue-50 font-extrabold' : ''}">
          Kelas 7D1
        </button>
      </div>

      <!-- Right: User Badge or Login Trigger + Phone Mockup Toggle -->
      <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <!-- Desktop Device Simulator Button -->
        <button onclick="togglePhonePreview()" class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition" title="Alihkan mode pratinjau tampilan layar HP / Desktop">
          <span id="preview-btn-icon" class="material-symbols-outlined text-[17px] text-[#004990]">smartphone</span>
          <span id="preview-btn-text">Pratinjau Mode HP</span>
        </button>

        ${isLogged ? `
          <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200/80 rounded-full pl-2 pr-1 py-0.5 sm:py-1">
            <div class="flex flex-col text-right">
              <span class="text-xs font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[160px]">${user.nama.split(' ')[0]}</span>
              <span class="text-[9px] sm:text-[10px] font-semibold text-[#004990]">
                ${user.role === 'tutor' ? 'Tutor' : `${user.kelas}`}
              </span>
            </div>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-[#004990]/20 flex-shrink-0 bg-white">
              <img src="${user.role === 'tutor' ? TUTOR_DATA.foto : 'bagus_avatar.jpg'}" alt="${user.nama}" class="w-full h-full object-cover object-top" />
            </div>
            <button onclick="handleLogout()" title="Keluar Akun" class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition">
              <span class="material-symbols-outlined text-[16px] sm:text-[18px]">logout</span>
            </button>
          </div>
        ` : `
          <button onclick="openLoginModal()" class="h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl bg-[#003367] hover:bg-[#004990] text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition">
            <span class="material-symbols-outlined text-[16px] text-[#F7B500]">lock_open</span>
            <span class="hidden sm:inline">Login Mahasiswa</span>
            <span class="sm:hidden">Login</span>
          </button>
        `}
      </div>
    </div>
  `;
}

function renderDrawer() {
  const drawerContainer = document.getElementById('app-drawer');
  if (!drawerContainer) return;

  const isLogged = !!state.currentUser;
  const user = state.currentUser;

  drawerContainer.innerHTML = `
    <!-- Overlay -->
    <div id="drawer-overlay" onclick="closeDrawer()" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs hidden transition-opacity"></div>

    <!-- Aside Panel -->
    <aside id="mobile-drawer" class="fixed top-0 bottom-0 left-0 w-[295px] z-50 bg-white shadow-2xl flex flex-col transform -translate-x-full transition-transform duration-300 ease-in-out">
      <!-- Drawer Header -->
      <div class="h-16 px-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
        <div class="flex items-center gap-2.5">
          <img src="favicon.png" alt="Logo UT" class="h-8 w-auto object-contain" />
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900 leading-tight">E-LEARNING UT 2026.2</span>
            <span class="text-[11px] font-semibold text-[#004990]">Bagoes Panca Wiratama, S.Pd., M.Pd.</span>
          </div>
        </div>
        <button onclick="closeDrawer()" class="w-8 h-8 flex items-center justify-center text-slate-500 rounded-lg hover:bg-slate-200 transition">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- User Info Card if Logged In -->
      ${isLogged ? `
        <div class="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#004990]/20 flex-shrink-0 bg-white">
            <img src="${user.role === 'tutor' ? TUTOR_DATA.foto : 'bagus_avatar.jpg'}" alt="${user.nama}" class="w-full h-full object-cover object-top" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-slate-900 truncate">${user.nama}</span>
            <span class="text-[11px] font-semibold text-[#004990] truncate">
              ${user.role === 'tutor' ? 'Tutor Pengampu' : `Kelas ${user.kelas} • NIM ${user.nim}`}
            </span>
          </div>
        </div>
      ` : ''}

      <!-- Drawer Nav List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div class="px-2 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Menu Navigasi</div>
        
        <button onclick="closeDrawer(); navigateTo('home')" class="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-left font-bold text-sm transition ${state.view === 'home' ? 'text-[#003367] bg-blue-50' : 'text-slate-700 hover:bg-slate-100'}">
          <span class="material-symbols-outlined text-[#004990] text-[20px]">home</span>
          <span>Beranda Portal</span>
        </button>

        <div class="pt-2 px-2 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Pilih Kelas & Mata Kuliah</div>

        <button onclick="closeDrawer(); handleNavClassClick('5A')" class="w-full flex items-center justify-between px-3 h-11 rounded-xl text-left font-semibold text-sm transition text-slate-700 hover:bg-slate-100">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-blue-600 text-[20px]">psychology</span>
            <span class="truncate">Kelas 5A - SPGK4410</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">29 Mhs</span>
        </button>

        <button onclick="closeDrawer(); handleNavClassClick('6A')" class="w-full flex items-center justify-between px-3 h-11 rounded-xl text-left font-semibold text-sm transition text-slate-700 hover:bg-slate-100">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">diversity_1</span>
            <span class="truncate">Kelas 6A - SPDA4401</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">19 Mhs</span>
        </button>

        <button onclick="closeDrawer(); handleNavClassClick('7C1')" class="w-full flex items-center justify-between px-3 h-11 rounded-xl text-left font-semibold text-sm transition text-slate-700 hover:bg-slate-100">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-sky-600 text-[20px]">co_present</span>
            <span class="truncate">Kelas 7C1 - SPGK4408</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">15 Mhs</span>
        </button>

        <button onclick="closeDrawer(); handleNavClassClick('7D1')" class="w-full flex items-center justify-between px-3 h-11 rounded-xl text-left font-semibold text-sm transition text-slate-700 hover:bg-slate-100">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-emerald-600 text-[20px]">history_edu</span>
            <span class="truncate">Kelas 7D1 - SPGK4408</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">15 Mhs</span>
        </button>

        <div class="pt-2 px-2 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">Portal & Profil</div>

        <button onclick="closeDrawer(); quickLoginTutor()" class="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-left font-semibold text-sm text-slate-700 hover:bg-slate-100 transition">
          <span class="material-symbols-outlined text-amber-500 text-[20px]">verified_user</span>
          <span>Panel Tutor Pengampu</span>
        </button>
      </div>

      <!-- Drawer Footer -->
      <div class="p-3 bg-slate-50 border-t border-slate-200">
        ${isLogged ? `
          <button onclick="closeDrawer(); handleLogout()" class="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition">
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar Akun</span>
          </button>
        ` : `
          <button onclick="handleDrawerLogin()" class="w-full h-10 rounded-xl bg-[#003367] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition">
            <span class="material-symbols-outlined text-[18px]">lock_open</span>
            <span>Login Mahasiswa</span>
          </button>
        `}
      </div>
    </aside>
  `;
}

function renderBottomNav() {
  const bottomNavContainer = document.getElementById('app-bottom-nav');
  if (!bottomNavContainer) return;

  const isLogged = !!state.currentUser;

  bottomNavContainer.innerHTML = `
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,51,103,0.08)]">
      <div class="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        <button onclick="navigateTo('home')" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition ${state.view === 'home' ? 'text-[#003367] font-bold' : 'text-slate-500 hover:text-slate-800'}">
          <span class="material-symbols-outlined text-[24px]">home</span>
          <span class="text-[10px] mt-0.5">Beranda</span>
        </button>

        <button onclick="navigateTo('dashboard', {classId: state.currentUser?.kelas || state.currentClassId})" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition ${state.view === 'dashboard' ? 'text-[#003367] font-bold' : 'text-slate-500 hover:text-slate-800'}">
          <span class="material-symbols-outlined text-[24px]">school</span>
          <span class="text-[10px] mt-0.5">Kelas</span>
        </button>

        <button onclick="navigateTo('tutorial-detail', {classId: state.currentClassId, sesi: state.currentSesi})" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition ${state.view === 'tutorial-detail' ? 'text-[#003367] font-bold' : 'text-slate-500 hover:text-slate-800'}">
          <span class="material-symbols-outlined text-[24px]">auto_stories</span>
          <span class="text-[10px] mt-0.5">Tutorial</span>
        </button>

        <button onclick="handleBottomNavProfile()" class="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition ${state.view === 'tutor-view' ? 'text-[#003367] font-bold' : 'text-slate-500 hover:text-slate-800'}">
          <span class="material-symbols-outlined text-[24px]">${isLogged ? 'person' : 'account_circle'}</span>
          <span class="text-[10px] mt-0.5">${isLogged ? 'Profil' : 'Login'}</span>
        </button>
      </div>
    </nav>
  `;
}

// ============================================================================
// 1. HOME VIEW (BERANDA & LOGIN PORTAL)
// ============================================================================

function renderHomeView() {
  return `
    <div class="flex flex-col space-y-6 sm:space-y-8 pb-16">
      
      <!-- HERO BANNER -->
      <section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#003367] via-[#004990] to-[#0b2545] text-white p-5 sm:p-8 md:p-10 shadow-xl border border-blue-900/40">
        <!-- Decorative Glow Orbs -->
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-[#F7B500]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between">
          <div class="flex flex-col space-y-3.5 max-w-xl text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-amber-300 self-center md:self-start">
              <span class="material-symbols-outlined text-[15px] text-[#F7B500]">stars</span>
              <span>Portal Resmi Perkuliahan Semester Ganjil 2026/2027</span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              E-LEARNING UT 2026.2 <br class="hidden sm:block"/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
                Bagoes Panca Wiratama, S.Pd., M.Pd.
              </span>
            </h1>

            <p class="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Portal perkuliahan mandiri dan tutorial resmi Universitas Terbuka Semester 2026.2. Menyediakan modul ajar digital, bimbingan tutorial tatap muka & tuweb terstruktur, penugasan lembar kerja LKPD, ruang diskusi pemantik, dan penilaian berkala.
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 pt-2 w-full sm:w-auto">
              <a href="#login-section" class="h-11 px-5 rounded-xl bg-[#F7B500] hover:bg-yellow-400 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[19px]">lock_open</span>
                <span>Login Mahasiswa</span>
              </a>
              <a href="#tutor-section" class="h-11 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md active:scale-95 transition flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[19px]">person</span>
                <span>Profil Tutor Pengampu</span>
              </a>
            </div>

            <!-- Mobile Compact Stats Row -->
            <div class="md:hidden flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold text-amber-200">
              <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">📚 4 Kelas Aktif</span>
              <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">👥 78 Mahasiswa</span>
              <span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">🎓 Semester 2026.2</span>
            </div>
          </div>

          <!-- Mini Academic Badge Card (Visible on tablet & desktop) -->
          <div class="hidden md:flex w-full md:w-auto flex-col items-center">
            <div class="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center text-center max-w-xs w-full">
              <div class="w-16 h-16 rounded-2xl bg-white/20 p-2 shadow-inner flex items-center justify-center mb-3">
                <img src="favicon.png" alt="Logo UT" class="h-full w-auto object-contain" />
              </div>
              <span class="text-xs font-bold text-white uppercase tracking-wider">Universitas Terbuka</span>
              <span class="text-[11px] text-blue-200 mt-0.5">Masa Tutorial 2026.2</span>
              <div class="w-full h-px bg-white/20 my-3"></div>
              <div class="grid grid-cols-2 gap-2 w-full text-center">
                <div class="bg-white/10 p-2 rounded-xl">
                  <span class="text-base font-extrabold text-amber-300 block">4</span>
                  <span class="text-[10px] text-blue-100">Kelas Aktif</span>
                </div>
                <div class="bg-white/10 p-2 rounded-xl">
                  <span class="text-base font-extrabold text-amber-300 block">78</span>
                  <span class="text-[10px] text-blue-100">Mahasiswa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TUTOR EXECUTIVE PROFILE CARD -->
      <section id="tutor-section" class="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden relative">
        <div class="h-2 w-full bg-gradient-to-r from-[#003367] via-[#004990] to-[#F7B500]"></div>
        
        <div class="p-5 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Tutor Photo with Border & Verified Badge -->
          <div class="relative flex-shrink-0">
            <div class="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden shadow-lg ring-4 ring-[#003367]/10 border-2 border-white bg-slate-100">
              <img src="${TUTOR_DATA.foto}" alt="${TUTOR_DATA.nama}" class="w-full h-full object-cover object-top" />
            </div>
            <div class="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              <span class="material-symbols-outlined text-[24px] text-[#004990]" style="font-variation-settings: 'FILL' 1;">verified</span>
            </div>
          </div>

          <!-- Tutor Details -->
          <div class="flex-1 flex flex-col text-center md:text-left space-y-2.5">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-[#F7B500]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                TUTOR PENGAMPU UT
              </span>
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Aktif Membimbing 4 Kelas
              </span>
            </div>

            <div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-[#003367] tracking-tight">
                ${TUTOR_DATA.nama}
              </h2>
              <p class="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                Tutor Pengampu Perkuliahan Semester 2026.2 • Universitas Terbuka
              </p>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 italic">
              "${TUTOR_DATA.sambutan}"
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div class="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">Layanan</span>
                <span class="font-bold text-slate-800">TTM & Tuweb</span>
              </div>
              <div class="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">Pertemuan</span>
                <span class="font-bold text-slate-800">8x Tutorial / Kelas</span>
              </div>
              <div class="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">Basis Materi</span>
                <span class="font-bold text-slate-800">Modul BMP UT</span>
              </div>
              <div class="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                <span class="text-[10px] text-slate-500 block uppercase font-bold">Masa Studi</span>
                <span class="font-bold text-slate-800">Semester 2026.2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LOGIN SECTION (TABS: MAHASISWA & TUTOR) -->
      <section id="login-section" class="rounded-3xl bg-white border border-slate-200 shadow-lg p-5 sm:p-8 md:p-10 relative overflow-hidden">
        <div class="max-w-2xl mx-auto flex flex-col space-y-5">
          
          <!-- Role Selector Tabs -->
          <div class="flex p-1 rounded-2xl bg-slate-100 max-w-sm mx-auto w-full border border-slate-200/80">
            <button type="button" onclick="switchLoginRole('mahasiswa')" id="tab-login-mahasiswa" class="flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition ${state.loginRole !== 'tutor' ? 'bg-[#003367] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              👨‍🎓 Login Mahasiswa
            </button>
            <button type="button" onclick="switchLoginRole('tutor')" id="tab-login-tutor" class="flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs transition ${state.loginRole === 'tutor' ? 'bg-[#003367] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              👨‍🏫 Login Tutor
            </button>
          </div>

          <div class="text-center space-y-1.5">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#003367] flex items-center justify-center mx-auto shadow-xs">
              <span class="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h2 id="login-title" class="text-2xl font-extrabold text-slate-900 tracking-tight">
              ${state.loginRole === 'tutor' ? 'Login Tutor Pengampu' : 'Login Mahasiswa'}
            </h2>
            <p id="login-desc" class="text-xs sm:text-sm text-slate-500">
              ${state.loginRole === 'tutor' 
                ? 'Portal akses Tutor (<strong>' + TUTOR_DATA.nama + '</strong>) untuk memantau aktivitas dan memberikan penilaian mahasiswa.' 
                : 'Sesuai ketentuan akademik UT, gunakan <strong class="text-[#003367]">Email Kampus</strong> sebagai Username dan <strong class="text-[#003367]">NIM</strong> sebagai Password untuk mengakses kelas & materi perkuliahan.'}
            </p>
          </div>

          <!-- Error Alert Container -->
          <div id="login-error" class="hidden p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"></div>

          <!-- Formal Login Form -->
          <form onsubmit="handleLogin(event)" class="space-y-4">
            <div>
              <label id="login-user-label" class="block text-xs font-bold text-slate-700 mb-1.5">
                ${state.loginRole === 'tutor' ? 'Username / Email Tutor' : 'Username (Email Kampus atau NIM)'}
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input id="login-username" type="text" required
                       placeholder="${state.loginRole === 'tutor' ? 'bagoespancawiratama@gmail.com' : 'Contoh: 860080512@ecampus.ut.ac.id atau 860080512'}" 
                       value=""
                       class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004990] focus:border-transparent text-xs sm:text-sm font-medium transition" />
              </div>
            </div>

            <div>
              <label id="login-pw-label" class="block text-xs font-bold text-slate-700 mb-1.5">
                ${state.loginRole === 'tutor' ? 'Password Tutor' : 'Password (Nomor Induk Mahasiswa / NIM)'}
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <span class="material-symbols-outlined text-[20px]">key</span>
                </span>
                <input id="login-password" type="password" required
                       placeholder="${state.loginRole === 'tutor' ? 'Masukkan Password Tutor (18004313*)' : 'Masukkan NIM Anda'}" 
                       value=""
                       class="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004990] focus:border-transparent text-xs sm:text-sm font-medium transition" />
                <button type="button" onclick="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                  <span id="pw-icon" class="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>

            <button type="submit" class="w-full h-12 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[20px]">login</span>
              <span id="login-btn-text">${state.loginRole === 'tutor' ? 'Masuk ke Dasbor Penilaian Tutor' : 'Masuk ke Kelas Saya'}</span>
            </button>
          </form>

        </div>
      </section>

      <!-- INFORMASI LAYANAN TUTORIAL & KONTAK -->
      <section class="rounded-3xl bg-slate-100/90 border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-[#003367] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <span class="material-symbols-outlined text-[24px]">support_agent</span>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">Layanan Tutorial E-Learning UT 2026.2</h3>
            <p class="text-xs text-slate-600 mt-0.5">Bimbingan Akademik & Tutorial Bersama Tutor Bagoes Panca Wiratama, S.Pd., M.Pd.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a href="https://wa.me/6285758156726" target="_blank" class="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95">
            <span class="material-symbols-outlined text-[18px]">chat</span>
            <span>Hubungi: +62 857-5815-6726</span>
          </a>
        </div>
      </section>

    </div>
  `;
}

function renderCourseCard(classId) {
  const c = COURSES_DATA[classId];
  const stCount = STUDENTS_DATA.filter(s => s.kelas === classId).length;
  const user = state.currentUser;
  const isStudent = user && user.role === 'mahasiswa';
  const isTutor = user && user.role === 'tutor';
  const isMyClass = isStudent && user.kelas === classId;

  return `
    <div class="rounded-2xl bg-white border ${isMyClass ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group">
      <div>
        <div class="flex items-center justify-between mb-2.5">
          <span class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${c.badge_color} text-white shadow-2xs">
            KELAS ${c.id}
          </span>
          <div class="flex items-center gap-1.5">
            ${isMyClass ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                KELAS SAYA
              </span>
            ` : !user ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[12px]">lock</span>
                Wajib Login
              </span>
            ` : ''}
            <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-slate-400">group</span>
              <span>${stCount} Mhs</span>
            </span>
          </div>
        </div>

        <div class="space-y-1">
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide block">${c.kode} • ${c.sks} SKS</span>
          <h3 class="text-base font-extrabold text-slate-900 group-hover:text-[#004990] transition leading-snug">
            ${c.nama}
          </h3>
          <p class="text-xs text-slate-500 line-clamp-2 mt-1.5">
            ${c.deskripsi}
          </p>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200 flex-shrink-0">
            <img src="${TUTOR_DATA.foto}" alt="${TUTOR_DATA.nama}" class="w-full h-full object-cover object-top" />
          </div>
          <span class="text-[11px] font-semibold text-slate-700 truncate max-w-[130px] sm:max-w-[160px]">
            ${TUTOR_DATA.nama}
          </span>
        </div>

        ${!user ? `
          <button onclick="openLoginModal('${classId}')" class="h-9 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs">
            <span class="material-symbols-outlined text-[16px] text-amber-600">lock</span>
            <span>Login Kelas ${c.id}</span>
          </button>
        ` : isMyClass || isTutor ? `
          <button onclick="navigateTo('dashboard', {classId: '${classId}'})" class="h-9 px-3.5 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95">
            <span>${isMyClass ? 'Masuk Kelas Saya' : 'Kelola Kelas'}</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        ` : `
          <button onclick="showToast('Anda terdaftar di Kelas ' + state.currentUser.kelas + ', bukan Kelas ${c.id}', 'error')" class="h-9 px-3.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center gap-1 cursor-not-allowed">
            <span class="material-symbols-outlined text-[16px]">lock</span>
            <span>Bukan Kelas Anda</span>
          </button>
        `}
      </div>
    </div>
  `;
}

function attachHomeEvents() {
  window.togglePasswordVisibility = () => {
    const pw = document.getElementById('login-password');
    const icon = document.getElementById('pw-icon');
    if (pw) {
      if (pw.type === 'password') {
        pw.type = 'text';
        if (icon) icon.innerText = 'visibility_off';
      } else {
        pw.type = 'password';
        if (icon) icon.innerText = 'visibility';
      }
    }
  };
}

// ============================================================================
// 2. DASHBOARD VIEW (DASHBOARD KELAS & 8 TUTORIAL)
// ============================================================================

function renderDashboardView() {
  const course = getCurrentCourse();
  const tutorials = TUTORIALS_DATA[course.id] || TUTORIALS_DATA['5A'];
  const user = state.currentUser;
  const isStudent = user && user.role === 'mahasiswa';
  const isTutor = user && user.role === 'tutor';

  // If Tutor arrives here, direct to Tutor View!
  if (isTutor) {
    state.currentClassId = course.id;
    return renderTutorManagementView();
  }

  // If NOT logged in: Lock view completely! Jangan tampilkan isinya!
  if (!user) {
    return `
      <div class="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[36px]">lock</span>
        </div>
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wider">Akses Terkunci</span>
          <h2 class="text-xl font-extrabold text-slate-900">Login Mahasiswa Kelas ${course.id}</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Materi dan rangkaian 8 tutorial mata kuliah <strong>${course.nama} (${course.kode})</strong> pada Kelas ${course.id} bersifat tertutup dan <strong>wajib login mahasiswa</strong> resmi.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2.5">
          <button onclick="openLoginModal('${course.id}')" class="w-full h-11 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <span class="material-symbols-outlined text-[18px] text-[#F7B500]">lock_open</span>
            <span>Masuk / Login Mahasiswa Kelas ${course.id}</span>
          </button>
          <button onclick="navigateTo('home')" class="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    `;
  }

  // If student of another class:
  if (isStudent && user.kelas !== course.id) {
    return `
      <div class="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[36px]">block</span>
        </div>
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-rose-600 uppercase tracking-wider">Akses Dibatasi</span>
          <h2 class="text-xl font-extrabold text-slate-900">Bukan Rombel Terdaftar Anda</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Hai <strong>${user.nama}</strong> (NIM: ${user.nim}), data akademik menunjukkan Anda terdaftar pada <strong>Kelas ${user.kelas}</strong>. Anda tidak dapat melihat materi Tutorial Kelas ${course.id}.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2.5">
          <button onclick="navigateTo('dashboard', {classId: '${user.kelas}'})" class="w-full h-11 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <span>Buka Kelas Saya (${user.kelas})</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button onclick="navigateTo('home')" class="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    `;
  }

  // Only reached when user is verified student of this class!
  return `
    <div class="flex flex-col space-y-6 pb-20">
      
      <!-- Back to Portal & Breadcrumbs -->
      <div class="flex items-center justify-between">
        <button onclick="navigateTo('home')" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#004990] hover:underline">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali ke Beranda Portal</span>
        </button>

        <!-- Switch Class Pill Selector -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button onclick="handleNavClassClick('5A')" class="px-2.5 py-1 rounded-lg ${state.currentClassId === '5A' ? 'bg-[#004990] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">5A</button>
          <button onclick="handleNavClassClick('6A')" class="px-2.5 py-1 rounded-lg ${state.currentClassId === '6A' ? 'bg-[#004990] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">6A</button>
          <button onclick="handleNavClassClick('7C1')" class="px-2.5 py-1 rounded-lg ${state.currentClassId === '7C1' ? 'bg-[#004990] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">7C1</button>
          <button onclick="handleNavClassClick('7D1')" class="px-2.5 py-1 rounded-lg ${state.currentClassId === '7D1' ? 'bg-[#004990] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">7D1</button>
        </div>
      </div>

      <!-- COURSE HEADER BANNER -->
      <section class="rounded-3xl bg-white border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div class="space-y-3 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-xl text-xs font-extrabold ${course.badge_color} text-white shadow-2xs">
              KELAS ${course.id}
            </span>
            <span class="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-[#004990] border border-blue-200">
              ${course.kode} • ${course.sks} SKS
            </span>
            <span class="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
              ${course.semester}
            </span>
          </div>

          <div>
            <h1 class="text-xl sm:text-3xl font-extrabold text-[#003367] tracking-tight">
              ${course.nama}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Program Studi ${course.prodi} • Masa Tutorial 2026.2
            </p>
          </div>

          <div class="flex items-center gap-3 pt-1">
            <div class="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#004990]/20 flex-shrink-0 bg-slate-100">
              <img src="${TUTOR_DATA.foto}" alt="${TUTOR_DATA.nama}" class="w-full h-full object-cover object-top" />
            </div>
            <div class="flex flex-col">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tutor Pembimbing</span>
              <span class="text-xs font-bold text-slate-800">${TUTOR_DATA.nama}</span>
            </div>
          </div>
        </div>

        <!-- Student Identification Chip -->
        <div class="w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-2 min-w-[240px]">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Akses Mahasiswa</span>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold text-slate-900">${user.nama}</span>
            <span class="text-xs font-semibold text-[#004990]">NIM: ${user.nim}</span>
            <span class="text-[11px] text-emerald-700 font-extrabold mt-1 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Terverifikasi Kelas ${user.kelas} (Terbuka)
            </span>
          </div>
        </div>
      </section>

      <!-- TUTORIAL TIMELINE (8 PERTEMUAN) -->
      <section class="flex flex-col space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Rangkaian 8x Pertemuan Tutorial</span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span class="material-symbols-outlined text-[13px] text-emerald-600">lock_open</span>
                TERBUKA
              </span>
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              Setiap pertemuan dilengkapi dengan 8 menu terstruktur sesuai standar pembelajaran UT.
            </p>
          </div>
          <span class="text-xs font-bold text-[#004990] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 self-start sm:self-auto">
            8 Sesi • 3 Tugas Wajib (TTM 1, 2, 3)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tutorials.map(tut => renderTutorialCard(tut, course, true)).join('')}
        </div>
      </section>

    </div>
  `;
}

function renderTutorialCard(tut, course, isUnlocked) {
  const isTTM = !!tut.tugas_khusus;

  return `
    <div class="rounded-2xl bg-white border ${!isUnlocked ? 'border-slate-200' : isTTM ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
      
      ${!isUnlocked ? `
        <!-- Lock indicator watermark -->
        <div class="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 z-10">
          <span class="material-symbols-outlined text-[13px] text-amber-600">lock</span>
          <span>Wajib Login</span>
        </div>
      ` : ''}

      <div class="space-y-3">
        <!-- Top Status Bar -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl ${!isUnlocked ? 'bg-slate-300 text-slate-700' : isTTM ? 'bg-amber-500 text-slate-900' : 'bg-[#003367] text-white'} font-extrabold text-xs flex items-center justify-center shadow-xs">
              ${tut.sesi}
            </span>
            <span class="text-xs font-bold text-slate-700">Tutorial ${tut.sesi}</span>
          </div>

          ${isUnlocked && isTTM ? `
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
              <span class="material-symbols-outlined text-[13px] text-amber-600">assignment</span>
              TUGAS TUTORIAL WAJIB
            </span>
          ` : !isUnlocked ? '' : `
            <span class="text-[11px] font-semibold text-slate-500">${tut.mode}</span>
          `}
        </div>

        <!-- Title & CPMK -->
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            ${tut.judul}
          </h3>
          <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed ${!isUnlocked ? 'filter blur-[1.5px] select-none' : ''}">
            ${tut.cpmk}
          </p>
        </div>

        <!-- 8 Menus Pill Badges Preview -->
        <div class="pt-2 border-t border-slate-100">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Menu Sesi:</span>
          <div class="flex flex-wrap gap-1 ${!isUnlocked ? 'opacity-50 select-none' : ''}">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">👥 Kelompok</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">📑 RAT/SAT</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">💡 Pemantik</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">📖 Materi</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">🎥 Video</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">📝 LKPD</span>
            <span class="px-2 py-0.5 rounded-md ${isTTM ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-600'} text-[10px] font-semibold">📊 Asesmen</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">💭 Refleksi</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2 flex items-center justify-between">
        <div class="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span class="material-symbols-outlined text-[15px] text-[#004990]">calendar_month</span>
          <span>${tut.tanggal}</span>
        </div>

        ${isUnlocked ? `
          <button onclick="navigateTo('tutorial-detail', {classId: '${course.id}', sesi: ${tut.sesi}})" class="h-9 px-4 rounded-xl ${isTTM ? 'bg-[#003367] hover:bg-[#004990] text-white' : 'bg-blue-50 hover:bg-[#004990] text-[#004990] hover:text-white'} font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs">
            <span>Buka 8 Menu</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        ` : `
          <button onclick="openLoginModal('${course.id}')" class="h-9 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs">
            <span class="material-symbols-outlined text-[15px] text-amber-600">lock</span>
            <span>Login untuk Melihat</span>
          </button>
        `}
      </div>
    </div>
  `;
}

// ============================================================================
// 3. TUTORIAL DETAIL VIEW (THE 8 STRUCTURED MENUS)
// ============================================================================

function renderTutorialDetailView() {
  const course = getCurrentCourse();
  const tut = getCurrentTutorial();
  const user = state.currentUser;
  const isStudent = user && user.role === 'mahasiswa';
  const isTutor = user && user.role === 'tutor';

  // If NOT logged in: Lock view completely!
  if (!user) {
    return `
      <div class="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[36px]">lock</span>
        </div>
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wider">Akses Terkunci</span>
          <h2 class="text-xl font-extrabold text-slate-900">Wajib Login Mahasiswa</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Rangkaian menu Tutorial ${tut.sesi} (${tut.judul}) pada Kelas ${course.id} (${course.kode}) <strong>tidak dapat dilihat</strong> jika belum login. Silakan login menggunakan Email Kampus dan NIM resmi Anda.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2.5">
          <button onclick="openLoginModal('${course.id}')" class="w-full h-11 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <span class="material-symbols-outlined text-[18px] text-[#F7B500]">lock_open</span>
            <span>Login Mahasiswa Sekarang</span>
          </button>
          <button onclick="navigateTo('home')" class="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    `;
  }

  // If student of another class:
  if (isStudent && user.kelas !== course.id) {
    return `
      <div class="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-[36px]">block</span>
        </div>
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-rose-600 uppercase tracking-wider">Akses Dibatasi</span>
          <h2 class="text-xl font-extrabold text-slate-900">Bukan Rombel Terdaftar Anda</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Hai <strong>${user.nama}</strong> (NIM: ${user.nim}), data akademik menunjukkan Anda terdaftar pada <strong>Kelas ${user.kelas}</strong>. Anda tidak dapat melihat materi Tutorial Kelas ${course.id}.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2.5">
          <button onclick="navigateTo('dashboard', {classId: '${user.kelas}'})" class="w-full h-11 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <span>Buka Kelas Saya (${user.kelas})</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button onclick="navigateTo('home')" class="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="flex flex-col space-y-6 pb-24">
      
      <!-- Top Navigation & Breadcrumbs -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <button onclick="navigateTo('dashboard', {classId: '${course.id}'})" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#004990] hover:underline">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali ke Dashboard Kelas ${course.id}</span>
        </button>

        <!-- Sesi Selector Pill Dropdown -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-500">Pindah Sesi:</span>
          <select onchange="navigateTo('tutorial-detail', {classId: '${course.id}', sesi: this.value})" class="px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004990]">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(s => `
              <option value="${s}" ${tut.sesi === s ? 'selected' : ''}>Tutorial ${s}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- SESSION HEADER CARD -->
      <section class="rounded-3xl bg-gradient-to-r from-[#003367] to-[#004990] text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div class="relative z-10 flex flex-col space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F7B500] text-slate-900 shadow-xs">
              TUTORIAL ${tut.sesi} DARI 8
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              Kelas ${course.id} • ${course.kode}
            </span>
            ${tut.tugas_khusus ? `
              <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">assignment</span>
                ${tut.tugas_khusus}
              </span>
            ` : ''}
          </div>

          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight">
            ${tut.judul}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-xs text-blue-100 font-medium">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-amber-300">event</span>
              <span>${tut.tanggal} (${tut.waktu})</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-amber-300">person</span>
              <span>Tutor: ${TUTOR_DATA.nama}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- THE 8 STRUCTURED MENUS HORIZONTAL TAB BAR -->
      <section class="sticky top-14 sm:top-16 z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-2">
        <div class="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm no-scrollbar">
          ${renderTabButton('kelompok', 'group', '1. Pembagian Kelompok')}
          ${renderTabButton('rat_sat', 'description', '2. RAT / SAT')}
          ${renderTabButton('pemantik', 'lightbulb', '3. Pertanyaan Pemantik')}
          ${renderTabButton('materi', 'menu_book', '4. Materi')}
          ${renderTabButton('video', 'smart_display', '5. Video Pembelajaran')}
          ${renderTabButton('lkpd', 'edit_document', isTutor ? '6. LKPD & Penilaian' : '6. LKPD')}
          ${renderTabButton('asesmen', 'quiz', isTutor ? '7. Asesmen & Tugas' : '7. Asesmen')}
          ${renderTabButton('refleksi', 'psychology_alt', isTutor ? '8. Refleksi & Partisipasi' : '8. Refleksi')}
          ${isTutor ? renderTabButton('gradebook', 'table_chart', '9. Rekap Nilai Akhir') : ''}
        </div>
      </section>

      <!-- ACTIVE TAB CONTENT WRAPPER -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 min-h-[400px]">
        ${renderActiveTabContent(tut, course)}
      </div>

    </div>
  `;
}

function renderTabButton(tabId, icon, label) {
  const isActive = state.currentTab === tabId;
  return `
    <button onclick="switchTab('${tabId}')" 
            class="tab-btn flex-shrink-0 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-[#003367] text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
      <span class="material-symbols-outlined text-[18px] ${isActive ? 'text-[#F7B500]' : 'text-slate-400'}">${icon}</span>
      <span>${label}</span>
    </button>
  `;
}

function switchTab(tabId) {
  state.currentTab = tabId;
  state.tutorTab = tabId;
  saveLocalState();
  renderApp();
}

// Render Content for each of the 8 Menus (plus Gradebook for Tutor)
function renderActiveTabContent(tut, course) {
  if (state.currentUser && state.currentUser.role === 'tutor') {
    const students = STUDENTS_DATA.filter(s => s.kelas === course.id);
    switch (state.currentTab) {
      case 'kelompok':
        return renderTutorKelompokMenu(tut, course, students);
      case 'rat_sat':
        return renderMenuRatSat(tut, course);
      case 'pemantik':
        return renderTutorPemantikMenu(tut, course, students);
      case 'materi':
        return renderMenuMateri(tut, course);
      case 'video':
        return renderMenuVideo(tut, course);
      case 'lkpd':
        return renderTutorLkpdMenu(tut, course, students);
      case 'asesmen':
        return renderTutorAsesmenMenu(tut, course, students);
      case 'refleksi':
        return renderTutorRefleksiMenu(tut, course, students);
      case 'gradebook':
        return renderTutorGradebookTab(course.id, course, students);
      default:
        return renderTutorLkpdMenu(tut, course, students);
    }
  }

  switch (state.currentTab) {
    case 'kelompok':
      return renderMenuKelompok(tut, course);
    case 'rat_sat':
      return renderMenuRatSat(tut, course);
    case 'pemantik':
      return renderMenuPemantik(tut, course);
    case 'materi':
      return renderMenuMateri(tut, course);
    case 'video':
      return renderMenuVideo(tut, course);
    case 'lkpd':
      return renderMenuLkpd(tut, course);
    case 'asesmen':
      return renderMenuAsesmen(tut, course);
    case 'refleksi':
      return renderMenuRefleksi(tut, course);
    default:
      return renderMenuKelompok(tut, course);
  }
}

// ----------------------------------------------------------------------------
// MENU 1: PEMBAGIAN KELOMPOK
// ----------------------------------------------------------------------------
function renderMenuKelompok(tut, course) {
  const groups = GROUPS_BY_CLASS[course.id] || [];
  const user = state.currentUser;
  const loggedNim = user?.nim;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 1 • Kolaborasi Belajar</span>
          <h2 class="text-xl font-extrabold text-slate-900">Pembagian Kelompok Diskusi Tutorial ${tut.sesi}</h2>
        </div>
        <div class="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Total: <strong class="text-slate-900">${groups.length} Kelompok</strong> di Kelas ${course.id}
        </div>
      </div>

      <!-- Assigned Topic Info Box -->
      <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
        <span class="material-symbols-outlined text-[24px] text-[#004990] mt-0.5">assignment</span>
        <div>
          <span class="text-xs font-bold text-[#003367] block">Topik Diskusi Kelompok Sesi ${tut.sesi}:</span>
          <p class="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">${tut.topik_kelompok}</p>
        </div>
      </div>

      <!-- Groups Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${groups.map(grp => {
          const isMyGroup = grp.anggota.some(m => m.nim === loggedNim);
          return `
            <div class="rounded-2xl border ${isMyGroup ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-slate-200 bg-white'} p-5 flex flex-col space-y-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-[#003367] text-white font-extrabold text-xs flex items-center justify-center">
                    K${grp.nomor}
                  </div>
                  <div>
                    <h3 class="text-sm font-extrabold text-slate-900">${grp.nama_kelompok}</h3>
                    <span class="text-[11px] text-slate-500 font-medium">${grp.anggota.length} Anggota Mahasiswa</span>
                  </div>
                </div>

                ${isMyGroup ? `
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#F7B500] text-slate-950 flex items-center gap-1 shadow-2xs">
                    <span class="material-symbols-outlined text-[13px]">star</span>
                    KELOMPOK ANDA
                  </span>
                ` : ''}
              </div>

              <!-- Ketua Kelompok -->
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs">
                <span class="material-symbols-outlined text-[18px] text-amber-500">crown</span>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Koordinator / Ketua</span>
                  <span class="font-bold text-slate-900 truncate">${grp.ketua}</span>
                </div>
              </div>

              <!-- Anggota List -->
              <div class="space-y-1.5 pt-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Anggota:</span>
                <ul class="space-y-1 text-xs">
                  ${grp.anggota.map((m, idx) => `
                    <li class="flex items-center justify-between py-1 px-2 rounded-lg ${m.nim === loggedNim ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                      <div class="flex items-center gap-2 truncate">
                        <span class="text-slate-400 text-[10px] font-mono">${idx + 1}.</span>
                        <span class="truncate">${m.nama}</span>
                      </div>
                      <span class="text-[10px] text-slate-500 font-mono ml-2">${m.nim}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 2: RAT / SAT
// ----------------------------------------------------------------------------
function renderMenuRatSat(tut, course) {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 2 • Kurikulum & Rencana Pembelajaran</span>
          <h2 class="text-xl font-extrabold text-slate-900">Rancangan & Satuan Aktivitas Tutorial (RAT/SAT)</h2>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="showToast('Dokumen RAT/SAT Sesi ${tut.sesi} berhasil disalin.', 'success')" class="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Salin Format</span>
          </button>
        </div>
      </div>

      <!-- RAT Overview Bento -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mata Kuliah & Kode</span>
          <p class="font-extrabold text-slate-900 text-sm">${course.kode} - ${course.nama}</p>
          <span class="text-slate-500">${course.sks} SKS • ${course.prodi}</span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tutor Pengampu</span>
          <p class="font-extrabold text-slate-900 text-sm">${TUTOR_DATA.nama}</p>
          <span class="text-slate-500">${TUTOR_DATA.pokjar} • ${TUTOR_DATA.upbjj}</span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durasi & Alokasi Waktu</span>
          <p class="font-extrabold text-slate-900 text-sm">120 Menit per Pertemuan</p>
          <span class="text-slate-500">15m Pendahuluan • 85m Inti • 20m Penutup</span>
        </div>
      </div>

      <!-- SAT Content Table -->
      <div class="space-y-4">
        <div class="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
          <span class="text-xs font-bold text-[#003367] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">target</span>
            Capaian Pembelajaran Khusus (Sub-CPMK Sesi ${tut.sesi})
          </span>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            ${tut.cpmk}
          </p>
        </div>

        <!-- 3 Tahapan Pembelajaran (120 Menit) -->
        <div class="space-y-2.5">
          <span class="text-xs font-bold text-slate-800 block">Skenario Tahapan Aktivitas Tutorial (SAT):</span>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <span class="font-extrabold text-slate-900 block">Kegiatan Pendahuluan (15 Menit)</span>
              <p class="text-slate-600 mt-0.5">Salam pembuka, presensi kehadiran, apersepsi keterkaitan materi sebelumnya, dan penyampaian pertanyaan pemantik serta tujuan belajar sesi ${tut.sesi}.</p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 font-extrabold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <span class="font-extrabold text-slate-900 block">Kegiatan Inti Tutorial (85 Menit)</span>
              <p class="text-slate-600 mt-0.5">Eksplorasi modul BMP UT, pemaparan konsep inti oleh tutor, diskusi kolaboratif kelompok menyelesaikan studi kasus LKPD, sesi tanya-jawab interaktif, dan simulasi.</p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <span class="font-extrabold text-slate-900 block">Kegiatan Penutup & Evaluasi (20 Menit)</span>
              <p class="text-slate-600 mt-0.5">Penyimpulan bersama materi sesi, pengerjaan kuis asesmen formatif, pengisian refleksi pembelajaran 3-2-1, dan penyampaian tugas mandiri untuk pertemuan selanjutnya.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 3: PERTANYAAN PEMANTIK & DISKUSI
// ----------------------------------------------------------------------------
function renderMenuPemantik(tut, course) {
  const commentKey = `${course.id}_sesi${tut.sesi}`;
  const existingComments = state.comments[commentKey] || [];
  const user = state.currentUser;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 3 • Stimulasi Berpikir Kritis</span>
          <h2 class="text-xl font-extrabold text-slate-900">Pertanyaan Pemantik & Forum Diskusi Sesi ${tut.sesi}</h2>
        </div>
      </div>

      <!-- Trigger Questions Card -->
      <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[22px] text-amber-600">lightbulb</span>
          <span class="text-xs font-bold text-amber-950 uppercase tracking-wide">Pertanyaan Pemantik dari Tutor:</span>
        </div>
        <div class="space-y-2">
          ${tut.pemantik.map((p, idx) => `
            <div class="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
              <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">${idx + 1}</span>
              <p class="leading-relaxed">${p}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tutor Starter Post -->
      <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#003367]/20 flex-shrink-0 bg-slate-100">
          <img src="${TUTOR_DATA.foto}" alt="${TUTOR_DATA.nama}" class="w-full h-full object-cover object-top" />
        </div>
        <div class="flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-extrabold text-slate-900">${TUTOR_DATA.nama}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#003367] text-white">TUTOR</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
            "Rekan-rekan mahasiswa Kelas ${course.id}, silakan telaah kedua pertanyaan di atas sebelum kita membahas bahan ajar lebih dalam. Berikan tanggapan kritis berdasarkan pengalaman mengajar nyata Anda di sekolah."
          </p>
          <span class="text-[10px] text-slate-400 block pt-1">Diposting Tutor • Wajib dijawab seluruh mahasiswa</span>
        </div>
      </div>

      <!-- Discussion Input Form -->
      <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700">Tuliskan Tanggapan / Argumen Anda:</span>
          ${user ? `<span class="text-[11px] font-semibold text-[#004990]">Sebagai: ${user.nama}</span>` : `<span class="text-[11px] text-slate-500">Mode Tamu / Mahasiswa</span>`}
        </div>

        <textarea id="comment-text-input" rows="3" 
                  placeholder="Tuliskan gagasan, analisis kritis, atau tanggapan Anda di sini..." 
                  class="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004990] text-xs sm:text-sm bg-white"></textarea>

        <div class="flex items-center justify-end">
          <button onclick="submitComment('${commentKey}')" class="h-10 px-5 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">send</span>
            <span>Kirim Tanggapan</span>
          </button>
        </div>
      </div>

      <!-- Comments Stream List -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800">Daftar Respons Mahasiswa (${existingComments.length}):</span>
        </div>

        ${existingComments.length === 0 ? `
          <div class="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Belum ada tanggapan untuk sesi ini. Jadilah mahasiswa pertama yang menuliskan analisis kritis Anda!
          </div>
        ` : `
          <div class="space-y-2.5">
            ${existingComments.map(c => `
              <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  ${c.nama.charAt(0)}
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-900">${c.nama}</span>
                    <span class="text-[10px] text-slate-400">${c.waktu}</span>
                  </div>
                  <p class="text-xs text-slate-700 leading-relaxed">${c.teks}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

function submitComment(key) {
  const input = document.getElementById('comment-text-input');
  if (!input || !input.value.trim()) {
    showToast('Silakan tuliskan tanggapan Anda terlebih dahulu.', 'error');
    return;
  }

  const user = state.currentUser;
  const authorName = user ? user.nama : 'Mahasiswa Universitas Terbuka';

  if (!state.comments[key]) state.comments[key] = [];

  state.comments[key].unshift({
    nama: authorName,
    teks: input.value.trim(),
    waktu: 'Baru saja'
  });

  input.value = '';
  saveLocalState();
  renderApp();
  showToast('Tanggapan berhasil dikirim dan tersimpan!', 'success');
}

// ----------------------------------------------------------------------------
// MENU 4: MATERI (BAHAN AJAR & PPT)
// ----------------------------------------------------------------------------
function renderMenuMateri(tut, course) {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 4 • Bahan Pembelajaran</span>
          <h2 class="text-xl font-extrabold text-slate-900">Materi Tutorial & Modul Pokok Sesi ${tut.sesi}</h2>
        </div>
      </div>

      <!-- Rangkuman Konsep Inti -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-[#004990]">auto_stories</span>
          <h3 class="text-sm font-extrabold text-slate-900">Ringkasan Materi Inisiasi</h3>
        </div>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          ${tut.materi_summary}
        </p>
      </div>

      <!-- Modul UT & Bahan Ajar Digital Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Modul BMP Card -->
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bahan Materi Pokok (BMP) UT</span>
              <h4 class="text-sm font-extrabold text-slate-900">${tut.modul_ut}</h4>
              <p class="text-xs text-slate-500 mt-0.5">Penerbit Universitas Terbuka • Ruang Baca Virtual (RBV)</p>
            </div>
          </div>
          <button onclick="showToast('Membuka Ruang Baca Virtual (RBV) Modul UT...', 'info')" class="h-10 px-4 rounded-xl bg-[#003367] hover:bg-[#004990] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
            <span>Buka Modul Digital UT</span>
          </button>
        </div>

        <!-- Slide PPT Presentasi Card -->
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-[24px]">slideshow</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Slide Tayang Tutor</span>
              <h4 class="text-sm font-extrabold text-slate-900">PPT Tutorial Sesi ${tut.sesi} (${course.kode})</h4>
              <p class="text-xs text-slate-500 mt-0.5">Disiapkan oleh: ${TUTOR_DATA.nama}</p>
            </div>
          </div>
          <button onclick="showToast('Mengunduh Slide PPT Tutorial ${tut.sesi}...', 'success')" class="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition">
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span>Unduh Slide PPT</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 5: VIDEO PEMBELAJARAN
// ----------------------------------------------------------------------------
function renderMenuVideo(tut, course) {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 5 • Media Audiovisual</span>
          <h2 class="text-xl font-extrabold text-slate-900">Video Pembelajaran Tutorial ${tut.sesi}</h2>
        </div>
      </div>

      <!-- Responsive Video Player Container -->
      <div class="space-y-3">
        <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-800 flex items-center justify-center">
          <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0" 
                  title="${tut.video_title}" frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-slate-900">${tut.video_title}</h3>
            <span class="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">12:45 Menit</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">${tut.video_desc}</p>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 6: LKPD (LEMBAR KERJA PESERTA DIDIK / MAHASISWA)
// ----------------------------------------------------------------------------
function renderMenuLkpd(tut, course) {
  const lkpdKey = `${course.id}_sesi${tut.sesi}`;
  const isSubmitted = state.submissions[lkpdKey];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 6 • Penugasan Lembar Kerja</span>
          <h2 class="text-xl font-extrabold text-slate-900">Lembar Kerja Mahasiswa (LKPD) Sesi ${tut.sesi}</h2>
        </div>
        ${isSubmitted ? `
          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            LKPD SUDAH DIKUMPULKAN
          </span>
        ` : `
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">pending_actions</span>
            Menunggu Pengumpulan
          </span>
        `}
      </div>

      <!-- LKPD Instructions -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#004990] text-[20px]">assignment</span>
          ${tut.lkpd_title}
        </h3>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          ${tut.lkpd_desc}
        </p>

        <div class="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-950 font-medium">
          <strong>Petunjuk Pengisian:</strong> Diskusikan bersama rekan kelompok Anda. Tuliskan jawaban ringkas di kolom bawah atau unggah berkas laporan dalam format PDF/Word.
        </div>
      </div>

      <!-- Submission Box -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <span class="text-xs font-bold text-slate-800 block">Formulir Pengumpulan Tugas LKPD:</span>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Jawaban / Ringkasan Analisis Kelompok:</label>
          <textarea id="lkpd-text-input" rows="4" placeholder="Ketik ringkasan hasil kerja kelompok di sini..." class="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004990]"></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Unggah Berkas Laporan (Opsional):</label>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white hover:bg-slate-50 transition cursor-pointer">
            <input type="file" id="lkpd-file-input" class="hidden" onchange="document.getElementById('file-chosen-name').innerText = this.files[0]?.name || 'Tidak ada berkas'" />
            <label for="lkpd-file-input" class="cursor-pointer flex flex-col items-center gap-1">
              <span class="material-symbols-outlined text-[28px] text-[#004990]">cloud_upload</span>
              <span class="text-xs font-bold text-slate-800">Klik untuk Pilih Dokumen / Foto Jawaban</span>
              <span class="text-[11px] text-slate-400">Mendukung file PDF, DOCX, atau Foto dari HP</span>
            </label>
            <span id="file-chosen-name" class="text-xs font-semibold text-[#004990] mt-2 block"></span>
          </div>
        </div>

        <button onclick="submitLkpd('${lkpdKey}')" class="h-11 px-6 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">task_alt</span>
          <span>Simpan & Serahkan LKPD</span>
        </button>
      </div>
    </div>
  `;
}

function submitLkpd(key) {
  state.submissions[key] = {
    tanggal: new Date().toLocaleDateString('id-ID'),
    status: 'Terkumpul'
  };
  saveLocalState();
  renderApp();
  showToast('LKPD berhasil disimpan dan diserahkan kepada Tutor!', 'success');
}

// ----------------------------------------------------------------------------
// MENU 7: ASESMEN (KUIS & TUGAS TUTORIAL WAJIB)
// ----------------------------------------------------------------------------
function renderMenuAsesmen(tut, course) {
  const quizKey = `${course.id}_sesi${tut.sesi}`;
  const savedScore = state.quizScores[quizKey];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 7 • Evaluasi & Pengukuran Capaian</span>
          <h2 class="text-xl font-extrabold text-slate-900">Asesmen Pembelajaran Tutorial ${tut.sesi}</h2>
        </div>
        ${savedScore !== undefined ? `
          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Skor Kuis Anda: ${savedScore} / 100
          </span>
        ` : ''}
      </div>

      <!-- TUGAS TUTORIAL WAJIB CALLOUT (SESI 3, 5, 7) -->
      ${tut.tugas_khusus ? `
        <div class="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[24px] text-amber-700">stars</span>
            <span class="text-sm font-extrabold text-amber-950 uppercase tracking-wide">${tut.tugas_khusus}</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            Pada pertemuan Sesi ${tut.sesi}, terdapat <strong>Tugas Tutorial Wajib (TTM)</strong> berbobot tinggi untuk penentuan nilai akhir mata kuliah ${course.kode}. Tugas ini harus diselesaikan secara mandiri dan diunggah sesuai rubrik penilaian UT.
          </p>
          <div class="pt-2 flex flex-wrap gap-2">
            <button onclick="showToast('Soal Tugas Tutorial Sesi ${tut.sesi} diunduh.', 'success')" class="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs">
              <span class="material-symbols-outlined text-[17px]">download</span>
              <span>Unduh Lembar Soal Tugas ${tut.sesi}</span>
            </button>
            <button onclick="showToast('Rubrik penilaian tugas 100 poin dibuka.', 'info')" class="h-9 px-4 rounded-xl bg-white text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[17px]">rubric</span>
              <span>Lihat Rubrik Skor 100</span>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- KUIS FORMATIF PILIHAN GANDA -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#004990] text-[20px]">quiz</span>
            Kuis Formatif Pemahaman Materi Sesi ${tut.sesi} (3 Soal)
          </h3>
          <span class="text-xs text-slate-500 font-medium">Nilai instan otomatis</span>
        </div>

        <form id="quiz-form" onsubmit="gradeQuiz(event, '${quizKey}', ${tut.quiz.length})" class="space-y-4">
          ${tut.quiz.map((item, qIdx) => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span class="text-xs font-extrabold text-slate-900 block leading-snug">
                ${qIdx + 1}. ${item.q}
              </span>
              <div class="space-y-1.5">
                ${item.opts.map((opt, oIdx) => `
                  <label class="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer text-xs font-medium transition">
                    <input type="radio" name="q_${qIdx}" value="${oIdx}" required class="text-[#004990] focus:ring-[#004990]" />
                    <span class="text-slate-800">${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <div class="pt-2">
            <button type="submit" class="h-11 px-6 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs shadow-md active:scale-95 transition flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Kirim & Nilai Kuis Sekarang</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  `;
}

function gradeQuiz(e, quizKey, totalQuestions) {
  e.preventDefault();
  const form = e.target;
  const tut = getCurrentTutorial();
  let correctCount = 0;

  tut.quiz.forEach((q, idx) => {
    const selected = form.querySelector(`input[name="q_${idx}"]:checked`);
    if (selected && parseInt(selected.value) === q.ans) {
      correctCount++;
    }
  });

  const finalScore = Math.round((correctCount / totalQuestions) * 100);
  state.quizScores[quizKey] = finalScore;
  saveLocalState();
  renderApp();
  showToast(`Kuis Selesai! Skor Anda: ${finalScore} / 100 (${correctCount} dari ${totalQuestions} benar)`, 'success');
}

// ----------------------------------------------------------------------------
// MENU 8: REFLEKSI (3-2-1 REFLECTION)
// ----------------------------------------------------------------------------
function renderMenuRefleksi(tut, course) {
  const refKey = `${course.id}_sesi${tut.sesi}`;
  const isSaved = state.reflections[refKey];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 8 • Refleksi Diri Mahasiswa</span>
          <h2 class="text-xl font-extrabold text-slate-900">Lembar Refleksi Pembelajaran Sesi ${tut.sesi}</h2>
        </div>
        ${isSaved ? `
          <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check_circle</span>
            Refleksi Tersimpan
          </span>
        ` : ''}
      </div>

      <!-- 3-2-1 Reflection Card Form -->
      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div class="space-y-1">
          <h3 class="text-sm font-extrabold text-slate-900">Format Refleksi Mandiri Model 3-2-1</h3>
          <p class="text-xs text-slate-500">
            Tuliskan pengalaman belajar yang Anda peroleh setelah menyelesaikan seluruh rangkaian aktivitas di Tutorial ${tut.sesi}.
          </p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-800 mb-1">
              🌟 3 Hal penting yang saya pahami dari materi sesi ini:
            </label>
            <textarea id="ref-3" rows="2" placeholder="Tuliskan 3 konsep kunci yang Anda kuasai..." class="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#004990]">${isSaved?.p1 || ''}</textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">
              ❓ 2 Hal yang masih ingin saya perdalam atau diskusikan lebih lanjut:
            </label>
            <textarea id="ref-2" rows="2" placeholder="Tuliskan hal yang masih membingungkan atau menarik untuk digali..." class="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#004990]">${isSaved?.p2 || ''}</textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">
              🚀 1 Rencana aksi nyata yang akan saya terapkan di kelas / sekolah:
            </label>
            <textarea id="ref-1" rows="2" placeholder="Tuliskan komitmen langkah konkret Anda..." class="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#004990]">${isSaved?.p3 || ''}</textarea>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            <span class="material-symbols-outlined text-[18px] text-amber-500">award_star</span>
            <span>Umpan balik langsung kepada Tutor Pengampu</span>
          </div>

          <button onclick="submitRefleksi('${refKey}')" class="h-10 px-5 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">save</span>
            <span>Simpan Refleksi</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function submitRefleksi(key) {
  const p1 = document.getElementById('ref-3')?.value || '';
  const p2 = document.getElementById('ref-2')?.value || '';
  const p3 = document.getElementById('ref-1')?.value || '';

  if (!p1 && !p2 && !p3) {
    showToast('Silakan isi setidaknya salah satu kolom refleksi.', 'error');
    return;
  }

  state.reflections[key] = { p1, p2, p3, tanggal: new Date().toLocaleDateString('id-ID') };
  saveLocalState();
  renderApp();
  showToast('Refleksi Anda berhasil disimpan!', 'success');
}

function attachTutorialEvents() {
  // Any DOM bindings needed for tutorial detail
}

// ============================================================================
// 4. TUTOR MANAGEMENT VIEW (PANEL DOSEN / TUTOR)
// ============================================================================

function renderTutorManagementView() {
  const selectedClass = state.currentClassId || '5A';
  const studentsInClass = STUDENTS_DATA.filter(s => s.kelas === selectedClass);
  const course = COURSES_DATA[selectedClass] || COURSES_DATA['5A'];
  const activeTab = state.tutorTab || 'lkpd';
  const sesiFilter = state.tutorSesiFilter || state.currentSesi || 1;
  const tutorials = TUTORIALS_DATA[selectedClass] || TUTORIALS_DATA['5A'];
  const currentTut = tutorials.find(t => t.sesi === sesiFilter) || tutorials[0];

  // Calculate Class Average (only from students with entered grades)
  let totalScore = 0;
  let gradedCount = 0;
  studentsInClass.forEach(s => {
    const g = state.grades && state.grades[s.nim];
    if (g && (g.tugas1 !== '' || g.tugas2 !== '' || g.tugas3 !== '' || g.partisipasi !== '')) {
      const t1 = parseFloat(g.tugas1) || 0;
      const t2 = parseFloat(g.tugas2) || 0;
      const t3 = parseFloat(g.tugas3) || 0;
      const part = parseFloat(g.partisipasi) || 0;
      const avgTugas = (t1 + t2 + t3) / 3;
      const finalScore = (0.7 * avgTugas) + (0.3 * part);
      totalScore += finalScore;
      gradedCount++;
    }
  });
  const classAverage = gradedCount > 0 ? (totalScore / gradedCount).toFixed(1) : '-';
  const averageStatus = gradedCount > 0 
    ? (parseFloat(classAverage) >= 85 ? 'Sangat Baik' : (parseFloat(classAverage) >= 75 ? 'Baik' : 'Cukup'))
    : 'Belum Ada Nilai';

  return `
    <div class="flex flex-col space-y-6 pb-24">
      
      <!-- Tutor Executive Header Card -->
      <section class="rounded-3xl bg-gradient-to-r from-[#003367] via-[#004990] to-[#0b2545] text-white p-5 sm:p-7 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden shadow-lg ring-3 ring-amber-400 border-2 border-white flex-shrink-0 bg-slate-100">
              <img src="${TUTOR_DATA.foto}" alt="${TUTOR_DATA.nama}" class="w-full h-full object-cover object-top" />
            </div>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Tutor Pengampu Resmi
                </span>
                <span class="text-[11px] text-blue-200 hidden sm:inline">• E-Learning Semester 2026.2</span>
              </div>
              <h1 class="text-lg sm:text-2xl font-extrabold leading-tight">${TUTOR_DATA.nama}</h1>
              <p class="text-xs text-blue-100">
                NIP: <span class="font-mono font-bold">${TUTOR_DATA.nip}</span> • ${TUTOR_DATA.upbjj}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button onclick="navigateTo('home')" class="h-10 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[18px]">home</span>
              <span>Beranda</span>
            </button>
            <button onclick="handleLogout()" class="h-10 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs flex items-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 4 Class Selector Tabs -->
      <section class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Rombongan Belajar (Kelas):</span>
          <span class="text-xs font-bold text-[#004990]">Aktif: Kelas ${selectedClass} (${studentsInClass.length} Mhs)</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          ${['5A', '6A', '7C1', '7D1'].map(cid => {
            const isSel = selectedClass === cid;
            const cInfo = COURSES_DATA[cid];
            const count = STUDENTS_DATA.filter(s => s.kelas === cid).length;
            return `
              <button onclick="switchTutorClass('${cid}')" class="p-3.5 rounded-2xl border text-left transition-all ${isSel ? 'bg-[#003367] text-white border-[#003367] shadow-md ring-2 ring-[#003367]/20' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-extrabold ${isSel ? 'text-amber-300' : 'text-[#004990]'}">KELAS ${cid}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isSel ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800'}">${count} Mhs</span>
                </div>
                <div class="text-[11px] font-semibold truncate ${isSel ? 'text-blue-100' : 'text-slate-600'}">${cInfo.kode}</div>
                <div class="text-[10px] truncate ${isSel ? 'text-blue-200' : 'text-slate-400'}">${cInfo.nama}</div>
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- 8-Session Selector Bar (Per Pertemuan) -->
      <section class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Pertemuan Tutorial (Sesi 1 s.d. 8):</span>
          <span class="text-xs font-bold text-slate-700">Terpilih: <strong>Tutorial Sesi ${currentTut.sesi}</strong></span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
            const isSel = currentTut.sesi === s;
            const isTTM = (s === 3 || s === 5 || s === 7);
            const ttmLabel = s === 3 ? 'Tugas 1' : (s === 5 ? 'Tugas 2' : 'Tugas 3');
            return `
              <button onclick="switchTutorSesi(${s})" class="flex-shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                isSel
                  ? 'bg-[#003367] text-white border-[#003367] shadow-md ring-2 ring-[#003367]/20 scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }">
                <span class="w-5 h-5 rounded-full ${isSel ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'} flex items-center justify-center text-[10px] font-black">${s}</span>
                <span>Sesi ${s}</span>
                ${isTTM ? `
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${isSel ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'}">
                    ${ttmLabel}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- SESSION HEADER CARD (IDENTIK DENGAN MAHASISWA) -->
      <section class="rounded-3xl bg-gradient-to-r from-[#003367] to-[#004990] text-white p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div class="relative z-10 flex flex-col space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F7B500] text-slate-900 shadow-xs">
              TUTORIAL ${currentTut.sesi} DARI 8
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              Kelas ${course.id} • ${course.kode} (${course.sks} SKS)
            </span>
            ${currentTut.tugas_khusus ? `
              <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <span class="material-symbols-outlined text-[15px]">assignment</span>
                ${currentTut.tugas_khusus} (BOBOT UT 70%)
              </span>
            ` : ''}
          </div>

          <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">
            ${currentTut.judul}
          </h2>

          <div class="flex flex-wrap items-center gap-4 text-xs text-blue-100 font-medium">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-amber-300">event</span>
              <span>${currentTut.tanggal} (${currentTut.waktu})</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-amber-300">target</span>
              <span class="truncate max-w-md">${currentTut.cpmk}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- THE 8 STRUCTURED MENUS + REKAP NILAI TAB BAR (SAMA PERSIS DENGAN MAHASISWA) -->
      <section class="sticky top-14 sm:top-16 z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-2">
        <div class="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm no-scrollbar">
          ${renderTutorTabButton('kelompok', 'group', '1. Kelompok')}
          ${renderTutorTabButton('rat_sat', 'description', '2. RAT / SAT')}
          ${renderTutorTabButton('pemantik', 'lightbulb', '3. Pemantik & Diskusi')}
          ${renderTutorTabButton('materi', 'menu_book', '4. Materi Inisiasi')}
          ${renderTutorTabButton('video', 'smart_display', '5. Video Pembelajaran')}
          ${renderTutorTabButton('lkpd', 'edit_document', '6. LKPD & Penilaian')}
          ${renderTutorTabButton('asesmen', 'quiz', '7. Asesmen & Tugas')}
          ${renderTutorTabButton('refleksi', 'psychology_alt', '8. Refleksi & Partisipasi')}
          ${renderTutorTabButton('gradebook', 'table_chart', '9. Rekap Nilai Akhir')}
        </div>
      </section>

      <!-- ACTIVE TAB CONTENT WITH EMBEDDED TUTOR GRADING INTERFACES -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 min-h-[420px]">
        ${renderActiveTutorTabContent(activeTab, currentTut, course, studentsInClass)}
      </div>

    </div>
  `;
}

function renderTutorTabButton(tabId, icon, label) {
  const isActive = (state.tutorTab || 'lkpd') === tabId;
  return `
    <button onclick="switchTutorTab('${tabId}')" 
            class="flex-shrink-0 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-[#003367] text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }">
      <span class="material-symbols-outlined text-[18px] ${isActive ? 'text-[#F7B500]' : 'text-slate-400'}">${icon}</span>
      <span>${label}</span>
    </button>
  `;
}

function renderActiveTutorTabContent(activeTab, tut, course, students) {
  switch (activeTab) {
    case 'kelompok':
      return renderTutorKelompokMenu(tut, course, students);
    case 'rat_sat':
      return renderMenuRatSat(tut, course);
    case 'pemantik':
      return renderTutorPemantikMenu(tut, course, students);
    case 'materi':
      return renderMenuMateri(tut, course);
    case 'video':
      return renderMenuVideo(tut, course);
    case 'lkpd':
      return renderTutorLkpdMenu(tut, course, students);
    case 'asesmen':
      return renderTutorAsesmenMenu(tut, course, students);
    case 'refleksi':
      return renderTutorRefleksiMenu(tut, course, students);
    case 'gradebook':
      return renderTutorGradebookTab(course.id, course, students);
    default:
      return renderTutorLkpdMenu(tut, course, students);
  }
}

// ----------------------------------------------------------------------------
// MENU 1 (TUTOR): PEMBAGIAN KELOMPOK
// ----------------------------------------------------------------------------
function renderTutorKelompokMenu(tut, course, students) {
  const groups = GROUPS_BY_CLASS[course.id] || [];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 1 • Kolaborasi Belajar Mahasiswa</span>
          <h2 class="text-xl font-extrabold text-slate-900">Pembagian Kelompok Diskusi: Kelas ${course.id}</h2>
        </div>
        <span class="text-xs font-bold text-[#004990] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
          Total: ${groups.length} Kelompok Terdaftar
        </span>
      </div>

      <!-- Assigned Topic Info Box -->
      <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
        <span class="material-symbols-outlined text-[24px] text-[#004990] mt-0.5">assignment</span>
        <div>
          <span class="text-xs font-bold text-[#003367] block">Topik Diskusi Kelompok Sesi ${tut.sesi}:</span>
          <p class="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">${tut.topik_kelompok}</p>
        </div>
      </div>

      <!-- Groups Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${groups.map(grp => `
          <div class="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col space-y-3 shadow-2xs">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-[#003367] text-white font-extrabold text-xs flex items-center justify-center">
                  K${grp.nomor}
                </div>
                <div>
                  <h3 class="text-sm font-extrabold text-slate-900">${grp.nama_kelompok}</h3>
                  <span class="text-[11px] text-slate-500 font-medium">${grp.anggota.length} Anggota Mahasiswa</span>
                </div>
              </div>
            </div>

            <!-- Ketua Kelompok -->
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs">
              <span class="material-symbols-outlined text-[18px] text-amber-500">crown</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Koordinator / Ketua</span>
                <span class="font-bold text-slate-900 truncate">${grp.ketua}</span>
              </div>
            </div>

            <!-- Anggota List -->
            <div class="space-y-1.5 pt-1">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Anggota:</span>
              <ul class="space-y-1 text-xs">
                ${grp.anggota.map((m, idx) => `
                  <li class="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 text-slate-700">
                    <div class="flex items-center gap-2 truncate">
                      <span class="text-slate-400 text-[10px] font-mono">${idx + 1}.</span>
                      <span class="font-medium truncate">${m.nama}</span>
                    </div>
                    <span class="font-mono text-[10px] text-slate-400">${m.nim}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 3 (TUTOR): PERTANYAAN PEMANTIK & DISKUSI
// ----------------------------------------------------------------------------
function renderTutorPemantikMenu(tut, course, students) {
  const commentKey = `${course.id}_sesi${tut.sesi}`;
  const existingComments = state.comments[commentKey] || [];

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 3 • Diskusi & Pemikiran Kritis</span>
          <h2 class="text-xl font-extrabold text-slate-900">Forum Pertanyaan Pemantik Tutorial Sesi ${tut.sesi}</h2>
        </div>
      </div>

      <!-- Pemantik Prompts Box -->
      <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[22px] text-amber-600">lightbulb</span>
          <span class="text-xs font-extrabold text-amber-950 uppercase tracking-wide">Pertanyaan Pemantik dari Tutor:</span>
        </div>
        <div class="space-y-2">
          ${tut.pemantik.map((p, idx) => `
            <div class="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
              <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">${idx + 1}</span>
              <p class="leading-relaxed">${p}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Comments Stream -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tanggapan Masuk dari Mahasiswa Kelas ${course.id} (${existingComments.length}):
        </h4>

        ${existingComments.length === 0 ? `
          <div class="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Belum ada tanggapan mahasiswa untuk sesi ini.
          </div>
        ` : `
          <div class="space-y-2.5">
            ${existingComments.map(c => `
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-[#003367] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  ${c.nama.charAt(0)}
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-900">${c.nama}</span>
                    <span class="text-[10px] text-slate-400">${c.waktu}</span>
                  </div>
                  <p class="text-xs text-slate-700 leading-relaxed">${c.teks}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Tutor Direct Post Input -->
      <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <span class="text-xs font-bold text-slate-800 block">Kirim Tanggapan / Penguatan Tutor:</span>
        <textarea id="comment-text-input" rows="3" placeholder="Tuliskan ulasan atau tanggapan pembimbingan untuk mahasiswa..." class="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004990] text-xs sm:text-sm bg-slate-50"></textarea>
        <div class="flex items-center justify-end">
          <button onclick="submitComment('${commentKey}')" class="h-10 px-5 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-bold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">send</span>
            <span>Posting Tanggapan Tutor</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 6 (TUTOR): LKPD DENGAN PANEL PENILAIAN LENGKAP
// ----------------------------------------------------------------------------
function renderTutorLkpdMenu(tut, course, students) {
  return `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 6 • Penugasan Lembar Kerja Peserta Didik</span>
          <h2 class="text-xl font-extrabold text-slate-900">LKPD Sesi ${tut.sesi}: ${tut.lkpd_title}</h2>
        </div>
        <button onclick="showToast('Mengunduh master berkas LKPD Sesi ${tut.sesi}...', 'info')" class="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto">
          <span class="material-symbols-outlined text-[17px] text-[#004990]">download</span>
          <span>Unduh Format Soal LKPD</span>
        </button>
      </div>

      <!-- LKPD Overview Info Card for Tutor -->
      <div class="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-[#004990]">assignment</span>
          <h3 class="text-sm font-extrabold text-slate-900">Instruksi & Kasus LKPD Mahasiswa</h3>
        </div>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          ${tut.lkpd_desc}
        </p>
      </div>

      <!-- TUTOR GRADING ROSTER & PANEL FOR LKPD -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#004990] text-[20px]">grading</span>
              <span>Lembar Penilaian & Evaluasi LKPD Sesi ${tut.sesi}</span>
            </h3>
            <p class="text-xs text-slate-500">
              Input nilai (0 - 100) dan berikan catatan evaluasi untuk setiap mahasiswa Kelas ${course.id}.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="saveAllInlineGrades('${course.id}', 'lkpd', ${tut.sesi})" class="h-9 px-4 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition">
              <span class="material-symbols-outlined text-[17px]">save</span>
              <span>Simpan Semua Nilai LKPD</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th class="py-3 px-3">No</th>
                <th class="py-3 px-3">Mahasiswa (NIM)</th>
                <th class="py-3 px-3 text-center">Status Berkas</th>
                <th class="py-3 px-3 text-center w-28">Nilai LKPD (0-100)</th>
                <th class="py-3 px-3">Catatan / Umpan Balik Tutor</th>
                <th class="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
              ${students.map((s, idx) => {
                const subKey = `${s.nim}_${course.id}_s${tut.sesi}`;
                const hasSub = state.submissions && state.submissions[subKey];
                const g = state.grades && state.grades[s.nim];
                const lkpdScore = (g && g.lkpd && g.lkpd[tut.sesi] !== undefined) 
                  ? g.lkpd[tut.sesi] 
                  : ((g && g.partisipasi !== undefined && g.partisipasi !== '') ? g.partisipasi : '');
                const noteVal = (g && g.catatan) || '';

                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
                    <td class="py-3 px-3">
                      <span class="font-extrabold text-slate-900 block">${s.nama}</span>
                      <span class="font-mono text-[11px] text-slate-400">${s.nim}</span>
                    </td>
                    <td class="py-3 px-3 text-center">
                      ${hasSub ? `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Sudah Unggah
                        </span>
                      ` : `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          Belum Ada Berkas
                        </span>
                      `}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <input type="number" min="0" max="100" id="input-grade-lkpd-${s.nim}" 
                             value="${lkpdScore}" placeholder="0-100"
                             class="w-20 px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#004990] text-center font-extrabold text-xs bg-white text-slate-900 shadow-2xs" />
                    </td>
                    <td class="py-3 px-3">
                      <input type="text" id="input-note-lkpd-${s.nim}" 
                             value="${noteVal}" placeholder="Catatan evaluasi penguasaan materi..." 
                             class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#004990] text-xs bg-white text-slate-800" />
                    </td>
                    <td class="py-3 px-3 text-right">
                      <button onclick="saveInlineGrade('${s.nim}', 'lkpd', ${tut.sesi})" 
                              class="px-3 py-1.5 rounded-lg bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-[11px] shadow-2xs transition">
                        Simpan
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 7 (TUTOR): ASESMEN & PENILAIAN TUGAS TUTORIAL / KUIS
// ----------------------------------------------------------------------------
function renderTutorAsesmenMenu(tut, course, students) {
  const isTTM = (tut.sesi === 3 || tut.sesi === 5 || tut.sesi === 7);
  const ttmIndex = tut.sesi === 3 ? 1 : (tut.sesi === 5 ? 2 : 3);
  const ttmField = `tugas${ttmIndex}`;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 7 • Evaluasi & Pengukuran Capaian</span>
          <h2 class="text-xl font-extrabold text-slate-900">Asesmen Pembelajaran Tutorial Sesi ${tut.sesi}</h2>
        </div>
      </div>

      ${isTTM ? `
        <!-- TUGAS TUTORIAL WAJIB CALLOUT -->
        <div class="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[24px] text-amber-700">stars</span>
            <span class="text-sm font-extrabold text-amber-950 uppercase tracking-wide">${tut.tugas_khusus} (BOBOT RESMI 70% UT)</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            Pada pertemuan Sesi ${tut.sesi}, terdapat <strong>Tugas Tutorial Wajib ${ttmIndex} (TTM ${ttmIndex})</strong>. Nilai yang Anda input di tabel bawah akan langsung otomatis tersimpan ke kolom <strong>Tugas ${ttmIndex}</strong> pada Rekapitulasi Nilai Akhir mata kuliah ${course.kode}.
          </p>
          <div class="pt-1 flex flex-wrap gap-2">
            <button onclick="showToast('Lembar Soal Tugas Tutorial ${ttmIndex} diunduh.', 'success')" class="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-2xs">
              <span class="material-symbols-outlined text-[17px]">download</span>
              <span>Unduh Lembar Soal Tugas ${ttmIndex}</span>
            </button>
            <button onclick="showToast('Rubrik penilaian tugas 100 poin dibuka.', 'info')" class="h-9 px-4 rounded-xl bg-white text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition">
              <span class="material-symbols-outlined text-[17px]">rubric</span>
              <span>Lihat Rubrik Skor 100</span>
            </button>
          </div>
        </div>

        <!-- TUGAS TUTORIAL GRADING PANEL -->
        <div class="rounded-2xl border border-amber-300 bg-white shadow-2xs overflow-hidden">
          <div class="p-4 bg-amber-50/80 border-b border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <h3 class="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-700 text-[20px]">fact_check</span>
                <span>Panel Penilaian Tugas Tutorial Wajib ${ttmIndex} (Sesi ${tut.sesi})</span>
              </h3>
              <p class="text-xs text-slate-600">
                Data nilai langsung mengkalkulasi Nilai Akhir (Bobot: 70% Avg Tugas + 30% Partisipasi).
              </p>
            </div>

            <button onclick="saveAllInlineGrades('${course.id}', 'tugas', ${tut.sesi})" class="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition">
              <span class="material-symbols-outlined text-[17px]">save</span>
              <span>Simpan Semua Nilai Tugas ${ttmIndex}</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-amber-50/50 border-b border-amber-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th class="py-3 px-3">No</th>
                  <th class="py-3 px-3">Mahasiswa (NIM)</th>
                  <th class="py-3 px-3 text-center w-28">Nilai Tugas ${ttmIndex} (0-100)</th>
                  <th class="py-3 px-3">Catatan Rubrik & Evaluasi</th>
                  <th class="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
                ${students.map((s, idx) => {
                  const g = state.grades && state.grades[s.nim];
                  const currentScore = (g && g[ttmField] !== undefined && g[ttmField] !== '') ? g[ttmField] : '';
                  const noteVal = (g && g.catatan) || '';

                  return `
                    <tr class="hover:bg-amber-50/30 transition">
                      <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
                      <td class="py-3 px-3">
                        <span class="font-extrabold text-slate-900 block">${s.nama}</span>
                        <span class="font-mono text-[11px] text-slate-400">${s.nim}</span>
                      </td>
                      <td class="py-3 px-3 text-center">
                        <input type="number" min="0" max="100" id="input-grade-tugas-${s.nim}" 
                               value="${currentScore}" placeholder="0-100"
                               class="w-20 px-2 py-1.5 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 text-center font-black text-xs bg-amber-50/40 text-slate-900 shadow-2xs" />
                      </td>
                      <td class="py-3 px-3">
                        <input type="text" id="input-note-tugas-${s.nim}" 
                               value="${noteVal}" placeholder="Catatan rubrik penilaian..." 
                               class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#004990] text-xs bg-white text-slate-800" />
                      </td>
                      <td class="py-3 px-3 text-right">
                        <button onclick="saveInlineGrade('${s.nim}', 'tugas', ${tut.sesi})" 
                                class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] shadow-2xs transition">
                          Simpan
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : `
        <!-- FORMATIVE QUIZ PREVIEW & ASSESSMENT -->
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#004990] text-[20px]">quiz</span>
              <span>Preview Soal Kuis Formatif Sesi ${tut.sesi} (${tut.quiz.length} Soal)</span>
            </h3>
            <p class="text-xs text-slate-600">
              Kuis formatif ini diselesaikan oleh mahasiswa untuk menguji pemahaman konsep inisiasi.
            </p>
          </div>

          <!-- KUIS FORMATIF GRADING PANEL -->
          <div class="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">Evaluasi Pemahaman Kuis Mahasiswa (Sesi ${tut.sesi})</h3>
                <p class="text-xs text-slate-500">Pantau dan berikan nilai latihan mahasiswa.</p>
              </div>
              <button onclick="saveAllInlineGrades('${course.id}', 'tugas', ${tut.sesi})" class="h-9 px-4 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center gap-1.5 transition">
                <span class="material-symbols-outlined text-[17px]">save</span>
                <span>Simpan Nilai Latihan</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th class="py-3 px-3">No</th>
                    <th class="py-3 px-3">Mahasiswa (NIM)</th>
                    <th class="py-3 px-3 text-center w-28">Nilai Latihan (0-100)</th>
                    <th class="py-3 px-3">Catatan Tutor</th>
                    <th class="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
                  ${students.map((s, idx) => {
                    const g = state.grades && state.grades[s.nim];
                    const kuisScore = (g && g.kuis && g.kuis[tut.sesi] !== undefined) ? g.kuis[tut.sesi] : '';
                    const noteVal = (g && g.catatan) || '';

                    return `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
                        <td class="py-3 px-3">
                          <span class="font-extrabold text-slate-900 block">${s.nama}</span>
                          <span class="font-mono text-[11px] text-slate-400">${s.nim}</span>
                        </td>
                        <td class="py-3 px-3 text-center">
                          <input type="number" min="0" max="100" id="input-grade-tugas-${s.nim}" 
                                 value="${kuisScore}" placeholder="0-100"
                                 class="w-20 px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#004990] text-center font-bold text-xs bg-white text-slate-900" />
                        </td>
                        <td class="py-3 px-3">
                          <input type="text" id="input-note-tugas-${s.nim}" 
                                 value="${noteVal}" placeholder="Catatan pemahaman..." 
                                 class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                        </td>
                        <td class="py-3 px-3 text-right">
                          <button onclick="saveInlineGrade('${s.nim}', 'tugas', ${tut.sesi})" 
                                  class="px-3 py-1.5 rounded-lg bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-[11px]">
                            Simpan
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

// ----------------------------------------------------------------------------
// MENU 8 (TUTOR): REFLEKSI DENGAN PANEL PENILAIAN PARTISIPASI (30%)
// ----------------------------------------------------------------------------
function renderTutorRefleksiMenu(tut, course, students) {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span class="text-xs font-bold text-[#004990] uppercase tracking-wide">Menu 8 • Refleksi Diri & Partisipasi</span>
          <h2 class="text-xl font-extrabold text-slate-900">Refleksi Belajar & Partisipasi Sesi ${tut.sesi}</h2>
        </div>
      </div>

      <!-- Overview Box -->
      <div class="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
        <h3 class="text-sm font-extrabold text-amber-950 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600 text-[20px]">psychology_alt</span>
          <span>Komponen Penilaian Partisipasi Mahasiswa (Bobot Resmi 30% UT)</span>
        </h3>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Sesuai ketentuan Universitas Terbuka, nilai partisipasi berbobot <strong>30%</strong> dari total nilai akhir tutorial, yang dinilai dari keaktifan diskusi, pengumpulan lembar refleksi 3-2-1, dan kehadiran mahasiswa. Nilai yang Anda input di panel ini akan langsung masuk ke komponen Partisipasi Rekap Nilai UT.
        </p>
      </div>

      <!-- TUTOR GRADING PANEL FOR PARTICIPATION & REFLECTION -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#004990] text-[20px]">award_star</span>
              <span>Panel Penilaian Partisipasi & Refleksi Kelas ${course.id}</span>
            </h3>
            <p class="text-xs text-slate-500">
              Input nilai partisipasi (skala 0 - 100) untuk seluruh mahasiswa.
            </p>
          </div>

          <button onclick="saveAllInlineGrades('${course.id}', 'partisipasi', ${tut.sesi})" class="h-9 px-4 rounded-xl bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition">
            <span class="material-symbols-outlined text-[17px]">save</span>
            <span>Simpan Semua Nilai Partisipasi</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th class="py-3 px-3">No</th>
                <th class="py-3 px-3">Mahasiswa (NIM)</th>
                <th class="py-3 px-3 text-center">Status Refleksi</th>
                <th class="py-3 px-3 text-center w-28">Nilai Partisipasi (30%)</th>
                <th class="py-3 px-3">Catatan Pembinaan Tutor</th>
                <th class="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
              ${students.map((s, idx) => {
                const refKey = `${course.id}_sesi${tut.sesi}`;
                const hasRef = state.reflections && state.reflections[refKey];
                const g = state.grades && state.grades[s.nim];
                const partScore = (g && g.partisipasi !== undefined && g.partisipasi !== '') ? g.partisipasi : '';
                const noteVal = (g && g.catatan) || '';

                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
                    <td class="py-3 px-3">
                      <span class="font-extrabold text-slate-900 block">${s.nama}</span>
                      <span class="font-mono text-[11px] text-slate-400">${s.nim}</span>
                    </td>
                    <td class="py-3 px-3 text-center">
                      ${hasRef ? `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Sudah Mengisi
                        </span>
                      ` : `
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          Belum Mengisi
                        </span>
                      `}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <input type="number" min="0" max="100" id="input-grade-part-${s.nim}" 
                             value="${partScore}" placeholder="0-100"
                             class="w-20 px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#004990] text-center font-extrabold text-xs bg-white text-slate-900 shadow-2xs" />
                    </td>
                    <td class="py-3 px-3">
                      <input type="text" id="input-note-part-${s.nim}" 
                             value="${noteVal}" placeholder="Catatan pembinaan / apresiasi..." 
                             class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#004990] text-xs bg-white text-slate-800" />
                    </td>
                    <td class="py-3 px-3 text-right">
                      <button onclick="saveInlineGrade('${s.nim}', 'partisipasi', ${tut.sesi})" 
                              class="px-3 py-1.5 rounded-lg bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-[11px] shadow-2xs transition">
                        Simpan
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// TAB 9: REKAPITULASI NILAI AKHIR (GRADEBOOK LENGKAP UT)
// ----------------------------------------------------------------------------
function renderTutorGradebookTab(classId, course, students) {
  return `
    <div class="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-extrabold text-slate-900">
            Lembar Penilaian & Rekapitulasi: Kelas ${classId}
          </h2>
          <p class="text-xs text-slate-500 font-medium">
            ${course.kode} • ${course.nama} (Bobot: 70% Rata-rata Tugas + 30% Partisipasi)
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="relative flex-1 sm:w-60">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <span class="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input id="student-filter" onkeyup="filterStudentsTable()" type="text" placeholder="Cari nama atau NIM..." class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#004990]" />
          </div>

          <button onclick="exportGradebookCSV('${classId}')" class="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition">
            <span class="material-symbols-outlined text-[17px]">download</span>
            <span>Unduh CSV</span>
          </button>

          <button onclick="window.print()" class="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition">
            <span class="material-symbols-outlined text-[17px]">print</span>
            <span>Cetak</span>
          </button>

          <button onclick="resetClassGrades('${classId}')" title="Kosongkan seluruh nilai mahasiswa di kelas ini" class="h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition">
            <span class="material-symbols-outlined text-[17px]">delete_sweep</span>
            <span>Kosongkan Nilai</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs" id="students-table">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <th class="py-3 px-3">No</th>
              <th class="py-3 px-3">Mahasiswa (NIM)</th>
              <th class="py-3 px-3 text-center">Tugas 1 (S3)</th>
              <th class="py-3 px-3 text-center">Tugas 2 (S5)</th>
              <th class="py-3 px-3 text-center">Tugas 3 (S7)</th>
              <th class="py-3 px-3 text-center">Partisipasi (30%)</th>
              <th class="py-3 px-3 text-center">Nilai Akhir</th>
              <th class="py-3 px-3 text-center">Predikat</th>
              <th class="py-3 px-3">Catatan Tutor</th>
              <th class="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            ${students.map((s, idx) => {
              const g = (state.grades && state.grades[s.nim]) || null;
              const hasT1 = g && g.tugas1 !== '' && g.tugas1 !== undefined;
              const hasT2 = g && g.tugas2 !== '' && g.tugas2 !== undefined;
              const hasT3 = g && g.tugas3 !== '' && g.tugas3 !== undefined;
              const hasPart = g && g.partisipasi !== '' && g.partisipasi !== undefined;

              const t1 = hasT1 ? g.tugas1 : '-';
              const t2 = hasT2 ? g.tugas2 : '-';
              const t3 = hasT3 ? g.tugas3 : '-';
              const part = hasPart ? g.partisipasi : '-';

              let finalScore = '-';
              let gradeBadge = 'bg-slate-100 text-slate-400';
              let gradeLetter = '-';

              if (hasT1 || hasT2 || hasT3 || hasPart) {
                const numT1 = parseFloat(t1) || 0;
                const numT2 = parseFloat(t2) || 0;
                const numT3 = parseFloat(t3) || 0;
                const numPart = parseFloat(part) || 0;
                const avgTugas = (numT1 + numT2 + numT3) / 3;
                const scoreNum = (0.7 * avgTugas) + (0.3 * numPart);
                finalScore = scoreNum.toFixed(1);
                if (scoreNum >= 85) { gradeBadge = 'bg-emerald-100 text-emerald-800'; gradeLetter = 'A'; }
                else if (scoreNum >= 75) { gradeBadge = 'bg-blue-100 text-blue-800'; gradeLetter = 'B'; }
                else if (scoreNum >= 65) { gradeBadge = 'bg-amber-100 text-amber-800'; gradeLetter = 'C'; }
                else { gradeBadge = 'bg-rose-100 text-rose-800'; gradeLetter = 'D'; }
              }

              return `
                <tr class="hover:bg-blue-50/40 transition">
                  <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
                  <td class="py-3 px-3">
                    <span class="font-extrabold text-slate-900 block">${s.nama}</span>
                    <span class="font-mono text-[11px] text-slate-400">${s.nim}</span>
                  </td>
                  <td class="py-3 px-3 text-center font-bold ${hasT1 ? 'text-slate-800' : 'text-slate-400'}">${t1}</td>
                  <td class="py-3 px-3 text-center font-bold ${hasT2 ? 'text-slate-800' : 'text-slate-400'}">${t2}</td>
                  <td class="py-3 px-3 text-center font-bold ${hasT3 ? 'text-slate-800' : 'text-slate-400'}">${t3}</td>
                  <td class="py-3 px-3 text-center font-bold ${hasPart ? 'text-slate-800' : 'text-slate-400'}">${part}</td>
                  <td class="py-3 px-3 text-center font-extrabold ${finalScore !== '-' ? 'text-slate-900 text-sm' : 'text-slate-400'}">${finalScore}</td>
                  <td class="py-3 px-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${gradeBadge}">${gradeLetter}</span>
                  </td>
                  <td class="py-3 px-3 text-slate-500 text-[11px] max-w-[180px] truncate" title="${(g && g.catatan) || ''}">
                    ${(g && g.catatan) ? g.catatan : '<span class="text-slate-300 italic">Belum ada catatan</span>'}
                  </td>
                  <td class="py-3 px-3 text-right">
                    <button onclick="openGradeModal('${s.nim}')" class="px-3 py-1.5 rounded-lg bg-[#003367] hover:bg-[#004990] text-white font-extrabold text-[11px] shadow-2xs transition flex items-center gap-1 ml-auto">
                      <span class="material-symbols-outlined text-[14px]">edit</span>
                      <span>Beri Nilai</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterStudentsTable() {
  const query = document.getElementById('student-filter')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('#students-table tbody tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function attachTutorEvents() {
  // Tutor management event hooks
}
