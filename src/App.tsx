import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { FlightSearch } from './pages/FlightSearch';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { FormatUsername } from './logic/FormatUserName';
import { MyBookings } from './pages/MyBookings';
// 1. Creamos la barra de navegación (Navbar) para mostrar el nombre y cerrar sesión
const Navbar = () => {
  const auth = useContext(AuthContext);
  
  // Si no hay token, no mostramos la barra superior
  if (!auth?.token) return null; 
  const displayName = FormatUsername(auth.user?.username);
  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
      {/* Envolvemos el título en un Link para poder regresar al buscador fácilmente */}
      <Link to="/">
        <h1 className="font-bold text-xl hover:text-blue-200 transition">Fly Away ✈️</h1>
      </Link>
      
      <div className="flex items-center gap-6">
        {/* <-- 2. Botón/Enlace para ir a Mis Reservas --> */}
        <Link 
          to="/my-bookings" 
          className="text-sm font-medium hover:text-blue-200 transition underline underline-offset-4 decoration-2"
        >
          Mis Reservas    
        </Link>

        {/* Nice to have: Mostrar nombre del usuario */}
        <span>Hola, {displayName}</span>
        
        {/* Must have: Botón de logout */}
        <button 
          onClick={auth.logout} 
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

// 2. Componente para proteger rutas (si no hay token, te patea al login)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined') {
    return <Navigate to="/login" replace />;
  }
  return children;
};


    function App() {
      return (
    <BrowserRouter>
      {/* 3. Envolvemos todo con AuthProvider para tener estado global */}
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 4. La ruta "/" ahora muestra la Búsqueda de Vuelos, pero solo si estás logueado */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <FlightSearch />
              </ProtectedRoute>
            } 
          />

          {/* <-- 5. NUEVA RUTA: Mis Reservas protegida --> */}
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;