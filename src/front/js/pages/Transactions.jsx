import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table, Badge, Spinner } from "react-bootstrap";

const Transactions = () => {
    const { store, actions } = useContext(Context); // Accedo al estado global y las acciones desde el contexto.

    const [showModal, setShowModal] = useState(false); // Manejo la visibilidad del modal.
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        transaction_type: "income",
        status: "pending",
        date: "",
    }); // Estado local para manejar los datos del formulario.

    useEffect(() => {
        actions.loadTransactions(); // Cargo las transacciones al montar el componente.
    }, []);

    const handleModalClose = () => setShowModal(false); // Cierro el modal.
    const handleModalShow = () => setShowModal(true); // Abro el modal.

    const handleChange = (e) => {
        const { name, value } = e.target; // Actualizo los campos del formulario en base a la entrada del usuario.
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evito que el formulario recargue la página.

        // Validaciones básicas para el formulario.
        if (formData.amount <= 0) {
            alert("El monto debe ser mayor a 0.");
            return;
        }

        if (new Date(formData.date) > new Date()) {
            alert("La fecha no puede ser futura.");
            return;
        }

        // Llamo a las acciones para crear o actualizar una transacción según corresponda.
        const isUpdate = !!formData.id;
        const success = isUpdate
            ? await actions.updateEntity("transactions", formData.id, "transactions", formData)
            : await actions.createEntity("transactions", "transactions", formData);

        if (success) {
            setShowModal(false); // Cierro el modal tras un guardado exitoso.
            setFormData({
                amount: "",
                description: "",
                transaction_type: "income",
                status: "pending",
                date: "",
            }); // Reinicio el formulario.
        } else {
            alert("Hubo un error al procesar la transacción."); // Muestro un mensaje en caso de error.
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
            await actions.deleteEntity("transactions", id, "transactions"); // Elimino la transacción seleccionada.
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-primary mb-4">Transacciones</h1>

            {/* Muestro un spinner mientras los datos están cargando */}
            {store.loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover responsive className="shadow-sm">
                    <thead className="bg-dark text-white">
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Itero sobre las transacciones y las muestro en la tabla */}
                        {Array.isArray(store.transactions) && store.transactions.length > 0 ? (
                            store.transactions.map((transaction, index) => (
                                <tr key={transaction.id}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                    <td
                                        className={
                                            transaction.transaction_type === "income"
                                                ? "text-success fw-bold"
                                                : "text-danger fw-bold"
                                        }
                                    >
                                        {transaction.transaction_type === "income" ? "+" : "-"}$
                                        {transaction.amount.toLocaleString()}
                                    </td>
                                    <td>{transaction.description || "-"}</td>
                                    <td>
                                        <Badge
                                            bg={
                                                transaction.transaction_type === "income"
                                                    ? "success"
                                                    : "danger"
                                            }
                                        >
                                            {transaction.transaction_type === "income"
                                                ? "Ingreso"
                                                : "Gasto"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={
                                                transaction.status === "completed"
                                                    ? "primary"
                                                    : "secondary"
                                            }
                                        >
                                            {transaction.status === "completed"
                                                ? "Completado"
                                                : "Pendiente"}
                                        </Badge>
                                    </td>
                                    <td>
                                        {/* Botón para editar una transacción */}
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => {
                                                setFormData({
                                                    ...transaction,
                                                    date: new Date(transaction.date)
                                                        .toISOString()
                                                        .split("T")[0],
                                                });
                                                handleModalShow();
                                            }}
                                            className="me-2"
                                        >
                                            <i className="bi bi-pencil"></i> Editar
                                        </Button>
                                        {/* Botón para eliminar una transacción */}
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            <i className="bi bi-trash"></i> Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No hay transacciones disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            <Button variant="primary" onClick={handleModalShow} className="mt-4">
                Añadir Transacción
            </Button>

            {/* Modal para crear o editar una transacción */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formData.id ? "Editar Transacción" : "Nueva Transacción"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* Campo para el monto */}
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
                        {/* Campo para la descripción */}
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        {/* Campo para seleccionar el tipo de transacción */}
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select
                                name="transaction_type"
                                value={formData.transaction_type}
                                onChange={handleChange}
                            >
                                <option value="income">Ingreso</option>
                                <option value="expense">Gasto</option>
                            </Form.Select>
                        </Form.Group>
                        {/* Campo para seleccionar el estado */}
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                            </Form.Select>
                        </Form.Group>
                        {/* Campo para seleccionar la fecha */}
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            {formData.id ? "Actualizar" : "Crear"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Transactions;
