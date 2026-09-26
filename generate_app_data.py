# -*- coding: utf-8 -*-
"""
Generator script to build app_data.js with complete students, courses,
and 8 tutorials per class, with all 8 menus:
1. Pembagian Kelompok (with real students assigned)
2. RAT/SAT
3. Pertanyaan Pemantik
4. Materi
5. Video Pembelajaran
6. LKPD
7. Asesmen (Quiz & TTM)
8. Refleksi
"""

import json
import math

with open('students_data.json', encoding='utf-8') as f:
    students = json.load(f)

# Split students into groups per class
students_by_class = {'5A': [], '6A': [], '7C1': [], '7D1': []}
for s in students:
    if s['kelas'] in students_by_class:
        students_by_class[s['kelas']].append(s)

def divide_groups(st_list, num_groups=4):
    groups = []
    chunk_size = math.ceil(len(st_list) / num_groups)
    for i in range(num_groups):
        sub = st_list[i * chunk_size : (i + 1) * chunk_size]
        if sub:
            groups.append({
                'nomor': i + 1,
                'nama_kelompok': f'Kelompok {i + 1}',
                'ketua': sub[0]['nama'],
                'anggota': sub
            })
    return groups

groups_by_class = {
    '5A': divide_groups(students_by_class['5A'], 5),
    '6A': divide_groups(students_by_class['6A'], 4),
    '7C1': divide_groups(students_by_class['7C1'], 3),
    '7D1': divide_groups(students_by_class['7D1'], 3),
}

# Courses definition
courses_info = {
    '5A': {
        'id': '5A',
        'kode': 'SPGK4410',
        'nama': 'Strategi Pembelajaran Kontemporer di SD',
        'sks': 4,
        'semester': 'Semester 5',
        'prodi': 'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
        'tutor': 'Bagus Panca Wiratama, S.Pd., M.Pd.',
        'deskripsi': 'Mata kuliah ini membekali mahasiswa dengan wawasan dan keterampilan merancang, mengimplementasikan, dan mengevaluasi strategi pembelajaran abad 21 di SD yang berpusat pada peserta didik, berbasis diferensiasi, dan mengintegrasikan TPACK.',
        'color': '#004990',
        'badge_color': 'bg-blue-600',
        'icon': 'psychology'
    },
    '6A': {
        'id': '6A',
        'kode': 'SPDA4401',
        'nama': 'Penanganan Anak Berkebutuhan Khusus',
        'sks': 3,
        'semester': 'Semester 6',
        'prodi': 'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
        'tutor': 'Bagus Panca Wiratama, S.Pd., M.Pd.',
        'deskripsi': 'Mata kuliah ini membahas landasan filosofis, yuridis, klasifikasi, identifikasi, asesmen, serta strategi adaptasi kurikulum dan pembelajaran inklusif bagi peserta didik berkebutuhan khusus di sekolah dasar.',
        'color': '#003367',
        'badge_color': 'bg-indigo-600',
        'icon': 'diversity_1'
    },
    '7C1': {
        'id': '7C1',
        'kode': 'SPGK4408',
        'nama': 'Pemantapan Kemampuan Mengajar',
        'sks': 4,
        'semester': 'Semester 7 (Kelas C1)',
        'prodi': 'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
        'tutor': 'Bagus Panca Wiratama, S.Pd., M.Pd.',
        'deskripsi': 'Mata kuliah praktik mandiri dan terbimbing untuk melatih, memantapkan, dan menilai kemampuan mahasiswa dalam merancang, melaksanakan, dan merefleksi proses pembelajaran nyata di sekolah dasar sesuai standar kompetensi guru profesional.',
        'color': '#004990',
        'badge_color': 'bg-sky-600',
        'icon': 'co_present'
    },
    '7D1': {
        'id': '7D1',
        'kode': 'SPGK4408',
        'nama': 'Pemantapan Kemampuan Mengajar',
        'sks': 4,
        'semester': 'Semester 7 (Kelas D1)',
        'prodi': 'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
        'tutor': 'Bagus Panca Wiratama, S.Pd., M.Pd.',
        'deskripsi': 'Mata kuliah praktik mandiri dan terbimbing untuk melatih, memantapkan, dan menilai kemampuan mahasiswa dalam merancang, melaksanakan, dan merefleksi proses pembelajaran nyata di sekolah dasar sesuai standar kompetensi guru profesional.',
        'color': '#003367',
        'badge_color': 'bg-emerald-600',
        'icon': 'history_edu'
    }
}

