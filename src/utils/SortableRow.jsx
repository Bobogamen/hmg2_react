import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";

import homeIcon from "../../src/assets/images/app/home.png";
import addResident from "../../src/assets/images/app/add_resident.png";

const SortableRow = ({
    home,
    condominiumId,
    onOpenResidentModal
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: home.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <td>{home.floor}</td>
            <td>{home.name}</td>
            <td>{`${home.owner.firstName} ${home.owner.lastName}`}</td>
            <td>{home.residentsSize}</td>
            <td>{home.totalForMonth}</td>
            <td>
                <div className="d-flex justify-content-evenly">
                    <Link
                        to={`/management/condominiums/${condominiumId}/homes/${home.id}`}
                        className="text-decoration-none text-dark"
                    >
                        <img
                            src={homeIcon}
                            alt="home"
                            className="icon"
                        />
                    </Link>

                    <img
                        src={addResident}
                        alt="add_resident"
                        className="icon pointer"
                        onClick={onOpenResidentModal}
                    />
                </div>
            </td>
        </tr>
    );
};

export default SortableRow;