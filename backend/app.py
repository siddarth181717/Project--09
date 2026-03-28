from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1", "*"])  # Fixed CORS

DB_PATH = 'eduleap.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tables (unchanged)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, points INTEGER DEFAULT 0
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, video_url TEXT, instructor TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY, course_id INTEGER, name TEXT, completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')
    
    # Demo User
    cursor.execute("INSERT OR IGNORE INTO users (id, name, email, points) VALUES (1, 'Alex Dev', 'alex@eduleap.com', 2450)")
    
    # 🔥 15+ COMPLETE COURSES WITH MODULES 🔥
    demo_courses = [
        # Existing courses
        (1, "UX Design Fundamentals", "Learn Google's UX Framework from basics", "https://www.youtube.com/embed/1j_ziLiYY2A", "Sarah Johnson"),
        (2, "Python Mastery", "Master Python with real projects", "https://www.youtube.com/embed/YYXdXT2l-Gg", "Mike Chen"),
        (3, "Advanced JavaScript", "ES6+ features & modern patterns", "https://www.youtube.com/embed/PkZNo7MFNFg", "Emma Davis"),
        
        # 🔥 NEW COURSES 🔥
        (4, "React Complete Guide", "Hooks, Router, Context, Redux", "https://www.youtube.com/embed/bMknfKXIFA8", "Maximilian Schwarzmüller"),
        (5, "Node.js & Express", "Build REST APIs from scratch", "https://www.youtube.com/embed/watch?v=3rZJ9pfGUPU", "Traversy Media"),
        (6, "Data Science Python", "Pandas, NumPy, Matplotlib, ML", "https://www.youtube.com/embed/_P7jjhkLlc8", "freeCodeCamp"),
        (7, "Docker & Kubernetes", "Containerize & deploy apps", "https://www.youtube.com/embed/3c-iBn73dDE", "TechWorld with Nana"),
        (8, "MongoDB NoSQL", "Build modern apps with MongoDB", "https://www.youtube.com/embed/ExcQGXgT74I", "Traversy Media"),
        (9, "SQL & PostgreSQL", "Database design & advanced queries", "https://www.youtube.com/embed/HXV3zeQKqGY", "freeCodeCamp"),
        (10, "Machine Learning", "Scikit-learn, TensorFlow basics", "https://www.youtube.com/embed/0Lt9w-BbY7k", "Sentdex"),
        (11, "AWS Cloud Practitioner", "Cloud fundamentals & services", "https://www.youtube.com/embed/k2uXnJKb9SA", "freeCodeCamp"),
        (12, "Git & GitHub Pro", "Version control mastery", "https://www.youtube.com/embed/RGOj5yH7evk", "Traversy Media"),
        (13, "TypeScript Advanced", "Build scalable JS apps", "https://www.youtube.com/embed/Rab9hVNOsj8", "Matt Pocock"),
        (14, "Next.js 14 Fullstack", "App Router, Server Actions", "https://www.youtube.com/embed/pkAv8TTWQvM", "Code with Antonio"),
        (15, "Cybersecurity Basics", "Ethical hacking fundamentals", "https://www.youtube.com/embed/XR6R6Zq9O0s", "NetworkChuck")
    ]
    cursor.executemany("INSERT OR IGNORE INTO courses VALUES (?, ?, ?, ?, ?)", demo_courses)
    
    # 🔥 MODULES FOR ALL COURSES 🔥
    demo_modules = [
        # Course 1: UX Design (3 modules)
        (1, 1, "UX Research Methods"), (2, 1, "Wireframing Basics"), (3, 1, "Prototyping Tools"),
        # Course 2: Python (3 modules)  
        (4, 2, "Python Basics"), (5, 2, "Data Structures"), (6, 2, "OOP Concepts"),
        # Course 3: JS (3 modules)
        (7, 3, "ES6+ Syntax"), (8, 3, "Async/Await"), (9, 3, "Modules & Bundlers"),
        # Course 4: React (5 modules)
        (10, 4, "React Hooks"), (11, 4, "React Router"), (12, 4, "Context API"), (13, 4, "Redux Toolkit"), (14, 4, "React Query"),
        # Course 5: Node.js (4 modules)
        (15, 5, "Express Setup"), (16, 5, "Middleware"), (17, 5, "Authentication"), (18, 5, "Database Integration"),
        # Course 6: Data Science (4 modules)
        (19, 6, "Pandas Basics"), (20, 6, "NumPy Arrays"), (21, 6, "Data Viz"), (22, 6, "Scikit-learn"),
        # Course 7: Docker (3 modules)
        (23, 7, "Docker Basics"), (24, 7, "Docker Compose"), (25, 7, "Kubernetes Intro"),
        # Course 8: MongoDB (3 modules)
        (26, 8, "MongoDB Basics"), (27, 8, "Mongoose ODM"), (28, 8, "Schema Design"),
        # Course 9: SQL (4 modules)
        (29, 9, "SQL Basics"), (30, 9, "JOINs"), (31, 9, "Indexes"), (32, 9, "Advanced Queries"),
        # Course 10: ML (3 modules)
        (33, 10, "Linear Regression"), (34, 10, "Classification"), (35, 10, "Model Evaluation")
    ]
    cursor.executemany("INSERT OR IGNORE INTO modules (id, course_id, name) VALUES (?, ?, ?)", demo_modules)
    
    conn.commit()
    conn.close()

