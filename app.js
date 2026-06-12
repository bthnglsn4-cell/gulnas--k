// GÜLNAS İK - Uygulama Mantığı (app.js)

// --- OTOMATİK BULUT SENKRONİZASYONU AYARLARI ---
const AUTO_SUPABASE_URL = "https://hzmxcntpvcyybocpjsrc.supabase.co";
const AUTO_SUPABASE_KEY = "sb_publishable_Vu9HIEiTeq8xFKv2JIeoEA_kEo92mnH"; // Lütfen bu tırnakların arasına Supabase Anon Key'inizi yapıştırın.

// --- GENDER-SPECIFIC DEFAULT SVG PLACEHOLDERS ---
const maleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cbd5e1"/><circle cx="50" cy="40" r="20" fill="#475569"/><path d="M50 65c-22 0-30 15-30 15v10h60v-10s-8-15-30-15z" fill="#475569"/></svg>`;
const femaleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cbd5e1"/><path d="M50 17c-13 0-21 8-21 21v12c0 2 1 4 3 5l2 3v7c-7 2-12 7-12 7v18h56v-18s-5-5-12-7v-7l2-3c2-1 3-3 3-5v-12c0-13-8-21-21-21z" fill="#475569"/><circle cx="50" cy="40" r="17" fill="#cbd5e1"/><path d="M50 54v11" stroke="#cbd5e1" stroke-width="6"/><path d="M29 38c0-13 8-21 21-21s21 8 21 21c0 3-1 6-2 8-3-6-9-10-19-10s-16 4-19 10c-1-2-2-5-2-8z" fill="#475569"/></svg>`;

const maleAvatar = `data:image/svg+xml;base64,${btoa(maleSvg)}`;
const femaleAvatar = `data:image/svg+xml;base64,${btoa(femaleSvg)}`;

function getEmployeeAvatar(emp) {
    if (emp && emp.avatar) {
        return emp.avatar;
    }
    return maleAvatar;
}

// --- NEW HELPER FUNCTIONS FOR TC VERIFICATION & LEAVE LIMIT CALCULATION ---
function generateValidTCKN() {
    let base = "";
    base += Math.floor(Math.random() * 9 + 1).toString();
    for (let i = 0; i < 8; i++) {
        base += Math.floor(Math.random() * 10).toString();
    }
    const digits = base.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const d10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
    const totalSum = digits.reduce((a, b) => a + b, 0) + d10;
    const d11 = totalSum % 10;
    return base + d10.toString() + d11.toString();
}

function validateTCKN(tckn) {
    if (!tckn) return false;
    tckn = tckn.toString().trim();
    if (tckn.length !== 11) return false;
    if (!/^\d{11}$/.test(tckn)) return false;
    if (tckn[0] === '0') return false;

    const digits = tckn.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    const d10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
    if (digits[9] !== d10) return false;

    const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    const d11 = totalSum % 10;
    if (digits[10] !== d11) return false;

    return true;
}

function calculateAge(birthDateStr) {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateTenure(hireDateStr) {
    if (!hireDateStr) return 0;
    const hireDate = new Date(hireDateStr);
    const today = new Date();
    let tenure = today.getFullYear() - hireDate.getFullYear();
    const m = today.getMonth() - hireDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < hireDate.getDate())) {
        tenure--;
    }
    return Math.max(0, tenure);
}

function calculateLegalLeaveLimit(birthDateStr, hireDateStr) {
    const age = calculateAge(birthDateStr);
    const tenure = calculateTenure(hireDateStr);

    let limit = 14; // Base for 1-5 years
    if (tenure >= 5 && tenure < 15) {
        limit = 20;
    } else if (tenure >= 15) {
        limit = 26;
    }

    // Age rule: Under 18 or 50 and over cannot have less than 20 days
    if (age <= 18 || age >= 50) {
        if (limit < 20) {
            limit = 20;
        }
    }
    return limit;
}

// --- MOCK / BAŞLANGIÇ VERİLERİ ---
const defaultEmployees = [
    {
        id: "emp-1",
        name: "Ahmet",
        lastname: "Yılmaz",
        role: "Şantiye Şefi",
        dept: "Şantiye",
        email: "ahmet.yilmaz@gulnasinsaat.com",
        phone: "0532 555 0122",
        hireDate: "2023-03-12",
        status: "active",
        salary: 75000,
        overtimeRate: 350,
        gender: "Erkek",
        leaveLimit: 14,
        tckn: "10000000146",
        birthDate: "1985-05-15",
        education: "Lisans"
    },
    {
        id: "emp-2",
        name: "Mehmet",
        lastname: "Demir",
        role: "Kalıpçı Ustası",
        dept: "Şantiye",
        email: "mehmet.demir@gulnasinsaat.com",
        phone: "0542 555 9811",
        hireDate: "2024-05-20",
        status: "active",
        salary: 52000,
        overtimeRate: 250,
        gender: "Erkek",
        leaveLimit: 20,
        tckn: "10000000214",
        birthDate: "1972-08-10",
        education: "Lise"
    },
    {
        id: "emp-3",
        name: "Ayşe",
        lastname: "Kaya",
        role: "Proje Mühendisi",
        dept: "Merkez Ofis",
        email: "ayse.kaya@gulnasinsaat.com",
        phone: "0533 555 7766",
        hireDate: "2022-09-01",
        status: "leave",
        salary: 64000,
        overtimeRate: 300,
        gender: "Kadın",
        leaveLimit: 14,
        tckn: "10000000382",
        birthDate: "1994-03-24",
        education: "Lisans"
    },
    {
        id: "emp-4",
        name: "Fatma",
        lastname: "Şahin",
        role: "Muhasebe Sorumlusu",
        dept: "Muhasebe",
        email: "fatma.sahin@gulnasinsaat.com",
        phone: "0535 555 4321",
        hireDate: "2021-11-15",
        status: "active",
        salary: 58000,
        overtimeRate: 250,
        gender: "Kadın",
        leaveLimit: 14,
        tckn: "10000000450",
        birthDate: "1990-12-05",
        education: "Lisans"
    },
    {
        id: "emp-5",
        name: "Can",
        lastname: "Aslan",
        role: "İSG Uzmanı",
        dept: "İK",
        email: "can.aslan@gulnasinsaat.com",
        phone: "0505 555 3322",
        hireDate: "2025-01-10",
        status: "active",
        salary: 60000,
        overtimeRate: 280,
        gender: "Erkek",
        leaveLimit: 20,
        tckn: "10000000528",
        birthDate: "2008-10-12",
        education: "Lise"
    },
    {
        id: "emp-6",
        name: "Murat",
        lastname: "Şahin",
        role: "Sıvacı Ustası",
        dept: "Şantiye",
        email: "murat.sahin@gulnasinsaat.com",
        phone: "0536 555 8899",
        hireDate: "2023-01-15",
        status: "passive",
        terminationDate: "2025-12-30",
        salary: 48000,
        overtimeRate: 220,
        gender: "Erkek",
        leaveLimit: 20,
        tckn: "10000000696",
        birthDate: "1968-04-30",
        education: "Ön Lisans"
    }
];

// Tarih hesaplama yardımcıları (Simülasyonda tarihler güncel kalsın diye bugünün tarihine göre ayarlanacak)
const getFutureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

const defaultDocuments = [
    // Ahmet Yılmaz (emp-1) - MYK süresi yaklaşıyor, Sağlık raporu geçerli
    { id: "doc-1", employeeId: "emp-1", type: "Kimlik/Pasaport", fileName: "ahmet_kimlik.pdf", expiryDate: "" },
    { id: "doc-2", employeeId: "emp-1", type: "İş Sözleşmesi", fileName: "ahmet_sozlesme.pdf", expiryDate: "" },
    { id: "doc-3", employeeId: "emp-1", type: "MYK Belgesi", fileName: "ahmet_myk_kalip.pdf", expiryDate: getFutureDate(12) }, // 12 gün kaldı
    { id: "doc-4", employeeId: "emp-1", type: "Sağlık Raporu", fileName: "ahmet_saglik_raporu.pdf", expiryDate: getFutureDate(180) }, // Geçerli
    
    // Mehmet Demir (emp-2) - MYK süresi dolmuş, Sağlık raporu süresi dolmuş
    { id: "doc-5", employeeId: "emp-2", type: "Kimlik/Pasaport", fileName: "mehmet_kimlik.pdf", expiryDate: "" },
    { id: "doc-6", employeeId: "emp-2", type: "MYK Belgesi", fileName: "mehmet_myk_iskele.pdf", expiryDate: getPastDate(5) }, // 5 gün önce doldu
    { id: "doc-7", employeeId: "emp-2", type: "Sağlık Raporu", fileName: "mehmet_saglik.pdf", expiryDate: getPastDate(15) }, // 15 gün önce doldu

    // Ayşe Kaya (emp-3) - Belgeler geçerli
    { id: "doc-8", employeeId: "emp-3", type: "Kimlik/Pasaport", fileName: "ayse_kimlik_tarama.jpg", expiryDate: "" },
    { id: "doc-9", employeeId: "emp-3", type: "Diploma", fileName: "ayse_insaat_muh_diploma.pdf", expiryDate: "" },

    // Can Aslan (emp-5) - Sağlık Raporu süresi yaklaşıyor
    { id: "doc-10", employeeId: "emp-5", type: "Kimlik/Pasaport", fileName: "can_kimlik.pdf", expiryDate: "" },
    { id: "doc-11", employeeId: "emp-5", type: "Sağlık Raporu", fileName: "can_isg_saglik_raporu.pdf", expiryDate: getFutureDate(25) } // 25 gün kaldı
];

const defaultLeaveRequests = [
    {
        id: "leave-req-1",
        employeeId: "emp-3",
        employeeName: "Ayşe Kaya",
        type: "Yıllık İzin",
        startDate: getPastDate(2),
        endDate: getFutureDate(5),
        desc: "Yaz dönemi yıllık izin kullanımı.",
        status: "approved",
        approvedBy: "Admin"
    },
    {
        id: "leave-req-2",
        employeeId: "emp-1",
        employeeName: "Ahmet Yılmaz",
        type: "Raporlu/Sağlık",
        startDate: getFutureDate(10),
        endDate: getFutureDate(14),
        desc: "Planlı ufak cerrahi operasyon mazeretiyle sağlık izni.",
        status: "pending"
    },
    {
        id: "leave-req-3",
        employeeId: "emp-4",
        employeeName: "Fatma Şahin",
        type: "Yıllık İzin",
        startDate: getFutureDate(20),
        endDate: getFutureDate(25),
        desc: "Aile ziyareti için izin talebi.",
        status: "pending"
    }
];

// Varsayılan Yönetici Profili
const defaultManager = {
    name: "Sistem",
    lastname: "Yöneticisi",
    role: "İK Yöneticisi",
    username: "admin",
    password: "123",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
};

const defaultAttendance = {};

const defaultAnnouncements = [
    {
        id: "ann-1",
        title: "İSG Eğitimleri Hakkında",
        content: "Gülnas İnşaat şantiye ekiplerinin ISG ve MYK belgelerinin vizelenmesi Temmuz ayı sonuna kadar tamamlanacaktır.",
        publisher: "Admin",
        date: "2026-06-12"
    },
    {
        id: "ann-2",
        title: "Yaz Dönemi İzin Politikası",
        content: "Yıllık izin taleplerinin operasyonları aksatmaması adına en az 15 gün öncesinden sistem üzerinden iletilmesi rica olunur.",
        publisher: "Admin",
        date: "2026-06-12"
    },
    {
        id: "ann-3",
        title: "Periyodik Muayeneler",
        content: "Sağlık raporu yenileme dönemi yaklaşan ofis personellerinin İK birimi ile iletişime geçmesi rica edilir.",
        publisher: "Admin",
        date: "2026-06-12"
    }
];

// --- STATE MANAGEMENT ---
let state = {
    employees: JSON.parse(localStorage.getItem("gl_employees")) || defaultEmployees,
    documents: JSON.parse(localStorage.getItem("gl_documents")) || defaultDocuments,
    leaveRequests: JSON.parse(localStorage.getItem("gl_leaveRequests")) || defaultLeaveRequests,
    attendance: JSON.parse(localStorage.getItem("gl_attendance")) || defaultAttendance,
    manager: JSON.parse(localStorage.getItem("gl_manager")) || defaultManager,
    announcements: JSON.parse(localStorage.getItem("gl_announcements")) || defaultAnnouncements,
    personelView: localStorage.getItem("gl_personel_view") || "grid" // "grid" veya "list"
};

let supabaseInitialized = false;
let supabaseClient = null;
let supabaseChannel = null;
let isSyncing = false;
let supabaseSyncTimeout = null;

function saveState() {
    localStorage.setItem("gl_employees", JSON.stringify(state.employees));
    localStorage.setItem("gl_documents", JSON.stringify(state.documents));
    localStorage.setItem("gl_leaveRequests", JSON.stringify(state.leaveRequests));
    localStorage.setItem("gl_attendance", JSON.stringify(state.attendance));
    localStorage.setItem("gl_manager", JSON.stringify(state.manager));
    localStorage.setItem("gl_announcements", JSON.stringify(state.announcements));
    
    if (supabaseInitialized && supabaseClient) {
        if (supabaseSyncTimeout) {
            clearTimeout(supabaseSyncTimeout);
        }
        supabaseSyncTimeout = setTimeout(() => {
            if (!isSyncing) {
                saveStateToSupabase();
            }
        }, 2000);
    }
}

window.addEventListener("beforeunload", () => {
    if (supabaseSyncTimeout) {
        clearTimeout(supabaseSyncTimeout);
        if (supabaseInitialized && supabaseClient && !isSyncing) {
            saveStateToSupabase();
        }
    }
});

function initSupabase(url, anonKey) {
    if (!url || !anonKey) return false;
    try {
        const { createClient } = supabase;
        supabaseClient = createClient(url, anonKey);
        supabaseInitialized = true;
        return true;
    } catch (error) {
        console.error("Supabase initialization failed:", error);
        return false;
    }
}
function updateCloudStatusUI(status) {
    const btn = document.getElementById("btn-cloud-status");
    const text = document.getElementById("cloud-status-text");
    if (!btn || !text) return;
    
    if (status === "active") {
        btn.className = "cloud-status-btn active";
        text.textContent = "Bulut Aktif";
    } else if (status === "connecting") {
        btn.className = "cloud-status-btn connecting";
        text.textContent = "Bağlanıyor...";
    } else {
        btn.className = "cloud-status-btn";
        text.textContent = "Yerel Mod";
    }

    // Update mobile system status text
    const mobileStatus = document.getElementById("mobile-system-status");
    if (mobileStatus) {
        if (status === "active") {
            mobileStatus.innerHTML = '<span class="status-dot-green"></span> SİSTEM ÇEVRİMİÇİ';
            mobileStatus.className = "system-status-indicator active";
        } else if (status === "connecting") {
            mobileStatus.innerHTML = '<span class="status-dot-orange"></span> BAĞLANILIYOR...';
            mobileStatus.className = "system-status-indicator connecting";
        } else {
            mobileStatus.innerHTML = '<span class="status-dot-blue"></span> YEREL MOD';
            mobileStatus.className = "system-status-indicator local";
        }
    }
}
function refreshAllUI() {
    updateHeaderManagerInfo();
    applyRoleRestrictions();
    renderDashboard();
    renderPersonelList();
    renderOzlukEmployeeList();
    renderOzlukDocuments();
    renderPuantaj();
    renderLeaveRequests();
    renderIzinModule();
    populateLeaveEmployeeSelect();
    populateBordroEmployeeSelect();
}

