import auth from './axiosInstances/auth';

export const registerUser = (data) => {
    return auth.post('/register', data);
};

export const loginUser = (data) => {
    return auth.post('/auth/login', data);
};

export const logoutUser = () => {
    return auth
        .post('/auth/logout')
        .then(() => {
            localStorage.clear();
            return Promise.resolve("Logout successful");
        })
        .catch((error) => {
            console.error("Logout failed", error);
            return Promise.reject("Logout failed. Please try again.");
        });
};

export const verifyOtp = (userId, otp) => {
    return auth.post('/auth/email-otp/verify', { userId, otp });
};
