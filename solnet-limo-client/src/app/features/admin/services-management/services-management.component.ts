import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ServicesDataService } from '../../../core/services/services-data.service';
import { Service } from '../../../core/models/service.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-services-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div>
      <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h2 style="color:#fff; font-size:1.5rem;">Services Management</h2>
          <p style="color:#888; font-size:0.875rem;">Add, edit, or remove services</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="toggleForm()">
          <span class="material-icons" aria-hidden="true">{{ showForm() ? 'close' : 'add' }}</span>
          {{ showForm() ? 'Cancel' : 'Add Service' }}
        </button>
      </div>

      @if (successMsg()) {
        <div class="alert alert-success" role="alert">{{ successMsg() }}</div>
      }
      @if (errorMsg()) {
        <div class="alert alert-error" role="alert">{{ errorMsg() }}</div>
      }

      @if (showForm()) {
        <div class="form-card" style="margin-bottom:32px;">
          <h3 style="color:#c9a84c; margin-bottom:20px;">{{ editingId() ? 'Edit Service' : 'Add New Service' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="title">Service Title *</label>
                <input id="title" formControlName="title" placeholder="e.g. Wedding" />
              </div>
              <div class="form-group">
                <label for="icon">Material Icon *</label>
                <input id="icon" formControlName="icon" placeholder="e.g. favorite" />
              </div>
            </div>
            <div class="form-group">
              <label for="description">Description *</label>
              <textarea id="description" formControlName="description" rows="3" placeholder="Service description..."></textarea>
            </div>
            <div style="display:flex; gap:12px;">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (editingId() ? 'Update Service' : 'Add Service') }}
              </button>
              @if (editingId()) {
                <button type="button" class="btn btn-outline" (click)="cancelEdit()">Cancel Edit</button>
              }
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else {
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of services(); track s._id) {
                <tr>
                  <td><span class="material-icons" style="color:#c9a84c;">{{ s.icon }}</span></td>
                  <td>{{ s.title }}</td>
                  <td style="color:#888; font-size:0.8rem;">{{ s.slug }}</td>
                  <td>
                    <span class="badge" [class]="s.isActive ? 'badge-confirmed' : 'badge-cancelled'">
                      {{ s.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-edit" (click)="editService(s)" aria-label="Edit service">
                        <span class="material-icons" aria-hidden="true">edit</span>
                      </button>
                      <button class="btn-delete" (click)="deleteService(s._id)" aria-label="Delete service">
                        <span class="material-icons" aria-hidden="true">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ServicesManagementComponent implements OnInit, OnDestroy {
  private svc = inject(ServicesDataService);
  private fb = inject(FormBuilder);

  services  = signal<Service[]>([]);
  loading   = signal(true);
  saving    = signal(false);
  showForm  = signal(false);
  editingId = signal<string | null>(null);
  successMsg = signal('');
  errorMsg   = signal('');
  private msgTimer?: ReturnType<typeof setTimeout>;

  form = this.fb.group({
    title:       ['', Validators.required],
    description: ['', Validators.required],
    icon:        ['directions_car'],
  });

  ngOnInit(): void {
    this.svc.getAllServicesAdmin().subscribe({
      next: (data) => { this.services.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  editService(s: Service): void {
    this.editingId.set(s._id);
    this.form.patchValue({ title: s.title, description: s.description, icon: s.icon });
    this.showForm.set(true);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ icon: 'directions_car' });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const obs = this.editingId()
      ? this.svc.updateService(this.editingId()!, this.form.value as any)
      : this.svc.createService(this.form.value as any);

    const wasEditing = !!this.editingId();
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset({ icon: 'directions_car' });
        this.ngOnInit();
        this.showMsg('successMsg', wasEditing ? 'Service updated.' : 'Service added successfully.');
      },
      error: (err) => {
        this.saving.set(false);
        this.showMsg('errorMsg', err?.error?.message || 'Failed to save. Please try again.');
      },
    });
  }

  private showMsg(type: 'successMsg' | 'errorMsg', text: string): void {
    this.successMsg.set('');
    this.errorMsg.set('');
    clearTimeout(this.msgTimer);
    if (type === 'successMsg') {
      this.successMsg.set(text);
    } else {
      this.errorMsg.set(text);
    }
    this.msgTimer = setTimeout(() => { this.successMsg.set(''); this.errorMsg.set(''); }, 4000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.msgTimer);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  deleteService(id: string): void {
    if (!confirm('Delete this service?')) return;
    this.svc.deleteService(id).subscribe({
      next: () => this.services.update((list) => list.filter((s) => s._id !== id)),
    });
  }
}