function startRealTimeSync() {
    stopRealTimeSync();
    if (!supabaseInitialized || !supabaseClient) return;
    
    updateCloudStatusUI("connecting");
    
    let loadedTables = 0;
    const totalTables = 6;
    
    function checkAllLoaded() {
        loadedTables++;
        if (loadedTables >= totalTables) {
            updateCloudStatusUI("active");
            refreshAllUI();
        }
    }
    
    async function loadInitialData() {
        try {
            const { data: empData } = await supabaseClient.from('employees').select('*');
            if (empData && (empData.length > 0 || localStorage.getItem("gl_supabase_migrated") === "true")) {
                state.employees = empData;
                localStorage.setItem("gl_employees", JSON.stringify(state.employees));
            }
            checkAllLoaded();
            
            const { data: docData } = await supabaseClient.from('documents').select('*');
            if (docData && (docData.length > 0 || localStorage.getItem("gl_supabase_migrated") === "true")) {
                state.documents = docData;
                localStorage.setItem("gl_documents", JSON.stringify(state.documents));
            }
            checkAllLoaded();
            
            const { data: leaveData } = await supabaseClient.from('leaverequests').select('*');
            if (leaveData && (leaveData.length > 0 || localStorage.getItem("gl_supabase_migrated") === "true")) {
                state.leaveRequests = leaveData;
                localStorage.setItem("gl_leaveRequests", JSON.stringify(state.leaveRequests));
            }
            checkAllLoaded();
            
            const { data: annData } = await supabaseClient.from('announcements').select('*');
            if (annData && (annData.length > 0 || localStorage.getItem("gl_supabase_migrated") === "true")) {
                state.announcements = annData;
                state.announcements.sort((a, b) => a.id.localeCompare(b.id));
                localStorage.setItem("gl_announcements", JSON.stringify(state.announcements));
            }
            checkAllLoaded();
            
            const { data: attData } = await supabaseClient.from('attendance').select('*');
            if (attData && (attData.length > 0 || localStorage.getItem("gl_supabase_migrated") === "true")) {
                const attMap = {};
                attData.forEach(row => {
                    attMap[row.employeeId] = row.records;
                });
                state.attendance = attMap;
                localStorage.setItem("gl_attendance", JSON.stringify(state.attendance));
            }
            checkAllLoaded();
            
            const { data: mgrData } = await supabaseClient.from('manager_settings').select('*').eq('key', 'manager').maybeSingle();
            if (mgrData && mgrData.value) {
                state.manager = mgrData.value;
                localStorage.setItem("gl_manager", JSON.stringify(state.manager));
            }
            checkAllLoaded();
            
        } catch (err) {
            console.error("Initial Supabase load error:", err);
            updateCloudStatusUI("local");
        }
    }
    
    loadInitialData();
    
    supabaseChannel = supabaseClient
        .channel('supabase-realtime-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, payload => {
            handleRealtimeEvent('employees', payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, payload => {
            handleRealtimeEvent('documents', payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leaverequests' }, payload => {
            handleRealtimeEvent('leaverequests', payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
            handleRealtimeEvent('announcements', payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, payload => {
            handleRealtimeEvent('attendance', payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'manager_settings' }, payload => {
            handleRealtimeEvent('manager_settings', payload);
        })
        .subscribe();
}

function handleRealtimeEvent(table, payload) {
    isSyncing = true;
    const { eventType, new: newRow, old: oldRow } = payload;
    
    if (table === 'employees') {
        if (eventType === 'INSERT') {
            if (!state.employees.some(e => e.id === newRow.id)) {
                state.employees.push(newRow);
            }
        } else if (eventType === 'UPDATE') {
            const idx = state.employees.findIndex(e => e.id === newRow.id);
            if (idx !== -1) state.employees[idx] = newRow;
        } else if (eventType === 'DELETE') {
            state.employees = state.employees.filter(e => e.id !== oldRow.id);
        }
        localStorage.setItem("gl_employees", JSON.stringify(state.employees));
        renderPersonelList();
        renderDashboard();
        renderOzlukEmployeeList();
        populateLeaveEmployeeSelect();
        populateBordroEmployeeSelect();
    } else if (table === 'documents') {
        if (eventType === 'INSERT') {
            if (!state.documents.some(d => d.id === newRow.id)) {
                state.documents.push(newRow);
            }
        } else if (eventType === 'UPDATE') {
            const idx = state.documents.findIndex(d => d.id === newRow.id);
            if (idx !== -1) state.documents[idx] = newRow;
        } else if (eventType === 'DELETE') {
            state.documents = state.documents.filter(d => d.id !== oldRow.id);
        }
        localStorage.setItem("gl_documents", JSON.stringify(state.documents));
        renderOzlukDocuments();
        renderDashboard();
    } else if (table === 'leaverequests') {
        if (eventType === 'INSERT') {
            if (!state.leaveRequests.some(r => r.id === newRow.id)) {
                state.leaveRequests.push(newRow);
            }
        } else if (eventType === 'UPDATE') {
            const idx = state.leaveRequests.findIndex(r => r.id === newRow.id);
            if (idx !== -1) state.leaveRequests[idx] = newRow;
        } else if (eventType === 'DELETE') {
            state.leaveRequests = state.leaveRequests.filter(r => r.id !== oldRow.id);
        }
        localStorage.setItem("gl_leaveRequests", JSON.stringify(state.leaveRequests));
        renderLeaveRequests();
        renderIzinModule();
        renderDashboard();
    } else if (table === 'announcements') {
        if (eventType === 'INSERT') {
            if (!state.announcements.some(a => a.id === newRow.id)) {
                state.announcements.push(newRow);
            }
        } else if (eventType === 'UPDATE') {
            const idx = state.announcements.findIndex(a => a.id === newRow.id);
            if (idx !== -1) state.announcements[idx] = newRow;
        } else if (eventType === 'DELETE') {
            state.announcements = state.announcements.filter(a => a.id !== oldRow.id);
        }
        state.announcements.sort((a, b) => a.id.localeCompare(b.id));
        localStorage.setItem("gl_announcements", JSON.stringify(state.announcements));
        renderAnnouncements();
    } else if (table === 'attendance') {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
            state.attendance[newRow.employeeId] = newRow.records || {};
        } else if (eventType === 'DELETE') {
            delete state.attendance[oldRow.employeeId];
        }
        localStorage.setItem("gl_attendance", JSON.stringify(state.attendance));
        renderPuantaj();
        renderDashboard();
    } else if (table === 'manager_settings') {
        if (newRow.key === 'manager') {
            state.manager = newRow.value;
            localStorage.setItem("gl_manager", JSON.stringify(state.manager));
            updateHeaderManagerInfo();
        }
    }
    
    isSyncing = false;
}

function stopRealTimeSync() {
    if (supabaseChannel) {
        supabaseClient.removeChannel(supabaseChannel);
        supabaseChannel = null;
    }
}
async function syncCollection(tableName, localArray) {
    if (localArray.length > 0) {
        const { error: upsertError } = await supabaseClient.from(tableName).upsert(localArray);
        if (upsertError) throw upsertError;
    }
    
    const { data, error: fetchError } = await supabaseClient.from(tableName).select('id');
    if (fetchError) throw fetchError;
    
    const localIds = localArray.map(item => item.id);
    const toDelete = data.filter(row => !localIds.includes(row.id)).map(row => row.id);
    if (toDelete.length > 0) {
        const { error: deleteError } = await supabaseClient.from(tableName).delete().in('id', toDelete);
        if (deleteError) throw deleteError;
    }
}
async function syncAttendance() {
    const attendanceList = Object.entries(state.attendance).map(([empId, records]) => ({
        employeeId: empId,
        records: records
    }));
    
    if (attendanceList.length > 0) {
        const { error: upsertError } = await supabaseClient.from('attendance').upsert(attendanceList);
        if (upsertError) throw upsertError;
    }
    
    const { data, error: fetchError } = await supabaseClient.from('attendance').select('employeeId');
    if (fetchError) throw fetchError;
    
    const localIds = Object.keys(state.attendance);
    const toDelete = data.filter(row => !localIds.includes(row.employeeId)).map(row => row.employeeId);
    if (toDelete.length > 0) {
        const { error: deleteError } = await supabaseClient.from('attendance').delete().in('employeeId', toDelete);
        if (deleteError) throw deleteError;
    }
}

async function saveStateToSupabase() {
    try {
        await syncCollection("employees", state.employees);
        await syncCollection("documents", state.documents);
        await syncCollection("leaverequests", state.leaveRequests);
        await syncCollection("announcements", state.announcements);
        await syncAttendance();
        await supabaseClient.from('manager_settings').upsert({ key: 'manager', value: state.manager });
    } catch (error) {
        console.error("Failed to sync state to Supabase:", error);
    }
}

async function migrateLocalStorageToSupabase() {
    if (!supabaseClient) return;
    
    if (state.employees.length > 0) {
        const { error } = await supabaseClient.from('employees').upsert(state.employees);
        if (error) throw error;
    }
    
    if (state.documents.length > 0) {
        const { error } = await supabaseClient.from('documents').upsert(state.documents);
        if (error) throw error;
    }
    
    if (state.leaveRequests.length > 0) {
        const { error } = await supabaseClient.from('leaverequests').upsert(state.leaveRequests);
        if (error) throw error;
    }
    
    if (state.announcements.length > 0) {
        const { error } = await supabaseClient.from('announcements').upsert(state.announcements);
        if (error) throw error;
    }
    
    const attendanceList = Object.entries(state.attendance).map(([empId, records]) => ({
        employeeId: empId,
        records: records
    }));
    if (attendanceList.length > 0) {
        const { error } = await supabaseClient.from('attendance').upsert(attendanceList);
        if (error) throw error;
    }
    
    const { error } = await supabaseClient.from('manager_settings').upsert({ key: 'manager', value: state.manager });
    if (error) throw error;
    
    localStorage.setItem("gl_supabase_migrated", "true");
}

// Upgrade migration to ensure all loaded employees have valid TCKN, BirthDate, Education and correct Leave Limit
state.employees.forEach(emp => {
    // Map old departments
    if (emp.dept === "Mühendislik") emp.dept = "Merkez Ofis";
    else if (emp.dept === "Finans") emp.dept = "Muhasebe";
    else if (emp.dept === "Yönetim") emp.dept = "İK";

    if (!emp.birthDate) {
        if (emp.id === "emp-1") emp.birthDate = "1985-05-15";
        else if (emp.id === "emp-2") emp.birthDate = "1972-08-10";
        else if (emp.id === "emp-3") emp.birthDate = "1994-03-24";
        else if (emp.id === "emp-4") emp.birthDate = "1990-12-05";
        else if (emp.id === "emp-5") emp.birthDate = "2008-10-12";
        else if (emp.id === "emp-6") emp.birthDate = "1968-04-30";
        else emp.birthDate = "1990-01-01";
    }
    if (!emp.education) {
        if (emp.id === "emp-2" || emp.id === "emp-5") emp.education = "Lise";
        else if (emp.id === "emp-6") emp.education = "Ön Lisans";
        else emp.education = "Lisans";
    }
    if (!emp.tckn) {
        if (emp.id === "emp-1") emp.tckn = "10000000146";
        else if (emp.id === "emp-2") emp.tckn = "10000000214";
        else if (emp.id === "emp-3") emp.tckn = "10000000382";
        else if (emp.id === "emp-4") emp.tckn = "10000000450";
        else if (emp.id === "emp-5") emp.tckn = "10000000528";
        else if (emp.id === "emp-6") emp.tckn = "10000000696";
        else emp.tckn = generateValidTCKN();
    }
    // Split name and lastname if not present
    if (!emp.lastname && emp.name) {
        const parts = emp.name.trim().split(" ");
        if (parts.length > 1) {
            emp.lastname = parts.pop();
            emp.name = parts.join(" ");
        } else {
            emp.lastname = "";
        }
    }
    // Clean up old or broken avatar images, fallback to Base64 icons (all maleAvatar as requested)
    emp.avatar = maleAvatar;
    if (!emp.authority) emp.authority = "employee";
    if (!emp.password) emp.password = "123456";
    emp.leaveLimit = calculateLegalLeaveLimit(emp.birthDate, emp.hireDate);
});
saveState();

// --- GLOBALLER & SEÇİLMİŞ ÇALIŞAN ---
let selectedEmployeeIdForDocs = state.employees.length > 0 ? state.employees[0].id : null;
let currentPuantajYear = 2026;
let currentPuantajMonth = 5; // Haziran (0-indexed: 5)
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// --- UYGULAMA İLKLENDİRME ---
function renderAnnouncements() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    // Show/hide announcement button
    const btnAddAnn = document.getElementById("btn-add-announcement");
    if (btnAddAnn) {
        if (role === "admin") {
            btnAddAnn.style.display = "block";
        } else {
            btnAddAnn.style.display = "none";
        }
    }
    
    const listContainer = document.getElementById("dashboard-announcements-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    if (!state.announcements || state.announcements.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Herhangi bir duyuru bulunmuyor.</div>`;
        return;
    }
    
    const sorted = [...state.announcements].sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
        return numB - numA;
    });
    sorted.forEach((ann, idx) => {
        const isLast = idx === sorted.length - 1;
        const borderStyle = isLast ? "" : "border-bottom:1px solid var(--border-color);padding-bottom:12px;";
        const dateStr = ann.date ? new Date(ann.date).toLocaleDateString("tr-TR") : "";
        const publisherStr = ann.publisher || "Admin";
        
        const deleteButtonHtml = role === "admin" ? `
            <button class="btn-danger-outline" onclick="deleteAnnouncement('${ann.id}')" style="padding: 2px 6px; font-size: 10px; height: auto; min-height: auto; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; border-color: rgba(255,88,88,0.2); color: #ff5858; cursor: pointer;">
                <svg viewBox="0 0 24 24" style="width:10px; height:10px; fill:none; stroke:currentColor; stroke-width:2.5;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Sil
            </button>
        ` : "";
        
        listContainer.insertAdjacentHTML("beforeend", `
            <div style="${borderStyle}">
                <h4 style="font-size:14px;font-weight:600;margin-bottom:4px;color:var(--text-main);">${ann.title}</h4>
                <p style="font-size:12px;color:var(--text-muted);margin-bottom:6px;line-height:1.5;">${ann.content}</p>
                <div style="font-size:10px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center;">
                    <span>Yayınlayan: <strong>${publisherStr}</strong></span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${dateStr}</span>
                        ${deleteButtonHtml}
                    </div>
                </div>
            </div>
        `);
    });
}

function deleteAnnouncement(annId) {
    const confirmDelete = confirm("Bu duyuruyu silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;
    
    state.announcements = state.announcements.filter(a => a.id !== annId);
    saveState();
    renderAnnouncements();
}
window.deleteAnnouncement = deleteAnnouncement;


document.addEventListener("DOMContentLoaded", () => {
    // Supabase startup
    const storedUrl = localStorage.getItem("gl_supabase_url") || AUTO_SUPABASE_URL;
    const storedKey = localStorage.getItem("gl_supabase_key") || AUTO_SUPABASE_KEY;
    
    if (storedUrl && storedKey) {
        // Automatically save to local storage if not already set, so all configuration logic works
        if (!localStorage.getItem("gl_supabase_url")) {
            localStorage.setItem("gl_supabase_url", storedUrl);
        }
        if (!localStorage.getItem("gl_supabase_key")) {
            localStorage.setItem("gl_supabase_key", storedKey);
        }
        
        if (initSupabase(storedUrl, storedKey)) {
            startRealTimeSync();
        }
    }

    checkAuthentication();
    initTheme();
    initNavigation();
    initPuantajDefaultData();
    initPersonelView();
    populateMonthSelectDropdown();
    
    // Ilk render işlemleri
    renderDashboard();
    renderPersonelList();
    renderOzlukEmployeeList();
    renderOzlukDocuments();
    renderPuantaj();
    renderLeaveRequests();
    renderIzinModule();
    populateLeaveEmployeeSelect();
    populateBordroEmployeeSelect();

    // Event Dinleyicilerini Ekle
    setupEventListeners();
});

// --- SIMULATED EMAIL NOTIFICATION SERVICE ---
function sendSimulatedEmail(emp, password) {
    if (!emp) return;
    document.getElementById("sim-email-to").textContent = `${emp.name} <${emp.email || 'belirtilmemis@gulnasinsaat.com'}>`;
    document.getElementById("sim-email-name").textContent = emp.name;
    document.getElementById("sim-email-user").textContent = emp.email || emp.tckn;
    document.getElementById("sim-email-pass").textContent = password;
    
    document.getElementById("modal-email-simulation").classList.add("active");
}

// --- AUTHENTICATION (OTURUM YÖNETİMİ) ---
function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem("gl_logged_in") === "true";
    const overlay = document.getElementById("login-overlay");
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    if (isLoggedIn && empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (!emp || emp.status === "passive") {
            handleLogout();
            alert("Hesabınız devre dışı bırakılmış veya silinmiştir!");
            return;
        }
    }
    
    if (!isLoggedIn) {
        overlay.classList.remove("hidden");
    } else {
        overlay.classList.add("hidden");
        updateHeaderManagerInfo();
        applyRoleRestrictions();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("login-username").value.trim().toLowerCase();
    const passVal = document.getElementById("login-password").value.trim();
    const errorMsg = document.getElementById("login-error-msg");

    // 1. Check Super Admin login
    const manager = state.manager || defaultManager;
    const managerUsername = String(manager.username || '').trim().toLowerCase();
    const managerPassword = String(manager.password || '').trim();

    if (userVal === managerUsername && passVal === managerPassword) {
        sessionStorage.setItem("gl_logged_in", "true");
        sessionStorage.setItem("gl_logged_in_role", "admin");
        sessionStorage.removeItem("gl_logged_employee_id");
        document.getElementById("login-overlay").classList.add("hidden");
        errorMsg.style.display = "none";
        
        loginRefreshAll();
        return;
    }

    // 2. Check Employee login (matches email or TCKN)
    const emp = state.employees.find(e => 
        e.status !== "passive" && 
        ((e.email && e.email.toLowerCase().trim() === userVal) || (e.tckn && e.tckn.trim() === userVal)) && 
        e.password === passVal
    );

    if (emp) {
        sessionStorage.setItem("gl_logged_in", "true");
        sessionStorage.setItem("gl_logged_in_role", emp.authority || "employee");
        sessionStorage.setItem("gl_logged_employee_id", emp.id);
        document.getElementById("login-overlay").classList.add("hidden");
        errorMsg.style.display = "none";
        
        loginRefreshAll();
    } else {
        errorMsg.style.display = "block";
        errorMsg.textContent = "Kullanıcı adı/E-posta veya şifre hatalı!";
    }
}

function loginRefreshAll() {
    updateHeaderManagerInfo();
    applyRoleRestrictions();
    
    renderDashboard();
    renderPersonelList();
    renderOzlukEmployeeList();
    renderOzlukDocuments();
    renderPuantaj();
    renderLeaveRequests();
    renderIzinModule();
    
    populateLeaveEmployeeSelect();
    populateBordroEmployeeSelect();
}

function handleLogout() {
    sessionStorage.removeItem("gl_logged_in");
    sessionStorage.removeItem("gl_logged_in_role");
    sessionStorage.removeItem("gl_logged_employee_id");
    checkAuthentication();
    document.getElementById("form-login").reset();
}

function updateHeaderManagerInfo() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    if (empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            document.getElementById("header-user-name").textContent = `${emp.name} ${emp.lastname || ''}`;
            const authorityLabel = emp.authority === "admin" ? "Müdür" : "Personel";
            document.getElementById("header-user-role").textContent = `${emp.role} (${authorityLabel})`;
            document.getElementById("header-avatar").src = getEmployeeAvatar(emp);
            return;
        }
    }
    
    const manager = state.manager || defaultManager;
    const fullName = `${manager.name || ''} ${manager.lastname || ''}`;
    document.getElementById("header-user-name").textContent = fullName.trim() || "Yönetici";
    document.getElementById("header-user-role").textContent = manager.role || "İK Yöneticisi";
    if (manager.avatar) {
        document.getElementById("header-avatar").src = manager.avatar;
    }
}

function applyRoleRestrictions() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    const menuPersonel = document.getElementById("menu-personel");
    const menuPuantaj = document.getElementById("menu-puantaj");
    const menuOzluk = document.getElementById("menu-ozluk");
    const menuIzin = document.getElementById("menu-izin");
    
    if (role === "employee" && empId) {
        // Hide Admin-only sidebar menus
        if (menuPersonel) menuPersonel.style.display = "none";
        if (menuPuantaj) menuPuantaj.style.display = "none";
        
        // Custom labels for employee portal
        if (menuOzluk) menuOzluk.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Özlük Dosyalarım`;
        if (menuIzin) menuIzin.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> İzin Taleplerim`;
        
        // Redirect if currently on a hidden menu
        const activeNav = document.querySelector(".nav-item.active");
        if (activeNav) {
            const currentView = activeNav.getAttribute("data-view");
            if (currentView === "personel" || currentView === "puantaj") {
                const dashboardMenu = document.getElementById("menu-dashboard");
                if (dashboardMenu) dashboardMenu.click();
            }
        }
        
        // Hide employee list in Özlük view
        const ozlukSidebar = document.querySelector(".ozluk-sidebar");
        if (ozlukSidebar) ozlukSidebar.style.display = "none";
        
        // Force employee selection
        selectedEmployeeIdForDocs = empId;
    } else {
        // Show Admin menus
        if (menuPersonel) menuPersonel.style.display = "";
        if (menuPuantaj) menuPuantaj.style.display = "";
        
        // Restore menus for admin
        if (menuOzluk) menuOzluk.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Özlük Dosyaları`;
        if (menuIzin) menuIzin.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> İzin Talepleri`;
        
        // Show sidebar in Ozluk
        const ozlukSidebar = document.querySelector(".ozluk-sidebar");
        if (ozlukSidebar) ozlukSidebar.style.display = "";
    }
}