# 8 Tutorials curricula
curricula = {
    '5A': [
        {
            'sesi': 1,
            'judul': 'Hakikat Pembelajaran Abad 21 & Karakteristik Peserta Didik SD Masa Kini',
            'tanggal': 'Sabtu, 4 Oktober 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu menganalisis karakteristik pembelajaran abad 21 (4C: Critical Thinking, Creativity, Collaboration, Communication) serta menghubungkannya dengan profil peserta didik SD masa kini.',
            'topik_kelompok': 'Analisis Kebutuhan Belajar Siswa Generasi Alpha di Sekolah Dasar OKU Timur',
            'pemantik': [
                'Bagaimana karakteristik belajar generasi Alpha di SD berbeda secara mendasar dibandingkan generasi sebelumnya?',
                'Strategi konkrit apa yang paling efektif untuk menumbuhkan keterampilan 4C sejak fase kelas rendah (Kelas 1-3)?'
            ],
            'materi_summary': 'Modul 1 membahas pergeseran paradigma pembelajaran dari teacher-centered ke student-centered. Guru bukan lagi satu-satunya sumber belajar melainkan fasilitator, kurator konten, dan desainer pengalaman belajar. Pembelajaran abad 21 mengedepankan pemecahan masalah autentik, interaksi kolaboratif, dan penguatan literasi digital sejak dini.',
            'modul_ut': 'BMP SPGK4410 Modul 1 (KB 1 & KB 2)',
            'video_title': 'Paradigma Pembelajaran Abad 21 di Sekolah Dasar (UT TV Dikdas)',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Video pembelajaran dari UT TV Dikdas mengulas implementasi keterampilan 4C dan studi kasus kelas interaktif di sekolah dasar.',
            'lkpd_title': 'LKPD 1: Pemetaan Kebutuhan Belajar dan Desain Aktivitas 4C Siswa SD',
            'lkpd_desc': 'Diskusikan bersama kelompok dan susun matriks pemetaan kebutuhan belajar siswa SD di lingkungan kerja Anda. Identifikasi tantangan utama dan solusi pedagogisnya.',
            'tugas_khusus': None,
            'quiz': [
                {
                    'q': 'Keterampilan abad 21 yang menekankan kemampuan memecahkan masalah kontekstual secara logis disebut...',
                    'opts': ['Critical Thinking (Berpikir Kritis)', 'Rote Learning (Menghafal)', 'Passive Listening', 'Drill and Practice'],
                    'ans': 0
                },
                {
                    'q': 'Dalam paradigma pembelajaran kontemporer, peran guru SD yang paling dominan adalah sebagai...',
                    'opts': ['Satu-satunya sumber informasi mutlak', 'Fasilitator dan desainer pengalaman belajar', 'Pengawas ujian semata', 'Penyampai materi searah'],
                    'ans': 1
                },
                {
                    'q': 'Generasi peserta didik yang lahir mulai tahun 2010 dan terbiasa dengan sentuhan layar sentuh digital sejak bayi dikenal dengan sebutan...',
                    'opts': ['Generasi X', 'Generasi Milenial', 'Generasi Alpha', 'Generasi Baby Boomer'],
                    'ans': 2
                }
            ]
        },
        {
            'sesi': 2,
            'judul': 'Teori Belajar Kognitif, Konstruktivisme, dan Humanistik dalam Konteks SD',
            'tanggal': 'Sabtu, 11 Oktober 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu membedakan implikasi teori belajar Piaget, Vygotsky, Bruner, dan Carl Rogers dalam menyusun rancangan pembelajaran bermakna.',
            'topik_kelompok': 'Penerapan Teori Scaffolding Vygotsky dalam Pembelajaran Tematik SD',
            'pemantik': [
                'Mengapa tahap operasional konkret Piaget sangat penting dijadikan acuan dalam pemilihan media ajar di SD?',
                'Bagaimana konsep Zone of Proximal Development (ZPD) dapat mencegah kecemasan belajar matematika pada siswa?'
            ],
            'materi_summary': 'Modul 2 mengkaji landasan psikologis belajar. Teori kognitif Piaget menekankan tahapan perkembangan mental. Vygotsky menekankan peran interaksi sosial dan scaffolding. Konstruktivisme menempatkan siswa sebagai pembangun pengetahuannya sendiri melalui eksplorasi aktif.',
            'modul_ut': 'BMP SPGK4410 Modul 2 (KB 1, 2 & 3)',
            'video_title': 'Teori Belajar Konstruktivistik & Implikasinya di Kelas SD',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Ulasan komprehensif teori perkembangan Piaget dan Vygotsky dalam mendesain scaffolding di kelas inklusif SD.',
            'lkpd_title': 'LKPD 2: Desain Aktivitas Scaffolding Berbasis ZPD Vygotsky',
            'lkpd_desc': 'Rancanglah skenario pembelajaran 1 topik mata pelajaran SD yang menerapkan tahapan bimbingan bertahap (scaffolding).',
            'tugas_khusus': None,
            'quiz': [
                {
                    'q': 'Konsep jarak antara kemampuan mandiri anak dengan kemampuan potensial dengan bantuan orang dewasa disebut...',
                    'opts': ['Asimilasi', 'Zone of Proximal Development (ZPD)', 'Operasional Formal', 'Egosentrisme'],
                    'ans': 1
                },
                {
                    'q': 'Menurut Jean Piaget, siswa usia 7-11 tahun di SD berada pada tahapan perkembangan...',
                    'opts': ['Sensori-motorik', 'Pra-operasional', 'Operasional Konkret', 'Operasional Formal'],
                    'ans': 2
                },
                {
                    'q': 'Bantuan belajar sementara yang diberikan guru dan secara bertahap dikurangi saat anak mulai mandiri disebut...',
                    'opts': ['Scaffolding', 'Drilling', 'Memorizing', 'Conditioning'],
                    'ans': 0
                }
            ]
        },
        {
            'sesi': 3,
            'judul': 'Model Pembelajaran Problem-Based Learning (PBL) & Project-Based Learning (PjBL) di SD',
            'tanggal': 'Sabtu, 18 Oktober 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu menyusun modul ajar dengan sintaks PBL dan PjBL serta mengunggah penyelesaian Tugas Tutorial 1.',
            'topik_kelompok': 'Perancangan Proyek Penguatan Karakter dan Lingkungan Hidup Berbasis PjBL di OKU Timur',
            'pemantik': [
                'Apa perbedaan mendasar antara hasil akhir (outcome) dari sintaks PBL versus PjBL di sekolah dasar?',
                'Bagaimana cara mengelola alokasi waktu proyek PjBL agar tidak membebani jam mata pelajaran lain di SD?'
            ],
            'materi_summary': 'Modul 3 membahas sintaks PBL (5 langkah: orientasi masalah, organisasi belajar, penyelidikan mandiri/kelompok, pengembangan karya, analisis evaluasi) dan sintaks PjBL (6 langkah: penentuan pertanyaan mendasar, perancangan proyek, penyusunan jadwal, monitor kemajuan, uji hasil, evaluasi pengalaman).',
            'modul_ut': 'BMP SPGK4410 Modul 3 (KB 1 & KB 2)',
            'video_title': 'Praktik Baik Penerapan PBL & PjBL di Sekolah Dasar Indonesia',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Dokumentasi guru memfasilitasi investigasi siswa SD dalam memecahkan masalah pencemaran lingkungan sekitar sekolah.',
            'lkpd_title': 'LKPD 3: Rancang Bangun Sintaks PBL untuk Mata Pelajaran IPAS di SD',
            'lkpd_desc': 'Susun lembar kerja berbasis masalah nyata lokal (misal: pertanian/irigasi di OKU Timur) dengan sintaks PBL lengkap.',
            'tugas_khusus': 'TUGAS TUTORIAL 1 (Wajib Diunggah: Batas Akhir Sesi 3)',
            'quiz': [
                {
                    'q': 'Langkah awal dari sintaks model Problem-Based Learning (PBL) adalah...',
                    'opts': ['Menguji hasil karya', 'Orientasi peserta didik pada masalah autentik', 'Menyusun jadwal kegiatan', 'Membagikan lembar evaluasi akhir'],
                    'ans': 1
                },
                {
                    'q': 'Karakteristik utama yang membedakan Project-Based Learning (PjBL) dari PBL adalah adanya...',
                    'opts': ['Hafalan rumus', 'Produk/karya nyata sebagai luaran proyek', 'Ujian pilihan ganda', 'Ceramah guru selama 60 menit'],
                    'ans': 1
                },
                {
                    'q': 'Berapakah bobot evaluasi wajib Tugas Tutorial (TTM 1) dalam penilaian berkala UT?',
                    'opts': ['5%', '10%', 'Tugas Tutorial Wajib bernilai substansial bagi nilai akhir tutorial', 'Tidak dinilai'],
                    'ans': 2
                }
            ]
        },
        {
            'sesi': 4,
            'judul': 'Pembelajaran Berdiferensiasi dan Integrasi Kerangka TPACK di Sekolah Dasar',
            'tanggal': 'Sabtu, 25 Oktober 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu membedakan diferensiasi konten, proses, dan produk serta memadukan unsur Technological Pedagogical Content Knowledge (TPACK).',
            'topik_kelompok': 'Strategi Diferensiasi Produk Berdasarkan Gaya Belajar Visual, Auditori, dan Kinestetik',
            'pemantik': [
                'Apakah pembelajaran berdiferensiasi berarti guru harus membuat 30 rencana pembelajaran berbeda untuk 30 siswa?',
                'Bagaimana mengintegrasikan teknologi sederhana tanpa harus menuntut fasilitas mewah di sekolah pedesaan?'
            ],
            'materi_summary': 'Modul 4 menjelaskan tiga pilar diferensiasi: Konten (apa yang dipelajari), Proses (bagaimana siswa memahami), dan Produk (bukti apa yang dihasilkan). Kerangka TPACK menuntut guru menguasai persilangan antara materi keilmuan, metode pedagogi, dan alat teknologi digital.',
            'modul_ut': 'BMP SPGK4410 Modul 4 (KB 1 & KB 2)',
            'video_title': 'Menerapkan Diferensiasi Konten, Proses, & Produk di Kelas SD',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Tutorial strategi praktis asesmen diagnostik non-kognitif dan penataan sudut belajar berdiferensiasi.',
            'lkpd_title': 'LKPD 4: Matriks Diferensiasi dan Integrasi TPACK Tematik SD',
            'lkpd_desc': 'Pilihlah satu Capaian Pembelajaran (CP) dan petakan skenario diferensiasi konten, proses, serta produk yang akan dibuat.',
            'tugas_khusus': None,
            'quiz': [
                {
                    'q': 'Tiga elemen utama dalam diferensiasi pembelajaran menurut Carol Ann Tomlinson adalah...',
                    'opts': ['Biaya, Fasilitas, dan Waktu', 'Konten, Proses, dan Produk', 'NIM, Absensi, dan Tugas', 'Kurikulum, Buku, dan Meja'],
                    'ans': 1
                },
                {
                    'q': 'Integrasi pengetahuan pedagogi, materi bidang ilmu, dan pemanfaatan teknologi dikenal dengan akronim...',
                    'opts': ['STEAM', 'TPACK', 'HOTS', 'PBL'],
                    'ans': 1
                },
                {
                    'q': 'Memberikan opsi kepada siswa untuk mengumpulkan tugas berupa rekaman suara, poster gambar, atau esai tertulis adalah contoh diferensiasi...',
                    'opts': ['Diferensiasi Konten', 'Diferensiasi Produk', 'Diferensiasi Lingkungan Fisik', 'Diferensiasi Waktu Belajar'],
                    'ans': 1
                }
            ]
        },
        {
            'sesi': 5,
            'judul': 'Media Pembelajaran Digital, AI Edukatif, dan Gamifikasi Kelas SD',
            'tanggal': 'Sabtu, 1 November 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa terampil merancang media ajar digital interaktif, kuis tergamifikasi (Quizizz/Kahoot), dan memanfaatkan AI etis untuk guru SD serta mengunggah Tugas Tutorial 2.',
            'topik_kelompok': 'Pengembangan Media Gamifikasi Digital Berbasis Kearifan Lokal Sumatera Selatan',
            'pemantik': [
                'Bagaimana batas etis penggunaan AI bagi guru SD dalam menyusun modul ajar dan lembar asesmen?',
                'Mengapa elemen game (points, badges, leaderboards) mampu meningkatkan keterlibatan siswa SD yang pasif?'
            ],
            'materi_summary': 'Modul 5 memandu pemanfaatan media multimedia digital, Canva for Education, platform kuis gamifikasi, dan pemanfaatan prompt AI untuk mempercepat pembuatan bahan ajar adaptif tanpa mengurangi orisinalitas guru.',
            'modul_ut': 'BMP SPGK4410 Modul 5 (KB 1, 2 & 3)',
            'video_title': 'Pemanfaatan Tools Digital & Gamifikasi untuk Guru Sekolah Dasar',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Panduan praktis pembuatan kuis edukatif gamifikasi dan infografis menarik untuk materi tematik SD.',
            'lkpd_title': 'LKPD 5: Prototipe Media Ajar Digital dan Rubrik Evaluasi Media',
            'lkpd_desc': 'Buatlah rancangan storyboard media digital interaktif atau permainan edukatif untuk kelas Anda.',
            'tugas_khusus': 'TUGAS TUTORIAL 2 (Wajib Diunggah: Batas Akhir Sesi 5)',
            'quiz': [
                {
                    'q': 'Penerapan elemen permainan mekanik seperti poin, tantangan, dan lencana dalam konteks non-game disebut...',
                    'opts': ['Gamifikasi (Gamification)', 'Drill & Practice', 'Rote Memorization', 'Lecturing'],
                    'ans': 0
                },
                {
                    'q': 'Pemanfaatan Artificial Intelligence (AI) yang paling tepat bagi guru SD adalah sebagai...',
                    'opts': ['Pengganti kehadiran guru di kelas', 'Asisten cerdas untuk efisiensi perancangan ide bahan ajar', 'Penentu kelulusan otomatis tanpa koreksi', 'Pemberi nilai tanpa telaah manusia'],
                    'ans': 1
                },
                {
                    'q': 'Platform populer yang sering digunakan untuk kuis gamifikasi interaktif di kelas adalah...',
                    'opts': ['Quizizz / Kahoot', 'MS Excel', 'Notepad', 'Paint'],
                    'ans': 0
                }
            ]
        },
        {
            'sesi': 6,
            'judul': 'Manajemen Kelas Inovatif dan Strategi Pembelajaran Kolaboratif-Kooperatif',
            'tanggal': 'Sabtu, 8 November 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu menerapkan struktur pembelajaran kooperatif (Jigsaw, STAD, Think-Pair-Share) serta teknik disiplin positif di kelas SD.',
            'topik_kelompok': 'Implementasi Teknik Jigsaw dalam Meningkatkan Tanggung Jawab Belajar Kelompok di SD',
            'pemantik': [
                'Apa perbedaan mendasar antara kerja kelompok biasa (group work) dengan pembelajaran kooperatif terstruktur (cooperative learning)?',
                'Bagaimana strategi menangani siswa yang mendominasi kelompok atau sebaliknya yang pasif (free rider)?'
            ],
            'materi_summary': 'Modul 6 menekankan lima unsur esensial pembelajaran kooperatif: saling ketergantungan positif, akuntabilitas individu, interaksi tatap muka promosional, keterampilan sosial, dan pemrosesan kelompok. Disiplin positif dibangun melalui kesepakatan kelas bersama, bukan hukuman fisik/verbal.',
            'modul_ut': 'BMP SPGK4410 Modul 6 (KB 1 & KB 2)',
            'video_title': 'Manajemen Kelas Ramah Anak & Model Pembelajaran Kooperatif',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Contoh penerapan teknik Think-Pair-Share dan pembentukan kesepakatan kelas ramah anak di SD.',
            'lkpd_title': 'LKPD 6: Desain Skenario Pembelajaran Kooperatif Tipe Jigsaw',
            'lkpd_desc': 'Rancanglah pembagian kelompok ahli (expert group) dan kelompok asal (home group) untuk satu materi tematik.',
            'tugas_khusus': None,
            'quiz': [
                {
                    'q': 'Unsur dalam pembelajaran kooperatif di mana keberhasilan satu individu bergantung pada keberhasilan seluruh anggota kelompok disebut...',
                    'opts': ['Kompetisi individu', 'Saling ketergantungan positif (Positive Interdependence)', 'Dominasi ketua kelompok', 'Tanggung jawab acak'],
                    'ans': 1
                },
                {
                    'q': 'Metode kooperatif di mana anggota kelompok menjadi ahli pada materi tertentu lalu mengajarkannya ke kelompok asal disebut...',
                    'opts': ['Metode Ceramah', 'Model Jigsaw', 'Metode Demonstrasi', 'Metode Resitasi'],
                    'ans': 1
                },
                {
                    'q': 'Pendekatan disiplin kelas masa kini yang berfokus pada restitusi dan pembentukan keyakinan kelas disebut...',
                    'opts': ['Disiplin Militeristik', 'Disiplin Positif', 'Hukuman Fisik', 'Sistem Poin Negatif'],
                    'ans': 1
                }
            ]
        },
        {
            'sesi': 7,
            'judul': 'Desain Pembelajaran Mendalam (Deep Learning) & Asesmen Autentik HOTS',
            'tanggal': 'Sabtu, 15 November 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu menyusun instrumen asesmen autentik (rubrik performa, portofolio) berbasis Higher Order Thinking Skills (HOTS) serta menuntaskan Tugas Tutorial 3.',
            'topik_kelompok': 'Penyusunan Butir Soal Asesmen HOTS dan Rubrik Kinerja Presentasi Siswa SD',
            'pemantik': [
                'Apakah soal HOTS selalu identik dengan soal yang panjang, rumit, dan sulit dipahami siswa SD?',
                'Bagaimana menyusun rubrik analitik yang adil untuk menilai keterampilan kolaborasi siswa?'
            ],
            'materi_summary': 'Modul 7 mengupas taksonomi Bloom revisi level C4 (Menganalisis), C5 (Mengevaluasi), dan C6 (Mencipta). Asesmen autentik mengukur unjuk kerja nyata siswa melalui tugas kinerja, proyek, dan portofolio reflektif.',
            'modul_ut': 'BMP SPGK4410 Modul 7 (KB 1 & KB 2)',
            'video_title': 'Teknik Penyusunan Butir Soal HOTS & Asesmen Autentik SD',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Bedah kisi-kisi dan contoh instrumen asesmen unjuk kerja berbasis HOTS untuk guru SD.',
            'lkpd_title': 'LKPD 7: Penyusunan Kisi-kisi, Butir Soal HOTS, dan Rubrik Penilaian',
            'lkpd_desc': 'Susunlah 3 butir soal HOTS disertai stimulus kontekstual dan rubrik penilaian holistik.',
            'tugas_khusus': 'TUGAS TUTORIAL 3 (Wajib Diunggah: Batas Akhir Sesi 7)',
            'quiz': [
                {
                    'q': 'Tiga tingkatan kognitif teratas dalam Taksonomi Bloom Revisi yang tergolong HOTS adalah...',
                    'opts': ['Mengingat, Memahami, Menerapkan', 'Menganalisis, Mengevaluasi, Mencipta', 'Membaca, Menulis, Menghitung', 'Melihat, Mendengar, Meniru'],
                    'ans': 1
                },
                {
                    'q': 'Karakteristik utama stimulus dalam butir soal HOTS yang baik adalah...',
                    'opts': ['Kontekstual, menarik, dan memicu analisis kritis', 'Hanya berupa teks definisi hafalan kamus', 'Sangat abstrak dan tidak ada kaitannya dengan kehidupan', 'Singkat tanpa konteks'],
                    'ans': 0
                },
                {
                    'q': 'Penilaian yang menuntut peserta didik mendemonstrasikan keterampilan dalam situasi dunia nyata disebut...',
                    'opts': ['Asesmen Autentik (Authentic Assessment)', 'Asesmen Tradisional Hafalan', 'Ujian Lisan Kilat', 'Asesmen Pasif'],
                    'ans': 0
                }
            ]
        },
        {
            'sesi': 8,
            'judul': 'Evaluasi Holistik Tutorial, Refleksi Komprehensif, dan Rencana Aksi Inovasi Kelas',
            'tanggal': 'Sabtu, 22 November 2026',
            'waktu': '08:00 - 10:00 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': 'Mahasiswa mampu merangkum seluruh materi tutorial 1-8, mengevaluasi portofolio tugas, dan merumuskan rencana aksi inovasi pembelajaran berkelanjutan di SD masing-masing.',
            'topik_kelompok': 'Gelar Portofolio Inovasi Pembelajaran Kelas 5A Pokjar Nusa Indah',
            'pemantik': [
                'Inovasi strategi pembelajaran mana yang paling berdampak langsung saat Anda uji coba di kelas nyata?',
                'Bagaimana komitmen Anda menjaga keberlanjutan profesionalisme sebagai pendidik lulusan Universitas Terbuka?'
            ],
            'materi_summary': 'Modul 8 adalah sesi sintesis dan refleksi akhir. Membahas reviu seluruh capaian tutorial dari Sesi 1 sampai Sesi 7, verifikasi nilai tugas tutorial 1, 2, 3, dan penyusunan komitmen rencana aksi pengajaran inovatif jangka panjang.',
            'modul_ut': 'BMP SPGK4410 Modul 8 & Portofolio Pembelajaran Lengkap',
            'video_title': 'Refleksi Akhir Tutorial & Menjadi Guru Penggerak Perubahan di Daerah',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Pesan inspiratif dari Dosen FKIP UT mengenai etos kerja guru pembelajar sepanjang hayat (lifelong learner).',
            'lkpd_title': 'LKPD 8: Rencana Tindak Lanjut (RTL) Inovasi Pembelajaran SD Pasca-Tutorial',
            'lkpd_desc': 'Tuliskan dokumen Rencana Tindak Lanjut pribadi berisi 3 target perbaikan pembelajaran di sekolah Anda untuk 6 bulan ke depan.',
            'tugas_khusus': None,
            'quiz': [
                {
                    'q': 'Tujuan utama dari kegiatan refleksi pembelajaran bagi seorang guru profesional adalah...',
                    'opts': ['Mencari kesalahan murid semata', 'Mengevaluasi efektivitas strategi mengajar dan merencanakan perbaikan berkelanjutan', 'Memenuhi syarat administratif formalitas saja', 'Mengurangi jam istirahat sekolah'],
                    'ans': 1
                },
                {
                    'q': 'Prinsip utama belajar sepanjang hayat (lifelong learning) yang ditanamkan Universitas Terbuka kepada mahasiswanya adalah...',
                    'opts': ['Belajar hanya ketika ada ujian saja', 'Kemandirian, kedisiplinan, dan terus mengupgrade wawasan ilmu pengetahuan', 'Bergantung sepenuhnya kepada orang lain', 'Berhenti belajar setelah wisuda sarjana'],
                    'ans': 1
                },
                {
                    'q': 'Komponen akhir yang menandai kelulusan tutorial tatap muka dan tuweb di Pokjar UT adalah...',
                    'opts': ['Ketuntasan keaktifan kehadiran 8 sesi dan penyelesaian Tugas Tutorial 1, 2, 3', 'Hanya presensi tanpa mengerjakan tugas', 'Mengikuti sesi 1 saja', 'Tidak pernah hadir tuweb'],
                    'ans': 0
                }
            ]
        }
    ]
}

