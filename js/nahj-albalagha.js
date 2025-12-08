class NahjAlBalagha {
  constructor() {
    this.baseURL = 'https://github.com/thaaerali/nahj-data/raw/refs/heads/main/data.json';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.data = [];
    this.pageLoaded = false;
    
    this.init();
  }

  async init() {
    await this.loadNahjPage();
    await this.loadData();
    this.renderContent();
  }

  async loadNahjPage() {
    try {
      // تحميل صفحة نهج البلاغة من ملف منفصل
      const response = await fetch('nahj-page.html');
      const html = await response.text();
      
      // إضافة الصفحة إلى body
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const nahjPage = tempDiv.firstElementChild;
      
      // إضافة الصفحة بعد كل الصفحات الموجودة
      document.body.insertBefore(nahjPage, document.querySelector('audio'));
      
      // حفظ العناصر
      this.elements = {
        nahjPage: document.getElementById('nahj-page'),
        nahjContent: document.getElementById('nahj-content'),
        nahjSearch: document.getElementById('nahj-search'),
        nahjSearchBtn: document.getElementById('nahj-search-btn'),
        nahjCategory: document.getElementById('nahj-category'),
        nahjPagination: document.getElementById('nahj-pagination'),
        nahjBackButton: document.getElementById('nahj-back-button')
      };
      
      this.pageLoaded = true;
      this.addEventListeners();
      
    } catch (error) {
      console.error('خطأ في تحميل صفحة نهج البلاغة:', error);
      // يمكنك عرض رسالة خطأ للمستخدم هنا
    }
  }

  addEventListeners() {
    // العودة من صفحة نهج البلاغة
    this.elements.nahjBackButton?.addEventListener('click', () => {
      this.showHomePage();
    });

    // البحث
    this.elements.nahjSearchBtn?.addEventListener('click', () => {
      this.searchContent();
    });

    this.elements.nahjSearch?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchContent();
      }
    });

    // تصفية حسب الفئة
    this.elements.nahjCategory?.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.currentPage = 1;
      this.renderContent();
    });
  }

  showNahjPage() {
    if (!this.pageLoaded) {
      this.init(); // تحميل الصفحة إذا لم تكن محملة
      return;
    }
    
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    this.elements.nahjPage.classList.add('active');
  }

  showHomePage() {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById('home-page').classList.add('active');
  }

  // ... باقي الدوال (loadData, renderContent, etc.)
}

// تهيئة نهج البلاغة
let nahjAlBalagha;

document.addEventListener('DOMContentLoaded', () => {
  // إنشاء كائن نهج البلاغة
  nahjAlBalagha = new NahjAlBalagha();
  
  // إضافة حدث لزر نهج البلاغة في الهيدر
  document.getElementById('nahj-button')?.addEventListener('click', () => {
    nahjAlBalagha.showNahjPage();
  });

});
