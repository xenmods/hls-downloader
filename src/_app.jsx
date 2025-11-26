import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from ".";
import "./styles/index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainPage />
    <Toaster position="bottom-center" />
  </React.StrictMode>
);
