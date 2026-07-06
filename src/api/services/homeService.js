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
        console.log("Missing condominium ID for home create");
        throw new Error();
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
        console.log("Missing condominium ID for update");
        throw new Error();
    }

    if (!homeId) {
        console.log("Missing home ID for update");
        throw new Error();
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
 * GET HOME
 */
export const getHome = async ({ condominiumId, homeId }) => {

    if (!condominiumId) {
        console.log("Missing condominium ID for getHome");
        throw new Error();
    }

    if (!homeId) {
        console.log("Missing home ID for getHome");
        throw new Error();
    }

    const { data } = await api.get(
        `/management/condominiums/${condominiumId}/homes/${homeId}`
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
        console.log("Missing condominium ID for home order update");
        throw new Error();
    }

    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/homes/order`,
        { homeIds }
    );

    return data;
};
