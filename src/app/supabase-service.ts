import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // ૧. લોગિન યુઝરના ખર્ચ (Expenses) ડેટાબેઝમાંથી લાવવા
  async getExpenses() {
    const { data: { user } } = await this.supabase.auth.getUser();

    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user?.id) // ફક્ત લોગિન યુઝરનો ડેટા
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ૨. નવો ખર્ચ ઉમેરવો
  async addExpense(title: string, amount: number, category: string) {
    const { data: { user } } = await this.supabase.auth.getUser(); // લોગિન યુઝર મેળવો

    const { data, error } = await this.supabase
      .from('expenses')
      .insert([{
        title,
        amount,
        category,
        user_id: user?.id // આ લાઈન યુઝરને ડેટા સાથે લિંક કરશે
      }]);

    if (error) throw error;
    return data;
  }

  // ૨.૫. ખર્ચ અપડેટ કરવો (Edit Expense)
  async updateExpense(id: number, title: string, amount: number, category: string) {
    const { error } = await this.supabase
      .from('expenses')
      .update({ title, amount, category })
      .match({ id });

    if (error) throw error;
  }

  // ૩. ખર્ચ ડિલીટ કરવો
  async deleteExpense(id: number) {
    const { error } = await this.supabase.from('expenses').delete().match({ id });

    if (error) throw error;
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  // ૨. લોગિન કરવા (Sign In)
  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  // ૩. અત્યારે કયો યુઝર લોગિન છે તે જાણવા
  getUser() {
    return this.supabase.auth.getUser();
  }

  // ૪. લોગ આઉટ કરવા
  async signOut() {
    await this.supabase.auth.signOut();
  }
}
