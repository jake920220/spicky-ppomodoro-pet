import "../styles/app.css";
import { bootstrap } from "./bootstrap";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

bootstrap(root);
