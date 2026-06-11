import api from "../axios";

const buildHomeForm = ({ floor, name }) => {
    const form = new URLSearchParams();

    form.append("floor", floor);
    form.append("name", name);

    return form;
};

export const addHome = async ({ condominiumId, floor, name }) => {
    if (!condominiumId) {
        throw new Error("Missing condominium ID for home create");
    }

    const { data } = await api.post(
        `/management/condominiums/${condominiumId}/homes/create`,
        buildHomeForm({ floor, name }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return data;
};

export const editHome = async ({ condominiumId, homeId, floor, name }) => {
    if (!condominiumId) {
        throw new Error("Missing condominium ID for home update");
    }

    if (!homeId) {
        throw new Error("Missing home ID for update");
    }

    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/homes/${homeId}`,
        buildHomeForm({ floor, name }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return data;
};

