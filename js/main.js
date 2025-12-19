// js/main.js - التكامل بدون ES6 Modules
// ⚠️ احذف أو علق nahj-app.js من HTML

class NahjAlBalaghaApp {
    constructor() {
        // إنشاء نسخ من الكلاسات بدون import
        this.sermons = new window.NahjSermons();
        this.letters = new window.NahjLetters();
        this.wisdom = new window.NahjWisdom(); // إذا كنت قد أنشأت هذا الكلاس
        
        this.currentView = 'sermons';
        
        this.init();
    }
    
    async init() {
        // تهيئة المكونات
        await Promise.all([
            this.sermons.init('nahj-content'),
            this.letters.init()
        ]);
        
        this.setupNavigation();
        this.showView('sermons');
    }
    
    setupNavigation() {
        // تبويبات نهج البلاغة
        document.querySelectorAll('#nahj-tabs .nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showView(section);
            });
        });
    }
    
    async showView(viewType) {
        this.currentView = viewType;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('#nahj-tabs .nav-link').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-section') === viewType) {
                tab.classList.add('active');
            }
        });
        
        switch(viewType) {
            case 'sermons':
                await this.sermons.loadSermon(1);
                break;
                
            case 'letters':
                await this.letters.loadLetter(1);
                document.getElementById('nahj-content').innerHTML = this.letters.renderCurrentLetter();
                break;
        }
    }
}

// بدء التطبيق بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    // تحميل نهج البلاغة فقط عند الضغط على الزر
    document.getElementById('nahj-button').addEventListener('click', async () => {
        // تأكد من تحميل Bootstrap
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap غير محمل!');
            return;
        }
        
        // إنشاء التطبيق
        window.nahjApp = new NahjAlBalaghaApp();
        
        // تبديل الصفحات
        document.getElementById('home-page').classList.remove('active');
        document.getElementById('nahj-page').classList.add('active');
    });
    
    // زر العودة
    document.getElementById('nahj-back-button').addEventListener('click', () => {
        document.getElementById('nahj-page').classList.remove('active');
        document.getElementById('home-page').classList.add('active');
    });
});