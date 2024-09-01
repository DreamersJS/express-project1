import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import './NavBar.css';

export const NavBar = ({ selected, showFeedback }) => {
    const { user, logout } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        showFeedback('Logout successful!', 'success');
        navigate('/login');
    };

    console.log({user});

    return (
        <header className="sticky-header">
            <nav className="nav-main">
                <ul>
                    <li>
                        <NavLink to="/chat" className={selected === "chat" ? "active" : ""} aria-label="Go to chat page">
                            Chat
                        </NavLink>
                    </li>

                    {!user ? (
                        <>
                            <li>
                                <NavLink to="/login" className={selected === "login" ? "active" : ""} aria-label="Go to login page">
                                    Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/register" className={selected === "register" ? "active" : ""} aria-label="Go to registration page">
                                    Register
                                </NavLink>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <span>
                                    Welcome, {user?.username || 'User'}!
                                </span>
                            </li>
                            <li>
                                <NavLink to={`/update/${user.id}`} className={selected === "update" ? "active" : ""}  aria-label="Go to update user info page">
                                    Update user info
                                </NavLink>
                            </li>
                            <li>
                                <button onClick={handleLogout} aria-label="Logout">
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};
