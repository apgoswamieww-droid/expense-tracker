import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // ૧. બધા ખર્ચ (Expenses) ડેટાબેઝમાંથી લાવવા
  async getExpenses() {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ૨. નવો ખર્ચ ઉમેરવો
  async addExpense(title: string, amount: number, category: string) {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert([{ title, amount, category }]);

    if (error) throw error;
    return data;
  }

  // ૩. ખર્ચ ડિલીટ કરવો
  async deleteExpense(id: number) {
    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .match({ id });

    if (error) throw error;
  }
}
