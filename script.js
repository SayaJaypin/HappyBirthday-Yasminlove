import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   CORE INITIALIZATION & STATE
   ========================================================================== */
const state = {
    isLoaded: false,
    isMusicPlaying: false,
    giftOpened: false
};

// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   LOADING SEQUENCE
   ========================================================================== */
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    
    tl.to('#progress', { width: '100%', duration: 1.5, ease: 'power3.inOut' })
      .to('.loader-text', { opacity: 1, y: -10, duration: 0.8 }, "-=1")
      .to('.loader', { yPercent: -100, duration: 1.2, ease: 'expo.inOut', delay: 0.5 })
      .from('.hero-title', { y: 100, opacity: 0, duration: 1.5, ease: 'power4.out', stagger: 0.2 }, "-=0.5")
      .from('.hero-subtitle', { opacity: 0, duration: 1 }, "-=1")
      .from('.scroll-btn', { opacity: 0, y: 20, duration: 1 }, "-=0.8")
      .call(() => {
          state.isLoaded = true;
          initScrollAnimations();
      });
});

/* ==========================================================================
   MUSIC PLAYER (Céline Dion Controller)
   ========================================================================== */
const bgMusic = document.getElementById('bg-music');
const playBtn = document.getElementById('play-btn');
const equalizer = document.querySelector('.equalizer');
const playText = document.getElementById('play-text');

playBtn.addEventListener('click', () => {
    if (state.isMusicPlaying) {
        bgMusic.pause();
        equalizer.classList.remove('playing');
        playText.textContent = "Putar Melodi Kita";
    } else {
        bgMusic.play();
        equalizer.classList.add('playing');
        playText.textContent = "Melodi Mengalun";
    }
    state.isMusicPlaying = !state.isMusicPlaying;
});

document.body.addEventListener('click', () => {
    if(!state.isMusicPlaying && state.isLoaded && !state.giftOpened){
        bgMusic.play().then(() => {
            state.isMusicPlaying = true;
            equalizer.classList.add('playing');
            playText.textContent = "Melodi Mengalun";
        }).catch(() => {});
    }
}, { once: true });

/* ==========================================================================
   THREE.JS SCENE 1 : HERO CAKE
   ========================================================================== */
const cakeContainer = document.getElementById('cake-canvas-container');
const scene1 = new THREE.Scene();
const camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera1.position.set(0, 2, 6);

const renderer1 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer1.setSize(window.innerWidth, window.innerHeight);
renderer1.setPixelRatio(Math.min(window.devicePixelRatio, 2));
cakeContainer.appendChild(renderer1.domElement);

// Lighting Premium Cake
const ambientLight1 = new THREE.AmbientLight(0xffffff, 0.8);
scene1.add(ambientLight1);

const dirLight1 = new THREE.DirectionalLight(0xffb6c1, 1.5);
dirLight1.position.set(5, 5, 5);
scene1.add(dirLight1);

const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.set(-5, 3, -5);
scene1.add(pointLight1);

let cakeModel;
const loader = new GLTFLoader();

loader.load('assets/models/strawberry_cake.glb', (gltf) => {
    cakeModel = gltf.scene;
    const scale = window.innerWidth < 768 ? 0.6 : 1;
    cakeModel.scale.set(scale, scale, scale);
    cakeModel.position.y = -1;
    scene1.add(cakeModel);
}, undefined, (error) => console.error('Error loading cake:', error));

const clock1 = new THREE.Clock();
function animateCake() {
    requestAnimationFrame(animateCake);
    if (cakeModel) {
        const time = clock1.getElapsedTime();
        cakeModel.rotation.y = time * 0.2; 
        cakeModel.position.y = -1 + Math.sin(time * 1.5) * 0.1; 
    }
    renderer1.render(scene1, camera1);
}
animateCake();

document.getElementById('scroll-down-btn').addEventListener('click', () => {
    lenis.scrollTo('.story-section', { duration: 1.5 });
});

/* ==========================================================================
   GSAP SCROLL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
    gsap.utils.toArray('.fade-up').forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            {
                opacity: 1, 
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    gsap.utils.toArray('.img-wrap').forEach(imgWrap => {
        const img = imgWrap.querySelector('img');
        gsap.to(img, {
            scale: 1.15,
            ease: "none",
            scrollTrigger: {
                trigger: imgWrap,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}

/* ==========================================================================
   MAGNETIC BUTTON EFFECT
   ========================================================================== */
const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: 'power2.out'
        });
    });
    
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.3)'
        });
    });
});

/* ==========================================================================
   SECRET GIFT SEQUENCE & THREE.JS LOVE
   ========================================================================== */
const giftBtn = document.getElementById('open-gift-btn');
const secretGiftLayer = document.getElementById('secret-gift');
const loveContainer = document.getElementById('love-canvas-container');

// Three.js Scene 2 : Love
const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera2.position.set(0, 0, 5);

const renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer2.setSize(window.innerWidth, window.innerHeight / 2);
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));
loveContainer.appendChild(renderer2.domElement);

const ambientLight2 = new THREE.AmbientLight(0xffffff, 1);
scene2.add(ambientLight2);
const pointLight2 = new THREE.PointLight(0xff1493, 2, 10);
pointLight2.position.set(0, 2, 2);
scene2.add(pointLight2);

let loveModel;
loader.load('assets/models/furry_love.glb', (gltf) => {
    loveModel = gltf.scene;
    const scale = window.innerWidth < 768 ? 0.8 : 1.2;
    loveModel.scale.set(scale, scale, scale);
    scene2.add(loveModel);
}, undefined, (e) => console.error(e));

const clock2 = new THREE.Clock();
function animateLove() {
    requestAnimationFrame(animateLove);
    if (loveModel && state.giftOpened) {
        const time = clock2.getElapsedTime();
        loveModel.rotation.y = time * 0.5;
        loveModel.position.y = Math.sin(time * 2) * 0.15;
    }
    renderer2.render(scene2, camera2);
}
animateLove();

const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let particles = [];
function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

class Particle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -10;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 3 + 2;
        this.size = Math.random() * 5 + 3;
        this.color = ['#D45079', '#E98EAD', '#FDE8ED', '#FFFFFF'][Math.floor(Math.random() * 4)];
        this.angle = Math.random() * 360;
        this.va = Math.random() * 2 - 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.va;
        if (this.y > confettiCanvas.height) {
            this.y = -10;
            this.x = Math.random() * confettiCanvas.width;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function renderConfetti() {
    if (!state.giftOpened) return;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(renderConfetti);
}

giftBtn.addEventListener('click', () => {
    state.giftOpened = true;
    lenis.stop(); 

    for (let i = 0; i < 100; i++) particles.push(new Particle());
    renderConfetti();

    gsap.to(secretGiftLayer, {
        autoAlpha: 1, 
        duration: 1.5,
        ease: 'power3.inOut'
    });

    gsap.fromTo(loveContainer, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 2, ease: 'elastic.out(1, 0.5)', delay: 1 }
    );

    const letterTexts = document.querySelectorAll('.letter-text');
    gsap.to(letterTexts, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        delay: 2,
        ease: 'power2.out'
    });
});

/* ==========================================================================
   WINDOW RESIZE HANDLER
   ========================================================================== */
window.addEventListener('resize', () => {
    camera1.aspect = window.innerWidth / window.innerHeight;
    camera1.updateProjectionMatrix();
    renderer1.setSize(window.innerWidth, window.innerHeight);

    camera2.aspect = window.innerWidth / (window.innerHeight / 2);
    camera2.updateProjectionMatrix();
    renderer2.setSize(window.innerWidth, window.innerHeight / 2);
});