// --- AY/YIL AÇILIR LİSTE ENTEGRASYONU ---
function populateMonthSelectDropdown() {
    const select = document.getElementById("puantaj-month-select");
    if (!select) return;
    select.innerHTML = "";
    
    // 2026 yılı ayları
    for (let m = 0; m < 12; m++) {
        const option = document.createElement("option");
        option.value = `${currentPuantajYear}-${m}`;
        option.textContent = `${monthNames[m]} ${currentPuantajYear}`;
        if (m === currentPuantajMonth) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

// --- TEMA YÖNETİMİ ---
function initTheme() {
    const isLight = localStorage.getItem("theme-light") === "true";
    const body = document.body;
    const icon = document.getElementById("theme-icon");
    const text = document.getElementById("theme-text");

    if (isLight) {
        body.classList.add("light-theme");
        text.textContent = "Karanlık Mod";
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`; // Moon icon
    } else {
        body.classList.remove("light-theme");
        text.textContent = "Aydınlık Mod";
        icon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`; // Sun icon
    }
}

function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle("light-theme");
    localStorage.setItem("theme-light", isLight);
    initTheme();
}

// --- NAVİGASYON ---
function switchView(viewName) {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    if (role === "employee" && (viewName === "personel" || viewName === "puantaj")) {
        viewName = "dashboard";
    }

    // Hide all page views
    document.querySelectorAll(".page-view").forEach(view => {
        view.classList.remove("active");
    });
    
    // Show target page view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add("active");
    }
    
    // Update desktop sidebar active status
    document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        }
    });
    
    // Update mobile bottom nav active status
    document.querySelectorAll(".mobile-bottom-nav .bottom-nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        }
    });
    
    // Update title
    const pageTitleMap = {
        "dashboard": "Ana Panel",
        "personel": "Personel Kartları",
        "ozluk": "Özlük Dosyaları",
        "puantaj": "Puantaj Cetveli",
        "izin": "İzin Talepleri",
        "profil": "Profilim"
    };
    const titleEl = document.getElementById("page-current-title");
    if (titleEl) {
        titleEl.textContent = pageTitleMap[viewName] || "Yönetim Paneli";
    }
    
    // Update FAB Visibility
    updateMobileFABVisibility(viewName);
    
    // Trigger corresponding rendering functions
    if (viewName === "dashboard") {
        renderDashboard();
    } else if (viewName === "personel") {
        renderPersonelList();
    } else if (viewName === "ozluk") {
        renderOzlukEmployeeList();
        renderOzlukDocuments();
    } else if (viewName === "puantaj") {
        renderPuantaj();
        populateMonthSelectDropdown();
    } else if (viewName === "izin") {
        renderLeaveRequests();
        renderIzinModule();
    } else if (viewName === "profil") {
        updateMobileProfileView();
    }
}

function updateMobileFABVisibility(viewName) {
    const fabBtn = document.getElementById("btn-mobile-fab");
    if (!fabBtn) return;
    
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    
    if (viewName === "dashboard") {
        if (role === "admin") {
            fabBtn.style.display = "flex";
            fabBtn.title = "Duyuru Yayınla";
        } else {
            fabBtn.style.display = "none";
        }
    } else if (viewName === "personel") {
        if (role === "admin") {
            fabBtn.style.display = "flex";
            fabBtn.title = "Personel Ekle";
        } else {
            fabBtn.style.display = "none";
        }
    } else if (viewName === "izin") {
        fabBtn.style.display = "flex";
        fabBtn.title = "İzin Talebi Oluştur";
    } else {
        fabBtn.style.display = "none";
    }
}

function updateMobileProfileView() {
    const mobileProfileName = document.getElementById("mobile-profile-name");
    const mobileProfileRole = document.getElementById("mobile-profile-role");
    const mobileProfileAvatar = document.getElementById("mobile-profile-avatar");
    
    if (!mobileProfileName || !mobileProfileRole || !mobileProfileAvatar) return;
    
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    if (empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            mobileProfileName.textContent = `${emp.name} ${emp.lastname || ''}`;
            const authorityLabel = emp.authority === "admin" ? "Müdür" : "Personel";
            mobileProfileRole.textContent = `${emp.role} (${authorityLabel})`;
            mobileProfileAvatar.src = getEmployeeAvatar(emp);
        }
    } else {
        const manager = state.manager || defaultManager;
        const fullName = `${manager.name || ''} ${manager.lastname || ''}`;
        mobileProfileName.textContent = fullName.trim() || "Yönetici";
        mobileProfileRole.textContent = manager.role || "İK Yöneticisi";
        if (manager.avatar) {
            mobileProfileAvatar.src = manager.avatar;
        }
    }
}

function updateMobileDashboardGreeting() {
    const greetingTextEl = document.querySelector("#mobile-dashboard-greeting-card .greeting-text");
    if (!greetingTextEl) return;
    
    const hour = new Date().getHours();
    let greeting = "İyi Günler";
    let emoji = "☀️";
    
    if (hour >= 5 && hour < 12) {
        greeting = "Günaydın";
        emoji = "🌅";
    } else if (hour >= 12 && hour < 17) {
        greeting = "İyi Günler";
        emoji = "☀️";
    } else if (hour >= 17 && hour < 22) {
        greeting = "İyi Akşamlar";
        emoji = "🌙";
    } else {
        greeting = "İyi Geceler";
        emoji = "🌌";
    }
    
    let name = "Yönetici";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    if (empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            name = emp.name;
        }
    } else {
        const manager = state.manager || defaultManager;
        if (manager && manager.name) {
            name = manager.name;
        }
    }
    
    greetingTextEl.innerHTML = `${greeting}, <span id="mobile-greeting-username">${name}</span> <span id="mobile-greeting-emoji">${emoji}</span>`;
    
    // Update system status indicator in the greeting card
    const mobileStatusIndicator = document.getElementById("mobile-system-status");
    if (mobileStatusIndicator) {
        if (typeof supabaseInitialized !== 'undefined' && supabaseInitialized) {
            mobileStatusIndicator.innerHTML = '<span class="status-dot-green"></span> SİSTEM ÇEVRİMİÇİ';
            mobileStatusIndicator.className = "system-status-indicator active";
        } else {
            mobileStatusIndicator.innerHTML = '<span class="status-dot-blue"></span> YEREL MOD';
            mobileStatusIndicator.className = "system-status-indicator local";
        }
    }
}

function initNavigation() {
    // Desktop navigation click handlers
    document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const viewName = item.getAttribute("data-view");
            if (viewName) {
                switchView(viewName);
            }
        });
    });
    
    // Mobile bottom navigation click handlers
    document.querySelectorAll(".mobile-bottom-nav .bottom-nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const viewName = item.getAttribute("data-view");
            if (viewName) {
                switchView(viewName);
            }
        });
    });
    
    // Mobile FAB Click Handler
    const fabBtn = document.getElementById("btn-mobile-fab");
    if (fabBtn) {
        fabBtn.addEventListener("click", () => {
            const activeView = document.querySelector(".page-view.active");
            if (!activeView) return;
            const viewId = activeView.id.replace("view-", "");
            
            if (viewId === "personel") {
                openPersonelModal(false);
            } else if (viewId === "izin") {
                const leaveForm = document.getElementById("form-request-leave");
                if (leaveForm) {
                    leaveForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const formCard = leaveForm.closest(".glass-card");
                    if (formCard) {
                        formCard.classList.add("flash-highlight");
                        setTimeout(() => formCard.classList.remove("flash-highlight"), 2000);
                    }
                }
            } else if (viewId === "dashboard") {
                const formAnn = document.getElementById("form-announcement");
                if (formAnn) {
                    formAnn.reset();
                    document.getElementById("modal-announcement").classList.add("active");
                }
            }
        });
    }
    
    // Mobile Profile buttons mapping
    const btnMobileEditProfile = document.getElementById("btn-mobile-edit-profile");
    if (btnMobileEditProfile) {
        btnMobileEditProfile.addEventListener("click", openProfileModal);
    }
    
    const btnMobileCloudSettings = document.getElementById("btn-mobile-cloud-settings");
    if (btnMobileCloudSettings) {
        btnMobileCloudSettings.addEventListener("click", () => {
            const btnCloud = document.getElementById("btn-cloud-status");
            if (btnCloud) btnCloud.click();
        });
    }
    
    const btnMobileLogout = document.getElementById("btn-mobile-logout");
    if (btnMobileLogout) {
        btnMobileLogout.addEventListener("click", handleLogout);
    }
    
    // Sync default view on load
    const activeNav = document.querySelector(".nav-menu .nav-item.active");
    const defaultView = activeNav ? activeNav.getAttribute("data-view") : "dashboard";
    switchView(defaultView);
    
    // Initialize Dashboard greeting
    updateMobileDashboardGreeting();
}

// --- GÖRÜNÜM SEÇİCİ (KART / LİSTE) ---
function initPersonelView() {
    const btnGrid = document.getElementById("btn-view-grid");
    const btnList = document.getElementById("btn-view-list");
    
    if (state.personelView === "list") {
        btnGrid.classList.remove("active");
        btnList.classList.add("active");
        document.getElementById("personel-cards-container").classList.add("hidden");
        document.getElementById("personel-list-container").classList.add("active");
    } else {
        btnGrid.classList.add("active");
        btnList.classList.remove("active");
        document.getElementById("personel-cards-container").classList.remove("hidden");
        document.getElementById("personel-list-container").classList.remove("active");
    }
}

function switchPersonelView(viewType) {
    state.personelView = viewType;
    localStorage.setItem("gl_personel_view", viewType);
    initPersonelView();
    renderPersonelList();
}

// --- PUANTAJ VERİ YAPISI & YARDIMCI PROGRAMLAR ---
function getAttendanceInfo(empId, dateStr) {
    const record = state.attendance[empId]?.[dateStr] || "";
    if (typeof record === "string") {
        return { status: record, overtimeHours: 0 };
    }
    return {
        status: record.status || "",
        overtimeHours: Number(record.overtimeHours) || 0
    };
}

// --- PUANTAJ VARSAYILAN VERİ ÜRETİMİ ---
function initPuantajDefaultData() {
    const daysInMonth = new Date(currentPuantajYear, currentPuantajMonth + 1, 0).getDate();
    state.employees.forEach(emp => {
        if (!state.attendance[emp.id]) {
            state.attendance[emp.id] = {};
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentPuantajYear}-${String(currentPuantajMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (!state.attendance[emp.id][dateStr]) {
                state.attendance[emp.id][dateStr] = { status: "", overtimeHours: 0 };
            }
        }
    });
    saveState();
}

// --- YENİ YARDIMCI FONKSİYONLAR: TARİH BAZLI PERSONEL VE MAAŞ HESAPLAMA ---
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showEmployeeInMonth(emp, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    const hireDate = emp.hireDate || "";
    const termDate = emp.terminationDate || "";
    
    // İşe giriş tarihi seçilen ayın son gününden küçük veya eşit olmalı
    // Ve durumu pasif değilse, ya da pasifse işten çıkış tarihi seçilen ayın ilk gününden büyük veya eşit olmalı
    const wasEmployed = (hireDate <= lastDayStr) && (emp.status !== "passive" || !termDate || termDate >= firstDayStr);
    
    // Güvenlik önlemi: Eğer çalışanın o aya ait herhangi bir puantaj kaydı varsa da göster
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const hasAttendance = state.attendance[emp.id] && Object.keys(state.attendance[emp.id]).some(dateStr => dateStr.startsWith(currentMonthPrefix));
    
    return wasEmployed || hasAttendance;
}

function getCalculatedSalaryForMonth(emp, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    let countWork = 0;
    let countLeave = 0;
    let countReport = 0;
    let countAbsent = 0;
    let totalOvertimeHours = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
        const info = getAttendanceInfo(emp.id, dateStr);
        
        if (info.status === "Ç") countWork++;
        else if (info.status === "İ") countLeave++;
        else if (info.status === "R") countReport++;
        else if (info.status === "D") countAbsent++;
        
        totalOvertimeHours += info.overtimeHours;
    }
    
    const workedDaysCount = countWork + countLeave + countReport;
    const netBase = emp.salary || 0;
    const dailyWage = netBase / 30;
    const baseEarned = Math.min(netBase, workedDaysCount * dailyWage);
    const overtimePay = totalOvertimeHours * (emp.overtimeRate || 250);
    const earnedSalary = Math.max(0, Math.round(baseEarned + overtimePay));
    
    return earnedSalary;
}

