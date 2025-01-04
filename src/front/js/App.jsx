import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Employees from "./pages/Employees.jsx";
import Projects from "./pages/Projects.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import UserProfile from "./pages/Profile.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Navbar /> {/* Siempre muestro el navbar en todas las páginas */}
            <div className="container">
                <Routes>
                    {/* Rutas públicas accesibles sin autenticación */}
                    <Route path="/" element={<Home />} /> {/* Página de inicio */}
                    <Route path="/login" element={<Login />} /> {/* Página de inicio de sesión */}
                    <Route path="/signup" element={<Signup />} /> {/* Página de registro */}

                    {/* Rutas protegidas que requieren autenticación */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} /> {/* Panel principal */}
                        <Route path="/transactions" element={<Transactions />} /> {/* Transacciones financieras */}
                        <Route path="/budgets" element={<Budgets />} /> {/* Presupuestos */}
                        <Route path="/employees" element={<Employees />} /> {/* Gestión de empleados */}
                        <Route path="/projects" element={<Projects />} /> {/* Proyectos */}
                        <Route path="/profile" element={<UserProfile />} /> {/* Perfil de usuario */}
                    </Route>

                    {/* Página por defecto para rutas no encontradas */}
                    <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
                </Routes>
            </div>
            <Footer /> {/* Muestro el footer en todas las páginas */}
        </BrowserRouter>
    );
};

export default App;

