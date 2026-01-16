import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './supabase-service';
import { Auth } from './auth/auth';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Auth, DashboardComponent, ExpenseFormComponent, ExpenseListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  session: any = null;
  expenses: any[] = [];
  isLoading: boolean = false;
  isInitializing: boolean = true;

  editingExpense: any = null; // State to hold expense being edited

  // Dashboard Constants
  readonly monthlyBudget = 15000;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    try {
      this.isInitializing = true;
      const { data } = await this.supabaseService.getUser();
      this.session = data.user;

      if (this.session) {
        await this.fetchExpenses();
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      this.isInitializing = false;
      this.cdr.detectChanges();
    }
  }

  async logout() {
    await this.supabaseService.signOut();
    location.reload();
  }

  async fetchExpenses() {
    this.isLoading = true;
    try {
      this.expenses = await this.supabaseService.getExpenses();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Handlers for Child Component Events

  // Called when expense is added or updated
  async onExpenseAdded() {
    this.editingExpense = null; // Clear edit mode if it was enabling
    await this.fetchExpenses();
  }

  // Called when user clicks cancel in form
  onCancelEdit() {
    this.editingExpense = null;
  }

  // Called when user clicks edit in list
  onEditExpense(expense: any) {
    this.editingExpense = expense;
  }

  // Called when delete is confirmed in ExpenseListComponent
  async onRemoveExpense(id: number) {
    this.isLoading = true;
    try {
      await this.supabaseService.deleteExpense(id);
      await this.fetchExpenses();
      Swal.fire('Deleted!', 'Your expense has been deleted.', 'success');
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      this.isLoading = false;
    }
  }

  get totalBalance() {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  get savings() {
    return this.monthlyBudget - this.totalBalance;
  }
}
