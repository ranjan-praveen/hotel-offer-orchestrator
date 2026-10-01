import axios from "axios";

export interface HotelOffer {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

const SUPPLIER_BASE_URL = "http://localhost:3000";

export async function fetchSupplierA(
  city: string
): Promise<HotelOffer[]> {
  const response = await axios.get<HotelOffer[]>(
    `${SUPPLIER_BASE_URL}/supplierA/hotels`,
    {
      params: { city },
    }
  );

  return response.data;
}

export async function fetchSupplierB(
  city: string
): Promise<HotelOffer[]> {
  const response = await axios.get<HotelOffer[]>(
    `${SUPPLIER_BASE_URL}/supplierB/hotels`,
    {
      params: { city },
    }
  );

  return response.data;
}

export async function fetchSupplierC(
  city: string
): Promise<HotelOffer[]> {
  const response = await axios.get<HotelOffer[]>(
    `${SUPPLIER_BASE_URL}/supplierC/hotels`,
    {
      params: { city },
    }
  );

  return response.data;
}