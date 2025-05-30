import ReactDOM from "react-dom/client";
import App from "./App";
import './i18n'; // Initialize i18n
import { AppStateProvider } from "./store";

const rootNode = document.getElementById("root");

ReactDOM.createRoot(rootNode).render(
    <AppStateProvider>
      <App />
    </AppStateProvider>
);
