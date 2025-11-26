import { render, screen, fireEvent } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import HomePage from "./home";
import parseHls from "../lib/parseHls";

vi.mock("../lib/parseHls");

test("renders HomePage and calls setUrl and setFileName from query params", () => {
  const setUrl = vi.fn();
  const setFileName = vi.fn();

  Object.defineProperty(window, "location", {
    value: {
      search: "?url=http://example.com/test.m3u8&filename=test-file",
    },
    writable: true,
  });

  parseHls.mockResolvedValue({ type: "SEGMENT" });

  render(<HomePage setUrl={setUrl} setFileName={setFileName} setHeaders={() => {}} />);

  expect(parseHls).toHaveBeenCalledWith({
    hlsUrl: new URL("http://example.com/test.m3u8"),
    headers: {},
  });
});

test("renders Anime Realms Download message when no url params", () => {
  Object.defineProperty(window, "location", {
    value: {
      search: "",
    },
    writable: true,
  });

  render(<HomePage setUrl={() => {}} setFileName={() => {}} setHeaders={() => {}} />);

  expect(screen.getByText("Anime Realms Download")).toBeInTheDocument();
  expect(
    screen.getByText("A service to download HLS streams.")
  ).toBeInTheDocument();
});

test("renders quality selection dialog when playlist is found", async () => {
  const setUrl = vi.fn();
  const setFileName = vi.fn();

  Object.defineProperty(window, "location", {
    value: {
      search: "?url=http://example.com/master.m3u8&filename=test-file",
    },
    writable: true,
  });

  const playlist = [
    { name: "SD", uri: "http://example.com/sd.m3u8" },
    { name: "HD", uri: "http://example.com/hd.m3u8" },
  ];

  parseHls.mockResolvedValue({ type: "PLAYLIST", data: playlist });

  render(<HomePage setUrl={setUrl} setFileName={setFileName} setHeaders={() => {}} />);

  // Wait for the dialog to appear
  await screen.findByText("Select quality");

  // Check if the quality options are rendered
  expect(screen.getByText("SD")).toBeInTheDocument();
  expect(screen.getByText("HD")).toBeInTheDocument();

  // Click on a quality option
  fireEvent.click(screen.getByText("HD"));

  // Check if setUrl is called with the correct uri
  expect(setUrl).toHaveBeenCalledWith("http://example.com/hd.m3u8");
});