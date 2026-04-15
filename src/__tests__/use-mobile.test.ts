import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIsMobile } from "../hooks/use-mobile";

describe("useIsMobile", () => {
  let originalInnerWidth: number;
  let addEventListenerMock: any;
  let removeEventListenerMock: any;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });

    // Set default innerWidth
    setInnerWidth(1024);
  });

  afterEach(() => {
    setInnerWidth(originalInnerWidth);
    vi.clearAllMocks();
  });

  const setInnerWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it("should return false when window.innerWidth is >= 768", () => {
    setInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true when window.innerWidth is < 768", () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should update when window size changes and triggers media query change", () => {
    setInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize and matchMedia change event
    act(() => {
      setInnerWidth(500);
      const changeHandler = addEventListenerMock.mock.calls.find(
        (call: any[]) => call[0] === "change"
      )?.[1];
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it("should remove event listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });
});
