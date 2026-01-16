import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 bg-primary text-white h-100">
          <div class="card-body">
            <h6 class="card-title opacity-75">Total Balance</h6>
            <h3 class="fw-bold mb-0">₹{{ totalBalance | number }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-0 bg-light h-100">
          <div class="card-body">
            <h6 class="card-title text-muted">Monthly Budget</h6>
            <h3 class="fw-bold mb-0 text-dark">₹{{ monthlyBudget | number }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100"
          [ngClass]="savings >= 0 ? 'bg-success text-white' : 'bg-danger text-white'">
          <div class="card-body">
            <h6 class="card-title opacity-75">Savings</h6>
            <h3 class="fw-bold mb-0">₹{{ savings | number }}</h3>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
    @Input() totalBalance: number = 0;
    @Input() monthlyBudget: number = 0;
    @Input() savings: number = 0;
}
