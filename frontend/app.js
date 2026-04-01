const BASE_URL = 'http://localhost:5000/api';
let currentCourse = '';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Dark mode persistence
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }

    // set dark mode icon
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', document.body.classList.contains('dark') ? 'sun' : 'moon');
    }

    loadDashboard();
});

// --- NAVIGATION ---
function showPage(pageId) {
    if (pageId === 'trends' || pageId === 'settings') {
        alert(`${pageId.charAt(0).toUpperCase() + pageId.slice(1)} page coming soon!`);
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        const navItem = document.getElementById(`nav-${pageId}`);
        if (navItem) navItem.classList.add('active');
    }

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
    }
}

// --- THEME TOGGLE ---
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

// --- DASHBOARD (Backend Connected) ---
async function loadDashboard() {
    try {
        const [userRes, statsRes] = await Promise.all([
            fetch(`${BASE_URL}/user`),
            fetch(`${BASE_URL}/stats`)
        ]);
        const user = await userRes.json();
        const stats = await statsRes.json();

        const welcomeEl = document.querySelector('#welcome');
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.name}! (${user.points} XP)`;

        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.textContent = user.name;

        const statH2s = document.querySelectorAll('.stats-row h2');
        if (statH2s[0]) statH2s[0].textContent = stats.hours_today;
        if (statH2s[1]) statH2s[1].textContent = stats.hours_week;
    } catch (error) {
        console.error('Dashboard load failed:', error);
    }
}

// --- COURSES PAGE (Backend Connected) ---
async function loadCourses() {
    try {
        const res = await fetch(`${BASE_URL}/courses`);
        const courses = await res.json();

        const container = document.getElementById('coursesList');
        if (container) {
            container.innerHTML = courses.map(course => {
                const safeName = course.name.replace(/'/g, "\\'");
                return `
                <div class="course-detailed-card theme-purple">
                    <div class="card-visible-content">
                        <h3>${course.name}</h3>
                        <p>${course.desc}</p>
                    </div>
                    <div class="card-expand-content">
                        <div class="prog-bar">
                            <span class="prog-fill" style="width: 45%;"></span>
                        </div>
                        <button class="btn-lime-small" onclick="openVideoModal('${safeName}')">
                            Continue
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Courses load failed:', error);
    }
}

// --- PROGRESS PAGE (Backend Connected) ---
async function loadProgress() {
    try {
        const res = await fetch(`${BASE_URL}/others`);
        const achievements = await res.json();

        const container = document.getElementById('progressContent');
        if (container) {
            container.innerHTML = achievements.map((item, index) => {
                return `
                <div class="stat-widget staggered-${index + 1}">
                    <i data-lucide="award" class="widget-icon"></i>
                    <strong>${item.type}</strong>
                    <p>${item.content}</p>
                </div>`;
            }).join('');
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Progress load failed:', error);
    }
}

// --- VIDEO MODAL (just logic, see CSS below) ---
function openVideoModal(courseName) {
    currentCourse = courseName;
    document.getElementById('modalTitle').textContent = courseName;
    document.getElementById('videoModal').classList.add('show');
    loadCoursePlaylist(courseName);
    
    // Trigger play after load
    setTimeout(() => {
        playVideo();
    }, 1000);
}

function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('show');
    document.getElementById('videoPlayer').src = '';
    document.getElementById('lecturesList').innerHTML = '';
}

