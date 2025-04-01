import aircraftAPI from './axiosInstances/airline';

export const getAllAircrafts = () => aircraftAPI.get('/aircrafts');
export const getAircraftById = (id) => aircraftAPI.get(`/aircrafts/${id}`);
export const addAircraft = (data) => aircraftAPI.post('/aircrafts', data);
export const updateAircraft = (id, data) => aircraftAPI.put(`/aircrafts/${id}`, data);
export const deleteAircraft = (id) => aircraftAPI.delete(`/aircrafts/${id}`);
