import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "../../styles/estilosVistas.css";
import Converter from "../components/Converter.jsx";

const Employees = () => {
  const { store, actions } = useContext(Context);

  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal.
  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    position: "",
  }); // Estado local para manejar los datos del formulario.

  useEffect(() => {
    actions.loadEmployees(); // Cargo la lista de empleados al montar el componente.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierra el modal.
  const handleModalShow = () => setShowModal(true); // Abre el modal.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Actualizo los datos del formulario.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Llamo a la acción para crear o actualizar un empleado según si existe un `id`.
    const success = formData.id
      ? await actions.updateEntity("employees", formData.id, "employees", formData)
      : await actions.createEntity("employees", "employees", formData);

    if (success) {
      setShowModal(false); // Cierro el modal si la operación es exitosa.
      setFormData({ name: "", salary: "", position: "" }); // Limpio los datos del formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmo antes de eliminar un empleado.
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      await actions.deleteEntity("employees", id, "employees");
    }
  };

  return (
    <div className="container employees-container mt-5">
      <h1>Empleados</h1>

      {/* Tabla para mostrar la lista de empleados */}
      <Table className="table shadow-sm mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Salario (USD)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.employees.map((employee, index) => (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td>{employee.name}</td>
              <td>{employee.position || "-"}</td>
              <td>
                ${employee.salary.toLocaleString()}{" "}
                {/* Componente para mostrar el salario convertido a otra moneda */}
                <Converter
                  value={employee.salary}
                  baseCurrency="USD"
                  targetCurrency="EUR"
                />
              </td>
              <td>
                <Button
                  className="btn btn-outline-primary me-2"
                  size="sm"
                  onClick={() => {
                    setFormData(employee); // Cargo los datos del empleado seleccionado.
                    handleModalShow(); // Abro el modal para editar.
                  }}
                >
                  <i className="fas fa-edit"></i> Editar
                </Button>
                <Button
                  className="btn btn-outline-danger"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                >
                  <i className="fas fa-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para abrir el modal y añadir un nuevo empleado */}
      <Button className="btn btn-primary mt-4" onClick={handleModalShow}>
        <i className="fas fa-plus-circle"></i> Añadir Empleado
      </Button>

      {/* Modal para crear o editar empleados */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Empleado" : "Nuevo Empleado"}</Modal.Title>
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
              <Form.Label>Puesto</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salario</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
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

export default Employees;

