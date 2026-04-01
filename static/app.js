const BASE_URL = '';
let currentCourse = '';
const CERTIFICATE_SESSION_KEY = 'activeCertificate';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Dark mode persistence
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', document.body.classList.contains('dark') ? 'sun' : 'moon');
        lucide.createIcons();
    }

    loadDashboard();
    initializeModalBehavior();
    restoreCertificateModal();
});

function initializeModalBehavior() {
    const videoModal = document.getElementById('videoModal');
    const certificateModal = document.getElementById('certificateModal');
    const certificateContent = certificateModal?.querySelector('.certificate-modal-content');

    if (videoModal) {
        videoModal.addEventListener('click', (event) => {
            if (event.target === videoModal) {
                closeVideoModal();
            }
        });
    }

    if (certificateContent) {
        certificateContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    if (certificateModal) {
        certificateModal.addEventListener('click', (event) => {
            // Keep the certificate open unless the user uses the explicit action button.
            if (event.target === certificateModal) {
                event.stopPropagation();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        if (videoModal?.classList.contains('show')) {
            closeVideoModal();
        }
    });
}

function setModalState(modal, isOpen) {
    if (!modal) return;

    modal.classList.toggle('show', isOpen);
    document.body.classList.toggle('modal-open', isOpen);
}

function persistCertificateState(courseName, completedDate) {
    try {
        sessionStorage.setItem(
            CERTIFICATE_SESSION_KEY,
            JSON.stringify({ courseName, completedDate })
        );
    } catch (error) {
        console.warn('Unable to save certificate state.');
    }
}

function clearCertificateState() {
    try {
        sessionStorage.removeItem(CERTIFICATE_SESSION_KEY);
    } catch (error) {
        console.warn('Unable to clear certificate state.');
    }
}

function restoreCertificateModal() {
    try {
        const saved = sessionStorage.getItem(CERTIFICATE_SESSION_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        if (!parsed?.courseName) return;

        currentCourse = parsed.courseName;
        showCertificateModal(parsed.courseName, parsed.completedDate);
    } catch (error) {
        console.warn('Unable to restore certificate state.');
        clearCertificateState();
    }
}

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
        case 'dashboard': loadDashboard(); break;
        case 'courses':   loadCourses();   break;
        case 'progress':  loadProgress();  break;
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

// --- DASHBOARD ---
async function loadDashboard() {
    try {
        const [userRes, statsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/user`),
            fetch(`${BASE_URL}/api/stats`)
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
        console.warn('Dashboard API unavailable, using defaults.');
    }
}

// --- COURSES PAGE ---
async function loadCourses() {
    try {
        const res = await fetch(`${BASE_URL}/api/courses`);
        if (!res.ok) throw new Error('API returned non-ok status');
        const courses = await res.json();
        
        // Ensure all courses have video counts
        const coursesWithCounts = courses.map(course => {
            if (!course.videoCount) {
                course.videoCount = getVideoCountForCourse(course.name);
            }
            return course;
        });
        
        renderCoursesList(coursesWithCounts);
    } catch (error) {
        console.warn('Courses API unavailable, loading fallback.');
        loadCoursesFallback();
    }
}

function getVideoCountForCourse(courseName) {
    const videoMap = {
        'Advanced JavaScript': 4,
        'React Complete Guide': 3,
        'Python Mastery': 3,
        'Node.js & Express': 3,
        'Machine Learning A–Z': 4,
        'MongoDB NoSQL': 4,
        'SQL & PostgreSQL': 4,
        'Machine Learning': 3,
        'AWS Cloud Practitioner': 4,
        'Git & GitHub Pro': 4,
        'TypeScript Advanced': 4,
        'Next.js 14 Fullstack': 4,
        'Data Science Python': 4,
        'Cybersecurity Basics': 3,
        'Docker & Kubernetes': 3
    };
    return videoMap[courseName] || 0;
}

function renderCoursesList(courses) {
    const container = document.getElementById('coursesList');
    if (!container) return;

    container.innerHTML = courses.map(course => {
        const safeName = course.name.replace(/'/g, "\\'");
        const videoCount = course.videoCount || course.videos?.length || 0;
        return `
        <div class="course-detailed-card theme-purple">
            <div class="card-visible-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div style="flex: 1;">
                        <h3>${course.name}</h3>
                        <p>${course.desc || ''}</p>
                    </div>
                    <span class="course-badge">${videoCount} Videos</span>
                </div>
            </div>
            <div class="card-expand-content">
                <div class="prog-bar">
                    <span class="prog-fill prog-70"></span>
                </div>
                <button class="btn-lime-small" onclick="openVideoModal('${safeName}')">
                    Continue
                </button>
            </div>
        </div>`;
    }).join('');
}

// Fallback course list when backend is offline
function loadCoursesFallback() {
    const fallbackCourses = [
        { name: 'Advanced JavaScript',     desc: 'ES6+ features deep dive', videoCount: 4 },
        { name: 'React Complete Guide',    desc: 'Hooks, Router, Context, Redux', videoCount: 3 },
        { name: 'Python Mastery',          desc: 'Master Python with projects', videoCount: 3 },
        { name: 'Node.js & Express',       desc: 'Build REST APIs from scratch', videoCount: 3 },
        { name: 'Machine Learning A–Z',    desc: 'ML fundamentals with Python', videoCount: 4 },
        { name: 'TypeScript Advanced',     desc: 'Build scalable JS apps', videoCount: 4 },
        { name: 'Next.js 14 Fullstack',    desc: 'App Router, Server Actions', videoCount: 4 },
        { name: 'MongoDB NoSQL',           desc: 'Build modern apps with MongoDB', videoCount: 4 },
        { name: 'SQL & PostgreSQL',        desc: 'Database design & advanced queries', videoCount: 4 },
        { name: 'AWS Cloud Practitioner',  desc: 'Cloud fundamentals & services', videoCount: 4 },
        { name: 'Git & GitHub Pro',        desc: 'Version control mastery', videoCount: 4 },
        { name: 'Machine Learning',        desc: 'Scikit-learn, TensorFlow basics', videoCount: 3 },
        { name: 'Data Science Python',     desc: 'Pandas, NumPy, Matplotlib, ML', videoCount: 4 },
        { name: 'Cybersecurity Basics',    desc: 'Ethical hacking fundamentals', videoCount: 3 },
        { name: 'Docker & Kubernetes',     desc: 'Containerize & deploy apps', videoCount: 3 },
    ];
    renderCoursesList(fallbackCourses);
}

// --- PROGRESS PAGE ---
async function loadProgress() {
    try {
        const res = await fetch(`${BASE_URL}/api/progress`);
        const progressData = await res.json();
        renderProgress(progressData);
    } catch (error) {
        console.warn('Progress API unavailable, loading fallback.');
        renderProgressFallback();
    }
}

function renderProgressFallback() {
    const progressCourses = [
        { name: 'Advanced JavaScript', watched: 0, total: 4 },
        { name: 'React Complete Guide', watched: 0, total: 3 },
        { name: 'Python Mastery', watched: 0, total: 3 },
        { name: 'Node.js & Express', watched: 0, total: 3 },
        { name: 'Machine Learning A–Z', watched: 0, total: 4 },
        { name: 'MongoDB NoSQL', watched: 0, total: 4 },
    ];
    renderProgress(progressCourses);
}

function renderProgress(courses) {
    const container = document.getElementById('progressContent');
    if (!container) return;

    if (Array.isArray(courses) && courses.length > 0) {
        // Check if it's progress courses (with watched/total) or achievements
        if (courses[0].watched !== undefined) {
            // Render as progress courses
            container.innerHTML = courses.map((course, index) => `
                <div class="progress-course-item">
                    <div class="progress-header">
                        <h4>${course.name}</h4>
                        <span class="progress-badge">${course.watched}/${course.total} videos</span>
                    </div>
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar">
                            <span class="progress-fill" style="width: ${(course.watched / course.total) * 100}%;"></span>
                        </div>
                        <span class="progress-percent">${Math.round((course.watched / course.total) * 100)}% complete</span>
                    </div>
                </div>
            `).join('');
        } else {
            // Render as achievements
            container.innerHTML = courses.map((item, index) => `
                <div class="stat-widget staggered-${index + 1}">
                    <i data-lucide="award" class="widget-icon"></i>
                    <strong>${item.type}</strong>
                    <p>${item.content}</p>
                </div>`
            ).join('');
            lucide.createIcons();
        }
    }
}

// --- VIDEO MODAL ---

// ✅ FIX: startVideo opens modal for the current/last course, or prompts user
function startVideo() {
    const course = currentCourse || 'Advanced JavaScript';
    openVideoModal(course);
}

function openVideoModal(courseName) {
    console.log(`📂 Opening video modal for: "${courseName}"`);
    currentCourse = courseName;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = courseName;
    }
    
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        setModalState(videoModal, true);
    }
    
    // Clear previous content
    const lecturesList = document.getElementById('lecturesList');
    if (lecturesList) {
        lecturesList.innerHTML = '<li style="padding: 1rem; color: #999;">Loading modules...</li>';
    }
    
    loadCoursePlaylist(courseName);
}

function closeVideoModal() {
    const videoModal = document.getElementById('videoModal');
    setModalState(videoModal, false);

    // ✅ FIX: clear src on the element directly — never via innerHTML
    const player = document.getElementById('videoPlayer');
    if (player) player.src = '';

    document.getElementById('lecturesList').innerHTML = '';
}

// Backend-connected playlist loader
async function loadCoursePlaylist(courseName) {
    try {
        console.log(`🔄 Fetching playlist data for: "${courseName}"`);
        const [videoRes, modulesRes] = await Promise.all([
            fetch(`${BASE_URL}/api/course/${encodeURIComponent(courseName)}`),
            fetch(`${BASE_URL}/api/course/${encodeURIComponent(courseName)}/modules`)
        ]);

        if (!videoRes.ok || !modulesRes.ok) {
            console.warn(`⚠️ API response not ok (video: ${videoRes.status}, modules: ${modulesRes.status})`);
            throw new Error('API response not ok');
        }

        const videoData   = await videoRes.json();
        const modulesData = await modulesRes.json();

        if (videoData.video_url) {
            console.log(`✅ Got video URL from API: ${videoData.video_url}`);
            setVideoSrc(videoData.video_url);
        } else {
            throw new Error('No video URL in response');
        }
        
        if (modulesData && modulesData.length > 0) {
            console.log(`✅ Got ${modulesData.length} modules from API`);
            renderPlaylist(modulesData);
        } else {
            throw new Error('No modules data');
        }
    } catch (error) {
        console.warn(`⚠️ Playlist API unavailable for "${courseName}", using fallback:`, error.message);
        loadCoursePlaylistFallback(courseName);
    }
}

// ✅ FIX: always set iframe src via .src property, never innerHTML
function setVideoSrc(url) {
    const player = document.getElementById('videoPlayer');
    if (!player) {
        console.error('❌ Video player element not found!');
        return;
    }

    let src = url;
    
    // Ensure proper YouTube embed format
    if (!src.includes('youtube.com/embed') && !src.includes('youtu.be')) {
        // If it's just a video ID, convert it
        if (src.length < 20 && !src.includes('/')) {
            src = `https://www.youtube.com/embed/${src}`;
        }
    }
    
    // Add parameters for better compatibility
    if (src.includes('youtube.com/embed')) {
        const sep = src.includes('?') ? '&' : '?';
        src += sep + 'autoplay=0&mute=0&enablejsapi=1&rel=0';
    }
    
    console.log(`📹 Setting video source: ${src}`);
    player.src = src;
    
    player.onerror = () => {
        console.warn('⚠️ Video failed to load. Check if URL is correct.');
        player.style.background = 'rgba(0,0,0,0.8)';
    };
    
    player.onload = () => {
        console.log('✅ Video loaded successfully');
    };
}

function renderPlaylist(videos) {
    const list = document.getElementById('lecturesList');
    if (!list) return;

    list.innerHTML = videos.map((video, index) => {
        const videoTitle = typeof video === 'string' ? video : video.title;
        const duration = video.duration || '';
        const videoId = video.id || '';
        const isCompleted = video.completed || false;
        
        return `
        <li class="video-item ripple ${isCompleted ? 'watched' : ''}"
            onclick="playVideo('${videoId}'); markAsWatched(this)"
            data-video="${videoTitle}"
            data-video-id="${videoId}">
            <div class="video-icon">
                <i data-lucide="${isCompleted ? 'check-circle' : 'play-circle'}" class="mod-icon"></i>
            </div>
            <div class="video-info">
                <span class="video-title">${videoTitle}</span>
                <span class="video-duration">${duration}</span>
            </div>
        </li>`;
    }).join('');

    // Auto-play first video
    if (videos.length > 0 && videos[0].id) {
        playVideo(videos[0].id);
    }

    lucide.createIcons();
    updateCourseProgress();
}

function playVideo(videoId) {
    if (!videoId) return;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
    setVideoSrc(embedUrl);
    console.log(`▶️ Playing video: ${videoId}`);
}

// Fallback playlist data with detailed video topics and durations
function loadCoursePlaylistFallback(courseName) {
    const fallback = {
        'Advanced JavaScript': {
            url: 'https://www.youtube.com/embed/PkZNo7MFNFg',
            videos: [
                { title: 'Arrow Functions & This Binding', duration: '16:20', id: 'PkZNo7MFNFg' },
                { title: 'Promises & Async/Await', duration: '24:45', id: 'PoRJizFvM7s' },
                { title: 'ES6 Modules & Imports', duration: '18:30', id: 'cRHQGsb4_BS8' },
                { title: 'Destructuring & Spread Operator', duration: '14:10', id: 'NIq3qLaHCIS' }
            ]
        },
        'React Complete Guide': {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            videos: [
                { title: 'React Fundamentals', duration: '20:15', id: 'dQw4w9WgXcQ' },
                { title: 'Hooks & State Management', duration: '25:40', id: 'cKzP3-kA7gM' },
                { title: 'React Router Navigation', duration: '19:25', id: '0fCvohUG6nM' }
            ]
        },
        'Python Mastery': {
            url: 'https://www.youtube.com/embed/eXBD2bB3-w0',
            videos: [
                { title: 'Python Basics & Setup', duration: '15:45', id: 'eXBD2bB3-w0' },
                { title: 'Data Structures Deep Dive', duration: '22:30', id: 'EJ-bHkD8cXo' },
                { title: 'OOP Principles Explained', duration: '19:15', id: 'wfcWRAxRjT0' }
            ]
        },
        'Node.js & Express': {
            url: 'https://www.youtube.com/embed/0oXYLzuucwE',
            videos: [
                { title: 'Node.js Core Concepts', duration: '18:50', id: '0oXYLzuucwE' },
                { title: 'Express Routing & Middleware', duration: '21:30', id: 'TNV0_7QcHJ4' },
                { title: 'JWT Authentication', duration: '17:45', id: 'SnoAwLP1aYA' }
            ]
        },
        'Cybersecurity Basics': {
            url: 'https://www.youtube.com/embed/86cQJ0MMmrc',
            videos: [
                { title: 'Introduction to Security', duration: '16:20', id: '86cQJ0MMmrc' },
                { title: 'Network Threats & Prevention', duration: '23:15', id: 'hxrHfjxwBW8' },
                { title: 'Encryption & SSL/TLS', duration: '19:40', id: 'HEb2-NKCUOA' }
            ]
        },
        'Docker & Kubernetes': {
            url: 'https://www.youtube.com/embed/fqMOX6JJhGo',
            videos: [
                { title: 'Docker Basics & Images', duration: '22:10', id: 'fqMOX6JJhGo' },
                { title: 'Containerization Best Practices', duration: '19:35', id: '3RtaDHkQuKA' },
                { title: 'Kubernetes Deployment', duration: '25:20', id: 'X48VuDVv0Z0' }
            ]
        },
        'Machine Learning A–Z': {
            url: 'https://www.youtube.com/embed/aircAruvnKk',
            videos: [
                { title: 'ML Fundamentals', duration: '21:45', id: 'aircAruvnKk' },
                { title: 'Regression Algorithms', duration: '26:30', id: '4qVRBYAdVSo' },
                { title: 'Classification Techniques', duration: '23:15', id: 'K_QaSMzS5IQ' },
                { title: 'Neural Networks Intro', duration: '28:40', id: 'ILGXo8-ZG30' }
            ]
        },
        'MongoDB NoSQL': {
            url: 'https://www.youtube.com/embed/ofme2o29ngU',
            videos: [
                { title: 'MongoDB Basics & Setup', duration: '18:30', id: 'ofme2o29ngU' },
                { title: 'CRUD Operations', duration: '22:15', id: 'VzVOvI2F1SY' },
                { title: 'Aggregation Pipeline', duration: '25:45', id: 'HS_h4iCdZow' },
                { title: 'Indexing & Performance', duration: '20:30', id: 'z1xbXM6sNPM' }
            ]
        },
        'SQL & PostgreSQL': {
            url: 'https://www.youtube.com/embed/9Pzj7Aj25lw',
            videos: [
                { title: 'SQL Fundamentals', duration: '19:20', id: '9Pzj7Aj25lw' },
                { title: 'Advanced Joins & Subqueries', duration: '24:10', id: 'BHwzDmr6d7s' },
                { title: 'Database Design & Normalization', duration: '26:45', id: '4f2m91eKzhE' },
                { title: 'Transactions & Optimization', duration: '21:30', id: 'Y-_2nWLRmYA' }
            ]
        },
        'Machine Learning': {
            url: 'https://www.youtube.com/embed/Gv9_4yMHDdc',
            videos: [
                { title: 'Scikit-learn Basics', duration: '17:45', id: 'Gv9_4yMHDdc' },
                { title: 'TensorFlow Fundamentals', duration: '23:20', id: 'tPYj3fFJMYw' },
                { title: 'Deep Learning with Keras', duration: '25:10', id: 'U7xdiGc7IRU' }
            ]
        },
        'AWS Cloud Practitioner': {
            url: 'https://www.youtube.com/embed/SOTamCETW8w',
            videos: [
                { title: 'AWS Core Services', duration: '20:15', id: 'SOTamCETW8w' },
                { title: 'EC2, S3 & RDS Deep Dive', duration: '27:30', id: 'EJ-bHkD8cXo' },
                { title: 'Security & IAM Essentials', duration: '22:45', id: 'F1sX69OOLfI' },
                { title: 'Cost Optimization & Best Practices', duration: '19:20', id: 'bSWnZIzRdDc' }
            ]
        },
        'Git & GitHub Pro': {
            url: 'https://www.youtube.com/embed/RGOj5yH7evk',
            videos: [
                { title: 'Git Fundamentals', duration: '16:50', id: 'RGOj5yH7evk' },
                { title: 'Branching & Merging', duration: '20:30', id: 'w3jLJU7DT5W' },
                { title: 'GitHub Collaboration', duration: '23:15', id: 'LrdJiKGxtsM' },
                { title: 'Advanced Git Workflows', duration: '24:40', id: 'b9-LA3vrtPE' }
            ]
        },
        'TypeScript Advanced': {
            url: 'https://www.youtube.com/embed/1TW9T5GCZOE',
            videos: [
                { title: 'TypeScript Type System', duration: '19:45', id: '1TW9T5GCZOE' },
                { title: 'Generics & Utility Types', duration: '22:10', id: 'yLT0aUnvmXU' },
                { title: 'Decorators & Metadata', duration: '20:30', id: 'nMkjFaOB3rQ' },
                { title: 'Advanced Patterns & Best Practices', duration: '25:15', id: 'nZPLuXvNHTc' }
            ]
        },
        'Next.js 14 Fullstack': {
            url: 'https://www.youtube.com/embed/J1JqbJL9KgI',
            videos: [
                { title: 'Next.js 14 Fundamentals', duration: '21:30', id: 'J1JqbJL9KgI' },
                { title: 'App Router & Server Components', duration: '26:20', id: '0TLngF5rZ60' },
                { title: 'API Routes & Authentication', duration: '24:45', id: 'VGGkjMDZ5c4' },
                { title: 'Deployment & Optimization', duration: '22:15', id: '4j7qDJLnqQw' }
            ]
        },
        'Data Science Python': {
            url: 'https://www.youtube.com/embed/LHBE6newXaQ',
            videos: [
                { title: 'Pandas & Data Manipulation', duration: '23:45', id: 'LHBE6newXaQ' },
                { title: 'NumPy & Numerical Computing', duration: '20:15', id: 'F-y8JsZiQ2k' },
                { title: 'Matplotlib & Data Visualization', duration: '22:30', id: 'wvKAO_4Bmqc' },
                { title: 'Machine Learning with Scikit-learn', duration: '25:50', id: 'pqNCD_5r0IU' }
            ]
        },
    };

    const data = fallback[courseName] || fallback['Advanced JavaScript'];

    console.log(`🎬 Loading video for course: "${courseName}" | URL: ${data.url}`);
    setVideoSrc(data.url);
    renderPlaylist(data.videos);
}

// --- PLAYLIST INTERACTIONS ---
async function markAsWatched(element) {
    if (element.classList.contains('watched')) return;

    element.classList.add('watched');
    const icon = element.querySelector('.mod-icon');
    if (icon) { icon.setAttribute('data-lucide', 'check-circle'); lucide.createIcons(); }

    try {
        await fetch(`${BASE_URL}/api/complete-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                course_name: currentCourse, 
                video_name: element.dataset.video || element.dataset.module 
            })
        });
    } catch (e) {
        console.warn('Video sync failed (offline mode).');
    }

    updateCourseProgress();
}

function updateCourseProgress() {
    const watched = document.querySelectorAll('#lecturesList li.watched').length;
    const total   = document.querySelectorAll('#lecturesList li').length;
    const pct     = total ? Math.round((watched / total) * 100) : 0;
    console.log(`📊 Progress: ${watched}/${total} (${pct}%)`);
}

function filterPlaylists() {
    const input = (document.getElementById('playlistSearchInput')?.value || '').toLowerCase();
    document.querySelectorAll('#lecturesList li').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(input) ? 'flex' : 'none';
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
    const checked = document.querySelectorAll('#certView .topic-check:checked').length;
    const area    = document.getElementById('certDownloadArea');
    if (area) area.style.display = checked === 4 ? 'block' : 'none';
}

function completeCourse() {
    console.log('🎓 Completing course:', currentCourse);
    
    // Validate course name exists
    if (!currentCourse) {
        console.error('❌ No course selected!');
        alert('Please select a course first');
        return;
    }
    
    // Try to sync with backend
    try {
        fetch(`${BASE_URL}/api/complete-course`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_name: currentCourse })
        }).then(res => res.json())
          .then(data => console.log('✅ Course saved:', data))
          .catch(e => console.log('Backend sync failed (offline mode):', e.message));
    } catch (error) {
        console.log('🎉 Course completion (offline mode)');
    }

    // Close video modal
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        setModalState(videoModal, false);
        console.log('✅ Video modal closed');
    }
    
    // Show certificate modal after short delay
    console.log('🏆 Showing certificate for:', currentCourse);
    setTimeout(() => {
        showCertificateModal(currentCourse);
    }, 200);
}

function showCertificateModal(courseName, savedDate = null) {
    console.log(`🏆 Showing certificate for: "${courseName}"`);
    
    try {
        const certCourseName = document.getElementById('certCourseName');
        const certDate = document.getElementById('certDate');
        const certificateModal = document.getElementById('certificateModal');
        
        if (!certificateModal) {
            console.error('❌ Certificate modal element not found!');
            alert(`🎉 Course "${courseName}" completed!\n\nCertificate modal not found in HTML.`);
            return;
        }
        
        // Set course name
        if (certCourseName) {
            certCourseName.textContent = courseName;
            console.log('✅ Course name set:', courseName);
        } else {
            console.warn('⚠️ Certificate course name element not found');
        }
        
        // Set completion date
        const today = savedDate || new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        if (certDate) {
            certDate.textContent = today;
            console.log('✅ Completion date set:', today);
        } else {
            console.warn('⚠️ Certificate date element not found');
        }
        
        // Show modal
        setModalState(certificateModal, true);
        persistCertificateState(courseName, today);
        console.log('✅ Certificate modal displayed');
    } catch (error) {
        console.error('❌ Error showing certificate:', error);
        alert(`🎉 Course "${courseName}" completed successfully!`);
    }
}

function closeCertificateModal() {
    console.log('🔚 Closing certificate modal');
    const certificateModal = document.getElementById('certificateModal');
    if (certificateModal) {
        setModalState(certificateModal, false);
        clearCertificateState();
        console.log('✅ Certificate modal closed');
    }
    
    // Return to dashboard
    setTimeout(() => {
        showPage('dashboard');
        loadDashboard();
    }, 200);
}

function downloadCertificate() {
    const courseName = document.getElementById('certCourseName').textContent;
    const completedDate = document.getElementById('certDate').textContent;
    
    // Create SVG certificate
    const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#0d1b4d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1a3a6d;stop-opacity:1" />
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="600" fill="url(#grad1)"/>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#b6ff40" stroke-width="3"/>
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#b6ff40" stroke-width="1" opacity="0.5"/>
        
        <!-- Header -->
        <text x="400" y="80" font-size="48" font-weight="bold" text-anchor="middle" fill="#b6ff40" font-family="Arial">
            Certificate of Completion
        </text>
        
        <!-- Decorative line -->
        <line x1="150" y1="110" x2="650" y2="110" stroke="#b6ff40" stroke-width="2" opacity="0.5"/>
        
        <!-- Main message -->
        <text x="400" y="160" font-size="20" text-anchor="middle" fill="#ffffff" font-family="Arial">
            This is to certify that
        </text>
        
        <!-- Name/Course -->
        <text x="400" y="240" font-size="32" font-weight="bold" text-anchor="middle" fill="#b6ff40" font-family="Georgia">
            ${courseName}
        </text>
        
        <text x="400" y="290" font-size="18" text-anchor="middle" fill="#ffffff" font-family="Arial">
            has been successfully completed with dedication and excellence
        </text>
        
        <!-- Date -->
        <text x="400" y="360" font-size="16" text-anchor="middle" fill="#aaaaaa" font-family="Arial">
            Completed on ${completedDate}
        </text>
        
        <!-- Footer -->
        <text x="400" y="480" font-size="14" text-anchor="middle" fill="#cccccc" font-family="Arial" font-style="italic">
            EduLeap Professional Learning Management System
        </text>
        
        <!-- Signature line -->
        <line x1="250" y1="540" x2="350" y2="540" stroke="#b6ff40" stroke-width="1.5"/>
        <text x="300" y="560" font-size="12" text-anchor="middle" fill="#aaaaaa" font-family="Arial">
            Authorized by EduLeap
        </text>
    </svg>`;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduLeap_Certificate_${courseName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`📥 Certificate downloaded for: "${courseName}"`);
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

// --- CERTIFICATION ---
function checkComplete() {
    const checked = document.querySelectorAll('#certView .topic-check:checked').length;
    const area    = document.getElementById('certDownloadArea');
    if (area) {
        area.classList.toggle('cert-hidden', checked < 3);
    }
}
