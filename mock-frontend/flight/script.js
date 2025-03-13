let currentRow = null;
let seatDataMap = {};

// ========== Modal Controls ==========
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// ========== ADD Flight ==========
function openAddFlightModal() {
  clearAddFlightForm();
  openModal('addFlightModal');
}

function clearAddFlightForm() {
  document.getElementById("addFlightNumber").value = "";
  document.getElementById("addOrigin").value = "";
  document.getElementById("addDestination").value = "";
  document.getElementById("addDepartureTime").value = "";
  document.getElementById("addArrivalTime").value = "";
}

function addFlight() {
  const flightNumber = document.getElementById("addFlightNumber").value.trim();
  const origin = document.getElementById("addOrigin").value;
  const destination = document.getElementById("addDestination").value;
  const departureTime = document.getElementById("addDepartureTime").value;
  const arrivalTime = document.getElementById("addArrivalTime").value;

  if (!flightNumber || !origin || !destination || !departureTime || !arrivalTime) {
    Swal.fire("Error", "Flight number already exists.", "error");
    return;
  }

  const tableBody = document.getElementById("flightTableBody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${tableBody.children.length + 1}</td>
    <td>${flightNumber}</td>
    <td>${origin}</td>
    <td>${destination}</td>
    <td>${departureTime}</td>
    <td>${arrivalTime}</td>
    <td class="actions">
      <button class="icon-btn edit" onclick="openEditModal(this)"><i class="fas fa-pen"></i></button>
      <button class="icon-btn delete" onclick="confirmDelete(this)"><i class="fas fa-trash-alt"></i></button>
      <button class="icon-btn add-seat" onclick="openSeatModal(this)"><i class="fas fa-plus"></i></button>
      <button class="icon-btn view-seat" onclick="openSeatTableModal(this)"><i class="fas fa-chair"></i></button>
    </td>
  `;

  tableBody.appendChild(row);
  seatDataMap[flightNumber] = [];

  Swal.fire("Success", "Flight Added", "success");
  closeModal('addFlightModal');
}

// ========== EDIT Flight ==========
function openEditModal(button) {
  currentRow = button.closest("tr");
  const cells = currentRow.querySelectorAll("td");

  document.getElementById("editFlightNumber").value = cells[1].innerText;
  document.getElementById("editOrigin").value = cells[2].innerText;
  document.getElementById("editDestination").value = cells[3].innerText;
  document.getElementById("editDepartureTime").value = cells[4].innerText;
  document.getElementById("editArrivalTime").value = cells[5].innerText;

  openModal('editFlightModal');
}

function updateFlight() {
  const flightNumber = document.getElementById("editFlightNumber").value.trim();
  const origin = document.getElementById("editOrigin").value;
  const destination = document.getElementById("editDestination").value;
  const departureTime = document.getElementById("editDepartureTime").value;
  const arrivalTime = document.getElementById("editArrivalTime").value;

  if (!flightNumber || !origin || !destination || !departureTime || !arrivalTime) {
    Swal.fire("Error", "Missing required information", "error");
    return;
  }

  currentRow.children[1].innerText = flightNumber;
  currentRow.children[2].innerText = origin;
  currentRow.children[3].innerText = destination;
  currentRow.children[4].innerText = departureTime;
  currentRow.children[5].innerText = arrivalTime;

  Swal.fire("Success", "Flight Updated", "success");
  closeModal('editFlightModal');
}

// ========== DELETE Flight ==========
function confirmDelete(button) {
  const row = button.closest("tr");
  const flightNumber = row.children[1].innerText;

  Swal.fire({
    title: `Delete flight ${flightNumber}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete"
  }).then((result) => {
    if (result.isConfirmed) {
      row.remove();
      delete seatDataMap[flightNumber];
      Swal.fire("Deleted", `Flight ${flightNumber} deleted`, "success");
    }
  });
}

// ========== SEAT Modal Functions ==========
function openSeatModal(button) {
  const row = button.closest("tr");
  const flightNumber = row.children[1].innerText;

  document.getElementById("seatFlightNumber").value = flightNumber;
  document.getElementById("seatNumber").value = "";
  document.getElementById("seatClass").value = "";
  document.getElementById("seatPrice").value = "";

  openModal("seatModal");
}

function closeSeatModal() {
  closeModal("seatModal");
}

