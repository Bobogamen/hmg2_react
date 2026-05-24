const parseCode = (code) => {
  if (!code) return { code: "", args: {} };

  // lengthBetween6and20 → extract min/max
  const lengthMatch = code.match(/^lengthBetween(\d+)and(\d+)$/);

  if (lengthMatch) {
    return {
      code: "lengthBetween",
      args: {
        min: lengthMatch[1],
        max: lengthMatch[2],
      },
    };
  }

  return {
    code,
    args: {},
  };
};

const resolveValidationMessage = (error, t) => {
  const rawCode = error?.code;
  const rawArgs = error?.args || {};

  if (!rawCode) return "";

  // transform backend code into base key + args
  const parsed = parseCode(rawCode);

  // merge args (parsed takes priority for computed values)
  const args = {
    ...rawArgs,
    ...parsed.args,
  };

  const translated = t(`validation:${parsed.code}`, args);

  // if translation exists, use it
  if (translated && translated !== `validation:${parsed.code}`) {
    return translated;
  }

  // fallback
  return parsed.code;
};

export default resolveValidationMessage;