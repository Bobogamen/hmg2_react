import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";
import { addCondominium, deleteCondominium, editCondominium, getCondominiumStartDateYear } from "../../api/services/managementService";
import { useLoading } from "../../loader/LoadingContext";
import { Bounce, toast } from "react-toastify";
import renderFieldErrors from "../../utils/renderFieldErrors";
import '../management/Management.css';
import { useUser } from "../../user/UserContext";
import { useNavigate } from "react-router-dom";

// ✅ moved outside → stable reference
const initialState = {
  name: "",
  city: "",
  address: "",
  size: "",
  backgroundColor: "#909090",
  startDate: ""
};

const ModalCondominium = ({ show, handleClose, inputData }) => {
  const { updateUser } = useUser();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const [condominiumData, setCondominiumData] = useState(initialState);
  const [condominiumErrors, setCondominiumError] = useState({});
  const [minYear, setMinYear] = useState(null);

  const [openInfo, setOpenInfo] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const infoRef = useRef(null);
  const warningRef = useRef(null);

  const isEditing = !!inputData?.id;

  useEffect(() => {

    const isEditing = !!inputData?.id;

    // =========================
    // LOAD DATA (EDIT / CREATE)
    // =========================
    if (show) {

      if (isEditing) {
        const parsedDate = inputData.startDate
          ? new Date(inputData.startDate)
          : null;

        setCondominiumData({
          name: inputData.name || "",
          city: inputData.city || "",
          address: inputData.address || "",
          size: inputData.size || "",
          backgroundColor: inputData.backgroundColor || "",
          startDate: parsedDate,

          // 🔥 IMPORTANT
          startMonth: parsedDate
            ? [
              "jan", "feb", "mar", "apr", "may", "jun",
              "jul", "aug", "sep", "oct", "nov", "dec"
            ][parsedDate.getMonth()]
            : "",

          startYear: parsedDate
            ? parsedDate.getFullYear()
            : ""
        });
      } else {
        setCondominiumData(initialState);
        loadMinYear();
      }

      setCondominiumError({});
    }
    // 👇 disable ONLY this warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, inputData?.id]);

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

  const loadMinYear = async () => {
    try {
      const year = await getCondominiumStartDateYear();

      setMinYear(year);

    } catch (error) {

      const serverMessage =
        error?.response?.data?.message;

      if (serverMessage) {
        toast.error(i18n.t(`server:${serverMessage}`), {
          transition: Bounce,
        });
      } else {
        toast.error(i18n.t("server:error"), {
          transition: Bounce,
        });
      }

      setMinYear(null);
    }
  };

  const buildStartDate = () => {
    if (!condominiumData.startMonth || !condominiumData.startYear) {
      return null;
    }

    const month = monthMap[condominiumData.startMonth];
    const year = condominiumData.startYear;

    return `${year}-${month}-01`;
  };

  const monthMap = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: condominiumData.name,
        city: condominiumData.city,
        address: condominiumData.address,
        size: condominiumData.size,
        backgroundColor: condominiumData.backgroundColor,
        startDate: buildStartDate()
      };

      if (isEditing) {
        await editCondominium({
          id: inputData.id,
          ...payload
        });
      } else {
        await addCondominium(payload);
      }

      resetForm();
      handleClose();
      updateUser();

      toast.success(
        isEditing ? t("condo:updated") : t("condo:created")
      );
    } catch (error) {


      if (error.isValidationError) {

        setCondominiumError(
          error.validationErrors || error.errors || {}
        );
      }

      if (error.response.data.errors === "maxLimitReached") {
        toast.warning(t("condo:maxLimitReached"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await deleteCondominium(inputData.id);

      toast.error(t("condo:deleted"));

      handleClose();
      updateUser();
      navigate("/management");

    } catch (error) {
      toast.error(t("server:error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <div className="fw-bold fs-5">
              {isEditing ? inputData.name : `${t("create")} ${t("condo:title")}`}
            </div>

            {isEditing && (
              <div className="text-muted fs-6">
                {inputData.city}, {inputData.address}
              </div>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            <form className="registrationForm" onSubmit={handleSubmit}>

              {/* Name */}
              <div>
                <label>{t("name")}</label>
                <input
                  type="text"
                  name="name"
                  value={condominiumData.name}
                  onChange={handleChange}
                  placeholder={t("condo:namePlaceholder")}
                />
                {renderFieldErrors(condominiumErrors, "name", t)}
              </div>

              {/* City */}
              <div>
                <label>{t("condo:city")}</label>
                <input
                  type="text"
                  name="city"
                  value={condominiumData.city}
                  onChange={handleChange}
                  placeholder={t("condo:cityPlaceholder")}
                />
                {renderFieldErrors(condominiumErrors, "city", t)}
              </div>

              {/* Address */}
              <div>
                <label>{t("condo:address")}</label>
                <input
                  type="text"
                  name="address"
                  value={condominiumData.address}
                  onChange={handleChange}
                  placeholder={t("condo:addressPlaceholder")}
                />
                {renderFieldErrors(condominiumErrors, "address", t)}
              </div>

              {/* Size */}
              <div>
                <label>{`${t("number")} ${t("home:apartments")}/${t("home:homes")}`}</label>
                <input
                  type="number"
                  name="size"
                  step="1"
                  min={isEditing ? (inputData?.homes?.length || 1) : 1}
                  value={condominiumData.size}
                  onChange={handleChange}
                  placeholder="23"
                />
                {renderFieldErrors(condominiumErrors, "size", t)}
              </div>

              {/* Start Date */}
              <div>
                <label>
                  {`${t("select")} ${t("condo:startDate")}`}

                  {/* WARNING ICON */}
                  <span
                    ref={warningRef}
                    style={{ cursor: "pointer", marginLeft: 6 }}
                    onClick={() => {
                      setOpenWarning((v) => !v);
                      setOpenInfo(false);
                    }}
                  >
                    ⚠️
                  </span>
                  {/* INFO ICON */}
                  <span
                    ref={infoRef}
                    style={{ cursor: "pointer", marginLeft: 8 }}
                    onClick={() => {
                      setOpenInfo((v) => !v);
                      setOpenWarning(false);
                    }}
                  >
                    ℹ️
                  </span>
                </label>

                {openWarning && (
                  <div className="border border-3 border-warning rounded p-1 bg-warning-subtle mt-1">
                    <Trans i18nKey="condo:startDateWarning" />
                  </div>
                )}

                {openInfo && (
                  <div className="border border-3 border-info rounded p-1 bg-info-subtle mt-1">
                    <Trans i18nKey="condo:startDateInfo" />
                  </div>
                )}

                {isEditing ? (
                  <p className="fw-bold text-danger border border-2 border-dark rounded px-1 mt-1">
                    {condominiumData.startDate
                      ? condominiumData.startDate.toLocaleDateString(i18n.language, {
                        month: "long",
                        year: "numeric"
                      })
                      : ""}
                  </p>
                ) : (
                  <>
                    {/* Start Date */}
                    <div>
                      {isEditing ? (
                        <p className="fw-bold text-danger border border-2 border-dark rounded px-1 mt-1">
                          {condominiumData.startMonth && condominiumData.startYear
                            ? `${t(`condo:months.${condominiumData.startMonth}`)} ${condominiumData.startYear}`
                            : ""}
                        </p>
                      ) : (
                        <>
                          <div className="d-flex gap-2 mt-1 justify-content-center">
                            {/* Month */}
                            <select
                              className="width-fit-content"
                              value={condominiumData.startMonth}
                              onChange={(e) =>
                                setCondominiumData((prev) => ({
                                  ...prev,
                                  startMonth: e.target.value
                                }))
                              }
                            >
                              <option value="">{t("month")}</option>

                              {[
                                "jan", "feb", "mar", "apr", "may", "jun",
                                "jul", "aug", "sep", "oct", "nov", "dec"
                              ].map((key, index) => {
                                const current = new Date();
                                const currentYear = current.getFullYear();
                                const currentMonth = current.getMonth();
                                const selectedYear = Number(condominiumData.startYear);

                                // 🔥 only block future months for CURRENT year
                                const isFutureMonth =
                                  selectedYear === currentYear &&
                                  index > currentMonth;

                                // IMPORTANT: ALWAYS show selected value
                                const isSelected = condominiumData.startMonth === key;

                                if (isFutureMonth && !isSelected) {
                                  return null;
                                }

                                return (
                                  <option key={key} value={key}>
                                    {t(`condo:months.${key}`)}
                                  </option>
                                );
                              })}
                            </select>

                            {/* Year */}
                            <select
                              className="width-fit-content"
                              value={condominiumData.startYear}
                              onChange={(e) => {
                                const newYear = Number(e.target.value);
                                const current = new Date();

                                const monthIndex = [
                                  "jan", "feb", "mar", "apr", "may", "jun",
                                  "jul", "aug", "sep", "oct", "nov", "dec"
                                ].indexOf(condominiumData.startMonth);

                                const shouldResetMonth =
                                  newYear === current.getFullYear() &&
                                  monthIndex > current.getMonth();

                                setCondominiumData((prev) => ({
                                  ...prev,
                                  startYear: newYear,
                                  startMonth: shouldResetMonth ? "" : prev.startMonth
                                }));
                              }}
                            >
                              <option value="">{t("year")}</option>

                              {minYear &&
                                Array.from(
                                  { length: new Date().getFullYear() - minYear + 1 },
                                  (_, i) => minYear + i
                                )
                                  .filter((year) => year <= new Date().getFullYear())
                                  .map((year) => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  ))}
                            </select>
                          </div>
                          {renderFieldErrors(condominiumErrors, "startDate", t)}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Background Color */}
              <div>
                <label>{`${t("select")} ${t("form:color")} ${t("for")} ${t("form:background")}`}</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={condominiumData.backgroundColor}
                  onChange={handleChange}
                  style={{ width: "3em", margin: "auto" }}
                />
                {renderFieldErrors(condominiumErrors, "backgroundColor", t)}
              </div>
              <hr className="mt-0 w-100 border-1"/>
              <button type="submit" className="authentication-button">
                {isEditing ? t("save") : t("add")}
              </button>

            </form>
          </div>
        </Modal.Body>
        <Modal.Footer className={isEditing ? "justify-content-between" : ""}>
          {isEditing && (
            <Button variant="danger" size="sm"
              onClick={() => setShowDeleteConfirm(true)}>
              {t("delete")}
            </Button>
          )}

          <Button variant="secondary" onClick={handleClose}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
        className="bg-dark">
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">
            {t("condo:confirmDeleteTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h5 className="fw-bold mb-1">
              {inputData?.name}
            </h5>
            <div className="text-muted mb-3">
              {inputData?.city}, {inputData?.address}
            </div>
            <div className="border border-danger rounded p-2 bg-danger-subtle">
              <div className="fw-bold text-danger mb-2">
                ⚠️ {t("warning")}
              </div>
              <div>
                <Trans i18nKey="condo:deleteWarning" />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}>
            {t("cancel")}
          </Button>

          <Button variant="danger"
            onClick={handleDelete}>
            {t("delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalCondominium;