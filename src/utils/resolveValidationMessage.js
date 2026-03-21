const resolveValidationMessage = (errorKey, t) => {
  // lengthBetween6and20 → extract 6 and 20
  const lengthMatch = errorKey.match(/^lengthBetween(\d+)and(\d+)$/);

  if (lengthMatch) {
    const [, min, max] = lengthMatch;

    return t("validation:lengthBetween", {
      min,
      max,
    });
  }

  // default (notBlank, invalidEmail, etc.)
  return t(`validation:${errorKey}`);
};

export default resolveValidationMessage;