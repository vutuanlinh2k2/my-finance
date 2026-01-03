export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      crypto_assets: {
        Row: {
          coingecko_id: string
          created_at: string
          icon_url: string | null
          id: string
          name: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coingecko_id: string
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coingecko_id?: string
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_portfolio_snapshots: {
        Row: {
          allocations: Json
          created_at: string
          id: string
          snapshot_date: string
          total_value_usd: number
          user_id: string
        }
        Insert: {
          allocations: Json
          created_at?: string
          id?: string
          snapshot_date: string
          total_value_usd: number
          user_id: string
        }
        Update: {
          allocations?: Json
          created_at?: string
          id?: string
          snapshot_date?: string
          total_value_usd?: number
          user_id?: string
        }
        Relationships: []
      }
      crypto_storages: {
        Row: {
          address: string | null
          created_at: string
          explorer_url: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number | null
          asset_id: string | null
          created_at: string
          date: string
          fiat_amount: number | null
          from_amount: number | null
          from_asset_id: string | null
          from_storage_id: string | null
          id: string
          linked_transaction_id: string | null
          storage_id: string | null
          to_amount: number | null
          to_asset_id: string | null
          to_storage_id: string | null
          tx_explorer_url: string | null
          tx_id: string | null
          type: Database["public"]["Enums"]["crypto_transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          date: string
          fiat_amount?: number | null
          from_amount?: number | null
          from_asset_id?: string | null
          from_storage_id?: string | null
          id?: string
          linked_transaction_id?: string | null
          storage_id?: string | null
          to_amount?: number | null
          to_asset_id?: string | null
          to_storage_id?: string | null
          tx_explorer_url?: string | null
          tx_id?: string | null
          type: Database["public"]["Enums"]["crypto_transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          date?: string
          fiat_amount?: number | null
          from_amount?: number | null
          from_asset_id?: string | null
          from_storage_id?: string | null
          id?: string
          linked_transaction_id?: string | null
          storage_id?: string | null
          to_amount?: number | null
          to_asset_id?: string | null
          to_storage_id?: string | null
          tx_explorer_url?: string | null
          tx_id?: string | null
          type?: Database["public"]["Enums"]["crypto_transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_from_asset_id_fkey"
            columns: ["from_asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_from_storage_id_fkey"
            columns: ["from_storage_id"]
            isOneToOne: false
            referencedRelation: "crypto_storages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_linked_transaction_id_fkey"
            columns: ["linked_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_storage_id_fkey"
            columns: ["storage_id"]
            isOneToOne: false
            referencedRelation: "crypto_storages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_to_asset_id_fkey"
            columns: ["to_asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_to_storage_id_fkey"
            columns: ["to_storage_id"]
            isOneToOne: false
            referencedRelation: "crypto_storages"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          source: string
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          source?: string
          to_currency: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          source?: string
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      net_worth_snapshots: {
        Row: {
          bank_balance: number
          created_at: string
          crypto_value_vnd: number
          exchange_rate: number
          id: string
          snapshot_date: string
          total_net_worth: number
          user_id: string
        }
        Insert: {
          bank_balance?: number
          created_at?: string
          crypto_value_vnd?: number
          exchange_rate?: number
          id?: string
          snapshot_date: string
          total_net_worth?: number
          user_id: string
        }
        Update: {
          bank_balance?: number
          created_at?: string
          crypto_value_vnd?: number
          exchange_rate?: number
          id?: string
          snapshot_date?: string
          total_net_worth?: number
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          day_of_month: number
          id: string
          last_payment_date: string | null
          management_url: string | null
          month_of_year: number | null
          tag_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          day_of_month: number
          id?: string
          last_payment_date?: string | null
          management_url?: string | null
          month_of_year?: number | null
          tag_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          day_of_month?: number
          id?: string
          last_payment_date?: string | null
          management_url?: string | null
          month_of_year?: number | null
          tag_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          emoji: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          tag_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          tag_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          tag_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_crypto_buy_sell_transaction: {
        Args: {
          p_amount: number
          p_asset_id: string
          p_crypto_type: string
          p_date: string
          p_fiat_amount: number
          p_linked_title: string
          p_linked_type: string
          p_storage_id: string
          p_tag_id: string
          p_tx_explorer_url: string
          p_tx_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_crypto_transfer_in_out_transaction: {
        Args: {
          p_amount: number
          p_asset_id: string
          p_crypto_type: string
          p_date: string
          p_fiat_amount: number
          p_linked_title: string
          p_linked_type: string
          p_storage_id: string
          p_tag_id: string
          p_tx_explorer_url: string
          p_tx_id: string
          p_user_id: string
        }
        Returns: string
      }
      get_all_time_totals: {
        Args: never
        Returns: {
          bank_balance: number
          total_expenses: number
          total_income: number
        }[]
      }
      get_last_day_of_month: {
        Args: { p_month: number; p_year: number }
        Returns: number
      }
      get_monthly_totals: {
        Args: { p_month: number; p_year: number }
        Returns: {
          total_expenses: number
          total_income: number
        }[]
      }
      invoke_net_worth_snapshot: { Args: never; Returns: number }
      invoke_subscription_payment_processor: { Args: never; Returns: number }
      is_subscription_due_today: {
        Args: {
          p_created_at: string
          p_day_of_month: number
          p_last_payment_date: string
          p_month_of_year: number
          p_type: string
        }
        Returns: boolean
      }
      process_subscription_payments: {
        Args: never
        Returns: {
          amount_vnd: number
          subscription_id: string
          title: string
          transaction_id: string
        }[]
      }
      update_exchange_rate: {
        Args: {
          p_from_currency: string
          p_rate: number
          p_source?: string
          p_to_currency: string
        }
        Returns: undefined
      }
    }
    Enums: {
      crypto_transaction_type:
        | "buy"
        | "sell"
        | "transfer_between"
        | "swap"
        | "transfer_in"
        | "transfer_out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      crypto_transaction_type: [
        "buy",
        "sell",
        "transfer_between",
        "swap",
        "transfer_in",
        "transfer_out",
      ],
    },
  },
} as const

