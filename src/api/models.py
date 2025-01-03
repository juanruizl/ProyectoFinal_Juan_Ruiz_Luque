from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()
#CREACION DE USUARIO PARA LA BASE DATOS DEL
# BACKEND CON TODOS LOS CAMPOS QUE ESTE VA A TENER
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False) 
    company = db.Column(db.String(120), nullable=False)
    industry = db.Column(db.String(120), nullable=True)  
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

#RELACIONES QUE VA A TENER EL USUARIO
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    projects = db.relationship('Project', backref='user', lazy=True)
    budgets = db.relationship('Budget', backref='user', lazy=True)
    employees = db.relationship('Employee', backref='user', lazy=True)

#PARA EL MANEJO DE CONTRASEÑAS DE FORMA SEGURA EN LA WEB CREADA, ASI LA ALMACENO EN LA BASE DE DATOS CON UN HASH PRIVADO
    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

#PARA COMPROBAR LA CONTRASEÑA CIFRADA CON EL HASH, DEVOLVIENDO TRUE O FALSE DEPENDIENDO DE SI LA CONTRASEÑA INTRODUCIDA ES CORRECTA O INCORRECTA
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "industry": self.industry,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }

#CREACION DE LAS TRANSACIONES EN LA BASE DE DATOS, ADEMAS HE REALIZADO AQUI EL CAMBIO DE FORMATO QUE DEBE TENER PARA QUE PODAMOS CONECTAR NUESTRA API CON API DE CHARTQUIRT
class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(250), nullable=True)
    transaction_type = db.Column(db.String(50), nullable=False)  
    status = db.Column(db.String(50), nullable=False)  
    company = db.Column(db.String(120), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "description": self.description,
            "transaction_type": self.transaction_type,
            "status": self.status,
            "company": self.company,
            "date": self.date.isoformat(),
        }
    

###############################################################################################   
    #Transformo las transacciones en datos listos para QuickChart. Organizo los montos 
    #por mes como ingresos, gastos y ganancias, y devuelvo un diccionario para un 
    #gráfico combinado de barras y línea.
###############################################################################################

    @staticmethod
    def transform_for_chart(transactions):
        """Transforma las transacciones al formato de QuickChart para un gráfico comparativo."""
        transactions = sorted(transactions, key=lambda t: t.date)

        data = {}
        for t in transactions:
            month = t.date.strftime('%B') 
            if month not in data:
                data[month] = {"income": 0, "expense": 0}
            data[month][t.transaction_type] += t.amount

        labels = list(data.keys())  
        income_data = [data[label]["income"] for label in labels]
        expense_data = [data[label]["expense"] for label in labels]
        profit_data = [income - expense for income, expense in zip(income_data, expense_data)]

        return {
            "chart": {
                "type": "bar",
                "data": {
                    "labels": labels,  
                    "datasets": [
                        {
                            "label": "Ingresos",
                            "data": income_data,
                            "backgroundColor": "rgba(40, 167, 69, 0.6)",  
                            "borderColor": "rgba(40, 167, 69, 1)",  
                            "borderWidth": 1,
                        },
                        {
                            "label": "Gastos",
                            "data": expense_data,
                            "backgroundColor": "rgba(220, 53, 69, 0.6)",
                            "borderColor": "rgba(220, 53, 69, 1)",  
                            "borderWidth": 1,
                        },
                        {
                            "label": "Ganancias",
                            "data": profit_data,
                            "backgroundColor": "rgba(23, 162, 184, 0.6)",  
                            "borderColor": "rgba(23, 162, 184, 1)", 
                            "borderWidth": 2,
                            "type": "line",  
                            "fill": False,
                        },
                    ],
                },
                "options": {
                    "plugins": {
                        "title": {
                            "display": True,
                            "text": "Comparación de Ingresos, Gastos y Ganancias",
                            "font": {
                                "size": 18,
                            },
                            "color": "#ffffff",  
                        },
                        "legend": {
                            "labels": {
                                "font": {
                                    "size": 14,
                                },
                                "color": "#ffffff",  
                            },
                        },
                    },
                    "scales": {
                        "y": {
                            "beginAtZero": True,
                            "title": {
                                "display": True,
                                "text": "Valores en USD ($)",
                                "color": "#ffffff", 
                                "font": {
                                    "size": 14,
                                },
                            },
                            "ticks": {
                                "color": "#ffffff", 
                            },
                        },
                        "x": {
                            "title": {
                                "display": True,
                                "text": "Meses",
                                "color": "#ffffff",  
                                "font": {
                                    "size": 14,
                                },
                            },
                            "ticks": {
                                "color": "#ffffff",  
                            },
                        },
                    },
                    "responsive": True,
                    "maintainAspectRatio": False,
                },
            },
        }

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    salary = db.Column(db.Float, nullable=False)
    position = db.Column(db.String(120), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "salary": self.salary,
            "position": self.position,
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    client = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)

    budgets = db.relationship('Budget', backref='project', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "client": self.client,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)  
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "description": self.description,
            "amount": self.amount,
            "status": self.status,
            "date": self.date.isoformat(),
        }