import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const UserProfile = () => {
  const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el contexto.
  const navigate = useNavigate(); // Uso el hook de navegación para redirigir al usuario.
  const [formData, setFormData] = useState({
    name: store.user?.name || "", // Inicializo con el nombre del usuario almacenado o vacío.
    company: store.user?.company || "", // Inicializo con el nombre de la compañía del usuario.
    industry: store.user?.industry || "", // Inicializo con el sector de la industria.
    password: "", // La contraseña está vacía inicialmente para seguridad.
  });

  const handleInputChange = (e) => {
    // Actualizo el estado del formulario con los valores ingresados por el usuario.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    // Llamo a la acción para actualizar el perfil del usuario.
    const success = await actions.updateUser(formData);
    if (success) {
      alert("Perfil actualizado con éxito."); // Notifico si la actualización fue exitosa.
    } else {
      alert("Hubo un error al actualizar el perfil."); // Muestro un mensaje en caso de error.
    }
  };

  const handleDelete = async () => {
    // Confirmo si el usuario desea eliminar su cuenta.
    const confirmDelete = window.confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (confirmDelete) {
      const success = await actions.deleteAccount(); // Llamo a la acción para eliminar la cuenta.
      if (success) {
        alert("Cuenta eliminada con éxito."); // Notifico si la eliminación fue exitosa.
        navigate("/"); // Redirijo al usuario a la página principal.
      } else {
        alert("Hubo un error al eliminar la cuenta."); // Muestro un mensaje en caso de error.
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Perfil de Usuario</h2>
      <div className="card shadow p-4">
        <form>
          {/* Campo para editar el nombre del usuario */}
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Nombre</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Campo para editar la compañía del usuario */}
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Compañía</label>
            <input
              type="text"
              name="company"
              className="form-control"
              value={formData.company}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Campo para editar el sector de la industria */}
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Industria</label>
            <input
              type="text"
              name="industry"
              className="form-control"
              value={formData.industry}
              onChange={handleInputChange}
            />
          </div>
          {/* Campo para actualizar la contraseña */}
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Nueva Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
        </form>
        <div className="d-flex justify-content-between mt-4">
          {/* Botón para guardar los cambios realizados en el perfil */}
          <button className="btn btn-primary" onClick={handleUpdate}>
            <i className="bi bi-save me-2"></i> Guardar Cambios
          </button>
          {/* Botón para eliminar la cuenta del usuario */}
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-2"></i> Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
