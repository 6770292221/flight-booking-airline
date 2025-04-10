import flight from './axiosInstances/flight';

export const searchFlights = (data) => {
    return flight.post('/flights', data);
};
