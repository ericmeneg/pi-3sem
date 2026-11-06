'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import Image from 'next/image'
import Footer from '@/components/Footer'
import axios from 'axios'
import { Heart, Star } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import { htmlToText } from '@/utils/html-to-text'

interface Ingredient {
  id: number
  amount: number
  unit: string
  name: string
}

interface RecipeData {
  title: string
  image: string
  servings: number
  readyInMinutes: number
  extendedIngredients: Ingredient[]
  instructions: string
}

interface Review {
  grade: number
  comment: string
  title?: string
  recipeImage?: string
  userId: string
  date?: string
}

type ReviewSummaryStatus = 'not_ready' | 'pending' | 'available'

interface ReviewSummary {
  status: ReviewSummaryStatus
  summary: string | null
  reviewCount: number
  pendingReviewCount: number | null
  generatedAt: string | null
  averageRating: number | null
  ratingCount: number
}

interface Favorite {
  recipeId: string
}

const FAVORITES_PAGE_SIZE = 12
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://pi-3sem-backend.onrender.com'

const StarsEdit = ({
  grade,
  onChange,
}: {
  grade: number
  onChange: (grade: number) => void
}) => (
  <div className="flex gap-1 text-yellow-500 cursor-pointer select-none">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={24}
        className={i <= grade ? 'fill-current' : 'text-gray-300'}
        onClick={() => onChange(i)}
      />
    ))}
  </div>
)

const Stars = ({ grade = 0 }: { grade?: number }) => (
  <div className="flex gap-1 text-yellow-500">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={18}
        className={i <= grade ? 'fill-current' : 'text-gray-300'}
      />
    ))}
  </div>
)

const AverageStars = ({ rating }: { rating: number | null }) => (
  <div
    className="flex gap-1 text-gray-300"
    aria-label={
      rating === null
        ? 'Sem avaliações'
        : `Média de ${rating.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} de 5`
    }
  >
    {[1, 2, 3, 4, 5].map((star) => {
      const fillPercent =
        rating === null ? 0 : Math.min(Math.max(rating - star + 1, 0), 1) * 100

      return (
        <span key={star} className="relative inline-flex">
          <Star size={22} />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden text-yellow-500"
            style={{ width: `${fillPercent}%` }}
          >
            <Star size={22} className="fill-current" />
          </span>
        </span>
      )
    })}
  </div>
)

interface ClientPageContentProps {
  idReceita: string;
}

