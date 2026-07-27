export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      categorias_ingredientes: {
        Row: {
          id: string
          codigo: string
          nome: string
          ordem_exibicao: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo?: string
          nome: string
          ordem_exibicao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          ordem_exibicao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingredientes: {
        Row: {
          id: string
          nome: string
          categoria_id: string | null
          unidade_compra: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
          quantidade_embalagem: number
          preco_embalagem: number
          unidade_base: 'g' | 'ml' | 'unidade'
          custo_unidade_base: number
          observacoes: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria_id?: string | null
          unidade_compra: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
          quantidade_embalagem: number
          preco_embalagem: number
          unidade_base: 'g' | 'ml' | 'unidade'
          custo_unidade_base?: number
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          categoria_id?: string | null
          unidade_compra?: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
          quantidade_embalagem?: number
          preco_embalagem?: number
          unidade_base?: 'g' | 'ml' | 'unidade'
          custo_unidade_base?: number
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ingredientes_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categorias_ingredientes'
            referencedColumns: ['id']
          },
        ]
      }
      categorias_pratos: {
        Row: {
          id: string
          codigo: string
          nome: string
          ordem_exibicao: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo?: string
          nome: string
          ordem_exibicao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          ordem_exibicao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pratos: {
        Row: {
          id: string
          codigo: string
          nome: string
          categoria_id: string
          descricao: string | null
          rendimento: number
          peso_final: number | null
          tempo_preparo: number | null
          observacoes: string | null
          custo_total: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo?: string
          nome: string
          categoria_id: string
          descricao?: string | null
          rendimento?: number
          peso_final?: number | null
          tempo_preparo?: number | null
          observacoes?: string | null
          custo_total?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          categoria_id?: string
          descricao?: string | null
          rendimento?: number
          peso_final?: number | null
          tempo_preparo?: number | null
          observacoes?: string | null
          custo_total?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pratos_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categorias_pratos'
            referencedColumns: ['id']
          },
        ]
      }
      itens_ficha_tecnica: {
        Row: {
          id: string
          prato_id: string
          ingrediente_id: string
          quantidade: number
          unidade_base: 'g' | 'ml' | 'unidade'
          observacao: string | null
          ordem: number
          quantidade_utilizada: number
          unidade_utilizada: 'g' | 'ml' | 'unidade'
          custo_calculado: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prato_id: string
          ingrediente_id: string
          quantidade: number
          unidade_base?: 'g' | 'ml' | 'unidade'
          observacao?: string | null
          ordem?: number
          quantidade_utilizada: number
          unidade_utilizada: 'g' | 'ml' | 'unidade'
          custo_calculado?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prato_id?: string
          ingrediente_id?: string
          quantidade?: number
          unidade_base?: 'g' | 'ml' | 'unidade'
          observacao?: string | null
          ordem?: number
          quantidade_utilizada?: number
          unidade_utilizada?: 'g' | 'ml' | 'unidade'
          custo_calculado?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'itens_ficha_tecnica_prato_id_fkey'
            columns: ['prato_id']
            isOneToOne: false
            referencedRelation: 'pratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'itens_ficha_tecnica_ingrediente_id_fkey'
            columns: ['ingrediente_id']
            isOneToOne: false
            referencedRelation: 'ingredientes'
            referencedColumns: ['id']
          },
        ]
      }
      perfis_usuarios: {
        Row: {
          id: string
          user_id: string | null
          email: string
          role: 'admin' | 'usuario'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          role?: 'admin' | 'usuario'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          role?: 'admin' | 'usuario'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      registrar_importacao_planilha: {
        Args: {
          nome_arquivo: string
          hash_arquivo: string
          tamanho_arquivo: number
          resumo: Json
          erros: Json
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