# Duplicate similar tailored curricula for 6A (ABK) and 7C1/7D1 (PKM)
def create_abk_curricula():
    topics = [
        ('Hakikat, Sejarah, Paradigma Inklusi, dan Klasifikasi ABK', 'Konsep Dasar Pendidikan Inklusif', None),
        ('Identifikasi & Karakteristik Hambatan Penglihatan (Tunanetra) & Pendengaran (Tunarungu)', 'Media Braille & Bahasa Isyarat Sederhana', None),
        ('Anak dengan Hambatan Intelektual (Tunagrahita) & Kesulitan Belajar Spesifik (Disleksia/Diskalkulia)', 'Asesmen Diagnostik Gaya Belajar ABK', 'TUGAS TUTORIAL 1 (Wajib Diunggah: Batas Akhir Sesi 3)'),
        ('Karakteristik & Penanganan Spektrum Autisme & Gangguan Pemusatan Perhatian / Hiperaktif (ADHD)', 'Strategi Pengelolaan Perilaku Tantrum di Kelas Reguler', None),
        ('Anak Berbakat Akademik (CIBI/Gifted) dan Anak dengan Hambatan Fisik-Motorik (Tunadaksa)', 'Akselerasi & Aksesibilitas Fasilitas Belajar', 'TUGAS TUTORIAL 2 (Wajib Diunggah: Batas Akhir Sesi 5)'),
        ('Modifikasi Kurikulum, Rancangan Kelas Inklusif, dan Pembelajaran Berdiferensiasi untuk ABK', 'Penataan Tata Ruang Kelas Ramah Inklusi', None),
        ('Penyusunan Program Pembelajaran Individual (PPI / IEP) dan Kolaborasi Orang Tua-Tenaga Ahli', 'Bedah Format PPI Sederhana untuk Guru Kelas SD', 'TUGAS TUTORIAL 3 (Wajib Diunggah: Batas Akhir Sesi 7)'),
        ('Evaluasi Holistik Perkembangan ABK, Refleksi Tutorial, dan Portofolio Guru Inklusif', 'Gelar Praktik Baik Pembelajaran Ramah Inklusi Pokjar', None)
    ]
    sessions = []
    for idx, (title, group_topic, ttm_task) in enumerate(topics, 1):
        sessions.append({
            'sesi': idx,
            'judul': f'Tutorial {idx}: {title}',
            'tanggal': f'Minggu, {idx * 7 - 3} Oktober 2026',
            'waktu': '10:15 - 12:15 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': f'Mahasiswa mampu menganalisis konsep dan strategi implementatif terkait {title.lower()} dalam setting pendidikan sekolah dasar inklusif.',
            'topik_kelompok': f'Studi Kasus Kelompok: {group_topic}',
            'pemantik': [
                f'Apa tantangan paling nyata yang dihadapi guru kelas SD saat menangani {title.split(",")[0]}?',
                'Bagaimana membangun empati dan penerimaan positif dari siswa reguler terhadap teman sekelas yang berkebutuhan khusus?'
            ],
            'materi_summary': f'Modul {idx} BMP SPDA4401 membahas secara komprehensif landasan teoretis, tanda-tanda awal identifikasi, instrumen skrining sederhana yang dapat digunakan oleh guru kelas, serta panduan modifikasi materi pembelajaran tanpa menurunkan esensi kompetensi dasar.',
            'modul_ut': f'BMP SPDA4401 Modul {idx} (KB 1 & KB 2)',
            'video_title': f'Video Edukasi Penanganan ABK: {title[:40]}... (UT TV Inklusi)',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Panduan audiovisual dari praktisi pendidikan luar biasa dan dosen UT mengenai strategi pendampingan anak berkebutuhan khusus di kelas SD.',
            'lkpd_title': f'LKPD {idx}: Lembar Identifikasi, Analisis Kasus, dan Rekomendasi Penanganan',
            'lkpd_desc': 'Lakukan analisis studi kasus terhadap profil anak berkebutuhan khusus dan rumuskan rekomendasi adaptasi pembelajaran yang realistis.',
            'tugas_khusus': ttm_task,
            'quiz': [
                {
                    'q': 'Pendidikan yang memberikan kesempatan kepada semua anak, termasuk yang berkebutuhan khusus, untuk belajar bersama di sekolah reguler disebut...',
                    'opts': ['Pendidikan Inklusif', 'Pendidikan Eksklusif', 'Sekolah Khusus Terisolasi', 'Pendidikan Asrama'],
                    'ans': 0
                },
                {
                    'q': 'Dokumen rencana pembelajaran khusus yang disusun sesuai dengan kebutuhan spesifik dan tingkat kemampuan individu ABK disebut...',
                    'opts': ['PPI (Program Pembelajaran Individual)', 'KTSP Umum', 'Silabus Baku', 'Jurnal Absensi'],
                    'ans': 0
                },
                {
                    'q': 'Kesulitan belajar spesifik yang ditandai dengan hambatan mengenali huruf, mengeja kata, dan membaca lancar dikenal sebagai...',
                    'opts': ['Disleksia', 'Diskalkulia', 'Disgrafia', 'Dispraksia'],
                    'ans': 0
                }
            ]
        })
    return sessions

