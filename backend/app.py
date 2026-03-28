from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Mock Database
user_data = {
    "name": "Alex Dev",
    "points": 140,
    "completed_courses": ["UX Design Fundamentals"]
}

@app.route('/api/courses', methods=['GET'])
def get_courses():
    # Returning the exact courses from your UI image
    return jsonify([
        {'name': 'UX Design Fundamentals', 'desc': 'Master the basics of visual design and user experience.'},
        {'name': 'Mastering Python', 'desc': 'From basics to advanced automation and data.'},
        {'name': 'Web Development', 'desc': 'Build modern websites with HTML, CSS, and JS.'},
        {'name': 'Data Science', 'desc': 'Analyze data and build predictive models.'}
    ])

@app.route('/api/user', methods=['GET'])
def get_user():
    return jsonify(user_data)

@app.route('/api/course/<course_name>', methods=['GET'])
def get_course(course_name):
    playlists = {
        'UX Design Fundamentals': 'PL4cUxeGkcC9ijXp6J12YhInVlaTciACgm',
        'Mastering Python': 'PLu0W4Iz0PlM6deP7lXzL6fX_7y3fA1l0s',
        'Web Development': 'PLu0W4Iz0PlM4yA9i5Z6eQ6h0yYV7gL5S',
        'Data Science': 'PLu0W4Iz0PlM5gR8oXb5fY3X_5z3fA2l1t'
    }
    playlist_id = playlists.get(course_name, 'PLu0W4Iz0PlM6deP7lXzL6fX_7y3fA1l0s')
    return jsonify({
        'video_url': f'https://www.youtube.com/embed/videoseries?list={playlist_id}',
        'title': course_name
    })

@app.route('/api/others', methods=['GET'])
def get_others():
    return jsonify([
        {'type': 'Quick Tip', 'content': 'Complete 80% lectures to unlock certificate!'},
        {'type': 'Next Milestone', 'content': 'Finish Web Development for 500 points'},
        {'type': 'Streak', 'content': '5 day streak! Keep it up 🔥'},
        {'type': 'Recommendation', 'content': 'Try Data Science next - perfect for Python grads'}
    ])

@app.route('/api/courselectures/<course_name>', methods=['GET'])
def get_course_lectures(course_name):
    lectures = {
        'UX Design Fundamentals': [
            'Introduction to UX Principles',
            'Wireframing Basics',
            'Color Theory in Design',
            'Typography Essentials',
            'User Research Methods',
            'Prototyping Tools',
            'Usability Testing',
            'Design Systems',
            'Case Study Analysis',
            'Final Project'
        ],
        'Mastering Python': [
            'Python Basics',
            'Data Types & Structures',
            'Functions & Modules',
            'OOP Concepts',
            'File Handling',
            'Error Handling',
            'Libraries Intro',
            'Web Scraping',
            'GUI with Tkinter',
            'Final Project'
        ],
        'Web Development': [
            'HTML5 Fundamentals',
            'CSS3 Advanced',
            'JavaScript ES6+',
            'Responsive Design',
            'Flexbox & Grid',
            'DOM Manipulation',
            'Async JavaScript',
            'Build Tools',
            'Deployment',
            'Final Project'
        ],
        'Data Science': [
            'Data Exploration',
            'Pandas Basics',
            'NumPy Arrays',
            'Data Visualization',
            'Statistics Fundamentals',
            'Machine Learning Intro',
            'Scikit-Learn',
            'Model Evaluation',
            'Feature Engineering',
            'Capstone Project'
        ]
    }
    course_lectures = lectures.get(course_name, lectures['UX Design Fundamentals'])
    return jsonify({'lectures': course_lectures})

@app.route('/api/complete-course', methods=['POST'])
def complete_course():
    data = request.json
    course_name = data.get("course_name")
    if course_name not in user_data["completed_courses"]:
        user_data["completed_courses"].append(course_name)
        user_data["points"] += 20
        return jsonify({"status": "success", "points": user_data["points"]}), 200
    return jsonify({"status": "already completed"}), 400

@app.route('/api/stats', methods=['GET'])
def get_stats():
    num_completed = len(user_data["completed_courses"])
    course_progress = {
        'UX Design Fundamentals': min(70 + num_completed * 5, 100),
        'Mastering Python': min(85 + num_completed * 3, 100),
        'Web Development': 45 + num_completed * 8,
        'Data Science': 20 + num_completed * 10
    }
    return jsonify({
        'hours_today': 8,
        'hours_week': num_completed * 12,
        'weekly_progress': min(40 + num_completed * 5, 100),
        'adventures': 127 + num_completed * 10,
        'course_progress': course_progress
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
