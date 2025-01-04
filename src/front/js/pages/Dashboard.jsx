import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import Chart from "../components/Chart.jsx";

const Dashboard = () => {
    const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el Contexto.
    const [loading, setLoading] = useState(true); // Estado para gestionar el indicador de carga.
    const [error, setError] = useState(null); // Estado para manejar errores durante la carga de datos.

    useEffect(() => {
        // Cargo los datos iniciales de la aplicación usando acciones globales.
        const fetchData = async () => {
            try {
                await actions.getCurrentUser(); // Obtengo los datos del usuario actual.
                await actions.loadTransactions(); // Cargo las transacciones financieras.
                await actions.loadProjects(); // Cargo la lista de proyectos activos.
                await actions.loadEmployees(); // Cargo la lista de empleados registrados.
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error); // Registro cualquier error que ocurra.
                setError("Hubo un error al cargar los datos. Por favor, inténtalo de nuevo."); // Actualizo el estado de error para mostrar un mensaje al usuario.
            } finally {
                setLoading(false); // Termino el indicador de carga.
            }
        };

        fetchData();
    }, []); // Este efecto se ejecuta una sola vez al montar el componente.

    if (loading) {
        // Muestro un mensaje mientras los datos están cargando.
        return (
            <div className="container mt-5 text-center">
                <h2>Cargando datos...</h2>
            </div>
        );
    }

    if (error) {
        // Muestro un mensaje de error con opción para reintentar la carga.
        return (
            <div className="container mt-5 text-center">
                <h2 className="text-danger">{error}</h2>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => {
                        setLoading(true); // Reinicio el estado de carga.
                        setError(null); // Limpio cualquier error previo.
                        actions.getCurrentUser(); // Intento cargar los datos del usuario nuevamente.
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const user = store.currentUser || {}; // Aseguro que siempre haya un objeto de usuario, aunque esté vacío.

    return (
        <div className="container mt-5">
            {/* Encabezado con datos del usuario y su empresa */}
            <div className="row mb-4 text-center">
                <div className="col">
                    <h1 className="fw-bold text-primary">{user.company || "Mi Empresa"}</h1> {/* Muestro el nombre de la empresa o un texto genérico */}
                    <p className="text-muted fs-5">
                        Bienvenido, <span className="text-dark fw-bold">{user.name || "Usuario"}</span>. {/* Saludo personalizado al usuario */}
                    </p>
                </div>
            </div>

            {/* Resumen general dividido en tarjetas */}
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-primary">Proyectos</h5>
                            <p className="card-text text-muted">Proyectos activos</p>
                            <h2 className="fw-bold text-primary">{store.projects?.length || 0}</h2> {/* Cantidad de proyectos activos */}
                            <a href="/projects" className="btn btn-outline-primary mt-3 w-100">Ver Proyectos</a> {/* Enlace a más detalles */}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-success">Transacciones</h5>
                            <p className="card-text text-muted">Registros financieros</p>
                            <h2 className="fw-bold text-success">{store.transactions?.length || 0}</h2> {/* Cantidad de transacciones */}
                            <a href="/transactions" className="btn btn-outline-success mt-3 w-100">Ver Transacciones</a>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-warning">Empleados</h5>
                            <p className="card-text text-muted">Personal registrado</p>
                            <h2 className="fw-bold text-warning">{store.employees?.length || 0}</h2> {/* Cantidad de empleados registrados */}
                            <a href="/employees" className="btn btn-outline-warning mt-3 w-100">Ver Empleados</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección del gráfico financiero */}
            <div className="row mt-5">
                <div className="col">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="fw-bold mb-0">Resumen Financiero</h5> {/* Título del gráfico */}
                        </div>
                        <div className="card-body">
                            <Chart /> {/* Componente gráfico que visualiza los datos financieros */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
