import Swal from 'sweetalert2';

let isRedirecting = false;

export const handle400Error = (error) => {
    const code = error?.response?.data?.code || "UNKNOWN";
    const message = error?.response?.data?.message || "Something went wrong.";

    Swal.fire({
        icon: 'error',
        title: `Error: ${code}`,
        text: message,
        confirmButtonText: 'OK',
    });
};

export const handle401Redirect = () => {
    if (!isRedirecting) {
        isRedirecting = true;

        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login';
        });
    }

};

export const handle404Error = () => {
    Swal.fire({
        icon: 'error',
        title: 'Not Found',
        text: 'The requested resource was not found.',
        confirmButtonText: 'OK'
    });
};

export const handle201CreateBooking = () => {
    Swal.fire({
        icon: 'success',
        title: 'Booking Created',
        html: 'Your booking has been created successfully.<br><b>Please complete payment within 10 minutes</b>, otherwise your booking will be automatically cancelled.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then(() => {
        window.location.href = '/booking';
    });
};


