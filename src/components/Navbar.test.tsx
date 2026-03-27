import { AntdRegistry } from "@ant-design/nextjs-registry";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSectionsStore } from "@/store/useSectionsStore";

import { Navbar } from "./Navbar";

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
    expect(screen.getByPlaceholderText("Search habits & logs…")).toBeInTheDocument();
  });

  it("updates store when user types in search", async () => {
    const user = userEvent.setup();
    render(<Navbar />, { wrapper: Wrapper });
    const inputs = screen.getAllByPlaceholderText("Search habits & logs…");
    await user.type(inputs[0]!, "test");
    expect(useSectionsStore.getState().searchQuery).toBe("test");
  });
});
