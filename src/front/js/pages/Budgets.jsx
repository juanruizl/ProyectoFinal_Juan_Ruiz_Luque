import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "../../styles/estilosVistas.css";
import Converter from "../components/Converter.jsx";

const Budgets = () => {
  const { store, actions } = useContext(Context);

  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal.
  const [formData, setFormData] = useState({
    project_id: "",
    description: "",
    amount: "",
    status: "pending",
  }); // Estado local para manejar los datos del formulario.

  useEffect(() => {
    actions.loadBudgets(); // Cargo la lista de presupuestos al montar el componente.
    actions.loadProjects(); // Cargo los proyectos disponibles para asociar presupuestos.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierra el modal.
  const handleModalShow = () => setShowModal(true); // Abre el modal.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Actualizo los datos del formulario.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determino si se está creando o actualizando un presupuesto.
    const success = formData.id
      ? await actions.updateEntity("budgets", formData.id, "budgets", formData)
      : await actions.createEntity("budgets", "budgets", formData);

    if (success) {
      setShowModal(false); // Cierra el modal al completar la operación.
      setFormData({ project_id: "", description: "", amount: "", status: "pending" }); // Reseteo el formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmo antes de eliminar un presupuesto.
    if (window.confirm("¿Estás seguro de que deseas eliminar este presupuesto?")) {
      await actions.deleteEntity("budgets", id, "budgets");
    }
  };

  return (
    <div className="container budgets-container mt-5">
      <h1>Presupuestos</h1>

      {/* Tabla que lista los presupuestos */}
      <Table className="table shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Proyecto</th>
            <th>Monto (USD)</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.budgets.map((budget, index) => (
            <tr key={budget.id}>
              <td>{index + 1}</td>
              <td>
                {/* Busco el nombre del proyecto asociado al presupuesto */}
                {store.projects.find((project) => project.id === budget.project_id)?.name ||
                  "Desconocido"}
              </td>
              <td>
                ${budget.amount.toLocaleString()}{" "}
                {/* Componente para mostrar el monto convertido */}
                <Converter
                  value={budget.amount}
                  baseCurrency="USD"
                  targetCurrency="EUR"
                />
              </td>
              <td>{budget.description || "-"}</td>
              <td>
                {/* Etiqueta dinámica basada en el estado del presupuesto */}
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
                <Button
                  className="btn btn-outline-primary me-2"
                  size="sm"
                  onClick={() => {
                    setFormData(budget); // Cargo los datos del presupuesto en el formulario.
                    handleModalShow(); // Abro el modal para editar.
                  }}
                >
                  <i className="fas fa-edit"></i> Editar
                </Button>
                <Button
                  className="btn btn-outline-danger"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                >
                  <i className="fas fa-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para añadir un nuevo presupuesto */}
      <Button className="btn btn-primary mt-4" onClick={handleModalShow}>
        <i className="fas fa-plus-circle"></i> Añadir Presupuesto
      </Button>

      {/* Modal para crear o editar presupuestos */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Presupuesto" : "Nuevo Presupuesto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Proyecto</Form.Label>
              <Form.Select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar Proyecto</option>
                {/* Listado dinámico de proyectos */}
                {store.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
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
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </Form.Select>
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

export default Budgets;
