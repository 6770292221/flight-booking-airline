export class TicketStrategy {
  mapRequest(flight, passengers) {
    throw new Error("mapRequest must be implemented");
  }

  issue(flight, passengers) {
    throw new Error("issue must be implemented");
  }
}

export class NokAirStrategy extends TicketStrategy {
  mapRequest(flight, passengers) {
    return {
      status: "SUCCESS",
      message: "Nok Air ticket issued successfully.",
      data: {
        passengerInfo: passengers.map((p) => ({
          name: {
            first: p.firstName,
            last: p.lastName,
            passportNumber: p.passportNumber,
          },
          seatAssignment:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.seat ?? "",
          mealOption:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.meal ?? "",
          airline: flight.airlineName,
          airlineCode: flight.airline,
          flightNumber: flight.flightNumber,
          ticketNo: `${flight.airline}${generateRandom9DigitNumber()}`,
        })),
        ticketIssuedAt: new Date(),
      },
    };
  }

  issue(flight, passengers) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];
    return this.mapRequest(flight, safePassengers);
  }
}

export class ThaiLionStrategy extends TicketStrategy {
  mapRequest(flight, passengers) {
    return {
      status: "SUCCESS",
      message: "Thai Lion Air booking confirmed.",
      data: {
        traveler: passengers.map((p) => ({
          name: {
            first: p.firstName,
            last: p.lastName,
            passportNumber: p.passportNumber,
          },
          seatAssignment: p.seat ?? "",
          mealOption: p.meal ?? "",
          carrier: flight.airlineName,
          carrierCode: flight.airline,
          flightId: flight.flightNumber,
          eTicketNumber: `${flight.airline}${generateRandom9DigitNumber()}`,
        })),

        issuedOn: new Date(),
      },
      data: {
        guests: passengers.map((p) => ({
          name: {
            first: p.firstName,
            last: p.lastName,
            passportNumber: p.passportNumber,
          },
          seatAssignment:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.seat ?? "",
          mealOption:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.meal ?? "",
          referenceNumber: `${flight.airline}${generateRandom9DigitNumber()}`,
          provider: flight.airlineName,
          providerCode: flight.airline,
          flightCode: flight.flightNumber,
        })),
        bookingDate: new Date(),
      },
    };
  }

  issue(flight, passengers) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];
    return this.mapRequest(flight, safePassengers);
  }
}

export class AirAsiaStrategy extends TicketStrategy {
  mapRequest(flight, passengers) {
    return {
      status: "SUCCESS",
      message: "Flight booking successful with Thai AirAsia.",
      data: {
        guests: passengers.map((p) => ({
          name: {
            first: p.firstName,
            last: p.lastName,
            passportNumber: p.passportNumber,
          },
          seatAssignment:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.seat ?? "",
          mealOption:
            p.addons.find((a) => a.flightNumber === flight.flightNumber)
              ?.meal ?? "",
          referenceNumber: `${flight.airline}${generateRandom9DigitNumber()}`,
          provider: flight.airlineName,
          providerCode: flight.airline,
          flightCode: flight.flightNumber,
        })),
        bookingDate: new Date(),
      },
    };
  }

  issue(flight, passengers) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];

    return this.mapRequest(flight, safePassengers);
  }
}

export class VietJetStrategy extends TicketStrategy {
  mapRequest(flight, passengers) {
    return {
      status: "SUCCESS",
      message: `Ticket issued successfully for ${flight.airline}.`,
      data: {
        flight,
        passengers: passengers.map((p) => ({
          ...p,
          referenceNumber: `${flight.airline}${generateRandom9DigitNumber()}`,
        })),
      },
    };
  }

  issue(flight, passengers) {
    const safePassengers = Array.isArray(passengers)
      ? passengers
      : [passengers];
    return this.mapRequest(flight, safePassengers);
  }
}

export function getStrategy(airlineId) {
  switch (airlineId) {
    case "VZ":
      return new VietJetStrategy();
    case "FD":
      return new AirAsiaStrategy();
    case "SL":
      return new NokAirStrategy();
    case "TG":
      return new ThaiLionStrategy();
  }
}

function generateRandom9DigitNumber() {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}
