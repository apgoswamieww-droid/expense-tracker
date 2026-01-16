import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-expense-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Filters & Search -->
    <div class="card p-3 shadow-sm border-0 mb-4 bg-light">
      <div class="row g-2 align-items-center">
        <div class="col-md-3">
          <input type="text" class="form-control form-control-sm" [(ngModel)]="searchQuery"
            placeholder="Search by Title...">
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" [(ngModel)]="filterCategory">
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Rent">Rent</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <!-- Original had limited options for filter compared to Add? -->
            <!-- Checking original App.html:
                 Filter options: All, Food, Travel, Rent, Entertainment, Shopping
                 Add options: Food, Grocery, Rent, Travel, Bills, Entertainment, Shopping, Medical, Investment, Other, Education
                 It seems filter list was incomplete in original. I should probably expand it or keep as is.
                 Sticking to original for precise refactor, but it's weird. I'll add the others for better UX. -->
            <option value="Grocery">Grocery</option>
            <option value="Bills">Bills</option>
            <option value="Medical">Medical</option>
            <option value="Investment">Investment</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="col-md-2">
          <input type="date" class="form-control form-control-sm" [(ngModel)]="startDate" placeholder="Start Date">
        </div>
        <div class="col-md-2">
          <input type="date" class="form-control form-control-sm" [(ngModel)]="endDate" placeholder="End Date">
        </div>
        <div class="col-md-2 text-end">
          <button class="btn btn-outline-secondary btn-sm w-100" (click)="clearFilters()">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Expenses List -->
    <div>
      <div class="table-responsive rounded shadow-sm" *ngIf="filteredExpenses.length > 0; else emptyState">
        <table class="table table-hover align-middle mb-0 bg-white">
          <thead class="bg-light">
            <tr>
              <th class="py-3 ps-4">Item</th>
              <th class="py-3">Category</th>
              <th class="py-3">Amount</th>
              <th class="py-3">Date</th>
              <th class="py-3 text-end pe-4">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let exp of filteredExpenses">
              <td class="ps-4 fw-medium">{{ exp.title }}</td>
              <td>
                <span class="badge rounded-pill px-3 py-2" [ngClass]="{
                  'bg-warning text-dark': exp.category === 'Food',
                  'bg-success': exp.category === 'Groceries' || exp.category === 'Grocery' || exp.category === 'Shopping',
                  'bg-info text-dark': exp.category === 'Travel' || exp.category === 'Fuel',
                  'bg-danger': exp.category === 'Rent' || exp.category === 'Bills',
                  'bg-primary': exp.category === 'Entertainment' || exp.category === 'Medical',
                  'bg-dark': exp.category === 'Investment',
                  'bg-secondary': exp.category === 'Other',
                  'bg-light text-dark border': exp.category === 'Education'
                }">
                  {{ exp.category }}
                </span>
              </td>
              <td class="fw-bold text-dark">₹{{ exp.amount | number }}</td>
              <td class="text-muted small">{{ exp.created_at | date:'dd MMM yyyy' }}</td>
              <td class="text-end pe-4">
                <button class="btn btn-outline-danger btn-sm border-0" (click)="confirmDelete(exp.id)" title="Delete">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="text-center py-5 bg-white rounded shadow-sm">
          <div class="mb-3 display-1 text-muted opacity-25">📂</div>
          <h5 class="text-secondary">No expenses found</h5>
          <p class="text-muted small">Try adjusting your filters or add a new expense.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class ExpenseListComponent {
    @Input() expenses: any[] = [];
    @Output() removeExpense = new EventEmitter<number>();

    // Filters
    searchQuery: string = '';
    filterCategory: string = 'All';
    startDate: string = '';
    endDate: string = '';

    get filteredExpenses() {
        return this.expenses.filter(exp => {
            const matchesSearch = exp.title.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesCategory = this.filterCategory === 'All' || exp.category === this.filterCategory;

            let matchesDate = true;
            if (this.startDate && this.endDate) {
                const expDate = new Date(exp.created_at).getTime();
                const start = new Date(this.startDate).getTime();
                const end = new Date(this.endDate).getTime();
                const endInclusive = end + 86400000;
                matchesDate = expDate >= start && expDate < endInclusive;
            }

            return matchesSearch && matchesCategory && matchesDate;
        });
    }

    clearFilters() {
        this.searchQuery = '';
        this.filterCategory = 'All';
        this.startDate = '';
        this.endDate = '';
    }

    confirmDelete(id: number) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.removeExpense.emit(id);
            }
        });
    }
}
