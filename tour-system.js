class TourSystem {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.spotlight = null;
        this.popover = null;

        this.handleResize = this.handleResize.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    init() {
        this.createOverlay();
    }

    createOverlay() {
        if (this.overlay) return;

        // Container
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';

        // Spotlight (The hole in the darkness)
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tour-spotlight';
        this.overlay.appendChild(this.spotlight);

        // Popover (The instruction card)
        this.popover = document.createElement('div');
        this.popover.className = 'tour-popover glass-panel';
        this.popover.innerHTML = `
            <div class="tour-header">
                <span class="tour-step-count">STEP 1/5</span>
                <button class="tour-close-btn">&times;</button>
            </div>
            <div class="tour-content">
                <h3 class="tour-title"></h3>
                <p class="tour-text"></p>
            </div>
            <div class="tour-footer">
                <button class="tour-btn tour-prev">PREV</button>
                <button class="tour-btn tour-next">NEXT</button>
            </div>
        `;
        this.overlay.appendChild(this.popover);

        document.body.appendChild(this.overlay);

        // Event Listeners
        this.popover.querySelector('.tour-close-btn').addEventListener('click', () => this.end());
        this.popover.querySelector('.tour-prev').addEventListener('click', () => this.prev());
        this.popover.querySelector('.tour-next').addEventListener('click', () => this.next());
    }

    start() {
        if (!this.overlay) this.init();
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.add('active');
        document.body.classList.add('tour-active');

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('keydown', this.handleKeydown);

        this.showStep(0);
    }

    end() {
        this.isActive = false;
        if (this.overlay) this.overlay.classList.remove('active');
        document.body.classList.remove('tour-active');

        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeydown);

        // Reset any temporary state changes (like opening menus) if desired,
        // but often better to leave user where they are.
    }

    async showStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        this.currentStep = index;

        const step = this.steps[index];

        // Execute pre-action (e.g., open a menu)
        if (step.preAction) {
            await step.preAction();
            // Allow a small delay for animations to settle
            await new Promise(r => setTimeout(r, 300));
        }

        const target = document.querySelector(step.target);
        if (!target) {
            console.warn(`Tour target not found: ${step.target}`);
            // Skip to next if target missing, or end if last
            if (index < this.steps.length - 1) this.next();
            return;
        }

        // Highlight Target
        this.positionSpotlight(target);
        this.updatePopoverContent(step, index);
        this.positionPopover(target, step.placement || 'bottom');

        // Update buttons
        const prevBtn = this.popover.querySelector('.tour-prev');
        const nextBtn = this.popover.querySelector('.tour-next');

        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === this.steps.length - 1 ? 'FINISH' : 'NEXT';
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.end();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    positionSpotlight(target) {
        const rect = target.getBoundingClientRect();
        const padding = 10; // Extra breathing room

        // Smooth transition handled by CSS
        this.spotlight.style.width = `${rect.width + (padding * 2)}px`;
        this.spotlight.style.height = `${rect.height + (padding * 2)}px`;
        // Overlay is fixed, so use viewport coordinates directly
        this.spotlight.style.top = `${rect.top - padding}px`;
        this.spotlight.style.left = `${rect.left - padding}px`;
    }

    updatePopoverContent(step, index) {
        this.popover.querySelector('.tour-step-count').textContent = `STEP ${index + 1}/${this.steps.length}`;
        this.popover.querySelector('.tour-title').textContent = step.title;
        this.popover.querySelector('.tour-text').textContent = step.text;
    }

    positionPopover(target, placement) {
        const rect = target.getBoundingClientRect();
        const popoverRect = this.popover.getBoundingClientRect();
        const padding = 20; // Gap between target and popover

        let top, left;

        // Basic positioning logic
        switch (placement) {
            case 'top':
                top = rect.top - popoverRect.height - padding;
                left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + padding;
                left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
                left = rect.left - popoverRect.width - padding;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (popoverRect.height / 2);
                left = rect.right + padding;
                break;
            case 'center':
                top = (window.innerHeight / 2) - (popoverRect.height / 2);
                left = (window.innerWidth / 2) - (popoverRect.width / 2);
                break;
            default: // bottom
                top = rect.bottom + padding;
                left = rect.left + (rect.width / 2) - (popoverRect.width / 2);
        }

        // Viewport collision detection (keep on screen)
        const margin = 10;
        if (left < margin) left = margin;
        if (left + popoverRect.width > window.innerWidth - margin) {
            left = window.innerWidth - popoverRect.width - margin;
        }
        if (top < margin) top = margin;
        if (top + popoverRect.height > window.innerHeight - margin) {
            top = window.innerHeight - popoverRect.height - margin;
        }

        // Overlay is fixed, so use viewport coordinates directly
        this.popover.style.top = `${top}px`;
        this.popover.style.left = `${left}px`;
    }

    handleResize() {
        if (this.isActive && this.steps[this.currentStep]) {
            const target = document.querySelector(this.steps[this.currentStep].target);
            if (target) {
                this.positionSpotlight(target);
                this.positionPopover(target, this.steps[this.currentStep].placement);
            }
        }
    }

    handleKeydown(e) {
        if (!this.isActive) return;

        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prev();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.end();
        }
    }
}

// Export if module system is used, otherwise global
if (typeof module !== 'undefined') {
    module.exports = TourSystem;
}
