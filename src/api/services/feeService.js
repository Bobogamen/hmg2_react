import api from "../axios";

/**
 * VALIDATE FEE
 */
export const validateFee = async ({
      condominiumId,
      name,
      value,
      monthly,
      primary,
      fund,
      feeId,
      homeIds
}) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for fee create");
            throw new Error();
      }
      const payload = {
            name,
            value,
            monthly,
            primary,
            fund,
            feeId,
            homeIds
      };
      const { data } = await api.post(
            `/management/condominiums/${condominiumId}/fees/validation`,
            payload
      );
      return data;
};

/**
 * CREATE FEE
 */
export const addFee = async ({
      condominiumId,
      name,
      value,
      monthly,
      primary,
      fund,
      homeIds
}) => {
      if (!condominiumId) {
            console.log("Missing condominium ID for fee create");
            throw new Error();
      }
      const payload = {
            name,
            value,
            monthly,
            primary,
            fund,
            homeIds
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
      value,
      monthly,
      primary,
      fund,
      homeIds
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
            value,
            monthly,
            primary,
            fund,
            homeIds
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
 * GET FEES ASSIGNED TO A HOME
 */
export const getHomeFees = async ({ condominiumId, homeId }) => {
      if (!condominiumId || !homeId) {
            throw new Error("Missing IDs");
      }

      const { data } = await api.get(
            `/management/condominiums/${condominiumId}/fees/home/${homeId}`
      );

      return data;
};

export const updateHomeFeeTimes = async ({ condominiumId, homeId, homeFeeId, times }) => {
      const { data } = await api.put(
            `/management/condominiums/${condominiumId}/fees/home/${homeId}/${homeFeeId}/times`,
            { times }
      );
      return data;
};
