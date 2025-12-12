class NahjAlBalagha {
  constructor() {
    this.baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/data.json';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.data = [];
    this.pageLoaded = false;
    this.elements = null;
    
    console.log('تهيئة نهج البلاغة...');
    
    // تأجيل init حتى يتم تحميل DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log('بدء init...');
    
    try {
      // تحميل الصفحة
      await this.ensurePageLoaded();
      
      // تحميل البيانات
      await this.loadData();
      
      // عرض المحتوى
      this.renderContent();
      
      console.log('تهيئة نهج البلاغة مكتملة');
    } catch (error) {
      console.error('خطأ في تهيئة نهج البلاغة:', error);
    }
  }

  async ensurePageLoaded() {
    if (this.pageLoaded) return;
    
    console.log('تأكد من تحميل الصفحة...');
    
    // أولاً، تحقق مما إذا كانت الصفحة موجودة بالفعل في DOM
    let nahjPage = document.getElementById('nahj-page');
    
    if (!nahjPage) {
      console.log('الصفحة غير موجودة، جاري إنشاؤها...');
      // إنشاء الصفحة ديناميكياً
      nahjPage = this.createPage();
      document.body.appendChild(nahjPage);
    }
    
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
    
    console.log('العناصر المحفوظة:', this.elements);
    
    // إضافة الأحداث
    this.addEventListeners();
    
    this.pageLoaded = true;
  }

  createPage() {
    console.log('إنشاء صفحة نهج البلاغة ديناميكياً...');
    
    const page = document.createElement('div');
    page.id = 'nahj-page';
    page.className = 'page';
    page.innerHTML = `
      <!-- رأس صفحة نهج البلاغة -->
      <header class="bg-primary text-white text-center p-3 shadow-sm d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <button id="nahj-back-button" class="btn btn-light">
            <i class="bi bi-arrow-right"></i>
          </button>
          <h1 class="h4 mb-0">نهج البلاغة</h1>
        </div>
      </header>

      <!-- محتوى نهج البلاغة -->
      <div class="container my-4">
        <!-- فلتر البحث -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <input type="text" id="nahj-search" class="form-control" placeholder="ابحث في نهج البلاغة...">
              <button class="btn btn-outline-primary" type="button" id="nahj-search-btn">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <select id="nahj-category" class="form-select">
              <option value="all">جميع الأقسام</option>
              <option value="sermons">الخطب</option>
              <option value="letters">الرسائل</option>
              <option value="wisdom">الحكم</option>
            </select>
          </div>
        </div>

        <!-- عرض المحتوى -->
        <div id="nahj-content" class="nahj-content">
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">جاري التحميل...</span>
            </div>
            <p class="mt-3">جاري تحميل محتويات نهج البلاغة...</p>
          </div>
        </div>

        <!-- الترقيم -->
        <nav aria-label="تصفح نهج البلاغة" class="mt-4">
          <ul class="pagination justify-content-center" id="nahj-pagination"></ul>
        </nav>
      </div>
    `;
    
    return page;
  }

  addEventListeners() {
    console.log('إضافة الأحداث...');
    
    // العودة من صفحة نهج البلاغة
    if (this.elements.nahjBackButton) {
      this.elements.nahjBackButton.addEventListener('click', () => {
        this.showHomePage();
      });
      console.log('تمت إضافة حدث العودة');
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
    console.log('جاري تحميل البيانات...');
    
    try {
      const url = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/data.json';
      console.log('الرابط:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`فشل HTTP: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log('البيانات الخام (أول 500 حرف):', text.substring(0, 500));
      
      // محاولة تحليل JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('خطأ في تحليل JSON:', parseError);
        throw new Error('تنسيق JSON غير صالح في الملف');
      }
      
      if (!Array.isArray(data)) {
        throw new Error('البيانات يجب أن تكون مصفوفة');
      }
      
      this.data = data;
      console.log(`تم تحميل ${data.length} عنصر بنجاح`);
      
    } catch (error) {
      console.error('خطأ في تحميل البيانات من GitHub:', error);
      
      // استخدام بيانات تجريبية
      this.loadSampleData();
    }
  }

  loadSampleData() {
    console.log('جاري تحميل بيانات تجريبية...');
    
    this.data = [
      {
        "id": 1,
        "title": "خطبة في ذم الدنيا",
        "content": "أما بعد، فإن الدنيا قد ولَّت مدبرة، والآخرة قد أقبلت تذكرة، ولكل واحدة منهما بنون، فكونوا من أبناء الآخرة ولا تكونوا من أبناء الدنيا، فإن اليوم عمل ولا حساب، وغداً حساب ولا عمل.",
        "category": "sermons",
        "source": "الخطبة 1"
      },
      {
        "id": 2,
        "title": "رسالة إلى مالك الأشتر",
        "content": "هذا ما أمر به عبد الله علي أمير المؤمنين مالك بن الحارث الأشتر في عهده إليه حين ولاه مصر: جباية خراجها، وجهاد عدوها، واستصلاح أهلها، وعمارة بلادها.",
        "category": "letters",
        "source": "الرسالة 53"
      },
      {
        "id": 3,
        "title": "من حكم الإمام علي",
        "content": "قيمة كل امرئ ما يحسنه، والعلم مقرون بالعمل، فمن علم عمل، والعلم يهتف بالعمل، فإن أجابه وإلا ارتحل.",
        "category": "wisdom",
        "source": "الحكمة 81"
      }
    ];
    
    console.log('تم تحميل بيانات تجريبية');
  }

  searchContent() {
    console.log('بحث عن:', this.currentSearch);
    
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
    console.log('عرض المحتوى...');
    
    if (!this.elements.nahjContent) {
      console.error('عنصر nahj-content غير موجود');
      return;
    }

    const filteredData = this.getFilteredData();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);

    console.log(`عرض ${pageData.length} عنصر من أصل ${filteredData.length}`);
    
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
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  renderPagination(totalPages) {
    if (!this.elements.nahjPagination) return;
    
    this.elements.nahjPagination.innerHTML = '';

    if (totalPages <= 1) return;

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
    console.log('عرض صفحة نهج البلاغة...');
    
    if (!this.pageLoaded) {
      console.log('الصفحة غير محملة، جاري التحميل...');
      this.init().then(() => {
        this.switchToNahjPage();
      });
    } else {
      this.switchToNahjPage();
    }
  }

  switchToNahjPage() {
    // إخفاء كل الصفحات
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // إظهار صفحة نهج البلاغة
    if (this.elements.nahjPage) {
      this.elements.nahjPage.classList.add('active');
      console.log('تم عرض صفحة نهج البلاغة');
    } else {
      console.error('صفحة نهج البلاغة غير موجودة');
    }
  }

  showHomePage() {
    console.log('العودة للصفحة الرئيسية...');
    
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    const homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.classList.add('active');
    }
  }
}

// تهيئة نهج البلاغة عند تحميل الصفحة
let nahjAlBalaghaInstance;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM محمّل، جاري تهيئة نهج البلاغة...');
  
  // إنشاء كائن نهج البلاغة
  nahjAlBalaghaInstance = new NahjAlBalagha();
  
  // إضافة حدث لزر نهج البلاغة في الهيدر
  const nahjButton = document.getElementById('nahj-button');
  if (nahjButton) {
    nahjButton.addEventListener('click', () => {
      console.log('تم النقر على زر نهج البلاغة');
      if (nahjAlBalaghaInstance) {
        nahjAlBalaghaInstance.showNahjPage();
      }
    });
    console.log('تمت إضافة حدث لزر نهج البلاغة');
  } else {
    console.warn('زر نهج البلاغة غير موجود في الهيدر');
  }
});

// جعل الكائن متاحاً عالمياً
window.NahjAlBalagha = NahjAlBalagha;
window.nahjAlBalaghaInstance = nahjAlBalaghaInstance;