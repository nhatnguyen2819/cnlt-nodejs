from flask import Flask, request, render_template_string

app = Flask(__name__)

users = {
    "admin": "123456",
    "student": "password"
}

login_page = """
<h2>Login System</h2>
<form method="post">
    Username: <input name="username"><br>
    Password: <input name="password"><br>
    <input type="submit" value="Login">
</form>
"""

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username in users and users[username] == password:
            return "Login success"
        else:
            return "Login failed"
    return render_template_string(login_page)

if __name__ == "__main__":
    app.run(debug=True)