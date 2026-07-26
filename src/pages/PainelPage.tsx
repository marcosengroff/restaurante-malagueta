import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CategoriesCard,
  ExpensiveRecipesCard,
  PendingRecipesCard,
  RecentUpdatesCard,
} from '../components/dashboard/DashboardCards'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSearch } from '../components/dashboard/DashboardSearch'
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from '../components/dashboard/DashboardStats'
import { QuickActions } from '../components/dashboard/QuickActions'
import { getDashboardData } from '../services/dashboardService'
import type { DashboardData } from '../types/dashboard'

export function PainelPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    setError('')

    getDashboardData()
      .then(setData)
      .catch((caughtError: unknown) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Não foi possível carregar o painel.',
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="space-y-6">
      <DashboardHeader />

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {isLoading ? (
        <>
          <DashboardStatsSkeleton />
          <DashboardSkeleton />
        </>
      ) : data ? (
        <>
          <DashboardStats
            stats={data.stats}
            primeiraFichaIncompletaId={data.pendingRecipes[0]?.id}
          />
          <DashboardSearch items={data.searchItems} />
          <QuickActions />

          {data.stats.totalPratos === 0 ? (
            <div className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Nenhum prato cadastrado.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Cadastre o primeiro prato para começar a montar as fichas técnicas.
              </p>
              <Link
                to="/pratos"
                className="mt-5 inline-flex rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Cadastrar primeiro prato
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                <PendingRecipesCard recipes={data.pendingRecipes} />
                <ExpensiveRecipesCard recipes={data.expensiveRecipes} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <CategoriesCard categories={data.categories} />
                <RecentUpdatesCard updates={data.recentUpdates} />
              </div>
            </>
          )}

          <DashboardFooter data={data.footer} />
        </>
      ) : null}
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-lg border border-stone-200 bg-white" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg border border-stone-200 bg-white" />
        <div className="h-80 animate-pulse rounded-lg border border-stone-200 bg-white" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg border border-stone-200 bg-white" />
        <div className="h-80 animate-pulse rounded-lg border border-stone-200 bg-white" />
      </div>
    </div>
  )
}
