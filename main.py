import os
from flask import Flask, jsonify, request, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from models import db, User, Ticket
from flask_login import LoginManager, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from urllib.parse import urlparse

class Base(DeclarativeBase):
    pass

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SECRET_KEY"] = os.urandom(24)
db.init_app(app)

with app.app_context():
    db.create_all()

with app.app_context():
    Ticket.query.filter_by(title='Test Ticket').delete()
    db.session.commit()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        pin = request.form.get('pin')
        
        if not pin:
            flash('PIN is required.')
            return redirect(url_for('login'))
        
        if pin == '52640628':
            user = User.query.first()
            if not user:
                user = User(hash=generate_password_hash(pin))
                db.session.add(user)
                db.session.commit()
            login_user(user)
            next_page = request.args.get('next')
            if not next_page or urlparse(next_page).netloc != '':
                next_page = url_for('index')
            return redirect(next_page)
        else:
            flash('Invalid PIN')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/api/tickets', methods=['GET'])
@login_required
def get_tickets():
    tickets = Ticket.query.filter_by(user_id=current_user.id).all()
    return jsonify([ticket.to_dict() for ticket in tickets])

@app.route('/api/tickets', methods=['POST'])
@login_required
def create_ticket():
    data = request.json
    if not data or not all(key in data for key in ('title', 'description', 'priority')):
        return jsonify({"error": "Invalid ticket data"}), 400
    
    new_ticket = Ticket(
        title=data['title'],
        description=data['description'],
        priority=data['priority'],
        user_id=current_user.id
    )
    db.session.add(new_ticket)
    db.session.commit()
    return jsonify(new_ticket.to_dict()), 201

@app.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
@login_required
def close_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    ticket.is_closed = True
    db.session.commit()
    return jsonify(ticket.to_dict())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