// --- TARİH VE GÜN HESAPLAMA MOTORU ---
function calculateWorkedDays(hireDateStr, terminationDateStr) {
    if (!hireDateStr) return 0;
    
    const hireDate = new Date(hireDateStr);
    hireDate.setHours(0, 0, 0, 0);

    const endDate = terminationDateStr ? new Date(terminationDateStr) : new Date();
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - hireDate;
    if (diffTime < 0) return 0;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// --- UYARI PANELİNE KAYDIRMA VE PARLATMA ---
function scrollToAlerts() {
    const dashboardMenu = document.getElementById("menu-dashboard");
    if (dashboardMenu && !dashboardMenu.classList.contains("active")) {
        dashboardMenu.click();
    }

    setTimeout(() => {
        const alertsPanel = document.getElementById("dashboard-alerts-panel");
        if (alertsPanel) {
            alertsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            alertsPanel.classList.add("flash-highlight");
            
            setTimeout(() => {
                alertsPanel.classList.remove("flash-highlight");
            }, 3000);
        }
    }, 100);
}

// --- RENDER: DASHBOARD (ANA PANEL) ---
function renderDashboard() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    if (role === "employee" && empId) {
        renderEmployeeDashboard(empId);
        return;
    }

    // Restore labels for Admin
    const labelTotal = document.querySelector("#widget-total-employees .widget-label");
    const labelLeave = document.querySelector("#widget-on-leave .widget-label");
    const labelDocs = document.querySelector("#widget-expiring-docs .widget-label");
    const labelPaid = document.querySelector("#widget-salary-paid .widget-label");
    const labelEst = document.querySelector("#widget-salary-estimate .widget-label");
    const labelHours = document.querySelector("#widget-salary-estimate + .widget-card .widget-label");
    
    if (labelTotal) labelTotal.textContent = "Toplam Personel";
    if (labelLeave) labelLeave.textContent = "İzinli Personel";
    if (labelDocs) labelDocs.textContent = "Süresi Yaklaşan Belge";
    if (labelPaid) labelPaid.textContent = "Son Ay Ödenen Maaş";
    if (labelEst) labelEst.textContent = "Bu Ay Ödenecek Maaş";
    if (labelHours) labelHours.textContent = "Aylık Toplam Mesai (Saat)";

    const activeEmployees = state.employees.filter(e => e.status !== "passive");
    document.getElementById("stat-total-employees").textContent = activeEmployees.length;

    const onLeaveCount = activeEmployees.filter(e => e.status === "leave").length;
    document.getElementById("stat-on-leave").textContent = onLeaveCount;

    let alertCount = 0;
    const alertsListContainer = document.getElementById("dashboard-alerts-list");
    alertsListContainer.innerHTML = "";

    const activeAlerts = [];

    state.documents.forEach(doc => {
        const emp = activeEmployees.find(e => e.id === doc.employeeId);
        if (!emp) return;

        const info = getDocumentStatus(doc.expiryDate);
        if (info.status === "Expired" || info.status === "Expiring") {
            alertCount++;
            activeAlerts.push({
                employeeName: `${emp.name} ${emp.lastname || ''}`,
                avatar: getEmployeeAvatar(emp),
                docType: doc.type,
                fileName: doc.fileName,
                daysLeft: info.daysLeft,
                status: info.status
            });
        }
    });
    
    // Render dynamic announcements
    renderAnnouncements();

    document.getElementById("stat-expiring-docs").textContent = alertCount;
    document.getElementById("notification-count").textContent = alertCount;

    const pendingLeaves = state.leaveRequests.filter(r => r.status === "pending").length;
    document.getElementById("balance-pending-count").textContent = pendingLeaves;

    // Aylık Toplam Çalışma Saati ve Fazla Mesaileri hesapla
    let totalWorkDays = 0;
    let totalOvertimeHours = 0;
    const currentMonthPrefix = `${currentPuantajYear}-${String(currentPuantajMonth + 1).padStart(2, '0')}`;
    const currentMonthEmployees = state.employees.filter(e => showEmployeeInMonth(e, currentPuantajYear, currentPuantajMonth));
    
    Object.entries(state.attendance).forEach(([empId, empAttendance]) => {
        const emp = currentMonthEmployees.find(e => e.id === empId);
        if (emp) {
            Object.entries(empAttendance).forEach(([dateStr, record]) => {
                if (dateStr.startsWith(currentMonthPrefix)) {
                    const info = getAttendanceInfo(empId, dateStr);
                    if (info.status === "Ç") {
                        totalWorkDays++;
                    }
                    totalOvertimeHours += info.overtimeHours;
                }
            });
        }
    });
    
    // Toplam mesai saati = normal çalışma saati (Ç * 8) + fazla mesai saatleri
    document.getElementById("stat-timesheet-hours").textContent = (totalWorkDays * 8) + totalOvertimeHours;

    // --- DINAMIK MAAŞ HESAPLAMA (DASHBOARD FINANSAL KARTLARI) ---
    // 1. Bu Ay Ödenecek Toplam Maaş (Puantajdan çekilir)
    let futureSalaryTotal = 0;
    currentMonthEmployees.forEach(emp => {
        futureSalaryTotal += getCalculatedSalaryForMonth(emp, currentPuantajYear, currentPuantajMonth);
    });
    document.getElementById("stat-salary-estimate").textContent = futureSalaryTotal.toLocaleString("tr-TR") + " TL";

    // 2. Son Ay Ödenen Maaş: Bir önceki ayın puantaj cetvelindeki net hakedişlerin ve mesai ödemelerinin toplamı
    let prevMonth = currentPuantajMonth - 1;
    let prevYear = currentPuantajYear;
    if (prevMonth < 0) {
        prevMonth = 11;
        prevYear = currentPuantajYear - 1;
    }
    let pastSalaryTotal = 0;
    state.employees.forEach(emp => {
        if (showEmployeeInMonth(emp, prevYear, prevMonth)) {
            pastSalaryTotal += getCalculatedSalaryForMonth(emp, prevYear, prevMonth);
        }
    });
    document.getElementById("stat-salary-paid").textContent = pastSalaryTotal.toLocaleString("tr-TR") + " TL";

    // Bildirim Listesi Render
    if (activeAlerts.length === 0) {
        alertsListContainer.innerHTML = `
            <div class="alert-item success">
                <div class="alert-details">
                    <div class="alert-text">✓ Tüm aktif çalışanların kritik evrakları (MYK, Sağlık Raporu vb.) güncel durumda!</div>
                </div>
            </div>`;
    } else {
        activeAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
        activeAlerts.forEach(alert => {
            const isExpired = alert.status === "Expired";
            const badgeClass = isExpired ? "danger" : "warning";
            const itemClass = isExpired ? "" : "warning";
            const text = isExpired 
                ? `<strong>${alert.employeeName}</strong> çalışanının <strong>${alert.docType}</strong> geçerlilik süresi dolmuş!`
                : `<strong>${alert.employeeName}</strong> çalışanının <strong>${alert.docType}</strong> süresi dolmak üzere!`;
            
            const metaText = isExpired
                ? `Süresi ${Math.abs(alert.daysLeft)} gün önce bitti`
                : `${alert.daysLeft} gün kaldı`;

            const alertHtml = `
                <div class="alert-item ${itemClass}">
                    <img src="${alert.avatar || 'https://via.placeholder.com/150'}" alt="${alert.employeeName}" class="alert-avatar">
                    <div class="alert-details">
                        <div class="alert-text">${text}</div>
                        <div class="alert-meta">
                            <span>Dosya: ${alert.fileName}</span>
                            <span class="days-left-badge ${badgeClass}">${metaText}</span>
                        </div>
                    </div>
                </div>
            `;
            alertsListContainer.insertAdjacentHTML("beforeend", alertHtml);
        });
    }
}

function renderEmployeeDashboard(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    // Reset/change labels and values to Employee-specific dashboard
    const labelTotal = document.querySelector("#widget-total-employees .widget-label");
    const labelLeave = document.querySelector("#widget-on-leave .widget-label");
    const labelDocs = document.querySelector("#widget-expiring-docs .widget-label");
    const labelPaid = document.querySelector("#widget-salary-paid .widget-label");
    const labelEst = document.querySelector("#widget-salary-estimate .widget-label");
    const labelHours = document.querySelector("#widget-salary-estimate + .widget-card .widget-label");
    
    if (labelTotal) labelTotal.textContent = "Kıdemim";
    if (labelLeave) labelLeave.textContent = "Kalan Yıllık İzin";
    if (labelDocs) labelDocs.textContent = "Özlük Belgelerim";
    if (labelPaid) labelPaid.textContent = "Aylık Net Maaşım";
    if (labelEst) labelEst.textContent = "Bu Ayki Hakedişim";
    if (labelHours) labelHours.textContent = "Bu Ayki Fazla Mesaim";

    // 1. Worked Days (Kıdem)
    const workedDays = calculateWorkedDays(emp.hireDate, emp.terminationDate);
    let tenureText = `${workedDays} Gün`;
    if (workedDays >= 365) {
        const years = Math.floor(workedDays / 365);
        const remainingDays = workedDays % 365;
        const months = Math.floor(remainingDays / 30);
        if (months > 0) {
            tenureText = `${years} Yıl ${months} Ay`;
        } else {
            tenureText = `${years} Yıl`;
        }
    }
    document.getElementById("stat-total-employees").textContent = tenureText;

    // 2. Kalan İzin
    let usedYillik = 0;
    state.leaveRequests.forEach(req => {
        if (req.employeeId === emp.id && req.status === "approved" && req.type === "Yıllık İzin") {
            usedYillik += calculateLeaveDays(req.startDate, req.endDate);
        }
    });
    const limit = emp.leaveLimit || 14;
    const remainingLeave = Math.max(0, limit - usedYillik);
    document.getElementById("stat-on-leave").textContent = `${remainingLeave} Gün`;

    // 3. Özlük Belgelerim
    const empDocs = state.documents.filter(d => d.employeeId === emp.id);
    document.getElementById("stat-expiring-docs").textContent = `${empDocs.length} Belge`;

    // 4. Net Maaş
    document.getElementById("stat-salary-paid").textContent = (emp.salary || 0).toLocaleString("tr-TR") + " TL";

    // 5 & 6. Attendance & Overtime calculation for current month
    let countWork = 0;
    let countLeave = 0;
    let countReport = 0;
    let empOvertimeHours = 0;
    const currentMonthPrefix = `${currentPuantajYear}-${String(currentPuantajMonth + 1).padStart(2, '0')}`;

    const empAttendance = state.attendance[emp.id] || {};
    const daysInMonth = new Date(currentPuantajYear, currentPuantajMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
        const info = getAttendanceInfo(emp.id, dateStr);
        if (info.status === "Ç") countWork++;
        else if (info.status === "İ") countLeave++;
        else if (info.status === "R") countReport++;
        
        empOvertimeHours += info.overtimeHours;
    }

    const workedDaysCount = countWork + countLeave + countReport;
    const baseEarned = Math.min(emp.salary || 0, workedDaysCount * ((emp.salary || 0) / 30));
    const overtimeEarnings = empOvertimeHours * (emp.overtimeRate || 250);
    const earnedSalary = Math.max(0, Math.round(baseEarned + overtimeEarnings));

    document.getElementById("stat-salary-estimate").textContent = earnedSalary.toLocaleString("tr-TR") + " TL";
    document.getElementById("stat-timesheet-hours").textContent = `${empOvertimeHours} Saat`;

    // Alerts List (Only for this employee)
    let alertCount = 0;
    const alertsListContainer = document.getElementById("dashboard-alerts-list");
    alertsListContainer.innerHTML = "";

    const activeAlerts = [];
    empDocs.forEach(doc => {
        const info = getDocumentStatus(doc.expiryDate);
        if (info.status === "Expired" || info.status === "Expiring") {
            alertCount++;
            activeAlerts.push({
                docType: doc.type,
                fileName: doc.fileName,
                daysLeft: info.daysLeft,
                status: info.status
            });
        }
    });

    document.getElementById("notification-count").textContent = alertCount;

    // Render dynamic announcements
    renderAnnouncements();

    if (activeAlerts.length === 0) {
        alertsListContainer.innerHTML = `
            <div class="alert-item success">
                <div class="alert-details" style="padding-left: 0;">
                    <div class="alert-text">✓ Tüm özlük belgeleriniz (MYK, Sağlık Raporu vb.) güncel durumda!</div>
                </div>
            </div>`;
    } else {
        activeAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
        activeAlerts.forEach(alert => {
            const isExpired = alert.status === "Expired";
            const badgeClass = isExpired ? "danger" : "warning";
            const itemClass = isExpired ? "" : "warning";
            const text = isExpired 
                ? `<strong>${alert.docType}</strong> belgenizin geçerlilik süresi dolmuş!`
                : `<strong>${alert.docType}</strong> belgenizin süresi dolmak üzere!`;
            
            const metaText = isExpired
                ? `Süresi ${Math.abs(alert.daysLeft)} gün önce bitti`
                : `${alert.daysLeft} gün kaldı`;

            const alertHtml = `
                <div class="alert-item ${itemClass}">
                    <div class="alert-details" style="padding-left: 0;">
                        <div class="alert-text">${text}</div>
                        <div class="alert-meta">
                            <span>Dosya: ${alert.fileName}</span>
                            <span class="days-left-badge ${badgeClass}">${metaText}</span>
                        </div>
                    </div>
                </div>
            `;
            alertsListContainer.insertAdjacentHTML("beforeend", alertHtml);
        });
    }

    // Hide general pending leaves indicator if it exists
    const pendingLeavesCard = document.getElementById("balance-pending-count");
    if (pendingLeavesCard) {
        const pendingCount = state.leaveRequests.filter(r => r.employeeId === emp.id && r.status === "pending").length;
        pendingLeavesCard.textContent = pendingCount;
    }
}


// --- RENDER: PERSONEL KARTLARI / LİSTESİ ---
function renderPersonelList() {
    const cardContainer = document.getElementById("personel-cards-container");
    const tableBody = document.getElementById("personel-table-rows");

    cardContainer.innerHTML = "";
    tableBody.innerHTML = "";

    const searchVal = document.getElementById("personel-search").value.toLowerCase();
    const deptFilter = document.getElementById("personel-dept-filter").value;

    const filtered = state.employees.filter(emp => {
        const fullName = `${emp.name} ${emp.lastname || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchVal) ||
                              emp.role.toLowerCase().includes(searchVal) ||
                              emp.dept.toLowerCase().includes(searchVal);
        
        let matchesDept = false;
        if (deptFilter === "all") {
            matchesDept = emp.status !== "passive";
        } else if (deptFilter === "passive") {
            matchesDept = emp.status === "passive";
        } else {
            matchesDept = emp.dept === deptFilter && emp.status !== "passive";
        }

        return matchesSearch && matchesDept;
    });

    if (filtered.length === 0) {
        const emptyMsg = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Gösterilecek personel bulunamadı.</div>`;
        cardContainer.innerHTML = emptyMsg;
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--text-muted)">Gösterilecek personel bulunamadı.</td></tr>`;
        return;
    }

    filtered.forEach(emp => {
        let statusClass = "active";
        let statusText = "Aktif (Çalışıyor)";
        if (emp.status === "leave") {
            statusClass = "leave";
            statusText = "İzinli";
        } else if (emp.status === "report") {
            statusClass = "report";
            statusText = "Raporlu";
        } else if (emp.status === "passive") {
            statusClass = "passive";
            statusText = "Pasif (İşten Çıkarıldı)";
        }

        const isPassive = emp.status === "passive";
        const workedDays = calculateWorkedDays(emp.hireDate, emp.terminationDate);

        const hasWarning = state.documents.some(doc => {
            if (doc.employeeId !== emp.id) return false;
            const statusInfo = getDocumentStatus(doc.expiryDate);
            return statusInfo.status === "Expired" || statusInfo.status === "Expiring";
        });

        // 1. RENDERING CARDS (GRID VIEW)
        if (state.personelView === "grid") {
            const warningBadgeHtml = (hasWarning && !isPassive)
                ? `<span style="position:absolute;top:15px;right:15px;background:var(--alert-gradient);color:white;font-size:10px;font-weight:700;padding:4px 8px;border-radius:12px;box-shadow:0 0 10px rgba(255,88,88,0.4);">Evrak Uyarısı</span>`
                : "";

            const cardOpacity = isPassive ? "style='opacity:0.85; border-color: rgba(255,88,88,0.15)'" : "";

            const toggleStatusBtn = isPassive
                ? `<button class="btn-card-action btn-card-warning" onclick="toggleEmployeeActiveState('${emp.id}', 'active')">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Aktife Al
                   </button>`
                : `<button class="btn-card-action btn-card-warning" onclick="openTerminateModal('${emp.id}')">
                    <svg viewBox="0 0 24 24"><path d="M18.36 18.36A9 9 0 0 1 5.64 5.64m12.72 12.72A9 9 0 0 0 5.64 5.64m12.72 12.72L5.64 5.64"/></svg>
                    Pasife Al
                   </button>`;

            const cardHtml = `
                <div class="glass-card personel-card" id="card-${emp.id}" ${cardOpacity}>
                    ${warningBadgeHtml}
                    <div class="personel-avatar-container">
                        <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" class="personel-card-avatar" style="${isPassive ? 'filter:grayscale(1);' : ''}">
                        <span class="status-indicator ${statusClass}" title="${statusText}"></span>
                    </div>
                    <h3 class="personel-card-name" style="${isPassive ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${emp.name} ${emp.lastname || ''}</h3>
                    <span class="personel-card-role">${emp.role} (${calculateAge(emp.birthDate)} Yaş)</span>
                    <span class="personel-card-dept">${emp.dept}</span>
                    
                    <div class="personel-card-contact">
                        <div class="contact-item">
                            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <span>${emp.email}</span>
                        </div>
                        <div class="contact-item" style="justify-content: space-between;">
                            <div>
                                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                <span>${emp.phone}</span>
                            </div>
                            <span class="worked-days-badge" style="padding: 1px 6px; font-size:10px;">${workedDays} Gün</span>
                        </div>
                        <div class="contact-item" style="justify-content: space-between; font-size:11px;">
                            <span>Net Maaş: <strong>${(emp.salary || 0).toLocaleString("tr-TR")} TL</strong></span>
                            <span>Mesai: <strong>${(emp.overtimeRate || 250)} TL/Sa</strong></span>
                        </div>
                    </div>

                    <div class="personel-card-actions">
                        <div class="personel-card-actions-row">
                            <button class="btn-card-action" onclick="editEmployee('${emp.id}')" ${isPassive ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                Düzenle
                            </button>
                            <button class="btn-card-action" onclick="goToEmployeeDocuments('${emp.id}')">
                                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                Özlük
                            </button>
                        </div>
                        <div class="personel-card-actions-row">
                            ${toggleStatusBtn}
                            <button class="btn-card-action btn-card-delete" onclick="deleteEmployee('${emp.id}')">
                                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cardContainer.insertAdjacentHTML("beforeend", cardHtml);
        }

        // 2. RENDERING TABLE ROWS (LIST VIEW)
        else {
            const warningDot = (hasWarning && !isPassive) 
                ? `<span style="width:8px;height:8px;border-radius:50%;background:#ff5858;display:inline-block;box-shadow:0 0 8px #ff5858;" title="Evrak Uyarısı!"></span>` 
                : "";
            
            const trStyle = isPassive ? "style='opacity:0.75;'" : "";
            
            const toggleStatusBtn = isPassive
                ? `<button class="btn-card-action btn-card-warning" onclick="toggleEmployeeActiveState('${emp.id}', 'active')" style="padding:4px 8px;">Aktife Al</button>`
                : `<button class="btn-card-action btn-card-warning" onclick="openTerminateModal('${emp.id}')" style="padding:4px 8px;">Pasife Al</button>`;

            const rowHtml = `
                <tr ${trStyle}>
                    <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                            ${warningDot}
                            <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" style="width:34px;height:34px;border-radius:50%;object-fit:cover; ${isPassive ? 'filter:grayscale(1);' : ''}">
                            <div style="font-weight:600; color:var(--text-main); ${isPassive ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${emp.name} ${emp.lastname || ''}</div>
                        </div>
                    </td>
                    <td>${emp.dept}</td>
                    <td>${emp.role} (${calculateAge(emp.birthDate)} Yaş)</td>
                    <td style="font-weight:600;">
                        <div>${(emp.salary || 0).toLocaleString("tr-TR")} TL</div>
                        <div style="font-size:10px;color:var(--text-muted);">Mesai: ${emp.overtimeRate || 250} TL/Sa</div>
                    </td>
                    <td>${emp.hireDate}</td>
                    <td>${emp.terminationDate || "-"}</td>
                    <td>
                        <span class="worked-days-badge">${workedDays} Gün</span>
                    </td>
                    <td>
                        <span class="status-text-badge status-${emp.status === 'active' ? 'approved' : emp.status === 'passive' ? 'rejected' : 'pending'}">
                            ${emp.status === 'active' ? 'Aktif' : emp.status === 'passive' ? 'Pasif' : emp.status === 'leave' ? 'İzinli' : 'Raporlu'}
                        </span>
                    </td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-card-action" onclick="editEmployee('${emp.id}')" ${isPassive ? 'disabled style="opacity:0.5;"' : ''} style="padding:4px 8px;">Düzenle</button>
                            <button class="btn-card-action" onclick="goToEmployeeDocuments('${emp.id}')" style="padding:4px 8px;">Özlük</button>
                            ${toggleStatusBtn}
                            <button class="btn-card-action btn-card-delete" onclick="deleteEmployee('${emp.id}')" style="padding:4px 8px;">Sil</button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", rowHtml);
        }
    });
}

