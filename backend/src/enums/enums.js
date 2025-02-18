export const Enums = Object.freeze({

});

export const StatusCodes = Object.freeze({
  OK: 200,
  CREATE: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
});

export const StatusMessages = Object.freeze({
  SUCCESS: "success",
  FAILED: "failed",
  SERVER_ERROR: "server_error",


});

export const Codes = Object.freeze({
  // Register Codes
  REG_1001: "REG_1001",
  REG_1002: "REG_1002",
  REG_1003: "REG_1003",
  REG_1004: "REG_1004",
  REG_1005: "REG_1005",
  REG_1006: "REG_1006",

  // Auth Codes
  LGN_2001: "LGN_2001",
  LGN_2002: "LGN_2002",
  LGN_2003: "LGN_2003",
  LGN_2004: "LGN_2004",
  LGN_2005: "LGN_2005",
  LGN_2006: "LGN_2006",
  LGN_2007: "LGN_2007",

  // Reservation Codes
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


  // Validation Codes
  VAL_4001: "VAL_4001",
  VAL_4002: "VAL_4002",
  VAL_4003: "VAL_4003",
  VAL_4004: "VAL_4004",

  // Logout Codes
  LOT_5001: "LOT_5001",

  // Permission Messages
  TKN_6001: "TKN_6001",
  TKN_6002: "TKN_6002",

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

  //General
  GNR_1001: "GNR_1001",

});

export const Messages = Object.freeze({
  // Register Messages
  REG_1001: "Registration successfully",
  REG_1002: "Missing Required Fields: Missing required fields",
  REG_1003: "Invalid Formats",
  REG_1004: "Name Already Exists: The name already exists in the system.",
  REG_1005: "Email Already Exists: The email already exists in the system.",
  REG_1006: "Password must meet the following requirements: 1. Length between 8 and 20 characters, 2. At least one uppercase letter (A-Z), 3. At least one lowercase letter (a-z), 4. At least one number (0-9), 5. At least one special character (e.g., !@#$%^&*(),.?\":{}|<>).",

  // Auth Messages
  LGN_2001: "Login successful",
  LGN_2002: "Missing required information: flightId, email, password and otp are mandatory.",
  LGN_2003: "The email you entered is incorrect. Please try again.",
  LGN_2004: "Two-factor authentication is not set up for this account.",
  LGN_2005: "Invalid or expired OTP. Please try again.",
  LGN_2006: "The password you entered is incorrect. Please try again.",
  LGN_2007: "",

  // Reservation Messages
  RSV_3001: "Missing required information: flightId and passenger are mandatory.",
  RSV_3002: "Invalid flight number.",
  RSV_3003: "Flight information not found",
  RSV_3004: "Duplicate seat booking is not allowed.",
  RSV_3005: "Duplicate passport usage is not allowed.",
  RSV_3006: "Seat for passenger {index} is invalid.",
  RSV_3007: "Seat for passenger {index} does not exist in the system.",
  RSV_3008: "Passenger {index} information is incomplete.",
  RSV_3009: "Reservation successful.",
  RSV_3010: "Price must be a positive number at Passenger {index}.",
  RSV_3011: "Price must be greater than 0 at Passenger {index}.",
  RSV_3012: "Passenger {index}: The selected seat is not available for booking",
  RSV_3013: "No reservations to cancel",
  RSV_3014: "Reservations updated successfully",

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
  VAL_4004: `Invalid data format`,


  // Logout Messages
  LOT_5001: "Logout successful",

  // Permission Messages
  TKN_6001: "You do not have permission to access.",
  TKN_6002: "Invaild or session expired",

  //General Messages
  GNR_1001: "Internal Server Error",

});


export const Status = Object.freeze({
  PENDING: "Pending",
});