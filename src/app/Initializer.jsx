import { useEffect } from "react";
import api from "../api/axios";
import { setupInterceptors } from "../api/interceptors";
import { useUser } from "../user/UserContext";

const Initializer = () => {
  const { logout } = useUser();

  useEffect(() => {
    setupInterceptors(api, logout);
  }, [logout]);

  return null;
};

export default Initializer;