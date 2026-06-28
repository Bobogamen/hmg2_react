import api from "../axios";

/**
 * CREATE HOME
 */
export const addHome = async ({
    condominiumId,
    floor,
    name,
    firstName,
    middleName,
    lastName,
    phoneNumber,
    email
}) => {
    if (!condominiumId) {
        throw new Error("Missing condominium ID for home create");
    }

    const payload = {
        floor,
        name,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        email
    };

    const { data } = await api.post(
        `/management/condominiums/${condominiumId}/homes/create`,
        payload
    );

    return data;
};

/**
 * UPDATE HOME
 */
export const editHome = async ({
    condominiumId,
    homeId,
    floor,
    name,
    firstName,
    middleName,
    lastName,
    phoneNumber,
    email
}) => {
    if (!condominiumId) {
        throw new Error("Missing condominium ID for update");
    }

    if (!homeId) {
        throw new Error("Missing home ID for update");
    }

    const payload = {
        floor,
        name,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        email
    };

    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/homes/${homeId}`,
        payload
    );

    return data;
};

/**
 * UPDATE HOME ORDER
 */
export const saveHomeOrder = async ({
    condominiumId,
    homeIds
}) => {
    if (!condominiumId) {
        throw new Error("Missing condominium ID for home order update");
    }

    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/homes/order`,
        { homeIds }
    );

    return data;
};
