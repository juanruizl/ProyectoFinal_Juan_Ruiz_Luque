import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { actions } = useContext(Context); // Accedo a las acciones globales para manejar la autenticación.
    const [email, setEmail] = useState(""); // Estado local para el correo electrónico.
    const [password, setPassword] = useState(""); // Estado local para la contraseña.
    const navigate = useNavigate(); // Uso el hook de navegación para redirigir a otras vistas.

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evito el comportamiento por defecto del formulario.
        const success = await actions.login(email, password); // Llamo a la acción de inicio de sesión.
        if (success) {
            navigate("/dashboard"); // Redirijo al Dashboard si el inicio de sesión es exitoso.
        } else {
            alert("Error en el inicio de sesión"); // Muestro un mensaje de error si las credenciales no son válidas.
        }
    };

    return (
        <div
            className="container-fluid d-flex justify-content-center align-items-center vh-100"
            style={{
                background: "linear-gradient(135deg, #e3f2fd, #90caf9)", // Fondo con degradado para una apariencia agradable.
            }}
        >
            <div className="col-md-4 p-5 bg-white shadow rounded">
                <h2 className="text-center text-primary mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    {/* Campo para ingresar el correo electrónico */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Actualizo el estado del correo al escribir.
                            required
                        />
                    </div>
                    {/* Campo para ingresar la contraseña */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Actualizo el estado de la contraseña al escribir.
                            required
                        />
                    </div>
                    {/* Botón para enviar el formulario */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 fw-bold"
                    >
                        Entrar
                    </button>
                </form>
                <p className="text-center mt-3">
                    {/* Enlace para redirigir al formulario de registro */}
                    ¿No tienes una cuenta?{" "}
                    <a
                        href="/signup"
                        className="text-primary text-decoration-none fw-bold"
                        style={{
                            textDecoration: "underline", // Subrayo el enlace para destacar el texto.
                            textUnderlineOffset: "3px", // Espaciado adicional para el subrayado.
                        }}
                    >
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
