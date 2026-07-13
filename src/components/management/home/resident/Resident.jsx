import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import renderFieldErrors from "../../../../utils/renderFieldErrors";

const initialState = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: ""
};

const Resident = ({
    data,
    errors = {},
    onChange,
    onSubmit,
    showTitle = true,
    showSubmit = false,
    titleKey = "home:resident"
} = {}) => {
    const [localData, setLocalData] = useState(initialState);
    const residentData = data || localData;
    const Wrapper = onSubmit || showSubmit ? "form" : "div";

    const { t } = useTranslation();

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
            return;
        }

        const { name, value } = e.target;

        setLocalData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <Wrapper className="registrationForm mt-0 bg-danger bg-opacity-50 border-3 border-dark" onSubmit={onSubmit}>
                {showTitle && <h4 className="fw-bold mb-0">{t(titleKey)}</h4>}
                <div>
                    <label>{t("form:firstName")}</label>
                    <input
                        type="text"
                        placeholder={t("form:firstName")}
                        name="firstName"
                        id="firstName"
                        value={residentData.firstName || ""}
                        onChange={handleChange}
                    />
                    {renderFieldErrors(errors, "firstName", t)}
                </div>
                <div>
                    <label>{t("form:middleName")}</label>
                    <input
                        type="text"
                        placeholder={t("form:middleName")}
                        name="middleName"
                        id="middleName"
                        value={residentData.middleName || ""}
                        onChange={handleChange}
                    />
                    {renderFieldErrors(errors, "middleName", t)}
                </div>
                <div>
                    <label>{t("form:lastName")}</label>
                    <input
                        type="text"
                        placeholder={t("form:lastName")}
                        name="lastName"
                        id="lastName"
                        value={residentData.lastName || ""}
                        onChange={handleChange}
                    />
                    {renderFieldErrors(errors, "lastName", t)}
                </div>
                <div>
                    <label>{t("email")}</label>
                    <input
                        type="text"
                        placeholder={t("email")}
                        name="email"
                        id="email"
                        value={residentData.email || ""}
                        onChange={handleChange}
                    />
                    {renderFieldErrors(errors, "email", t)}
                </div>
                <div className="mb-2">
                    <label>{t("form:telephone")}</label>
                    <input
                        type="text"
                        placeholder={t("form:telephone")}
                        name="phoneNumber"
                        id="phoneNumber"
                        value={residentData.phoneNumber || ""}
                        onChange={handleChange}
                    />
                    {renderFieldErrors(errors, "phoneNumber", t)}
                </div>
                {showSubmit && (
                    <div className="modal-footer border-0 justify-content-center">
                        <button type="submit" id="modal-button" className="button mx-3">
                            {t("add")}
                        </button>
                    </div>
                )}
            </Wrapper>
        </div>
    )
}

export default Resident;
