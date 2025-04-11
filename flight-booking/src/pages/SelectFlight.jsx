import { useLocation } from "react-router-dom";

const SelectFlight = () => {
  const location = useLocation();
  const flight = location.state;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-800">
        ✈️ เที่ยวบินที่คุณเลือก
      </h2>
      {flight ? (
        <div className="border p-4 rounded shadow-md">
          <p>
            <strong>สายการบิน:</strong> {flight.airlineName}
          </p>
          <p>
            <strong>เที่ยวบิน:</strong> {flight.flightNumber}
          </p>
          <p>
            <strong>จาก:</strong> {flight.departure.cityName} (
            {flight.departure.iataCode})
          </p>
          <p>
            <strong>ถึง:</strong> {flight.arrival.cityName} (
            {flight.arrival.iataCode})
          </p>
          <p>
            <strong>เวลาออกเดินทาง:</strong>{" "}
            {new Date(flight.departure.time).toLocaleString()}
          </p>
          <p>
            <strong>เวลาถึง:</strong>{" "}
            {new Date(flight.arrival.time).toLocaleString()}
          </p>
          <p>
            <strong>ราคา:</strong> {flight.price.amount} {flight.price.currency}
          </p>
        </div>
      ) : (
        <p>ไม่พบข้อมูลเที่ยวบินที่เลือก</p>
      )}
    </div>
  );
};

export default SelectFlight;
