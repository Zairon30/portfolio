import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

        // --- 1. Lenis Smooth Scroll ---
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);

        // --- 2. Custom Cursor Logic ---
        const cursor = document.getElementById('cursor');
        const hoverTargets = document.querySelectorAll('.hover-target');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        // Smooth cursor interpolation
        gsap.ticker.add(() => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            gsap.set(cursor, { x: cursorX, y: cursorY });
        });

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Hover scale effect
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                gsap.to(cursor, { width: 60, height: 60, duration: 0.3 });
            });
            target.addEventListener('mouseleave', () => {
                // If it doesn't have the 'hover-view' class (managed by projects list)
                if (!cursor.classList.contains('hover-view')) {
                    gsap.to(cursor, { width: 10, height: 10, duration: 0.3 });
                }
            });
        });

        // --- 3. Project Hover Logic (Image Follow & Cursor Change) ---
        const projectRows = document.querySelectorAll('.project-row');
        const imageContainer = document.getElementById('hover-image-container');
        const hoverImages = document.querySelectorAll('.hover-image');

        let imgX = mouseX;
        let imgY = mouseY;

        // Image container smooth follow
        gsap.ticker.add(() => {
            imgX += (mouseX - imgX) * 0.1;
            imgY += (mouseY - imgY) * 0.1;
            gsap.set(imageContainer, { x: imgX, y: imgY });
        });

        projectRows.forEach(row => {
            row.addEventListener('mouseenter', (e) => {
                const index = row.getAttribute('data-index');

                // Show Image Container
                gsap.to(imageContainer, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });

                // Switch active image
                hoverImages.forEach(img => img.classList.remove('active'));
                hoverImages[index].classList.add('active');

                // Change Cursor to "VIEW" state
                cursor.classList.add('hover-view');
            });

            row.addEventListener('mouseleave', () => {
                // Hide Image Container
                gsap.to(imageContainer, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.in" });

                // Reset Cursor
                cursor.classList.remove('hover-view');
                gsap.to(cursor, { width: 10, height: 10, duration: 0.3 });
            });
        });

        // --- 4. Magnetic Button Logic ---
        const magneticBtn = document.querySelector('.magnetic-btn');
        if (magneticBtn) {
            magneticBtn.addEventListener('mousemove', (e) => {
                const rect = magneticBtn.getBoundingClientRect();
                const h = rect.width / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - h;

                gsap.to(magneticBtn, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: "power2.out" });
            });
            magneticBtn.addEventListener('mouseleave', () => {
                gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
            });
        }

        // --- 5. GSAP Animations ---
        gsap.registerPlugin(ScrollTrigger);

        // Preloader Timeline
        let counter = { val: 0 };
        const loaderEl = document.getElementById('loader-counter');

        const tlLoader = gsap.timeline({
            onComplete: () => {
                document.getElementById('preloader').style.display = 'none';
                initHeroAnim();
            }
        });

        tlLoader.to(counter, {
            val: 100,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: function () {
                loaderEl.innerHTML = Math.round(counter.val);
            }
        })
            .to('#preloader', {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut",
                delay: 0.2
            });

        // Hero Entrance
        function initHeroAnim() {
            const tl = gsap.timeline();

            // 1 — Cinematic portrait reveal: clip-path uncovers from bottom upward
            tl.to('#hero-portrait-wrap', {
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.6,
                ease: 'power4.inOut'
            })
                // 2 — Photo itself settles into final scale/position
                .to('#hero-portrait', {
                    y: '0%',
                    scale: 1,
                    duration: 1.8,
                    ease: 'power3.out'
                }, '<0.1')
                // 3 — Name words rise
                .to('.hero-title span', {
                    y: '0%',
                    duration: 1.2,
                    stagger: 0.12,
                    ease: 'power4.out'
                }, '-=1.4')
                // 4 — Subtitle & scroll indicator fade in
                .to('.hero-elem', {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=0.8');
        }

        // --- Parallax mouse drift on portrait ---
        window.addEventListener('mousemove', (e) => {
            const portrait = document.getElementById('hero-portrait');
            if (!portrait) return;
            const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(portrait, {
                x: xPct * -12,
                y: yPct * -8,
                duration: 1.2,
                ease: 'power2.out'
            });
        });

        // Text Scrub Reveal (About Section)
        // Simple manual split text for words
        const scrubTextEl = document.getElementById('scrub-text');
        const words = scrubTextEl.innerText.split(' ');
        scrubTextEl.innerHTML = '';
        words.forEach(word => {
            const span = document.createElement('span');
            span.innerText = word + ' ';
            span.style.color = '#555555'; // Muted initial state
            span.style.transition = 'color 0.1s ease';
            scrubTextEl.appendChild(span);
        });

        const wordSpans = scrubTextEl.querySelectorAll('span');

        gsap.to(wordSpans, {
            color: '#f4f4f4',
            stagger: 0.1,
            scrollTrigger: {
                trigger: scrubTextEl,
                start: "top 80%",
                end: "bottom 50%",
                scrub: 1
            }
        });

        // Standard Fade Ups
        document.querySelectorAll('.fade-up').forEach(el => {
            gsap.fromTo(el,
                { y: 40, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out"
                }
            );
        });

        // --- 6. Dialog & View Transitions Logic ---
        const projectsData = [
            {
                title: "Supply Inventory",
                role: "Full Stack System",
                category: "Enterprise Software",
                year: "2023",
                tech: ["C#", "ASP.NET Core", "SQL Server", "JavaScript"],
                desc: "A full-cycle supply request and monitoring platform built for internal operations. Staff can file requests for office supplies — from bond paper to peripherals — directly through the system, eliminating manual requisition forms. The supply officer gains a real-time dashboard to track stock levels, approve or reject requests, and set automated reorder thresholds before shortages occur. Every transaction is logged, giving management a clear audit trail and consumption trends over time."
            },
            {
                title: "Collateral Mgt",
                role: "Architecture",
                category: "Banking Operations",
                year: "2023",
                tech: ["C#", "ASP.NET Core", "SQL Server", "AJAX"],
                desc: "A centralized collateral management system designed to eliminate the risk of lost or misfiled loan documents. Each client's collateral — titles, deeds, vehicle OR, and other assets — is catalogued with a structured filing hierarchy, making retrieval instant instead of manual. Officers can flag expiring documents, track custody transfers between branches, and generate status reports on active loans. Built to bring order to one of the most document-heavy workflows in banking operations."
            },
            {
                title: "IT Inventory",
                role: "Hardware Tracking",
                category: "Asset Management",
                year: "2024",
                tech: ["C#", "ASP.NET Core", "SQL Server", "jQuery"],
                desc: "A paperless asset management system that gives IT teams full visibility into every computer unit across all branches. Each device is tagged with its assigned employee, location, and condition status. When hardware fails, staff can raise a digital transmittal form directly in the system — no paper, no follow-up calls. Administrators can trace equipment history, schedule maintenance, and approve transfers between branches from a single interface. Designed to cut resolution time and reduce untracked asset loss."
            },
            {
                title: "Sigcard Monitor",
                role: "Data Processing",
                category: "Compliance Tool",
                year: "2024",
                tech: ["C#", "SQL Server", "AJAX", "JavaScript"],
                desc: "A precision monitoring tool built to manage the full lifecycle of deposit account signature cards. The system distinguishes between active and dormant accounts, flagging irregularities and ensuring every account has a valid, on-file sigcard. Compliance officers can run audits, generate dormancy reports, and track the transaction history of accounts approaching regulatory thresholds — all without touching a physical file. Built to keep the bank aligned with BSP compliance standards."
            },
            {
                title: "Online Application",
                role: "Client-Facing Platform",
                category: "Web Application",
                year: "2024",
                tech: ["PHP", "JavaScript", "MySQL", "HTML / CSS"],
                desc: "A web-based portal where clients can browse available company products and submit applications online — no branch visit required. Designed to make the inquiry and application process more accessible, it puts product information directly in the hands of clients and removes the friction of in-person visits."
            }
        ];

        const dialog = document.getElementById('project-dialog');
        const dialogImg = document.getElementById('dialog-img');
        const dialogTitle = document.getElementById('dialog-title');
        const dialogIndex = document.getElementById('dialog-index');
        const dialogRole = document.getElementById('dialog-role');
        const dialogDesc = document.getElementById('dialog-desc');
        const dialogYear = document.getElementById('dialog-year');
        const dialogCategory = document.getElementById('dialog-category');
        const dialogTech = document.getElementById('dialog-tech');
        const dialogClose = document.getElementById('dialog-close');
        let activeProjectIndex = 0;

        // Attach custom cursor hover state to close button
        dialogClose.addEventListener('mouseenter', () => gsap.to(cursor, { width: 60, height: 60, duration: 0.3 }));
        dialogClose.addEventListener('mouseleave', () => gsap.to(cursor, { width: 10, height: 10, duration: 0.3 }));

        projectRows.forEach((row) => {
            row.addEventListener('click', () => {
                const index = row.getAttribute('data-index');
                activeProjectIndex = index;
                const activeHoverImg = hoverImages[index];
                const data = projectsData[index];

                if (document.startViewTransition) {
                    // Tag the currently floating hover image for the morph transition
                    activeHoverImg.style.viewTransitionName = 'project-img';
                    document.startViewTransition(() => {
                        openDialog(data, activeHoverImg.src);
                    }).finished.then(() => {
                        // Clean up transition names
                        activeHoverImg.style.viewTransitionName = '';
                    });
                } else {
                    openDialog(data, activeHoverImg.src);
                }
            });
        });

        function openDialog(data, imgSrc) {
            const num = '0' + (parseInt(activeProjectIndex) + 1);

            dialogImg.src = imgSrc;
            dialogTitle.innerText = data.title;
            dialogIndex.innerText = num;
            dialogRole.innerText = data.role;
            dialogDesc.innerText = data.desc;
            dialogYear.innerText = data.year;
            dialogCategory.innerText = data.category;

            dialogTech.innerHTML = data.tech
                .map(t => `<span class="text-sm font-sans text-fg/70">— ${t}</span>`)
                .join('');

            dialog.scrollTop = 0;
            dialog.show();
            lenis.stop();
        }

        dialogClose.addEventListener('click', () => {
            if (document.startViewTransition) {
                const activeHoverImg = hoverImages[activeProjectIndex];
                activeHoverImg.style.viewTransitionName = 'project-img';

                document.startViewTransition(() => {
                    closeDialog();
                }).finished.then(() => {
                    activeHoverImg.style.viewTransitionName = '';
                });
            } else {
                closeDialog();
            }
        });

        function closeDialog() {
            dialog.close();
            lenis.start();

            // Clean up cursor states
            gsap.to(imageContainer, { opacity: 0, scale: 0.8, duration: 0.4 });
            cursor.classList.remove('hover-view');
            gsap.to(cursor, { width: 10, height: 10, duration: 0.3 });
        }

        // --- 7. Services Stacked Cards ---
        const serviceCards = gsap.utils.toArray('.service-card');

        if (serviceCards.length > 0) {
            // All cards except the first start below the viewport
            gsap.set(serviceCards.slice(1), { yPercent: 100 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#services-sticky-wrapper',
                    start: 'top top',
                    end: () => `+=${(serviceCards.length - 1) * window.innerHeight}`,
                    pin: '#services-pin',
                    scrub: 1,
                    anticipatePin: 1,
                }
            });

            serviceCards.forEach((card, i) => {
                if (i === 0) return;

                // Slide incoming card up from below
                tl.to(card, { yPercent: 0, ease: 'none', duration: 1 }, i - 1);

                // Push all previous cards back: scale down + shift up
                for (let j = 0; j < i; j++) {
                    const depth = i - j;
                    tl.to(serviceCards[j], {
                        scale: 1 - depth * 0.04,
                        y: -(depth * 18),
                        ease: 'none',
                        duration: 1
                    }, i - 1);
                }
            });
        }

