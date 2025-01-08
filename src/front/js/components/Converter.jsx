import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/converter.css";

const Converter = ({ value, baseCurrency = "USD", targetCurrency = "EUR", onConvert }) => {
  const { actions } = useContext(Context);
  const [convertedAmount, setConvertedAmount] = useState(null);

  const handleConvert = async () => {
    // Si ya hay un valor convertido, lo restablezco al estado inicial
    if (convertedAmount !== null) {
      setConvertedAmount(null);
      return;
    }

    // Verifico si hay un valor válido para convertir
    if (!value) {
      console.error("No hay un valor para convertir");
      return;
    }

    // Llamo a la acción para convertir la moneda y actualizo el estado con el resultado
    const result = await actions.convertCurrency(baseCurrency, targetCurrency, value);
    if (result) {
      setConvertedAmount(result.converted_amount);
      if (onConvert) onConvert(result.converted_amount); // Ejecuto el callback opcional si se proporciona
    } else {
      setConvertedAmount(null);
    }
  };

  return (
    <div className="converter-container">
      <button className="convert-btn" onClick={handleConvert}>
        <i className="fas fa-euro-sign"></i>
      </button>
      {convertedAmount !== null && (
        <span className="converted-amount">
          {convertedAmount} {targetCurrency}
        </span>
      )}
    </div>
  );
};

export default Converter;
