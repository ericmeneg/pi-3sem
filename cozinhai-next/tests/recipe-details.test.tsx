import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientPageContent from "@/app/receitas/detalhes/[id]/ClientPageContent";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    get: mocks.get,
    patch: mocks.patch,
    post: mocks.post,
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: () => mocks.auth(),
}));

vi.mock("@/components/Header", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("header", null, "Cabeçalho") };
});

vi.mock("@/components/Footer", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("footer") };
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

const recipe = {
  title: "Ensopado sintético",
  image: "/fixture-stew.jpg",
  servings: 2,
  readyInMinutes: 15,
  extendedIngredients: [
    { id: 1, amount: 1, unit: "unidade", name: "tomate" },
  ],
  instructions: "Cozinhe em fogo baixo.",
};

const reviewSummary = {
  status: "available",
  summary: null,
  reviewCount: 0,
  pendingReviewCount: 0,
  generatedAt: null,
  averageRating: null,
  ratingCount: 0,
};

function configureResponses() {
  mocks.get.mockImplementation((url: string) => {
    if (url.includes("/information")) {
      return Promise.resolve({ data: recipe });
    }
    if (url.endsWith("/reviews")) {
      return Promise.resolve({ data: [] });
    }
    if (url.endsWith("/review-summary")) {
      return Promise.resolve({ data: reviewSummary });
    }
    if (url.endsWith("/favorites")) {
      return Promise.resolve({ data: [] });
    }
    throw new Error("URL de API inesperada no teste.");
  });
}

describe("detalhes, favoritos e avaliação da receita", () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.patch.mockReset().mockResolvedValue({});
    mocks.post.mockReset().mockResolvedValue({});
    mocks.auth.mockReset().mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    configureResponses();
  });

  it("exibe conteúdo e estado de avaliações com respostas sintéticas", async () => {
    render(<ClientPageContent idReceita="synthetic-recipe-42" />);

    expect(await screen.findByText("Ensopado sintético")).toBeInTheDocument();
    expect(screen.getByText("1 unidade tomate")).toBeInTheDocument();
    expect(screen.getByText("Cozinhe em fogo baixo.")).toBeInTheDocument();
    expect(
      screen.getByText("Ainda não há comentários suficientes para gerar um resumo."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Faça login para avaliar esta receita."),
    ).toBeInTheDocument();
  });

  it("apresenta erro e permite tentar novamente quando os detalhes falham", async () => {
    let attempts = 0;
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.get.mockImplementation((url: string) => {
      if (url.includes("/information")) {
        attempts += 1;
        return attempts === 1
          ? Promise.reject(new Error("falha sintética de rede"))
          : Promise.resolve({ data: recipe });
      }
      if (url.endsWith("/reviews")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: reviewSummary });
    });

    render(<ClientPageContent idReceita="synthetic-recipe-42" />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Não foi possível carregar os detalhes da receita.");
    await userEvent.setup().click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );

    expect(await screen.findByText("Ensopado sintético")).toBeInTheDocument();
    expect(
      mocks.get.mock.calls.filter(([url]) => url.includes("/information")),
    ).toHaveLength(2);
  });

  it("salva favorito e avaliação da conta sintética", async () => {
    const user = userEvent.setup();
    mocks.auth.mockReturnValue({
      user: {
        id: "synthetic-user-1",
        name: "Ana Teste",
        email: "ana@example.com",
      },
      isAuthenticated: true,
      isLoading: false,
    });
    localStorage.setItem("token", "synthetic-test-token");
    render(<ClientPageContent idReceita="synthetic-recipe-42" />);
    await screen.findByText("Nenhuma avaliação encontrada.");

    await user.click(
      await screen.findByRole("button", { name: "Favoritar receita" }),
    );
    await waitFor(() => {
      expect(mocks.patch).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByRole("button", { name: "Favoritada" }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Deixe um comentário..."),
      "Comentário de teste",
    );
    fireEvent.click(screen.getByRole("button", { name: "Enviar Avaliação" }));

    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByText(/Você já avaliou esta receita\./),
    ).toBeInTheDocument();
  });
});
