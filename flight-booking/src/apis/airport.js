import airport from './axiosInstances/airport';

export const getAirports = (data) => {
    return airport.get('/airports', data);
};
