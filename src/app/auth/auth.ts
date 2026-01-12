
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../supabase-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  email = '';
  password = '';
  isSignUp = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef // ૨. કન્સ્ટ્રક્ટરમાં એડ કરો
  ) { }

  async handleAuth() {
    if (!this.email || !this.password) {
      Swal.fire({ icon: 'warning', text: 'Enter email and password!' });
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // ૩. અહીં ચેન્જ ડિટેક્ટ કરો

    try {
      if (this.isSignUp) {
        const { error } = await this.supabase.signUp(this.email, this.password);
        if (error) throw error;
        Swal.fire({ title: 'Success', icon: 'success' });
      } else {
        const { error } = await this.supabase.signIn(this.email, this.password);
        if (error) throw error;
        location.reload();
      }
    } catch (error: any) {
      Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
    } finally {
      this.loading = false; // ૪. લોડિંગ બંધ કર્યું
      this.cdr.detectChanges(); // ૫. ખાસ: અહીં ફરીથી ચેન્જ ડિટેક્ટ કરો
    }
  }
}
