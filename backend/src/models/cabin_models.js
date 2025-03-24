import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";

class CabinClassServiceModel {
    constructor(code, name, checked, carryOn, updatedAt) {
        this.code = code;
        this.name = name;
        this.checked = checked;
        this.carryOn = carryOn;
        this.updatedAt = updatedAt;
    }

    static getSchema() {
        return new mongoose.Schema(
            {
                code: {
                    type: String,
                    required: true,
                    unique: true,
                    trim: true
                },
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                checked: {
                    type: String,
                    required: true,
                    trim: true
                },
                carryOn: {
                    type: String,
                    required: true,
                    trim: true
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            },
            { timestamps: true }
        );
    }
}

const CabinClassMongooseModel = flightDb.model("cabin", CabinClassServiceModel.getSchema());

export { CabinClassServiceModel, CabinClassMongooseModel };
