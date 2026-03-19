import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Navbar } from "./Navbar";
import { useSectionsStore } from "@/store/useSectionsStore";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ signOut: vi.fn(), signInWithGoogle: vi.fn() }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <AntdRegistry>{children}</AntdRegistry>;
}

describe("Navbar", () => {
  beforeEach(() => {
    useSectionsStore.setState({ searchQuery: "" });
  });

  it("renders search input with placeholder", () => {
    render(<Navbar />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText("Search sections & updates...")).toBeInTheDocument();
  });

  it("updates store when user types in search", async () => {
    const user = userEvent.setup();
    render(<Navbar />, { wrapper: Wrapper });
    const inputs = screen.getAllByPlaceholderText("Search sections & updates...");
    await user.type(inputs[0]!, "test");
    expect(useSectionsStore.getState().searchQuery).toBe("test");
  });
});
