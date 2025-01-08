from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, Transaction, Employee, Project, Budget
from api.utils import APIException
from datetime import datetime
import requests

# Defino el Blueprint para agrupar las rutas de mi API
api = Blueprint('api', __name__)

EXCHANGE_RATE_API_KEY = "e4b91de1583572c0905b03cc"

# Ruta para iniciar sesión, valido las credenciales del usuario y genero un token de acceso
@api.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        raise APIException("El tipo de contenido debe ser JSON", status_code=415)

    # Extraigo los datos enviados por el cliente
    data = request.json
    if not data.get("email") or not data.get("password"):
        raise APIException("Faltan campos obligatorios (email, password)", status_code=400)

    # Verifico si el usuario existe y la contraseña es válida
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        raise APIException("Credenciales inválidas", status_code=401)
    
    # Genero un token de acceso con el ID del usuario
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user_id": user.id}), 200

# Ruta para registrar un nuevo usuario, valido los datos y los almaceno en la base de datos
@api.route('/register', methods=['POST'])
def register():
    data = request.json
    if not all([data.get(field) for field in ["name", "company", "email", "password"]]):
        raise APIException("Faltan campos obligatorios (name, company, email, password)", status_code=400)
    
    # Verifico si el correo ya está registrado
    if User.query.filter_by(email=data['email']).first():
        raise APIException("El correo ya está registrado", status_code=400)

    # Creo un nuevo usuario y almaceno su contraseña cifrada
    user = User(
        name=data['name'],
        company=data['company'],
        industry=data.get('industry'),
        email=data['email']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.serialize()), 201

# Ruta para obtener la lista de todos los usuarios, protegida por JWT
@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    # Obtengo todos los usuarios y los serializo en formato JSON
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

# Ruta para obtener los detalles de un usuario específico
@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    print(f"ID recibido user: {user_id}")
    # Verifico si el usuario existe en la base de datos
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)
    return jsonify(user.serialize()), 200

# Ruta para actualizar la información de un usuario
@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    # Actualizo los campos enviados en el request
    data = request.json
    user.name = data.get("name", user.name)
    user.company = data.get("company", user.company)
    user.industry = data.get("industry", user.industry)
    if data.get("password"):
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.serialize()), 200

# Ruta para eliminar un usuario de la base de datos
@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    # Elimino al usuario y confirmo que lo elimine correctamente
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Usuario con ID {user_id} eliminado correctamente"}), 200

# Ruta para registrar una nueva transacción para un usuario
@api.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Valido que los campos obligatorios estén presentes
    if not all([data.get(field) for field in ["amount", "transaction_type", "status"]]):
        raise APIException("Faltan campos obligatorios (amount, transaction_type, status)", status_code=400)
    
    #Verifico que la fecha proporcionada es válida
    transaction_date = datetime.utcnow()  # Valor predeterminado
    if "date" in data:
        try:
            transaction_date = datetime.fromisoformat(data["date"])
        except ValueError:
            raise APIException("Formato de fecha inválido. Debe ser 'YYYY-MM-DD' o ISO 8601", status_code=400)

    # Creo una nueva instancia de la transacción con los datos recibidos
    transaction = Transaction(
        user_id=user_id,
        amount=data['amount'],
        description=data.get('description', ""),  # Uso una cadena vacía como valor predeterminado
        transaction_type=data['transaction_type'],
        status=data['status'],
        company=data.get('company'),
        date=transaction_date 
    )
    
    # Guardo la transacción en la base de datos
    db.session.add(transaction)
    db.session.commit()

    # Devuelvo la transacción creada como respuesta
    return jsonify(transaction.serialize()), 201

# Ruta para obtener todas las transacciones de un usuario
@api.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Consulto todas las transacciones asociadas a este usuario
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    # Devuelvo las transacciones en formato JSON
    return jsonify([transaction.serialize() for transaction in transactions]), 200