def create_pkm_curricula(class_code):
    topics = [
        ('Orientasi Mata Kuliah PKM, Kode Etik Guru, dan Sistematika RPP/Modul Ajar Siklus 1', 'Telaah Format RPP/Modul Ajar Berstandar PKM UT', None),
        ('Penguasaan 8 Keterampilan Dasar Mengajar (Membuka, Menjelaskan, Bertanya, Menutup)', 'Simulasi Keterampilan Bertanya Kritis & Variasi Stimulus', None),
        ('Praktik Simulasi Mengajar 1 (Micro-teaching) & Penilaian Pengamatan Teman Sejawat', 'Pelaksanaan Lembar Observasi Kinerja Mengajar Rekan', 'TUGAS TUTORIAL 1 (Wajib Diunggah: Batas Akhir Sesi 3)'),
        ('Analisis Kritis Rekaman Video Praktik Mengajar & Diskusi Refleksi Diri Guru', 'Analisis Kekuatan & Kelemahan Praktik Mengajar Berdasarkan Video', None),
        ('Praktik Simulasi Mengajar 2 Berbasis TPACK dan Media Interaktif', 'Inovasi Alat Peraga Manipulatif & Media Digital Tematik SD', 'TUGAS TUTORIAL 2 (Wajib Diunggah: Batas Akhir Sesi 5)'),
        ('Penyusunan Instrumen Asesmen Formatif & Portofolio Karya Mengajar Tematik SD', 'Pembuatan Rubrik Penilaian Kinerja Siswa yang Terukur', None),
        ('Praktik Ujian Mengajar Mandiri di Sekolah Latihan & Sistematika Laporan PKM', 'Penyusunan Bab I-IV Laporan Praktik PKM Pokjar Nusa Indah', 'TUGAS TUTORIAL 3 (Wajib Diunggah: Batas Akhir Sesi 7)'),
        ('Gelar Karya Portofolio Mengajar, Finalisasi Laporan PKM, dan Evaluasi Akhir Kelulusan', 'Presentasi Refleksi Pengalaman PKM & Rekomendasi Mengajar', None)
    ]
    sessions = []
    for idx, (title, group_topic, ttm_task) in enumerate(topics, 1):
        sessions.append({
            'sesi': idx,
            'judul': f'Tutorial {idx}: {title}',
            'tanggal': f'Sabtu, {idx * 7} Oktober 2026',
            'waktu': '13:00 - 15:00 WIB' if class_code == '7C1' else '15:15 - 17:15 WIB',
            'mode': 'Tuweb & Tatap Muka (TTM)',
            'cpmk': f'Mahasiswa mampu menguasai kompetensi pedagogik dan profesional melalui {title.lower()} sebagai calon sarjana pendidikan guru sekolah dasar.',
            'topik_kelompok': f'Praktik Kolaboratif Kelompok: {group_topic}',
            'pemantik': [
                'Bagaimana memastikan bahwa keterampilan membuka pelajaran mampu mengaktifkan skemata dan fokus seluruh siswa SD?',
                'Apa saja kriteria penting dalam lembar refleksi diri agar guru benar-benar menyadari aspek pengajaran yang harus diperbaiki?'
            ],
            'materi_summary': f'Panduan PKM SPGK4408 Sesi {idx} memberikan petunjuk teknis perancangan RPP/Modul Ajar, rambu-rambu micro-teaching, rubrik APKG 1 (Alat Penilaian Kemampuan Guru 1 untuk RPP) dan APKG 2 (Alat Penilaian Kemampuan Guru 2 untuk Praktik Mengajar di kelas).',
            'modul_ut': f'Panduan PKM SPGK4408 FKIP UT Sesi {idx}',
            'video_title': f'Video Praktik Pembelajaran Guru Teladan: {title[:40]}... (UT TV)',
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'video_desc': 'Contoh nyata simulasi mengajar di kelas laboratorium SD dengan penekanan pada keterampilan dasar mengajar guru.',
            'lkpd_title': f'LKPD {idx}: Lembar Kerja Perancangan RPP / Lembar Pengamatan Teman Sejawat',
            'lkpd_desc': 'Lengkapi instrumen pengamatan atau susun draft perangkat pembelajaran siklus berjalan sesuai instrumen APKG 1 & 2.',
            'tugas_khusus': ttm_task,
            'quiz': [
                {
                    'q': 'Instrumen resmi yang digunakan untuk menilai kelayakan Rencana Pelaksanaan Pembelajaran (RPP/Modul Ajar) dalam PKM UT adalah...',
                    'opts': ['APKG 1 (Alat Penilaian Kemampuan Guru 1)', 'APKG 2', 'Kuesioner Siswa', 'Buku Kas Kelas'],
                    'ans': 0
                },
                {
                    'q': 'Instrumen resmi yang digunakan oleh supervisor/tutor untuk menilai praktik performa mengajar guru di dalam kelas adalah...',
                    'opts': ['APKG 2 (Alat Penilaian Kemampuan Guru 2)', 'APKG 1', 'Lembar Absensi', 'Kartu Ujian'],
                    'ans': 0
                },
                {
                    'q': 'Tujuan utama dari pengamatan rekan sejawat (peer observation) dalam simulasi PKM adalah...',
                    'opts': ['Memberikan masukan konstruktif demi perbaikan kualitas mengajar', 'Mencari kesalahan rekan untuk ditertawakan', 'Menggantikan tugas penguji utama', 'Menilai tanpa melihat penampilan'],
                    'ans': 0
                }
            ]
        })
    return sessions

