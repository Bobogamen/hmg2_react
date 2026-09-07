import { useEffect } from "react";
import i18n from "../locales/i18n";
import { installNativeValidationTranslations } from "../utils/nativeValidation";

const NativeValidation = () => {
    useEffect(() => installNativeValidationTranslations(i18n), []);
    return null;
};

export default NativeValidation;
