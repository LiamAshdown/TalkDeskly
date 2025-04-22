import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import "@/styles/globals.css";
import "@/styles/theme-transition.css";

// Add no-transition class to prevent transitions on initial load
document.documentElement.classList.add("no-transition");

// Remove the class after a short delay
window.addEventListener("load", () => {
  setTimeout(() => {
    document.documentElement.classList.remove("no-transition");
  }, 100);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
