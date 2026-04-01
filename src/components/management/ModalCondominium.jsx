import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { addCondominium, editCondominium } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import { toast } from "react-toastify";
import formatDate from "../../utils/formatDate";
import renderFieldErrors from "../../utils/renderFieldErrors";

// ✅ moved outside → stable reference
const initialState = {
  name: "",
  city: "",
  address: "",
  size: "",
  backgroundColor: "",
  startPeriod: ""
};

const ModalCondominium = ({ show, handleClose, inputData }) => {
  const { t, i18n } = useTranslation();
  const { setIsLoading } = useLoading();

  const [condominiumData, setCondominiumData] = useState(initialState);
  const [condominiumErrors, setCondominiumError] = useState({});

  const isEditing = !!inputData?.id;

  // ✅ FIXED: no infinite loop
  useEffect(() => {

    if (inputData?.id) {
      setCondominiumData({
        name: inputData.name || "",
        city: inputData.city || "",
        address: inputData.address || "",
        size: inputData.size || "",
        backgroundColor: inputData.backgroundColor || "",
        startPeriod: inputData.startPeriod || ""
      });
    } else {
      setCondominiumData(initialState);
    }

    // also reset errors when switching mode
    setCondominiumError({});

    // 👇 disable ONLY this warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCondominiumData((prev) => ({
      ...prev,
      [name]: value
    }));

    // clear field error on change
    if (condominiumErrors[name]) {
      setCondominiumError((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const resetForm = () => {
    setCondominiumData(initialState);
    setCondominiumError({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await editCondominium({
          id: inputData.id,
          ...condominiumData
        });
      } else {
        await addCondominium(condominiumData);
      }

      resetForm();
      handleClose();

      toast.success(
        isEditing
          ? t("Condominium successfully updated")
          : t("Condominium successfully created")
      );

    } catch (error) {

      if (error.isValidationError) {
        setCondominiumError(error.validationErrors || error.errors || {});
        return;
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {isEditing
            ? inputData.name
            : `${t("Create")} ${t("condominium")}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex justify-content-center">
          <div>
            <form className="registrationForm" onSubmit={handleSubmit}>

              {/* Name */}
              <div>
                <label>{t("Name")}</label>
                <input
                  type="text"
                  name="name"
                  value={condominiumData.name}
                  onChange={handleChange}
                  placeholder={t("placeholder_name_condominiums")}
                />
                {renderFieldErrors(condominiumErrors, "name", t)}
              </div>

              {/* City */}
              <div>
                <label>{t("City")}</label>
                <input
                  type="text"
                  name="city"
                  value={condominiumData.city}
                  onChange={handleChange}
                  placeholder={t("placeholder_city")}
                />
                {renderFieldErrors(condominiumErrors, "city", t)}
              </div>

              {/* Address */}
              <div>
                <label>{t("Address")}</label>
                <input
                  type="text"
                  name="address"
                  value={condominiumData.address}
                  onChange={handleChange}
                  placeholder={t("placeholder_address")}
                />
                {renderFieldErrors(condominiumErrors, "address", t)}
              </div>

              {/* Size */}
              <div>
                <label>{`${t("Number")} ${t("apartments")}/${t("homes")}`}</label>
                <input
                  type="number"
                  name="size"
                  value={condominiumData.size}
                  onChange={handleChange}
                  placeholder="23"
                />
                {renderFieldErrors(condominiumErrors, "size", t)}
              </div>

              {/* Start Period */}
              <div>
                <label>{`${t("Select")} ${t("start date")}`}</label>
                {isEditing ? (
                  <p className="fw-bold text-danger border border-2 border-dark rounded px-1 mt-1">
                    {formatDate(condominiumData.startPeriod, i18n.language)}
                  </p>
                ) : (
                  <>
                    <input
                      type="date"
                      name="startPeriod"
                      value={condominiumData.startPeriod}
                      onChange={handleChange}
                    />
                    {renderFieldErrors(condominiumErrors, "startPeriod", t)}
                  </>
                )}
              </div>

              {/* Background Color */}
              <div>
                <label>{`${t("Select")} ${t("color")} ${t("for")} ${t("background")}`}</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={condominiumData.backgroundColor}
                  onChange={handleChange}
                  style={{ width: "3em", margin: "auto" }}
                />
                {renderFieldErrors(condominiumErrors, "backgroundColor", t)}
              </div>

              <button type="submit" className="authentication-button mt-3">
                {isEditing ? t("Save") : t("Add")}
              </button>

            </form>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("Close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCondominium;