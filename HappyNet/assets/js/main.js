// 輪播圖功能
class Carousel {
    constructor(element) {
        this.element = element;
        this.items = Array.from(element.getElementsByClassName('carousel-item'));
        this.currentIndex = 0;
        this.interval = null;
        this.init();
    }

    init() {
        if (this.items.length > 0) {
            this.items[0].classList.add('active');
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.interval = setInterval(() => this.next(), 3000);
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.items.length;
        this.items[this.currentIndex].classList.remove('active');
        this.items[nextIndex].classList.add('active');
        this.currentIndex = nextIndex;
    }
}

// 卡片翻轉功能與答題
class FlipCard {
    constructor(element, onCorrect) {
        this.element = element;
        this.isFlipped = false;
        this.onCorrect = onCorrect;
        this.init();
    }

    init() {
        this.element.addEventListener('click', (e) => {
            // 只允許點正面時翻轉
            if (!this.isFlipped && e.target.closest('.flip-card-front')) {
                this.element.classList.add('flipped');
                this.isFlipped = true;
            }
        });
        // 綁定答題表單
        const form = this.element.querySelector('.quiz-form');
        if (form) {
            const btn = form.querySelector('.submit-btn');
            btn.addEventListener('click', () => this.checkAnswer(form));
        }
    }

    checkAnswer(form) {
        const radios = form.querySelectorAll('input[type="radio"]');
        let selected = null;
        radios.forEach(r => { if (r.checked) selected = r.value; });
        const answer = this.element.getAttribute('data-answer');
        const feedback = form.querySelector('.quiz-feedback');
        if (!selected) {
            feedback.textContent = '請先選擇一個答案';
            feedback.style.color = 'red';
            return;
        }
        if (selected === answer) {
            feedback.textContent = '答對了！';
            feedback.style.color = 'green';
            this.playSound();
            if (typeof this.onCorrect === 'function') this.onCorrect();
            // 禁用所有選項
            radios.forEach(r => r.disabled = true);
            form.querySelector('.submit-btn').disabled = true;
        } else {
            feedback.textContent = '答錯囉，再想想！';
            feedback.style.color = 'red';
        }
    }

    playSound() {
        const audio = document.getElementById('correct-audio');
        if (audio) audio.play();
    }
}

// 頁面切換功能
class PageManager {
    constructor() {
        this.entrancePage = document.getElementById('entrance-page');
        this.mainPage = document.getElementById('main-page');
        this.finalPage = document.getElementById('final-page');
        this.init();
    }

    init() {
        this.mainPage.style.display = 'none';
        this.finalPage.style.display = 'none';
        const enterButton = document.getElementById('enter-button');
        if (enterButton) {
            enterButton.addEventListener('click', () => this.enterMainPage());
        }
    }

    enterMainPage() {
        this.entrancePage.style.display = 'none';
        this.mainPage.style.display = 'block';
        this.mainPage.classList.add('fade-in');
    }

    enterFinalPage() {
        this.mainPage.style.display = 'none';
        this.finalPage.style.display = 'block';
        this.finalPage.classList.add('fade-in');
    }
}

// 照片牆自動橫向滾動
function startPhotoWallScroll() {
    const wall = document.querySelector('.photo-wall');
    if (!wall) return;
    // 複製一份照片，實現無縫循環
    wall.innerHTML += wall.innerHTML;
    let scrollX = 0;
    const speed = 1; // px/每幀
    function animate() {
        scrollX += speed;
        if (scrollX >= wall.scrollWidth / 2) {
            scrollX = 0;
        }
        wall.scrollLeft = scrollX;
        requestAnimationFrame(animate);
    }
    animate();
}

// 初始化
let correctCount = 0;
const TOTAL_QUIZ = 3;

document.addEventListener('DOMContentLoaded', () => {
    // 音效元素
    if (!document.getElementById('correct-audio')) {
        const audio = document.createElement('audio');
        audio.id = 'correct-audio';
        audio.src = 'assets/sound/correct.mp3';
        document.body.appendChild(audio);
    }

    // 啟動照片牆滾動
    startPhotoWallScroll();

    // 初始化頁面管理器
    const pageManager = new PageManager();

    // 初始化所有翻轉卡片
    const flipCards = Array.from(document.getElementsByClassName('flip-card'));
    flipCards.forEach(card => {
        new FlipCard(card, () => {
            correctCount++;
            if (correctCount === TOTAL_QUIZ) {
                setTimeout(() => pageManager.enterFinalPage(), 800);
            }
        });
    });
}); 