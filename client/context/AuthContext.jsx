import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // ✅ Check authentication and setup user
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data?.success) {
                setAuthUser(data.user);
                connectSocket(data.user._id);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ✅ Login
    const login = async (cstate, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${cstate}`, credentials);
            if (data?.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData._id);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
                return true;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ✅ Logout
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) socket.disconnect();
    };

    // ✅ Update Profile
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.updatedUser);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ✅ Connect Socket
    const connectSocket = (userId) => {
        if (!userId || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: { userId },
        });

        setSocket(newSocket);

        newSocket.on("getOnline-users", (users) => {
            setOnlineUsers(users);
        });
    };

    // ✅ Initialize on mount
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
