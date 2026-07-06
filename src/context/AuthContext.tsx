import { createContext, useState, useEffect, type ReactNode} from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/index';


interface User {
    firstName: string;
    lastName: string;
    username: string;
}

interface AuthContextType{
    token: string | null;
    user: User | null;
    login: (newToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children:ReactNode}) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user,setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    useEffect(() => {
        if(token){
            console.log("Intentando obtener usuario con token...");

            api.get('users/current')
                .then(response => {
                    console.log("¡Usuario obtenido del backend!", response.data);
              // Dependiendo de tu backend, podría ser response.data o response.data.user
              setUser(response.data);
                })
                .catch(err => {
                    console.error("Falló la obtención del usuario:", err.response?.status, err.response?.data);
              // Comentamos el logout temporalmente para que no te patee mientras depuramos
              // logout();
                })
                
        }
    }, [token]);

    
    
    return (
        <AuthContext.Provider value={{token, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}