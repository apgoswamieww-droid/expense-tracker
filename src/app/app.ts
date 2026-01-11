import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './supabase-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  expenses: any[] = [];
  newTitle: string = '';
  newAmount: number = 0;
  newCategory: string = 'Food';

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.fetchExpenses();
  }

  async fetchExpenses() {
    this.expenses = await this.supabaseService.getExpenses();
  }

  async onSubmit() {
    if (this.newTitle && this.newAmount > 0) {
      await this.supabaseService.addExpense(this.newTitle, this.newAmount, this.newCategory);
      this.newTitle = '';
      this.newAmount = 0;
      await this.fetchExpenses(); // લિસ્ટ રિફ્રેશ કરો
    }
  }

  async removeExpense(id: number) {
    await this.supabaseService.deleteExpense(id);
    await this.fetchExpenses();
  }
}
