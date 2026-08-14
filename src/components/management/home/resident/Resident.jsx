import React from "react";
import { useTranslation } from "react-i18next";
import renderFieldErrors from "../../../../utils/renderFieldErrors";

const Resident = ({
    data,
    errors = {},
    onChange,
    showTitle = true,
    showSubmit = false,
    titleKey = "home:resident",
    onSubmit,
    isEditing = false
}) => {

    const { t } = useTranslation();

    const handleSubmit = (e) => {

        e.preventDefault();
        onSubmit?.(data);
    };

    const Wrapper = showSubmit || onSubmit ? "form" : "div";

    return (
        <Wrapper
            className={`registrationForm mt-0 ${showSubmit ? "bg-success" : "bg-danger"} bg-opacity-50 border-3 border-dark`}
            onSubmit={Wrapper === "form" ? handleSubmit : undefined}
        >

            {showTitle && (
                <h4 className="fw-bold mb-2 text-decoration-underline">
                    {t(titleKey)}
                </h4>
            )}

            {[
                { name: "firstName", labelKey: "form:firstName" },
                { name: "middleName", labelKey: "form:middleName" },
                { name: "lastName", labelKey: "form:lastName" },
                { name: "email", labelKey: "email" },
                { name: "phoneNumber", labelKey: "form:telephone", className: "mb-3" }

            ].map(({ name, labelKey, className }) => (

                <div
                    key={name}
                    className={className || ""}
                >

                    <label htmlFor={name}>
                        {t(labelKey)}
                    </label>

                    <input
                        id={name}
                        name={name}
                        type="text"
                        value={data?.[name] || ""}
                        placeholder={t(labelKey)}
                        onChange={onChange}
                    />
                    {renderFieldErrors(errors, name, t)}
                </div>
            ))}

            {showSubmit && (
                <button
                    type="submit"
                    className="authentication-button mb-1 m-auto"
                >
                    {t(isEditing ? "save" : "add")}
                </button>
            )}
        </Wrapper>
    );
};


export default Resident;