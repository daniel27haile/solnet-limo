import { Component, OnInit, OnDestroy, inject, signal, ElementRef, viewChild, AfterViewChecked } from '@angular/core';
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
            <div class="msg-card" [class.msg-card--unread]="!m.isRead">

              <!-- Header row: sender info + badges + date -->
              <div class="msg-header">
                <div class="msg-sender">
                  <strong class="msg-name">{{ m.name }}</strong>
                  <span class="msg-email">{{ m.email }}</span>
                  @if (m.phone) {
                    <span class="msg-meta-item">{{ m.phone }}</span>
                  }
                </div>
                <div class="msg-badges">
                  <span class="msg-date">{{ m.createdAt | date:'mediumDate' }}</span>
                  @if (!m.isRead) {
                    <span class="badge badge-pending">Unread</span>
                  }
                  @if (m.isReplied) {
                    <span class="badge badge-replied">Replied</span>
                  }
                </div>
              </div>

              <!-- Subject preview -->
              @if (m.subject) {
                <p class="msg-subject">{{ m.subject }}</p>
              }

              <!-- Action buttons -->
              <div class="table-actions">
                <button class="btn-view" (click)="openModal(m)" aria-label="Open message from {{ m.name }}">
                  <span class="material-icons" aria-hidden="true">open_in_new</span>
                  Open
                </button>
                @if (!m.isReplied) {
                  <button class="btn-edit" (click)="openReply(m._id)" aria-label="Reply to {{ m.name }}">
                    <span class="material-icons" aria-hidden="true">reply</span>
                    Reply
                  </button>
                }
                <button class="btn-delete" (click)="deleteMessage(m._id)" aria-label="Delete message from {{ m.name }}">
                  <span class="material-icons" aria-hidden="true">delete</span>
                  Delete
                </button>
              </div>

              <!-- Inline reply compose -->
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
                  <div class="reply-footer">
                    <button
                      class="btn-send"
                      [disabled]="replying() || !replyText().trim()"
                      (click)="sendReply(m)">
                      <span class="material-icons" aria-hidden="true">send</span>
                      {{ replying() ? 'Sending...' : 'Send Reply' }}
                    </button>
                    <button class="btn-cancel" [disabled]="replying()" (click)="cancelReply()">
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

    <!-- ─────────────────────────────────────────────────────────────── -->
    <!--  Message detail modal                                           -->
    <!-- ─────────────────────────────────────────────────────────────── -->
    @if (activeMessage()) {
      <div
        #backdrop
        class="modal-backdrop"
        tabindex="-1"
        (click)="onBackdropClick($event)"
        (keydown.escape)="closeModal()">

        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title-' + activeMessage()!._id">

          <!-- Modal header -->
          <div class="modal-hdr">
            <h3 class="modal-title" [id]="'modal-title-' + activeMessage()!._id">
              Message from {{ activeMessage()!.name }}
            </h3>
            <button
              class="modal-close-btn"
              (click)="closeModal()"
              aria-label="Close message modal">
              <span class="material-icons" aria-hidden="true">close</span>
            </button>
          </div>

          <!-- Modal body -->
          <div class="modal-body">

            <!-- Sender details -->
            <div class="modal-meta">
              <div class="modal-meta-row">
                <span class="modal-meta-label">From</span>
                <span class="modal-meta-value">{{ activeMessage()!.name }}</span>
              </div>
              <div class="modal-meta-row">
                <span class="modal-meta-label">Email</span>
                <a class="modal-meta-link" href="mailto:{{ activeMessage()!.email }}">
                  {{ activeMessage()!.email }}
                </a>
              </div>
              @if (activeMessage()!.phone) {
                <div class="modal-meta-row">
                  <span class="modal-meta-label">Phone</span>
                  <span class="modal-meta-value">{{ activeMessage()!.phone }}</span>
                </div>
              }
              @if (activeMessage()!.subject) {
                <div class="modal-meta-row">
                  <span class="modal-meta-label">Subject</span>
                  <span class="modal-meta-value">{{ activeMessage()!.subject }}</span>
                </div>
              }
              <div class="modal-meta-row">
                <span class="modal-meta-label">Received</span>
                <span class="modal-meta-value">{{ activeMessage()!.createdAt | date:'medium' }}</span>
              </div>
            </div>

            <!-- Message body -->
            <div class="modal-msg-body">
              <p class="modal-msg-label">Message</p>
              <p class="modal-msg-text">{{ activeMessage()!.message }}</p>
            </div>

          </div>
          <!-- /modal-body -->

        </div>
        <!-- /modal-panel -->
      </div>
      <!-- /modal-backdrop -->
    }
  `,
  styles: [`
    /* ── Message cards ──────────────────────────────────────────────── */
    .msg-card {
      background: #111;
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 8px;
      padding: 20px 24px;
      transition: border-color 0.2s;

      &:is(.msg-card--unread) { border-left: 3px solid #c9a84c; }
      &:hover                  { border-color: rgba(201,168,76,0.4); }
    }

    .msg-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 6px;
    }

    .msg-sender {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .msg-name      { color: #fff; font-size: 0.9375rem; }
    .msg-email     { color: #888; font-size: 0.875rem; }
    .msg-meta-item { color: #888; font-size: 0.875rem; }

    .msg-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .msg-date { color: #888; font-size: 0.8rem; }

    .badge-replied {
      display: inline-block;
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-radius: 20px;
      background: rgba(34,197,94,0.15);
      color: #4ade80;
      border: 1px solid rgba(34,197,94,0.35);
    }

    .msg-subject {
      margin: 0 0 12px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #c9a84c;
    }

    /* ── Reply compose ──────────────────────────────────────────────── */
    .reply-compose {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(201,168,76,0.15);
    }

    .reply-textarea {
      width: 100%;
      background: #0d0d0d;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 6px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 0.9375rem;
      line-height: 1.6;
      padding: 12px 14px;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;

      &:focus    { border-color: #c9a84c; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .reply-error {
      margin: 6px 0 0;
      font-size: 0.85rem;
      color: #f87171;
    }

    .reply-footer {
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

      &:disabled             { opacity: 0.5; cursor: not-allowed; }
      &:not(:disabled):hover { opacity: 0.85; }
      .material-icons        { font-size: 16px; }
    }

    .btn-cancel {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #444;
      border-radius: 6px;
      color: #888;
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;

      &:disabled             { opacity: 0.5; cursor: not-allowed; }
      &:not(:disabled):hover { border-color: #666; color: #bbb; }
    }

    /* ── Modal backdrop ─────────────────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0,0,0,0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease forwards;
      outline: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Modal panel ────────────────────────────────────────────────── */
    .modal-panel {
      background: #161616;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 10px;
      width: 100%;
      max-width: 580px;
      max-height: 90dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.18s ease forwards;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .modal-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(201,168,76,0.15);
      flex-shrink: 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .modal-close-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      background: transparent;
      border: 1px solid #333;
      border-radius: 6px;
      color: #888;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;

      &:hover { border-color: #888; color: #fff; }
      .material-icons { font-size: 18px; }
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Meta rows ──────────────────────────────────────────────────── */
    .modal-meta {
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 6px;
      overflow: hidden;
    }

    .modal-meta-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);

      &:last-child { border-bottom: none; }
    }

    .modal-meta-label {
      flex-shrink: 0;
      width: 68px;
      font-size: 0.73rem;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .modal-meta-value {
      font-size: 0.9375rem;
      color: #ddd;
      word-break: break-word;
    }

    .modal-meta-link {
      font-size: 0.9375rem;
      color: #c9a84c;
      text-decoration: none;
      word-break: break-word;

      &:hover { text-decoration: underline; }
    }

    /* ── Message text block ─────────────────────────────────────────── */
    .modal-msg-body {
      background: #0d0d0d;
      border: 1px solid rgba(201,168,76,0.12);
      border-left: 3px solid #c9a84c;
      border-radius: 6px;
      padding: 16px 18px;
    }

    .modal-msg-label {
      margin: 0 0 10px;
      font-size: 0.73rem;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .modal-msg-text {
      margin: 0;
      font-size: 0.9375rem;
      color: #bbb;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `],
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  private contactService = inject(ContactService);

  readonly backdropRef = viewChild<ElementRef<HTMLDivElement>>('backdrop');

  messages      = signal<ContactMessage[]>([]);
  loading       = signal(true);
  activeMessage = signal<ContactMessage | null>(null);
  replyingTo    = signal<string | null>(null);
  replyText     = signal('');
  replying      = signal(false);
  replyError    = signal<string | null>(null);

  private modalJustOpened = false;

  ngOnInit(): void {
    this.contactService.getMessages({ page: 1, limit: 50 }).subscribe({
      next: (data) => {
        this.messages.set(data.messages || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngAfterViewChecked(): void {
    // Focus the backdrop after it renders so keydown.escape works immediately
    if (this.modalJustOpened) {
      this.backdropRef()?.nativeElement.focus();
      this.modalJustOpened = false;
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  // ── Modal ──────────────────────────────────────────────────────────

  openModal(msg: ContactMessage): void {
    this.activeMessage.set(msg);
    document.body.style.overflow = 'hidden';
    this.modalJustOpened = true;

    // Auto-mark unread messages as read when opened
    if (!msg.isRead) {
      this.contactService.markAsRead(msg._id).subscribe({
        next: () => {
          this.messages.update((list) =>
            list.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
          );
          // Keep the modal's copy in sync too
          this.activeMessage.update((m) => m ? { ...m, isRead: true } : null);
        },
      });
    }
  }

  closeModal(): void {
    this.activeMessage.set(null);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close if the click was directly on the backdrop, not the panel
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  // ── Actions ────────────────────────────────────────────────────────

  deleteMessage(id: string): void {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    this.contactService.deleteMessage(id).subscribe({
      next: () => {
        if (this.activeMessage()?._id === id) this.closeModal();
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
