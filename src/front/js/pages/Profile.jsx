import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profile.css";

const UserProfile = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Estoy controlando si los datos aún están cargando.
  const [error, setError] = useState(null); // Aquí guardo cualquier error que ocurra al cargar datos.
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    industry: "",
  });

  useEffect(() => {
    // En esta función cargo los datos del usuario actual al montar el componente.
    const fetchData = async () => {
      try {
        await actions.getCurrentUser(); // Llamo a la acción que obtiene los datos del usuario actual.
        if (store.currentUser) {
          // Si hay datos del usuario, los paso al formulario.
          setFormData({
            name: store.currentUser.name || "",
            company: store.currentUser.company || "",
            industry: store.currentUser.industry || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        setError("Hubo un problema al cargar los datos del usuario."); // Si algo falla, lo guardo en el estado de error.
      } finally {
        setLoading(false); // Cambio el estado para indicar que ya terminó de cargar.
      }
    };

    fetchData(); // Llamo a la función para cargar los datos.
  }, [actions, store.currentUser]);

  const handleInputChange = (e) => {
    // Aquí actualizo el estado del formulario con los datos que el usuario ingresa.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    // Cuando guardo los cambios, llamo a la acción para actualizar los datos del usuario.
    const success = await actions.updateUser(formData);
    if (success) {
      alert("Perfil actualizado con éxito."); // Notifico al usuario si todo salió bien.
    } else {
      alert("Hubo un error al actualizar el perfil."); // Notifico si algo salió mal.
    }
  };

  const handleDeleteAccount = async () => {
    // Antes de eliminar la cuenta, confirmo con el usuario.
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (confirmDelete) {
      const success = await actions.deleteAccount(); // Llamo a la acción para eliminar la cuenta.
      if (success) {
        alert("Cuenta eliminada con éxito."); // Notifico al usuario si la cuenta fue eliminada.
        navigate("/"); // Redirijo al usuario a la página principal.
      } else {
        alert("Hubo un error al eliminar la cuenta."); // Notifico si algo salió mal.
      }
    }
  };

  if (loading) {
    // Mientras los datos están cargando, muestro un mensaje al usuario.
    return (
      <div className="container mt-5 text-center">
        <h2>
          <i className="fas fa-spinner fa-spin"></i> Cargando datos...
        </h2>
      </div>
    );
  }

  if (error) {
    // Si ocurre un error, muestro el mensaje y doy la opción de reintentar.
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </h2>
        <button
          className="btn btn-primary mt-3"
          onClick={() => {
            setLoading(true); // Vuelvo a iniciar el estado de carga.
            setError(null); // Limpio cualquier error anterior.
            actions.getCurrentUser(); // Vuelvo a intentar cargar los datos del usuario.
          }}
        >
          <i className="fas fa-redo"></i> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>
        <i className="fas fa-user-circle"></i> Perfil de Usuario
      </h2>
      <form className="mt-4">
        <div className="input-group">
          <label htmlFor="name">
            <span className="label-icon">
              <i className="fas fa-user"></i>
            </span>
            Nombre
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange} // Actualizo el estado cuando el usuario escribe.
            placeholder="Ingrese su nombre"
          />
        </div>
        <div className="input-group">
          <label htmlFor="company">
            <span className="label-icon">
              <i className="fas fa-building"></i>
            </span>
            Compañía
          </label>
          <input
            id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Ingrese su compañía"
          />
        </div>
        <div className="input-group">
          <label htmlFor="industry">
            <span className="label-icon">
              <i className="fas fa-industry"></i>
            </span>
            Industria
          </label>
          <input
            id="industry"
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            placeholder="Ingrese su industria"
          />
        </div>
        <button className="btn btn-primary" type="button" onClick={handleUpdate}>
          <i className="fas fa-save"></i> Guardar Cambios
        </button>
        <button className="btn btn-danger" type="button" onClick={handleDeleteAccount}>
          <i className="fas fa-trash"></i> Eliminar Cuenta
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