function openTerminateModal(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById("terminate-emp-id").value = emp.id;
    document.getElementById("terminate-message-text").innerHTML = `<strong>${emp.name} ${emp.lastname || ''}</strong> çalışanını pasif (işten çıkarıldı) durumuna geçirmek üzeresiniz. Lütfen ayrılış tarihini onaylayın.`;
    document.getElementById("terminate-date").value = new Date().toISOString().split('T')[0];
    
    document.getElementById("modal-terminate").classList.add("active");
}

function closeTerminateModal() {
    document.getElementById("modal-terminate").classList.remove("active");
}

function toggleEmployeeActiveState(empId, newState) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    if (newState === "active") {
        emp.status = "active";
        delete emp.terminationDate;
    }

    saveState();
    renderPersonelList();
    renderDashboard();
    renderOzlukEmployeeList();
    renderLeaveRequests();
    renderIzinModule();
    populateBordroEmployeeSelect();
}

function deleteEmployee(empId) {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    if (role === "employee") {
        alert("Hata: Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor!");
        return;
    }
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    const confirmDel = confirm(`⚠️ UYARI: "${emp.name} ${emp.lastname || ''}" çalışanını sistemden KALICI olarak silmek üzeresiniz!\nBu işlem çalışanın tüm özlük dosyalarını ve puantaj geçmişini silecek ve geri alınamayacaktır.\n\nOnaylıyor musunuz?`);
    if (!confirmDel) return;

    state.employees = state.employees.filter(e => e.id !== empId);
    state.documents = state.documents.filter(doc => doc.employeeId !== empId);
    
    if (state.attendance[empId]) {
        delete state.attendance[empId];
    }

    state.leaveRequests = state.leaveRequests.filter(req => req.employeeId !== empId);

    if (selectedEmployeeIdForDocs === empId) {
        selectedEmployeeIdForDocs = state.employees.length > 0 ? state.employees[0].id : null;
    }

    saveState();
    renderPersonelList();
    renderDashboard();
    renderOzlukEmployeeList();
    renderOzlukDocuments();
    renderPuantaj();
    renderLeaveRequests();
    renderIzinModule();
    populateLeaveEmployeeSelect();
    populateBordroEmployeeSelect();
}

// --- RENDER: ÖZLÜK DOSYALARI MODÜLÜ ---
function renderOzlukEmployeeList() {
    const listContainer = document.getElementById("ozluk-employee-list");
    listContainer.innerHTML = "";

    const searchVal = document.getElementById("ozluk-search").value.toLowerCase();
    const filtered = state.employees.filter(emp => {
        const fullName = `${emp.name} ${emp.lastname || ''}`.toLowerCase();
        return fullName.includes(searchVal);
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Personel bulunamadı.</div>`;
        return;
    }

    filtered.forEach(emp => {
        const isActive = emp.id === selectedEmployeeIdForDocs ? "active" : "";
        const isPassive = emp.status === "passive";
        
        const hasWarning = state.documents.some(doc => {
            if (doc.employeeId !== emp.id) return false;
            const statusInfo = getDocumentStatus(doc.expiryDate);
            return statusInfo.status === "Expired" || statusInfo.status === "Expiring";
        });

        const passiveText = isPassive ? " (İşten Çıkarıldı)" : "";
        const warningIndicator = (hasWarning && !isPassive)
            ? `<span style="width:8px;height:8px;border-radius:50%;background:#ff5858;box-shadow:0 0 8px #ff5858;" title="Evrak Uyarısı!"></span>`
            : "";

        const itemHtml = `
            <div class="employee-list-item ${isActive}" onclick="selectEmployeeForDocs('${emp.id}')" style="${isPassive ? 'opacity:0.6;' : ''}">
                <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" class="employee-list-avatar" style="${isPassive ? 'filter:grayscale(1)' : ''}">
                <div class="employee-list-details">
                    <span class="employee-list-name" style="${isPassive ? 'text-decoration:line-through;' : ''}">${emp.name} ${emp.lastname || ''}${passiveText}</span>
                    <span class="employee-list-role">${emp.role} (${calculateAge(emp.birthDate)} Yaş)</span>
                </div>
                ${warningIndicator}
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", itemHtml);
    });
}

function selectEmployeeForDocs(empId) {
    selectedEmployeeIdForDocs = empId;
    renderOzlukEmployeeList();
    renderOzlukDocuments();
}

function goToEmployeeDocuments(empId) {
    selectedEmployeeIdForDocs = empId;
    const menuOzluk = document.getElementById("menu-ozluk");
    if (menuOzluk) menuOzluk.click();
}

