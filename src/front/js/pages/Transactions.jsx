import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table, Badge, Spinner } from "react-bootstrap";
import "../../styles/estilosVistas.css";
import Converter from "../components/Converter.jsx";

const Transactions = () => {
    const { store, actions } = useContext(Context);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        transaction_type: "income",
        status: "pending",
        date: "",
    });

    useEffect(() => {
        actions.loadTransactions(); // Cargo las transacciones al montar el componente
    }, []);

    const handleModalClose = () => setShowModal(false); // Cierra el modal
    const handleModalShow = () => setShowModal(true); // Muestra el modal

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value }); // Actualizo los valores del formulario
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de monto mayor a 0
        if (formData.amount <= 0) {
            alert("El monto debe ser mayor a 0.");
            return;
        }

        // Validación de fecha para que no sea futura
        if (new Date(formData.date) > new Date()) {
            alert("La fecha no puede ser futura.");
            return;
        }

        // Determino si es una creación o actualización de transacción
        const isUpdate = !!formData.id;
        const success = isUpdate
            ? await actions.updateEntity("transactions", formData.id, "transactions", formData)
            : await actions.createEntity("transactions", "transactions", formData);

        if (success) {
            setShowModal(false); // Cierra el modal al completar
            setFormData({
                amount: "",
                description: "",
                transaction_type: "income",
                status: "pending",
                date: "",
            }); // Reseteo el formulario
        } else {
            alert("Hubo un error al procesar la transacción.");
        }
    };

    const handleDelete = async (id) => {
        // Confirmo antes de eliminar la transacción
        if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
            await actions.deleteEntity("transactions", id, "transactions");
        }
    };

    return (
        <div className="container transactions-container mt-5">
            <h1>Transacciones</h1>

            {store.loading ? (
                <div className="text-center">
                    <Spinner animation="border" /> {/* Indicador de carga */}
                </div>
            ) : (
                <Table className="table shadow-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Monto (USD)</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
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
                                        {/* Conversión a otra moneda con el componente Converter */}
                                        <Converter
                                            value={transaction.amount}
                                            baseCurrency="USD"
                                            targetCurrency="EUR"
                                        />
                                    </td>
                                    <td>{transaction.description || "-"}</td>
                                    <td>
                                        <Badge
                                            className={
                                                transaction.transaction_type === "income"
                                                    ? "badge-success"
                                                    : "badge-danger"
                                            }
                                        >
                                            {transaction.transaction_type === "income"
                                                ? "Ingreso"
                                                : "Gasto"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge
                                            className={
                                                transaction.status === "completed"
                                                    ? "badge-primary"
                                                    : "badge-secondary"
                                            }
                                        >
                                            {transaction.status === "completed"
                                                ? "Completado"
                                                : "Pendiente"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            className="btn btn-outline-primary me-2"
                                            size="sm"
                                            onClick={() => {
                                                setFormData({
                                                    ...transaction,
                                                    date: new Date(transaction.date)
                                                        .toISOString()
                                                        .split("T")[0], // Normalizo la fecha
                                                });
                                                handleModalShow();
                                            }}
                                        >
                                            <i className="fas fa-edit"></i> Editar
                                        </Button>
                                        <Button
                                            className="btn btn-outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            <i className="fas fa-trash"></i> Eliminar
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

            <Button className="btn btn-primary mt-4" onClick={handleModalShow}>
                <i className="fas fa-plus-circle"></i> Añadir Transacción
            </Button>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formData.id ? "Editar Transacción" : "Nueva Transacción"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
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
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                            </Form.Select>
                        </Form.Group>
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
                        <Button className="btn btn-primary w-100" type="submit">
                            {formData.id ? "Actualizar" : "Crear"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Transactions;
