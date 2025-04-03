export class TicketStrategy {
  mapRequest(flight, passengers) {
    throw new Error("mapRequest must be implemented");
  }

  issue(flight, passengers) {
    throw new Error("issue must be implemented");
  }
}


export class AirAsiaStrategy extends TicketStrategy {
  mapRequest(flights, passengers, bookingNumber) {
    return {
      bookingId: bookingNumber,
      ticketStatus: "SUCCESS",
      reason: "Tickets issued successfully",
      passengers: passengers.map((p) => ({
        passportNumber: p.passportNumber,
        tickets: {
          flightNumber: flights.flightNumber,
          ticketNumber: `${flights.airline}${generateRandom9DigitNumber()}`,
        },
      })),
      issuedAt: new Date().toISOString(),
    };
  }

  issue(flight, passengers, bookingNubmer) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];

    return this.mapRequest(flight, safePassengers, bookingNubmer);
  }
}

export class VietJetStrategy extends TicketStrategy {
  mapRequest(flights, passengers, bookingNumber) {
    return {
      bookingId: bookingNumber,
      ticketStatus: "FAILED",
      reason: "No available seats on the selected flight",
      passengers: passengers.map((p) => ({
        passportNumber: p.passportNumber,
        tickets: {
          flightNumber: flights.flightNumber,
          ticketNumber: "FAILED" ? "" : `${flights.airline}${generateRandom9DigitNumber()}`,
        },
      })),
      issuedAt: new Date().toISOString(),
    };
  }

  issue(flight, passengers, bookingNubmer) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];

    return this.mapRequest(flight, safePassengers, bookingNubmer);
  }
}

export class NokAirStrategy extends TicketStrategy {
  mapRequest(flights, passengers, bookingNumber) {
    return {
      bookingId: bookingNumber,
      ticketStatus: "SUCCESS",
      reason: "Tickets issued successfully",
      passengers: passengers.map((p) => ({
        passportNumber: p.passportNumber,
        tickets: {
          flightNumber: flights.flightNumber,
          ticketNumber: `${flights.airline}${generateRandom9DigitNumber()}`,
        },
      })),
      issuedAt: new Date().toISOString(),
    };
  }

  issue(flight, passengers, bookingNubmer) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];

    return this.mapRequest(flight, safePassengers, bookingNubmer);
  }
}

export class ThaiLionStrategy extends TicketStrategy {
  mapRequest(flights, passengers, bookingNumber) {
    return {
      bookingId: bookingNumber,
      ticketStatus: "SUCCESS",
      reason: "Tickets issued successfully",
      passengers: passengers.map((p) => ({
        passportNumber: p.passportNumber,
        tickets: {
          flightNumber: flights.flightNumber,
          ticketNumber: `${flights.airline}${generateRandom9DigitNumber()}`,
        },
      })),
      issuedAt: new Date().toISOString(),
    };
  }

  issue(flight, passengers, bookingNubmer) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];

    return this.mapRequest(flight, safePassengers, bookingNubmer);
  }
}

export function getStrategy(airlineId) {
  switch (airlineId) {
    case "VZ":
      return new VietJetStrategy();
    case "FD":
      return new AirAsiaStrategy();
    case "SL":
      return new ThaiLionStrategy();
    case "DD":
      return new NokAirStrategy();
  }
}

function generateRandom9DigitNumber() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}
