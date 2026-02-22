import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedUser =
            localStorage.getItem('hmg_user') ||
            sessionStorage.getItem('hmg_user');

        const storedToken =
            localStorage.getItem('hmg_token') ||
            sessionStorage.getItem('hmg_token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    const saveUser = (userData, jwtToken, rememberMe = false) => {
        setUser(userData);
        setToken(jwtToken);

        if (rememberMe) {
            localStorage.setItem('hmg_user', JSON.stringify(userData));
            localStorage.setItem('hmg_token', jwtToken);
            sessionStorage.clear();
        } else {
            sessionStorage.setItem('hmg_user', JSON.stringify(userData));
            sessionStorage.setItem('hmg_token', jwtToken);
            localStorage.clear();
        }
    };

    const updateUser = (updatedData) => {
        setUser((prev) => {
            const updatedUser = { ...prev, ...updatedData };

            if (localStorage.getItem('hmg_user')) {
                localStorage.setItem('hmg_user', JSON.stringify(updatedUser));
            }

            if (sessionStorage.getItem('hmg_user')) {
                sessionStorage.setItem('hmg_user', JSON.stringify(updatedUser));
            }

            return updatedUser;
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('hmg_user');
        localStorage.removeItem('hmg_token');
        sessionStorage.removeItem('hmg_user');
        sessionStorage.removeItem('hmg_token');
    };

    return (
        <UserContext.Provider
            value={{ user, token, saveUser, updateUser, logout }}
        >
            {children}
        </UserContext.Provider>
    );
};