import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchBar from "@/components/SearchBar";
import RecipeResultsPage from "@/app/receitas/page";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  query: "query=bolo%20de%20cenoura",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

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

vi.mock("@/components/Header", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("header", null, "Cabeçalho") };
});

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

describe("busca por nome e resultados", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.query = "query=bolo%20de%20cenoura";
    vi.stubEnv("NEXT_PUBLIC_SPOONACULAR_API_KEY", "synthetic-public-key");
  });

  it("encaminha uma busca preenchida para a página de resultados", () => {
    render(
      <SearchBar
        placeholder="Busque receitas"
        imgURL="/images/lupaIcon.svg"
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Busque receitas" }), {
      target: { value: "bolo de cenoura" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar receitas" }));

    expect(navigation.push).toHaveBeenCalledWith(
      "/receitas?query=bolo%20de%20cenoura",
    );
  });

  it("não navega quando a busca está vazia", () => {
    render(
      <SearchBar
        placeholder="Busque receitas"
        imgURL="/images/lupaIcon.svg"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buscar receitas" }));

    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("permite enviar a busca usando a tecla Enter", () => {
    render(
      <SearchBar
        placeholder="Busque receitas"
        imgURL="/images/lupaIcon.svg"
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Busque receitas" });
    fireEvent.change(input, { target: { value: "salada" } });
    fireEvent.submit(input.closest("form")!);

    expect(navigation.push).toHaveBeenCalledWith(
      "/receitas?query=salada",
    );
  });

  it("mostra os resultados recebidos da API simulada", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 501,
            title: "Bolo de cenoura sintético",
            image: "/fixture-recipe.jpg",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeResultsPage />);

    expect(
      await screen.findByText("Bolo de cenoura sintético"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain(
      "query=bolo%20de%20cenoura",
    );
  });

  it("mostra o estado vazio quando não há correspondências", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ results: [] })),
    );

    render(<RecipeResultsPage />);

    expect(
      await screen.findByText("Nenhuma receita encontrada."),
    ).toBeInTheDocument();
  });

  it("mostra a falha HTTP em vez de resultados falsos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({}, false, 503)),
    );

    render(<RecipeResultsPage />);

    expect(
      await screen.findByText(
        "Erro ao buscar as receitas (Status: 503)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Nenhuma receita encontrada."),
    ).not.toBeInTheDocument();
  });
});
