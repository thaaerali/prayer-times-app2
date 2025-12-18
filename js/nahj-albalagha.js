// nahj-albalagha.js - نسخة متقدمة للتعامل مع ملفات مستقلة
class NahjAlBalagha {
    constructor() {
        this.baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/sermons';
        this.indexURL = this.baseURL + 'index.json';
        this.currentSermon = null;
        this.sermonsIndex = [];
        this.currentSermonId = 1;
        this.totalSermons = 0;
        
        // عناصر DOM
        this.elements = {
            homePage: document.getElementById('home-page'),
            nahjPage: document.getElementById('nahj-page'),
            nahjButton: document.getElementById('nahj-button'),
            nahjBackButton: document.getElementById('nahj-back-button'),
            nahjContent: document.getElementById('nahj-content'),
            nahjTabs: document.querySelectorAll('#nahj-tabs .nav-link'),
            nahjSearch: document.getElementById('nahj-search'),
            nahjSearchBtn: document.getElementById('nahj-search-btn'),
            nahjCategory: document.getElementById('nahj-category'),
            nahjPagination: document.getElementById('nahj-pagination')
        };
        
        this.init();
    }
    
    async init() {
        console.log('جاري تهيئة نهج البلاغة...');
        
        await this.loadIndex();
        this.setupEventListeners();
        await this.loadSermon(1); // تحميل الخطبة الأولى
    }
    
    async loadIndex() {
        try {
            console.log('📋 جاري تحميل الفهرس...');
            
            const response = await fetch(this.indexURL);
            
            if (!response.ok) {
                throw new Error(`خطأ في تحميل الفهرس: ${response.status}`);
            }
            
            const data = await response.json();
            this.sermonsIndex = data.sermons_index || [];
            this.totalSermons = this.sermonsIndex.length;
            
            console.log(`✅ تم تحميل الفهرس: ${this.totalSermons} خطبة`);
            
            // إنشاء واجهة التنقل
            this.createNavigationUI();
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الفهرس:', error);
            this.showError('تعذر تحميل فهرس نهج البلاغة');
        }
    }
    
    async loadSermon(sermonId) {
        try {
            console.log(`📥 جاري تحميل الخطبة ${sermonId}...`);
            
            // البحث عن الخطبة في الفهرس
            const sermonInfo = this.sermonsIndex.find(s => s.id === sermonId);
            
            if (!sermonInfo) {
                throw new Error(`الخطبة ${sermonId} غير موجودة في الفهرس`);
            }
            
            // تحميل ملف الخطبة
            const sermonURL = this.baseURL + sermonInfo.file;
            const response = await fetch(sermonURL);
            
            if (!response.ok) {
                throw new Error(`خطأ في تحميل الخطبة: ${response.status}`);
            }
            
            this.currentSermon = await response.json();
            this.currentSermonId = sermonId;
            
            console.log(`✅ تم تحميل الخطبة: ${this.currentSermon.metadata.title}`);
            
            // عرض الخطبة
            this.renderCurrentSermon();
            
            // تحديث واجهة التنقل
            this.updateNavigationUI();
            
        } catch (error) {
            console.error(`❌ خطأ في تحميل الخطبة ${sermonId}:`, error);
            this.showError(`تعذر تحميل الخطبة ${sermonId}: ${error.message}`);
        }
    }
    
