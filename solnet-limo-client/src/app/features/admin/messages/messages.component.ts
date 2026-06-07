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
                  @if (m.isReplied) {
                    <span class="badge badge-replied">Replied</span>
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
                @if (!m.isReplied) {
                  <button class="btn-reply" (click)="openReply(m._id)" aria-label="Reply to customer">
                    <span class="material-icons" aria-hidden="true">reply</span>
                    Reply
                  </button>
                }
                <button class="btn-delete" (click)="deleteMessage(m._id)" aria-label="Delete message">
                  <span class="material-icons" aria-hidden="true">delete</span>
                  Delete
                </button>
              </div>

              @if (replyingTo() === m._id) {
                <div class="reply-compose">
                  <textarea
                    class="reply-textarea"
                    placeholder="Write your reply to {{ m.name }}..."
                    rows="5"
                    [disabled]="replying()"
                    (input)="replyText.set($any($event.target).value)">{{ replyText() }}</textarea>
                  @if (replyError()) {
                    <p class="reply-error">{{ replyError() }}</p>
                  }
                  <div class="reply-actions">
                    <button class="btn-send" [disabled]="replying() || !replyText().trim()" (click)="sendReply(m)">
                      <span class="material-icons" aria-hidden="true">send</span>
                      {{ replying() ? 'Sending...' : 'Send Reply' }}
                    </button>
                    <button class="btn-cancel-reply" [disabled]="replying()" (click)="cancelReply()">
                      Cancel
                    </button>
                  </div>
                </div>
              }
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

    .badge-replied {
      background: rgba(34,197,94,0.15);
      color: #4ade80;
      border: 1px solid rgba(34,197,94,0.3);
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .btn-reply {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: 1px solid rgba(201,168,76,0.4);
      border-radius: 6px;
      background: transparent;
      color: #c9a84c;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;

      &:hover { background: rgba(201,168,76,0.1); border-color: #c9a84c; }

      .material-icons { font-size: 16px; }
    }

    .reply-compose {
      margin-top: 16px;
      border-top: 1px solid rgba(201,168,76,0.2);
      padding-top: 16px;
    }

    .reply-textarea {
      width: 100%;
      background: #0d0d0d;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 6px;
      color: #e0e0e0;
      font-size: 0.9375rem;
      line-height: 1.6;
      padding: 12px 14px;
      resize: vertical;
      box-sizing: border-box;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;

      &:focus { border-color: #c9a84c; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .reply-error {
      color: #f87171;
      font-size: 0.85rem;
      margin: 8px 0 0;
    }

    .reply-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-send {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: #c9a84c;
      color: #000;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:not(:disabled):hover { opacity: 0.85; }

      .material-icons { font-size: 16px; }
    }

    .btn-cancel-reply {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #444;
      border-radius: 6px;
      color: #888;
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:not(:disabled):hover { border-color: #666; color: #bbb; }
    }
  `],
})
export class MessagesComponent implements OnInit {
  private contactService = inject(ContactService);
  messages = signal<ContactMessage[]>([]);
  loading = signal(true);
  replyingTo = signal<string | null>(null);
  replyText = signal('');
  replying = signal(false);
  replyError = signal<string | null>(null);

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

  openReply(id: string): void {
    this.replyingTo.set(id);
    this.replyText.set('');
    this.replyError.set(null);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
    this.replyText.set('');
    this.replyError.set(null);
  }

  sendReply(msg: ContactMessage): void {
    const body = this.replyText().trim();
    if (!body) return;

    this.replying.set(true);
    this.replyError.set(null);

    this.contactService.replyToMessage(msg._id, body).subscribe({
      next: (updated) => {
        this.messages.update((list) =>
          list.map((m) => (m._id === msg._id ? { ...m, isReplied: true, repliedAt: updated.repliedAt } : m))
        );
        this.replying.set(false);
        this.replyingTo.set(null);
        this.replyText.set('');
      },
      error: (err) => {
        this.replyError.set(err?.error?.message || 'Failed to send reply. Please try again.');
        this.replying.set(false);
      },
    });
  }
}
