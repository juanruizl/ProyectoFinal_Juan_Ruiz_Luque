import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Projects = () => {
  const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el contexto.

  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal.
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    start_date: "",
    end_date: "",
  }); // Estado local para manejar los datos del formulario.

  useEffect(() => {
    actions.loadProjects(); // Cargo la lista de proyectos al montar el componente.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierro el modal.
  const handleModalShow = () => setShowModal(true); // Abro el modal.

  const handleChange = (e) => {
    // Actualizo los campos del formulario según los datos ingresados.
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evito el comportamiento por defecto del formulario.
    // Llamo a la acción para crear o actualizar el proyecto.
    const success = formData.id
      ? await actions.updateEntity("projects", formData.id, "projects", formData)
      : await actions.createEntity("projects", "projects", formData);
    if (success) {
      setShowModal(false); // Cierro el modal si la operación es exitosa.
      setFormData({ name: "", description: "", client: "", start_date: "", end_date: "" }); // Limpio el formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmo antes de eliminar un proyecto.
    if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      await actions.deleteEntity("projects", id, "projects"); // Llamo a la acción para eliminar el proyecto.
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary mb-4">Proyectos</h1>

      {/* Tabla para listar los proyectos */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="bg-dark text-white">
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
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(project); // Cargo los datos del proyecto seleccionado en el formulario.
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                {/* Botón para eliminar un proyecto */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para añadir un nuevo proyecto */}
      <Button variant="primary" onClick={handleModalShow} className="mt-4">
        Añadir Proyecto
      </Button>

      {/* Modal para crear o editar proyectos */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Proyecto" : "Nuevo Proyecto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Campo para el nombre del proyecto */}
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
            {/* Campo para la descripción del proyecto */}
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
            {/* Campo para el cliente del proyecto */}
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
            {/* Campo para la fecha de inicio del proyecto */}
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Campo para la fecha de finalización del proyecto */}
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Botón para enviar el formulario */}
            <Button variant="primary" type="submit" className="w-100">
              {formData.id ? "Actualizar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Projects;
