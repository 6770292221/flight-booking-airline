// === GLOBAL STATE ===
let bookingToDelete = null;

// === EDIT MODAL FUNCTIONS ===

// เปิด Edit Modal
function editBooking() {
    const modal = document.getElementById("editBookingModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

// ปิด Edit Modal
function closeModal() {
    console.log("Closing modal...");
    const modal = document.getElementById("editBookingModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// === PASSENGER FUNCTIONS ===

// เพิ่ม Passenger
function addPassenger() {
    const passengerContainer = document.getElementById('passengerFields');
    const currentPassengerCount = passengerContainer.querySelectorAll('.passenger').length + 1;

    const newPassenger = document.createElement('div');
    newPassenger.classList.add('passenger');
    newPassenger.setAttribute('id', 'passenger' + currentPassengerCount);

    newPassenger.innerHTML = `
        <label for="firstName${currentPassengerCount}">Passenger ${currentPassengerCount}:</label>
        <input type="text" name="firstName" id="firstName${currentPassengerCount}" placeholder="First Name">
        <input type="text" name="lastName" id="lastName${currentPassengerCount}" placeholder="Family Name">
        <input type="text" name="passport" id="passport${currentPassengerCount}" placeholder="Passport">
        <button type="button" onclick="removePassenger(this)" class="remove-passenger-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    passengerContainer.appendChild(newPassenger);
    updatePassengerNumbers();
}

function removePassenger(button) {
    const container = document.getElementById('passengerFields');
    const passengerBoxes = container.querySelectorAll('.passenger');

    // ถ้าเหลือคนเดียว ห้ามลบ
    if (passengerBoxes.length <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot Remove Passenger',
            text: 'There must be at least one passenger in the reservation.',
            confirmButtonColor: '#e91e63'
        });
        return;
    }

    const box = button.closest('.passenger');
    if (box) {
        box.remove();
        updatePassengerNumbers(); // อัปเดต label ใหม่หลังลบ
    }
}


function updatePassengerLabels() {
    const boxes = document.querySelectorAll('#editPassengerFields .passenger-box');

    boxes.forEach((box, index) => {
        // อัปเดตชื่อ Passenger
        box.querySelector('.passenger-header').childNodes[0].nodeValue = `Passenger ${index + 1}`;

        const removeBtn = box.querySelector('.remove-passenger-btn');

        // ถ้ามีแค่ 1 คน ซ่อนปุ่มลบ
        if (boxes.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'inline-block';
        }
    });
}


// อัปเดตหมายเลขผู้โดยสาร
function updatePassengerNumbers() {
    const allPassengers = document.querySelectorAll('.passenger');
    allPassengers.forEach((passenger, index) => {
        const passengerNumber = index + 1;
        passenger.querySelector('label').textContent = `Passenger ${passengerNumber}:`;
    });
}

// === VALIDATION FUNCTION ===

// ตรวจสอบข้อมูลผู้โดยสารก่อนบันทึก
function validatePassengers() {
    const allPassengers = document.querySelectorAll('#passengerFields .passenger');

    if (allPassengers.length === 0) {
        return {
            valid: false,
            message: 'Please add at least one passenger!'
        };
    }

    let isValid = true;
    let message = '';

    allPassengers.forEach((passenger, index) => {
        const firstName = passenger.querySelector('input[name="firstName"]').value.trim();
        const lastName = passenger.querySelector('input[name="lastName"]').value.trim();
        const passport = passenger.querySelector('input[name="passport"]').value.trim();

        if (!firstName || !lastName || !passport) {
            isValid = false;
            message = `Please complete all fields for Passenger ${index + 1}`;
        }
    });

    return {
        valid: isValid,
        message: message
    };
}

// === CONFIRM EDIT RESERVATION ===

function confirmEditBooking() {
    const validation = validatePassengers();

    if (!validation.valid) {
        Swal.fire({
            icon: 'error',
            title: 'Update Reservation Failed',
            text: validation.message,
            confirmButtonColor: '#e91e63'
        });
        return;
    }

    // จำลองสำเร็จเสมอ เพื่อทดสอบ
    const isEditSuccessful = true;

    if (isEditSuccessful) {
        console.log("EDIT SUCCESSFUL: Showing Success Popup...");

        Swal.fire({
            icon: 'success',
            title: 'Reservation Updated!',
            text: 'Your reservation has been successfully updated.',
            confirmButtonColor: '#7c1c4b',
            customClass: {
                popup: 'swal-popup-z'
            }
        }).then(() => {
            console.log("User closed Success Popup. Now closing modal...");
            closeModal();
        });

    } else {
        console.log("EDIT FAILED: Showing Error Popup...");
        Swal.fire({
            icon: 'error',
            title: 'Update Failed!',
            text: 'Oops! Something went wrong while updating. Please try again later.',
            confirmButtonColor: '#e91e63'
        });
    }
}

// === DELETE RESERVATION ===

function deleteBooking(event) {
    bookingToDelete = event.target.closest('tr');

    Swal.fire({
        title: 'Delete Reservation',
        text: 'Are you sure you want to delete this reservation?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e91e63',
        cancelButtonColor: '#999',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Reservation deleted!");
            bookingToDelete.remove();
            bookingToDelete = null;

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Reservation has been deleted.',
                confirmButtonColor: '#e91e63'
            });
        }
    });
}

// === TOGGLE DETAILS IN TABLE ===

function toggleDetails(button) {
    const details = button.nextElementSibling;
    const icon = button.querySelector("i");

    const isVisible = details.style.display === "block";

    if (isVisible) {
        details.style.display = "none";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-user-friends");
    } else {
        details.style.display = "block";
        icon.classList.remove("fa-user-friends");
        icon.classList.add("fa-eye-slash");
    }
}

// === WINDOW CLICK EVENTS (MODAL CLOSURE) ===

window.onclick = function (event) {
    const editModal = document.getElementById("editBookingModal");

    if (event.target === editModal) {
        closeModal();
    }

    // (Optional) หากมี deleteModal ใช้งาน
    const deleteModal = document.getElementById("deleteConfirmationModal");
    if (event.target === deleteModal) {
        closeDeleteModal(); // <-- ตรวจสอบว่าฟังก์ชันนี้มีจริง!
    }
};
