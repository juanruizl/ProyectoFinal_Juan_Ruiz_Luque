import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Budgets = () => {
  const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el contexto.

  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal.
  const [formData, setFormData] = useState({
    project_id: "", // Proyecto asociado al presupuesto.
    description: "", // Descripción del presupuesto.
    amount: "", // Monto del presupuesto.
    status: "pending", // Estado inicial del presupuesto.
  });

  useEffect(() => {
    actions.loadBudgets(); // Cargo la lista de presupuestos al montar el componente.
    actions.loadProjects(); // Cargo la lista de proyectos disponibles.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierro el modal.
  const handleModalShow = () => setShowModal(true); // Abro el modal.

  const handleChange = (e) => {
    // Actualizo los datos del formulario con los valores ingresados.
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevengo el comportamiento por defecto del formulario.
    // Llamo a la acción para crear o actualizar un presupuesto según corresponda.
    const success = formData.id
      ? await actions.updateEntity("budgets", formData.id, "budgets", formData)
      : await actions.createEntity("budgets", "budgets", formData);
    if (success) {
      setShowModal(false); // Cierro el modal tras una operación exitosa.
      setFormData({ project_id: "", description: "", amount: "", status: "pending" }); // Limpio el formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmo antes de eliminar un presupuesto.
    if (window.confirm("¿Estás seguro de que deseas eliminar este presupuesto?")) {
      await actions.deleteEntity("budgets", id, "budgets"); // Llamo a la acción para eliminar el presupuesto.
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary mb-4">Presupuestos</h1>

      {/* Tabla para listar los presupuestos */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="bg-dark text-white">
          <tr>
            <th>#</th>
            <th>Proyecto</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Recorro la lista de presupuestos y los renderizo en la tabla */}
          {store.budgets.map((budget, index) => (
            <tr key={budget.id}>
              <td>{index + 1}</td>
              {/* Busco el nombre del proyecto asociado al presupuesto */}
              <td>
                {store.projects.find((project) => project.id === budget.project_id)?.name ||
                  "Desconocido"}
              </td>
              <td>${budget.amount.toLocaleString()}</td>
              <td>{budget.description || "-"}</td>
              <td>
                {/* Muestro el estado del presupuesto con un badge de color */}
                <span
                  className={`badge ${
                    budget.status === "approved"
                      ? "bg-success"
                      : budget.status === "rejected"
                      ? "bg-danger"
                      : "bg-warning text-dark"
                  }`}
                >
                  {budget.status === "approved"
                    ? "Aprobado"
                    : budget.status === "rejected"
                    ? "Rechazado"
                    : "Pendiente"}
                </span>
              </td>
              <td>
                {/* Botón para editar un presupuesto */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(budget); // Cargo los datos del presupuesto en el formulario.
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                {/* Botón para eliminar un presupuesto */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para añadir un nuevo presupuesto */}
      <Button variant="primary" onClick={handleModalShow} className="mt-4">
        Añadir Presupuesto
      </Button>

      {/* Modal para crear o editar presupuestos */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Presupuesto" : "Nuevo Presupuesto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Selección del proyecto asociado */}
            <Form.Group className="mb-3">
              <Form.Label>Proyecto</Form.Label>
              <Form.Select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar Proyecto</option>
                {/* Lista de proyectos disponibles */}
                {store.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* Campo para la descripción del presupuesto */}
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Campo para el monto del presupuesto */}
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {/* Selección del estado del presupuesto */}
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </Form.Select>
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

export default Budgets;
