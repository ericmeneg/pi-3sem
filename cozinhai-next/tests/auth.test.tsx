import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import CadastroPage from "@/app/cadastro/page";

const authMocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: authMocks.push }),
}));

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: () => ({ login: authMocks.login }),
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

describe("autenticação e cadastro", () => {
  beforeEach(() => {
    authMocks.push.mockReset();
    authMocks.login.mockReset().mockResolvedValue(undefined);
  });

  it("não chama login com senha vazia e apresenta a validação", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Senha não pode ser vazia"),
    ).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it("redireciona para a área principal após login sintético bem-sucedido", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "SenhaSintetica1!");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(authMocks.login).toHaveBeenCalledWith(
        "ana@example.com",
        "SenhaSintetica1!",
      );
      expect(authMocks.push).toHaveBeenCalledWith("/home");
    });
  });

  it("rejeita dados inválidos no cadastro sem enviar requisição", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<CadastroPage />);

    await user.type(screen.getByLabelText("Nome"), "Al");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "curta");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(
      await screen.findByText("Nome deve conter no mínimo três caracteres"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Senha deve conter no mínimo 8 caracteres"),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia dados sintéticos e encaminha ao login após cadastro", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ id: "synthetic-user-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<CadastroPage />);

    await user.type(screen.getByLabelText("Nome"), "Ana Teste");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "SenhaSintetica1!");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(authMocks.push).toHaveBeenCalledWith("/login?success=true");
    });
  });
});
