import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReceiptOption = ({ checked, onChange, translationKey, id }) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const label = (key) => t(`${translationKey}.${key}`);

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-3">
        <input
          className="w-auto m-0"
          id={id}
          name="createReceipt"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label className="" htmlFor={id}>
          {label("createReceipt")}
        </label>
        <button
          type="button"
          className="btn btn-link p-0 text-dark"
          onClick={() => setShowInfo(true)}
          aria-label={label("receiptInfo.open")}
          title={label("receiptInfo.open")}
        >
          <Info size={20} color="blue" />
        </button>
      </div>

      <Modal
        show={showInfo}
        onHide={() => setShowInfo(false)}
        centered
        aria-labelledby={`${id}-info-title`}
      >
        <Modal.Header closeButton>
          <Modal.Title id={`${id}-info-title`} className="fw-bold">
            {label("receiptInfo.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{label("receiptInfo.description")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfo(false)}>
            {t("common:close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReceiptOption;
