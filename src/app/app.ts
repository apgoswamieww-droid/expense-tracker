import { Component, signal, OnInit } from '@angular/core';
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
  newTitle: string = '';
  newAmount: number = 0;
  newCategory: string = 'Food';

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    const { data } = await this.supabaseService.getUser();
    this.session = data.user;

    if (this.session) {
      await this.fetchExpenses(); // લોગિન હોય તો જ ડેટા લાવવા
    }
  }
  async logout() {
    await this.supabaseService.signOut();
    location.reload();
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
        await this.supabaseService.deleteExpense(id);
        await this.fetchExpenses();

        Swal.fire(
          'Deleted!',
          'Your expense has been deleted.',
          'success'
        );
      }
    });
  }
}
