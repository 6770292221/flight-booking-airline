import Swal from 'sweetalert2';

let isRedirecting = false;

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

