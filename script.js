document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. SPLASH SCREEN & INITIALIZATION (TANPA PIN) ---
    const splashScreen = document.getElementById("splash-screen");
    const enterBtn = document.getElementById("enter-btn");
    const typingText = document.getElementById("typing-text");
    const splashSubtext = document.getElementById("splash-subtext");
    const loadProgress = document.getElementById("load-progress");
    const bgm = document.getElementById("bgm");
    const musicPlayer = document.getElementById("music-player");

    // Langsung mulai loading begitu website dibuka
    startLoading();

    function startLoading() {
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
                document.querySelector('.loader-ring').style.display = 'none';
                document.querySelector('.progress-bar-container').style.display = 'none';
                startTyping();
            }
            loadProgress.style.width = `${progress}%`;
        }, 150);
    }

    const textToType = "Haii sweet love...";
    let charIndex = 0;
    
    function startTyping() {
        if (charIndex < textToType.length) {
            typingText.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(startTyping, 150);
        } else {
            setTimeout(() => {
                splashSubtext.style.opacity = "1";
                splashSubtext.style.transform = "translateY(0)";
                enterBtn.classList.remove("disabled");
            }, 500);
        }
    }

    enterBtn.addEventListener("click", () => {
        if (enterBtn.classList.contains("disabled")) return;
        
        bgm.volume = 0.5;
        bgm.play().then(() => {
            document.querySelector('.vinyl-record').classList.add('playing');
        }).catch(err => console.log("Audio autoplay prevented"));

        splashScreen.style.opacity = "0";
        setTimeout(() => {
            splashScreen.style.display = "none";
            
            const mainContent = document.getElementById("main-content");
            const bottomNav = document.getElementById("bottom-nav");
            
            mainContent.style.display = "block";
            bottomNav.style.display = "block";
            musicPlayer.style.display = "flex";
            
            void mainContent.offsetWidth; 
            
            mainContent.classList.add("fade-in-content");
            bottomNav.classList.add("fade-in-content");
            musicPlayer.classList.add("show");
            
            initScrollAnimations();
        }, 1000);
    });

    // --- 2. MUSIC PLAYER CONTROLS ---
    const playPauseBtn = document.getElementById("play-pause-btn");
    const playIcon = playPauseBtn.querySelector("i");
    const vinyl = document.querySelector(".vinyl-record");
    const seekBar = document.getElementById("seek-bar");
    const volumeBar = document.getElementById("volume-bar");
    const currentTimeEl = document.getElementById("current-time");
    const durationTimeEl = document.getElementById("duration-time");

    playPauseBtn.addEventListener("click", () => {
        if (bgm.paused) {
            bgm.play();
            playIcon.classList.replace("fa-play", "fa-pause");
            vinyl.classList.add("playing");
        } else {
            bgm.pause();
            playIcon.classList.replace("fa-pause", "fa-play");
            vinyl.classList.remove("playing");
        }
    });

    bgm.addEventListener("timeupdate", () => {
        const current = bgm.currentTime;
        const duration = bgm.duration;
        if (!isNaN(duration)) {
            seekBar.value = (current / duration) * 100;
            currentTimeEl.textContent = formatTime(current);
            durationTimeEl.textContent = formatTime(duration);
        }
    });

    seekBar.addEventListener("input", () => {
        const duration = bgm.duration;
        bgm.currentTime = (seekBar.value / 100) * duration;
    });

    volumeBar.addEventListener("input", () => {
        bgm.volume = volumeBar.value / 100;
    });

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    }

    // --- 3. REALTIME CLOCK & COUNTDOWN ---
    function updateClocks() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('full-date').textContent = now.toLocaleDateString('id-ID', optionsDate);
        document.getElementById('main-clock').textContent = now.toLocaleTimeString('id-ID', { hour12: false });
        
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const wib = new Date(utc + (3600000 * 7));
        const wita = new Date(utc + (3600000 * 8));
        const wit = new Date(utc + (3600000 * 9));
        
        document.getElementById('wib-time').textContent = formatHHMM(wib);
        document.getElementById('wita-time').textContent = formatHHMM(wita);
        document.getElementById('wit-time').textContent = formatHHMM(wit);
    }
    
    function formatHHMM(date) {
        return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    function updateCountdown() {
        const now = new Date();
        let targetYear = now.getFullYear();
        let targetDate = new Date(targetYear, 6, 31); // 31 Juli
        if (now > targetDate) {
            targetDate = new Date(targetYear + 1, 6, 31);
        }
        const diff = targetDate - now;
        
        document.getElementById('cd-hari').textContent = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById('cd-jam').textContent = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        document.getElementById('cd-menit').textContent = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        document.getElementById('cd-detik').textContent = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 4. GSAP ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    function initScrollAnimations() {
        createParticles();
        const sections = document.querySelectorAll('.section-container:not(#beranda)');
        sections.forEach(sec => {
            gsap.fromTo(sec, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sec, start: "top 80%" } });
        });

        document.querySelectorAll('.gallery-item').forEach((item, i) => {
            gsap.fromTo(item, { opacity: 0, y: 100, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: (i % 2) * 0.2, scrollTrigger: { trigger: item, start: "top 85%" } });
        });

        document.querySelectorAll('.timeline-item').forEach((item) => {
            const isLeft = item.classList.contains('left');
            gsap.fromTo(item, { opacity: 0, x: isLeft ? -50 : 50 }, { opacity: 1, x: 0, duration: 0.8, scrollTrigger: { trigger: item, start: "top 80%" } });
        });

        document.querySelectorAll('.prose-content p, .letter-paper p, .final-letter p').forEach((p) => {
            gsap.fromTo(p, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: p, start: "top 90%" } });
        });
    }

    // --- 5. BOTTOM NAVIGATION ---
    const navLinks = document.querySelectorAll('#bottom-nav a');
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (scrollY >= (section.offsetTop - section.clientHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) link.classList.add('active');
        });
    });

    // --- 6. PARTICLES ---
    function createParticles() {
        const container = document.getElementById('particles-container');
        for (let i = 0; i < 20; i++) {
            let heart = document.createElement('i');
            heart.classList.add('fa-solid', 'fa-heart', 'floating-heart');
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDelay = Math.random() * 10 + 's';
            heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
            heart.style.fontSize = (Math.random() * 10 + 5) + 'px';
            container.appendChild(heart);
        }
    }

    // --- 7. ULTIMATE THREE.JS BULLETPROOF SETUP ---
    function setupThreeJSScene(canvasId) {
        const canvas = document.getElementById(canvasId);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false; 

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        scene.add(hemiLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        window.addEventListener('resize', () => {
            if(canvas.parentElement) {
                camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
            }
        });

        return { scene, camera, renderer, controls, dirLight };
    }

    function forceCenterAndScale(model, scene, camera) {
        const wrapper = new THREE.Group();
        scene.add(wrapper);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        if (maxDim > 0) {
            const scale = 3.5 / maxDim;
            model.scale.setScalar(scale);
        }

        const newBox = new THREE.Box3().setFromObject(model);
        const center = newBox.getCenter(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        wrapper.add(model);
        camera.position.set(0, 2, 7);
        camera.lookAt(0, 0, 0);

        return wrapper;
    }

    const gltfLoader = new THREE.GLTFLoader();
    const forceUpdate = '?t=' + new Date().getTime();

    // 7A. KUE ULANG TAHUN
    const cakeSetup = setupThreeJSScene('cake-canvas');
    let cakeWrapper;
    const blowBtn = document.getElementById('blow-candle-btn');
    const cakeMessage = document.getElementById('cake-message');

    gltfLoader.load('./assets/models/strawberry_cake.glb' + forceUpdate, (gltf) => {
        cakeWrapper = forceCenterAndScale(gltf.scene, cakeSetup.scene, cakeSetup.camera);
    }, undefined, (error) => {
        blowBtn.innerHTML = "3D File Error <i class='fa-solid fa-triangle-exclamation'></i>";
        blowBtn.style.backgroundColor = "#E11D48";
        console.error('Error Kue:', error);
    });

    function animateCake() {
        requestAnimationFrame(animateCake);
        if (cakeWrapper) cakeWrapper.rotation.y += 0.005; 
        cakeSetup.controls.update();
        cakeSetup.renderer.render(cakeSetup.scene, cakeSetup.camera);
    }
    animateCake();

    blowBtn.addEventListener('click', () => {
        if(blowBtn.style.backgroundColor === "rgb(225, 29, 72)") return;
        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#38BDF8', '#BAE6FD', '#FFFFFF', '#94A3B8'] });
        gsap.to(cakeSetup.dirLight, { intensity: 0, duration: 1 });
        gsap.to(cakeSetup.scene.children[0], { intensity: 0.2, duration: 1 }); 

        blowBtn.style.display = 'none';
        cakeMessage.classList.add('show');
    });

    // 7B. SECRET GIFT
    const giftSetup = setupThreeJSScene('gift-canvas');
    let giftWrapper, giftMixer;
    const openGiftBtn = document.getElementById('open-gift-btn');
    const giftRevealArea = document.getElementById('gift-reveal-area');
    const virtualHugBtn = document.getElementById('virtual-hug-btn');
    const hugOverlay = document.getElementById('hug-overlay');
    
    gltfLoader.load('./assets/models/furry_love.glb' + forceUpdate, (gltf) => {
        giftWrapper = forceCenterAndScale(gltf.scene, giftSetup.scene, giftSetup.camera);
        if (gltf.animations && gltf.animations.length > 0) {
            giftMixer = new THREE.AnimationMixer(gltf.scene);
            const action = giftMixer.clipAction(gltf.animations[0]);
            action.play();
        }
    }, undefined, (error) => {
        openGiftBtn.innerHTML = "3D File Error <i class='fa-solid fa-triangle-exclamation'></i>";
        openGiftBtn.style.backgroundColor = "#E11D48";
        console.error('Error Kado:', error);
    });

    const clock = new THREE.Clock();
    function animateGift() {
        requestAnimationFrame(animateGift);
        if (giftMixer) giftMixer.update(clock.getDelta());
        if (giftWrapper) giftWrapper.rotation.y += 0.003;
        giftSetup.controls.update();
        giftSetup.renderer.render(giftSetup.scene, giftSetup.camera);
    }

    openGiftBtn.addEventListener('click', () => {
        if(openGiftBtn.style.backgroundColor === "rgb(225, 29, 72)") return;
        openGiftBtn.style.display = 'none';
        giftRevealArea.style.display = 'block';
        animateGift();

        gsap.fromTo('.gift-wrapper', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" });
        gsap.to('.final-letter', { opacity: 1, y: 0, duration: 1, delay: 1, ease: "power2.out" });

        const end = Date.now() + 3000;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#38BDF8', '#FFF'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#38BDF8', '#FFF'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    });

    virtualHugBtn.addEventListener('click', () => {
        hugOverlay.classList.add('show');
        for(let i=0; i<50; i++) {
            setTimeout(() => {
                const heart = document.createElement('i');
                heart.classList.add('fa-solid', 'fa-heart');
                heart.style.position = 'absolute';
                heart.style.color = '#38BDF8';
                heart.style.fontSize = (Math.random() * 40 + 20) + 'px';
                heart.style.left = (Math.random() * 100) + 'vw';
                heart.style.top = '100vh';
                heart.style.opacity = '0';
                heart.style.filter = 'drop-shadow(0 0 10px rgba(56,189,248,0.8))';
                
                hugOverlay.appendChild(heart);
                gsap.to(heart, {
                    y: -window.innerHeight - 100, x: (Math.random() - 0.5) * 200,
                    opacity: Math.random() * 0.5 + 0.5, rotation: Math.random() * 360,
                    duration: Math.random() * 2 + 2, ease: "power1.out",
                    onComplete: () => heart.remove()
                });
            }, i * 50);
        }
        setTimeout(() => hugOverlay.classList.remove('show'), 4000);
    });
});
