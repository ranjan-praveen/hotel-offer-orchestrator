"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerWorkflow = offerWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { fetchSupplierA, fetchSupplierB } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: "10 seconds",
});
const { saveHotels } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: "10 seconds",
});
async function offerWorkflow(city) {
    const [supplierA, supplierB] = await Promise.all([
        fetchSupplierA(city),
        fetchSupplierB(city),
    ]);
    const hotels = [...supplierA, ...supplierB];
    const bestHotels = new Map();
    for (const hotel of hotels) {
        const existing = bestHotels.get(hotel.name);
        if (!existing || hotel.price < existing.price) {
            bestHotels.set(hotel.name, hotel);
        }
    }
    const result = Array.from(bestHotels.values());
    await saveHotels(city, result);
    return result;
}
//# sourceMappingURL=offerWorkflow.js.map