curricula['6A'] = create_abk_curricula()
curricula['7C1'] = create_pkm_curricula('7C1')
curricula['7D1'] = create_pkm_curricula('7D1')

# Build the complete JS structure
js_code = f"""// Data Lengkap E-Learning UT Pokjar Nusa Indah
// Auto-generated for Tutor: Bagus Panca Wiratama, S.Pd., M.Pd.
// Terdiri dari: 78 Mahasiswa resmi, 4 Kelas & Mata Kuliah, 8x Tutorial per kelas, dan 8 Menu per pertemuan.

var TUTOR_DATA = {{
  nama: "Bagus Panca Wiratama, S.Pd., M.Pd.",
  gelar: "S.Pd., M.Pd.",
  nip: "198805122019031008",
  email: "bagoespancawiratama@gmail.com",
  whatsapp: "+62 856-6920-9950",
  upbjj: "UPBJJ UT Palembang",
  pokjar: "Pokjar Nusa Indah, Kab. OKU Timur",
  status: "Tutor Pengampu & Pengelola Sentra Belajar",
  foto: "Bagus Panca Wiratama.jpg",
  sambutan: "Selamat datang di Portal E-Learning UT Pokjar Nusa Indah. Portal ini dirancang untuk mendampingi rekan-rekan mahasiswa dalam menjalani perkuliahan jarak jauh yang mandiri, bermakna, dan berkualitas. Mari optimalkan seluruh menu tutorial 1 hingga 8 untuk meraih prestasi akademik terbaik."
}};

var COURSES_DATA = {json.dumps(courses_info, indent=2, ensure_ascii=False)};

var STUDENTS_DATA = {json.dumps(students, indent=2, ensure_ascii=False)};

var GROUPS_BY_CLASS = {json.dumps(groups_by_class, indent=2, ensure_ascii=False)};

var TUTORIALS_DATA = {json.dumps(curricula, indent=2, ensure_ascii=False)};

if (typeof window !== 'undefined') {{
  window.TUTOR_DATA = TUTOR_DATA;
  window.COURSES_DATA = COURSES_DATA;
  window.STUDENTS_DATA = STUDENTS_DATA;
  window.GROUPS_BY_CLASS = GROUPS_BY_CLASS;
  window.TUTORIALS_DATA = TUTORIALS_DATA;
}}
"""

with open('app_data.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Successfully created app_data.js!")
print("File size:", len(js_code), "bytes")
