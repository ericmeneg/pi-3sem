'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import Image from 'next/image'
import Footer from '@/components/Footer'
import axios from 'axios'
import { Star } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

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

interface ClientPageContentProps {
  idReceita: string;
}

export default function ClientPageContent({ idReceita }: ClientPageContentProps) {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<RecipeData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [comment, setComment] = useState('')
  const [grade, setGrade] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasUserReviewed = useMemo(() => {
    if (!isAuthenticated || !user || !reviews.length) {
      console.log('hasUserReviewed: Pre-check failed (not auth, no user, or no reviews)');
      return false;
    }
    const reviewed = reviews.some(review => review.userId === user.id);
    console.log('--- Debugging hasUserReviewed ---');
    console.log('Current User ID (from useAuth):', user?.id);
    console.log('Reviews fetched from backend:', reviews);
    console.log('Does any review match current user ID (hasUserReviewed)?', reviewed);
    console.log('---------------------------------');
    return reviewed;
  }, [isAuthenticated, user, reviews]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeRes = await axios.get(
          `https://api.spoonacular.com/recipes/${idReceita}/information`,
          {
            params: {
              apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
            },
          }
        )
        setData(recipeRes.data)

        const reviewRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipe/${idReceita}/reviews`,
          {
            params: {
              limit: 10,
              offset: 0,
            },
          }
        )
        console.log('API Response for Reviews:', reviewRes.data);
        setReviews(reviewRes.data)
      } catch (error) {
        console.error('Erro ao carregar dados da receita:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idReceita])

  const handleSubmit = async () => {
    if (!user || hasUserReviewed) {
      console.log('Submit prevented: User not authenticated or already reviewed.');
      return;
    }
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
          console.log('Reviews state updated (existing):', updatedReviews);
          return updatedReviews;
        } else {
          const newReviews = [...prevReviews, newOrUpdatedReview];
          console.log('Reviews state updated (new):', newReviews);
          return newReviews;
        }
      });

      setComment('')
      setGrade(3)
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Carregando receita...</p>
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
          <div
            className="text-[#22577A] text-lg font-medium whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: data.instructions }}
          />

          <h3 className="text-[#22577A] font-bold text-xl mt-6 mb-2">Avaliações:</h3>
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