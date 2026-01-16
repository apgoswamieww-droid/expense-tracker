import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card p-4 shadow-sm border-0 mb-4 bg-white" [ngClass]="{'border-primary border-2': isEditing}">
      <h5 class="mb-3" [ngClass]="isEditing ? 'text-primary' : 'text-secondary'">
        {{ isEditing ? 'Edit Expense' : 'Add New Expense' }}
      </h5>
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
        <div class="col-md-2 d-flex gap-1">
          <button class="btn w-100 fw-bold" [ngClass]="isEditing ? 'btn-success' : 'btn-primary'" (click)="onSubmit()" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
          </button>
          <button *ngIf="isEditing" class="btn btn-outline-secondary" (click)="onCancel()" title="Cancel Edit">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ExpenseFormComponent {
  newTitle: string = '';
  newAmount: number | null = null;
  newCategory: string = 'All';

  isLoading: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;

  @Output() expenseAdded = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  @Input() set expenseToEdit(value: any) {
    if (value) {
      this.isEditing = true;
      this.editingId = value.id;
      this.newTitle = value.title;
      this.newAmount = value.amount;
      this.newCategory = value.category;
    } else {
      this.resetForm();
    }
  }

  constructor(private supabaseService: SupabaseService) { }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.newTitle = '';
    this.newAmount = null;
    this.newCategory = 'Food'; // Default reset
  }

  onCancel() {
    this.resetForm();
    this.cancelEdit.emit();
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
      const categoryToSave = this.newCategory === 'All' ? 'Food' : this.newCategory;

      if (this.isEditing && this.editingId) {
        await this.supabaseService.updateExpense(this.editingId, this.newTitle, this.newAmount, categoryToSave);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Expense updated successfully',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await this.supabaseService.addExpense(this.newTitle, this.newAmount, categoryToSave);
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Expense added successfully',
          timer: 1500,
          showConfirmButton: false
        });
      }

      this.resetForm();
      this.expenseAdded.emit();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      this.isLoading = false;
    }
  }
}

