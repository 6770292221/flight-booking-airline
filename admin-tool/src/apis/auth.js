import userAPI from './axiosInstances/user';

export const login = (email, password) => {
    return userAPI.post('/auth/login', { email, password });
};

export const verifyOTP = (userId, otp) => {
    return userAPI.post('/auth/email-otp/verify', { userId, otp });
};

export const logout = () => {
    const token = localStorage.getItem("token");
    return userAPI.post(
        "/auth/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};