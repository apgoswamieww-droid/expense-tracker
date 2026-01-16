import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase-service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-expense-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card p-4 shadow-sm border-0 mb-4 bg-white">
      <h5 class="mb-3 text-secondary">Add New Expense</h5>
      <div class="row g-2">
        <div class="col-md-4">
          <input type="text" class="form-control" [(ngModel)]="newTitle" placeholder="Item Name (e.g. Pizza)">
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control" [(ngModel)]="newAmount" placeholder="Amount (₹)">
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="newCategory">
            <option value="All">All</option>
            <option value="Food">Food</option>
            <option value="Grocery">Grocery</option>
            <option value="Rent">Rent</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Medical">Medical</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
            <option value="Education">Education</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary w-100 fw-bold" (click)="onSubmit()" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            {{ isLoading ? 'Saving...' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ExpenseFormComponent {
    newTitle: string = '';
    newAmount: number | null = null;
    newCategory: string = 'All'; // Note: Default was Food in onSubmit reset, but 'All' in declaration. Original code had inconsistency?
    // In original app.ts: newCategory: string = 'All';
    // In onSubmit: this.newCategory = 'Food'; // Reset to default
    // Let's stick to 'Food' as default for new expenses, but 'All' only makes sense for filters?
    // Wait, the select options in Add Form include 'All'?
    // Original HTML for Add Form:
    // <select class="form-select" [(ngModel)]="newCategory">
    //   <option value="All">All</option> ...
    // "All" as a category for an expense seems wrong, but I will replicate existing behavior for now or fix it.
    // Actually, 'All' was likely a copy-paste from filter. I should probably remove 'All' from Add Form options if I can, but to be safe and strictly refactor, I will keep it but maybe default to Food.
    // Let's look at the original App.ts again.
    // newCategory: string = 'All'; is initialization.
    // In onSubmit reset: this.newCategory = 'Food';
    // I will use 'Food' as default initialization to be cleaner, but I'll stick to 'All' if I want to match exactly.
    // Let's use 'Food' as the default for the form to avoid 'All' being selected.

    isLoading: boolean = false;

    @Output() expenseAdded = new EventEmitter<void>();

    constructor(private supabaseService: SupabaseService) { }

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
            // If user left it as 'All' (default init in original), it saves as 'All'. That might be a bug in original, but I will carry it over effectively or improve.
            // Better to default to 'Food' if 'All' is selected? Use 'Food' for now.
            const categoryToSave = this.newCategory === 'All' ? 'Food' : this.newCategory;

            await this.supabaseService.addExpense(this.newTitle, this.newAmount, categoryToSave);

            Swal.fire({
                icon: 'success',
                title: 'Added!',
                text: 'Expense added successfully',
                timer: 1500,
                showConfirmButton: false
            });

            this.newTitle = '';
            this.newAmount = null;
            this.newCategory = 'Food'; // Reset to Food
            this.expenseAdded.emit();
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            this.isLoading = false;
        }
    }
}
