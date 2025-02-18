document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signup-form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page reload
        
        const formData = {
            firstName: document.getElementById("first-name").value,
            lastName: document.getElementById("last-name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phoneNumber: document.getElementById("phone").value
        };



        try {
            const response = await fetch("http://localhost:3001/api/v1/user-core-api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log(result);

            const messageEl = document.getElementById("message");

            if (response.ok) {
                localStorage.setItem("authToken", result.data.token);
           // ✅ Display Secret Key Instead of Input Field
           if (result.data && result.data.qrCode) {
            document.getElementById("qrImage").src = result.data.qrCode;
            document.getElementById("authSecret").textContent = result.data.twoFactorSecret; // Display Secret Key
            document.getElementById("qrModal").classList.remove("hidden");
        }

                // ✅ Check if QR Code is available, then show modal
                if (result.data && result.data.qrCode) {
                    console.log("Showing QR Code Modal...");
                    document.getElementById("qrImage").src = result.data.qrCode; // Set QR Code
                    document.getElementById("authSecret").textContent = result.data.twoFactorSecret; // Set Secret
                    document.getElementById("qrModal").classList.remove("hidden"); // Show Modal
                }
            } else {
                messageEl.textContent = "Error: " + (result.message || "Something went wrong");
                messageEl.style.color = "red";
                messageEl.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to register. Please try again.");
        }
    });

    const otpInputs = document.querySelectorAll(".otp-input");

    otpInputs.forEach((input, index) => {
        input.addEventListener("input", (event) => {
            if (event.target.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus(); // Move to next box
            }
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && !event.target.value && index > 0) {
                otpInputs[index - 1].focus(); // Move to previous box on backspace
            }
        });
    });


        // ✅ Close Modal
        document.getElementById("closeModal").addEventListener("click", () => {
            document.getElementById("qrModal").classList.add("hidden");
        });
        
    
    // ✅ Copy Token to Clipboard
    document.getElementById("copyToken").addEventListener("click", () => {
        const authSecret = document.getElementById("authSecret");
        navigator.clipboard.writeText(authSecret.value).then(() => {
            alert("Secret copied to clipboard!");
        }).catch(err => {
            console.error("Clipboard copy failed.", err);
        });
    });
        
    
    document.getElementById("confirm2FA").addEventListener("click", async () => {
        let otp = "";
        otpInputs.forEach(input => otp += input.value);
    
        if (otp.length !== 6 || isNaN(otp)) {
            alert("Please enter a valid 6-digit code.");
            return;
        }
    
        // Retrieve token from the stored response after registration
        const token = localStorage.getItem("authToken"); // Retrieve from localStorage
    
        if (!token) {
            alert("No token found. Please log in again.");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:3001/api/v1/user-core-api/verifyUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // ✅ Include Bearer Token
                },
                body: JSON.stringify({
                    verificationCode: otp
                })
            });
    
            const result = await response.json();
            console.log(response.data);
            if (response.ok) {
        // ✅ Show Success Popup Instead of Alert
        document.getElementById("successModal").classList.remove("hidden");
            } else {
                alert("Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Failed to verify OTP. Please try again.");
        }
    });

    // ✅ Redirect to Login Page When Clicking OK
document.getElementById("successOkBtn").addEventListener("click", () => {
    window.location.href = "index.html"; // Redirect to login page
});

    
});
