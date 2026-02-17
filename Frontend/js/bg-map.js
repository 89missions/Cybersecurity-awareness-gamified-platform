window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('threat-map');
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
    }

    const init = () => {
        resize();
        particles = Array.from({length: 60}, () => new Particle());
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.update();
            ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2); ctx.fill();
            for(let j=i+1; j<particles.length; j++) {
                const d = Math.hypot(p.x-particles[j].x, p.y-particles[j].y);
                if(d < 150) {
                    ctx.strokeStyle = `rgba(96, 165, 250, ${0.15 - d/1000})`;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                }
            }
        });
        requestAnimationFrame(draw);
    };

    window.addEventListener('resize', init);
    init();
    draw();
});