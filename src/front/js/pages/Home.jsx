import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home.css";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <header className="hero-section">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Gestión Empresarial para Autónomos</h1>
          <p>
            Gestiona tu negocio de manera profesional y eficiente con nuestra solución integral.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Iniciar Sesión
            </Link>
            <Link to="/signup" className="btn btn-outline-light">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ¿Qué ofrecemos? */}
      <section className="section">
        <h2>¿Qué ofrecemos?</h2>
        <p>
          Nuestra plataforma es la herramienta ideal para autónomos y pequeñas empresas, optimizando tus procesos.
        </p>
        <div className="container services">
          <div className="row">
            <div className="col-md-6">
              <ul>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Gestión de cobros y pagos.</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Administración eficiente de empleados.</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Control de proyectos y presupuestos.</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Reportes financieros detallados.</span>
                </li>
              </ul>
            </div>
            <div className="col-md-6">
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
      <section className="features">
        <div className="container">
          <h2>Características Destacadas</h2>
          <div className="features-grid">
            <div className="card">
              <i className="fas fa-wallet"></i>
              <h4>Gestión Financiera</h4>
              <p>Organiza tus ingresos y gastos de manera eficiente.</p>
            </div>
            <div className="card">
              <i className="fas fa-users"></i>
              <h4>Gestión de Empleados</h4>
              <p>Mantén el control sobre tu equipo y optimiza su rendimiento.</p>
            </div>
            <div className="card">
              <i className="fas fa-chart-bar"></i>
              <h4>Reportes Detallados</h4>
              <p>Accede a reportes financieros detallados y visuales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>¿Listo para transformar tu negocio?</h2>
        <p>Regístrate hoy mismo y comienza a disfrutar de todas las ventajas que ofrecemos.</p>
        <Link to="/signup" className="btn btn-primary">
          Comenzar Ahora
        </Link>
      </section>
    </div>
  );
};

export default Home;