function renderOzlukDocuments() {
    const headerCard = document.getElementById("ozluk-header-card");
    const docGrid = document.getElementById("document-grid");
    const docContainer = document.getElementById("ozluk-documents-container");

    const emp = state.employees.find(e => e.id === selectedEmployeeIdForDocs);
    if (!emp) {
        docContainer.style.display = "none";
        headerCard.innerHTML = `
            <div class="ozluk-selected-profile">
                <div class="ozluk-selected-avatar" style="background:#ddd;width:70px;height:70px;border-radius:50%"></div>
                <div>
                    <h2 style="font-size:20px;font-weight:700;">Lütfen çalışan seçin</h2>
                    <span style="font-size:13px;color:var(--text-muted);;">Sol menüden evraklarını görmek istediğiniz personeli seçin.</span>
                </div>
            </div>
        `;
        return;
    }

    docContainer.style.display = "block";

    const isPassive = emp.status === "passive";
    const headerStatusText = isPassive ? `İŞTEN ÇIKARILDI (Ayrılış: ${emp.terminationDate})` : `${emp.role} — ${emp.dept} Departmanı`;
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";

    const uploadBtnHtml = role === "employee" ? "" : `
        <div>
            <button class="btn-primary" onclick="openUploadModal()" ${isPassive ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Evrak Yükle
            </button>
        </div>
    `;

    headerCard.innerHTML = `
        <div class="ozluk-selected-profile">
            <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" class="ozluk-selected-avatar" style="${isPassive ? 'filter:grayscale(1);' : ''}">
            <div>
                <h2 style="font-size:20px;font-weight:700;color:var(--text-main); ${isPassive ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${emp.name} ${emp.lastname || ''}</h2>
                <span style="font-size:13px;color:${isPassive ? '#ff5858' : 'var(--text-muted)'}; font-weight:600;">${headerStatusText}</span>
                <span style="display:block;font-size:11px;color:var(--text-muted);margin-top:4px;">Yaş: ${calculateAge(emp.birthDate)} | İşe Giriş: ${emp.hireDate} | Maaş: ${emp.salary.toLocaleString("tr-TR")} TL | Mesai: ${emp.overtimeRate || 250} TL/Sa</span>
            </div>
        </div>
        ${uploadBtnHtml}
    `;

    const dragDropZone = document.getElementById("drag-drop-zone");
    const uploadHeader = dragDropZone ? dragDropZone.previousElementSibling : null;
    if (role === "employee") {
        if (dragDropZone) dragDropZone.style.display = "none";
        if (uploadHeader) uploadHeader.style.display = "none";
    } else {
        if (dragDropZone) dragDropZone.style.display = "";
        if (uploadHeader) uploadHeader.style.display = "";
    }

    docGrid.innerHTML = "";
    const docs = state.documents.filter(d => d.employeeId === emp.id);

    if (docs.length === 0) {
        docGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Bu personele ait yüklü evrak bulunmamaktadır.</div>`;
        return;
    }

    docs.forEach(doc => {
        const info = getDocumentStatus(doc.expiryDate);
        
        let statusBadgeText = isPassive ? "Arşivlenmiş Belge" : info.text;
        let statusBadgeClass = isPassive ? "doc-success" : info.class;

        const cardHtml = `
            <div class="document-card" onclick="simulateDocumentPreview('${doc.id}')">
                <div class="document-icon-wrapper ${statusBadgeClass}" style="${isPassive ? 'background:rgba(255,255,255,0.05);color:var(--text-muted);' : ''}">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span class="document-name" title="${doc.fileName}">${doc.type}</span>
                <span class="document-status" style="color: ${isPassive ? 'var(--text-muted)' : (info.status === 'Expired' ? '#ff5858' : info.status === 'Expiring' ? '#f2994a' : '#38ef7d')}">${statusBadgeText}</span>
                <span class="document-expiry">${doc.expiryDate ? 'Son Tarih: ' + doc.expiryDate : 'Süresiz Belge'}</span>
            </div>
        `;
        docGrid.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function simulateDocumentPreview(docId) {
    const doc = state.documents.find(d => d.id === docId || d.fileName === docId);
    if (doc && doc.fileData) {
        const newTab = window.open();
        if (newTab) {
            newTab.document.write(`
                <html>
                    <head>
                        <title>${doc.type} - ${doc.fileName}</title>
                        <style>
                            body { margin: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f172a; height: 100vh; font-family: sans-serif; color: white; }
                            img { max-width: 90%; max-height: 85%; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); object-fit: contain; }
                            iframe { width: 100%; height: 90%; border: none; }
                            .header { width: 100%; background: #1e293b; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; font-size: 14px; }
                            .download-btn { background: #38ef7d; color: black; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; transition: 0.2s; }
                            .download-btn:hover { background: #2cd66d; }
                            .container { flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <span><strong>${doc.type}</strong> - ${doc.fileName}</span>
                            <a class="download-btn" href="${doc.fileData}" download="${doc.fileName}">Dosyayı İndir</a>
                        </div>
                        <div class="container">
                            ${doc.fileData.startsWith('data:image/') 
                                ? `<img src="${doc.fileData}" alt="${doc.fileName}">` 
                                : doc.fileData.startsWith('data:application/pdf') 
                                    ? `<iframe src="${doc.fileData}"></iframe>` 
                                    : `<div style="text-align: center;">
                                        <h3 style="margin-bottom: 20px;">Dosya formatı tarayıcıda doğrudan önizlenemiyor.</h3>
                                        <a class="download-btn" href="${doc.fileData}" download="${doc.fileName}">İndirmek İçin Tıklayın</a>
                                       </div>`
                            }
                        </div>
                    </body>
                </html>
            `);
            newTab.document.close();
        } else {
            alert("Yeni sekme açılması tarayıcınız tarafından engellendi. Lütfen izin verin.");
        }
    } else {
        alert(`[GÜLNAS İK SIMÜLASYONU]\n"${doc ? doc.fileName : docId}" belgesi açılıyor. Gerçek sistemde bu işlem dosyayı güvenli bulut sunucusundan indirip tarayıcıda önizleyecektir.`);
    }
}

function getDocumentStatus(expiryDateStr) {
    if (!expiryDateStr) return { status: "Valid", text: "Süresiz Evrak", class: "doc-success", daysLeft: Infinity };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { status: "Expired", text: "Süresi Doldu", class: "doc-danger", daysLeft: diffDays };
    } else if (diffDays <= 30) {
        return { status: "Expiring", text: `Son Gün: ${diffDays} Gün Kaldı`, class: "doc-warning", daysLeft: diffDays };
    } else {
        return { status: "Valid", text: "Geçerli Belge", class: "doc-success", daysLeft: diffDays };
    }
}

// --- RENDER: PUANTAJ MODÜLÜ ---
function renderPuantaj() {
    const daysInMonth = new Date(currentPuantajYear, currentPuantajMonth + 1, 0).getDate();
    const headerRow = document.getElementById("puantaj-table-header");
    const bodyContainer = document.getElementById("puantaj-table-body");

    // Sütun başlıklarını dinamik ayarla
    let headerHtml = `
        <th>Personel Bilgisi</th>
        <th>Ç (Gün)</th>
        <th>İ (Gün)</th>
        <th>R (Gün)</th>
        <th>D (Gün)</th>
        <th>F. Mesai (Saat)</th>
        <th>Hakedilen Toplam Maaş</th>
        <th>Aylık Günler</th>
    `;
    headerRow.innerHTML = headerHtml;
    bodyContainer.innerHTML = "";
    
    const activeEmployees = state.employees.filter(e => showEmployeeInMonth(e, currentPuantajYear, currentPuantajMonth));

    if (activeEmployees.length === 0) {
        bodyContainer.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted);">Puantaj cetveli için bu ay çalışan bulunmuyor.</td></tr>`;
        return;
    }

    activeEmployees.forEach(emp => {
        let countWork = 0;
        let countLeave = 0;
        let countReport = 0;
        let countAbsent = 0;
        let totalOvertimeHours = 0;

        let daysHtml = '<div class="puantaj-days-row">';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentPuantajYear}-${String(currentPuantajMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const info = getAttendanceInfo(emp.id, dateStr);

            let cellClass = "cell-empty";
            let statusLabelText = "Seçilmemiş";
            if (info.status === "Ç") { cellClass = "cell-work"; countWork++; statusLabelText = "Çalışıyor"; }
            else if (info.status === "İ") { cellClass = "cell-leave"; countLeave++; statusLabelText = "İzinli"; }
            else if (info.status === "R") { cellClass = "cell-report"; countReport++; statusLabelText = "Raporlu"; }
            else if (info.status === "D") { cellClass = "cell-absent"; countAbsent++; statusLabelText = "Devamsız"; }

            totalOvertimeHours += info.overtimeHours;

            // Fazla mesai varsa hücre içinde ek gösterge yap (+3 gibi)
            const overtimeLabel = info.overtimeHours > 0 ? `<div class="cell-overtime-label">+${info.overtimeHours}</div>` : "";
            
            daysHtml += `
                <div class="puantaj-day-cell ${cellClass}" onclick="openPuantajDayModal('${emp.id}', '${dateStr}')" title="${day} ${monthNames[currentPuantajMonth]}: ${statusLabelText} ${info.overtimeHours > 0 ? '(+' + info.overtimeHours + ' saat mesai)' : ''}">
                    <div class="cell-day-num" style="${info.overtimeHours > 0 ? 'margin-top:-2px;' : ''}">${day}</div>
                    ${overtimeLabel}
                </div>`;
        }
        daysHtml += '</div>';

        // Maaş Hakediş Formülü (Birikimli):
        // Hakediş = (Çalışılan + İzinli + Raporlu Günler) * (Net Maaş / 30) + (Mesai Saati * Mesai Saat Ücreti)
        // Maksimum Net Maaş ile sınırlanır (mesai hariç)
        const netBase = emp.salary || 0;
        const overtimePay = totalOvertimeHours * (emp.overtimeRate || 250);
        const dailyWage = netBase / 30;
        const workedDaysCount = countWork + countLeave + countReport;
        const baseEarned = Math.min(netBase, workedDaysCount * dailyWage);
        const earnedSalary = Math.max(0, Math.round(baseEarned + overtimePay));

        const rowHtml = `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                        <div>
                            <div style="font-weight:600;color:var(--text-main);">${emp.name} ${emp.lastname || ''}</div>
                            <div style="font-size:10px;color:var(--text-muted);">${emp.role}</div>
                        </div>
                    </div>
                </td>
                <td style="font-weight:700;color:var(--primary-light);text-align:center;">${countWork}</td>
                <td style="font-weight:700;color:#f2994a;text-align:center;">${countLeave}</td>
                <td style="font-weight:700;color:#ff5858;text-align:center;">${countReport}</td>
                <td style="font-weight:700;color:#94a3b8;text-align:center;">${countAbsent}</td>
                <td style="font-weight:700;color:#00f2fe;text-align:center;">${totalOvertimeHours} Sa</td>
                <td style="text-align:center;"><span class="earned-salary-text">${earnedSalary.toLocaleString("tr-TR")} TL</span></td>
                <td>${daysHtml}</td>
            </tr>
        `;
        bodyContainer.insertAdjacentHTML("beforeend", rowHtml);
    });
}

// Günlük Puantaj Detay Düzenleme Modalı Açma
function openPuantajDayModal(empId, dateStr) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById("puantaj-day-emp-id").value = empId;
    document.getElementById("puantaj-day-date").value = dateStr;

    // Başlık ayarla: "Günlük Detay - 12 Haziran" gibi
    const dayVal = Number(dateStr.split("-")[2]);
    document.getElementById("puantaj-day-title").textContent = `Günlük Detay Düzenle (${dayVal} ${monthNames[currentPuantajMonth]})`;
    document.getElementById("puantaj-day-subtitle").innerHTML = `Personel: <strong>${emp.name} ${emp.lastname || ''}</strong> (${emp.role}) <br> Fazla Mesai Saat Ücreti: <strong>${emp.overtimeRate || 250} TL</strong>`;

    const info = getAttendanceInfo(empId, dateStr);
    
    const statusSelect = document.getElementById("puantaj-day-status");
    statusSelect.value = info.status;
    
    const otInput = document.getElementById("puantaj-day-overtime");
    otInput.value = info.overtimeHours;

    // Eğer çalışma durumu çalışıyor ("Ç") değilse mesai saat alanını pasifleştir/gizle
    const otGroup = document.getElementById("puantaj-overtime-group");
    if (info.status !== "Ç") {
        otGroup.style.opacity = "0.5";
        otInput.disabled = true;
        otInput.value = 0;
    } else {
        otGroup.style.opacity = "1";
        otInput.disabled = false;
    }

    document.getElementById("modal-puantaj-day").classList.add("active");
}

function closePuantajDayModal() {
    document.getElementById("modal-puantaj-day").classList.remove("active");
}

// --- RENDER: İZİN TALEPLERİ ---
function populateLeaveEmployeeSelect() {
    const select = document.getElementById("leave-employee");
    if (!select) return;
    select.innerHTML = "";
    
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    if (role === "employee" && empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            const option = document.createElement("option");
            option.value = emp.id;
            option.textContent = `${emp.name} ${emp.lastname || ''}`;
            option.selected = true;
            select.appendChild(option);
            select.disabled = true;
        }
    } else {
        select.disabled = false;
        const option = document.createElement("option");
        option.value = "";
        option.disabled = true;
        option.selected = true;
        option.textContent = "Personel Seçin";
        select.appendChild(option);
        
        const activeEmployees = state.employees.filter(e => e.status !== "passive");
        activeEmployees.forEach(emp => {
            const option = document.createElement("option");
            option.value = emp.id;
            option.textContent = `${emp.name} ${emp.lastname || ''}`;
            select.appendChild(option);
        });
    }
}

function renderLeaveRequests() {
    const listContainer = document.getElementById("leave-requests-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");

    let requests = [...state.leaveRequests].reverse();
    if (role === "employee" && empId) {
        requests = requests.filter(r => r.employeeId === empId);
    }

    if (requests.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">Herhangi bir izin talebi kaydı bulunmuyor.</div>`;
        return;
    }

    requests.forEach(req => {
        const emp = state.employees.find(e => e.id === req.employeeId);
        
        let typeBadgeClass = "badge-annual";
        let typeBadgeStyle = "";
        if (req.type === "Raporlu/Sağlık") typeBadgeClass = "badge-medical";
        else if (req.type === "Ücretsiz İzin") typeBadgeClass = "badge-unpaid";
        else if (req.type === "Profil Fotoğrafı") {
            typeBadgeClass = "";
            typeBadgeStyle = "background: rgba(0, 242, 254, 0.15); color: #00f2fe; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; width: fit-content;";
        }

        let statusHtml = "";
        if (req.status === "pending") {
            if (role === "employee") {
                statusHtml = `<span class="status-text-badge status-pending">Onay Bekliyor</span>`;
            } else {
                statusHtml = `
                    <div class="request-actions">
                        <button class="btn-icon-action btn-approve" onclick="handleLeaveStatus('${req.id}', 'approved')" title="Talebi Onayla">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button class="btn-icon-action btn-reject" onclick="handleLeaveStatus('${req.id}', 'rejected')" title="Talebi Reddet">
                            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                `;
            }
        } else if (req.status === "approved") {
            statusHtml = `<span class="status-text-badge status-approved">Onaylandı</span>`;
        } else {
            statusHtml = `<span class="status-text-badge status-rejected">Reddedildi</span>`;
        }

        let approverHtml = "";
        if (req.status === "approved" && req.approvedBy) {
            approverHtml = `<span style="font-size:11px;color:#38ef7d;margin-top:4px;display:block;">Onaylayan: <strong>${req.approvedBy}</strong></span>`;
        } else if (req.status === "rejected" && req.approvedBy) {
            approverHtml = `<span style="font-size:11px;color:#ff5858;margin-top:4px;display:block;">Reddeden: <strong>${req.approvedBy}</strong></span>`;
        }

        let metaHtml = "";
        if (req.type === "Profil Fotoğrafı") {
            metaHtml = `
                <span style="font-weight:600;font-size:14px;color:var(--text-main)">${req.employeeName} ${(emp && emp.status === 'passive') ? ' (Pasif)' : ''}</span>
                <span class="request-type-badge" style="${typeBadgeStyle}">${req.type}</span>
                <div style="display:flex; align-items:center; gap:16px; margin: 8px 0;">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <span style="font-size:9px; color:var(--text-muted); margin-bottom:4px;">Mevcut</span>
                        <img src="${getEmployeeAvatar(emp)}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.15);">
                    </div>
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke:var(--text-muted); fill:none; stroke-width:2.5;"><polyline points="9 18 15 12 9 6"/></svg>
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <span style="font-size:9px; color:var(--secondary); margin-bottom:4px;">Yeni</span>
                        <img src="${req.startDate}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:1px solid var(--secondary);">
                    </div>
                </div>
                <span style="font-size:11px;color:var(--text-muted);margin-top:4px;">Açıklama: "${req.desc}"</span>
                ${approverHtml}
            `;
        } else {
            metaHtml = `
                <span style="font-weight:600;font-size:14px;color:var(--text-main)">${req.employeeName} ${(emp && emp.status === 'passive') ? ' (Pasif)' : ''}</span>
                <span class="request-type-badge ${typeBadgeClass}">${req.type}</span>
                <span class="request-dates">${req.startDate} / ${req.endDate}</span>
                <span style="font-size:11px;color:var(--text-muted);margin-top:4px;">Açıklama: "${req.desc}"</span>
                ${approverHtml}
            `;
        }

        const cardHtml = `
            <div class="request-card" style="${(emp && emp.status === 'passive') ? 'opacity:0.5' : ''}">
                <div class="request-employee-info">
                    <img src="${getEmployeeAvatar(emp)}" alt="${req.employeeName}" class="alert-avatar">
                    <div class="request-meta">
                        ${metaHtml}
                    </div>
                </div>
                <div>
                    ${statusHtml}
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function handleLeaveStatus(reqId, status) {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    if (role === "employee") {
        alert("Hata: Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor!");
        return;
    }
    const req = state.leaveRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = status;

    // Save who approved/rejected the request
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    let approverStr = "Admin";
    if (empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            approverStr = `${emp.name} ${emp.lastname || ''} ${emp.role}`;
        }
    }
    req.approvedBy = approverStr;

    if (status === "approved") {
        if (req.type === "Profil Fotoğrafı") {
            const emp = state.employees.find(e => e.id === req.employeeId);
            if (emp) {
                emp.avatar = req.startDate; // New Base64 is stored in startDate
            }
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            const emp = state.employees.find(e => e.id === req.employeeId);
            
            if (emp && todayStr >= req.startDate && todayStr <= req.endDate && emp.status !== "passive") {
                emp.status = req.type === "Raporlu/Sağlık" ? "report" : "leave";
            }

            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const loop = new Date(start);
            
            const typeChar = req.type === "Raporlu/Sağlık" ? "R" : "İ";

            while (loop <= end) {
                const dateStr = loop.toISOString().split('T')[0];
                if (!state.attendance[req.employeeId]) state.attendance[req.employeeId] = {};
                state.attendance[req.employeeId][dateStr] = { status: typeChar, overtimeHours: 0 };
                loop.setDate(loop.getDate() + 1);
            }
        }
    }

    saveState();
    renderLeaveRequests();
    renderDashboard();
    renderIzinModule();
    renderPersonelList();
    updateHeaderManagerInfo();
    renderOzlukEmployeeList();
    renderOzlukDocuments();
}

// --- İZİN TAKİP VE HESAPLAMA PROGRAMLARI (YENİ PANEL) ---
function calculateLeaveDays(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function getLeaveDaysInMonth(startDateStr, endDateStr, targetYear, targetMonth) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0);
    
    const overlapStart = new Date(Math.max(start, monthStart));
    const overlapEnd = new Date(Math.min(end, monthEnd));
    
    if (overlapStart <= overlapEnd) {
        const diffTime = overlapEnd - overlapStart;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
}

function switchIzinTab(tabName) {
    const tabBakiyeler = document.getElementById("btn-izin-tab-bakiyeler");
    const tabKullananlar = document.getElementById("btn-izin-tab-kullananlar");
    const contentBakiyeler = document.getElementById("izin-tab-content-bakiyeler");
    const contentKullananlar = document.getElementById("izin-tab-content-kullananlar");
    
    if (tabName === "bakiyeler") {
        tabBakiyeler.classList.add("active");
        tabKullananlar.classList.remove("active");
        contentBakiyeler.classList.add("active");
        contentKullananlar.classList.remove("active");
    } else {
        tabBakiyeler.classList.remove("active");
        tabKullananlar.classList.add("active");
        contentBakiyeler.classList.remove("active");
        contentKullananlar.classList.add("active");
    }
}

function renderIzinModule() {
    const bakiyeBody = document.getElementById("izin-bakiye-table-body");
    const kullananBody = document.getElementById("izin-kullanan-table-body");
    
    if (!bakiyeBody || !kullananBody) return;
    
    bakiyeBody.innerHTML = "";
    kullananBody.innerHTML = "";
    
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    
    const activeEmployees = state.employees.filter(e => e.status !== "passive");
    
    // Filter display list for bakiye table if user is employee
    let bakiyeEmployees = activeEmployees;
    if (role === "employee" && empId) {
        bakiyeEmployees = activeEmployees.filter(e => e.id === empId);
    }
    
    // Hide/show tab switch controls
    const tabButtons = document.getElementById("btn-izin-tab-bakiyeler")?.parentElement;
    if (tabButtons) {
        if (role === "employee") {
            tabButtons.style.display = "none";
            const tabBakiyeler = document.getElementById("btn-izin-tab-bakiyeler");
            const tabKullananlar = document.getElementById("btn-izin-tab-kullananlar");
            const contentBakiyeler = document.getElementById("izin-tab-content-bakiyeler");
            const contentKullananlar = document.getElementById("izin-tab-content-kullananlar");
            if (tabBakiyeler && tabKullananlar && contentBakiyeler && contentKullananlar) {
                tabBakiyeler.classList.add("active");
                tabKullananlar.classList.remove("active");
                contentBakiyeler.classList.add("active");
                contentKullananlar.classList.remove("active");
            }
        } else {
            tabButtons.style.display = "flex";
        }
    }
    
    // --- 1. DİNAMİK ÜST KARTLAR HESAPLAMA ---
    // A. Ortalama Yıllık İzin Oranı
    let totalLimits = 0;
    let totalUsedYillik = 0;
    
    let statsEmployees = activeEmployees;
    if (role === "employee" && empId) {
        statsEmployees = activeEmployees.filter(e => e.id === empId);
    }
    
    statsEmployees.forEach(emp => {
        const limit = emp.leaveLimit || 20;
        totalLimits += limit;
        
        let empUsedYillik = 0;
        state.leaveRequests.forEach(req => {
            if (req.employeeId === emp.id && req.status === "approved" && req.type === "Yıllık İzin") {
                empUsedYillik += calculateLeaveDays(req.startDate, req.endDate);
            }
        });
        totalUsedYillik += empUsedYillik;
    });
    
    const avgPercent = totalLimits > 0 ? Math.round((totalUsedYillik / totalLimits) * 100) : 0;
    document.getElementById("stat-avg-leave-use-val").textContent = `%${avgPercent}`;
    
    const circleAvg = document.getElementById("circle-avg-leave");
    if (circleAvg) {
        const offset = 251.2 - (251.2 * Math.min(100, avgPercent) / 100);
        circleAvg.setAttribute("stroke-dashoffset", offset);
    }
    
    // B. Bu Ay Kullanılan İzinler (Seçili Ay)
    let totalLeavesThisMonth = 0;
    state.leaveRequests.forEach(req => {
        if (req.status === "approved") {
            if (role !== "employee" || req.employeeId === empId) {
                totalLeavesThisMonth += getLeaveDaysInMonth(req.startDate, req.endDate, currentPuantajYear, currentPuantajMonth);
            }
        }
    });
    
    document.getElementById("stat-this-month-leaves-val").textContent = `${totalLeavesThisMonth} Gün`;
    if (role === "employee") {
        document.getElementById("label-this-month-leaves-desc").textContent = `Bu ay kullandığınız toplam izin süresi`;
    } else {
        document.getElementById("label-this-month-leaves-desc").textContent = `${monthNames[currentPuantajMonth]} ayında alınan toplam izin süresi`;
    }
    
    const circleThisMonth = document.getElementById("circle-this-month-leaves");
    if (circleThisMonth) {
        const offset = 251.2 - (251.2 * Math.min(30, totalLeavesThisMonth) / 30);
        circleThisMonth.setAttribute("stroke-dashoffset", offset);
    }
    
    // C. Onay Bekleyen
    const pendingLeaves = state.leaveRequests.filter(r => r.status === "pending" && (role !== "employee" || r.employeeId === empId)).length;
    const pendingCard = document.getElementById("balance-pending-count");
    if (pendingCard) pendingCard.textContent = pendingLeaves;
    
    // --- 2. BAKİYE TABLOSUNU DOLDURMA ---
    if (bakiyeEmployees.length === 0) {
        bakiyeBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Kayıtlı aktif personel bulunamadı.</td></tr>`;
    } else {
        bakiyeEmployees.forEach(emp => {
            const limit = emp.leaveLimit || 20;
            
            let usedYillik = 0;
            let usedRapor = 0;
            let usedUcretsiz = 0;
            
            state.leaveRequests.forEach(req => {
                if (req.employeeId === emp.id && req.status === "approved") {
                    const days = calculateLeaveDays(req.startDate, req.endDate);
                    if (req.type === "Yıllık İzin") usedYillik += days;
                    else if (req.type === "Raporlu/Sağlık") usedRapor += days;
                    else if (req.type === "Ücretsiz İzin") usedUcretsiz += days;
                }
            });
            
            const kalan = limit - usedYillik;
            const kalanStyle = kalan < 0 ? "color:#ff5858;font-weight:700;" : "color:#38ef7d;font-weight:700;";
            
            const rowHtml = `
                <tr>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <img src="${getEmployeeAvatar(emp)}" alt="${emp.name} ${emp.lastname || ''}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                            <div>
                                <div style="font-weight:600;color:var(--text-main);">${emp.name} ${emp.lastname || ''}</div>
                                <div style="font-size:10px;color:var(--text-muted);">${emp.role}</div>
                            </div>
                        </div>
                    </td>
                    <td>${emp.dept}</td>
                    <td style="font-weight:700;text-align:center;">${limit} Gün</td>
                    <td style="font-weight:700;color:#f2994a;text-align:center;">${usedYillik} Gün</td>
                    <td style="text-align:center;${kalanStyle}">${kalan} Gün</td>
                    <td>
                        <span style="font-size:11px;color:var(--text-muted)">
                            Yıllık: <strong style="color:var(--text-main);">${usedYillik}</strong> | Raporlu: <strong style="color:var(--text-main);">${usedRapor}</strong> | Ücretsiz: <strong style="color:var(--text-main);">${usedUcretsiz}</strong>
                        </span>
                    </td>
                </tr>
            `;
            bakiyeBody.insertAdjacentHTML("beforeend", rowHtml);
        });
    }
    
    // --- 3. BU AY KULLANANLAR TABLOSUNU DOLDURMA ---
    let cullananCount = 0;
    state.leaveRequests.forEach(req => {
        if (req.status === "approved") {
            const overlapDays = getLeaveDaysInMonth(req.startDate, req.endDate, currentPuantajYear, currentPuantajMonth);
            if (overlapDays > 0) {
                cullananCount++;
                const emp = state.employees.find(e => e.id === req.employeeId);
                const avatarImg = getEmployeeAvatar(emp);
                
                const typeClass = req.type === "Yıllık İzin" ? "badge-annual" : req.type === "Raporlu/Sağlık" ? "badge-medical" : "badge-unpaid";
                
                const rowHtml = `
                    <tr>
                        <td>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <img src="${avatarImg}" alt="${req.employeeName}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                                <div style="font-weight:600;color:var(--text-main);">${req.employeeName}</div>
                            </div>
                        </td>
                        <td><span class="request-type-badge ${typeClass}">${req.type}</span></td>
                        <td>${req.startDate} / ${req.endDate}</td>
                        <td style="font-weight:700;text-align:center;color:var(--secondary);">${overlapDays} Gün</td>
                        <td style="font-size:11px;color:var(--text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${req.desc}">${req.desc}</td>
                        <td>
                            <span class="status-text-badge status-approved">Onaylandı</span>
                            ${req.approvedBy ? `<div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Onaylayan:<br><strong>${req.approvedBy}</strong></div>` : ''}
                        </td>
                    </tr>
                `;
                kullananBody.insertAdjacentHTML("beforeend", rowHtml);
            }
        }
    });
    
    if (cullananCount === 0) {
        kullananBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">${monthNames[currentPuantajMonth]} ayında izin kullanan personel bulunmuyor.</td></tr>`;
    }
}

// --- NEW MODAL & BOARD & NAVIGATION FUNCTIONS ---
function openActiveLeavesModal() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    if (role === "employee") return;

    const modal = document.getElementById("modal-active-leaves");
    const tableBody = document.getElementById("active-leaves-modal-table-body");
    tableBody.innerHTML = "";

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Find all active employees who are currently on leave or report
    const activeEmployeesOnLeave = state.employees.filter(emp => emp.status !== "passive" && (emp.status === "leave" || emp.status === "report"));

    if (activeEmployeesOnLeave.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Şu an izinde olan aktif personel bulunmuyor.</td></tr>`;
    } else {
        activeEmployeesOnLeave.forEach(emp => {
            // Find the approved leave request that overlaps with today
            const req = state.leaveRequests.find(r => r.employeeId === emp.id && r.status === "approved" && todayStr >= r.startDate && todayStr <= r.endDate);

            const type = req ? req.type : (emp.status === "report" ? "Raporlu/Sağlık" : "Yıllık İzin");
            const typeClass = type === "Yıllık İzin" ? "badge-annual" : type === "Raporlu/Sağlık" ? "badge-medical" : "badge-unpaid";
            const dates = req ? `${req.startDate} / ${req.endDate}` : "-";
            const desc = req ? req.desc : "Sistem tarafından otomatik atandı";
            
            // Calculate days this month for this leave
            const daysThisMonth = req ? getLeaveDaysInMonth(req.startDate, req.endDate, currentPuantajYear, currentPuantajMonth) : "-";

            const rowHtml = `
                <tr>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <img src="${getEmployeeAvatar(emp)}" alt="${emp.name}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                            <div style="font-weight:600;color:var(--text-main);">${emp.name}</div>
                        </div>
                    </td>
                    <td>${emp.dept}</td>
                    <td><span class="request-type-badge ${typeClass}">${type}</span></td>
                    <td>${dates}</td>
                    <td style="font-weight:700;text-align:center;color:var(--secondary);">${daysThisMonth} Gün</td>
                    <td style="font-size:11px;color:var(--text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${desc}">${desc}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", rowHtml);
        });
    }

    modal.classList.add("active");
}

