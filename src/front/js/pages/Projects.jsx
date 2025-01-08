import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "../../styles/estilosVistas.css";

const Projects = () => {
  const { store, actions } = useContext(Context); // Uso del contexto global para acceder a los proyectos y las acciones.

  const [showModal, setShowModal] = useState(false); // Controla si el modal está abierto o cerrado.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    start_date: "",
    end_date: "",
  }); // Estado local para manejar los datos del formulario.

  useEffect(() => {
    actions.loadProjects(); // Cargo la lista de proyectos cuando se monta el componente.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierra el modal.
  const handleModalShow = () => setShowModal(true); // Abre el modal.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Actualizo los campos del formulario según el input del usuario.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Llamo a la acción para crear o actualizar el proyecto según si hay un `id` en los datos.
    const success = formData.id
      ? await actions.updateEntity("projects", formData.id, "projects", formData)
      : await actions.createEntity("projects", "projects", formData);

    if (success) {
      setShowModal(false); // Cierra el modal si la operación es exitosa.
      setFormData({ name: "", description: "", client: "", start_date: "", end_date: "" }); // Reseteo el formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmación antes de eliminar un proyecto.
    if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      await actions.deleteEntity("projects", id, "projects"); // Elimina el proyecto con el ID proporcionado.
    }
  };

  return (
    <div className="container projects-container mt-5">
      <h1>Proyectos</h1>

      {/* Listado de proyectos en una tabla */}
      <Table className="table shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cliente</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.projects.map((project, index) => (
            <tr key={project.id}>
              <td>{index + 1}</td>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>{project.client}</td>
              <td>{project.start_date ? project.start_date.split("T")[0] : "-"}</td>
              <td>{project.end_date ? project.end_date.split("T")[0] : "-"}</td>
              <td>
                {/* Botón para editar un proyecto */}
                <Button
                  className="btn btn-outline-primary me-2"
                  size="sm"
                  onClick={() => {
                    setFormData(project); // Cargo los datos del proyecto seleccionado en el formulario.
                    handleModalShow(); // Abro el modal.
                  }}
                >
                  <i className="fas fa-edit"></i> Editar
                </Button>
                {/* Botón para eliminar un proyecto */}
                <Button
                  className="btn btn-outline-danger"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                >
                  <i className="fas fa-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para abrir el modal y crear un nuevo proyecto */}
      <Button className="btn btn-primary mt-4" onClick={handleModalShow}>
        <i className="fas fa-plus-circle"></i> Añadir Proyecto
      </Button>

      {/* Modal para crear o editar proyectos */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Proyecto" : "Nuevo Proyecto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
            <Button className="btn btn-primary w-100" type="submit">
              {formData.id ? "Actualizar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Projects;
