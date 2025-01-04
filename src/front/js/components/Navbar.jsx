import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Navbar = () => {
    const { store, actions } = useContext(Context); // Accedo al estado global y acciones.
    const navigate = useNavigate();

    const handleLogout = () => {
        actions.logout(); // Llamo a la acción para cerrar sesión.
        navigate("/login"); // Redirijo al usuario al login.
    };

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark"
            style={{
                backgroundColor: "#333333", // Color oscuro uniforme para la barra.
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra para una apariencia más moderna.
            }}
        >
            <div className="container">
                {/* Logo */}
                <Link
                    className="navbar-brand fw-bold fs-4 text-uppercase"
                    to={store.token ? "/dashboard" : "/"}
                >
                    <span style={{ color: "#28a745" }}>Gestión</span> Empresarial
                </Link>

                {/* Toggle para dispositivos móviles */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Links de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {store.token ? (
                            <>
                                {/* Links para usuarios autenticados */}
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/dashboard">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/transactions">
                                        Transacciones
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/projects">
                                        Proyectos
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/employees">
                                        Empleados
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/budgets">
                                        Presupuestos
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/profile">
                                        Perfil
                                    </Link>
                                </li>
                                {/* Botón de Cerrar Sesión */}
                                <li className="nav-item">
                                    <button
                                        className="btn btn-outline-danger btn-sm ms-lg-3"
                                        onClick={handleLogout}
                                    >
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Links para visitantes */}
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/login">
                                        Iniciar Sesión
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link
                                        className="btn btn-success btn-sm text-white px-4 py-2 ms-lg-3"
                                        style={{
                                            borderRadius: "20px", // Botón redondeado para registro.
                                            fontWeight: "bold", // Texto en negrita.
                                        }}
                                        to="/signup"
                                    >
                                        Registrarse
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
