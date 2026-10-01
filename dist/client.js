"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemporalClient = getTemporalClient;
const client_1 = require("@temporalio/client");
async function getTemporalClient() {
    const connection = await client_1.Connection.connect({
        address: "localhost:7233",
    });
    return new client_1.Client({
        connection,
    });
}
//# sourceMappingURL=client.js.map