export default function ClientPageContent({ idReceita }: ClientPageContentProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [data, setData] = useState<RecipeData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [comment, setComment] = useState('')
  const [grade, setGrade] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [recipeError, setRecipeError] = useState<string | null>(null)
  const [recipeRetry, setRecipeRetry] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false)
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryRefresh, setSummaryRefresh] = useState(0)

  const hasUserReviewed = useMemo(() => {
    if (!isAuthenticated || !user || !reviews.length) {
      return false;
    }
    return reviews.some(review => review.userId === user.id);
  }, [isAuthenticated, user, reviews]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setRecipeError(null)
      try {
        const recipeRes = await axios.get<RecipeData>(
          `https://api.spoonacular.com/recipes/${idReceita}/information`,
          {
            params: {
              apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
            },
          }
        )
        if (!recipeRes.data) {
          throw new Error('A API não retornou os detalhes da receita.')
        }
        setData(recipeRes.data)
      } catch (error) {
        console.error('Erro ao carregar dados da receita:', error)
        setData(null)
        setRecipeError(
          'Não foi possível carregar os detalhes da receita. Verifique sua conexão e tente novamente.'
        )
      } finally {
        setIsLoading(false)
      }

      try {
        const reviewRes = await axios.get<Review[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/recipe/${idReceita}/reviews`,
          {
            params: {
              limit: 10,
              offset: 0,
            },
          }
        )
        setReviews(reviewRes.data)
      } catch (error) {
        console.error('Erro ao carregar avaliações da receita:', error)
      }
    }

    fetchData()
  }, [idReceita, recipeRetry])

  useEffect(() => {
    let cancelled = false

    const fetchReviewSummary = async () => {
      setIsSummaryLoading(true)
      setSummaryError(null)

      try {
        const response = await axios.get<ReviewSummary>(
          `${API_URL}/recipe/${idReceita}/review-summary`
        )

        if (
          !response.data ||
          !['not_ready', 'pending', 'available'].includes(response.data.status)
        ) {
          throw new Error('A API retornou um status inválido para o resumo.')
        }

        if (!cancelled) setReviewSummary(response.data)
      } catch (error) {
        console.error('Erro ao carregar resumo das avaliações:', error)
        if (!cancelled) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setSummaryError(
              'O backend configurado ainda não disponibiliza o resumo das avaliações. Atualize a implantação do backend.'
            )
            return
          }

          const apiMessage = axios.isAxiosError<{ message?: string | string[] }>(error)
            ? error.response?.data?.message
            : undefined
          setSummaryError(
            Array.isArray(apiMessage)
              ? apiMessage.join(' ')
              : apiMessage ||
                  (error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar o resumo das avaliações.')
          )
        }
      } finally {
        if (!cancelled) setIsSummaryLoading(false)
      }
    }

    fetchReviewSummary()

    return () => {
      cancelled = true
    }
  }, [idReceita, summaryRefresh])

  useEffect(() => {
    if (isAuthLoading) return

    if (!user || !isAuthenticated) {
      setIsFavorite(false)
      setIsFavoriteLoading(false)
      return
    }

    let cancelled = false

    const fetchFavoriteStatus = async () => {
      setIsFavoriteLoading(true)
      setFavoriteError(null)

      try {
        const token = localStorage.getItem('token')
        let offset = 0

        while (true) {
          const response = await axios.get<Favorite[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/favorites`,
            {
              params: { limit: FAVORITES_PAGE_SIZE, offset },
              headers: { Authorization: `Bearer ${token}` },
            }
          )

          if (!Array.isArray(response.data)) {
            throw new Error('Resposta inválida ao buscar favoritos.')
          }

          if (response.data.some((favorite) => favorite.recipeId === idReceita)) {
            if (!cancelled) setIsFavorite(true)
            return
          }

          if (response.data.length < FAVORITES_PAGE_SIZE) break
          offset += FAVORITES_PAGE_SIZE
        }

        if (!cancelled) setIsFavorite(false)
      } catch (error) {
        console.error('Erro ao verificar se a receita está favoritada:', error)
        if (!cancelled) {
          setFavoriteError('Não foi possível verificar seus favoritos.')
        }
      } finally {
        if (!cancelled) setIsFavoriteLoading(false)
      }
    }

    fetchFavoriteStatus()

    return () => {
      cancelled = true
    }
  }, [idReceita, isAuthLoading, isAuthenticated, user])

  const handleToggleFavorite = async () => {
    if (!user || !data) return

    setIsFavoriteSubmitting(true)
    setFavoriteError(null)

    try {
      const token = localStorage.getItem('token')
      const favoriteUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/favorites/${idReceita}`

      if (isFavorite) {
        await axios.delete(favoriteUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsFavorite(false)
      } else {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/favorites`,
          {
            id: idReceita,
            title: data.title,
            recipeImage: data.image,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      const apiMessage = axios.isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined
      setFavoriteError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage || 'Não foi possível atualizar seu favorito. Tente novamente.'
      )
    } finally {
      setIsFavoriteSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!user || hasUserReviewed) return
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/${idReceita}/reviews`,
        { grade, comment, title: data?.title, recipeImage: data?.image },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setReviews((prevReviews) => {
        const existingReviewIndex = prevReviews.findIndex(
          (rev) => rev.userId === user.id
        );

        const newOrUpdatedReview = {
          grade,
          comment,
          title: data ? data.title : undefined,
          userId: user.id,
          date: new Date().toISOString(),
        };

        if (existingReviewIndex > -1) {
          const updatedReviews = [...prevReviews];
          updatedReviews[existingReviewIndex] = newOrUpdatedReview;
          return updatedReviews;
        } else {
          return [...prevReviews, newOrUpdatedReview];
        }
      });

      setComment('')
      setGrade(3)
      setSummaryRefresh((previous) => previous + 1)
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p role="status">Carregando receita...</p>
      </div>
    )
  }

  if (recipeError || !data) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 px-6 text-center">
        <p role="alert" className="text-red-700">
          {recipeError || 'Não foi possível carregar os detalhes da receita.'}
        </p>
        <button
          type="button"
          onClick={() => setRecipeRetry((attempt) => attempt + 1)}
          className="rounded-lg bg-[#22577A] px-4 py-2 text-white hover:bg-[#19495d]"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-col items-center px-6 py-12 gap-8">
        <Image
          src="/images/fullLogo.svg"
          alt="Logo Cozinhaí"
          className="mt-[6rem]"
          width={256}
          height={256}
        />

        <h1 className="text-[#22577A] font-bold text-3xl text-center">{data.title}</h1>

        {isAuthLoading ? (
          <p className="text-[#22577A]">Verificando sua conta...</p>
        ) : isAuthenticated ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isFavoriteLoading || isFavoriteSubmitting}
              aria-pressed={isFavorite}
              className="flex items-center gap-2 rounded-full border border-[#22577A] px-4 py-2 font-medium text-[#22577A] transition-colors hover:bg-[#22577A] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavoriteLoading
                ? 'Verificando...'
                : isFavoriteSubmitting
                  ? 'Salvando...'
                  : isFavorite
                    ? 'Favoritada'
                    : 'Favoritar receita'}
            </button>
            {favoriteError && (
              <p role="alert" className="text-sm text-red-600">
                {favoriteError}
              </p>
            )}
          </div>
        ) : (
          <p className="text-[#22577A]">
            <Link href="/login" className="underline hover:text-[#19495d]">
              Entre na sua conta
            </Link>{' '}
            para favoritar esta receita.
          </p>
        )}

        <Image
          src={data.image}
          alt={data.title}
          width={300}
          height={200}
          className="rounded-2xl border-2 border-[#22577A]"
        />

        <div className="text-[#22577A] text-lg font-medium w-full max-w-2xl flex flex-col gap-3">
          <p><strong>Serve:</strong> {data.servings}</p>
          <p><strong>Tempo de preparo:</strong> {data.readyInMinutes} minutos</p>
        </div>

        <div className="w-full max-w-2xl">
          <h3 className="text-[#22577A] font-bold text-xl mt-6 mb-2">Ingredientes:</h3>
          <ul className="list-disc list-inside text-[#22577A] text-lg font-medium">
            {data.extendedIngredients.map((ing: Ingredient) => (
              <li key={ing.id}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>

          <h3 className="text-[#22577A] font-bold text-xl mt-6 mb-2">Modo de preparo:</h3>
          <p className="text-[#22577A] text-lg font-medium whitespace-pre-line">
            {htmlToText(data.instructions)}
          </p>

          <section className="mt-8 rounded-2xl border border-[#d5e3eb] bg-[#f5f9fb] p-5">
            <h3 className="text-[#22577A] font-bold text-xl mb-3">
              Avaliação média e resumo
            </h3>
            {isSummaryLoading ? (
              <p className="text-[#22577A]">Carregando resumo...</p>
            ) : summaryError ? (
              <p role="alert" className="text-red-700">
                Não foi possível carregar o resumo: {summaryError}
              </p>
            ) : reviewSummary ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-[#22577A]">
                  <AverageStars
                    rating={
                      reviewSummary.ratingCount > 0
                        ? reviewSummary.averageRating
                        : null
                    }
                  />
                  {reviewSummary.averageRating !== null &&
                  reviewSummary.ratingCount > 0 ? (
                    <span className="font-semibold">
                      {reviewSummary.averageRating.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      /5 ({reviewSummary.ratingCount}{' '}
                      {reviewSummary.ratingCount === 1
                        ? 'avaliação'
                        : 'avaliações'})
                    </span>
                  ) : (
                    <span className="font-medium">Sem avaliações</span>
                  )}
                </div>

                {reviewSummary.summary ? (
                  <>
                    <p className="text-[#22577A] whitespace-pre-line">
                      {reviewSummary.summary}
                    </p>
                    <p className="mt-3 text-sm text-[#526b7a]">
                      Resumo baseado em {reviewSummary.reviewCount}{' '}
                      {reviewSummary.reviewCount === 1
                        ? 'comentário'
                        : 'comentários'}.
                      {reviewSummary.pendingReviewCount !== null &&
                        reviewSummary.pendingReviewCount > 0 &&
                        ` ${reviewSummary.pendingReviewCount} ${
                          reviewSummary.pendingReviewCount === 1
                            ? 'comentário aguarda'
                            : 'comentários aguardam'
                        } a próxima atualização.`}
                    </p>
                  </>
                ) : reviewSummary.status === 'pending' ? (
                  <p className="text-[#22577A]">
                    O resumo está sendo atualizado. Volte em alguns instantes.
                  </p>
                ) : (
                  <p className="text-[#22577A]">
                    Ainda não há comentários suficientes para gerar um resumo.
                  </p>
                )}
              </>
            ) : null}
          </section>

          <h3 className="text-[#22577A] font-bold text-xl mt-8 mb-2">Avaliações:</h3>
          {reviews.length === 0 ? (
            <p className="text-[#22577A]">Nenhuma avaliação encontrada.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((rev, i) => (
                <li key={i} className="border-b border-gray-200 pb-2">
                  <p className="text-[#22577A] font-medium">Nota: {rev.grade}/5</p>
                  <p className="text-[#22577A]">{rev.comment}</p>
                  <Stars grade={rev.grade} />
                </li>
              ))}
            </ul>
          )}

          {isAuthenticated && !hasUserReviewed ? (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-[#22577A]">Deixe sua avaliação</h4>
              <label className="text-[#22577A] font-medium">
                Nota: {grade}/5
                <StarsEdit grade={grade} onChange={setGrade} />
              </label>
              <textarea
                placeholder="Deixe um comentário..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#22577A] text-white px-4 py-2 rounded hover:bg-[#19495d]"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          ) : (
            isAuthenticated && hasUserReviewed && (
              <p className="mt-6 text-[#22577A] font-medium">
                Você já avaliou esta receita.{' '}
                Para editar sua avaliação, acesse <Link href="/avaliacoes" className="text-blue-600 underline hover:text-blue-800">suas avaliações</Link>.
              </p>
            )
          )}
          {!isAuthenticated && (
             <p className="mt-6 text-[#22577A] font-medium">
                Faça login para avaliar esta receita.
             </p>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}