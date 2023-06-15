import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reducer, { initialState } from "./reducer";
import { StateProvider } from "./StateContext";

const rootNode = document.getElementById("root");

ReactDOM.createRoot(rootNode).render(
  <React.StrictMode>
    <StateProvider initialState={initialState} reducer={reducer}>
      <App />
    </StateProvider>
  </React.StrictMode>
);
