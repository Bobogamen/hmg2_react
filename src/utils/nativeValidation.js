export const nativeValidationMessage = (field, t) => {
    const validity = field.validity;
    if (validity.valueMissing) return t("validation:required");
    if (validity.badInput) return t("validation:native.invalidNumber");
    if (validity.typeMismatch) {
        return t(field.type === "email" ? "validation:invalidEmail" : "validation:native.invalidUrl");
    }
    if (validity.rangeUnderflow) return t("validation:native.minimum", { min: field.min });
    if (validity.rangeOverflow) return t("validation:native.maximum", { max: field.max });
    if (validity.stepMismatch) {
        if (field.type === "number" || field.type === "range") {
            const step = field.getAttribute("step") || "1";
            const base = field.getAttribute("min") || field.getAttribute("value") || "0";
            if (Number(step) === 1 && Number.isInteger(Number(base))) {
                return t("validation:native.wholeNumber");
            }
            return t("validation:native.numberStep", { step, base });
        }
        return t("validation:native.step");
    }
    if (validity.tooShort) return t("validation:native.minLength", { min: field.minLength });
    if (validity.tooLong) return t("validation:native.maxLength", { max: field.maxLength });
    if (validity.patternMismatch) return t("validation:native.pattern");
    return validity.valid ? "" : t("validation:native.invalid");
};

// Native invalid events do not bubble. Capture them on the document so this
// also covers dynamically mounted forms and React Bootstrap modal portals.
export const installNativeValidationTranslations = (i18n, root = document) => {
    const messages = new Map();
    const translate = (key, options) => i18n.t(key, options);

    const localize = (field) => {
        if (!field?.matches?.("input, select, textarea") || !field.willValidate) return;
        const previous = messages.get(field);
        if (previous && field.validationMessage === previous) field.setCustomValidity("");
        messages.delete(field);
        // Leave custom validation supplied by individual components in control.
        if (field.validity.customError) return;
        const message = nativeValidationMessage(field, translate);
        if (message) {
            field.setCustomValidity(message);
            messages.set(field, message);
        }
    };

    const refresh = () => {
        for (const [field, message] of [...messages]) {
            if (!field.isConnected) {
                if (field.validationMessage === message) field.setCustomValidity("");
                messages.delete(field);
            } else {
                localize(field);
            }
        }
    };
    const onInvalid = (event) => localize(event.target);
    // Refresh before the browser's submit validation, including Enter submits.
    const onKeyDown = (event) => { if (event.key === "Enter") refresh(); };
    root.addEventListener("invalid", onInvalid, true);
    root.addEventListener("input", refresh, true);
    root.addEventListener("change", refresh, true);
    root.addEventListener("click", refresh, true);
    root.addEventListener("keydown", onKeyDown, true);
    i18n.on("languageChanged", refresh);

    return () => {
        root.removeEventListener("invalid", onInvalid, true);
        root.removeEventListener("input", refresh, true);
        root.removeEventListener("change", refresh, true);
        root.removeEventListener("click", refresh, true);
        root.removeEventListener("keydown", onKeyDown, true);
        i18n.off("languageChanged", refresh);
        for (const [field, message] of messages) {
            if (field.validationMessage === message) field.setCustomValidity("");
        }
        messages.clear();
    };
};
