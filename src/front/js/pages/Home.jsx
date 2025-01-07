import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home.css";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      {/* Sección principal con título, descripción y botones */}
      <header className="hero-section">
        <div className="overlay"></div> {/* Fondo oscuro translúcido */}
        <div className="hero-content">
          <h1>Gestión Empresarial para Autónomos</h1> {/* Título principal */}
          <p>
            Gestiona tu negocio de manera profesional y eficiente con nuestra
            solución integral.
          </p> {/* Descripción breve */}
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-success">
              Iniciar Sesión {/* Botón para ir al login */}
            </Link>
            <Link to="/signup" className="btn btn-outline-light">
              Registrarse {/* Botón para ir al registro */}
            </Link>
          </div>
        </div>
      </header>

      {/* ¿Qué ofrecemos? */}
      {/* Resumen de los servicios principales */}
      <section className="section">
        <h2>¿Qué ofrecemos?</h2> {/* Encabezado de sección */}
        <p>
          Nuestra plataforma es la herramienta ideal para autónomos y pequeñas
          empresas...
        </p> {/* Breve introducción */}
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              {/* Lista de beneficios */}
              <ul>
                <li>
                  <i className="fas fa-check-circle"></i> Gestión de cobros y
                  pagos.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Administración
                  eficiente de empleados.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Control de proyectos y
                  presupuestos.
                </li>
                <li>
                  <i className="fas fa-check-circle"></i> Reportes financieros
                  detallados.
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              {/* Imagen ilustrativa */}
              <img
                src="https://lideresmexicanos.com/wp-content/uploads/2020/03/Innovacion.jpg"
                alt="Gestión Empresarial"
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Características Destacadas */}
      {/* Destaco las áreas principales */}
      <section className="features">
        <div className="container">
          <h2>Características Destacadas</h2> {/* Encabezado */}
          <div className="row">
            {/* Tarjeta 1 */}
            <div className="card">
              <i className="fas fa-wallet"></i> {/* Icono */}
              <h4>Gestión Financiera</h4> {/* Título */}
              <p>Organiza tus ingresos y gastos...</p> {/* Descripción */}
            </div>
            {/* Tarjeta 2 */}
            <div className="card">
              <i className="fas fa-users"></i>
              <h4>Gestión de Empleados</h4>
              <p>Mantén control de tus empleados...</p>
            </div>
            {/* Tarjeta 3 */}
            <div className="card">
              <i className="fas fa-chart-bar"></i>
              <h4>Reportes Detallados</h4>
              <p>Accede a reportes financieros...</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Llamada a la acción final */}
      <section className="cta-section">
        <h2>¿Listo para transformar tu negocio?</h2> {/* Mensaje motivador */}
        <p>Regístrate hoy mismo y comienza a disfrutar de todas las ventajas.</p> {/* Recordatorio */}
        <Link to="/signup" className="btn">
          Comenzar Ahora {/* Botón para el registro */}
        </Link>
      </section>
    </div>
  );
};

export default Home;
