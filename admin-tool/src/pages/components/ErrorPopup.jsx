import Swal from "sweetalert2";

export const showErrorPopup = (code, message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    html: `
      <div style="margin-top: 10px;">
        <p style="margin-bottom: 8px;"><strong>Code:</strong> ${code}</p>
        <p style="margin: 0;">${message}</p>
      </div>
    `,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "OK",
  });
};
