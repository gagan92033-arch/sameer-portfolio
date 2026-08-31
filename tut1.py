from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from functools import wraps


app = Flask(__name__)

# =========================================================
# SECRET KEY
# =========================================================

app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "change-this-secret-key"
)


# =========================================================
# ADMIN LOGIN
# =========================================================

ADMIN_USERNAME = "sameer"
ADMIN_PASSWORD_HASH = generate_password_hash("Sameer@123")


# =========================================================
# DATABASE
# =========================================================

DATABASE = "portfolio.db"


def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# CREATE DATABASE
# =========================================================

def init_db():

    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS portfolio (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    # Create initial data only if database is empty

    existing = conn.execute(
        "SELECT * FROM portfolio WHERE id = 1"
    ).fetchone()

    if existing is None:

        import json

        default_data = {

            "about":
            "I am Sameer, a first-year engineering student with a strong interest in programming, problem solving and technology. I am currently building my foundation in Computer Science concepts while also studying engineering subjects.",

            "dsaSolved": 60,

            "dsaCompletion": 65,

            "dsaTopics":
            "Arrays, Strings, Vectors, Hashing, Sorting, Binary Search, Two Pointers, Sliding Window, Recursion",

            "achievements": [

                {
                    "title": "LeetCode Practice",
                    "description":
                    "Solved around 60 LeetCode problems."
                },

                {
                    "title": "DSA Foundation",
                    "description":
                    "Completed core topics including arrays, strings, sorting, binary search and more."
                }

            ],

            "certifications": [],

            "journey": [

                {
                    "title": "🎓 Engineering Student",
                    "description":
                    "Started my engineering journey and began building a strong technical foundation."
                },

                {
                    "title": "💻 Started Programming",
                    "description":
                    "Started working with C++ and learned programming fundamentals."
                },

                {
                    "title": "🧩 Started DSA",
                    "description":
                    "Began solving algorithmic problems and studying important DSA concepts."
                },

                {
                    "title": "🐍 Started Python",
                    "description":
                    "Started learning Python with a long-term goal of entering Machine Learning and Data Science."
                }

            ],

            "skills": [

                ["C++ Programming", 80],

                ["DSA & Problem Solving", 65],

                ["Python", 45],

                ["NumPy / Data Science", 35],

                ["Web Development", 25]

            ]

        }

        conn.execute(
            "INSERT INTO portfolio (id, data) VALUES (?, ?)",
            (1, json.dumps(default_data))
        )

        conn.commit()

    conn.close()


init_db()


# =========================================================
# AUTHENTICATION DECORATOR
# =========================================================

def login_required(function):

    @wraps(function)
    def decorated_function(*args, **kwargs):

        if not session.get("logged_in"):

            return jsonify({
                "success": False,
                "message": "Authentication required"
            }), 401

        return function(*args, **kwargs)

    return decorated_function


# =========================================================
# PUBLIC HOME PAGE
# =========================================================

@app.route("/")
def home():

    return render_template("index.html")


# =========================================================
# ADMIN PAGE
# =========================================================

@app.route("/admin")
def admin():

    if not session.get("logged_in"):

        return render_template("login.html")

    return render_template("admin.html")


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
            session["logged_in"] = True
            return redirect("/admin")
        else:
            return "Wrong username or password"

    return render_template("login.html")

# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("home"))


# =========================================================
# GET PORTFOLIO DATA
# PUBLIC
# =========================================================

@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():

    import json

    conn = get_db()

    row = conn.execute(
        "SELECT data FROM portfolio WHERE id = 1"
    ).fetchone()

    conn.close()

    data = json.loads(row["data"])

    return jsonify(data)


# =========================================================
# UPDATE PORTFOLIO
# ADMIN ONLY
# =========================================================

@app.route("/api/portfolio", methods=["PUT"])
@login_required
def update_portfolio():

    import json

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    conn = get_db()

    conn.execute(
        "UPDATE portfolio SET data = ? WHERE id = 1",
        (json.dumps(data),)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Portfolio updated successfully"
    })


# =========================================================
# RUN SERVER
# =========================================================
@app.route("/api/reset", methods=["POST"])
@login_required
def reset_portfolio():

    import json

    default_data = {

        "about":
        "I am Sameer, a first-year engineering student with a strong interest in programming, problem solving and technology.",

        "dsaSolved": 60,

        "dsaCompletion": 65,

        "dsaTopics":
        "Arrays, Strings, Vectors, Hashing, Sorting, Binary Search, Two Pointers, Sliding Window, Recursion",

        "achievements": [],

        "certifications": [],

        "journey": [],

        "skills": [
            ["C++ Programming", 80],
            ["DSA & Problem Solving", 65],
            ["Python", 45],
            ["NumPy / Data Science", 35],
            ["Web Development", 25]
        ]

    }

    conn = get_db()

    conn.execute(
        "UPDATE portfolio SET data = ? WHERE id = 1",
        (json.dumps(default_data),)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True
    })
if __name__ == "__main__":

    app.run(
        debug=True
    )
