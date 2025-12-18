// nahj-app.js - يجمع كل المكونات
import NahjSermons from './nahj-sermons.js';
import NahjLetters from './nahj-letters.js';
import NahjWisdom from './nahj-wisdom.js';

class NahjAlBalaghaApp {
    constructor() {
        this.sermons = new NahjSermons();
        this.letters = new NahjLetters();
        this.wisdom = new NahjWisdom();
        
        this.currentView = 'sermons'; // 'sermons', 'letters', 'wisdom'
        
        this.init();
    }
    
    async init() {
        // تحميل جميع الفهارس بالتوازي
        await Promise.all([
            this.sermons.init(),
            this.letters.init(),
            this.wisdom.init()
        ]);
        
        this.setupNavigation();
        this.showView('sermons'); // العرض الافتراضي
    }
    
    setupNavigation() {
        // أزرار التنقل بين الأقسام
        document.getElementById('show-sermons').addEventListener('click', () => {
            this.showView('sermons');
        });
        
        document.getElementById('show-letters').addEventListener('click', () => {
            this.showView('letters');
        });
        
        document.getElementById('show-wisdom').addEventListener('click', () => {
            this.showView('wisdom');
        });
    }
    
    async showView(viewType) {
        this.currentView = viewType;
        
        // إخفاء كل المحتوى
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('d-none');
        });
        
        // إظهار القسم المطلوب
        const targetSection = document.getElementById(`${viewType}-section`);
        targetSection.classList.remove('d-none');
        
        // تحميل المحتوى المناسب
        switch(viewType) {
            case 'sermons':
                await this.sermons.loadSermon(1);
                targetSection.innerHTML = this.sermons.renderCurrentSermon();
                break;
                
            case 'letters':
                await this.letters.loadLetter(1);
                targetSection.innerHTML = this.letters.renderCurrentLetter();
                break;
                
            case 'wisdom':
                await this.wisdom.loadWisdom(1);
                targetSection.innerHTML = this.wisdom.renderCurrentWisdom();
                break;
        }
    }
}

// بدء التطبيق
window.nahjApp = new NahjAlBalaghaApp();