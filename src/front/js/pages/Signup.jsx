import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const Signup = () => {
    const { actions } = useContext(Context); // Accedo a las acciones globales desde el contexto.
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        industry: "",
        email: "",
        password: "",
    }); // Guardo los datos del formulario en un estado local.

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevengo el comportamiento por defecto del formulario.
        const success = await actions.register(formData); // Llamo a la acción global para registrar al usuario.
        if (success) {
            alert("Usuario registrado correctamente"); // Notifico al usuario en caso de éxito.
            window.location.href = "/login"; // Redirijo al usuario a la página de inicio de sesión.
        } else {
            alert("Error al registrar el usuario"); // Muestro un mensaje de error en caso de fallo.
        }
    };

    return (
        <div
            className="container-fluid d-flex justify-content-center align-items-center vh-100"
            style={{
                background: "linear-gradient(135deg, #fce4ec, #f8bbd0)", // Fondo con degradado suave para mejorar la estética.
            }}
        >
            <div className="col-md-6 p-5 bg-white shadow rounded">
                <h2 className="text-center text-primary mb-4">Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    {/* Campo para el nombre del usuario */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ingresa tu nombre completo"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value }) // Actualizo el estado local con el valor ingresado.
                            }
                            required
                        />
                    </div>
                    {/* Campo para el nombre de la empresa */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre de la Empresa</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de tu empresa"
                            value={formData.company}
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                            required
                        />
                    </div>
                    {/* Campo para la industria o sector */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Industria</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Sector de la empresa"
                            value={formData.industry}
                            onChange={(e) =>
                                setFormData({ ...formData, industry: e.target.value })
                            }
                            required
                        />
                    </div>
                    {/* Campo para el correo electrónico */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Ingresa tu correo"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>
                    {/* Campo para la contraseña */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Crea una contraseña"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>
                    {/* Botón para enviar el formulario */}
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                        Registrarse
                    </button>
                </form>
                {/* Enlace para redirigir al inicio de sesión */}
                <p className="text-center mt-3">
                    ¿Ya tienes una cuenta?{" "}
                    <a
                        href="/login"
                        className="text-decoration-none text-primary fw-bold"
                        style={{
                            textDecoration: "underline", // Subrayo el enlace para hacerlo más visible.
                            textUnderlineOffset: "3px", // Espacio extra entre el texto y el subrayado.
                        }}
                    >
                        Inicia sesión aquí
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
