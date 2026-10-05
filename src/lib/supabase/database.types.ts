/**
 * Database types for the Supabase client. Mirrors supabase/migrations.
 * Can be regenerated with `npx supabase gen types typescript --project-id <ref>`.
 */
export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          currency: string;
          merchant: string;
          category_id: string;
          source: "apple_pay" | "cal" | "max" | "manual";
          card_last4: string | null;
          note: string | null;
          external_ref: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          date: string;
          amount: number;
          currency?: string;
          merchant: string;
          category_id?: string;
          source: "apple_pay" | "cal" | "max" | "manual";
          card_last4?: string | null;
          note?: string | null;
          external_ref?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
