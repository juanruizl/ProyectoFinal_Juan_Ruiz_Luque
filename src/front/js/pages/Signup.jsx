import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/signup.css"; // Importo los estilos para el formulario

const Signup = () => {
    const { actions } = useContext(Context); // Uso las acciones globales del contexto
    const [formData, setFormData] = useState({
        name: "", // Estado para almacenar los datos del formulario
        company: "",
        industry: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevengo el comportamiento predeterminado del formulario
        const success = await actions.register(formData); // Llamo a la acción para registrar al usuario
        if (success) {
            alert("Usuario registrado correctamente");
            window.location.href = "/login"; // Redirijo al login tras el registro
        } else {
            alert("Error al registrar el usuario");
        }
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Crear Cuenta</h2>
                {/* Campo para el nombre */}
                <div className="form-group">
                    <i className="fas fa-user"></i>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                {/* Campo para la empresa */}
                <div className="form-group">
                    <i className="fas fa-building"></i>
                    <input
                        type="text"
                        placeholder="Nombre de la empresa"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                    />
                </div>
                {/* Campo para la industria */}
                <div className="form-group">
                    <i className="fas fa-industry"></i>
                    <input
                        type="text"
                        placeholder="Sector de la empresa"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        required
                    />
                </div>
                {/* Campo para el correo electrónico */}
                <div className="form-group">
                    <i className="fas fa-envelope"></i>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                {/* Campo para la contraseña */}
                <div className="form-group">
                    <i className="fas fa-lock"></i>
                    <input
                        type="password"
                        placeholder="Crea una contraseña"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit">Registrarse</button>
                {/* Enlace para redirigir al login */}
                <p>
                    ¿Ya tienes una cuenta?{" "}
                    <a href="/login">Inicia sesión aquí</a>
                </p>
            </form>
        </div>
    );
};

export default Signup;
