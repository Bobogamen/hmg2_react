import { createInstance } from "i18next";
import { installNativeValidationTranslations, nativeValidationMessage } from "./nativeValidation";
import en from "../locales/en/validation.json";
import bg from "../locales/bg/validation.json";

let i18n;
let cleanup;
const input = (attributes) => {
    const field = document.createElement("input");
    Object.entries(attributes).forEach(([key, value]) => field.setAttribute(key, value));
    document.body.appendChild(field);
    return field;
};

beforeEach(async () => {
    i18n = createInstance();
    await i18n.init({ lng: "bg", fallbackLng: "en", resources: { en: { validation: en }, bg: { validation: bg } } });
    cleanup = installNativeValidationTranslations(i18n);
});
afterEach(() => {
    cleanup();
    document.body.replaceChildren();
});

test("translates native minimum warnings for fee and repair fields, including dynamic modal fields", () => {
    const fee = input({ type: "number", min: "0", step: "0.01", value: "-5" });
    const budget = input({ type: "number", min: "1", step: "1", value: "-5" });
    expect(fee.checkValidity()).toBe(false);
    expect(fee.validationMessage).toBe("Въведете стойност, по-голяма или равна на 0.");
    expect(budget.checkValidity()).toBe(false);
    expect(budget.validationMessage).toBe("Въведете стойност, по-голяма или равна на 1.");
});

test("correcting an input clears custom validity and allows submission", () => {
    const field = input({ type: "number", min: "1", value: "-5" });
    field.checkValidity();
    field.value = "5";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    expect(field.validationMessage).toBe("");
    expect(field.checkValidity()).toBe(true);
});

test("refreshes the warning when language or constraints change", async () => {
    const field = input({ type: "number", max: "60", value: "61" });
    field.checkValidity();
    await i18n.changeLanguage("en");
    expect(field.validationMessage).toBe("Enter a value less than or equal to 60.");
    field.max = "70";
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(field.checkValidity()).toBe(true);
});

test("localizes required, email, URL, pattern and step validation", async () => {
    await i18n.changeLanguage("en");
    const cases = [
        [{ required: "" }, "This field is required"],
        [{ type: "email", value: "invalid" }, "Invalid email address"],
        [{ type: "url", value: "invalid" }, "Enter a valid web address."],
        [{ pattern: "[A-Z]+", value: "123" }, "Use the requested format."],
        [{ type: "number", step: "1", min: "1", value: "1.5" }, "Enter a whole number."],
        [{ type: "number", step: "0.01", min: "0", value: "1.005" }, "Enter a value in increments of 0.01, starting from 0."],
    ];
    cases.forEach(([attributes, message]) => {
        const field = input(attributes);
        expect(field.checkValidity()).toBe(false);
        expect(field.validationMessage).toBe(message);
    });
});

test("selecting a radio clears the translated required error for its group", () => {
    const first = input({ type: "radio", name: "choice", required: "" });
    const second = input({ type: "radio", name: "choice" });
    first.checkValidity();
    second.checked = true;
    second.dispatchEvent(new Event("change", { bubbles: true }));
    expect(first.checkValidity()).toBe(true);
});

test("respects a component's custom validation and cleans up owned messages", () => {
    const custom = input({ type: "text" });
    custom.setCustomValidity("Component message");
    custom.checkValidity();
    expect(custom.validationMessage).toBe("Component message");
    const field = input({ required: "" });
    field.checkValidity();
    cleanup();
    expect(field.validity.customError).toBe(false);
    expect(custom.validationMessage).toBe("Component message");
});

test("clears corrected values before Enter validation and handles disabled inputs", () => {
    const field = input({ type: "number", min: "1", value: "-5" });
    field.checkValidity();
    field.disabled = true;
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.disabled = false;
    field.value = "5";
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(field.checkValidity()).toBe(true);
});

test("provides translated text for bad input and length constraints", () => {
    const t = (key, args) => i18n.t(key, args);
    expect(nativeValidationMessage({ validity: { badInput: true } }, t)).toBe("Въведете валидно число.");
    expect(nativeValidationMessage({ validity: { tooShort: true }, minLength: 3 }, t)).toBe("Въведете поне 3 символа.");
    expect(nativeValidationMessage({ validity: { tooLong: true }, maxLength: 30 }, t)).toBe("Въведете най-много 30 символа.");
});
