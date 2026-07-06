import  {useState, useEffect, useContext} from 'react';
import api from '../api/index';
import { AuthContext } from '../context/AuthContext';

export const MyBookings = () => {
    const auth = useContext(AuthContext);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("👤 Usuario detectado en MyBookings:", auth?.user?.username);

        // 2. Si el usuario aún no carga, detenemos la función y esperamos
        if (!auth?.user?.username) {
            console.log("⏳ Esperando a que cargue el perfil del usuario...");
            return; 
        }

        const fetchBookings = async () => {
            const storageKey = `/reservas_${auth.user?.username}`;
            console.log("🔑 Buscando en LocalStorage la llave:", storageKey);
            
            const savedData = localStorage.getItem(storageKey);
            console.log("📦 Datos encontrados en LocalStorage:", savedData);
            
            const saveIds: number[] = JSON.parse(savedData || '[]');

            if (saveIds.length === 0) {
                console.log("⚠️ El arreglo está vacío. No hay peticiones que hacer.");
                setLoading(false);
                return;
            }

            try {
                console.log("🚀 Iniciando peticiones al backend para los IDs:", saveIds);
                // Aquí es donde se hacen las peticiones
                const promises = saveIds.map(id => api.get(`/flights/book/${id}`));
                const responses = await Promise.all(promises);

                console.log("✅ Respuestas recibidas del backend:", responses.map(r => r.data));
                setBookings(responses.map(res => res.data));
            } catch (error) {
                console.error("❌ Error del backend cargando reservas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [auth?.user?.username]);
    if(loading){
        return(
            <div className='flex justify-center items-center h-64'>
                <div className='text-xl text-blue-900 font-semibold animate-pulse'>
                    Cargando tus reservas... ⏳
                </div>
            </div>
        );
    }

    return(
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Mis Reservas 🎟️</h2>

            {bookings.length === 0 ? (
                // Estilo si no hay reservas
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-200">
                    <p className="text-lg font-medium text-gray-600">Aún no tienes vuelos reservados.</p>
                    <p className="text-sm text-gray-500 mt-2">¡Ve al buscador y planifica tu próximo viaje!</p>
                </div>
            ) : (
                // Estilo de la tabla de reservas
                <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Reserva</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vuelo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aerolínea</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Salida</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                                        #{booking.id}
                                    </td>
                                    {/* Validaciones por si la estructura del JSON anida los datos */}
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {booking.flight?.flightNumber || booking.flightNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {booking.flight?.airlineName || booking.airlineName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(booking.flight?.estDepartureTime || booking.estDepartureTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Confirmado ✅
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}