import api from "../axios";

const base = (condominiumId, homeId) =>
    `/management/condominiums/${condominiumId}/homes/${homeId}/residents`;

/**
 * ADD RESIDENT
 */
export const addResident = async ({
    condominiumId,
    homeId,
    firstName,
    middleName,
    lastName,
    phoneNumber,
    email,
}) => {
    if (!condominiumId) {
        console.log("Missing condominium ID for addResident");
        throw new Error("Missing condominium ID");
    }
    if (!homeId) {
        console.log("Missing home ID for addResident");
        throw new Error("Missing home ID");
    }

    const payload = { firstName, middleName, lastName, phoneNumber, email };

    const { data } = await api.post(base(condominiumId, homeId), payload);
    return data;
};

/**
 * GET RESIDENTS
 */
export const getResidents = async ({ condominiumId, homeId }) => {
    if (!condominiumId) {
        console.log("Missing condominium ID for getResidents");
        throw new Error("Missing condominium ID");
    }
    if (!homeId) {
        console.log("Missing home ID for getResidents");
        throw new Error("Missing home ID");
    }

    const { data } = await api.get(base(condominiumId, homeId));
    return data;
};

/**
 * UPDATE RESIDENT
 */
export const editResident = async ({
    condominiumId,
    homeId,
    residentId,
    firstName,
    middleName,
    lastName,
    phoneNumber,
    email,
}) => {
    if (!condominiumId) {
        console.log("Missing condominium ID for editResident");
        throw new Error("Missing condominium ID");
    }
    if (!homeId) {
        console.log("Missing home ID for editResident");
        throw new Error("Missing home ID");
    }
    if (!residentId) {
        console.log("Missing resident ID for editResident");
        throw new Error("Missing resident ID");
    }

    const payload = { firstName, middleName, lastName, phoneNumber, email };

    const { data } = await api.put(
        `${base(condominiumId, homeId)}/${residentId}`,
        payload
    );
    return data;
};

/**
 * DELETE RESIDENT
 */
export const deleteResident = async ({ condominiumId, homeId, residentId }) => {
    if (!condominiumId || !homeId || !residentId) {
        throw new Error("Missing IDs");
    }

    await api.delete(`${base(condominiumId, homeId)}/${residentId}`);
};

/**
 * ACTIVATE RESIDENT
 */
export const activateResident = (
    condominiumId,
    homeId,
    residentId
) => {

    return api.put(
        `/management/condominiums/${condominiumId}/homes/${homeId}/residents/${residentId}/activate`
    );

};
