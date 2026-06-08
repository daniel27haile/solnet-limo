import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FleetService } from '../../../core/services/fleet.service';
import { FleetVehicle } from '../../../core/models/fleet.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-fleet-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div>
      <div style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <h2 style="color:#fff; font-size:1.5rem;">Fleet Management</h2>
          <p style="color:#888; font-size:0.875rem;">Manage your vehicle fleet</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="toggleForm()">
          <span class="material-icons" aria-hidden="true">{{ showForm() ? 'close' : 'add' }}</span>
          {{ showForm() ? 'Cancel' : 'Add Vehicle' }}
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
          <h3 style="color:#c9a84c; margin-bottom:20px;">{{ editingId() ? 'Edit Vehicle' : 'Add New Vehicle' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label>Vehicle Name *</label>
                <input formControlName="name" placeholder="e.g. Premium Black SUV" />
              </div>
              <div class="form-group">
                <label>Image Path</label>
                <input formControlName="image" placeholder="assets/images/fleet/vehicle.jpg" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Passengers *</label>
                <input type="number" formControlName="passengers" placeholder="6" min="1" />
              </div>
              <div class="form-group">
                <label>Luggage Capacity *</label>
                <input type="number" formControlName="luggage" placeholder="6" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Features (comma-separated)</label>
              <input formControlName="featuresStr" placeholder="Leather Seats, Wi-Fi, Climate Control" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="3" placeholder="Vehicle description..."></textarea>
            </div>
            <div style="display:flex; gap:12px;">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (editingId() ? 'Update Vehicle' : 'Add Vehicle') }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else {
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Passengers</th>
                <th>Luggage</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (v of vehicles(); track v._id) {
                <tr>
                  <td>
                    <div>{{ v.name }}</div>
                    <div style="font-size:0.8rem; color:#888;">{{ v.features.slice(0,2).join(', ') }}</div>
                  </td>
                  <td>{{ v.passengers }}</td>
                  <td>{{ v.luggage }}</td>
                  <td>
                    <span class="badge" [class]="v.isActive ? 'badge-confirmed' : 'badge-cancelled'">
                      {{ v.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        class="btn-edit"
                        (click)="editVehicle(v)"
                        aria-label="Edit vehicle"
                      >
                        <span class="material-icons" aria-hidden="true">edit</span>
                      </button>
                      <button
                        [class]="v.isActive ? 'btn-toggle-off' : 'btn-toggle-on'"
                        (click)="toggleActive(v)"
                        [title]="v.isActive ? 'Mark Inactive' : 'Mark Active'"
                        [attr.aria-label]="v.isActive ? 'Mark ' + v.name + ' inactive' : 'Mark ' + v.name + ' active'"
                      >
                        <span class="material-icons" aria-hidden="true">{{ v.isActive ? 'toggle_on' : 'toggle_off' }}</span>
                        {{ v.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button
                        class="btn-delete"
                        (click)="deleteVehicle(v._id)"
                        aria-label="Delete vehicle"
                      >
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
  styles: [`
    .btn-toggle-on, .btn-toggle-off {
      padding: 6px 12px;
      min-height: 36px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      .material-icons { font-size: 0.875rem; }
    }
    .btn-toggle-on {
      background: rgba(34,197,94,0.12);
      color: #4ade80;
      border: 1px solid rgba(34,197,94,0.3);
      &:hover { background: rgba(34,197,94,0.22); }
    }
    .btn-toggle-off {
      background: rgba(251,191,36,0.12);
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
      &:hover { background: rgba(251,191,36,0.22); }
    }
  `],
})
export class FleetManagementComponent implements OnInit, OnDestroy {
  private fleetService = inject(FleetService);
  private fb = inject(FormBuilder);

  vehicles  = signal<FleetVehicle[]>([]);
  loading   = signal(true);
  saving    = signal(false);
  showForm  = signal(false);
  editingId = signal<string | null>(null);
  successMsg = signal('');
  errorMsg   = signal('');
  private msgTimer?: ReturnType<typeof setTimeout>;

  form = this.fb.group({
    name:        ['', Validators.required],
    image:       ['assets/images/fleet/default-vehicle.jpg'],
    passengers:  [null as number | null, Validators.required],
    luggage:     [null as number | null, Validators.required],
    featuresStr: [''],
    description: [''],
  });

  ngOnInit(): void {
    this.fleetService.getAllFleetAdmin().subscribe({
      next: (data) => { this.vehicles.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  editVehicle(v: FleetVehicle): void {
    this.editingId.set(v._id);
    this.form.patchValue({
      name: v.name,
      image: v.image,
      passengers: v.passengers,
      luggage: v.luggage,
      featuresStr: v.features.join(', '),
      description: v.description,
    });
    this.showForm.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const { featuresStr, ...rest } = this.form.value;
    const data = {
      ...rest,
      features: featuresStr ? featuresStr.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    };

    const wasEditing = !!this.editingId();
    const obs = this.editingId()
      ? this.fleetService.updateVehicle(this.editingId()!, data as any)
      : this.fleetService.createVehicle(data as any);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset({ image: 'assets/images/fleet/default-vehicle.jpg' });
        this.ngOnInit();
        this.showMsg('successMsg', wasEditing ? 'Vehicle updated.' : 'Vehicle added successfully.');
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

  toggleActive(v: FleetVehicle): void {
    const newStatus = !v.isActive;
    const msg = newStatus
      ? `Mark "${v.name}" as Active? It will become bookable on the website.`
      : `Mark "${v.name}" as Inactive? Users will see it but cannot book it.`;
    if (!confirm(msg)) return;

    this.fleetService.updateVehicle(v._id, { isActive: newStatus }).subscribe({
      next: (updated) => {
        this.vehicles.update((list) => list.map((item) => item._id === v._id ? updated : item));
        this.showMsg('successMsg', `"${v.name}" marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      },
      error: (err) => {
        this.showMsg('errorMsg', err?.error?.message || 'Failed to update status. Please try again.');
      },
    });
  }

  deleteVehicle(id: string): void {
    if (!confirm('Delete this vehicle?')) return;
    this.fleetService.deleteVehicle(id).subscribe({
      next: () => this.vehicles.update((list) => list.filter((v) => v._id !== id)),
    });
  }
}
