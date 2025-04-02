import cabinAPI from './axiosInstances/cabin';


export const getCabinClasses = () => {
    return cabinAPI.get("/cabin-classes");
};

export const deleteCabinClass = (id) => {
    return cabinAPI.delete(`/cabin-class/${id}`);
};

export const addCabinClass = (data) => {
    return cabinAPI.post("/cabin-class", data);
};

export const updateCabinClass = (id, data) => {
    return cabinAPI.patch(`/cabin-class/${id}`, data);
};