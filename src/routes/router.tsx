import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'
import { CategoriasPage } from '../pages/CategoriasPage'
import { FichaTecnicaPratoPage } from '../pages/FichaTecnicaPratoPage'
import { FichasTecnicasPage } from '../pages/FichasTecnicasPage'
import { IngredientesPage } from '../pages/IngredientesPage'
import { ImportacaoPage } from '../pages/ImportacaoPage'
import { LoginPage } from '../pages/LoginPage'
import { PainelPage } from '../pages/PainelPage'
import { PratosPage } from '../pages/PratosPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/painel" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/painel',
            element: <PainelPage />,
          },
          {
            path: '/ingredientes',
            element: <IngredientesPage />,
          },
          {
            path: '/categorias',
            element: <CategoriasPage />,
          },
          {
            path: '/pratos',
            element: <PratosPage />,
          },
          {
            path: '/pratos/:id/ficha-tecnica',
            element: <FichaTecnicaPratoPage />,
          },
          {
            path: '/fichas-tecnicas',
            element: <FichasTecnicasPage />,
          },
          {
            path: '/importacao',
            element: <ImportacaoPage />,
          },
        ],
      },
    ],
  },
])
