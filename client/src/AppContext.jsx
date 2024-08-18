import React, { createContext, useState, useEffect } from 'react';
import { fetchUserDetails, verifyToken } from '../service/service.js';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Restore user on app load
    useEffect(() => {
        const restoreUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const isValid = await verifyToken(storedToken);
                if (isValid) {
                    try {
                        const userData = await fetchUserDetails(storedToken);
                        setUser(userData);
                        setToken(storedToken);
                    } catch (error) {
                        console.error('Error restoring user:', error);
                        logout(); 
                    }
                } else {
                    logout();
                }
            }
        };

        restoreUser();
    }, []);

    // Function to login
    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Function to logout
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AppContext.Provider value={{ user, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};
