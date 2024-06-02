import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import apartments from '../../assets/images/app/apartment_building.png';
import ModalHomesGroup from "./ModalHomesGroup";
import HomesTable from "./HomesTable";
import FeesTable from "./FeesTable";

const HomesGroup = () => {
      const { id } = useParams()
      const { t } = useTranslation();
      const [homesGroup, setHomesGroup] = useState(testHomesGroup);
      const [editHomesGroup, setEditHomesGroup] = useState(false)

      useEffect(() => {
            setHomesGroup(testHomesGroup);
      }, [homesGroup]);

      const handleOpen = () => setEditHomesGroup(true);
      const handleClose = () => setEditHomesGroup(false);

      return (
            <>
                  <ModalHomesGroup show={editHomesGroup} handleClose={handleClose} input={homesGroup} />
                  <button className="hg-title" onClick={handleOpen}>
                        <div className="d-flex justify-content-center align-items-center">
                              <span>{homesGroup.name}</span>
                              <img src={apartments} className="medium-icon ms-3" alt="aparatments" />
                        </div>
                  </button>
                  <div className="layout">
                        <section className="homes-section">
                              <HomesTable homes={homesGroup.homes} />
                        </section>
                        <section className="utility-section">
                              <div>
                                    <FeesTable fees={homesGroup.fees} />
                              </div>
                              <div className="bg-info">bills</div>
                              <div className="bg-warning">repairs</div>
                        </section>
                  </div>
            </>
      )
}

export default HomesGroup;

const testHomesGroup = {
      id: 1,
      name: 'кв. Надежда бл. 103 вх. А',
      type: 'Жилищен блок',
      size: 23,
      backgroundColor: '#7d73db',
      initialDate: '1-10-2018',
      homes: [
            {
                  id: 1,
                  floor: '1',
                  name: '1',
                  owner: 'Милен',
                  residentsSize: 3,
                  totalForMonth: 0.0
            },
            {
                  id: 2,
                  floor: '1',
                  name: '2',
                  owner: 'Кирил',
                  residentsSize: 1,
                  totalForMonth: 0.0
            },
            {
                  id: 3,
                  floor: '2',
                  name: '3',
                  owner: 'Веска Берова',
                  residentsSize: 2,
                  totalForMonth: 0.0
            }

      ],
      fees: [
            {
                  id: 1,
                  addedOn: '27-09-2023',
                  name: 'Живущ ет. 1 или 2',
                  value: 3,
                  homes: 5
            },
            {
                  id: 2,
                  addedOn: '27-09-2023',
                  name: 'Живущ ет. 3 до 8',
                  value: 7,
                  homes: 18
            },
            {
                  id: 3,
                  addedOn: '27-09-2023',
                  name: 'Управление',
                  value: 3,
                  homes: 23
            }
      ],
      bills: [
            {
                  id: 1,
                  addedOn: '27-09-2023',
                  name: 'Такса АСАНСЬОР',
            },
            {
                  id: 2,
                  addedOn: '27-09-2023',
                  name: 'Ток АСАНСЬОР',
            },
            {
                  id: 3,
                  addedOn: '27-09-2023',
                  name: 'Ток Стълби',
            }
      ],
      repairs: [
            {
                  id: 1,
                  name: 'Ремонт покрив 150м2',
                  startDate: '01-09-2019',
                  budget: 3000,
            },
            {
                  id: 2,
                  name: 'Ремонт осветление',
                  startDate: '13-12-2023',
                  budget: 156,
            }
      ]

}