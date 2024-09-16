from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Boolean, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pin_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    def __repr__(self):
        return f'<User {self.id}>'

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(Enum('urgent', 'not urgent', 'low priority', name='priority_types'), nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)
    user_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('users.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="tickets")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'is_closed': self.is_closed,
            'user_id': self.user_id
        }

User.tickets = relationship("Ticket", order_by=Ticket.id, back_populates="user")
