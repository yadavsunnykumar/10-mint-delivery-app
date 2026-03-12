import DeliveryPartner from "../models/deliveryPartner.model.js";

export const findNearestRider = async (warehouseLocation) => {
  const riders = await DeliveryPartner.find({ is_available: true });

  if (riders.length === 0) return null;

  let nearest = null;
  let shortestDistance = Infinity;

  riders.forEach((rider) => {
    const d = Math.sqrt(
      Math.pow(rider.current_location.lat - warehouseLocation.lat, 2) +
      Math.pow(rider.current_location.lng - warehouseLocation.lng, 2),
    );

    if (d < shortestDistance) {
      shortestDistance = d;
      nearest = rider;
    }
  });

  return nearest;
};
