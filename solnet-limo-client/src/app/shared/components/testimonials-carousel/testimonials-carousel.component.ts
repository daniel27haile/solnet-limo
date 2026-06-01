import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostBinding,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  NgZone,
  inject,
} from '@angular/core';
import { Testimonial, TestimonialCardComponent } from '../testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-testimonials-carousel',
  standalone: true,
  imports: [TestimonialCardComponent],
  templateUrl: './testimonials-carousel.component.html',
  styleUrls: ['./testimonials-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) testimonials: Testimonial[] = [];

  private cdr  = inject(ChangeDetectorRef);
  private el   = inject(ElementRef);
  private zone = inject(NgZone);

  currentIndex  = 0;
  cardsPerView  = 3;
  cardWidth     = 0;   // pixels — computed from actual host width
  isTransitioning = true;

  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Expose the computed card width to CSS so SCSS can size each item.
  @HostBinding('style.--card-width')
  get cssCardWidth(): string {
    return this.cardWidth > 0 ? `${this.cardWidth}px` : '';
  }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngAfterViewInit(): void {
    // ResizeObserver fires once immediately on observe(), giving us the initial size,
    // then again on every layout change — no need for window:resize.
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;
        if (width > 0) {
          this.zone.run(() => this.updateLayout(width));
        }
      });
      this.resizeObserver.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.resizeObserver?.disconnect();
  }

  private updateLayout(containerWidth: number): void {
    const next = containerWidth >= 1024 ? 3 : containerWidth >= 700 ? 2 : 1;
    this.cardsPerView = next;
    this.cardWidth    = containerWidth / next;

    // Clamp index to a valid page boundary after resize.
    const maxStart = Math.max(0, this.testimonials.length - this.cardsPerView);
    if (this.currentIndex > maxStart) {
      this.currentIndex = 0;
    }
    this.cdr.markForCheck();
  }

  // ── Computed values ────────────────────────────────────────────────────────

  get trackTransform(): string {
    // Pixel-based: each card is exactly cardWidth px wide, no percentage ambiguity.
    return `translateX(-${this.currentIndex * this.cardWidth}px)`;
  }

  get totalPages(): number {
    return Math.ceil(this.testimonials.length / this.cardsPerView);
  }

  get currentPage(): number {
    return Math.floor(this.currentIndex / this.cardsPerView);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  nextSlide(): void {
    const maxStart = this.testimonials.length - this.cardsPerView;
    if (this.currentIndex >= maxStart) {
      this.snapTo(0);
    } else {
      this.isTransitioning = true;
      this.currentIndex = Math.min(this.currentIndex + this.cardsPerView, maxStart);
      this.cdr.markForCheck();
    }
  }

  prevSlide(): void {
    if (this.currentIndex === 0) {
      const remainder = this.testimonials.length % this.cardsPerView;
      const lastStart = remainder === 0
        ? this.testimonials.length - this.cardsPerView
        : this.testimonials.length - remainder;
      this.snapTo(lastStart);
    } else {
      this.isTransitioning = true;
      this.currentIndex = Math.max(0, this.currentIndex - this.cardsPerView);
      this.cdr.markForCheck();
    }
  }

  /**
   * Instantly moves to targetIndex without a transition, then re-enables it
   * on the next animation frame — avoids the reverse-slide visual glitch on wrap.
   */
  private snapTo(targetIndex: number): void {
    this.isTransitioning = false;
    this.currentIndex = targetIndex;
    this.cdr.markForCheck();
    requestAnimationFrame(() => {
      this.isTransitioning = true;
      this.cdr.markForCheck();
    });
  }

  // ── Auto-slide ─────────────────────────────────────────────────────────────

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval !== null) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resetAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  // ── Button handlers ────────────────────────────────────────────────────────

  handleNext(): void {
    this.nextSlide();
    this.resetAutoSlide();
  }

  handlePrev(): void {
    this.prevSlide();
    this.resetAutoSlide();
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  trackById(_index: number, item: Testimonial): string {
    return item.name;
  }

  dotPages(): number[] {
    return Array(this.totalPages).fill(0);
  }

  snapToPage(pageIndex: number): void {
    const targetIndex = pageIndex * this.cardsPerView;
    const maxStart = Math.max(0, this.testimonials.length - this.cardsPerView);
    this.snapTo(Math.min(targetIndex, maxStart));
    this.resetAutoSlide();
  }
}