# Ruta para actualizar una transacción existente
@api.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    current_user_id = get_jwt_identity()
    
    # Busco la transacción especificada por su ID
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        raise APIException("Transacción no encontrada", status_code=404)

    # Verifico que la transacción pertenece al usuario actual
    if int(transaction.user_id) != int(current_user_id):
        raise APIException("No tienes permiso para modificar esta transacción", status_code=403)

    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Actualizo los campos de la transacción solo si se proporcionaron en los datos
    transaction.amount = data.get("amount", transaction.amount)
    transaction.description = data.get("description", transaction.description)
    transaction.transaction_type = data.get("transaction_type", transaction.transaction_type)
    transaction.status = data.get("status", transaction.status)
    transaction.company = data.get("company", transaction.company)

    # Si se proporciona una nueva fecha, la valido y la actualizo
    if "date" in data:
        try:
            transaction.date = datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            raise APIException("Formato de fecha inválido. Debe ser 'YYYY-MM-DD'", status_code=400)

    # Guardo los cambios en la base de datos
    db.session.commit()

    # Devuelvo la transacción actualizada como respuesta
    return jsonify(transaction.serialize()), 200

# Ruta para eliminar una transacción existente
@api.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()

    # Busco la transacción especificada por su ID
    transaction = Transaction.query.get(transaction_id)
    
    # Verifico que la transacción existe y pertenece al usuario actual
    if not transaction or int(transaction.user_id) != int(user_id):
        raise APIException("Transacción no encontrada o no autorizada", status_code=403)

    # Elimino la transacción de la base de datos
    db.session.delete(transaction)
    db.session.commit()

    # Devuelvo un mensaje de confirmación como respuesta
    return jsonify({"message": f"Transacción con ID {transaction_id} eliminada correctamente"}), 200

# Ruta para registrar un nuevo empleado para un usuario
@api.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Verifico que los campos obligatorios están presentes (name y salary)
    if not all([data.get(field) for field in ["name", "salary"]]):
        raise APIException("Faltan campos obligatorios (name, salary)", status_code=400)

    # Creo un nuevo empleado con los datos proporcionados
    employee = Employee(
        user_id=user_id,
        name=data['name'],
        salary=data['salary'],
        position=data.get('position')  # El campo position es opcional
    )
    
    # Guardo el empleado en la base de datos
    db.session.add(employee)
    db.session.commit()

    # Devuelvo los datos del empleado creado como respuesta
    return jsonify(employee.serialize()), 201

# Ruta para obtener todos los empleados registrados para un usuario
@api.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Consulto todos los empleados asociados al usuario actual
    employees = Employee.query.filter_by(user_id=user_id).all()

    # Devuelvo la lista de empleados en formato JSON
    return jsonify([employee.serialize() for employee in employees]), 200

# Ruta para actualizar los datos de un empleado específico
@api.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el empleado especificado por su ID
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(user_id):
        # Verifico que el empleado exista y que pertenezca al usuario actual
        raise APIException("Empleado no encontrado o no autorizado", status_code=403)

    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Actualizo los campos del empleado solo si se proporcionan
    employee.name = data.get("name", employee.name)
    employee.salary = data.get("salary", employee.salary)
    employee.position = data.get("position", employee.position)

    # Guardo los cambios en la base de datos
    db.session.commit()

    # Devuelvo los datos actualizados del empleado como respuesta
    return jsonify(employee.serialize()), 200

