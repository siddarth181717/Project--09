const BASE_URL = 'http://localhost:5000/api';
let currentCourse = '';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // Dark mode persistence
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
    loadDashboard();
});

// --- NAVIGATION LOGIC ---
function showPage(pageId) {
    // 1. "Coming Soon" Alerts for specific pages
    if (pageId === 'trends' || pageId === 'settings') {
        alert(`${pageId.charAt(0).toUpperCase() + pageId.slice(1)} page is coming soon!`);
        return; 
    }

    // 2. Hide all pages and remove active class from nav items
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));

    // 3. Show target page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        // Set specific nav item active by ID (Assumes HTML IDs like nav-dashboard, nav-courses, etc.)
        const navItem = document.getElementById(`nav-${pageId}`);
        if (navItem) {
            navItem.classList.add('active');
        } else {
            // Fallback for different naming conventions
            document.querySelectorAll('.nav-item').forEach(li => {
                if (li.getAttribute('onclick')?.includes(pageId)) li.classList.add('active');
            });
        }
    }

    // 4. Trigger data loads based on page
    if (pageId === 'dashboard') loadDashboard();
    if (pageId === 'courses') loadCourses();
    if (pageId === 'progress') loadProgress();
}

// --- THEME TOGGLE ---
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    
    // Update Icon if you have an element with ID themeIcon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

// --- DASHBOARD DATA ---
async function loadDashboard() {
    try {
        const [userRes, statsRes] = await Promise.all([
            fetch(`${BASE_URL}/user`),
            fetch(`${BASE_URL}/stats`)
        ]);
        const user = await userRes.json();
        const stats = await statsRes.json();

        // Welcome & profile text
        const welcomeEl = document.getElementById('welcome');
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.name}!`;
        
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = user.name;
        
        // Stats Numbers
        const hrsToday = document.getElementById('hrs-today');
        if (hrsToday) hrsToday.textContent = stats.hours_today;
        
        const hrsWeek = document.getElementById('hrs-week');
        if (hrsWeek) hrsWeek.textContent = stats.hours_week;

    } catch (e) {
        console.error('Dashboard load failed:', e);
    }
}

// --- COURSE & STATS LOADING ---
async function loadCourses() {
    try {
        const res = await fetch(`${BASE_URL}/courses`);
        const courses = await res.json();
        const container = document.getElementById('coursesList');
        if (container) {
            container.innerHTML = courses.map(course => `
                <div class="glass-card course-full-card" style="margin-bottom:15px; padding:20px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3>${course.name}</h3>
                        <p>${course.desc}</p>
                    </div>
                    <button class="btn-lime-small" onclick="openVideoModal('${course.name}')">Watch Videos</button>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Courses load failed:', e);
    }
}

async function loadProgress() {
    try {
        const res = await fetch(`${BASE_URL}/others`);
        const items = await res.json();
        const container = document.getElementById('progressContent');
        if (container) {
            container.innerHTML = items.map(item => `
                <div class="stat-widget" style="margin-bottom:15px; background:var(--glass); padding:20px; border-radius:15px; border-left:5px solid var(--lime);">
                    <strong>${item.type}</strong>
                    <p>${item.content}</p>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Progress load failed:', e);
    }
}

// --- MODALS & VIDEO ---
function openVideoModal(courseName) {
    currentCourse = courseName;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = courseName;
    
    const modal = document.getElementById('videoModal');
    if (modal) modal.classList.add('show');
    
    loadCourseDetail(courseName);
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) modal.classList.remove('show');
    
    const player = document.getElementById('videoPlayer');
    if (player) player.src = '';
}

async function loadCourseDetail(courseName) {
    try {
        const res = await fetch(`${BASE_URL}/course/${courseName}`);
        const data = await res.json();
        const player = document.getElementById('videoPlayer');
        if (player) player.src = data.video_url;
    } catch (e) { console.error(e); }
}

function toggleProfile() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

function logout() {
    if (confirm('Log out?')) {
        localStorage.removeItem('darkMode');
        window.location.reload();
    }
}

// Certification Checklist Check
function checkComplete() {
    const checks = document.querySelectorAll('.topic-check');
    const allDone = Array.from(checks).every(c => c.checked);
    const downloadArea = document.getElementById('certDownloadArea');
    if (downloadArea) downloadArea.style.display = allDone ? 'block' : 'none';
}

function completeCourse() {
    closeVideoModal();
    // Logic to show certificate checklist view
    const certTitle = document.getElementById('currentCourseTitle');
    if (certTitle) certTitle.textContent = `Certification: ${currentCourse}`;
    showPage('certView');
}   