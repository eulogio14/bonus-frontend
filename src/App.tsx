import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { FlightSearch } from './pages/FlightSearch';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { FormatUsername } from './logic/FormatUserName';
import { MyBookings } from './pages/MyBookings';

const Navbar = () => {
  const auth = useContext(AuthContext);
  
  if (!auth?.token) return null; 
  const displayName = FormatUsername(auth.user?.username);
  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/">
        <h1 className="font-bold text-xl hover:text-blue-200 transition">Fly Away ✈️</h1>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link 
          to="/my-bookings" 
          className="text-sm font-medium hover:text-blue-200 transition underline underline-offset-4 decoration-2"
        >
          Mis Reservas    
        </Link>

        <span>Hola, {displayName}</span>
        
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
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <FlightSearch />
              </ProtectedRoute>
            } 
          />

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