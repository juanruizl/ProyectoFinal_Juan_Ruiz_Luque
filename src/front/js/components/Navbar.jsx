import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/navbar.css"; // Importamos los estilos personalizados

const Navbar = () => {
    const { store, actions } = useContext(Context); // Accedo al contexto global
    const navigate = useNavigate(); // Para redirigir al usuario después de ciertas acciones
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar el menú móvil

    const handleLogout = () => {
        actions.logout(); // Llamo a la acción para cerrar sesión
        navigate("/login"); // Redirijo al usuario a la página de inicio de sesión
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // Cambio el estado para abrir o cerrar el menú móvil
    };

    return (
        <nav className="navbar">
            {/* Logo */}
            <Link className="navbar-brand" to={store.token ? "/dashboard" : "/"}>
                <span>Gestión</span> Empresarial {/* Nombre de la aplicación */}
            </Link>

            {/* Botón de toggle para móviles */}
            <button className="navbar-toggler" onClick={toggleMenu}>
                <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i> {/* Icono dinámico */}
            </button>

            {/* Links del menú */}
            <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                {store.token ? (
                    <>
                        {/* Enlaces para usuarios autenticados */}
                        <li>
                            <Link className="nav-link" to="/dashboard">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="/transactions">
                                Transacciones
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="/projects">
                                Proyectos
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="/employees">
                                Empleados
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="/budgets">
                                Presupuestos
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="/profile">
                                Perfil
                            </Link>
                        </li>
                        {/* Botón de cerrar sesión */}
                        <li>
                            <button className="btn btn-outline-danger" onClick={handleLogout}>
                                Cerrar Sesión
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        {/* Enlaces para visitantes */}
                        <li>
                            <Link className="nav-link" to="/login">
                                Iniciar Sesión
                            </Link>
                        </li>
                        <li>
                            <Link className="btn btn-success" to="/signup">
                                Registrarse
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
