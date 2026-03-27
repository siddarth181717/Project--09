import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Bell, Moon } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [completedCourses, setCompletedCourses] = useState([]);
  const [points, setPoints] = useState(0);
  const [user, setUser] = useState('');
  const [studyData, setStudyData] = useState([2,3,1,4,2]);
  const [isDark, setIsDark] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newName, setNewName] = useState('');

  const chartRef = useRef(null);

  useEffect(() => {
    // Load from localStorage
    const savedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const savedPoints = parseInt(localStorage.getItem("points")) || 0;
    const savedUser = localStorage.getItem("user") || '';
    const savedStudyData = JSON.parse(localStorage.getItem("studyData")) || [2,3,1,4,2];
    const savedIsDark = localStorage.getItem("isDark") === 'true';

    setCompletedCourses(savedCourses);
    setPoints(savedPoints);
    setUser(savedUser);
    setStudyData(savedStudyData);
    setIsDark(savedIsDark);
    document.body.classList.toggle('dark', savedIsDark);
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("courses", JSON.stringify(completedCourses));
    localStorage.setItem("points", points);
    localStorage.setItem("user", user);
    localStorage.setItem("studyData", JSON.stringify(studyData));
    localStorage.setItem("isDark", isDark);
    document.body.classList.toggle('dark', isDark);
  }, [completedCourses, points, user, studyData, isDark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudyData(prev => {
        const newData = [...prev, Math.floor(Math.random() * 5) + 1];
        return newData.slice(-5);
      });
    }, 10000); // Update chart every 10s
    return () => clearInterval(interval);
  }, []);

  const addPoints = (x) => setPoints(p => p + x);

  const completeCourse = (name) => {
    if (!completedCourses.includes(name)) {
      setCompletedCourses([...completedCourses, name]);
      addPoints(20);
    }
  };

  const generateCertificate = () => {
    const text = `
Certificate of Completion

This is to certify that ${user || 'Student'}
has successfully completed:
${completedCourses.join(', ') || 'courses'}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "certificate.txt";
    link.click();
  };

  const toggleDark = () => setIsDark(!isDark);

  const toggleNotif = () => setShowNotif(!showNotif);

  const toggleProfile = () => setShowProfile(!showProfile);

  const saveSettings = () => {
    setUser(newName);
    setNewName('');
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const navToPage = (page) => {
    setCurrentPage(page);
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      label: 'Study Hours',
      data: studyData,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderWidth: 3,
      tension: 0.4
    }]
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>EduLeap</h2>
        <ul>
          <li className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => navToPage('dashboard')}>
            🏠 Dashboard
          </li>
          <li className={currentPage === 'courses' ? 'active' : ''} onClick={() => navToPage('courses')}>
            📚 Courses
          </li>
          <li className={currentPage === 'progress' ? 'active' : ''} onClick={() => navToPage('progress')}>
            📈 Progress
          </li>
          <li className={currentPage === 'settings' ? 'active' : ''} onClick={() => navToPage('settings')}>
            ⚙️ Settings
          </li>
        </ul>
      </aside>

      {/* Main */}
      <main>
        {/* Topbar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="top-actions">
            <div className="icon" onClick={toggleNotif}>
              <Bell size={20} />
              <span className="dot"></span>
            </div>
            <div className="icon" onClick={toggleDark}>
              <Moon size={20} />
            </div>
            <div className="profile" onClick={toggleProfile}>
              👤
              {showProfile && (
                <div className="dropdown">
                  <p>Profile</p>
                  <p>Settings</p>
                  <p onClick={logout}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pages */}
        {currentPage === 'dashboard' && (
          <div className="page">
            <p id="welcome">Welcome, {user || 'User'}</p>
            <div className="hero-card">
              <div>
                <h2>Personalized learning platform</h2>
                <p>Learn smarter with modern tools</p>
                <button>Learning Plan</button>
              </div>
            </div>

            <div className="grid">
              <div className="card">
                <h3>Mastering Python</h3>
                <div className="circle">85%</div>
              </div>

              <div className="card">
                <h3>UX Design</h3>
                <p>70%</p>
                <div className="bar"><span style={{width: '70%'}} /></div>
              </div>

              <div className="card">
                <h3>Quick Stats</h3>
                <p>Hours: 10</p>
                <p>Projects: 2</p>
              </div>

              <div className="card">
                <h3>Certification</h3>
                <p>First Certificate Earned 🎉</p>
                <button onClick={generateCertificate}>Download Certificate</button>
              </div>

              <div className="card chart-card">
                <h3>Learning Progress</h3>
                <Line ref={chartRef} data={chartData} />
              </div>
            </div>

            {showNotif && (
              <div className="card notif-panel">
                <h3>Notifications</h3>
                <p>✅ Course Completed</p>
                <p>📚 New Lesson Available</p>
              </div>
            )}
          </div>
        )}

        {currentPage === 'courses' && (
          <div className="page">
            <h2>Courses</h2>
            <div className="course-card">
              <h3>Python</h3>
              <button onClick={() => completeCourse('Python')} disabled={completedCourses.includes('Python')}>
                {completedCourses.includes('Python') ? 'Completed' : 'Complete'}
              </button>
            </div>
            <div className="course-card">
              <h3>Web Development</h3>
              <button onClick={() => completeCourse('Web')} disabled={completedCourses.includes('Web')}>
                {completedCourses.includes('Web') ? 'Completed' : 'Complete'}
              </button>
            </div>
            <div className="course-card">
              <h3>UI/UX Design</h3>
              <button onClick={() => completeCourse('UI')} disabled={completedCourses.includes('UI')}>
                {completedCourses.includes('UI') ? 'Completed' : 'Complete'}
              </button>
            </div>
          </div>
        )}

        {currentPage === 'progress' && (
          <div className="page">
            <h2>Your Progress</h2>
            <p>{completedCourses.length} Courses Completed</p>
            <p>Points: {points}</p>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="page">
            <h2>Settings</h2>
            <input 
              id="newName" 
              placeholder="Change name" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={saveSettings}>Save</button>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

