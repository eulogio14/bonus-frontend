import React, { useState } from "react";
import api from '../api/index'; 
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface Flight {
  id: number;
  flightNumber: string;
  airlineName: string;      
  estDepartureTime: string; 
  estArrivalTime: string;   
  availableSeats: number;
}

export const FlightSearch = () => {
  const auth =  useContext(AuthContext);
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Agregamos el tipado <Flight[]> para que TypeScript no se queje en el map()
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingMessage, setBookingMessage] = useState<{type: 'success' | 'error', text: string, id?: number} | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBookingMessage(null);

    const params: any = {};

    if (flightNumber.trim()) params.flightNumber = flightNumber.trim();
    if (airline.trim()) params.airlineName = airline.trim();
    if (startDate) params.estDepartureTimeFrom = new Date(startDate).toISOString();
    if (endDate) params.estDepartureTimeTo = new Date(endDate).toISOString();

    try {
      const response = await api.get('/flights/search', { params });
      setFlights(response.data.items);
      setHasSearched(true);
    } catch (err: any) {
      setError('Ocurrió un error al buscar los vuelos. Inténtalo nuevamente.');
      setHasSearched(true);
    }
  };

  const handleBook = async (flightId: number) => {
    setBookingMessage(null);

    try{
        const response = await api.post('/flights/book',{flightId});

        setBookingMessage({
            type: 'success',
            text: `!Reserva confirmada con éxito! ID: ${response.data.id || response.data}`,
            id: response.data.id || response.data
        });
        
        const bookingId = response.data.id || response.data;
        const username = auth?.user?.username || 'guest';
        const storageKey = `/reservas_${username}`;

        const savedReservas = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if(!savedReservas.includes(bookingId)){
          savedReservas.push(bookingId);
          localStorage.setItem(storageKey, JSON.stringify(savedReservas));
        }

        setFlights(flights.map(f => f.id === flightId ? {...f, availableSeats: f.availableSeats - 1} : f));

    } catch(err:any){
      const backendMessage = err.response?.data?.detail || err.response?.data?.message || 'Error al intentar reservar este vuelo.';
      setBookingMessage({type: 'error', text: backendMessage});
    }
  };

  const handleViewDetails = async (bookingId: number) => {
    try{
      const response = await api.get(`/flights/book/${bookingId}`);
      setBookingDetails(response.data);
    }catch(err){
      setBookingMessage({type: 'error', text: 'No se pudieron cargar los detalles de la reserva.'});
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <h2 className="text-3xl font-bold text-blue-900 mb-8">Buscar Vuelos ✈️</h2>

      {/* Formulario de Búsqueda */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-md mb-6">
        {/* ... (el formulario de búsqueda se mantiene igual) ... */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° de Vuelo</label>
            <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. LA2024" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aerolínea</label>
            <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej. Latam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde (Fecha/Hora)</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta (Fecha/Hora)</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition">Buscar</button>
        </div>
      </form>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {bookingMessage && (
        <div className={`p-4 mb-6 rounded-lg flex justify-between items-center ${bookingMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          <span className="font-medium">{bookingMessage.text}</span>
          
          {bookingMessage.type === 'success' && bookingMessage.id && (
            <button 
              onClick={() => handleViewDetails(bookingMessage.id!)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold transition"
            >
              Ver Detalle 👀
            </button>
          )}
        </div>
      )}

      {hasSearched && flights.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vuelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aerolínea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Llegada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asientos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{flight.flightNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{flight.airlineName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(flight.estDepartureTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(flight.estArrivalTime).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${flight.availableSeats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {flight.availableSeats} disponibles
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Botón de Reservar */}
                    <button 
                      onClick={() => handleBook(flight.id)}
                      disabled={flight.availableSeats === 0}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 font-semibold py-1 px-3 rounded transition disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Reservar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasSearched && flights.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-xl text-center">
          <p className="text-lg font-medium">No se encontraron vuelos para esta búsqueda 🕵️‍♂️</p>
        </div>
      )}

      {/* Modal para ver Detalle de Reserva */}
      {bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full relative">
            <button 
              onClick={() => setBookingDetails(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-900 text-center">Tu Ticket 🎫</h3>
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded border border-gray-200">
              <p><strong>N° Reserva:</strong> {bookingDetails.id}</p>
              {/* Ajusta "flight.flightNumber" si tu backend lo devuelve distinto */}
              <p><strong>Vuelo:</strong> {bookingDetails.flight?.flightNumber || 'N/A'}</p>
              <p><strong>Asiento Confirmado:</strong> ✅</p>
            </div>
            <button 
              onClick={() => setBookingDetails(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};