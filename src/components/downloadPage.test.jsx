import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import DownloadPage from "./downloadPage";

test("renders DownloadPage with dark theme classes", () => {
  render(<DownloadPage url="http://example.com/test.m3u8" />);

  const codeElement = screen.getByText("http://example.com/test.m3u8");
  expect(codeElement).toHaveClass("bg-muted");
});