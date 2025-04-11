import auth from './axiosInstances/auth';

export const registerUser = (data) => {
    return auth.post('/register', data);
};

export const loginUser = (data) => {
    return auth.post('/auth/login', data);
};

export const logoutUser = () => {
    const token = localStorage.getItem("token"); // ดึง token จาก localStorage

    if (!token) {
        return Promise.reject("No token found"); // ถ้าไม่มี token จะไม่ทำการ logout
    }

    // ส่ง token ใน Authorization header
    return auth.post(
        '/auth/logout',
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`, // ส่ง token ใน header
            },
        }
    ).then(() => {
        // เมื่อ logout สำเร็จ ลบ token และข้อมูลผู้ใช้
        localStorage.clear(); // ลบข้อมูลทั้งหมดจาก localStorage
        return Promise.resolve("Logout successful");
    }).catch((error) => {
        // หากมีข้อผิดพลาดจาก API logout
        console.error("Logout failed", error);
        return Promise.reject("Logout failed. Please try again.");
    });
};


export const verifyOtp = (userId, otp) => {
    return auth.post('/auth/email-otp/verify', { userId, otp });
};