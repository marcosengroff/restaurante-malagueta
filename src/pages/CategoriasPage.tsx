import { useState } from 'react'
import { CategoriasIngredientesTab } from '../components/CategoriasIngredientesTab'
import { CategoriasPratosTab } from '../components/CategoriasPratosTab'
import { PageHeader } from '../components/PageHeader'

type CategoriaTab = 'ingredientes' | 'pratos'

export function CategoriasPage() {
  const [activeTab, setActiveTab] = useState<CategoriaTab>('ingredientes')

  return (
    <section>
      <PageHeader
        title="Categorias"
        description="Gerencie separadamente as categorias de ingredientes e as categorias de pratos."
      />

      <div className="mb-6 inline-flex rounded border border-stone-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          className={`rounded px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'ingredientes'
              ? 'bg-red-700 text-white'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
          onClick={() => setActiveTab('ingredientes')}
        >
          Ingredientes
        </button>
        <button
          type="button"
          className={`rounded px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'pratos'
              ? 'bg-red-700 text-white'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
          onClick={() => setActiveTab('pratos')}
        >
          Pratos
        </button>
      </div>

      {activeTab === 'ingredientes' ? (
        <CategoriasIngredientesTab />
      ) : (
        <CategoriasPratosTab />
      )}
    </section>
  )
}
