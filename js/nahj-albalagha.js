// nahj-albalagha.js - ملف نهائي باستخدام JSON من GitHub
class NahjAlBalagha {
    constructor() {
        this.baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/refs/heads/main/nahj-al-balagha.json';
        this.data = null;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.currentCategory = 'sermons';
        
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
        
        await this.loadData();
        this.setupEventListeners();
        this.renderSermons();
    }
    
    async loadData() {
        try {
            // تحميل ملف JSON الرئيسي
            // تغيير الرابط ليشير إلى ملفك على GitHub
            const response = await fetch(this.baseURL + 'nahj-al-balagha.json');
            
            if (!response.ok) {
                throw new Error(`خطأ في تحميل البيانات: ${response.status}`);
            }
            
            this.data = await response.json();
            console.log('تم تحميل بيانات نهج البلاغة بنجاح:', this.data.metadata.title);
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showError('تعذر تحميل بيانات نهج البلاغة. الرجاء التحقق من اتصال الإنترنت.');
        }
    }
    
    setupEventListeners() {
        // زر فتح صفحة نهج البلاغة
        if (this.elements.nahjButton) {
            this.elements.nahjButton.addEventListener('click', () => {
                this.showNahjPage();
            });
        }
        
        // زر العودة
        if (this.elements.nahjBackButton) {
            this.elements.nahjBackButton.addEventListener('click', () => {
                this.hideNahjPage();
            });
        }
        
        // التبويبات
        if (this.elements.nahjTabs) {
            this.elements.nahjTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const category = e.target.getAttribute('data-section');
                    this.changeCategory(category);
                });
            });
        }
        
        // البحث
        if (this.elements.nahjSearchBtn) {
            this.elements.nahjSearchBtn.addEventListener('click', () => {
                this.search();
            });
        }
        
        if (this.elements.nahjSearch) {
            this.elements.nahjSearch.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.search();
                }
            });
        }
        
        // التصنيف
        if (this.elements.nahjCategory) {
            this.elements.nahjCategory.addEventListener('change', (e) => {
                this.changeCategory(e.target.value);
            });
        }
    }
    
    showNahjPage() {
        if (this.elements.homePage) this.elements.homePage.classList.remove('active');
        if (this.elements.nahjPage) this.elements.nahjPage.classList.add('active');
        
        // تحميل المحتوى إذا لم يكن محملاً
        if (!this.data) {
            this.loadData().then(() => this.renderSermons());
        }
    }
    
    hideNahjPage() {
        if (this.elements.nahjPage) this.elements.nahjPage.classList.remove('active');
        if (this.elements.homePage) this.elements.homePage.classList.add('active');
    }
    
    changeCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        // تحديث حالة التبويبات
        if (this.elements.nahjTabs) {
            this.elements.nahjTabs.forEach(tab => {
                if (tab.getAttribute('data-section') === category) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
        
        this.renderContent();
    }
    
    renderContent() {
        switch (this.currentCategory) {
            case 'sermons':
            case 'khutbas':
                this.renderSermons();
                break;
            case 'letters':
                this.renderLetters();
                break;
            case 'wisdoms':
            case 'wisdom':
                this.renderWisdoms();
                break;
            default:
                this.renderSermons();
        }
    }
    
    renderSermons() {
        if (!this.data) {
            this.showLoading();
            return;
        }
        
        const content = this.data.content;
        
        // إنشاء HTML للخطبة
        const html = `
            <div class="nahj-sermon">
                <div class="sermon-header bg-light p-3 rounded-3 mb-4">
                    <h3 class="text-primary mb-2">${content.title}</h3>
                    <p class="text-muted">${content.description}</p>
                    <div class="badge bg-primary">الخطبة ${content.sermon_id}</div>
                </div>
                
                <div class="sermon-sections">
                    ${content.sections.map(section => this.renderSection(section)).join('')}
                </div>
                
                <div class="sermon-footer mt-4 p-3 border-top">
                    <small class="text-muted">
                        <i class="bi bi-info-circle"></i> إجمالي الحواشي: ${content.sections.reduce((total, section) => total + (section.footnotes ? section.footnotes.length : 0), 0)}
                    </small>
                </div>
            </div>
        `;
        
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = html;
            this.setupFootnoteInteractions();
        }
    }
    
    renderSection(section) {
        return `
            <div class="nahj-section mb-4 p-3 border rounded-3">
                <div class="section-text mb-3">
                    <p class="lead text-justify">${section.text}</p>
                </div>
                
                ${section.footnotes && section.footnotes.length > 0 ? `
                    <div class="section-footnotes">
                        <button class="btn btn-sm btn-outline-primary toggle-footnotes" data-section="${section.id}">
                            <i class="bi bi-chat-square-quote"></i> عرض شرح محمد عبده (${section.footnotes.length})
                        </button>
                        
                        <div class="footnotes-container mt-2" id="footnotes-${section.id}" style="display: none;">
                            ${section.footnotes.map(footnote => `
                                <div class="footnote-item p-2 mb-2 border-start border-3 border-primary bg-light rounded-2">
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
                ` : ''}
                
                ${section.sections ? `
                    <div class="sub-sections mt-3">
                        ${section.sections.map(subSection => this.renderSection(subSection)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderLetters() {
        // يمكنك إضافة رسائل مستقلة هنا
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-envelope" style="font-size: 3rem; color: #6c757d;"></i>
                    <h4 class="mt-3 text-muted">الرسائل</h4>
                    <p class="text-muted">سيتم إضافة الرسائل قريباً إن شاء الله</p>
                </div>
            `;
        }
    }
    
    renderWisdoms() {
        // يمكنك إضافة الحكم هنا
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-lightbulb" style="font-size: 3rem; color: #6c757d;"></i>
                    <h4 class="mt-3 text-muted">الحكم</h4>
                    <p class="text-muted">سيتم إضافة الحكم قريباً إن شاء الله</p>
                </div>
            `;
        }
    }
    
    setupFootnoteInteractions() {
        // إضافة تفاعل للحواشي
        document.querySelectorAll('.toggle-footnotes').forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = e.target.getAttribute('data-section');
                const footnotesDiv = document.getElementById(`footnotes-${sectionId}`);
                const icon = e.target.querySelector('i');
                
                if (footnotesDiv.style.display === 'none') {
                    footnotesDiv.style.display = 'block';
                    e.target.innerHTML = `<i class="bi bi-chat-square-quote-fill"></i> إخفاء الشرح`;
                    e.target.classList.remove('btn-outline-primary');
                    e.target.classList.add('btn-primary');
                } else {
                    footnotesDiv.style.display = 'none';
                    e.target.innerHTML = `<i class="bi bi-chat-square-quote"></i> عرض الشرح`;
                    e.target.classList.remove('btn-primary');
                    e.target.classList.add('btn-outline-primary');
                }
            });
        });
        
        // تفاعل مع أرقام الحواشي في النص
        document.querySelectorAll('.footnote-ref').forEach(ref => {
            ref.addEventListener('click', (e) => {
                e.preventDefault();
                const footnoteId = e.target.getAttribute('data-id');
                const section = e.target.closest('.nahj-section');
                
                if (section) {
                    const footnotesDiv = section.querySelector('.footnotes-container');
                    if (footnotesDiv) {
                        footnotesDiv.style.display = 'block';
                        const toggleBtn = section.querySelector('.toggle-footnotes');
                        if (toggleBtn) {
                            toggleBtn.innerHTML = `<i class="bi bi-chat-square-quote-fill"></i> إخفاء الشرح`;
                            toggleBtn.classList.remove('btn-outline-primary');
                            toggleBtn.classList.add('btn-primary');
                        }
                        
                        // تمرير إلى الحاشية المحددة
                        const footnoteElement = footnotesDiv.querySelector(`[data-footnote="${footnoteId}"]`);
                        if (footnoteElement) {
                            footnoteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            });
        });
    }
    
    search() {
        const searchTerm = this.elements.nahjSearch ? this.elements.nahjSearch.value.trim() : '';
        
        if (!searchTerm) {
            this.renderContent();
            return;
        }
        
        // البحث في المحتوى
        if (this.data && this.data.content) {
            const results = this.searchInContent(searchTerm);
            this.displaySearchResults(results, searchTerm);
        }
    }
    
    searchInContent(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();
        
        // البحث في الخطبة الحالية
        if (this.data.content) {
            const content = this.data.content;
            
            // البحث في النص
            if (content.title && content.title.toLowerCase().includes(term)) {
                results.push({
                    type: 'title',
                    content: content.title,
                    location: 'العنوان'
                });
            }
            
            if (content.description && content.description.toLowerCase().includes(term)) {
                results.push({
                    type: 'description',
                    content: content.description,
                    location: 'الوصف'
                });
            }
            
            // البحث في الأقسام
            content.sections.forEach(section => {
                if (section.text && section.text.toLowerCase().includes(term)) {
                    results.push({
                        type: 'text',
                        content: section.text,
                        location: `النص - القسم ${section.id}`
                    });
                }
                
                // البحث في الحواشي
                if (section.footnotes) {
                    section.footnotes.forEach(footnote => {
                        if (footnote.text && footnote.text.toLowerCase().includes(term)) {
                            results.push({
                                type: 'footnote',
                                content: footnote.text,
                                location: `الشرح - الحاشية ${footnote.id}`
                            });
                        }
                    });
                }
            });
        }
        
        return results;
    }
    
    displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            if (this.elements.nahjContent) {
                this.elements.nahjContent.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
                        <h4 class="mt-3">لم يتم العثور على نتائج</h4>
                        <p class="text-muted">لا توجد نتائج لـ "${searchTerm}"</p>
                    </div>
                `;
            }
            return;
        }
        
        const html = `
            <div class="search-results">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> عُثر على ${results.length} نتيجة لـ "${searchTerm}"
                </div>
                
                <div class="results-list">
                    ${results.map((result, index) => `
                        <div class="result-item p-3 border rounded-3 mb-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <span class="badge bg-secondary">${result.location}</span>
                                    <p class="mt-2">${this.highlightText(result.content, searchTerm)}</p>
                                </div>
                                <small class="text-muted">#${index + 1}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = html;
        }
    }
    
    highlightText(text, term) {
        if (!text || !term) return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark class="bg-warning">$1</mark>');
    }
    
    showLoading() {
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p class="mt-3">جاري تحميل محتويات نهج البلاغة...</p>
                </div>
            `;
        }
    }
    
    showError(message) {
        if (this.elements.nahjContent) {
            this.elements.nahjContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${message}
                    <button class="btn btn-sm btn-outline-danger mt-2" onclick="window.location.reload()">
                        إعادة تحميل
                    </button>
                </div>
            `;
        }
    }
}

// تهيئة التطبيق عندما يصبح DOM جاهزاً
document.addEventListener('DOMContentLoaded', () => {
    // إنشاء مثيل من فئة نهج البلاغة
    window.nahjAlBalagha = new NahjAlBalagha();
});
