import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/home/page";

vi.mock("@/components/Header", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("header", null, "Cabeçalho") };
});

vi.mock("@/components/Footer", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("footer") };
});

vi.mock("@/components/ingredientes-da-epoca", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("div") };
});

vi.mock("@/components/RandomRecomendations", async () => {
  const { createElement } = await import("react");
  return {
    default: () => createElement("section"),
  };
});

vi.mock("@/components/RecomendacaoCard", async () => {
  const { createElement } = await import("react");
  return {
    default: ({ title }: { title: string }) =>
      createElement("div", null, title),
  };
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

function jsonResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

describe("busca por ingredientes", () => {
  it("adiciona um ingrediente e exibe a receita retornada pela resposta simulada", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 502,
          title: "Sopa sintética de tomate",
          image: "/fixture-soup.jpg",
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText("Busque um ingrediente"), {
      target: { value: "tomate" },
    });
    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(screen.getByText("tomate")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Buscar Receita" }));

    expect(
      await screen.findByText("Sopa sintética de tomate"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("ingredients=tomate");
  });
});
