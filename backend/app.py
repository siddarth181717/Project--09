from flask import Flask, jsonify, request , render_template
import flask_cors
import sqlite3

app = Flask(__name__)
flask_cors.CORS(app)

@app.route("/")
def home():
    return render_template("index.html")
DB_PATH = 'eduleap.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            points INTEGER DEFAULT 0
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            video_url TEXT,
            instructor TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY,
            course_id INTEGER,
            name TEXT,
            completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')

    # Demo user
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, name, email, points)
        VALUES (1, 'Alex Dev', 'alex@eduleap.com', 2450)
    """)

    # 🔥 COURSES WITH WORKING VIDEOS 🔥
    courses = [
        (1, "UX Design Fundamentals", "Learn UX basics", "https://www.youtube.com/embed/3Yk6Jk8d0zE", "Google UX"),
        (2, "Python Mastery", "Complete Python course", "https://www.youtube.com/embed/gfDE2a7MKjA", "CodeWithHarry"),
        (3, "Advanced JavaScript", "Deep dive JS", "https://www.youtube.com/embed/ajdRvxDWH4w", "Apna College"),
        (4, "React Complete Guide", "React full course", "https://www.youtube.com/embed/bMknfKXIFA8", "Apna College"),
        (5, "Node.js & Express", "Backend dev", "https://www.youtube.com/embed/Oe421EPjeBE", "CodeWithHarry"),
        (6, "Data Science Python", "Data science basics", "https://www.youtube.com/embed/r-uOLxNrNk8", "freeCodeCamp"),
        (7, "Docker & Kubernetes", "DevOps tools", "https://www.youtube.com/embed/3c-iBn73dDE", "Nana"),
        (8, "MongoDB NoSQL", "MongoDB guide", "https://www.youtube.com/embed/ofme2o29ngU", "CodeWithHarry"),
        (9, "SQL & PostgreSQL", "SQL mastery", "https://www.youtube.com/embed/HXV3zeQKqGY", "freeCodeCamp"),
        (10, "Machine Learning", "ML basics", "https://www.youtube.com/embed/ukzFI9rgwfU", "Krish Naik"),
        (11, "AWS Cloud Practitioner", "Cloud basics", "https://www.youtube.com/embed/SOTamWNgDKc", "freeCodeCamp"),
        (12, "Git & GitHub Pro", "Version control", "https://www.youtube.com/embed/apGV9Kg7ics", "CodeWithHarry"),
        (13, "TypeScript Advanced", "TS course", "https://www.youtube.com/embed/30LWjhZzg50", "Academind"),
        (14, "Next.js 14 Fullstack", "Next.js guide", "https://www.youtube.com/embed/ZVnjOPwW4ZA", "Codevolution"),
        (15, "Cybersecurity Basics", "Security fundamentals", "https://www.youtube.com/embed/U_P23SqJaDc", "NetworkChuck")
    ]

    cursor.executemany("INSERT OR IGNORE INTO courses VALUES (?, ?, ?, ?, ?)", courses)

    # Modules
    modules = [
        (1,1,"UX Research"),(2,1,"Wireframing"),(3,1,"Prototyping"),
        (4,2,"Python Basics"),(5,2,"OOP"),(6,2,"Projects"),
        (7,3,"ES6"),(8,3,"Async JS"),(9,3,"Modules"),
        (10,4,"Hooks"),(11,4,"Router"),(12,4,"Redux"),
        (13,5,"Express Setup"),(14,5,"Auth"),(15,5,"APIs"),
        (16,6,"Pandas"),(17,6,"NumPy"),(18,6,"ML Basics")
    ]

    cursor.executemany("INSERT OR IGNORE INTO modules VALUES (?, ?, ?, 0)", modules)

    conn.commit()
    conn.close()

# ROUTES

@app.route('/api/courses')
def get_courses():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name, description FROM courses")
    data = [{'name': r[0], 'desc': r[1]} for r in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/course/<name>')
def get_course(name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT video_url FROM courses WHERE name=?", (name,))
    row = cursor.fetchone()
    conn.close()
    return jsonify({'video_url': row[0] if row else ""})

@app.route('/api/course/<name>/modules')
def get_modules(name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.name, m.completed FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE c.name=?
    """, (name,))
    data = [{'name': r[0], 'completed': bool(r[1])} for r in cursor.fetchall()]
    conn.close()
    return jsonify(data)

@app.route('/api/complete-module', methods=['POST'])
def complete_module():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE modules SET completed=1
        WHERE name=? AND course_id=(SELECT id FROM courses WHERE name=?)
    """, (data['module_name'], data['course_name']))

    cursor.execute("UPDATE users SET points = points + 50 WHERE id=1")
    cursor.execute("SELECT points FROM users WHERE id=1")
    points = cursor.fetchone()[0]

    conn.commit()
    conn.close()
    return jsonify({'points': points})

@app.route('/api/complete-course', methods=['POST'])
def complete_course():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("UPDATE users SET points = points + 500 WHERE id=1")
    cursor.execute("SELECT points FROM users WHERE id=1")
    points = cursor.fetchone()[0]

    conn.commit()
    conn.close()
    return jsonify({'points': points})

if __name__ == '__main__':
    init_db()
    print("🚀 Backend running at http://localhost:5000")
    app.run(debug=True)