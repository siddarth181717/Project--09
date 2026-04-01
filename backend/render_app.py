from flask import Flask, jsonify, request
import flask_cors
import os
import sqlite3
from pathlib import Path
import tempfile

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = Path(tempfile.gettempdir()) / "eduleap_render.db"
DB_PATH = os.environ.get("EDULEAP_DB_PATH", str(DEFAULT_DB_PATH))

app = Flask(__name__, static_folder=str(BASE_DIR / "static"))
flask_cors.CORS(app)


def get_db_connection():
    conn = sqlite3.connect(DB_PATH, uri=DB_PATH.startswith("file:"))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            points INTEGER DEFAULT 0
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            video_url TEXT,
            instructor TEXT
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY,
            course_id INTEGER,
            name TEXT,
            video_id TEXT,
            duration TEXT,
            completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
        """
    )

    existing_columns = {
        row[1] for row in cursor.execute("PRAGMA table_info(modules)").fetchall()
    }
    if "video_id" not in existing_columns:
        cursor.execute("ALTER TABLE modules ADD COLUMN video_id TEXT")
    if "duration" not in existing_columns:
        cursor.execute("ALTER TABLE modules ADD COLUMN duration TEXT")

    cursor.execute(
        """
        INSERT OR IGNORE INTO users (id, name, email, points)
        VALUES (1, 'Alex Dev', 'alex@eduleap.com', 2450)
        """
    )

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
        (15, "Cybersecurity Basics", "Security fundamentals", "https://www.youtube.com/embed/U_P23SqJaDc", "NetworkChuck"),
    ]
    cursor.executemany("INSERT OR IGNORE INTO courses VALUES (?, ?, ?, ?, ?)", courses)

    modules = [
        (1, 1, "UX Research", "3Yk6Jk8d0zE", "14:20"),
        (2, 1, "Wireframing", "3Yk6Jk8d0zE", "12:45"),
        (3, 1, "Prototyping", "3Yk6Jk8d0zE", "18:10"),
        (4, 2, "Python Basics", "gfDE2a7MKjA", "15:30"),
        (5, 2, "OOP", "gfDE2a7MKjA", "22:00"),
        (6, 2, "Projects", "gfDE2a7MKjA", "20:15"),
        (7, 3, "ES6", "ajdRvxDWH4w", "16:50"),
        (8, 3, "Async JS", "ajdRvxDWH4w", "19:20"),
        (9, 3, "Modules", "ajdRvxDWH4w", "13:40"),
        (10, 4, "Hooks", "bMknfKXIFA8", "21:10"),
        (11, 4, "Router", "bMknfKXIFA8", "17:35"),
        (12, 4, "Redux", "bMknfKXIFA8", "24:05"),
        (13, 5, "Express Setup", "Oe421EPjeBE", "18:45"),
        (14, 5, "Auth", "Oe421EPjeBE", "23:15"),
        (15, 5, "APIs", "Oe421EPjeBE", "20:05"),
        (16, 6, "Pandas", "r-uOLxNrNk8", "19:40"),
        (17, 6, "NumPy", "r-uOLxNrNk8", "17:25"),
        (18, 6, "ML Basics", "r-uOLxNrNk8", "21:50"),
    ]
    cursor.executemany(
        """
        INSERT OR IGNORE INTO modules (id, course_id, name, video_id, duration, completed)
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        modules,
    )

    conn.commit()
    conn.close()


@app.get("/")
def home():
    return app.send_static_file("index.html")


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/user")
def get_user():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, points FROM users WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    return jsonify(
        {
            "name": row["name"] if row else "Alex Dev",
            "points": row["points"] if row else 2450,
        }
    )


@app.get("/api/stats")
def get_stats():
    return jsonify({"hours_today": 8, "hours_week": 42})


@app.get("/api/courses")
def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description FROM courses ORDER BY id")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"name": row["name"], "desc": row["description"]} for row in rows])


@app.get("/api/course/<name>")
def get_course(name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT video_url FROM courses WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    return jsonify({"video_url": row["video_url"] if row else ""})


@app.get("/api/course/<name>/modules")
def get_modules(name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT m.name, m.video_id, m.duration, m.completed
        FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE c.name = ?
        ORDER BY m.id
        """,
        (name,),
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify(
        [
            {
                "title": row["name"],
                "id": row["video_id"],
                "duration": row["duration"] or "",
                "completed": bool(row["completed"]),
            }
            for row in rows
        ]
    )


@app.get("/api/progress")
def get_progress():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT c.name,
               SUM(CASE WHEN m.completed = 1 THEN 1 ELSE 0 END) AS watched,
               COUNT(m.id) AS total
        FROM courses c
        LEFT JOIN modules m ON m.course_id = c.id
        GROUP BY c.id, c.name
        HAVING COUNT(m.id) > 0
        ORDER BY c.id
        LIMIT 6
        """
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify(
        [{"name": row["name"], "watched": row["watched"], "total": row["total"]} for row in rows]
    )


@app.post("/api/complete-video")
def complete_video():
    data = request.get_json(silent=True) or {}
    course_name = data.get("course_name")
    video_name = data.get("video_name")

    if not course_name or not video_name:
        return jsonify({"error": "course_name and video_name are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE modules
        SET completed = 1
        WHERE name = ?
          AND course_id = (SELECT id FROM courses WHERE name = ?)
        """,
        (video_name, course_name),
    )
    cursor.execute("UPDATE users SET points = points + 50 WHERE id = 1")
    cursor.execute("SELECT points FROM users WHERE id = 1")
    points = cursor.fetchone()["points"]
    conn.commit()
    conn.close()
    return jsonify({"points": points})


@app.post("/api/complete-course")
def complete_course():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET points = points + 500 WHERE id = 1")
    cursor.execute("SELECT points FROM users WHERE id = 1")
    points = cursor.fetchone()["points"]
    conn.commit()
    conn.close()
    return jsonify({"points": points})


init_db()


if __name__ == "__main__":
    print("Backend running at http://localhost:5000")
    app.run(debug=True)
