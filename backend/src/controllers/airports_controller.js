import { AirportMongooseModel } from "../models/airport_models.js";

// Get all airports
export async function getAirports(req, res) {
    try {
        const data = (await AirportMongooseModel.find()).map((e) => ({
            id: e.id,
            iataCode: e.iataCode,
            cityName: e.cityName
        }));
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve airports." });
    }
}

// Get airport by ID
export async function getAirportById(req, res) {
    try {
        const { id } = req.params;
        const airport = await AirportMongooseModel.findById(id);

        if (!airport) {
            return res.status(404).json({ error: "Airport not found." });
        }

        return res.status(200).json({
            id: airport.id,
            iataCode: airport.iataCode,
            cityName: airport.cityName
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve airport." });
    }
}

// Create new airport
export async function createAirport(req, res) {
    const { iataCode, cityName, airportName, country, timezone } = req.body;

    try {
        const newAirport = await AirportMongooseModel.create({
            iataCode,
            cityName,
            airportName,
            country,
            timezone
        });

        return res.status(201).json({
            message: "Airport created successfully",
            data: newAirport
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Failed to create airport." });
    }
}

// Update airport
export async function updateAirport(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedAirport = await AirportMongooseModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAirport) {
            return res.status(404).json({ error: "Airport not found." });
        }

        return res.status(200).json({
            message: "Airport updated successfully",
            data: updatedAirport
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update airport." });
    }
}

// Delete airport
export async function deleteAirport(req, res) {
    const { id } = req.params;

    try {
        const deletedAirport = await AirportMongooseModel.findByIdAndDelete(id);

        if (!deletedAirport) {
            return res.status(404).json({ error: "Airport not found." });
        }

        return res.status(200).json({ message: "Airport deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete airport." });
    }
}
