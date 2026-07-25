import {
  ClipboardList,
  FileSpreadsheet,
  FolderTree,
  Gauge,
  ListChecks,
  Soup,
  Utensils,
} from 'lucide-react'
import type { NavigationItem } from '../types/navigation'

export const navigationItems: NavigationItem[] = [
  {
    label: 'Painel',
    path: '/painel',
    icon: Gauge,
  },
  {
    label: 'Ingredientes',
    path: '/ingredientes',
    icon: Soup,
  },
  {
    label: 'Categorias',
    path: '/categorias',
    icon: FolderTree,
  },
  {
    label: 'Todos os pratos',
    path: '/pratos',
    icon: Utensils,
  },
  {
    label: 'Fichas Tecnicas',
    path: '/fichas-tecnicas',
    icon: ClipboardList,
  },
  {
    label: 'Importacao',
    path: '/importacao',
    icon: FileSpreadsheet,
  },
  {
    label: 'Conferencia',
    path: '/login',
    icon: ListChecks,
  },
]