// 🔥 Backend-connected course loader
async function loadCoursePlaylist(courseName) {
    try {
        const [videoRes, modulesRes] = await Promise.all([
            fetch(`${BASE_URL}/course/${encodeURIComponent(courseName)}`),
            fetch(`${BASE_URL}/course/${encodeURIComponent(courseName)}/modules`)
        ]);

        const videoData = await videoRes.json();
        const modulesData = await modulesRes.json();

        // Load video with autoplay params
        let videoSrc = videoData.video_url;
        if (videoSrc.includes('youtube.com/embed')) {
            videoSrc += (videoSrc.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&enablejsapi=1&playsinline=1';
        }
        document.getElementById('videoPlayer').src = videoSrc;

        // Load playlist
        const lecturesList = document.getElementById('lecturesList');
        lecturesList.innerHTML = modulesData.map(module => {
            return `
            <li class="ripple ${module.completed ? 'watched' : ''}"
                onclick="markAsWatched(this)"
                data-module="${module.name}">
                <i data-lucide="${module.completed ? 'check-circle' : 'play-circle'}" class="mod-icon"></i>
                <span>${module.name}</span>
            </li>`;
        }).join('');
        lucide.createIcons();
        document.getElementById('moduleCount').textContent = `${modulesData.length} Videos`;
        updateCourseProgress();
    } catch (error) {
        console.error('Course load failed:', error);
        // Fallback to mock data
        loadCoursePlaylistFallback(courseName);
    }
}

// Fallback for offline/demo
function loadCoursePlaylistFallback(courseName) {
    const fallbackData = {
        'UX Design Fundamentals': {
            video_url: 'https://www.youtube.com/embed/1j_ziLiYY2A',
            modules: [
                { name: 'UX Research', completed: false },
                { name: 'Wireframing', completed: false },
                { name: 'Prototyping', completed: false }
            ]
        },
        'Python Mastery': {
            video_url: 'https://www.youtube.com/embed/YYXdXT2l-Gg',
            modules: [
                { name: 'Basics', completed: false },
                { name: 'Data Structures', completed: false },
                { name: 'OOP', completed: false }
            ]
        }
    };

    const data = fallbackData[courseName] || fallbackData['UX Design Fundamentals'];
    let videoSrc = data.video_url;
    if (videoSrc.includes('youtube.com/embed')) {
        videoSrc += (videoSrc.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&enablejsapi=1&playsinline=1';
    }
    document.getElementById('videoPlayer').src = videoSrc;

    const lecturesList = document.getElementById('lecturesList');
    lecturesList.innerHTML = data.modules.map(module => {
        return `
        <li class="ripple ${module.completed ? 'watched' : ''}"
            onclick="markAsWatched(this)"
            data-module="${module.name}">
            <i data-lucide="${module.completed ? 'check-circle' : 'play-circle'}" class="mod-icon"></i>
            <span>${module.name}</span>
        </li>`;
    }).join('');
    lucide.createIcons();
    document.getElementById('moduleCount').textContent = `${data.modules.length} Videos`;
    updateCourseProgress();
}

// --- PLAYLIST INTERACTIONS (Backend POST) ---
async function markAsWatched(element) {
    const wasWatched = element.classList.contains('watched');
    const moduleName = element.dataset.module;

    if (!wasWatched) {
        element.classList.add('watched');
        const icon = element.querySelector('.mod-icon');
        icon.setAttribute('data-lucide', 'check-circle');
        lucide.createIcons();

        try {
            const res = await fetch(`${BASE_URL}/complete-module`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_name: currentCourse,
                    module_name: moduleName
                })
            });
            const data = await res.json();
            console.log('✅ Module completed! +50pts:', data.points);
        } catch (error) {
            console.error('Module completion failed:', error);
        }
    }

    updateCourseProgress();
}

function updateCourseProgress() {
    const watched = document.querySelectorAll('#lecturesList li.watched').length;
    const total = document.querySelectorAll('#lecturesList li').length;
    const progress = total ? Math.round((watched / total) * 100) : 0;
    console.log(`📊 Progress: ${watched}/${total} (${progress}%)`);
}

function filterPlaylists() {
    const input = document.getElementById('playlistSearchInput')?.value.toLowerCase() || '';
    const items = document.querySelectorAll('#lecturesList li');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(input) ? 'flex' : 'none';
    });
}

// --- PROFILE & UTILITY ---
function toggleProfile() {
    document.getElementById('profileDropdown').classList.toggle('show');
}

function logout() {
    if (confirm('Log out?')) {
        localStorage.removeItem('darkMode');
        window.location.reload();
    }
}

// Helper to trigger video play (user gesture compliant)
window.playVideo = function() {
    const player = document.getElementById('videoPlayer');
    if (player && player.play) {
        player.play().catch(e => console.log('Autoplay prevented:', e));
    }
};

// --- CERTIFICATION ---
function checkComplete() {
    const checks = document.querySelectorAll('#certView .topic-check:checked');
    const allDone = checks.length === 4;
    const downloadArea = document.getElementById('certDownloadArea');
    if (downloadArea) {
        downloadArea.style.display = allDone ? 'block' : 'none';
    }
}

async function completeCourse() {
    try {
        const res = await fetch(`${BASE_URL}/complete-course`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_name: currentCourse })
        });
        const data = await res.json();
        alert(data.message);
        closeVideoModal();
        document.getElementById('currentCourseTitle').textContent = `Certification: ${currentCourse}`;
        showPage('certView');
        loadDashboard();
    } catch (error) {
        console.error('Course completion failed:', error);
        alert('Course completed! +500 bonus points 🎉');
    }
}