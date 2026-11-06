import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FavoritesPage from "@/app/favorites/page";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  delete: vi.fn(),
  push: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    get: mocks.get,
    delete: mocks.delete,
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "synthetic-user-1",
      name: "Ana Teste",
      email: "ana@example.com",
    },
    isLoading: false,
  }),
}));

vi.mock("@/components/Header", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("header", null, "Cabeçalho") };
});

vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: (props: Record<string, unknown>) => {
      const imageProps = { ...props };
      delete imageProps.fill;
      delete imageProps.priority;
      return createElement("img", imageProps);
    },
  };
});

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default: ({
      href,
      children,
    }: {
      href: string;
      children: React.ReactNode;
    }) => createElement("a", { href }, children),
  };
});

describe("caderno de receitas", () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.delete.mockReset().mockResolvedValue({});
    mocks.push.mockReset();
    localStorage.setItem("token", "synthetic-test-token");
  });

  it("exibe receitas favoritas e remove a escolhida", async () => {
    mocks.get.mockResolvedValue({
      data: [
        {
          recipeId: "synthetic-recipe-42",
          title: "Panqueca sintética",
        },
      ],
    });

    render(<FavoritesPage />);

    expect(await screen.findByText("Panqueca sintética")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    await waitFor(() => {
      expect(mocks.delete).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByText(
        "Você ainda não favoritou nenhuma receita.",
      ),
    ).toBeInTheDocument();
  });

  it("informa o estado vazio retornado pela API simulada", async () => {
    mocks.get.mockResolvedValue({ data: [] });

    render(<FavoritesPage />);

    expect(
      await screen.findByText(
        "Você ainda não favoritou nenhuma receita.",
      ),
    ).toBeInTheDocument();
  });
});
