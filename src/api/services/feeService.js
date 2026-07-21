import api from "../axios";

/**
 * CREATE FEE
 */
export const addFee = async ({
      condominiumId,
      name,
      value
}) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for fee create");
            throw new Error();
      }
      const payload = {
            name,
            value
      };
      const { data } = await api.post(
            `/management/condominiums/${condominiumId}/fees`,
            payload
      );
      return data;
};

/**
 * UPDATE FEE
 */
export const editFee = async ({
      condominiumId,
      feeId,
      name,
      value
}) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for fee update");
            throw new Error();
      }
      if (!feeId) {
            console.log("Missing fee ID for update");
            throw new Error();
      }
      const payload = {
            name,
            value
      };
      const { data } = await api.put(
            `/management/condominiums/${condominiumId}/fees/${feeId}`,
            payload
      );
      return data;
};

/**
 * GET FEE
 */
export const getFee = async ({
      condominiumId,
      feeId
}) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for getFee");
            throw new Error();
      }
      if (!feeId) {
            console.log("Missing fee ID for getFee");
            throw new Error();
      }
      const { data } = await api.get(
            `/management/condominiums/${condominiumId}/fees/${feeId}`
      );
      return data;
};

/**
 * GET FEES
 */
export const getFees = async (condominiumId) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for getFees");
            throw new Error();
      }
      const { data } = await api.get(
            `/management/condominiums/${condominiumId}/fees`
      );
      return data;
};

/**
 * DELETE FEE
 */
export const deleteFee = async ({
      condominiumId,
      feeId
}) => {
      if (!condominiumId || !feeId) {
            throw new Error("Missing IDs");
      }
      await api.delete(
            `/management/condominiums/${condominiumId}/fees/${feeId}`
      );
};