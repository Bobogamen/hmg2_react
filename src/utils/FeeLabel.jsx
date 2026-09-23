import React from "react";

export default function FeeLabel({ fee, fundLabel }) {
  return fee.fund && fee.fundName ? (
    <>
      <span style={{ display: "block", fontStyle: "italic" }}>{fundLabel} &quot;{fee.fundName}&quot;</span>
      <small style={{ display: "block" }}>{fee.name}</small>
    </>
  ) : <>{fee.name}</>;
}
