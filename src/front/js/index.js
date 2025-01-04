import React from "react";
import ReactDOM from "react-dom/client"; 
import App from "./App.jsx";
import injectContext from "./store/appContext.js"; 
import "bootstrap/dist/css/bootstrap.min.css"; // Incluyo los estilos de Bootstrap
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Incluyo el JavaScript de Bootstrap

// Envuelvo el componente principal App con el contexto global
const AppWithContext = injectContext(App);

// Selecciono el contenedor raíz donde se montará la aplicación
const rootElement = document.getElementById("app");
if (!rootElement) {
    // Manejo el caso en que el contenedor raíz no exista
    console.error("No se encontró el elemento con id 'app'. Verifica el archivo HTML.");
    throw new Error("No se encontró el elemento con id 'app'");
}

// Creo la raíz de React y renderizo la aplicación envuelta en el contexto
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <AppWithContext />
    </React.StrictMode>
);

// Confirmo en la consola que la aplicación se ha renderizado correctamente
console.log("Aplicación renderizada correctamente.");
