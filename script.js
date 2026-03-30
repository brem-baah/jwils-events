(function () {

    // ── CONFIG ──────────────────────────────────────────────────────────────
    const PAYSTACK_PUBLIC_KEY = 'pk_live_49bf25182b74e52f2c21524d3cf2f6dbb4e014be';
    const WHATSAPP_NUMBER     = '233500860750';

    const PLANS = {
        full: { label: 'Full Payment',  amount: 100000, display: 'GH¢2,000' },
        half: { label: 'Half Payment',  amount: 50000, display: 'GH¢1,000' }
    };

    // ── SCROLL REVEAL ────────────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    // ── STICKY HEADER ────────────────────────────────────────────────────────
    var header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    // ── PLAN SELECTION (global — called from onclick in HTML) ────────────────
    var selectedPlan = 'full';

    window.selectPlan = function (plan) {
        selectedPlan = plan;
        document.getElementById('planFull').classList.toggle('selected', plan === 'full');
        document.getElementById('planHalf').classList.toggle('selected', plan === 'half');
    };

    // ── HELPERS ──────────────────────────────────────────────────────────────
    function generateRef() {
        return 'JWILS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    function getField(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function setPayBtn(loading) {
        var btn = document.getElementById('payBtn');
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading
            ? '<span class="spinner-border spinner-border-sm me-2"></span> Initializing...'
            : '<i class="fas fa-lock me-2"></i> Pay Securely with Paystack';
    }

    function showModalMsg(html, type) {
        var el = document.getElementById('modalMsg');
        if (!el) return;
        el.innerHTML = html;
        el.className = 'mt-3 small text-' + (type || 'danger');
    }

    // ── WHATSAPP NOTIFICATION ─────────────────────────────────────────────────
    function notifyWhatsApp(name, email, phone, plan, ref) {
        var msg = [
            '*New Registration — Business Growth Intensive*',
            '',
            '*Name:* '    + name,
            '*Email:* '   + email,
            '*Phone:* '   + phone,
            '*Plan:* '    + plan.label + ' (' + plan.display + ')',
            '*Ref:* '     + ref,
            '*Event:* 2nd May 2026 · Osu, Accra'
        ].join('\n');

        var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    }

    // ── PAYSTACK PAYMENT (global — called from onclick in HTML) ──────────────
    window.initiatePayment = function () {
        var name  = getField('regName');
        var email = getField('regEmail');
        var phone = getField('regPhone');

        // Basic validation
        if (!name || !email || !phone) {
            showModalMsg('⚠️ Please fill in all fields before proceeding.', 'danger');
            return;
        }

        var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(email)) {
            showModalMsg('⚠️ Please enter a valid email address.', 'danger');
            return;
        }

        var plan = PLANS[selectedPlan];
        var ref  = generateRef();

        setPayBtn(true);
        showModalMsg('', '');

        var handler = PaystackPop.setup({
            key:      PAYSTACK_PUBLIC_KEY,
            email:    email,
            amount:   plan.amount,   // in pesewas
            currency: 'GHS',
            ref:      ref,
            metadata: {
                custom_fields: [
                    { display_name: 'Full Name',  variable_name: 'full_name', value: name  },
                    { display_name: 'Phone',      variable_name: 'phone',     value: phone },
                    { display_name: 'Plan',       variable_name: 'plan',      value: plan.label + ' – ' + plan.display }
                ]
            },

            // ── SUCCESS ──
            callback: function (response) {
                setPayBtn(false);

                showModalMsg(
                    '✅ <strong>Payment confirmed!</strong> Ref: <code>' + response.reference + '</code><br>' +
                    'You\'ll receive a confirmation shortly. See you on 2nd May! 🎊',
                    'success'
                );

                // Send details to Judith on WhatsApp
                notifyWhatsApp(name, email, phone, plan, response.reference);
            },

            // ── CANCELLED ──
            onClose: function () {
                setPayBtn(false);
                showModalMsg('Payment was cancelled. Please try again when you\'re ready.', 'warning');
            }
        });

        handler.openIframe();
    };

    // ── SMOOTH SCROLL for anchor links ───────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── LIGHTBOX FUNCTIONALITY ─────────────────────────────────────────────
    (function() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLightbox);
        } else {
            initLightbox();
        }
        
        function initLightbox() {
            var lightbox = document.getElementById('imageLightbox');
            if (!lightbox) return; // Element not found, exit
            
            var lightboxImg = document.getElementById('lightboxImg');
            var closeBtn = lightbox.querySelector('.lightbox-close');
            var prevBtn = lightbox.querySelector('.lightbox-prev');
            var nextBtn = lightbox.querySelector('.lightbox-next');
            
            // Collect all carousel images
            var galleryImages = [];
            var currentIndex = 0;
            
            document.querySelectorAll('#proofCarousel .carousel-item img').forEach(function(img) {
                galleryImages.push({
                    src: img.src,
                    alt: img.alt
                });
            });
            
            // Add click handlers to carousel images
            document.querySelectorAll('#proofCarousel .carousel-item img').forEach(function(img, index) {
                img.addEventListener('click', function() {
                    currentIndex = index;
                    openLightbox(currentIndex);
                });
            });
            
            function openLightbox(index) {
                currentIndex = index;
                lightboxImg.src = galleryImages[currentIndex].src;
                lightboxImg.alt = galleryImages[currentIndex].alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
            
            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
            
            function showPrev() {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                lightboxImg.src = galleryImages[currentIndex].src;
                lightboxImg.alt = galleryImages[currentIndex].alt;
            }
            
            function showNext() {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                lightboxImg.src = galleryImages[currentIndex].src;
                lightboxImg.alt = galleryImages[currentIndex].alt;
            }
            
            // Event listeners
            closeBtn.addEventListener('click', closeLightbox);
            prevBtn.addEventListener('click', showPrev);
            nextBtn.addEventListener('click', showNext);
            
            // Close on background click
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    closeLightbox();
                }
                if (lightbox.classList.contains('active')) {
                    if (e.key === 'ArrowLeft') showPrev();
                    if (e.key === 'ArrowRight') showNext();
                }
            });
        }
    })();

})();
