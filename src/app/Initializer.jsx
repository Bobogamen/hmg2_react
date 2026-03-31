import { useEffect } from "react";
import api from "../api/axios";
import { setupInterceptors } from "../api/interceptors";
import { useUser } from "../user/UserContext";

let isInitialized = false; // prevents double setup (StrictMode safe)

const Initializer = () => {
  const { logout } = useUser();

  useEffect(() => {
    if (isInitialized) return;

    setupInterceptors(api, logout);
    isInitialized = true;
  }, []); // ✅ run only once

  return null;
};

export default Initializer;