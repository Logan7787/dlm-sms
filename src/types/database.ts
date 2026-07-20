export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'manager' | 'staff';

export type MovementType = 'purchase_in' | 'usage_out' | 'damaged' | 'returned' | 'adjustment';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_phone: string | null
          contact_email: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_phone?: string | null
          contact_email?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_phone?: string | null
          contact_email?: string | null
          address?: string | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          sku: string
          name: string
          category_id: string | null
          supplier_id: string | null
          unit: string
          cost_price: number
          selling_price: number
          reorder_level: number
          photo_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          category_id?: string | null
          supplier_id?: string | null
          unit?: string
          cost_price?: number
          selling_price?: number
          reorder_level?: number
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          category_id?: string | null
          supplier_id?: string | null
          unit?: string
          cost_price?: number
          selling_price?: number
          reorder_level?: number
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          item_id: string
          movement_type: MovementType
          quantity: number
          reference_invoice_id: string | null
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          movement_type: MovementType
          quantity: number
          reference_invoice_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          movement_type?: MovementType
          quantity?: number
          reference_invoice_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_id: string | null
          status: InvoiceStatus
          subtotal: number
          tax_percent: number
          discount: number
          total: number
          amount_paid: number
          pdf_url: string | null
          issued_at: string
          due_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_id?: string | null
          status?: InvoiceStatus
          subtotal?: number
          tax_percent?: number
          discount?: number
          total?: number
          amount_paid?: number
          pdf_url?: string | null
          issued_at?: string
          due_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_id?: string | null
          status?: InvoiceStatus
          subtotal?: number
          tax_percent?: number
          discount?: number
          total?: number
          amount_paid?: number
          pdf_url?: string | null
          issued_at?: string
          due_at?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_id: string | null
          description: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Insert: {
          id?: string
          invoice_id: string
          item_id?: string | null
          description: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          invoice_id?: string
          item_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          method: string | null
          paid_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          method?: string | null
          paid_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          method?: string | null
          paid_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_table: string
          entity_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_table: string
          entity_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_table?: string
          entity_id?: string
          details?: Json | null
          created_at?: string
        }
      }
      studio_settings: {
        Row: {
          id: number
          studio_name: string
          studio_address: string
          studio_phone: string
          studio_email: string
          logo_url: string | null
          default_tax_percent: number
          currency_symbol: string
          updated_at: string
        }
        Insert: {
          id?: number
          studio_name?: string
          studio_address?: string
          studio_phone?: string
          studio_email?: string
          logo_url?: string | null
          default_tax_percent?: number
          currency_symbol?: string
          updated_at?: string
        }
        Update: {
          id?: number
          studio_name?: string
          studio_address?: string
          studio_phone?: string
          studio_email?: string
          logo_url?: string | null
          default_tax_percent?: number
          currency_symbol?: string
          updated_at?: string
        }
      }
    }
    Views: {
      items_with_stock: {
        Row: {
          id: string
          sku: string
          name: string
          category_id: string | null
          category_name: string | null
          supplier_id: string | null
          supplier_name: string | null
          unit: string
          cost_price: number
          selling_price: number
          reorder_level: number
          photo_url: string | null
          is_active: boolean
          created_at: string
          stock_on_hand: number
          is_low_stock: boolean
        }
      }
    }
    Functions: {
      item_stock_on_hand: {
        Args: { p_item_id: string }
        Returns: number
      }
      finalize_invoice: {
        Args: { p_invoice_id: string }
        Returns: void
      }
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
  }
}

export type ItemWithStock = Database['public']['Views']['items_with_stock']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type StudioSettings = Database['public']['Tables']['studio_settings']['Row'];
