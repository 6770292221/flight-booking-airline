let passengerCount = 0;

// ✅ เพิ่ม Passenger ใหม่
function addPassenger() {
    passengerCount++;

    const passengerList = document.getElementById('passengerList');

    const passengerDiv = document.createElement('div');
    passengerDiv.className = 'passenger-fields';
    passengerDiv.setAttribute('id', `passenger-${passengerCount}`);

    const label = document.createElement('label');
    label.className = 'passenger-label';
    label.textContent = `Passenger ${passengerCount}`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✖';
    removeBtn.onclick = () => removePassenger(passengerDiv.id);

    const firstInput = document.createElement('input');
    firstInput.type = 'text';
    firstInput.placeholder = 'First Name';
    firstInput.className = 'input';

    const familyInput = document.createElement('input');
    familyInput.type = 'text';
    familyInput.placeholder = 'Family Name';
    familyInput.className = 'input';

    const passportInput = document.createElement('input');
    passportInput.type = 'text';
    passportInput.placeholder = 'Passport';
    passportInput.className = 'input';

    passengerDiv.appendChild(label);
    passengerDiv.appendChild(removeBtn);
    passengerDiv.appendChild(firstInput);
    passengerDiv.appendChild(familyInput);
    passengerDiv.appendChild(passportInput);

    passengerList.appendChild(passengerDiv);

    updatePassengerLabels();
}

// ✅ ลบ Passenger
function removePassenger(passengerId) {
    const passengerList = document.getElementById('passengerList');
    const passengerDiv = document.getElementById(passengerId);

    if (passengerList.children.length > 1) {
        passengerDiv.remove();
        updatePassengerLabels();
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: 'At least one passenger is required.',
            confirmButtonColor: '#e91e63'
        });
    }
}

// ✅ อัปเดต Label Passenger ใหม่
function updatePassengerLabels() {
    const passengerList = document.querySelectorAll('#passengerList .passenger-fields');
    passengerList.forEach((div, index) => {
        const label = div.querySelector('.passenger-label');
        label.textContent = `Passenger ${index + 1}`;
    });
}

// ✅ เปิด Confirm Booking Modal
function openConfirmBookingModal() {
    Swal.fire({
        title: 'Confirm Booking',
        text: 'Are you sure you want to confirm this booking?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#7c1c4b',
        cancelButtonColor: '#aaa',
        customClass: {
            popup: 'twofa-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            confirmBooking();
        }
    });
}
function validatePassengers() {
    const passengers = document.querySelectorAll('#passengerList .passenger-fields');
    for (let i = 0; i < passengers.length; i++) {
        const inputs = passengers[i].querySelectorAll('input');
        const firstName = inputs[0].value.trim();
        const familyName = inputs[1].value.trim();
        const passport = inputs[2].value.trim();

        if (!firstName || !familyName || !passport) {
            return {
                valid: false,
                message: `Please fill all fields for Passenger ${i + 1}`
            };
        }
    }
    return { valid: true };
}
function confirmBooking() {

    const validation = validatePassengers();

    if (!validation.valid) {
        Swal.fire({
            icon: 'error',
            title: 'Reservations Failed',
            text: validation.message,
            confirmButtonColor: '#e91e63'
        });
        return;
    }

    const isBookingSuccessful = Math.random() > 0.5;

    if (isBookingSuccessful) {
        Swal.fire({
            icon: 'success',
            title: 'Booking Confirmed!',
            text: 'Your booking has been successfully confirmed.',
            confirmButtonColor: '#7c1c4b'
        }).then(() => {
            // ✅ เปลี่ยนหน้าไปยัง My Reservations หลังจากกด OK ใน Swal
            window.location.href = '../my-reservations/index.html';
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Booking Failed!',
            text: 'Oops! Something went wrong. Please try again later.',
            confirmButtonColor: '#e91e63'
        });
    }
}


// ✅ โหลด Passenger อย่างน้อย 1 คนเมื่อเปิดหน้า
window.onload = () => {
    addPassenger();
};
