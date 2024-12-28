import React from "react";

const HomepageCard = ({ image, name, text }) => {
    return (
        <div className="card m-1 border border-1 border-black">
            <img src={image} className="card-image" alt={name} />
            <div className="card-body">
                <h4 className="fw-bold">{name}</h4>
                <h5>{text}</h5>
            </div>
        </div>
    );
}

export default HomepageCard;
