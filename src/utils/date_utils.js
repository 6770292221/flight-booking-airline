export function formatDate(isoDateStr) {
  try {
    if (!isoDateStr || isoDateStr === null) {
      throw new Error("Invalid ISO date format");
    }

    const date = new Date(isoDateStr);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid ISO date format");
    }

    // Extract UTC day, month, year, hour, and minute
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getUTCFullYear();
    let hour = date.getUTCHours(); // Keep UTC hour
    const minute = String(date.getUTCMinutes()).padStart(2, "0");

    // Convert to 12-hour format
    const amPm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 (midnight) to 12
    console.log(`${day}/${month}/${year} ${String(hour).padStart(2, "0")}:${minute} ${amPm}`)
    return `${day}/${month}/${year} ${String(hour).padStart(2, "0")}:${minute} ${amPm}`;
  } catch (e) {
    throw new Error("Invalid ISO date format");
  }
}


export function convertDateToISO(dateStr) {
  const [day, month, year] = dateStr.split(" ")[0].split("-");
  const [hour, minute] = dateStr.split(" ")[1].split(":");

  const isoString = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;

  const date = new Date(isoString);
  if (isNaN(date)) {
      throw new Error("Invalid date format");
  }

  return date.toISOString();
}

export function rangeDate(dateStr) {
  try {
    const startOfDay = dateStr.replace(/T.*Z/, "T00:00:00.000Z");
    const endOfDay = dateStr.replace(/T.*Z/, "T23:59:59.999Z")
  
    return {startOfDay: startOfDay, endOfDay: endOfDay}
  } catch (e) {
    throw new Error("Invalid ISO date format");
  }

}