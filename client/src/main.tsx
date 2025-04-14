import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title for the application
document.title = "SME Transaction Automation Platform";

createRoot(document.getElementById("root")!).render(<App />);
