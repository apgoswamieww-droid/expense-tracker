import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './supabase-service';
import { Auth } from './auth/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, Auth],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  session: any = null;
  expenses: any[] = [];
  isLoading: boolean = false;
  isInitializing: boolean = true; // New flag for initial load

  // Form Inputs
  newTitle: string = '';
  newAmount: number | null = null;
  newCategory: string = 'All';

  // Filters
  searchQuery: string = '';
  filterCategory: string = 'All';
  startDate: string = '';
  endDate: string = '';

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

  async onSubmit() {
    if (!this.newTitle || !this.newAmount || this.newAmount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please enter a valid title and amount!',
        timer: 2000
      });
      return;
    }

    this.isLoading = true;
    try {
      await this.supabaseService.addExpense(this.newTitle, this.newAmount, this.newCategory);

      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Expense added successfully',
        timer: 1500,
        showConfirmButton: false
      });

      this.newTitle = '';
      this.newAmount = null;
      this.newCategory = 'Food'; // Reset to default
      await this.fetchExpenses();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      this.isLoading = false;
    }
  }

  async removeExpense(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        await this.supabaseService.deleteExpense(id);
        await this.fetchExpenses();
        this.isLoading = false;
        Swal.fire('Deleted!', 'Your expense has been deleted.', 'success');
      }
    });
  }

  // Getters for Analytics & Filtering
  get filteredExpenses() {
    return this.expenses.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.filterCategory === 'All' || exp.category === this.filterCategory;

      let matchesDate = true;
      if (this.startDate && this.endDate) {
        const expDate = new Date(exp.created_at).getTime();
        const start = new Date(this.startDate).getTime();
        const end = new Date(this.endDate).getTime();
        // Include end date fully (end of day could be better, but simple comparison for now)
        // Adding 1 day to end date to make it inclusive if user picks same day
        const endInclusive = end + 86400000;
        matchesDate = expDate >= start && expDate < endInclusive;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }

  get totalBalance() {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  get savings() {
    return this.monthlyBudget - this.totalBalance;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterCategory = 'All';
    this.startDate = '';
    this.endDate = '';
  }
}
