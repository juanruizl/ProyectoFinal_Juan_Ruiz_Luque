import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Employees = () => {
  const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el contexto.

  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal.
  const [formData, setFormData] = useState({
    name: "", // Nombre del empleado.
    salary: "", // Salario del empleado.
    position: "", // Puesto del empleado.
  });

  useEffect(() => {
    actions.loadEmployees(); // Cargo la lista de empleados al montar el componente.
  }, []);

  const handleModalClose = () => setShowModal(false); // Cierro el modal.
  const handleModalShow = () => setShowModal(true); // Abro el modal.

  const handleChange = (e) => {
    // Actualizo los valores del formulario en el estado local.
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evito el comportamiento por defecto del formulario.
    // Llamo a la acción para crear o actualizar un empleado según corresponda.
    const success = formData.id
      ? await actions.updateEntity("employees", formData.id, "employees", formData)
      : await actions.createEntity("employees", "employees", formData);
    if (success) {
      setShowModal(false); // Cierro el modal tras una operación exitosa.
      setFormData({ name: "", salary: "", position: "" }); // Limpio el formulario.
    }
  };

  const handleDelete = async (id) => {
    // Confirmo antes de eliminar un empleado.
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      await actions.deleteEntity("employees", id, "employees"); // Llamo a la acción para eliminar el empleado.
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary mb-4">Empleados</h1>

      {/* Tabla para listar los empleados */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="bg-dark text-white">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Salario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Recorro la lista de empleados y los renderizo en la tabla */}
          {store.employees.map((employee, index) => (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td>{employee.name}</td>
              <td>{employee.position || "-"}</td>
              <td>${employee.salary.toLocaleString()}</td>
              <td>
                {/* Botón para editar un empleado */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(employee); // Cargo los datos del empleado seleccionado en el formulario.
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                {/* Botón para eliminar un empleado */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Botón para añadir un nuevo empleado */}
      <Button variant="primary" onClick={handleModalShow} className="mt-4">
        Añadir Empleado
      </Button>

      {/* Modal para crear o editar empleados */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Empleado" : "Nuevo Empleado"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Campo para el nombre del empleado */}
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
            {/* Campo para el puesto del empleado */}
            <Form.Group className="mb-3">
              <Form.Label>Puesto</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Campo para el salario del empleado */}
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

export default Employees;
