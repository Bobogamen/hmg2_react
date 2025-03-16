import React, { createContext, useContext, useState, useRef, useCallback } from "react";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const timeoutRef = useRef(null);

  const setIsLoading = useCallback((loading) => {
    if (loading) {
      setIsLoadingState(true);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsLoadingState(false), 200);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};