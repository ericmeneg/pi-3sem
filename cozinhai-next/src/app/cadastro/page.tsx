"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Check, X } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  // Validações de senha baseadas nos requisitos do backend
  const passwordRequirements = [
    { id: "length", label: "Mínimo de 8 caracteres", test: (p: string) => p.length >= 8 },
    { id: "uppercase", label: "Pelo menos uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "Pelo menos uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: "Pelo menos um número", test: (p: string) => /\d/.test(p) },
    { id: "special", label: "Pelo menos um caractere especial (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
  ]

  const validateName = (name: string) => {
    if (!name) return "Nome não pode ser vazio"
    if (name.length < 3) return "Nome deve conter no mínimo três caracteres"
    if (name.length > 30) return "Nome deve conter no máximo trinta caracteres"
    return ""
  }

  const validateEmail = (email: string) => {
    if (!email) return "Email não pode ser vazio"
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) return "Email inválido"
    return ""
  }

  const validatePassword = (password: string) => {
    if (!password) return "Senha não pode ser vazia"
    if (password.length < 8) return "Senha deve conter no mínimo 8 caracteres"
    if (password.length > 64) return "Senha deve conter no máximo 64 caracteres"
    if (!/(?=.*[A-Z])/.test(password)) return "Senha deve conter ao menos uma letra maiúscula"
    if (!/(?=.*[a-z])/.test(password)) return "Senha deve conter ao menos uma letra minúscula"
    if (!/(?=.*\d)/.test(password)) return "Senha deve conter ao menos um número"
    if (!/(?=.*[!@#$%^&*])/.test(password)) return "Senha deve conter ao menos um caractere especial"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação completa
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://pi-3sem-backend.onrender.com"}/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        },
      )

      // Verifica se a resposta é JSON ou texto
      const contentType = response.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        // Se não for JSON, trata como texto
        const text = await response.text()
        data = { message: text }
      }

      if (!response.ok) {
        if (data.errors) {
          // Mapear erros de validação do backend
          const backendErrors: { [key: string]: string } = {}
          Object.keys(data.errors).forEach((key) => {
            backendErrors[key] = data.errors[key][0]
          })
          throw new Error(JSON.stringify(backendErrors))
        }
        throw new Error(data.message || "Erro ao criar conta")
      }

      // Redirecionar para a página de login com mensagem de sucesso
      router.push("/login?success=true")
    } catch (error) {
      try {
        const parsedErrors = JSON.parse((error as Error).message)
        setErrors(parsedErrors)
      } catch {
        setErrors({
          general: error instanceof Error ? error.message : "Erro ao criar conta",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDF2F4] via-white to-[#EDF2F4] flex flex-col items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#57CC99]/20 to-[#22577A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#22577A]/20 to-[#57CC99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/home" className="inline-block hover:scale-105 transition-transform duration-300">
            <Image
              src="/images/fullLogo.svg"
              alt="CozinhAI Logo"
              width={160}
              height={80}
              className="mx-auto mb-6"
              priority
            />
          </Link>
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-[#22577A] to-[#57CC99] bg-clip-text text-transparent mb-3"
            style={{ fontFamily: "DaCherry" }}
          >
            Junte-se ao CozinhAI
          </h1>
          <p className="text-gray-600 text-lg" style={{ fontFamily: "Alexandria" }}>
            Comece a reduzir o desperdício de alimentos hoje
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
          {errors.general && (
            <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 animate-in slide-in-from-top duration-300">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#22577A]"
                style={{ fontFamily: "Alexandria" }}
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white/50 backdrop-blur focus:ring-2 focus:ring-[#57CC99] focus:border-[#57CC99] transition-all duration-300 ${
                  errors.name ? "border-red-400" : "border-gray-200 hover:border-[#57CC99]/50"
                }`}
                placeholder="Seu nome"
                style={{ fontFamily: "Alexandria" }}
              />
              {errors.name && (
                <p
                  className="text-sm text-red-600 animate-in slide-in-from-left duration-300"
                  style={{ fontFamily: "Alexandria" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#22577A]"
                style={{ fontFamily: "Alexandria" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-2xl bg-white/50 backdrop-blur focus:ring-2 focus:ring-[#57CC99] focus:border-[#57CC99] transition-all duration-300 ${
                  errors.email ? "border-red-400" : "border-gray-200 hover:border-[#57CC99]/50"
                }`}
                placeholder="seu@email.com"
                style={{ fontFamily: "Alexandria" }}
              />
              {errors.email && (
                <p
                  className="text-sm text-red-600 animate-in slide-in-from-left duration-300"
                  style={{ fontFamily: "Alexandria" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#22577A]"
                style={{ fontFamily: "Alexandria" }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl bg-white/50 backdrop-blur focus:ring-2 focus:ring-[#57CC99] focus:border-[#57CC99] transition-all duration-300 ${
                    errors.password ? "border-red-400" : "border-gray-200 hover:border-[#57CC99]/50"
                  }`}
                  placeholder="••••••••"
                  style={{ fontFamily: "Alexandria" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#22577A] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p
                  className="text-sm text-red-600 animate-in slide-in-from-left duration-300"
                  style={{ fontFamily: "Alexandria" }}
                >
                  {errors.password}
                </p>
              )}

              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur rounded-2xl border border-gray-200/50">
                <p className="text-sm font-semibold text-[#22577A] mb-3" style={{ fontFamily: "Alexandria" }}>
                  Requisitos da senha:
                </p>
                <ul className="space-y-2">
                  {passwordRequirements.map((req) => (
                    <li key={req.id} className="flex items-center text-sm transition-all duration-200">
                      <div className={`mr-3 p-1 rounded-full ${req.test(password) ? "bg-green-100" : "bg-gray-100"}`}>
                        {req.test(password) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={req.test(password) ? "text-green-700 font-medium" : "text-gray-500"}
                        style={{ fontFamily: "Alexandria" }}
                      >
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#22577A] to-[#57CC99] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#57CC99]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ fontFamily: "Alexandria" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>
        </div>

        {/* Links de navegação */}
        <div className="text-center space-y-4">
          <Link
            href="/home"
            className="block text-gray-600 hover:text-[#22577A] transition-colors duration-200 font-medium"
            style={{ fontFamily: "Alexandria" }}
          >
            Continuar sem fazer login →
          </Link>

          <p className="text-gray-600" style={{ fontFamily: "Alexandria" }}>
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#22577A] hover:text-[#57CC99] transition-colors duration-200"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
