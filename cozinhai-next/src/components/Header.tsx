"use client"

import Link from "next/link"
import SearchBar from "./SearchBar"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-context"
import { useState, useRef, useEffect } from "react"
import { BookOpen, Star, Settings, LogOut, User, ChevronDown } from "lucide-react"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    // Opcional: redirecionar para home após logout
    window.location.href = "/home"
  }

  return (
    <div className="bg-[#EDF2F4] w-full flex items-center justify-center fixed top-0 z-10 ">
      <header className="flex flex-row items-center justify-around w-full gap-2 flex-nowrap h-[4.875rem]">
        <Link href="/home">
          <Image src="/images/homeIcon.svg" alt="Home" width={20} height={20} />
        </Link>

        <SearchBar
          placeholder="Busque receitas"
          imgURL="/images/lupaIcon.svg"
          searchUrl={`https://api.spoonacular.com/recipes/complexSearch?query=${"W.I.P."}&apiKey=${"W.I.P."}`}
        />

          {/* Área do usuário */}
        <div className="relative" ref={dropdownRef}>
          {isAuthenticated ? (
            // Usuário logado - mostrar dropdown
            <div className="h-[4.875rem]">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-5 rounded-full hover:bg-white/50 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#22577A] to-[#57CC99] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#22577A] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200/50 py-2 animate-in slide-in-from-top duration-200">
                  {/* Info do usuário */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#22577A]" style={{ fontFamily: "Alexandria" }}>
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "Alexandria" }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Opções do menu */}


                  <div className="py-1">
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      style={{ fontFamily: "Alexandria" }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BookOpen className="w-4 h-4 text-[#22577A]" />
                      Caderno de Receitas
                    </Link>

                    <Link
                      href="/avaliacoes"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      style={{ fontFamily: "Alexandria" }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Star className="w-4 h-4 text-[#22577A]" />
                      Avaliações
                    </Link>

                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      style={{ fontFamily: "Alexandria" }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-[#22577A]" />
                      Configurações
                    </Link>

                    <hr className="my-1 border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                      style={{ fontFamily: "Alexandria" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Usuário não logado - link para login
            <Link href="/login" className="p-2 rounded-full  transition-colors duration-200">
              <Image
                className="hover:bg-white/50 w-6 sm:w-7 md:w-7.5"
                src="/images/profileIcon.svg"
                alt="Fazer login"
                width={28}
                height={28}
                priority
              />
            </Link>
          )}
        </div>
      </header>
    </div>
  )
}
