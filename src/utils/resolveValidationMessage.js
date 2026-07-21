const parseCode = (code, args) => {
    if (!code) {
        return {
            code: "",
            args: {}
        };
    }

    // Backward compatibility with old format:
    // lengthBetween6and20
    const lengthMatch = code.match(/^lengthBetween(\d+)and(\d+)$/);

    if (lengthMatch) {
        return {
            code: "lengthBetween",
            args: {
                min: Number(lengthMatch[1]),
                max: Number(lengthMatch[2])
            }
        };
    }

    return {
        code,
        args: args || {}
    };
};

const resolveValidationMessage = (error, t) => {

    if (!error?.code) {
        return "";
    }

    const { code, args } = parseCode(
        error.code,
        error.args
    );

    const translated = t(
        `validation:${code}`,
        args
    );

    return translated !== `validation:${code}`
        ? translated
        : code;
};

export default resolveValidationMessage;