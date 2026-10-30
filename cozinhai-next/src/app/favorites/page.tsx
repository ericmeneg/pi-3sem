'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import axios from 'axios'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FavoriteRecipe = {
  recipeId: string
  title: string
  recipeImage?: string
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://pi-3sem-backend.onrender.com'

export default function FavoritesPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 12

  const fetchFavorites = useCallback(async () => {
    if (isAuthLoading || !hasMore) return
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get<FavoriteRecipe[]>(
        `${API_URL}/user/${user.id}/favorites`,
        {
          params: { limit, offset },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!Array.isArray(response.data)) {
        throw new Error('A API retornou uma resposta inválida para os favoritos.')
      }

      if (response.data.length < limit) {
        setHasMore(false)
      }

      setFavorites((prev) =>
        offset === 0 ? response.data : [...prev, ...response.data]
      )
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error)
      if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
        const apiMessage = error.response?.data?.message
        const message = Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage || error.message
        setErrorMessage(
          `Não foi possível carregar o caderno de receitas${
            error.response?.status ? ` (HTTP ${error.response.status})` : ''
          }: ${message}`
        )
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o caderno de receitas.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, isAuthLoading, offset, hasMore])

  const removeFavorite = async (recipeId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${API_URL}/user/${user?.id}/favorites/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setFavorites((prev) => prev.filter((fav) => fav.recipeId !== recipeId))
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    }
  }

  const goToRecipeDetails = (id: string) => {
    router.push(`/receitas/detalhes/${id}`)
  }

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const loadMore = () => {
    setOffset((prev) => prev + limit)
  }

  return (
    <>
      <Header />
      <div className="p-4 max-w-7xl mx-auto pt-32">
        <h1 className="text-2xl font-semibold text-[#22577A] mb-6" style={{ fontFamily: 'Alexandria' }}>
          Caderno de Receitas
        </h1>

        {isAuthLoading || (loading && favorites.length === 0) ? (
          <p className="text-gray-600">Carregando favoritos...</p>
        ) : !user ? (
          <p className="text-gray-600">
            <Link href="/login" className="text-[#22577A] underline">
              Entre na sua conta
            </Link>{' '}
            para acessar suas receitas favoritas.
          </p>
        ) : errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p role="alert">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchFavorites}
              disabled={loading}
              className="mt-3 rounded-lg bg-[#22577A] px-4 py-2 text-white hover:bg-[#19495d] disabled:opacity-60"
            >
              {loading ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <p className="text-gray-600">Você ainda não favoritou nenhuma receita.</p>
        ) : (
          <>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((recipe) => (
                <li
                  key={recipe.recipeId}
                  className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer"
                  onClick={() => goToRecipeDetails(recipe.recipeId)}
                >
                  {recipe.recipeImage ? (
                    <Image
                      src={recipe.recipeImage}
                      alt={recipe.title}
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-xl mb-3" />
                  )}
                  <h2 className="text-base font-semibold text-[#22577A] mb-2" style={{ fontFamily: 'Alexandria' }}>
                    {recipe.title}
                  </h2>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(recipe.recipeId)
                    }}
                    className="mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ fontFamily: 'Alexandria' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </button>
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-[#22577A] text-white rounded-lg hover:bg-[#19495d] transition-colors"
                >
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