# Ruta para eliminar un empleado específico
@api.route('/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el empleado especificado por su ID
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(user_id):
        # Verifico que el empleado exista y que pertenezca al usuario actual
        raise APIException("Empleado no encontrado o no autorizado", status_code=403)

    # Elimino el empleado de la base de datos
    db.session.delete(employee)
    db.session.commit()

    # Devuelvo un mensaje de confirmación como respuesta
    return jsonify({"message": f"Empleado con ID {employee_id} eliminado correctamente"}), 200

# Ruta para registrar un nuevo proyecto para un usuario
@api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Verifico que los campos obligatorios están presentes (name, description y client)
    if not all([data.get(field) for field in ["name", "description", "client"]]):
        raise APIException("Faltan campos obligatorios (name, description, client)", status_code=400)

    # Verifico si la fecha de inicio fue proporcionada y es válida
    start_date = datetime.utcnow()  # Valor predeterminado
    if "start_date" in data:
        try:
            start_date = datetime.fromisoformat(data["start_date"])
        except ValueError:
            raise APIException("Formato de fecha inválido para start_date. Debe ser 'YYYY-MM-DD' o ISO 8601", status_code=400)

    # Verifico si la fecha de fin fue proporcionada y es válida
    end_date = None
    if "end_date" in data and data["end_date"]:
        try:
            end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            raise APIException("Formato de fecha inválido para end_date. Debe ser 'YYYY-MM-DD' o ISO 8601", status_code=400)

    # Creo una nueva instancia del proyecto con los datos proporcionados
    project = Project(
        user_id=user_id,
        name=data['name'],
        description=data['description'],
        client=data['client'],
        start_date=start_date,  # Uso la fecha validada
        end_date=end_date       # Uso la fecha de fin validada (si existe)
    )
    
    # Guardo el proyecto en la base de datos
    db.session.add(project)
    db.session.commit()

    # Devuelvo los datos del proyecto creado como respuesta
    return jsonify(project.serialize()), 201

# Ruta para obtener todos los proyectos registrados por un usuario
@api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Consulto todos los proyectos asociados al usuario actual
    projects = Project.query.filter_by(user_id=user_id).all()

    # Devuelvo la lista de proyectos en formato JSON
    return jsonify([project.serialize() for project in projects]), 200

# Ruta para actualizar los datos de un proyecto específico
@api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el proyecto especificado por su ID
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(user_id):
        # Verifico que el proyecto exista y que pertenezca al usuario actual
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Actualizo los campos del proyecto solo si se proporcionan
    project.name = data.get("name", project.name)
    project.description = data.get("description", project.description)
    project.client = data.get("client", project.client)
    
    # Si se proporciona una nueva fecha de inicio, la valido y la actualizo
    if data.get("start_date"):
        try:
            project.start_date = datetime.fromisoformat(data["start_date"])
        except ValueError:
            raise APIException("Formato de fecha inválido para start_date. Debe ser 'YYYY-MM-DD' o ISO 8601", status_code=400)

    # Si se proporciona una nueva fecha de fin, la valido y la actualizo
    if data.get("end_date"):
        try:
            project.end_date = datetime.fromisoformat(data["end_date"])
        except ValueError:
            raise APIException("Formato de fecha inválido para end_date. Debe ser 'YYYY-MM-DD' o ISO 8601", status_code=400)

    # Guardo los cambios en la base de datos
    db.session.commit()

    # Devuelvo los datos actualizados del proyecto como respuesta
    return jsonify(project.serialize()), 200

# Ruta para eliminar un proyecto específico
@api.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el proyecto especificado por su ID
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(user_id):
        # Verifico que el proyecto exista y que pertenezca al usuario actual
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    # Elimino el proyecto de la base de datos
    db.session.delete(project)
    db.session.commit()

    # Devuelvo un mensaje de confirmación como respuesta
    return jsonify({"message": f"Proyecto con ID {project_id} eliminado correctamente"}), 200

# Ruta para registrar un nuevo presupuesto para un usuario
@api.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Verifico que los campos obligatorios están presentes (project_id, amount y status)
    if not all([data.get(field) for field in ["project_id", "amount", "status"]]):
        raise APIException("Faltan campos obligatorios (project_id, amount, status)", status_code=400)

    # Verifico que el proyecto exista y que pertenezca al usuario actual
    project = Project.query.get(data['project_id'])
    if not project or int(project.user_id) != int(user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    # Creo un nuevo presupuesto con los datos proporcionados
    budget = Budget(
        user_id=user_id,
        project_id=data['project_id'],
        description=data.get('description', ""),  # Uso una cadena vacía como descripción predeterminada
        amount=data['amount'],
        status=data['status'],
        date=datetime.utcnow()  # Establezco la fecha actual como fecha predeterminada
    )
    
    # Guardo el presupuesto en la base de datos
    db.session.add(budget)
    db.session.commit()

    # Devuelvo los datos del presupuesto creado como respuesta
    return jsonify(budget.serialize()), 201

# Ruta para obtener todos los presupuestos registrados por un usuario
@api.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Consulto todos los presupuestos asociados al usuario actual
    budgets = Budget.query.filter_by(user_id=user_id).all()

    # Devuelvo la lista de presupuestos en formato JSON
    return jsonify([budget.serialize() for budget in budgets]), 200

# Ruta para actualizar los datos de un presupuesto específico
@api.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el presupuesto especificado por su ID
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(user_id):
        # Verifico que el presupuesto exista y que pertenezca al usuario actual
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=403)

    # Extraigo los datos enviados en el cuerpo de la solicitud
    data = request.json

    # Actualizo los campos del presupuesto solo si se proporcionan
    budget.amount = data.get("amount", budget.amount)
    budget.status = data.get("status", budget.status)
    budget.description = data.get("description", budget.description)

    # Guardo los cambios en la base de datos
    db.session.commit()

    # Devuelvo los datos actualizados del presupuesto como respuesta
    return jsonify(budget.serialize()), 200

# Ruta para eliminar un presupuesto específico
@api.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Busco el presupuesto especificado por su ID
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(user_id):
        # Verifico que el presupuesto exista y que pertenezca al usuario actual
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=403)

    # Elimino el presupuesto de la base de datos
    db.session.delete(budget)
    db.session.commit()

    # Devuelvo un mensaje de confirmación como respuesta
    return jsonify({"message": f"Presupuesto con ID {budget_id} eliminado correctamente"}), 200

