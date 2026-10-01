"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSupplierA = fetchSupplierA;
exports.fetchSupplierB = fetchSupplierB;
exports.fetchSupplierC = fetchSupplierC;
const axios_1 = __importDefault(require("axios"));
const SUPPLIER_BASE_URL = "http://localhost:3000";
async function fetchSupplierA(city) {
    const response = await axios_1.default.get(`${SUPPLIER_BASE_URL}/supplierA/hotels`, {
        params: { city },
    });
    return response.data;
}
async function fetchSupplierB(city) {
    const response = await axios_1.default.get(`${SUPPLIER_BASE_URL}/supplierB/hotels`, {
        params: { city },
    });
    return response.data;
}
async function fetchSupplierC(city) {
    const response = await axios_1.default.get(`${SUPPLIER_BASE_URL}/supplierC/hotels`, {
        params: { city },
    });
    return response.data;
}
//# sourceMappingURL=supplierActivities.js.map