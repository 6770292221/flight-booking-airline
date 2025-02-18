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
                messageEl.textContent = "Registration successful!";
                messageEl.style.color = "green";
                messageEl.classList.remove("hidden");

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

        // ✅ Close Modal
        document.getElementById("closeModal").addEventListener("click", () => {
            document.getElementById("qrModal").classList.add("hidden");
        });
    
        // ✅ Copy Token to Clipboard
        document.getElementById("copyToken").addEventListener("click", () => {
            const authSecret = document.getElementById("authSecret");
        
            // Select the text field content
            authSecret.select();
            authSecret.setSelectionRange(0, 99999); // For mobile devices
        
            // ✅ Use a fallback for clipboard API
            try {
                navigator.clipboard.writeText(authSecret.value).then(() => {
                    alert("Secret copied to clipboard!");
                }).catch(err => {
                    console.error("Clipboard copy failed, using fallback method.", err);
                    document.execCommand("copy"); // Fallback for older browsers
                    alert("Secret copied to clipboard!");
                });
            } catch (err) {
                console.error("Copy failed:", err);
            }
        });
        
    
        // ✅ Handle 6-digit OTP Confirmation
        document.getElementById("confirm2FA").addEventListener("click", async () => {
            const otp = document.getElementById("otp").value;
            if (otp.length !== 6 || isNaN(otp)) {
                alert("Please enter a valid 6-digit code.");
                return;
            }
    
            try {
                const response = await fetch("http://localhost:3001/api/v1/user-core-api/verify-2fa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: document.getElementById("email").value, otp })
                });
    
                const result = await response.json();
                if (response.ok) {
                    alert("Two-Factor Authentication Verified Successfully!");
                    document.getElementById("qrModal").classList.add("hidden");
                } else {
                    alert("Invalid OTP. Please try again.");
                }
            } catch (error) {
                console.error("Error verifying OTP:", error);
                alert("Failed to verify OTP. Please try again.");
            }
        });
    
});
