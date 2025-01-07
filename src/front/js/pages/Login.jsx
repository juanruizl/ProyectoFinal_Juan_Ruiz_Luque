import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css"; // Importo los estilos específicos para esta página

const Login = () => {
    const { actions } = useContext(Context); // Accedo a las acciones globales desde el contexto
    const [email, setEmail] = useState(""); // Estado para almacenar el correo
    const [password, setPassword] = useState(""); // Estado para almacenar la contraseña
    const navigate = useNavigate(); // Para redirigir al usuario tras el login

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evito el comportamiento predeterminado del formulario
        const success = await actions.login(email, password); // Intento iniciar sesión con las credenciales
        if (success) {
            navigate("/dashboard"); // Redirijo al Dashboard si el login es exitoso
        } else {
            alert("Error en el inicio de sesión"); // Muestro un mensaje si hay un error
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Iniciar Sesión</h2>
                {/* Campo para el correo electrónico */}
                <div className="form-group">
                    <i className="fas fa-envelope"></i>
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {/* Campo para la contraseña */}
                <div className="form-group">
                    <i className="fas fa-lock"></i>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Entrar</button>
                {/* Enlace para redirigir al registro */}
                <p>
                    ¿No tienes una cuenta?{" "}
                    <a href="/signup">Regístrate aquí</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
