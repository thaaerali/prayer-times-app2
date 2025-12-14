class NahjAlBalagha {
  constructor() {
    this.baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/data.json';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.data = [];
    this.pageLoaded = false;
    
    // تهيئة عند تحميل الصفحة
    this.init();
  }

  async init() {
    // تحميل الصفحة عند الحاجة فقط
    await this.ensurePageLoaded();
    await this.loadData();
    this.renderContent();
  }

  async ensurePageLoaded() {
    // إذا كانت الصفحة محملة بالفعل، لا تحملها مجدداً
    if (this.pageLoaded) return;

    try {
      console.log('جاري تحميل صفحة نهج البلاغة...');
      
      // تحميل صفحة نهج البلاغة من ملف منفصل
      const response = await fetch('nahj-page.html');
      
      if (!response.ok) {
        throw new Error(`فشل تحميل الصفحة: ${response.status}`);
      }
      
      const html = await response.text();
      
      // إنشاء عنصر مؤقت وإضافة الصفحة إليه
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const nahjPage = tempDiv.firstElementChild;
      
      // إضافة الصفحة إلى body
      document.body.appendChild(nahjPage);
      
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
      
      // إضافة الأنماط إذا لم تكن موجودة
      this.addStyles();
      
      // إضافة الأحداث
      this.addEventListeners();
      
      this.pageLoaded = true;
      console.log('تم تحميل صفحة نهج البلاغة بنجاح');
      
    } catch (error) {
      console.error('خطأ في تحميل صفحة نهج البلاغة:', error);
      this.showFallbackPage();
    }
  }

  addStyles() {
    // إضافة الأنماط ديناميكياً إذا لم تكن موجودة
    if (!document.querySelector('#nahj-styles')) {
      const style = document.createElement('style');
      style.id = 'nahj-styles';
      style.textContent = `
        .nahj-content {
          background-color: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-height: 400px;
        }
        
        .nahj-item {
          border-right: 4px solid #0d6efd;
          padding: 15px;
          margin-bottom: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .nahj-item:hover {
          background-color: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .nahj-title {
          color: #0d6efd;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        
        .nahj-text {
          line-height: 1.8;
          text-align: justify;
          color: #333;
          font-size: 1rem;
        }
        
        .nahj-meta {
          font-size: 0.85rem;
          color: #6c757d;
          margin-top: 10px;
          border-top: 1px dashed #dee2e6;
          padding-top: 8px;
        }
        
        .nahj-category {
          display: inline-block;
          background-color: #0d6efd;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-left: 8px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  showFallbackPage() {
    // إنشاء صفحة احتياطية إذا فشل التحميل
    const fallbackPage = document.createElement('div');
    fallbackPage.id = 'nahj-page';
    fallbackPage.className = 'page';
    fallbackPage.innerHTML = `
      <header class="bg-primary text-white text-center p-3 shadow-sm d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <button id="nahj-back-button" class="btn btn-light">
            <i class="bi bi-arrow-right"></i>
          </button>
          <h1 class="h4 mb-0">نهج البلاغة</h1>
        </div>
      </header>
      <div class="container my-4">
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          تعذر تحميل صفحة نهج البلاغة. يرجى التحقق من اتصال الإنترنت.
        </div>
      </div>
    `;
    
    document.body.appendChild(fallbackPage);
    
    this.elements = {
      nahjPage: fallbackPage,
      nahjBackButton: document.getElementById('nahj-back-button')
    };
    
    this.pageLoaded = true;
    this.addEventListeners();
  }

  addEventListeners() {
    // العودة من صفحة نهج البلاغة
    if (this.elements.nahjBackButton) {
      this.elements.nahjBackButton.addEventListener('click', () => {
        this.showHomePage();
      });
    }

    // البحث
    if (this.elements.nahjSearchBtn) {
      this.elements.nahjSearchBtn.addEventListener('click', () => {
        this.searchContent();
      });
    }

    if (this.elements.nahjSearch) {
      this.elements.nahjSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchContent();
        }
      });
    }

    // تصفية حسب الفئة
    if (this.elements.nahjCategory) {
      this.elements.nahjCategory.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.currentPage = 1;
        this.renderContent();
      });
    }
  }

  async loadData() {
    try {
      console.log('جاري تحميل بيانات نهج البلاغة من GitHub...');
      
      // إضافة timestamp لمنع التخزين المؤقت
      const timestamp = new Date().getTime();
      const url = `${this.baseURL}?t=${timestamp}`;
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في الخادم: ${response.status}`);
      }
      
      this.data = await response.json();
      
      if (!Array.isArray(this.data)) {
        throw new Error('تنسيق البيانات غير صحيح');
      }
      
      console.log(`تم تحميل ${this.data.length} عنصر من نهج البلاغة`);
      
    } catch (error) {
      console.error('خطأ في تحميل بيانات نهج البلاغة:', error);
      
      // بيانات تجريبية للاختبار
      this.data = [
        {
          "id": 1,
          "title": "خطبة في ذم الدنيا",
          "content": "أما بعد، فإن الدنيا قد ولَّت مدبرة، والآخرة قد أقبلت تذكرة، ولكل واحدة منهما بنون...",
          "category": "sermons",
          "source": "الخطبة 1"
        },
        {
          "id": 2,
          "title": "رسالة إلى مالك الأشتر",
          "content": "هذا ما أمر به عبد الله علي أمير المؤمنين مالك بن الحارث الأشتر...",
          "category": "letters",
          "source": "الرسالة 53"
        }
      ];
      
      if (this.elements.nahjContent) {
        this.elements.nahjContent.innerHTML = `
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            تم تحميل بيانات تجريبية. ${error.message}
          </div>
        `;
      }
    }
  }

  searchContent() {
    if (this.elements.nahjSearch) {
      this.currentSearch = this.elements.nahjSearch.value.trim();
      this.currentPage = 1;
      this.renderContent();
    }
  }

  getFilteredData() {
    let filteredData = this.data;

    // التصفية حسب الفئة
    if (this.currentCategory !== 'all') {
      filteredData = filteredData.filter(item => 
        item.category === this.currentCategory
      );
    }

    // البحث
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      filteredData = filteredData.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.content && item.content.toLowerCase().includes(searchTerm))
      );
    }

    return filteredData;
  }

  renderContent() {
    if (!this.elements.nahjContent) return;

    const filteredData = this.getFilteredData();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);

    // عرض المحتوى
    if (pageData.length === 0) {
      this.elements.nahjContent.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
          <h5 class="mt-3">لا توجد نتائج</h5>
          <p class="text-muted">لم يتم العثور على محتوى يتطابق مع بحثك</p>
        </div>
      `;
    } else {
      this.elements.nahjContent.innerHTML = pageData.map(item => `
        <div class="nahj-item">
          <div class="nahj-title">${this.escapeHtml(item.title || 'بدون عنوان')}</div>
          <div class="nahj-text">${this.escapeHtml(item.content || 'لا يوجد محتوى')}</div>
          <div class="nahj-meta">
            <span class="nahj-category">${this.getCategoryName(item.category)}</span>
            <span>${this.escapeHtml(item.source || '')}</span>
          </div>
        </div>
      `).join('');
    }

    // عرض الترقيم
    this.renderPagination(totalPages);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  renderPagination(totalPages) {
    if (!this.elements.nahjPagination) return;
    if (totalPages <= 1) {
      this.elements.nahjPagination.innerHTML = '';
      return;
    }

    this.elements.nahjPagination.innerHTML = '';

    // زر السابق
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
      <a class="page-link" href="#" data-page="${this.currentPage - 1}">
        <i class="bi bi-chevron-right"></i>
      </a>
    `;
    this.elements.nahjPagination.appendChild(prevLi);

    // أرقام الصفحات
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
      this.elements.nahjPagination.appendChild(li);
    }

    // زر التالي
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
      <a class="page-link" href="#" data-page="${this.currentPage + 1}">
        <i class="bi bi-chevron-left"></i>
      </a>
    `;
    this.elements.nahjPagination.appendChild(nextLi);

    // إضافة مستمعي الأحداث
    this.elements.nahjPagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.renderContent();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  getCategoryName(category) {
    const categories = {
      'sermons': 'خطبة',
      'letters': 'رسالة',
      'wisdom': 'حكمة'
    };
    return categories[category] || category;
  }

  showNahjPage() {
    // تأكد من تحميل الصفحة أولاً
    this.ensurePageLoaded().then(() => {
      // إخفاء كل الصفحات
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      // إظهار صفحة نهج البلاغة
      if (this.elements.nahjPage) {
        this.elements.nahjPage.classList.add('active');
      }
    }).catch(error => {
      console.error('خطأ في عرض صفحة نهج البلاغة:', error);
      alert('تعذر تحميل صفحة نهج البلاغة. يرجى المحاولة مرة أخرى.');
    });
  }

  showHomePage() {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById('home-page').classList.add('active');
  }
}

// تهيئة نهج البلاغة عند تحميل الصفحة
let nahjAlBalaghaInstance;

document.addEventListener('DOMContentLoaded', () => {
  // إنشاء كائن نهج البلاغة
  nahjAlBalaghaInstance = new NahjAlBalagha();
  
  // إضافة حدث لزر نهج البلاغة في الهيدر
  const nahjButton = document.getElementById('nahj-button');
  if (nahjButton) {
    nahjButton.addEventListener('click', () => {
      if (nahjAlBalaghaInstance) {
        nahjAlBalaghaInstance.showNahjPage();
      }
    });
  }
});

// جعل الكائن متاحاً عالمياً
window.NahjAlBalagha = NahjAlBalagha;
