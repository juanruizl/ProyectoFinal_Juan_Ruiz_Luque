"""
Este módulo se encarga de iniciar el servidor API, cargar la base de datos y registrar los endpoints.
"""

import os
import logging
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from api.utils import APIException, generate_sitemap

# Creo la instancia de Flask para iniciar la aplicación
app = Flask(__name__)
app.url_map.strict_slashes = False

# Configuro JWT para manejar tokens de autenticación
app.config['JWT_SECRET_KEY'] = 'JuanrRuProject'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
jwt = JWTManager(app)

# Configuro CORS para permitir solicitudes desde cualquier origen
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuro el entorno de ejecución (desarrollo o producción)
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

# Configuro el registro de logs para el servidor
logging.basicConfig(level=logging.DEBUG)

# Configuro la base de datos usando la variable de entorno DATABASE_URL
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Ajusto la URL si es PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    # Uso una base de datos SQLite por defecto si no se configura otra
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type=True)

# Registro configuraciones adicionales y Blueprints
setup_admin(app)  # Configuro la interfaz de administración
setup_commands(app)  # Registro comandos personalizados
app.register_blueprint(api, url_prefix='/api')  # Registro los endpoints principales

# Manejo de errores personalizados usando APIException
@app.errorhandler(APIException)
def handle_api_exception(error):
    # Devuelvo el error en formato JSON con el código de estado correspondiente
    return jsonify(error.to_dict()), error.status_code

# Genero el sitemap en desarrollo para facilitar el acceso a los endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Sirvo archivos estáticos desde el directorio público
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    # Si el archivo solicitado no existe, sirvo el archivo index.html
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # Desactivo el caché para desarrollo
    return response

# Defino el punto de entrada principal para ejecutar el servidor
if __name__ == '__main__':
    # Obtengo el puerto desde las variables de entorno o uso el puerto 3001 por defecto
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
