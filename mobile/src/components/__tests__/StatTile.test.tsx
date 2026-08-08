import { render, screen } from "@testing-library/react-native";

import { StatTile } from "../StatTile";

describe("StatTile", () => {
  it("renders the value and label", async () => {
    await render(<StatTile label="Streak (days)" value={7} />);
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("Streak (days)")).toBeTruthy();
  });

  it("renders string values as-is", async () => {
    await render(<StatTile label="This week" value="3/4" />);
    expect(screen.getByText("3/4")).toBeTruthy();
  });
});
