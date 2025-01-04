import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

const Chart = () => {
    const { actions, store } = useContext(Context); // Uso el contexto global para acceder a las acciones y el estado.
    const [chartUrl, setChartUrl] = useState(null); // Guardo la URL del gráfico generado.
    const [tableData, setTableData] = useState([]); // Estado para manejar los datos agrupados de la tabla.
    const [startDate, setStartDate] = useState(""); // Fecha de inicio para filtrar.
    const [endDate, setEndDate] = useState(""); // Fecha de fin para filtrar.
    const [loading, setLoading] = useState(false); // Indico si los datos están cargando.
    const [error, setError] = useState(null); // Manejo errores en la carga.

    const fetchChartAndData = async () => {
        setLoading(true); // Inicio la carga.
        try {
            // Cargo el gráfico según las fechas.
            const url = await actions.loadChart(startDate, endDate);
            setChartUrl(url);

            // Cargo y proceso las transacciones para la tabla.
            const transactions = await actions.loadTransactions();
            const filteredData = filterAndGroupTransactions(transactions, startDate, endDate);
            setTableData(filteredData);

            setError(null); // Limpio errores si todo carga correctamente.
        } catch (err) {
            setError("No se pudieron cargar los datos"); // Actualizo el mensaje de error.
            setChartUrl(null); // Reseteo la URL del gráfico en caso de error.
            setTableData([]); // Limpio los datos de la tabla.
        } finally {
            setLoading(false); // Finalizo la carga.
        }
    };

    useEffect(() => {
        fetchChartAndData(); // Llamo a la función para cargar los datos al montar el componente.
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault(); // Prevengo el envío del formulario.
        fetchChartAndData(); // Aplico los filtros y vuelvo a cargar los datos.
    };

    const filterAndGroupTransactions = (transactions, startDate, endDate) => {
        // Filtro las transacciones por rango de fechas.
        const filtered = transactions.filter((t) => {
            const date = new Date(t.date);
            return (
                (!startDate || date >= new Date(startDate)) &&
                (!endDate || date <= new Date(endDate))
            );
        });

        // Agrupo las transacciones por mes y tipo.
        const grouped = filtered.reduce((acc, transaction) => {
            const month = new Date(transaction.date).toISOString().slice(0, 7);
            if (!acc[month]) {
                acc[month] = { income: 0, expense: 0 };
            }
            if (transaction.transaction_type === "income") {
                acc[month].income += transaction.amount;
            } else if (transaction.transaction_type === "expense") {
                acc[month].expense += transaction.amount;
            }
            return acc;
        }, {});

        // Transformo el objeto agrupado en un array ordenado para la tabla.
        return Object.keys(grouped)
            .map((month) => ({
                month,
                income: grouped[month].income,
                expense: grouped[month].expense,
                balance: grouped[month].income - grouped[month].expense,
            }))
            .sort((a, b) => new Date(b.month) - new Date(a.month)); // Ordeno por fecha descendente.
    };

    if (loading) {
        // Muestro un spinner mientras los datos están cargando.
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-3">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="text-center text-primary">Gráfico y Datos de Transacciones</h3>
            <Form onSubmit={handleFilterSubmit} className="mb-4">
                <div className="row g-2">
                    <div className="col-md-5">
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)} // Actualizo la fecha de inicio.
                            placeholder="Fecha de inicio"
                        />
                    </div>
                    <div className="col-md-5">
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)} // Actualizo la fecha de fin.
                            placeholder="Fecha de fin"
                        />
                    </div>
                    <div className="col-md-2">
                        <Button type="submit" variant="primary" className="w-100">
                            Filtrar
                        </Button>
                    </div>
                </div>
            </Form>
            {error ? (
                <p className="text-danger text-center">{error}</p> // Muestro el mensaje de error.
            ) : (
                <>
                    {chartUrl && (
                        <div className="text-center mb-4">
                            <img
                                src={chartUrl}
                                alt="Gráfico de Transacciones"
                                className="img-fluid rounded shadow"
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        </div>
                    )}
                    {tableData.length > 0 ? (
                        <Table striped bordered hover responsive className="mt-4">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Total de Ingresos</th>
                                    <th>Total de Gastos</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.month}</td>
                                        <td>{row.income.toFixed(2)}</td>
                                        <td>{row.expense.toFixed(2)}</td>
                                        <td>{row.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-center mt-4">No hay datos disponibles para las fechas seleccionadas.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Chart;
