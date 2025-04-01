import aircraftAPI from './axiosInstances/aircraft';

export const getAllAircrafts = () => aircraftAPI.get('/aircrafts');
export const getAircraftById = (id) => aircraftAPI.get(`/aircrafts/${id}`);
export const addAircraft = (data) => aircraftAPI.post('/aircraft', data);
export const updateAircraft = (id, data) => aircraftAPI.patch(`/aircraft/${id}`, data);
export const deleteAircraft = (id) => aircraftAPI.delete(`/aircraft/${id}`);
