import { AirportMongooseModel } from "../models/airport_models.js";
import logger from "../utils/logger_utils.js";
// Get all airports
export async function getAirports(req, res) {
    try {
        const data = (await AirportMongooseModel.find()).map((e) => ({
            id: e.id,
            iataCode: e.iataCode,
            cityName: e.cityName
        }));

        logger.info(" Successfully retrieved all airports.");
        return res.status(200).json(data);
    } catch (error) {
        logger.info(` Error retrieving airports: ${error.message}`, "error");
        return res.status(500).json({ error: "Failed to retrieve airports." });
    }
}

// Get airport by ID
export async function getAirportById(req, res) {
    try {
        const { id } = req.params;
        const airport = await AirportMongooseModel.findById(id);

        if (!airport) {

            logger.info(` Airport with ID: ${id} not found.`, "error");
            return res.status(404).json({ error: "Airport not found." });
        }

        logger.info(` Successfully retrieved airport with ID: ${id}`);
        return res.status(200).json({
            id: airport.id,
            iataCode: airport.iataCode,
            cityName: airport.cityName
        });
    } catch (error) {
        logger.info(` Error retrieving airport by ID: ${error.message}`, "error");
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

        logger.info(` Airport created successfully: ${newAirport.id}`);
        return res.status(201).json({
            message: "Airport created successfully",
            data: newAirport
        });
    } catch (error) {
        logger.info(` Error creating airport: ${error.message}`, "error");
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

            logger.info(` Airport with ID: ${id} not found.`, "error");
            return res.status(404).json({ error: "Airport not found." });
        }

        logger.info(` Airport updated successfully: ${id}`);
        return res.status(200).json({
            message: "Airport updated successfully",
            data: updatedAirport
        });
    } catch (error) {
        logger.info(` Error updating airport: ${error.message}`, "error");
        return res.status(500).json({ error: "Failed to update airport." });
    }
}

// Delete airport
export async function deleteAirport(req, res) {
    const { id } = req.params;

    try {
        const deletedAirport = await AirportMongooseModel.findByIdAndDelete(id);

        if (!deletedAirport) {

            logger.info(` Airport with ID: ${id} not found.`, "error");
            return res.status(404).json({ error: "Airport not found." });
        }

        logger.info(` Airport deleted successfully: ${id}`);
        return res.status(200).json({ message: "Airport deleted successfully" });
    } catch (error) {
        logger.info(` Error deleting airport: ${error.message}`, "error");
        return res.status(500).json({ error: "Failed to delete airport." });
    }
}
