import resolveValidationMessage from "./resolveValidationMessage";

const renderFieldErrors = (errors, field, t) => {
  return (
    <div className="text-center">
      {errors[field]?.map((error, index) => (
        <small key={index} className="d-inline-block bg-danger text-light rounded mt-1 px-1 width-fit-content">
          {resolveValidationMessage(error, t)}
        </small>
      ))}
    </div>
  );
};

export default renderFieldErrors;