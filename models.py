from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Boolean, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class Ticket(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(Enum('urgent', 'not urgent', 'low priority', name='priority_types'), nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'is_closed': self.is_closed
        }