    createNavigationUI() {
        const navHTML = `
            <div class="sermon-navigation card shadow-sm mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-primary me-2" id="prev-sermon-btn" disabled>
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                                
                                <div class="sermon-info">
                                    <h6 class="mb-0" id="current-sermon-title">جاري التحميل...</h6>
                                    <small class="text-muted" id="sermon-counter">-- / ${this.totalSermons}</small>
                                </div>
                                
                                <button class="btn btn-sm btn-outline-primary ms-2" id="next-sermon-btn" disabled>
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-5">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">انتقل إلى</span>
                                <input type="number" 
                                       class="form-control" 
                                       id="goto-sermon-input" 
                                       min="1" 
                                       max="${this.totalSermons}" 
                                       placeholder="رقم الخطبة">
                                <button class="btn btn-primary" id="goto-sermon-btn">
                                    <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-3 text-end">
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                        type="button" 
                                        id="sermons-list-btn"
                                        data-bs-toggle="dropdown">
                                    <i class="bi bi-list-ul"></i> فهرس الخطب
                                </button>
                                <div class="dropdown-menu dropdown-menu-end" id="sermons-list-menu">
                                    <div class="px-3 py-2">
                                        <small class="text-muted">جاري تحميل الفهرس...</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة شريط التنقل
        const contentContainer = document.getElementById('nahj-content');
        if (contentContainer) {
            contentContainer.innerHTML = navHTML + '<div id="sermon-content-container"></div>';
            
            // تحديث مراجع عناصر DOM
            this.updateDOMElements();
            this.setupNavigationEvents();
            
            // تحميل قائمة الخطب
            this.loadSermonsList();
        }
    }
    
    updateDOMElements() {
        // عناصر التنقل
        this.elements.prevSermonBtn = document.getElementById('prev-sermon-btn');
        this.elements.nextSermonBtn = document.getElementById('next-sermon-btn');
        this.elements.currentSermonTitle = document.getElementById('current-sermon-title');
        this.elements.sermonCounter = document.getElementById('sermon-counter');
        this.elements.gotoSermonInput = document.getElementById('goto-sermon-input');
        this.elements.gotoSermonBtn = document.getElementById('goto-sermon-btn');
        this.elements.sermonsListMenu = document.getElementById('sermons-list-menu');
        this.elements.sermonContentContainer = document.getElementById('sermon-content-container');
    }
    
    setupNavigationEvents() {
        // زر الخطبة السابقة
        if (this.elements.prevSermonBtn) {
            this.elements.prevSermonBtn.addEventListener('click', () => {
                if (this.currentSermonId > 1) {
                    this.loadSermon(this.currentSermonId - 1);
                }
            });
        }
        
        // زر الخطبة التالية
        if (this.elements.nextSermonBtn) {
            this.elements.nextSermonBtn.addEventListener('click', () => {
                if (this.currentSermonId < this.totalSermons) {
                    this.loadSermon(this.currentSermonId + 1);
                }
            });
        }
        
        // الانتقال إلى خطبة محددة
        if (this.elements.gotoSermonBtn && this.elements.gotoSermonInput) {
            this.elements.gotoSermonBtn.addEventListener('click', () => {
                const sermonId = parseInt(this.elements.gotoSermonInput.value);
                if (sermonId >= 1 && sermonId <= this.totalSermons) {
                    this.loadSermon(sermonId);
                }
            });
            
            this.elements.gotoSermonInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.elements.gotoSermonBtn.click();
                }
            });
        }
    }
    
    loadSermonsList() {
        if (!this.elements.sermonsListMenu || this.sermonsIndex.length === 0) return;
        
        let listHTML = '';
        
        // تجميع الخطب حسب التصنيف
        const sermonsByCategory = {};
        this.sermonsIndex.forEach(sermon => {
            const category = sermon.category || 'غير مصنف';
            if (!sermonsByCategory[category]) {
                sermonsByCategory[category] = [];
            }
            sermonsByCategory[category].push(sermon);
        });
        
        // إنشاء القائمة
        for (const [category, sermons] of Object.entries(sermonsByCategory)) {
            listHTML += `
                <h6 class="dropdown-header">${category}</h6>
                ${sermons.map(sermon => `
                    <a class="dropdown-item sermon-list-item ${sermon.id === this.currentSermonId ? 'active' : ''}" 
                       href="#" 
                       data-sermon-id="${sermon.id}">
                        <span class="badge bg-secondary me-2">${sermon.id}</span>
                        ${sermon.title}
                        ${sermon.subtitle ? `<small class="text-muted d-block">${sermon.subtitle}</small>` : ''}
                    </a>
                `).join('')}
            `;
        }
        
        this.elements.sermonsListMenu.innerHTML = listHTML;
        
        // إضافة أحداث النقر على عناصر القائمة
        document.querySelectorAll('.sermon-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sermonId = parseInt(e.currentTarget.getAttribute('data-sermon-id'));
                this.loadSermon(sermonId);
            });
        });
    }
    
    updateNavigationUI() {
        // تحديث العنوان
        if (this.elements.currentSermonTitle && this.currentSermon) {
            this.elements.currentSermonTitle.innerHTML = `
                <span class="badge bg-primary me-2">الخطبة ${this.currentSermonId}</span>
                ${this.currentSermon.metadata.title}
            `;
        }
        
        // تحديث العداد
        if (this.elements.sermonCounter) {
            this.elements.sermonCounter.textContent = `${this.currentSermonId} / ${this.totalSermons}`;
        }
        
        // تحديث حالة الأزرار
        if (this.elements.prevSermonBtn) {
            this.elements.prevSermonBtn.disabled = this.currentSermonId <= 1;
        }
        
        if (this.elements.nextSermonBtn) {
            this.elements.nextSermonBtn.disabled = this.currentSermonId >= this.totalSermons;
        }
        
        // تحديث حقل الإدخال
        if (this.elements.gotoSermonInput) {
            this.elements.gotoSermonInput.value = this.currentSermonId;
        }
        
        // تحديث القائمة المنسدلة
        this.loadSermonsList();
    }
    
    renderCurrentSermon() {
        if (!this.currentSermon || !this.elements.sermonContentContainer) return;
        
        const sermon = this.currentSermon;
        const content = sermon.content;
        
        const html = `
            <div class="sermon-container" data-sermon-id="${sermon.metadata.sermon_id}">
                <!-- رأس الخطبة -->
                <div class="sermon-header card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h3 class="text-primary mb-2">${sermon.metadata.title}</h3>
                                ${sermon.metadata.subtitle ? `<h5 class="text-secondary mb-3">${sermon.metadata.subtitle}</h5>` : ''}
                                ${sermon.metadata.description ? `<p class="text-muted">${sermon.metadata.description}</p>` : ''}
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="sermon-meta">
                                    ${sermon.metadata.category ? `<span class="badge bg-info me-2">${sermon.metadata.category}</span>` : ''}
                                    ${sermon.metadata.page_start ? `<small class="text-muted d-block">الصفحات: ${sermon.metadata.page_start} - ${sermon.metadata.page_end}</small>` : ''}
                                    ${sermon.metadata.total_footnotes ? `<small class="text-muted d-block">عدد الحواشي: ${sermon.metadata.total_footnotes}</small>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- محتوى الخطبة -->
                <div class="sermon-content">
                    ${content && content.sections ? content.sections.map(section => this.renderSection(section)).join('') : `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> محتوى هذه الخطبة قيد الإعداد
                        </div>
                    `}
                </div>
                
                <!-- تذييل الخطبة -->
                <div class="sermon-footer mt-4 pt-3 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-book"></i> ${sermon.metadata.source || 'نهج البلاغة'}
                            </small>
                        </div>
                        <div class="col-md-6 text-end">
                            <small class="text-muted">
                                شرح: ${sermon.metadata.editor || 'محمد عبده'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.sermonContentContainer.innerHTML = html;
        
        // إعداد تفاعل الحواشي
        this.setupFootnoteInteractions();
    }
    
    renderSection(section) {
        return `
            <div class="sermon-section mb-4 p-3 border rounded-3" data-section-id="${section.id}">
                <div class="section-text mb-3">
                    <p class="text-justify" style="font-size: 1.1rem; line-height: 1.8;">${section.text}</p>
                </div>
                
                ${section.footnotes && section.footnotes.length > 0 ? `
                    <div class="section-footnotes">
                        <button class="btn btn-sm btn-outline-primary toggle-footnotes" 
                                data-section="${section.id}"
                                data-bs-toggle="collapse" 
                                data-bs-target="#footnotes-${section.id}">
                            <i class="bi bi-chat-square-quote"></i> 
                            عرض شرح محمد عبده 
                            <span class="badge bg-secondary ms-1">${section.footnotes.length}</span>
                        </button>
                        
                        <div class="collapse mt-2" id="footnotes-${section.id}">
                            <div class="card card-body border-primary">
                                ${section.footnotes.map(footnote => `
                                    <div class="footnote-item mb-3">
                                        <div class="d-flex align-items-start">
                                            <span class="footnote-number badge bg-primary me-2">${footnote.id}</span>
                                            <div class="footnote-content">
                                                <p class="mb-1">${footnote.text}</p>
                                                ${footnote.page ? `<small class="text-muted">الصفحة: ${footnote.page}</small>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    setupFootnoteInteractions() {
        // تفاعل مع أرقام الحواشي في النص
        document.querySelectorAll('.footnote-ref').forEach(ref => {
            ref.addEventListener('click', (e) => {
                e.preventDefault();
                const footnoteId = e.target.getAttribute('data-id');
                const section = e.target.closest('.sermon-section');
                
                if (section) {
                    const sectionId = section.getAttribute('data-section-id');
                    const footnotesCollapse = document.getElementById(`footnotes-${sectionId}`);
                    
                    if (footnotesCollapse) {
                        // إظهار الحواشي إذا كانت مخفية
                        const bsCollapse = new bootstrap.Collapse(footnotesCollapse, {
                            toggle: true
                        });
                        
                        // تمييز الحاشية المحددة
                        setTimeout(() => {
                            const footnoteElement = footnotesCollapse.querySelector(`.footnote-item .footnote-number[data-footnote="${footnoteId}"]`);
                            if (footnoteElement) {
                                footnoteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                footnoteElement.classList.add('bg-warning', 'text-dark');
                                setTimeout(() => {
                                    footnoteElement.classList.remove('bg-warning', 'text-dark');
                                }, 2000);
                            }
                        }, 300);
                    }
                }
            });
        });
    }
    
    setupEventListeners() {
        // ... (نفس الأحداث السابقة)
    }
    
    showError(message) {
        if (this.elements.sermonContentContainer) {
            this.elements.sermonContentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${message}
                    <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                        إعادة تحميل
                    </button>
                </div>
            `;
        }
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تحميل Bootstrap
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap غير محمل!');
        return;
    }
    
    window.nahjAlBalagha = new NahjAlBalagha();
});