function goToPuantajMonth(year, month) {
    currentPuantajYear = year;
    currentPuantajMonth = month;
    
    initPuantajDefaultData();
    populateMonthSelectDropdown();
    renderPuantaj();
    renderDashboard();
    renderIzinModule();
    
    const menuPuantaj = document.getElementById("menu-puantaj");
    if (menuPuantaj) menuPuantaj.click();
}

function populateBordroEmployeeSelect() {
    const select = document.getElementById("bordro-employee-select");
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Personel Seçin</option>';
    
    const activeEmployees = state.employees.filter(e => e.status !== "passive");
    activeEmployees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = `${emp.name} ${emp.lastname || ''}`;
        select.appendChild(option);
    });
}

function printPayrollSlip() {
    const activeEmployees = state.employees.filter(e => showEmployeeInMonth(e, currentPuantajYear, currentPuantajMonth));
    if (activeEmployees.length === 0) {
        alert("Bordro yazdırmak için bu ay çalışan personel bulunmuyor!");
        return;
    }
    
    const daysInMonth = new Date(currentPuantajYear, currentPuantajMonth + 1, 0).getDate();
    const currentMonthPrefix = `${currentPuantajYear}-${String(currentPuantajMonth + 1).padStart(2, '0')}`;
    
    let rowsHtml = "";
    let grandTotalEarned = 0;
    let grandTotalBase = 0;
    
    activeEmployees.forEach((emp, index) => {
        let countWork = 0;
        let countLeave = 0;
        let countReport = 0;
        let countAbsent = 0;
        let totalOvertimeHours = 0;
        
        const empAttendance = state.attendance[emp.id] || {};
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonthPrefix}-${String(day).padStart(2, '0')}`;
            const info = getAttendanceInfo(emp.id, dateStr);
            
            if (info.status === "Ç") countWork++;
            else if (info.status === "İ") countLeave++;
            else if (info.status === "R") countReport++;
            else if (info.status === "D") countAbsent++;
            
            totalOvertimeHours += info.overtimeHours;
        }
        
        const workedDaysCount = countWork + countLeave + countReport;
        const netBase = emp.salary || 0;
        const baseEarned = Math.min(netBase, workedDaysCount * (netBase / 30));
        const overtimeRate = emp.overtimeRate || 250;
        const overtimeEarnings = totalOvertimeHours * overtimeRate;
        const earnedSalary = Math.max(0, Math.round(baseEarned + overtimeEarnings));
        
        grandTotalEarned += earnedSalary;
        grandTotalBase += netBase;
        
        const totalWorkedDays = calculateWorkedDays(emp.hireDate, emp.terminationDate);
        
        rowsHtml += `
            <tr style="border-bottom: 1px solid #cbd5e0;">
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0; font-weight:600;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e0;">
                    <div style="font-weight:700; font-size:12px; color:#000;">${emp.name} ${emp.lastname || ''}</div>
                    <div style="font-size:10px; color:#333; margin-top:2px;">T.C.: <strong>${emp.tckn || "-"}</strong></div>
                    <div style="font-size:10px; color:#666;">${emp.dept} - ${emp.role}</div>
                </td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0; font-weight:600;">
                    ${totalWorkedDays} Gün
                    <div style="font-size:9px; color:#666; font-weight:normal;">Giriş: ${emp.hireDate}</div>
                </td>
                <td style="text-align:right; padding: 10px; border: 1px solid #cbd5e0; font-weight:600;">${netBase.toLocaleString("tr-TR")} TL</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0;">${countWork} Gün</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0; color:#f2994a; font-weight:600;">${countLeave} Gün</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0; color:#ff5858; font-weight:600;">${countReport} Gün</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0; color:#718096; font-weight:600;">${countAbsent} Gün</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e0;">
                    ${totalOvertimeHours} Sa
                    <div style="font-size:9px; color:#555; font-weight:normal;">+${overtimeEarnings.toLocaleString("tr-TR")} TL</div>
                </td>
                <td style="text-align:right; font-weight:800; padding: 10px; border: 1px solid #cbd5e0; font-size:12px; background:#f7fafc;">${earnedSalary.toLocaleString("tr-TR")} TL</td>
                <td style="width:110px; padding: 10px; border: 1px solid #cbd5e0; text-align:center; font-size:9px; color:#999; vertical-align:bottom;">İmza</td>
            </tr>
        `;
    });
    
    const printArea = document.getElementById("print-payroll-area");
    printArea.innerHTML = `
        <div class="payroll-slip-container" style="max-width: 100%; border: 3px solid #000; padding: 25px; background: #fff; color: #000; font-family: 'Inter', sans-serif; box-sizing: border-box;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #000;padding-bottom:15px;margin-bottom:20px;">
                <div>
                    <h1 style="font-size:18px;font-weight:800;margin:0;color:#000;letter-spacing:0.5px;">GÜLNAS İNŞAAT SANAYİ VE LİMİTED ŞİRKETİ</h1>
                    <p style="font-size:11px;color:#333;margin:4px 0 0 0;font-weight:600;">AYLIK TOPLU BORDRO VE MAAŞ ÇİZELGESİ — ${monthNames[currentPuantajMonth].toUpperCase()} ${currentPuantajYear}</p>
                </div>
                <div style="text-align:right; display:flex; align-items:center; gap:12px;">
                    <img src="assets/logo.jpg" alt="GÜLNAS Logo" style="height:55px; border-radius:6px; border:1px solid #ddd; object-fit:contain;">
                </div>
            </div>
            
            <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:25px;color:#000;">
                <thead>
                    <tr style="background:#f7fafc;border-top:3px solid #000;border-bottom:2px solid #000;">
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:40px;">NO</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:left;">PERSONEL VE TC BİLGİSİ</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:100px;">TOPLAM ÇALIŞMA (KIDEM)</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:right; width:95px;">NET BAZ MAAŞ</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:70px;">ÇAL. GÜN</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:70px;">İZİN GÜN</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:70px;">RAPOR GÜN</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:70px;">DEVAMSIZ GÜN</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:80px;">FAZLA MESAI</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:right; width:105px; background:#f7fafc;">HAKEDİLEN MAAŞ</th>
                        <th style="padding:10px;border: 1px solid #cbd5e0;text-align:center; width:110px;">İMZA</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr style="background:#f7fafc;font-weight:800;border-top:2px solid #000;border-bottom:3px solid #000;">
                        <td colspan="3" style="padding:12px;border: 1px solid #cbd5e0;text-align:right;font-size:12px;">GENEL TOPLAM:</td>
                        <td style="padding:12px;border: 1px solid #cbd5e0;text-align:right;">${grandTotalBase.toLocaleString("tr-TR")} TL</td>
                        <td colspan="5" style="border: 1px solid #cbd5e0;"></td>
                        <td style="padding:12px;border: 1px solid #cbd5e0;text-align:right;font-size:12px;background:#edf2f7;color:#000;">${grandTotalEarned.toLocaleString("tr-TR")} TL</td>
                        <td style="border: 1px solid #cbd5e0;"></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:11px;">
                <div style="width:250px;text-align:center;border:1px dashed #a0aec0;padding:15px;border-radius:4px;">
                    <p style="margin:0 0 50px 0;"><strong>İŞVEREN / YETKİLİ</strong></p>
                    <p style="margin:0;">Kaşe / İmza</p>
                </div>
                <div style="width:450px;text-align:left;font-size:10px;color:#555;line-height:1.5;">
                    <p style="margin:0;">* Bu çizelge, personellerin hakediş ve puantaj kayıtlarını tek bir döküm halinde listeler.</p>
                    <p style="margin:3px 0 0 0;">* İmza hanesi, personelin çizelgede gösterilen net hakediş tutarını aldığını tebliğ eder.</p>
                </div>
            </div>
        </div>
    `;
    
    window.print();
}

// --- MODALLAR VE FORM İŞLEMLERİ ---
function openPersonelModal(isEdit = false, empId = null) {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    if (role === "employee") return;

    const modal = document.getElementById("modal-personel");
    const title = document.getElementById("modal-personel-title");
    const form = document.getElementById("form-personel");

    form.reset();
    document.getElementById("personel-edit-id").value = "";

    if (isEdit && empId) {
        title.textContent = "Personel Düzenle";
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            document.getElementById("personel-edit-id").value = emp.id;
            document.getElementById("input-name").value = emp.name;
            document.getElementById("input-lastname").value = emp.lastname || "";
            document.getElementById("input-role").value = emp.role;
            document.getElementById("input-dept").value = emp.dept;
            document.getElementById("input-email").value = emp.email;
            document.getElementById("input-phone").value = emp.phone;
            document.getElementById("input-hire-date").value = emp.hireDate;
            document.getElementById("input-salary").value = emp.salary || 0;
            document.getElementById("input-overtime-rate").value = emp.overtimeRate || 250;
            document.getElementById("input-gender").value = emp.gender || "Erkek";
            document.getElementById("input-status").value = emp.status;
            
            // New fields
            document.getElementById("input-tckn").value = emp.tckn || "";
            document.getElementById("input-birth-date").value = emp.birthDate || "";
            document.getElementById("input-education").value = emp.education || "Lisans";
            document.getElementById("input-authority").value = emp.authority || "employee";
            document.getElementById("input-password").value = emp.password || "123456";
        }
    } else {
        title.textContent = "Yeni Personel Ekle";
        document.getElementById("input-status").value = "active";
        document.getElementById("input-overtime-rate").value = 250; // varsayılan fazla mesai ücreti
        document.getElementById("input-gender").value = "Erkek";
        
        // New fields reset
        document.getElementById("input-name").value = "";
        document.getElementById("input-lastname").value = "";
        document.getElementById("input-tckn").value = "";
        document.getElementById("input-birth-date").value = "";
        document.getElementById("input-education").value = "Lisans";
        document.getElementById("input-authority").value = "employee";
        document.getElementById("input-password").value = "123456";
    }

    modal.classList.add("active");
}

function closePersonelModal() {
    document.getElementById("modal-personel").classList.remove("active");
}

function editEmployee(empId) {
    openPersonelModal(true, empId);
}

function openUploadModal() {
    if (!selectedEmployeeIdForDocs) {
        alert("Lütfen önce sol listeden bir personel seçin.");
        return;
    }
    const modal = document.getElementById("modal-upload");
    document.getElementById("form-upload-doc").reset();
    const fileDataEl = document.getElementById("upload-file-data");
    if (fileDataEl) fileDataEl.value = "";
    modal.classList.add("active");
}

function closeUploadModal() {
    document.getElementById("modal-upload").classList.remove("active");
    document.getElementById("upload-file-picker").value = "";
    document.getElementById("upload-file-name").value = "";
    const fileDataEl = document.getElementById("upload-file-data");
    if (fileDataEl) fileDataEl.value = "";
}

function openProfileModal() {
    const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
    const empId = sessionStorage.getItem("gl_logged_employee_id");
    const modal = document.getElementById("modal-profile");
    
    const inputName = document.getElementById("profile-name");
    const inputLastname = document.getElementById("profile-lastname");
    const inputRole = document.getElementById("profile-role");
    const inputUsername = document.getElementById("profile-username");
    const inputPassword = document.getElementById("profile-password");
    
    if (empId) {
        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            document.querySelector("#modal-profile .modal-title").textContent = "Profil Ayarları";
            
            inputName.value = emp.name;
            inputName.disabled = true;
            
            inputLastname.value = emp.lastname || "";
            inputLastname.disabled = true;
            
            inputRole.value = emp.role;
            inputRole.disabled = true;
            
            inputUsername.value = emp.email || emp.tckn;
            inputUsername.disabled = true;
            
            inputPassword.value = "";
            inputPassword.placeholder = "Şifrenizi değiştirmek için doldurun";

            const avatarGroup = document.getElementById("profile-avatar-group");
            if (avatarGroup) {
                avatarGroup.style.display = "block";
                document.getElementById("profile-avatar-picker").value = "";
                document.getElementById("profile-avatar-data").value = "";
                document.getElementById("profile-avatar-preview-container").style.display = "none";
                document.getElementById("profile-avatar-preview").src = "";
            }
        }
    } else {
        document.querySelector("#modal-profile .modal-title").textContent = "Yönetici Profil Ayarları";
        
        const manager = state.manager || defaultManager;
        inputName.value = manager.name || "";
        inputName.disabled = false;
        
        inputLastname.value = manager.lastname || "";
        inputLastname.disabled = false;
        
        inputRole.value = manager.role || "";
        inputRole.disabled = false;
        
        inputUsername.value = manager.username || "";
        inputUsername.disabled = false;
        
        inputPassword.value = "";
        inputPassword.placeholder = "Değiştirmek istemiyorsanız boş bırakın";

        const avatarGroup = document.getElementById("profile-avatar-group");
        if (avatarGroup) avatarGroup.style.display = "none";
    }
    
    modal.classList.add("active");
}

function closeProfileModal() {
    document.getElementById("modal-profile").classList.remove("active");
}

// --- EVENT LISTENERS KURULUMU ---
function setupEventListeners() {
    document.getElementById("form-login").addEventListener("submit", handleLogin);
    document.getElementById("btn-logout").addEventListener("click", handleLogout);

    document.getElementById("user-profile-header").addEventListener("click", openProfileModal);
    document.getElementById("modal-profile-close").addEventListener("click", closeProfileModal);
    document.getElementById("btn-cancel-profile").addEventListener("click", closeProfileModal);

    document.getElementById("profile-avatar-picker").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Hata: Profil fotoğrafı boyutu 2MB'tan büyük olamaz!");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById("profile-avatar-data").value = event.target.result;
            const previewContainer = document.getElementById("profile-avatar-preview-container");
            const previewImg = document.getElementById("profile-avatar-preview");
            previewImg.src = event.target.result;
            previewContainer.style.display = "flex";
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("form-profile-settings").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const empId = sessionStorage.getItem("gl_logged_employee_id");
        const newPass = document.getElementById("profile-password").value.trim();
        const avatarData = document.getElementById("profile-avatar-data").value;
        
        if (empId) {
            const emp = state.employees.find(e => e.id === empId);
            if (emp) {
                let msg = "";
                if (newPass) {
                    if (newPass.length < 4) {
                        alert("Hata: Şifre en az 4 karakter olmalıdır!");
                        return;
                    }
                    emp.password = newPass;
                    msg += "Şifreniz başarıyla güncellendi. ";
                }
                if (avatarData) {
                    const newRequest = {
                        id: `avatar-req-${Date.now()}`,
                        employeeId: emp.id,
                        employeeName: `${emp.name} ${emp.lastname || ''}`,
                        type: "Profil Fotoğrafı",
                        startDate: avatarData,
                        endDate: "",
                        desc: "Profil fotoğrafı güncelleme talebi.",
                        status: "pending"
                    };
                    state.leaveRequests.push(newRequest);
                    msg += "Profil fotoğrafı güncelleme talebiniz yönetici onayına gönderildi.";
                }
                if (msg) {
                    saveState();
                    alert(msg);
                } else {
                    alert("Herhangi bir değişiklik yapılmadı.");
                }
            }
        } else {
            state.manager.name = document.getElementById("profile-name").value.trim();
            state.manager.lastname = document.getElementById("profile-lastname").value.trim();
            state.manager.role = document.getElementById("profile-role").value.trim();
            state.manager.username = document.getElementById("profile-username").value.trim();
            
            if (newPass) {
                if (newPass.length < 4) {
                    alert("Hata: Şifre en az 4 karakter olmalıdır!");
                    return;
                }
                state.manager.password = newPass;
            }
            saveState();
        }

        closeProfileModal();
        updateHeaderManagerInfo();
        renderDashboard();
    });

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

    document.getElementById("btn-view-grid").addEventListener("click", () => switchPersonelView("grid"));
    document.getElementById("btn-view-list").addEventListener("click", () => switchPersonelView("list"));

    document.getElementById("widget-total-employees").addEventListener("click", () => {
        const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
        if (role === "employee") return;
        const menuPersonel = document.getElementById("menu-personel");
        if (menuPersonel) menuPersonel.click();
    });
    
    document.getElementById("widget-on-leave").addEventListener("click", () => {
        const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
        if (role === "employee") {
            const menuIzin = document.getElementById("menu-izin");
            if (menuIzin) menuIzin.click();
            return;
        }
        openActiveLeavesModal();
    });
    
    document.getElementById("widget-expiring-docs").addEventListener("click", () => {
        const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
        if (role === "employee") {
            const menuOzluk = document.getElementById("menu-ozluk");
            if (menuOzluk) menuOzluk.click();
            return;
        }
        scrollToAlerts();
    });
    
    document.getElementById("btn-notifications").addEventListener("click", () => {
        const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
        if (role === "employee") {
            const menuOzluk = document.getElementById("menu-ozluk");
            if (menuOzluk) menuOzluk.click();
            return;
        }
        scrollToAlerts();
    });
    
    document.getElementById("widget-salary-paid").addEventListener("click", () => {
        const today = new Date();
        let prevMonth = today.getMonth() - 1;
        let prevYear = today.getFullYear();
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }
        goToPuantajMonth(prevYear, prevMonth);
    });
    
    document.getElementById("widget-salary-estimate").addEventListener("click", () => {
        const today = new Date();
        goToPuantajMonth(today.getFullYear(), today.getMonth());
    });
    
    document.getElementById("modal-active-leaves-close").addEventListener("click", () => {
        document.getElementById("modal-active-leaves").classList.remove("active");
    });
    document.getElementById("btn-close-active-leaves").addEventListener("click", () => {
        document.getElementById("modal-active-leaves").classList.remove("active");
    });

    // Puantaj Ay Seçici Açılır Liste Değişimi Dinleyicisi
    document.getElementById("puantaj-month-select").addEventListener("change", (e) => {
        const [year, month] = e.target.value.split("-").map(Number);
        currentPuantajYear = year;
        currentPuantajMonth = month;
        initPuantajDefaultData();
        renderPuantaj();
        renderDashboard(); // Çalışma saati ve maaş bütçesini güncellemek için
        renderIzinModule();
    });

    document.getElementById("personel-search").addEventListener("input", debounce(renderPersonelList, 250));
    document.getElementById("personel-dept-filter").addEventListener("change", renderPersonelList);

    document.getElementById("btn-add-personel").addEventListener("click", () => openPersonelModal(false));
    document.getElementById("modal-personel-close").addEventListener("click", closePersonelModal);
    document.getElementById("btn-cancel-personel").addEventListener("click", closePersonelModal);

    document.getElementById("modal-terminate-close").addEventListener("click", closeTerminateModal);
    document.getElementById("btn-cancel-terminate").addEventListener("click", closeTerminateModal);
    
    document.getElementById("form-terminate-personel").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const empId = document.getElementById("terminate-emp-id").value;
        const termDate = document.getElementById("terminate-date").value;

        const emp = state.employees.find(e => e.id === empId);
        if (emp) {
            emp.status = "passive";
            emp.terminationDate = termDate;
        }

        saveState();
        closeTerminateModal();
        renderPersonelList();
        renderDashboard();
        renderOzlukEmployeeList();
        renderOzlukDocuments();
        renderLeaveRequests();
        renderIzinModule();
        populateBordroEmployeeSelect();
    });

    // Puantaj Günlük modal durum seçimi değişim dinleyicisi (Çalışıyor dışındakilerde mesaiyi pasifleştir)
    document.getElementById("puantaj-day-status").addEventListener("change", (e) => {
        const otInput = document.getElementById("puantaj-day-overtime");
        const otGroup = document.getElementById("puantaj-overtime-group");
        
        if (e.target.value !== "Ç") {
            otGroup.style.opacity = "0.5";
            otInput.disabled = true;
            otInput.value = 0;
        } else {
            otGroup.style.opacity = "1";
            otInput.disabled = false;
        }
    });

    // Puantaj Günlük Modal Buton Tetikleyicileri
    document.getElementById("modal-puantaj-day-close").addEventListener("click", closePuantajDayModal);
    document.getElementById("btn-cancel-puantaj-day").addEventListener("click", closePuantajDayModal);
    
    // Günlük Puantaj Değeri Kaydetme
    document.getElementById("form-puantaj-day").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const empId = document.getElementById("puantaj-day-emp-id").value;
        const dateStr = document.getElementById("puantaj-day-date").value;
        const status = document.getElementById("puantaj-day-status").value;
        const overtimeHours = Number(document.getElementById("puantaj-day-overtime").value);

        if (!state.attendance[empId]) {
            state.attendance[empId] = {};
        }

        state.attendance[empId][dateStr] = {
            status,
            overtimeHours: status === "Ç" ? overtimeHours : 0 // Çalışıyor değilse fazla mesaiyi sıfırla
        };

        saveState();
        closePuantajDayModal();
        renderPuantaj();
        renderDashboard(); // Aylık mesai saatini ve bakedilen maaş toplamını anlık güncelle
    });

    document.getElementById("ozluk-search").addEventListener("input", debounce(renderOzlukEmployeeList, 250));

    document.getElementById("modal-upload-close").addEventListener("click", closeUploadModal);
    document.getElementById("btn-cancel-upload").addEventListener("click", closeUploadModal);

    document.getElementById("modal-email-simulation-close").addEventListener("click", () => {
        document.getElementById("modal-email-simulation").classList.remove("active");
    });
    document.getElementById("btn-close-email-simulation").addEventListener("click", () => {
        document.getElementById("modal-email-simulation").classList.remove("active");
    });

    // Announcement Modal events
    const btnAddAnn = document.getElementById("btn-add-announcement");
    if (btnAddAnn) {
        btnAddAnn.addEventListener("click", () => {
            document.getElementById("form-announcement").reset();
            document.getElementById("modal-announcement").classList.add("active");
        });
    }
    
    document.getElementById("modal-announcement-close").addEventListener("click", () => {
        document.getElementById("modal-announcement").classList.remove("active");
    });
    
    document.getElementById("btn-cancel-announcement").addEventListener("click", () => {
        document.getElementById("modal-announcement").classList.remove("active");
    });
    
    document.getElementById("form-announcement").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const title = document.getElementById("announcement-title").value.trim();
        const content = document.getElementById("announcement-content").value.trim();
        
        const role = sessionStorage.getItem("gl_logged_in_role") || "admin";
        const empId = sessionStorage.getItem("gl_logged_employee_id");
        
        let publisherStr = "Admin";
        if (empId) {
            const emp = state.employees.find(x => x.id === empId);
            if (emp) {
                publisherStr = `${emp.name} ${emp.lastname || ''} ${emp.role}`;
            }
        }
        
        const newAnn = {
            id: `ann-${Date.now()}`,
            title,
            content,
            publisher: publisherStr,
            date: new Date().toISOString().split('T')[0]
        };
        
        if (!state.announcements) state.announcements = [];
        state.announcements.push(newAnn);
        saveState();
        
        document.getElementById("modal-announcement").classList.remove("active");
        renderAnnouncements();
    });

    const dragZone = document.getElementById("drag-drop-zone");
    dragZone.addEventListener("click", () => {
        if (!selectedEmployeeIdForDocs) {
            alert("Lütfen önce sol listeden bir personel seçin.");
            return;
        }
        document.getElementById("upload-file-picker").click();
    });

    document.getElementById("upload-file-picker").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Hata: Yüklemek istediğiniz dosya boyutu 10MB'tan büyüktür!");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById("upload-file-data").value = event.target.result;
            document.getElementById("upload-file-name").value = file.name;
            
            const modal = document.getElementById("modal-upload");
            if (!modal.classList.contains("active")) {
                modal.classList.add("active");
            }
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("puantaj-prev-month").addEventListener("click", () => {
        currentPuantajMonth--;
        if (currentPuantajMonth < 0) {
            currentPuantajMonth = 11;
            currentPuantajYear--;
        }
        initPuantajDefaultData();
        populateMonthSelectDropdown();
        renderPuantaj();
        renderDashboard();
        renderIzinModule();
    });

    document.getElementById("puantaj-next-month").addEventListener("click", () => {
        currentPuantajMonth++;
        if (currentPuantajMonth > 11) {
            currentPuantajMonth = 0;
            currentPuantajYear++;
        }
        initPuantajDefaultData();
        populateMonthSelectDropdown();
        renderPuantaj();
        renderDashboard();
        renderIzinModule();
    });

    // 1. Personel Ekleme / Düzenleme
    document.getElementById("form-personel").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const editId = document.getElementById("personel-edit-id").value;
        const name = document.getElementById("input-name").value.trim();
        const lastname = document.getElementById("input-lastname").value.trim();
        const role = document.getElementById("input-role").value;
        const dept = document.getElementById("input-dept").value;
        const email = document.getElementById("input-email").value;
        const phone = document.getElementById("input-phone").value;
        const hireDate = document.getElementById("input-hire-date").value;
        const salary = Number(document.getElementById("input-salary").value);
        const overtimeRate = Number(document.getElementById("input-overtime-rate").value);
        const gender = document.getElementById("input-gender").value;
        const status = document.getElementById("input-status").value;
        
        // New fields
        const tckn = document.getElementById("input-tckn").value.trim();
        const birthDate = document.getElementById("input-birth-date").value;
        const education = document.getElementById("input-education").value;
        const authority = document.getElementById("input-authority").value;
        const password = document.getElementById("input-password").value.trim();

        // Validation of TCKN
        if (!validateTCKN(tckn)) {
            alert("Hata: Girdiğiniz TC Kimlik Numarası geçersizdir! Lütfen 11 haneli ve yasal algoritmasına uygun bir kimlik numarası giriniz.");
            return;
        }

        // Validation of password length
        if (password.length < 4) {
            alert("Hata: Giriş şifresi en az 4 karakter olmalıdır!");
            return;
        }

        // Auto calculate leave quota based on Law
        const leaveLimit = calculateLegalLeaveLimit(birthDate, hireDate);
        
        let shouldSendEmail = false;
        let targetEmp = null;

        if (editId) {
            const emp = state.employees.find(e => e.id === editId);
            if (emp) {
                const prevPass = emp.password;
                const prevAuth = emp.authority;

                emp.name = name;
                emp.lastname = lastname;
                emp.role = role;
                emp.dept = dept;
                emp.email = email;
                emp.phone = phone;
                emp.hireDate = hireDate;
                emp.salary = salary;
                emp.overtimeRate = overtimeRate;
                emp.gender = gender;
                emp.leaveLimit = leaveLimit;
                
                // New fields
                emp.tckn = tckn;
                emp.birthDate = birthDate;
                emp.education = education;
                emp.authority = authority;
                emp.password = password;
                
                // All employees use the same avatar icon
                emp.avatar = maleAvatar;
                
                if (status !== "passive") {
                    delete emp.terminationDate;
                } else if (!emp.terminationDate) {
                    emp.terminationDate = new Date().toISOString().split('T')[0];
                }
                emp.status = status;

                // Send email if authority is configured and password or authority changed
                if (authority && authority !== "none" && (password !== prevPass || authority !== prevAuth) && status !== "passive") {
                    shouldSendEmail = true;
                    targetEmp = emp;
                }
            }
        } else {
            const newEmpId = `emp-${Date.now()}`;
            const avatarUrl = maleAvatar;

            const newEmp = {
                id: newEmpId,
                name,
                lastname,
                role,
                dept,
                email,
                phone,
                hireDate,
                salary,
                overtimeRate,
                gender,
                leaveLimit,
                status,
                avatar: avatarUrl,
                tckn,
                birthDate,
                education,
                authority,
                password
            };
            state.employees.push(newEmp);

            state.attendance[newEmpId] = {};

            if (authority && authority !== "none" && status !== "passive") {
                shouldSendEmail = true;
                targetEmp = newEmp;
            }
        }

        saveState();
        closePersonelModal();
        renderPersonelList();
        renderDashboard();
        renderOzlukEmployeeList();
        renderIzinModule();
        populateBordroEmployeeSelect(); // Update payroll select list immediately
        initPuantajDefaultData(); 

        if (shouldSendEmail && targetEmp) {
            sendSimulatedEmail(targetEmp, password);
        } 
    });

    // 2. Evrak Yükleme
    document.getElementById("form-upload-doc").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const type = document.getElementById("upload-doc-type").value;
        const expiryDate = document.getElementById("upload-doc-expiry").value;
        const fileName = document.getElementById("upload-file-name").value;
        const fileData = document.getElementById("upload-file-data").value;

        const newDoc = {
            id: `doc-${Date.now()}`,
            employeeId: selectedEmployeeIdForDocs,
            type,
            fileName,
            fileData,
            expiryDate
        };

        state.documents.push(newDoc);
        saveState();
        closeUploadModal();
        renderOzlukDocuments();
        renderDashboard();
        renderOzlukEmployeeList(); 
    });

    // 3. İzin Talebi Oluşturma
    document.getElementById("form-request-leave").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const empId = document.getElementById("leave-employee").value;
        const type = document.getElementById("leave-type").value;
        const startDate = document.getElementById("leave-start-date").value;
        const endDate = document.getElementById("leave-end-date").value;
        const desc = document.getElementById("leave-desc").value;

        const emp = state.employees.find(e => e.id === empId);
        if (!emp) return;

        if (startDate > endDate) {
            alert("Hata: İzin başlangıç tarihi bitiş tarihinden sonra olamaz!");
            return;
        }

        const newRequest = {
            id: `leave-req-${Date.now()}`,
            employeeId: empId,
            employeeName: `${emp.name} ${emp.lastname || ''}`,
            type,
            startDate,
            endDate,
            desc,
            status: "pending"
        };

        state.leaveRequests.push(newRequest);
        saveState();
        document.getElementById("form-request-leave").reset();
        
        renderLeaveRequests();
        renderDashboard();
        renderIzinModule();
    });

    // 4. Bu Ay Kullanılan İzinler Kartı Tıklama Dinleyicisi
    const cardLeaves = document.getElementById("card-this-month-leaves");
    if (cardLeaves) {
        cardLeaves.addEventListener("click", () => {
            const panel = document.getElementById("izin-takip-paneli");
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                switchIzinTab('kullananlar');
                panel.classList.add("flash-highlight");
                setTimeout(() => {
                    panel.classList.remove("flash-highlight");
                }, 3000);
            }
        });
    }

    // --- Supabase Configuration Event Listeners ---
    document.getElementById("btn-cloud-status").addEventListener("click", () => {
        const modal = document.getElementById("modal-firebase-config");
        const urlInput = document.getElementById("supabase-url");
        const keyArea = document.getElementById("firebase-config-json");
        
        const storedUrl = localStorage.getItem("gl_supabase_url");
        const storedKey = localStorage.getItem("gl_supabase_key");
        
        if (storedUrl && storedKey) {
            urlInput.value = storedUrl;
            keyArea.value = storedKey;
            document.getElementById("btn-disconnect-firebase").style.display = "block";
        } else {
            urlInput.value = "https://hzmxcntpvcyybocpjsrc.supabase.co";
            keyArea.value = "";
            document.getElementById("btn-disconnect-firebase").style.display = "none";
        }
        
        document.getElementById("firebase-connection-status").style.display = "none";
        modal.classList.add("active");
    });
    
    document.getElementById("modal-firebase-config-close").addEventListener("click", () => {
        document.getElementById("modal-firebase-config").classList.remove("active");
    });
    
    document.getElementById("btn-cancel-firebase-config").addEventListener("click", () => {
        document.getElementById("modal-firebase-config").classList.remove("active");
    });
    
    document.getElementById("form-firebase-config").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const urlVal = document.getElementById("supabase-url").value.trim();
        const keyVal = document.getElementById("firebase-config-json").value.trim();
        const statusDiv = document.getElementById("firebase-connection-status");
        
        statusDiv.style.display = "block";
        statusDiv.style.background = "rgba(242, 153, 74, 0.1)";
        statusDiv.style.color = "#f2994a";
        statusDiv.style.border = "1px solid rgba(242, 153, 74, 0.3)";
        statusDiv.textContent = "Bağlanıyor ve doğrulanıyor...";
        
        const success = initSupabase(urlVal, keyVal);
        if (success) {
            localStorage.setItem("gl_supabase_url", urlVal);
            localStorage.setItem("gl_supabase_key", keyVal);
            
            if (localStorage.getItem("gl_supabase_migrated") !== "true") {
                statusDiv.textContent = "Veriler buluta aktarılıyor (göç ediliyor)...";
                try {
                    await migrateLocalStorageToSupabase();
                    statusDiv.style.background = "rgba(56, 239, 125, 0.1)";
                    statusDiv.style.color = "#38ef7d";
                    statusDiv.style.border = "1px solid rgba(56, 239, 125, 0.3)";
                    statusDiv.textContent = "Bağlantı ve veri göçü başarıyla tamamlandı!";
                } catch(err) {
                    console.error("Migration error:", err);
                    statusDiv.style.background = "rgba(255, 88, 88, 0.1)";
                    statusDiv.style.color = "#ff5858";
                    statusDiv.style.border = "1px solid rgba(255, 88, 88, 0.3)";
                    statusDiv.textContent = "Veri göçü başarısız oldu: " + err.message;
                    return;
                }
            } else {
                statusDiv.style.background = "rgba(56, 239, 125, 0.1)";
                statusDiv.style.color = "#38ef7d";
                statusDiv.style.border = "1px solid rgba(56, 239, 125, 0.3)";
                statusDiv.textContent = "Bağlantı başarılı!";
            }
            
            startRealTimeSync();
            
            setTimeout(() => {
                document.getElementById("modal-firebase-config").classList.remove("active");
            }, 1500);
        } else {
            statusDiv.style.background = "rgba(255, 88, 88, 0.1)";
            statusDiv.style.color = "#ff5858";
            statusDiv.style.border = "1px solid rgba(255, 88, 88, 0.3)";
            statusDiv.textContent = "Bağlantı kurulamadı! Lütfen konsol loglarını inceleyin.";
        }
    });
    
    document.getElementById("btn-disconnect-firebase").addEventListener("click", () => {
        const confirmDisconnect = confirm("Bulut bağlantısını kesmek istediğinize emin misiniz? Uygulama yerel modda çalışmaya geri dönecektir.");
        if (!confirmDisconnect) return;
        
        stopRealTimeSync();
        supabaseInitialized = false;
        supabaseClient = null;
        
        localStorage.removeItem("gl_supabase_url");
        localStorage.removeItem("gl_supabase_key");
        localStorage.removeItem("gl_supabase_migrated");
        
        updateCloudStatusUI("local");
        document.getElementById("modal-firebase-config").classList.remove("active");
        
        state = {
            employees: JSON.parse(localStorage.getItem("gl_employees")) || defaultEmployees,
            documents: JSON.parse(localStorage.getItem("gl_documents")) || defaultDocuments,
            leaveRequests: JSON.parse(localStorage.getItem("gl_leaveRequests")) || defaultLeaveRequests,
            attendance: JSON.parse(localStorage.getItem("gl_attendance")) || defaultAttendance,
            manager: JSON.parse(localStorage.getItem("gl_manager")) || defaultManager,
            announcements: JSON.parse(localStorage.getItem("gl_announcements")) || defaultAnnouncements,
            personelView: localStorage.getItem("gl_personel_view") || "grid"
        };
        
        refreshAllUI();
        alert("Bulut bağlantısı kesildi. Yerel depolama moduna geçildi.");
    });
}
