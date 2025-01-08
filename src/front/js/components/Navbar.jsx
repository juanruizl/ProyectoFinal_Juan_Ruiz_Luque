import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/navbar.css";

const Navbar = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        actions.logout();
        navigate("/login");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link className="navbar-brand" to={store.token ? "/dashboard" : "/"}>
                    <span className="brand-highlight">GESTIÓN EMPRESARIAL </span>
                </Link>

                {/* Toggle button for mobile */}
                <button className="navbar-toggler" onClick={toggleMenu} aria-label="Toggle navigation">
                    <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
                </button>

                {/* Navigation links */}
                <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                    {store.token ? (
                        <>
                            <li>
                                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                            </li>
                            <li>
                                <Link className="nav-link" to="/transactions">Transacciones</Link>
                            </li>
                            <li>
                                <Link className="nav-link" to="/projects">Proyectos</Link>
                            </li>
                            <li>
                                <Link className="nav-link" to="/employees">Empleados</Link>
                            </li>
                            <li>
                                <Link className="nav-link" to="/budgets">Presupuestos</Link>
                            </li>
                            <li>
                                <Link className="nav-link" to="/profile">Perfil</Link>
                            </li>
                            <li>
                                <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link className="nav-link" to="/login">Iniciar Sesión</Link>
                            </li>
                            <li>
                                <Link className="btn-register" to="/signup">Registrarse</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
