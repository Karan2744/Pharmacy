import { addPincodeapi } from "../services/pincodeService";

export const handleAddPincode = async ({
    pincode,
    city,
    state,
    deliveryDays,
    note,
}) => {
    return await addPincodeapi({
        pincode,
        city,
        state,
        deliveryDays,
        note,
    });
};