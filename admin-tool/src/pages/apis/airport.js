import airportAPI from './axiosInstances/airport';

export const getAllAirports = () => airportAPI.get('/locations');

export const getAirportById = (id) => airportAPI.get(`/airports/${id}`);

export const addAirport = (data) => airportAPI.post('/airports', data);

export const updateAirport = (id, data) => airportAPI.put(`/airports/${id}`, data);

export const deleteAirport = (id) => airportAPI.delete(`/airports/${id}`);
