import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContactService } from '../../../core/services/contact.service';
import { ContactMessage } from '../../../core/models/contact.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent],
  template: `
    <div>
      <div style="margin-bottom:24px;">
        <h2 style="color:#fff; font-size:1.5rem;">Contact Messages</h2>
        <p style="color:#888; font-size:0.875rem;">Manage incoming messages from visitors</p>
      </div>

      @if (loading()) {
        <app-loading-spinner [fullscreen]="true" />
      } @else if (messages().length === 0) {
        <div style="text-align:center; padding:60px; color:#888;">No messages found.</div>
      } @else {
        <div style="display:flex; flex-direction:column; gap:16px;">
          @for (m of messages(); track m._id) {
            <div class="message-card" [class.unread]="!m.isRead">
              <div class="message-header">
                <div>
                  <strong style="color:#fff;">{{ m.name }}</strong>
                  <span style="color:#888; font-size:0.875rem; margin-left:12px;">{{ m.email }}</span>
                  @if (m.phone) {
                    <span style="color:#888; font-size:0.875rem; margin-left:12px;">{{ m.phone }}</span>
                  }
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="color:#888; font-size:0.8rem;">{{ m.createdAt | date:'mediumDate' }}</span>
                  @if (!m.isRead) {
                    <span class="badge badge-pending">Unread</span>
                  }
                </div>
              </div>
              <div style="margin:8px 0;">
                <strong style="color:#c9a84c; font-size:0.9rem;">{{ m.subject }}</strong>
              </div>
              <p style="color:#c0c0c0; font-size:0.9375rem; line-height:1.7; margin:0 0 16px;">{{ m.message }}</p>
              <div class="table-actions">
                @if (!m.isRead) {
                  <button class="btn-view" (click)="markRead(m._id)" aria-label="Mark as read">
                    <span class="material-icons" aria-hidden="true">mark_email_read</span>
                    Mark Read
                  </button>
                }
                <button class="btn-delete" (click)="deleteMessage(m._id)" aria-label="Delete message">
                  <span class="material-icons" aria-hidden="true">delete</span>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .message-card {
      background: #111;
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 8px;
      padding: 20px 24px;
      transition: border-color 0.2s ease;

      &.unread {
        border-left: 3px solid #c9a84c;
      }

      &:hover { border-color: rgba(201,168,76,0.35); }
    }

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
  `],
})
export class MessagesComponent implements OnInit {
  private contactService = inject(ContactService);
  messages = signal<ContactMessage[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.contactService.getMessages({ page: 1, limit: 50 }).subscribe({
      next: (data) => {
        this.messages.set(data.messages || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markRead(id: string): void {
    this.contactService.markAsRead(id).subscribe({
      next: () => {
        this.messages.update((list) =>
          list.map((m) => (m._id === id ? { ...m, isRead: true } : m))
        );
      },
    });
  }

  deleteMessage(id: string): void {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    this.contactService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.update((list) => list.filter((m) => m._id !== id));
      },
    });
  }
}