function saveSeat() {
  const flightNumber = document.getElementById("seatFlightNumber").value;
  const seatNumber = document.getElementById("seatNumber").value.trim();
  const seatClass = document.getElementById("seatClass").value;
  const seatPrice = document.getElementById("seatPrice").value.trim();

  if (!seatNumber || !seatClass || !seatPrice) {
    Swal.fire("Error", "Seat number already exists for this flight.", "error");
    return;
  }

  if (!seatDataMap[flightNumber]) {
    seatDataMap[flightNumber] = [];
  }

  seatDataMap[flightNumber].push({
    seatNumber: seatNumber,
    seatClass: seatClass,
    price: parseFloat(seatPrice)
  });

  Swal.fire("Success", "Seat Added", "success");
  closeSeatModal();
}

function openSeatTableModal(button) {
  const row = button.closest('tr');
  const flightNumber = row.children[1].innerText;
  const seats = seatDataMap[flightNumber] || [];

  document.getElementById('seatTableFlightNumber').innerText = `Flight Number: ${flightNumber}`;
  const seatTableBody = document.getElementById('seatTableBody');
  seatTableBody.innerHTML = '';

  if (seats.length === 0) {
    document.getElementById('noSeatsMessage').style.display = 'block';
  } else {
    document.getElementById('noSeatsMessage').style.display = 'none';

    seats.forEach((seat, index) => {
      const seatRow = document.createElement('tr');
      seatRow.innerHTML = `
        <td>${seat.seatNumber}</td>
        <td>${seat.seatClass}</td>
        <td>${seat.price}</td>
        <td>
          <button class="icon-btn edit" onclick="editSeatInline('${flightNumber}', ${index}, this)">
            <i class="fas fa-pen"></i>
          </button>
          <button class="icon-btn delete" onclick="deleteSeat('${flightNumber}', ${index})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      seatTableBody.appendChild(seatRow);
    });
  }

  openModal('seatTableModal');
}

function closeSeatTableModal() {
  closeModal('seatTableModal');
}

function deleteSeat(flightNumber, index) {
  Swal.fire({
    title: "Delete Seat?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete"
  }).then((result) => {
    if (result.isConfirmed) {
      seatDataMap[flightNumber].splice(index, 1);
      Swal.fire("Deleted", "Seat deleted", "success");
      // Refresh seat table modal
      const row = Array.from(document.querySelectorAll('tr')).find(r => r.children[1]?.innerText === flightNumber);
      if (row) openSeatTableModal(row.querySelector('.view-seat'));
    }
  });
}

function editSeatInline(flightNumber, index, button) {
  const row = button.closest('tr');
  const seat = seatDataMap[flightNumber][index];

  const seatClassCell = row.children[1];
  const priceCell = row.children[2];

  seatClassCell.innerHTML = `<input type="text" value="${seat.seatClass}" class="inline-input seat-class-input" />`;
  priceCell.innerHTML = `<input type="number" value="${seat.price}" class="inline-input price-input" />`;

  button.innerHTML = `<i class="fas fa-save"></i>`;
  button.setAttribute('onclick', `saveSeatInline('${flightNumber}', ${index}, this)`);
}

function saveSeatInline(flightNumber, index, button) {
  const row = button.closest('tr');

  const seatClassInput = row.querySelector('.seat-class-input');
  const priceInput = row.querySelector('.price-input');

  const updatedSeatClass = seatClassInput.value;
  const updatedPrice = parseFloat(priceInput.value);

  seatDataMap[flightNumber][index].seatClass = updatedSeatClass;
  seatDataMap[flightNumber][index].price = updatedPrice;

  row.children[1].innerText = updatedSeatClass;
  row.children[2].innerText = updatedPrice.toFixed(2);

  button.innerHTML = `<i class="fas fa-pen"></i>`;
  button.setAttribute('onclick', `editSeatInline('${flightNumber}', ${index}, this)`);
}

// ========== Search Flights ==========
function searchTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toUpperCase();
  const table = document.querySelector(".flight-table");
  const tbody = table.querySelector("tbody");
  const rows = tbody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let found = false;

    for (let j = 0; j < cells.length - 1; j++) {
      const cell = cells[j];
      if (cell && cell.innerText.toUpperCase().indexOf(filter) > -1) {
        found = true;
        break;
      }
    }

    rows[i].style.display = found ? "" : "none";
  }
}
