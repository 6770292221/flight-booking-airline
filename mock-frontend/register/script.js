// Register form submit handler
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    // Validation - check empty fields
    if (!firstName || !lastName || !email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fill all fields'
        });
        return;
    }

    // Validate if email already exists
    if (email === 'aphirak_2008@hotmail.com') {
        Swal.fire({
            icon: 'error',
            title: 'Email Already Exists',
            text: 'The email already exists in the system.'
        });
        return;
    }

    // If passed validation, show 2FA
    showTwoFAPopup();
});
function showTwoFAPopup() {
    Swal.fire({
        title: 'Configure two-factor authentication',
        html: `
     <p>Scan the QR code or enter the authentication code from your app</p>

<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=2FA-QR" alt="QR Code" />
<div class="secret-container">
  <span class="secret-key">DX27KE4EFZVJPXFS</span>
  <button class="copy-btn" onclick="copySecret()">
    <i class="fas fa-copy"></i> <!-- FontAwesome Icon -->
  </button>
</div>
<div class="otp-wrapper">

  <input type="text" maxlength="1" class="otp-input" />
  <input type="text" maxlength="1" class="otp-input" />
  <input type="text" maxlength="1" class="otp-input" />
  <input type="text" maxlength="1" class="otp-input" />
  <input type="text" maxlength="1" class="otp-input" />
  <input type="text" maxlength="1" class="otp-input" />
</div>
      `,
        confirmButtonText: 'Verify',
        customClass: {
            popup: 'twofa-popup',
            confirmButton: 'verify-btn'
        },
        preConfirm: () => {
            const inputs = document.querySelectorAll('.otp-input');
            let otpCode = '';
            inputs.forEach(input => otpCode += input.value);

            if (otpCode.length < 6) {
                Swal.showValidationMessage('Please enter the complete OTP');
            } else {
                Swal.fire('Success!', '2FA Verification Complete', 'success')
                    .then(() => {
                        // Redirect to login page after successful registration and 2FA verification
                        window.location.href = '../login/index.html'; // Replace with the correct login page URL
                    });
            }
        }
    });
}

function copySecret() {
    const secretText = 'DX27KE4EFZVJPXFS';

    navigator.clipboard.writeText(secretText)
        .then(() => {
            Swal.showValidationMessage('Secret key copied to clipboard!');
        })
        .catch(() => {
            Swal.showValidationMessage('Failed to copy secret key.');
        });
}


// Auto-focus next OTP box
document.addEventListener('input', e => {
    const input = e.target;
    if (input.classList.contains('otp-input') && input.value.length === 1) {
        const nextInput = input.nextElementSibling;
        if (nextInput && nextInput.classList.contains('otp-input')) {
            nextInput.focus();
        }
    }
});