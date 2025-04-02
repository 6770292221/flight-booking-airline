import airlineAPI from './axiosInstances/airline';

export const addAirline = (data) => airlineAPI.post('/airline', data);

export const getAllAirlines = () => airlineAPI.get('/airlines');

export const getAirlineById = (id) => airlineAPI.get(`/airline/${id}`);

export const updateAirline = (id, data) => airlineAPI.patch(`/airline/${id}`, data);

export const deleteAirline = (id) => airlineAPI.delete(`/airline/${id}`);
