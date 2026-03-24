import DeliveryPartner from "../models/deliveryPartner.model.js";
import { haversineKm } from "./distance.js";

export const findNearestRider = async (warehouseLocation) => {
  const riders = await DeliveryPartner.find({ is_available: true });

  if (riders.length === 0) return null;

  let nearest = null;
  let shortestDistance = Infinity;

  riders.forEach((rider) => {
    const d = haversineKm(
      rider.current_location.lat,
      rider.current_location.lng,
      warehouseLocation.lat,
      warehouseLocation.lng,
    );

    if (d < shortestDistance) {
      shortestDistance = d;
      nearest = rider;
    }
  });

  return nearest;
};
