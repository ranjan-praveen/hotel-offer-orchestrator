import axios from "axios";
import type { Hotel } from "../suppliers/mockSuppliers.js";

export async function getSupplierAHotels(): Promise<Hotel[]> {
  const response = await axios.get<Hotel[]>(
    "http://localhost:3000/supplierA/hotels"
  );

  return response.data;
}