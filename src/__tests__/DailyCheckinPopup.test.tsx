import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DailyCheckinPopup } from "../components/dashboard/DailyCheckinPopup";

describe("DailyCheckinPopup Component", () => {
  it("should not render the popup when show is false", () => {
    const { container } = render(
      <DailyCheckinPopup show={false} onClose={vi.fn()} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render the popup correctly when show is true", () => {
    render(
      <DailyCheckinPopup show={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );
    expect(screen.getByText("How are you feeling today?")).toBeInTheDocument();
    expect(
      screen.getByText("Take a brief self-reflection moment to check in with your mind.")
    ).toBeInTheDocument();
    
    // Checks that all 5 emojis (Awful, Down, Okay, Good, Great) are rendered
    expect(screen.getByText("Awful")).toBeInTheDocument();
    expect(screen.getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Okay")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Great")).toBeInTheDocument();
  });

  it("should call onSelect and onClose when an emoji button is clicked", () => {
    const mockOnSelect = vi.fn();
    const mockOnClose = vi.fn();
    
    render(
      <DailyCheckinPopup show={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    
    // Tap the 'Great' emoji button
    const greatButton = screen.getByText("Great").closest("button");
    expect(greatButton).not.toBeNull();
    
    if (greatButton) {
      fireEvent.click(greatButton);
      expect(mockOnSelect).toHaveBeenCalledWith(5);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
