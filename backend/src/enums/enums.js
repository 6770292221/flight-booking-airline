export const Enums = Object.freeze({

});

export const StatusCodes = Object.freeze({
  OK: 200,
  CREATE: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
});

export const StatusMessages = Object.freeze({
  SUCCESS: "success",
  FAILED: "failed",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  ACCEPTED: "accepted"


});

export const Codes = Object.freeze({
  // Register Codes
  REG_1001: "REG_1001",
  REG_1002: "REG_1002",
  REG_1003: "REG_1003",
  REG_1004: "REG_1004",
  REG_1005: "REG_1005",
  REG_1006: "REG_1006",
  REG_1007: "REG_1007",
  REG_1008: "REG_1008",


  // Auth Codes
  LGN_2001: "LGN_2001",
  LGN_2002: "LGN_2002",
  LGN_2003: "LGN_2003",
  LGN_2004: "LGN_2004",
  LGN_2005: "LGN_2005",
  LGN_2006: "LGN_2006",

  // Booking Codes
  RSV_3001: "RSV_3001",
  RSV_3002: "RSV_3002",
  RSV_3003: "RSV_3003",
  RSV_3004: "RSV_3004",
  RSV_3005: "RSV_3005",
  RSV_3006: "RSV_3006",
  RSV_3007: "RSV_3007",
  RSV_3008: "RSV_3008",
  RSV_3009: "RSV_3009",
  RSV_3010: "RSV_3010",
  RSV_3011: "RSV_3011",
  RSV_3012: "RSV_3012",
  RSV_3013: "RSV_3013",
  RSV_3014: "RSV_3014",
  RSV_3015: "RSV_3015",



  // Validation Codes
  VAL_4001: "VAL_4001",
  VAL_4002: "VAL_4002",
  VAL_4003: "VAL_4003",
  VAL_4004: "VAL_4004",

  // 2fa
  ATH_4001: "ATH_4001",
  ATH_4002: "ATH_4002",
  ATH_4003: "ATH_4003",
  ATH_4004: `ATH_4004`,
  ATH_6005: "ATH_6005",

  // Logout Codes
  LOT_5001: "LOT_5001",

  // Permission Messages
  TKN_6001: "TKN_6001",
  TKN_6002: "TKN_6002",
  TKN_6003: "TKN_6003",

  //Seat
  SAT_1001: "SAT_1001",
  SAT_1002: "SAT_1002",
  SAT_1003: "SAT_1003",
  SAT_1004: "SAT_1004",
  SAT_1005: "SAT_1005",
  SAT_1006: "SAT_1006",
  SAT_1007: "SAT_1007",
  SAT_1008: "SAT_1008",
  SAT_1009: "SAT_1009",
  SAT_1010: "SAT_1010:",

  //Flight
  FGT_1001: "SAT_1001",
  FGT_1002: "SAT_1002",
  FGT_1003: "SAT_1003",
  FGT_1004: "SAT_1004",
  FGT_1005: "SAT_1005",
  FGT_1006: "SAT_1006",
  FGT_1007: "FGT_1007",
  FGT_1008: "FGT_1008",
  FGT_1009: "FGT_1009",

  //Payment
  PMT_1001: "PMT_1001",
  PMT_1002: "PMT_1002",
  PMT_1003: "PMT_1003",
  PMT_1004: "PMT_1004",
  PMT_1005: "PMT_1005",
  PMT_1006: "PMT_1006",
  PMT_1007: "PMT_1007",
  PMT_1008: "PMT_1008",
  PMT_1009: "PMT_1009",
  PMT_1010: "PMT_1010",
  PMT_1011: "PMT_1011",

  //General
  GNR_1001: "GNR_1001",

  //Airline Codes
  AIR_1001: "AIR_1001",
  AIR_1002: "AIR_1002",
  AIR_1003: "AIR_1003",
  AIR_1004: "AIR_1004",
  AIR_1005: "AIR_1005",
  AIR_1006: "AIR_1006",
  AIR_1007: "AIR_1007",
  AIR_1008: "AIR_1008",

  // Cabin Class Codes
  CABIN_1001: "CABIN_1001",
  CABIN_1002: "CABIN_1002",
  CABIN_1003: "CABIN_1003",
  CABIN_1004: "CABIN_1004",
  CABIN_1005: "CABIN_1005",
  CABIN_1006: "CABIN_1006",
  CABIN_1007: "CABIN_1007",

  AIR_1004: "AIR_1004",
  AIR_1005: "AIR_1005",
  AIR_1006: "AIR_1006",
  AIR_1007: "AIR_1007",
  AIR_1008: "AIR_1008",
  AIR_1009: "AIR_1009",
  AIR_1010: "AIR_1010",

  // OTP
  OTP_1001: "OTP_1001",
  OTP_1002: "OTP_1002",
  OTP_1003: "OTP_1003",
  OTP_1004: "OTP_1004",
  OTP_3005: "OTP_1005",

  //PAYMENT
  PAY_1001: "PAY_1001",
  PAY_1002: "PAY_1002",
  PAY_1003: "PAY_1003",
  PAY_1004: "PAY_1004",
  PAY_1005: "PAY_1005",
  PAY_1006: "PAY_1006",
  PAY_1007: "PAY_1007",

  //TICKETING
  TKT_1001: "TKT_1001",
  TKT_1002: "TKT_1002",
  TKT_1003: "TKT_1003",
  TKT_1004: "TKT_1004"
});



