import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = localStorage.getItem('hmg_user') || sessionStorage.getItem('hmg_user');
        if (getUser) {
            setUser(JSON.parse(getUser))
        }

    }, []);

    const saveUser = (userData, rememberMe = false) => {
        setUser(userData);
        if (rememberMe) {
            localStorage.setItem('hmg_user', JSON.stringify(userData));
            sessionStorage.removeItem('hmg_user');
        } else {
            sessionStorage.setItem('hmg_user', JSON.stringify(userData));
            localStorage.removeItem('hmg_user');
        }
    }

    const updateUser = (updatedData) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...updatedData }

            if (localStorage.getItem('hmg_user')) {
                localStorage.setItem('hmg_user', JSON.stringify(updatedUser))
            }

            if (sessionStorage.getItem('hmg_user')) {
                sessionStorage.setItem('hmg_user', JSON.stringify(updatedUser));
            }
            return updatedUser
        })

    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('hmg_user');
        sessionStorage.removeItem('hmg_user');
    }

    return (
        <UserContext.Provider value={{ user, saveUser, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};