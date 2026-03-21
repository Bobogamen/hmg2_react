import resolveValidationMessage from "./resolveValidationMessage";

const renderFieldErrors = (errors, field, t) =>
  errors[field]?.map((error, index) => (
    <small
      key={index}
      className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content"
    >
      {resolveValidationMessage(error, t)}
    </small>
  ));

export default renderFieldErrors;