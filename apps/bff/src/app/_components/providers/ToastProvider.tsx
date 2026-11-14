"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      rtl
      theme="colored"
      newestOnTop
      closeOnClick
      pauseOnHover
      className="text-sm"
    />
  );
}