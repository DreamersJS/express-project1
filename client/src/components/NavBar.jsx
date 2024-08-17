import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
// import "./NavBar.css";

export const NavBar = ({ selected }) => {
    const { user, setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState('');

    const logout = async () => {
        try {
            // Clear user info from the global state
            setUser(null);

            // Clear any tokens or user data from localStorage/sessionStorage
            localStorage.removeItem('token'); // Adjust if you use sessionStorage or different keys

            // Set feedback message
            setFeedback('Successfully logged out.');

            // Redirect to login page after logout
            setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds to show feedback
        } catch (error) {
            console.error("Error logging out:", error);
            setFeedback('Error logging out. Please try again.');
        }
    };

    return (
        <nav>
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
                    <div>
                        <p>Welcome, {user.username}!</p>
                        <li>
                            <button onClick={logout} aria-label="Logout">
                                Logout
                            </button>
                        </li>
                    </div>
                )}
            </ul>
            {feedback && (
                <div className="feedback-message">
                    {feedback}
                </div>
            )}
        </nav>
    );
};
