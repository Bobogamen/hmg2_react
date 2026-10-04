import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home, { findAdjacentHomes } from "./Home";
import { getHome, getHomes } from "../../../api/services/homeService";
import { getHomeFees } from "../../../api/services/feeService";
import { getHomeRepairs } from "../../../api/services/repairService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ condominiumId: "5", homeId: "20" }),
}));
jest.mock("../../../api/services/homeService", () => ({
  getHome: jest.fn(),
  getHomes: jest.fn(),
}));
jest.mock("../../../api/services/feeService", () => ({
  getHomeFees: jest.fn(),
  updateHomeFeeTimes: jest.fn(),
}));
jest.mock("../../../api/services/repairService", () => ({ getHomeRepairs: jest.fn() }));
jest.mock("../../../loader/LoadingContext", () => ({
  useLoading: () => ({ setIsLoading: jest.fn() }),
}));
jest.mock("../../../user/UserContext", () => ({ useUser: () => ({ logout: jest.fn() }) }));
jest.mock("../../breadcrumb/BreadcrumpContext", () => ({
  useBreadcrumb: () => ({ setBreadcrumbs: jest.fn() }),
}));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock("./ModalHome", () => () => null);
jest.mock("./ModalBuilding", () => () => null);
jest.mock("./HomeRepairsTable", () => () => null);
jest.mock("./resident/OwnerCard", () => () => null);
jest.mock("./resident/CardResident", () => () => null);

beforeEach(() => {
  jest.clearAllMocks();
  getHome.mockResolvedValue({
    id: 20,
    name: "B",
    floor: "2",
    residents: [],
    condominium: { id: 5, name: "Building", backgroundColor: "#ffffff" },
    residentMaxCount: 0,
    feeMaxCount: 0,
  });
  getHomeFees.mockResolvedValue([]);
  getHomeRepairs.mockResolvedValue([]);
  getHomes.mockResolvedValue([
    { id: 30, name: "C", sortOrder: 2 },
    { id: 10, name: "A", sortOrder: 0 },
    { id: 20, name: "B", sortOrder: 1 },
  ]);
});

test("opens previous and next homes according to sortOrder", async () => {
  render(<Home />);

  await waitFor(() => expect(
    screen.getByRole("button", { name: "common:back" }),
  ).toHaveAttribute("title", "common:back: A"));
  const previous = screen.getByRole("button", { name: "common:back" });
  const next = screen.getByRole("button", { name: "common:next" });

  expect(getHomes).toHaveBeenCalledWith("5");
  expect(next).toHaveAttribute("title", "common:next: C");

  fireEvent.click(previous);
  expect(mockNavigate).toHaveBeenLastCalledWith("/management/condominiums/5/homes/10");
  fireEvent.click(next);
  expect(mockNavigate).toHaveBeenLastCalledWith("/management/condominiums/5/homes/30");
});

test("wraps navigation at the first and last homes", () => {
  const homes = [
    { id: 30, sortOrder: 2 },
    { id: 10, sortOrder: 0 },
    { id: 20, sortOrder: 1 },
  ];

  expect(findAdjacentHomes(homes, 10)).toEqual({
    previous: homes[0],
    next: homes[2],
  });
  expect(findAdjacentHomes(homes, 30)).toEqual({
    previous: homes[2],
    next: homes[1],
  });
  expect(findAdjacentHomes([{ id: 10, sortOrder: 0 }], 10)).toEqual({
    previous: null,
    next: null,
  });
});
