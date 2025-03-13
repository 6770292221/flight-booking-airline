// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const accountNumber = document.getElementById("accountNumber").value;
    const password = document.getElementById("password").value;

    // Mock login validation
    if (accountNumber !== "1234" || password !== "1234") {
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Two-factor authentication is not set up for this account.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#c2185b',
            position: 'center',
            backdrop: 'rgba(0, 0, 0, 0.4)',
            scrollbarPadding: false
        });
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Please verify with 2FA.',
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#c2185b',
            position: 'center',
            backdrop: 'rgba(0, 0, 0, 0.4)',
            scrollbarPadding: false
        }).then((result) => {
            if (result.isConfirmed) {
                showOTPForm();
            }
        });
    }
});

// Show OTP input popup
function showOTPForm() {
    Swal.fire({
        title: 'Enter Authentication Code (OTP)',
        html:
            '<input id="otp1" type="text" maxlength="1" style="width: 30px; text-align: center;" />' +
            '<input id="otp2" type="text" maxlength="1" style="width: 30px; text-align: center;" />' +
            '<input id="otp3" type="text" maxlength="1" style="width: 30px; text-align: center;" />' +
            '<input id="otp4" type="text" maxlength="1" style="width: 30px; text-align: center;" />' +
            '<input id="otp5" type="text" maxlength="1" style="width: 30px; text-align: center;" />' +
            '<input id="otp6" type="text" maxlength="1" style="width: 30px; text-align: center;" />',
        showCancelButton: true,
        confirmButtonText: 'Verify',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#aaa',
        position: 'center',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        preConfirm: () => {
            const otp1 = document.getElementById('otp1').value;
            const otp2 = document.getElementById('otp2').value;
            const otp3 = document.getElementById('otp3').value;
            const otp4 = document.getElementById('otp4').value;
            const otp5 = document.getElementById('otp5').value;
            const otp6 = document.getElementById('otp6').value;

            const enteredOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

            if (enteredOTP === "123456") {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Verified!',
                    text: 'You can now proceed.',
                    confirmButtonColor: '#e91e63',
                    position: 'center',
                    timer: 3500,
                    willClose: () => {
                        window.location.href = '../reservations/index.html';
                    }
                });
            } else {
                Swal.showValidationMessage('Incorrect OTP. Please try again.');
            }
        }
    });

    focusOTPInputs();
}

// Auto focus to next OTP input
function focusOTPInputs() {
    const inputs = document.querySelectorAll('input[id^="otp"]');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function () {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });
}
