// EduLeap Frontend - Full Functionality + Dashboard Stats/Dark Mode
const BASE_URL = 'http://localhost:5000/api';

let currentCourse = '';

// Init
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // Dark mode persistence
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
    loadDashboard();  // Loads user + stats + dynamic courses
});

// Combined Dashboard Load
async function loadDashboard() {
    try {
        const [userRes, statsRes] = await Promise.all([
            fetch(`${BASE_URL}/user`),
            fetch(`${BASE_URL}/stats`)
        ]);
        const user = await userRes.json();
        const stats = await statsRes.json();

        // Welcome & profile
        document.getElementById('welcome').textContent = `Welcome back, ${user.name}!`;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = `${user.name.toLowerCase().replace(' ', '.')}@eduleap.com`;
        updatePoints(user.points);

        // Stats cards
        document.querySelectorAll('.stats-row .stat-item h2')[0].textContent = stats.hours_today;
        document.querySelectorAll('.stats-row .stat-item p')[0].textContent = 'Hours Today';
        document.querySelectorAll('.stats-row .stat-item h2')[1].textContent = stats.hours_week;
        document.querySelectorAll('.stats-row .stat-item p')[1].textContent = 'Hours Week';

        document.querySelectorAll('.stat-line h3')[0].textContent = `${stats.weekly_progress}%`;
        document.querySelectorAll('.stat-line h3')[1].textContent = stats.adventures;

        // Dynamic top courses progress bars from stats
        const uxBar = document.querySelector('.purple-grad .prog-bar span');
        const pythonBar = document.querySelector('.blue-grad .prog-bar span');
        if (uxBar) uxBar.style.width = `${stats.course_progress['UX Design Fundamentals']}%`;
        if (pythonBar) pythonBar.style.width = `${stats.course_progress['Mastering Python']}%`;

        // Dynamic courses cards
        loadDynamicCourses();
    } catch (e) {
        console.error('Dashboard load failed:', e);
    }
}

async function loadDynamicCourses() {
    try {
        const res = await fetch(`${BASE_URL}/courses`);
        const courses = await res.json();
        const container = document.getElementById('dynamicCourses');
        container.innerHTML = courses.slice(2).map(course => `
            <div class="course-mini-card default-grad">
                <strong>${course.name}</strong>
                <small>${course.desc}</small>
                <button class="btn-lime-small" onclick="openVideoModal('${course.name}')">Start Course</button>
            </div>
        `).join('') || '<div class="course-mini-card default-grad"><small>No more courses. Complete current ones!</small></div>';
    } catch (e) {
        console.error('Load dynamic courses failed:', e);
    }
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    document.querySelectorAll('.sidebar li').forEach(li => {
        if (li.getAttribute('onclick')?.includes(pageId)) li.classList.add('active');
    });

    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'progress':
            loadProgress();
            break;
        case 'trends':
            alert('Trends page coming soon!');
            showPage('dashboard');
            break;
        case 'settings':
            alert('Settings page coming soon!');
            showPage('dashboard');
            break;
    }
}

async function loadCourses() {
    try {
        const res = await fetch(`${BASE_URL}/courses`);
        const courses = await res.json();
        document.getElementById('coursesList').innerHTML = courses.map(course => `
            <div class="glass-card course-card">
                <h4>${course.name}</h4>
                <p>${course.desc}</p>
                <button class="btn-lime" onclick="openVideoModal('${course.name}')">Watch Videos</button>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('coursesList').innerHTML = '<p>Start backend server to load courses!</p>';
    }
}

async function loadProgress() {
    try {
        const res = await fetch(`${BASE_URL}/others`);
        const items = await res.json();
        document.getElementById('progressContent').innerHTML = items.map(item => `
            <div class="glass-card progress-item">
                <h4>${item.type}</h4>
                <p>${item.content}</p>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('progressContent').innerHTML = '<p>Start backend to see progress!</p>';
    }
}

// Profile & Modals
function toggleProfile() {
    document.getElementById('profileDropdown').classList.toggle('show');
    document.querySelectorAll('.icon').forEach(icon => icon.style.transform = 'scale(1)');
}

function toggleNotif() {
    alert('Notifications coming soon!');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

function logout() {
    if (confirm('Log out?')) localStorage.removeItem('darkMode');
    window.location.reload();
}

// Video Modal
function openVideoModal(courseName) {
    currentCourse = courseName;
    document.getElementById('modalTitle').textContent = courseName;
    document.getElementById('completeBtn').dataset.course = courseName;
    document.getElementById('videoModal').classList.add('show');
    loadCourseDetail(courseName);
}

async function loadCourseDetail(courseName) {
    try {
        const [videoRes, lecturesRes] = await Promise.all([
            fetch(`${BASE_URL}/course/${courseName}`),
            fetch(`${BASE_URL}/courselectures/${courseName}`)
        ]);
        const videoData = await videoRes.json();
        const lecturesData = await lecturesRes.json();
        document.getElementById('videoPlayer').src = videoData.video_url;
        document.getElementById('lecturesList').innerHTML = lecturesData.lectures.map(l => `<li>${l}</li>`).join('');
    } catch (e) {
        console.error('Course detail failed:', e);
    }
}

function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('show');
    document.getElementById('videoPlayer').src = '';
}

async function completeCourse() {
    try {
        const res = await fetch(`${BASE_URL}/complete-course`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({course_name: currentCourse})
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert(`✅ Completed ${currentCourse}! +20 points (Total: ${data.points})`);
            loadDashboard();  // Refresh stats/progress
            closeVideoModal();
        } else {
            alert('Already completed!');
        }
    } catch (e) {
        alert('Error - ensure backend running on port 5000');
    }
}

function updatePoints(points) {
    const el = document.getElementById('points');
    if (el) el.textContent = `Points: ${points}`;
}

// Close on ESC/click outside
document.addEventListener('keydown', e => e.key === 'Escape' && closeVideoModal());
document.getElementById('videoModal').addEventListener('click', e => {
    if (e.target.classList.contains('modal')) closeVideoModal();
});

// JS Anim: Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
});
document.querySelectorAll('.glass-card, .courses-row, .page').forEach(el => observer.observe(el));
