// 1. Initial Page Load Animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
        }
    }, 1500); // Shorter, snappier transition time
});

// Fallback to ensure preloader is hidden even if DOMContentLoaded has already fired
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
    }
});

// 2. Interactive 3D Tilt Physics (Glass Form)
const tiltElements = document.querySelectorAll('.tilt-element');
// querySelectorAll is safe; if none exist, it just skips the loop
tiltElements.forEach(el => {
    el.addEventListener('mousemove', handleTilt);
    el.addEventListener('mouseleave', resetTilt);
});

function handleTilt(e) {
    const el = this;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    el.style.transition = 'none';
}

function resetTilt() {
    this.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    this.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
}

// 3. Reveal Elements on Scroll
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// 4. Form Submission Automation
const enquiryForm = document.getElementById('enquiryForm');

// Only run the form logic if the form actually exists on this page
if (enquiryForm) {
    enquiryForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const btn = document.getElementById('submitBtn');
        const preloader = document.getElementById('preloader');
        const loaderTitle = document.getElementById('loader-title');
        const loaderSubtitle = document.getElementById('loader-subtitle');
        
        // Safety check for preloader elements
        if (preloader && loaderTitle && loaderSubtitle) {
            loaderTitle.innerText = "Encrypting Data";
            loaderSubtitle.innerText = "Transmitting registration to BTPS Core Engine";
            preloader.classList.remove('hidden');
        }

        const enquiryData = {
            name: document.getElementById('fullName').value,
            phone: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            course: document.getElementById('course').value
        };

        // Send to backend REST API
        fetch('/api/enquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enquiryData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("API server responded with error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Lead captured by server:", data);
            completeSubmission(true);
        })
        .catch(err => {
            console.warn("Backend unavailable, fallback to local storage:", err);
            // Fallback storage
            const fallbackData = {
                ...enquiryData,
                id: "BTPS-LOCAL-" + Math.floor(Math.random() * 10000),
                timestamp: new Date().toLocaleString()
            };
            let savedData = JSON.parse(localStorage.getItem('btps_leads')) || [];
            savedData.push(fallbackData);
            localStorage.setItem('btps_leads', JSON.stringify(savedData));
            
            // Adjust subtitle to show local save warning
            if (loaderSubtitle) {
                loaderSubtitle.innerText = "Saved locally. Backend offline.";
            }
            completeSubmission(false);
        });

        function completeSubmission(isServerSaved) {
            setTimeout(() => {
                if (preloader) preloader.classList.add('hidden');
                
                if (btn) {
                    btn.innerText = isServerSaved ? "Access Granted. Seat Secured!" : "Offline Mode. Seat Saved!";
                    btn.style.background = isServerSaved 
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, #f59e0b, #d97706)";
                }
                enquiryForm.reset();
                
                setTimeout(() => {
                    if (btn) {
                        btn.innerText = "Deploy Application";
                        btn.style.background = "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))";
                    }
                }, 4000);
            }, 2000); // snappy response
        }
    });
}

// 5. Scroll Journey Line Animation
const journeyLine = document.getElementById('journey-line');

if (journeyLine) {
    // Wrapped in a try-catch just in case the element isn't an SVG path
    try {
        const pathLength = journeyLine.getTotalLength();
        
        // Setup starting position
        journeyLine.style.strokeDasharray = pathLength;
        journeyLine.style.strokeDashoffset = pathLength;

        const updateLine = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                const scrollPercentage = scrollTop / scrollHeight;
                const drawLength = pathLength * scrollPercentage;
                journeyLine.style.strokeDashoffset = pathLength - drawLength;
            }
        };

        // Draw initially to handle loaded/reloaded states
        updateLine();

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateLine();
                    ticking = false;
                });
                ticking = true;
            }
        });
    } catch (error) {
        console.warn("Journey line animation failed. Ensure #journey-line is an SVG <path> element.", error);
    }
}

// 6. Stats Number Count-Up Animation
const statsSection = document.querySelector('.stats-section');
const statNumbers = document.querySelectorAll('.stat-number');

if (statsSection && statNumbers.length > 0) {
    let countTriggered = false;

    const countUp = () => {
        statNumbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad formula
                const easeProgress = progress * (2 - progress);
                const value = Math.floor(easeProgress * target);
                
                num.innerText = value.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    num.innerText = target.toLocaleString();
                }
            };

            requestAnimationFrame(updateCount);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countTriggered) {
                countUp();
                countTriggered = true;
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
}