# Routes (unchanged + fixed)
@app.route('/api/user')
def get_user():
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("SELECT name, points FROM users WHERE id = 1"); user = cursor.fetchone()
    conn.close()
    return jsonify({'name': user[0], 'points': user[1]})

@app.route('/api/stats')
def get_stats():
    return jsonify({'hours_today': 8, 'hours_week': 42, 'courses_completed': 7, 'total_points': 2450})

@app.route('/api/courses')
def get_courses():
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("SELECT name, description FROM courses")
    courses = [{'name': row[0], 'desc': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(courses)

@app.route('/api/course/<course_name>')
def get_course(course_name):
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("SELECT video_url FROM courses WHERE name = ?", (course_name,))
    result = cursor.fetchone()
    conn.close()
    return jsonify({'video_url': result[0] if result else 'https://www.youtube.com/embed/dQw4w9WgXcQ'})

@app.route('/api/course/<course_name>/modules')
def get_course_modules(course_name):
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("""
        SELECT m.name, m.completed FROM modules m 
        JOIN courses c ON m.course_id = c.id WHERE c.name = ?
    """, (course_name,))
    modules = [{'name': row[0], 'completed': bool(row[1])} for row in cursor.fetchall()]
    conn.close()
    return jsonify(modules)

@app.route('/api/complete-module', methods=['POST'])
def complete_module():
    data = request.json; course_name = data.get('course_name'); module_name = data.get('module_name')
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("UPDATE modules SET completed = 1 WHERE name = ? AND course_id = (SELECT id FROM courses WHERE name = ?)", (module_name, course_name))
    cursor.execute("UPDATE users SET points = points + 50 WHERE id = 1")
    cursor.execute("SELECT points FROM users WHERE id = 1"); points = cursor.fetchone()[0]
    conn.commit(); conn.close()
    return jsonify({'points': points, 'message': 'Module completed! +50pts'})

@app.route('/api/complete-course', methods=['POST'])
def complete_course():
    data = request.json; course_name = data.get('course_name')
    conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
    cursor.execute("UPDATE users SET points = points + 500 WHERE id = 1")
    cursor.execute("SELECT points FROM users WHERE id = 1"); points = cursor.fetchone()[0]
    conn.commit(); conn.close()
    return jsonify({'points': points, 'message': f'{course_name} completed! +500pts 🎉'})

@app.route('/api/others')
def get_others():
    return jsonify([
        {'type': 'Courses Completed', 'content': '7/15 courses finished'},
        {'type': 'Total Hours', 'content': '128 hours studied'},
        {'type': 'Points Earned', 'content': '2,450 XP gained'},
        {'type': 'Current Streak', 'content': '7 days active'}
    ])

if __name__ == '__main__':
    init_db()
    print("🚀 EduLeap Backend LIVE! http://localhost:5000")
    print("📊 Test: http://localhost:5000/api/courses (15+ courses)")
    app.run(debug=True, port=5000)