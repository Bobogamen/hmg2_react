import resolveValidationMessage from "./resolveValidationMessage";

const renderFieldErrors = (errors, field, t) => {
  const fieldErrors = errors?.[field]; // 🔥 safe access

  if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-column align-items-center w-100">
      {fieldErrors.map((error, index) => (
        <small
          key={index}
          className="bg-danger text-light rounded mt-1 px-2"
        >
          {resolveValidationMessage(error, t)}
        </small>
      ))}
    </div>
  );
};

export default renderFieldErrors;