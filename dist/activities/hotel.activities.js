"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupplierAHotels = getSupplierAHotels;
const axios_1 = __importDefault(require("axios"));
async function getSupplierAHotels() {
    const response = await axios_1.default.get("http://localhost:3000/supplierA/hotels");
    return response.data;
}
//# sourceMappingURL=hotel.activities.js.map