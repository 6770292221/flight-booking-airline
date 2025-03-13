document.addEventListener('DOMContentLoaded', () => {
  fetch('../components/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
    });

  const creditRadio = document.querySelector('input[value="credit"]');
  const bankRadio = document.querySelector('input[value="bank"]');
  const creditForm = document.getElementById('credit-form');
  const bankForm = document.getElementById('bank-form');

  // Toggle forms based on selection
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (creditRadio.checked) {
        creditForm.classList.remove('hidden');
        bankForm.classList.add('hidden');
      } else {
        creditForm.classList.add('hidden');
        bankForm.classList.remove('hidden');
      }
    });
  });

  // ผูกปุ่ม confirm-btn
  const confirmBtn = document.querySelector('.confirm-btn');
  confirmBtn.addEventListener('click', confirmPayment);

  function confirmPayment() {
    const isCredit = creditRadio.checked;
    const isBank = bankRadio.checked;

    let requiredFields = [];

    if (isCredit) {
      requiredFields = [
        document.querySelector('#credit-form input[placeholder="Card Number"]'),
        document.querySelector('#credit-form input[placeholder="Cardholder Name"]'),
        document.querySelector('#credit-form input[placeholder="Expiry Date (MM/YY)"]'),
        document.querySelector('#credit-form input[placeholder="CVV"]')
      ];
    } else if (isBank) {
      requiredFields = [
        document.querySelector('#bank-form input[placeholder="Bank Name"]'),
        document.querySelector('#bank-form input[placeholder="Account Number"]'),
        document.querySelector('#bank-form input[placeholder="Transaction Reference"]'),
        document.querySelector('#bank-form input[placeholder="Transfer Date/Time"]')
      ];
    }

    if (requiredFields.some(field => !field)) {
      Swal.fire({
        icon: 'error',
        title: 'Form Error',
        text: 'Some fields were not found. Please check your form setup!',
        confirmButtonColor: '#e91e63'
      });
      return;
    }

    const emptyField = requiredFields.find(field => field.value.trim() === '');

    if (emptyField) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields before confirming the payment.',
        confirmButtonColor: '#e91e63'
      });
      return;
    }

    Swal.fire({
      title: 'Confirm Payment',
      text: 'Are you sure you want to confirm this payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, confirm it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Your payment has been successfully processed.',
          icon: 'success',
          confirmButtonColor: '#e91e63'
        }).then(() => {
          console.log('Payment confirmed!');
        });
      }
    });
  }
});
