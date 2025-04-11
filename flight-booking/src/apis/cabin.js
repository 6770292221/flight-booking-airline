import cabin from './axiosInstances/cabin';

export const getCabinClasses = (data) => {
    return cabin.get('/cabin-classes', data);
};