export const Messages = Object.freeze({
  // Register Messages
  REG_1001: "Registration successfully",
  REG_1002: "Missing Required Fields: Missing required fields",
  REG_1003: "Invalid Formats",
  REG_1004: "Name Already Exists: The name already exists in the system.",
  REG_1005: "Email Already Exists: The email already exists in the system.",
  REG_1006: "Password must meet the following requirements: 1. Length between 8 and 20 characters, 2. At least one uppercase letter (A-Z), 3. At least one lowercase letter (a-z), 4. At least one number (0-9), 5. At least one special character (e.g., !@#$%^&*(),.?\":{}|<>).",
  REG_1007: "Account not verified. Please confirm your email address.",
  REG_1008: "Account successfully verified",

  // Auth Messages
  LGN_2001: "Login successful",
  LGN_2002: "Missing required information: flightId, email, password and otp are mandatory.",
  LGN_2003: "The email you entered is incorrect. Please try again.",
  LGN_2004: "Two-factor authentication is not set up for this account.",
  LGN_2005: "Account not verified. Please contact admin.",
  LGN_2006: "The password you entered is incorrect. Please try again.",

  // Booking Messages
  RSV_3001: "Missing required information: flightId and passenger are mandatory.",
  RSV_3002: "Only bookings with status 'PENDING' can be cancelled.",
  RSV_3003: "Expired bookings cancelled successfully.",
  RSV_3004: "No expired bookings found.",
  RSV_3005: "Payments updated successfully.",
  RSV_3006: "Payments array is required.",
  RSV_3007: "Tickets updated successfully.",
  RSV_3008: "Passenger at index ${i} with passportNumber '${updatedPassenger.passportNumber}' not found in booking.",
  RSV_3009: "Create Booking successful",
  RSV_3010: "Bookings fetched successfully.",
  RSV_3011: "Booking Not found.",
  RSV_3012: "Booking deleted successfully.",
  RSV_3013: "Booking updated successfully.",
  RSV_3014: "Passengers array is required.",
  RSV_3015: "Booking cancelled successfully",

  // Seat
  SAT_1001: "Missing required information: flightId, seatId, and userId are mandatory.",
  SAT_1002: "Flight not found. Please check the flight number.",
  SAT_1003: "Seat number already exists for this flight.",
  SAT_1004: "Seat created successfully.",
  SAT_1005: "Seat not found.",
  SAT_1006: "You cannot update seatNumber or flightId.",
  SAT_1007: "Seat updated successfully.",
  SAT_1008: "Seat delete successfully.",
  SAT_1009: "Seat found successfully.",
  SAT_1010: "Invalid status value. Allowed values are 'available', 'reserve', 'confirmed",

  // Flight
  FGT_1001: "Flight not found.",
  FGT_1002: "No seats available on flight",
  FGT_1003: "Flight found successfully.",
  FGT_1004: "Flight not found",
  FGT_1005: "Flight deleted successfully",
  FGT_1006: "Flight updated successfully",
  FGT_1007: "Flight found successfully",
  FGT_1008: "Missing required information:flightNumber,origin,origin,departureTime and arrivalTime are mandatory.",
  FGT_1008: "Flight number already exists.",
  FGT_1009: "Flight created successfully.",

  // Validation Messages
  VAL_4001: "Required fields are missing. Please fill in all the necessary fields.",
  VAL_4002: "Invalid phone number format",
  VAL_4003: "Invalid shopId format",
  VAL_4004: `Validation error. Please check your data information.`,

  // OTP
  ATH_4001: "user not found",
  ATH_4002: "Invalid or expired OTP. Please try again",
  ATH_4003: "Missing required information: VrificationCode are mandatory",
  ATH_4004: "2FA verified successfully.",
  ATH_6005: "Please verify the SMS OTP",


  // Payment Messages
  PMT_1001: "Payment successful",
  PMT_1002: "Payment failed",
  PMT_1003: "Missing required information: bookingNubmer",
  PMT_1004: "Booking not found",
  PMT_1005: "The user id does not match the user id associated with the booking",
  PMT_1006: "Booking status is not pending",
  PMT_1007: "Payment token and amount are required",
  PMT_1008: "Error creating PaymentIntent",
  PMT_1009: "Failed to update booking status",
  PMT_1010: "Bank payment is not success",
  PMT_1011: "Bank name, Account number, Transaction reference and Transfer datetime are required",

  // Logout Messages
  LOT_5001: "Logout successful",

  // Permission Messages
  TKN_6001: "You do not have permission to access.",
  TKN_6002: "Invaild or session expired",
  TKN_6003: "Admin access required. You do not have permission to perform this action",

  //General Messages
  GNR_1001: "Internal Server Error",

  // Airline Messages
  AIR_1001: "Airline created successfully.",
  AIR_1002: "Missing required fields: carrierCode, airlineName, logoUrl, country.",
  AIR_1003: "Airline with this carrierCode already exists.",
  AIR_1004: "Airline retrieved successfully.",
  AIR_1005: "Airline not found.",
  AIR_1006: "Airline updated successfully.",
  AIR_1007: "Airline deleted successfully.",
  AIR_1008: "Airline validation error. Please check your data.",

  // Cabin Class Messages
  CABIN_1001: "Cabin Class created successfully.",
  CABIN_1002: "Missing required fields: code, name, checked, carryOn.",
  CABIN_1003: "Cabin Class with this code already exists.",
  CABIN_1004: "Cabin Class retrieved successfully.",
  CABIN_1005: "Cabin Class not found.",
  CABIN_1006: "Cabin Class updated successfully.",
  CABIN_1007: "Cabin Class deleted successfully.",

  AIR_1004: "Airports retrieved successfully.",
  AIR_1005: "No airports found.",
  AIR_1006: "Failed to retrieve airports.",
  AIR_1007: "Airport created successfully",
  AIR_1008: "Airports with this code already exists.",
  AIR_1009: "Airport updated successfully",
  AIR_1010: "Airport deleted successfully",

  // OTP Messages
  OTP_1001: "A one-time password (OTP) has been successfully sent to your email address.",
  OTP_1002: "Invalid OTP. Please try again.",
  OTP_1003: "OTP has expired. Please request a new code.",
  OTP_3004: "OTP verified successfully.",
  OTP_3005: "User not found.",

  //PAYMENT
  PAY_1001: "Payment successful",
  PAY_1002: "Invalid Event",
  PAY_1003: "Payment not found",
  PAY_1004: "Booking not found",
  PAY_1005: "User not found",
  PAY_1006: "Update event and send email to user successfully",
  PAY_1006: "Transaction already refunded",


  //TICKETING
  TKT_1001: "Issue ticket successfully",
  TKT_1002: "Booking status is not PAID",
  TKT_1003: "Ticketing successfully",
  TKT_1004: "Ticketing failed",

});

export const Status = Object.freeze({
  PENDING: "Pending",
});