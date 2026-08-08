import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { WidgetBoundary } from "../WidgetBoundary";

function Bomb(): React.JSX.Element {
  throw new Error("boom");
}

describe("WidgetBoundary", () => {
  it("renders children normally when there is no error", async () => {
    await render(
      <WidgetBoundary label="Test widget">
        <Text>All good</Text>
      </WidgetBoundary>
    );
    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("catches a render crash and shows a labeled fallback instead of crashing the screen", async () => {
    // React logs the caught error to console.error; silence it for this expected-failure test.
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await render(
      <WidgetBoundary label="Today's session">
        <Bomb />
      </WidgetBoundary>
    );

    expect(screen.getByText(/Today's session couldn't load/)).toBeTruthy();

    consoleError.mockRestore();
  });
});