# Ruta para generar un gráfico basado en las transacciones del usuario
@api.route('/chart', methods=['GET'])
@jwt_required()
def generate_chart():
    # Obtengo el ID del usuario autenticado desde el token JWT
    user_id = get_jwt_identity()
    
    # Obtengo las fechas de inicio y fin opcionales desde los parámetros de la URL
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Preparo la consulta para filtrar transacciones del usuario actual
    query = Transaction.query.filter_by(user_id=user_id)

    # Valido y aplico el filtro de fecha de inicio si está presente
    if start_date:
        try:
            start_date_parsed = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.date >= start_date_parsed)
        except ValueError:
            # Manejo el error si el formato de fecha es incorrecto
            raise APIException("Formato de fecha inválido para start_date. Debe ser 'YYYY-MM-DD'", status_code=400)

    # Valido y aplico el filtro de fecha de fin si está presente
    if end_date:
        try:
            end_date_parsed = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Transaction.date <= end_date_parsed)
        except ValueError:
            # Manejo el error si el formato de fecha es incorrecto
            raise APIException("Formato de fecha inválido para end_date. Debe ser 'YYYY-MM-DD'", status_code=400)

    # Ejecuto la consulta y obtengo todas las transacciones filtradas
    transactions = query.all()

    # Si no hay transacciones en el rango, devuelvo un error
    if not transactions:
        raise APIException("No se encontraron transacciones en el rango de fechas proporcionado", status_code=404)

    # Transformo las transacciones en el formato requerido por QuickChart
    chart_data = Transaction.transform_for_chart(transactions)

    try:
        # Envío los datos del gráfico a la API de QuickChart para generar el gráfico
        response = requests.post("https://quickchart.io/chart/create", json=chart_data)
        response.raise_for_status()  # Verifico si hubo errores en la solicitud
        return jsonify(response.json()), 200  # Devuelvo el JSON generado por QuickChart
    except requests.RequestException as e:
        # Manejo errores al interactuar con la API de QuickChart
        raise APIException(f"Error al generar el gráfico: {str(e)}", status_code=500)

@api.route('/convert', methods=['GET'])
@jwt_required()  # Si necesitas autenticar la solicitud
def convert_currency():
    # Obtén los parámetros de la solicitud
    base = request.args.get('base', 'USD')  # Moneda base (por defecto: USD)
    target = request.args.get('target', 'EUR')  # Moneda objetivo (por defecto: EUR)
    amount = request.args.get('amount', 1)  # Cantidad a convertir (por defecto: 1)

    try:
        # Valida que amount sea un número
        amount = float(amount)
    except ValueError:
        raise APIException("El parámetro 'amount' debe ser un número válido.", status_code=400)

    # URL de la API de ExchangeRate-API
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/{base}"

    try:
        # Realiza la solicitud a ExchangeRate-API
        response = requests.get(url)
        response.raise_for_status()  # Verifica errores en la respuesta

        # Procesa los datos de la API
        data = response.json()
        rate = data["conversion_rates"].get(target)

        if not rate:
            raise APIException(f"No se encontró la tasa de cambio para la moneda objetivo: {target}", status_code=404)

        # Calcula el monto convertido
        converted_amount = round(amount * rate, 2)

        # Devuelve la respuesta en formato JSON
        return jsonify({
            "base": base,
            "target": target,
            "amount": amount,
            "converted_amount": converted_amount,
            "rate": rate
        }), 200

    except requests.RequestException as e:
        # Maneja errores en la solicitud a la API externa
        raise APIException(f"Error al conectarse a la API de ExchangeRate: {str(e)}", status_code=500)
