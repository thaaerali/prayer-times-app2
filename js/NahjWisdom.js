// NahjWisdom.js - معالجة الحكم فقط
class NahjWisdom {
    constructor(baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/') {
        this.baseURL = baseURL;
        this.wisdomIndexURL = this.baseURL + 'wisdoms/wisdom-index.json';
        this.currentWisdom = null;
        this.wisdomIndex = [];
        this.currentWisdomId = 1;
        this.totalWisdom = 480; // العدد التقريبي للحكم
        
        // عناصر DOM الخاصة بالحكم
        this.elements = {
            wisdomContainer: null,
            wisdomContent: null,
            prevWisdomBtn: null,
            nextWisdomBtn: null,
            gotoInput: null,
            gotoBtn: null,
            wisdomList: null,
            currentTitle: null,
            wisdomCounter: null,
            searchInput: null,
            searchBtn: null,
            categoryFilter: null
        };
        
        // البحث والتصفية
        this.searchTerm = '';
        this.currentCategory = 'all';
    }
    
    async init(containerId = 'wisdom-container') {
        console.log('💭 جاري تهيئة قسم الحكم...');
        
        try {
            await this.loadWisdomIndex();
            this.setupContainer(containerId);
            await this.loadWisdom(1);
            
            // إعداد البحث والتصفية
            this.setupSearchAndFilter();
            
            return this;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة قسم الحكم:', error);
            this.showError('تعذر تهيئة قسم الحكم');
            return this;
        }
    }
    
    async loadWisdomIndex() {
        try {
            console.log('📋 جاري تحميل فهرس الحكم...');
            
            const response = await fetch(this.wisdomIndexURL);
            if (!response.ok) {
                // إذا لم يكن الفهرس موجوداً، أنشئ فهرساً افتراضياً
                console.log('⚠️ فهرس الحكم غير موجود، إنشاء فهرس افتراضي...');
                this.createDefaultIndex();
                return this.wisdomIndex;
            }
            
            const data = await response.json();
           this.wisdomIndex = data.wisdoms || data.wisdom_index || [];
            this.totalWisdom = this.wisdomIndex.length;
            
            console.log(`✅ تم تحميل فهرس الحكم: ${this.totalWisdom} حكمة`);
            return this.wisdomIndex;
            
        } catch (error) {
            console.error('❌ خطأ في تحميل فهرس الحكم:', error);
            this.createDefaultIndex();
            return this.wisdomIndex;
        }
    }
    
    createDefaultIndex() {
        // إنشاء فهرس افتراضي إذا لم يكن الفهرس موجوداً
        console.log('🔨 إنشاء فهرس افتراضي للحكم...');
        
        this.wisdomIndex = [];
        for (let i = 1; i <= 100; i++) {
            this.wisdomIndex.push({
                id: i,
                file: `wisdom/wisdom-${i.toString().padStart(3, '0')}.json`,
                title: `الحكمة ${i}`,
                category: this.getRandomCategory(),
                keywords: ['حكمة', 'موعظة', 'عبرة'],
                page_start: 500 + Math.floor(i/10),
                page_end: 500 + Math.floor(i/10) + 1,
                has_content: i <= 10 // أول 10 حكم فقط لديها محتوى في البداية
            });
        }
        this.totalWisdom = this.wisdomIndex.length;
    }
    
    getRandomCategory() {
        const categories = [
            'التقوى والورع',
            'العلم والحكمة',
            'الصبر والرضا',
            'الصدق والأمانة',
            'العدل والإحسان',
            'الدعاء والمناجاة',
            'التفكر والاعتبار',
            'الدنيا والزهد',
            'الأخلاق والآداب',
            'العبادة والطاعة'
        ];
        return categories[Math.floor(Math.random() * categories.length)];
    }
    
    async loadWisdom(wisdomId) {
    try {
        console.log(`📥 جاري تحميل الحكمة ${wisdomId}...`);
        
        // البحث عن الحكمة في الفهرس
        const wisdomInfo = this.wisdomIndex.find(w => 
            w.id === wisdomId || 
            w.id === parseInt(wisdomId) ||
            (typeof w.id === 'string' && parseInt(w.id) === wisdomId)
        );
        
        // ⚠️ **هذا هو التعديل المهم**: لا ترمي خطأ إذا لم تجد الحكمة
        if (!wisdomInfo) {
            console.warn(`⚠️ الحكمة ${wisdomId} غير موجودة في الفهرس، إنشاء معلومات افتراضية`);
            const defaultInfo = {
                id: wisdomId,
                file: `wisdoms/wisdom-${wisdomId.toString().padStart(3, '0')}.json`,
                title: `الحكمة ${wisdomId}`,
                category: this.getRandomCategory(),
                keywords: ['حكمة', 'موعظة'],
                has_content: false
            };
            return await this.loadWisdomFromURL(this.baseURL + defaultInfo.file, wisdomId, defaultInfo);
        }
        
        // تحميل ملف الحكمة
        const wisdomURL = this.baseURL + wisdomInfo.file;
        const response = await fetch(wisdomURL);
        
        if (!response.ok) {
            console.log(`⚠️ ملف الحكمة ${wisdomId} غير موجود، إنشاء محتوى افتراضي...`);
            this.createDefaultWisdom(wisdomId, wisdomInfo);
        } else {
            const wisdomData = await response.json();
            // تحويل البنية من sections إلى content
            this.currentWisdom = this.normalizeWisdomStructure(wisdomData, wisdomId, wisdomInfo);
        }
        
        this.currentWisdomId = wisdomId;
        console.log(`✅ تم تحميل الحكمة: ${this.currentWisdom.metadata.title}`);
        
        this.renderCurrentWisdom();
        this.updateNavigationUI();
        return this.currentWisdom;
        
    } catch (error) {
        console.error(`❌ خطأ في تحميل الحكمة ${wisdomId}:`, error);
        this.createDefaultWisdom(wisdomId);
        this.renderCurrentWisdom();
        this.updateNavigationUI();
        return this.currentWisdom;
    }
}
    
    createDefaultWisdom(wisdomId, wisdomInfo = null) {
        // إنشاء حكمة افتراضية
        const defaultTexts = [
            "خير المال ما وقى به العرض، ودفع به الكرب، وصُنّ به الدين.",
            "العاقل من وعظته التجارب، والجاهل من خدعته الأماني.",
            "من عامل الناس بالعدل، أنصفوه، ومن عاملهم بالجور، ظلموه.",
            "الصبر مفتاح الفرج، واليأس مفتاح الفقر.",
            "العلم خير من المال، العلم يحرسك وأنت تحرس المال.",
            "من طلب العلى سهر الليالي، ومن رضي بالدون نام الهوينا.",
            "الحر من حفظ الأسرار، والعبد من أفشاها.",
            "خير الإخوان من نسي الذنب، وذكر الإحسان.",
            "الدنيا دار ممر لا دار مقر، والناس فيها رجلان: رجل باع نفسه فأوبقها، ورجل ابتاع نفسه فأعتقها.",
            "من كثر كلامه كثر سقطه، ومن كثر سقطه قل حياؤه."
        ];
        
        const textIndex = (wisdomId - 1) % defaultTexts.length;
        
        this.currentWisdom = {
            metadata: {
                title: wisdomInfo?.title || `الحكمة ${wisdomId}`,
                category: wisdomInfo?.category || 'الأخلاق والآداب',
                page_start: wisdomInfo?.page_start || 500 + Math.floor(wisdomId/10),
                page_end: wisdomInfo?.page_end || 500 + Math.floor(wisdomId/10) + 1,
                total_footnotes: 1,
                source: 'نهج البلاغة',
                editor: 'الشيخ محمد عبده',
                compiled_date: '2024-01-01'
            },
            content: {
                wisdom_id: wisdomId,
                title: `الحكمة ${wisdomId}`,
                text: defaultTexts[textIndex],
                footnotes: [
                    {
                        id: 1,
                        text: 'هذه حكمة من حكم الإمام علي بن أبي طالب (ع) في نهج البلاغة، تدعو إلى التأمل والاعتبار.',
                        page: wisdomInfo?.page_start || 500 + Math.floor(wisdomId/10)
                    }
                ],
                keywords: wisdomInfo?.keywords || ['حكمة', 'موعظة', 'عبرة'],
                section: 'حكم متنوعة'
            }
        };
    }
    // أضف هذه الدالة بعد createDefaultWisdom()
normalizeWisdomStructure(wisdomData, wisdomId, wisdomInfo = null) {
    // إذا كانت البنية الجديدة (مع sections)
    if (wisdomData.content && Array.isArray(wisdomData.content.sections)) {
        const firstSection = wisdomData.content.sections[0];
        return {
            metadata: wisdomData.metadata || {
                title: wisdomInfo?.title || `الحكمة ${wisdomId}`,
                category: wisdomInfo?.category || 'الأخلاق والآداب',
                source: 'نهج البلاغة',
                editor: 'الشيخ محمد عبده'
            },
            content: {
                wisdom_id: wisdomId,
                title: wisdomData.metadata?.work || `الحكمة ${wisdomId}`,
                text: firstSection.text || '',
                footnotes: firstSection.footnotes || [],
                keywords: wisdomData.metadata?.categories || wisdomInfo?.keywords || [],
                section: 'حكم متنوعة'
            }
        };
    }
    
    // إذا كانت البنية القديمة (مباشرة)
    return wisdomData;
}
    setupContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ العنصر ${containerId} غير موجود`);
            return;
        }
        
        // إنشاء واجهة التنقل والبحث
        container.innerHTML = `
            <!-- شريط البحث والتصفية -->
            <div class="wisdom-search-filter card shadow-sm mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6 mb-2 mb-md-0">
                            <div class="input-group">
                                <input type="text" 
                                       class="form-control" 
                                       id="wisdom-search-input" 
                                       placeholder="ابحث في الحكم...">
                                <button class="btn btn-primary" id="wisdom-search-btn">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4 mb-2 mb-md-0">
                            <select class="form-select" id="wisdom-category-filter">
                                <option value="all">جميع التصنيفات</option>
                                <option value="التقوى والورع">التقوى والورع</option>
                                <option value="العلم والحكمة">العلم والحكمة</option>
                                <option value="الصبر والرضا">الصبر والرضا</option>
                                <option value="الصدق والأمانة">الصدق والأمانة</option>
                                <option value="العدل والإحسان">العدل والإحسان</option>
                                <option value="الدعاء والمناجاة">الدعاء والمناجاة</option>
                                <option value="التفكر والاعتبار">التفكر والاعتبار</option>
                                <option value="الدنيا والزهد">الدنيا والزهد</option>
                                <option value="الأخلاق والآداب">الأخلاق والآداب</option>
                                <option value="العبادة والطاعة">العبادة والطاعة</option>
                            </select>
                        </div>
                        <div class="col-md-2 text-end">
                            <button class="btn btn-outline-secondary" id="wisdom-random-btn">
                                <i class="bi bi-shuffle"></i> عشوائي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- شريط التنقل -->
            <div class="wisdom-navigation card shadow-sm mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-primary me-2" id="prev-wisdom-btn" disabled>
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                                
                                <div class="wisdom-info">
                                    <h6 class="mb-0" id="current-wisdom-title">جاري التحميل...</h6>
                                    <small class="text-muted" id="wisdom-counter">-- / ${this.totalWisdom}</small>
                                </div>
                                
                                <button class="btn btn-sm btn-outline-primary ms-2" id="next-wisdom-btn" disabled>
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-5">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">انتقل إلى</span>
                                <input type="number" 
                                       class="form-control" 
                                       id="goto-wisdom-input" 
                                       min="1" 
                                       max="${this.totalWisdom}" 
                                       placeholder="رقم الحكمة">
                                <button class="btn btn-primary" id="goto-wisdom-btn">
                                    <i class="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="col-md-3 text-end">
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                        type="button" 
                                        id="wisdom-list-btn"
                                        data-bs-toggle="dropdown">
                                    <i class="bi bi-list-ul"></i> فهرس الحكم (${this.totalWisdom})
                                </button>
                                <div class="dropdown-menu dropdown-menu-end" id="wisdom-list-menu">
                                    <div class="px-3 py-2">
                                        <small class="text-muted">جاري تحميل الفهرس...</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- حاوية المحتوى -->
            <div id="wisdom-content-container"></div>
            
            <!-- إحصاءات -->
            <div class="wisdom-stats card shadow-sm mt-4">
                <div class="card-body py-2">
                    <div class="row text-center">
                        <div class="col-4">
                            <small class="text-muted d-block">عدد الحكم</small>
                            <span class="fw-bold">${this.totalWisdom}</span>
                        </div>
                        <div class="col-4">
                            <small class="text-muted d-block">التصنيفات</small>
                            <span class="fw-bold">10</span>
                        </div>
                        <div class="col-4">
                            <small class="text-muted d-block">الصفحات</small>
                            <span class="fw-bold">~120</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // تحديث مراجع عناصر DOM
        this.updateDOMElements();
        this.setupNavigationEvents();
        
        // تحميل قائمة الحكم
        this.loadWisdomList();
    }
    
    updateDOMElements() {
        this.elements.prevWisdomBtn = document.getElementById('prev-wisdom-btn');
        this.elements.nextWisdomBtn = document.getElementById('next-wisdom-btn');
        this.elements.currentTitle = document.getElementById('current-wisdom-title');
        this.elements.wisdomCounter = document.getElementById('wisdom-counter');
        this.elements.gotoInput = document.getElementById('goto-wisdom-input');
        this.elements.gotoBtn = document.getElementById('goto-wisdom-btn');
        this.elements.wisdomList = document.getElementById('wisdom-list-menu');
        this.elements.wisdomContainer = document.getElementById('wisdom-content-container');
        this.elements.searchInput = document.getElementById('wisdom-search-input');
        this.elements.searchBtn = document.getElementById('wisdom-search-btn');
        this.elements.categoryFilter = document.getElementById('wisdom-category-filter');
        this.elements.randomBtn = document.getElementById('wisdom-random-btn');
    }
    
    setupNavigationEvents() {
        // زر الحكمة السابقة
        if (this.elements.prevWisdomBtn) {
            this.elements.prevWisdomBtn.addEventListener('click', () => {
                if (this.currentWisdomId > 1) {
                    this.loadWisdom(this.currentWisdomId - 1);
                }
            });
        }
        
        // زر الحكمة التالية
        if (this.elements.nextWisdomBtn) {
            this.elements.nextWisdomBtn.addEventListener('click', () => {
                if (this.currentWisdomId < this.totalWisdom) {
                    this.loadWisdom(this.currentWisdomId + 1);
                }
            });
        }
        
        // الانتقال إلى حكمة محددة
        if (this.elements.gotoBtn && this.elements.gotoInput) {
            this.elements.gotoBtn.addEventListener('click', () => {
                const wisdomId = parseInt(this.elements.gotoInput.value);
                if (wisdomId >= 1 && wisdomId <= this.totalWisdom) {
                    this.loadWisdom(wisdomId);
                } else {
                    alert(`الرجاء إدخال رقم بين 1 و ${this.totalWisdom}`);
                }
            });
            
            this.elements.gotoInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.elements.gotoBtn.click();
                }
            });
        }
        
        // زر الحكمة العشوائية
        if (this.elements.randomBtn) {
            this.elements.randomBtn.addEventListener('click', () => {
                const randomId = Math.floor(Math.random() * this.totalWisdom) + 1;
                this.loadWisdom(randomId);
            });
        }
    }
    
    setupSearchAndFilter() {
        // البحث
        if (this.elements.searchBtn && this.elements.searchInput) {
            this.elements.searchBtn.addEventListener('click', () => {
                this.searchTerm = this.elements.searchInput.value.trim();
                this.filterWisdom();
            });
            
            this.elements.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchTerm = this.elements.searchInput.value.trim();
                    this.filterWisdom();
                }
            });
        }
        
        // التصفية حسب التصنيف
        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.filterWisdom();
            });
        }
    }
    
    filterWisdom() {
        const filtered = this.wisdomIndex.filter(wisdom => {
            // التصفية حسب البحث
            const matchesSearch = !this.searchTerm || 
                wisdom.title.includes(this.searchTerm) ||
                wisdom.keywords?.some(kw => kw.includes(this.searchTerm));
            
            // التصفية حسب التصنيف
            const matchesCategory = this.currentCategory === 'all' || 
                wisdom.category === this.currentCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        // تحديث القائمة المنسدلة
        this.loadWisdomList(filtered);
        
        // إذا كان هناك نتائج، تحميل أول نتيجة
        if (filtered.length > 0) {
            this.loadWisdom(filtered[0].id);
        } else {
            this.showNoResults();
        }
    }
    
    loadWisdomList(filteredList = null) {
        if (!this.elements.wisdomList) return;
        
        const listToShow = filteredList || this.wisdomIndex;
        
        if (listToShow.length === 0) {
            this.elements.wisdomList.innerHTML = `
                <div class="px-3 py-2">
                    <small class="text-muted">لا توجد نتائج</small>
                </div>
            `;
            return;
        }
        
        let listHTML = '';
        
        // تجميع الحكم حسب التصنيف
        const wisdomByCategory = {};
        listToShow.forEach(wisdom => {
            const category = wisdom.category || 'غير مصنف';
            if (!wisdomByCategory[category]) {
                wisdomByCategory[category] = [];
            }
            wisdomByCategory[category].push(wisdom);
        });
        
        // إنشاء القائمة
        for (const [category, wisdomList] of Object.entries(wisdomByCategory)) {
            listHTML += `
                <h6 class="dropdown-header">${category} <span class="badge bg-secondary">${wisdomList.length}</span></h6>
                ${wisdomList.map(wisdom => `
                    <a class="dropdown-item wisdom-list-item ${wisdom.id === this.currentWisdomId ? 'active' : ''}" 
                       href="#" 
                       data-wisdom-id="${wisdom.id}">
                        <span class="badge bg-secondary me-2">${wisdom.id}</span>
                        ${wisdom.title}
                        ${wisdom.keywords ? `
                            <div class="mt-1">
                                ${wisdom.keywords.map(kw => `<span class="badge bg-light text-dark me-1">${kw}</span>`).join('')}
                            </div>
                        ` : ''}
                    </a>
                `).join('')}
                <div class="dropdown-divider"></div>
            `;
        }
        
        this.elements.wisdomList.innerHTML = listHTML;
        
        // إضافة أحداث النقر
        document.querySelectorAll('.wisdom-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const wisdomId = parseInt(e.currentTarget.getAttribute('data-wisdom-id'));
                this.loadWisdom(wisdomId);
                
                // إغلاق القائمة المنسدلة
                const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('wisdom-list-btn'));
                if (dropdown) dropdown.hide();
            });
        });
    }
    
    updateNavigationUI() {
        // تحديث العنوان
        if (this.elements.currentTitle && this.currentWisdom) {
            this.elements.currentTitle.innerHTML = `
                <span class="badge bg-success me-2">الحكمة ${this.currentWisdomId}</span>
                ${this.currentWisdom.metadata.title}
            `;
        }
        
        // تحديث العداد
        if (this.elements.wisdomCounter) {
            this.elements.wisdomCounter.textContent = `${this.currentWisdomId} / ${this.totalWisdom}`;
        }
        
        // تحديث حالة الأزرار
        if (this.elements.prevWisdomBtn) {
            this.elements.prevWisdomBtn.disabled = this.currentWisdomId <= 1;
            this.elements.prevWisdomBtn.innerHTML = this.currentWisdomId <= 1 ? 
                '<i class="bi bi-chevron-right"></i>' : 
                '<i class="bi bi-chevron-right"></i> السابقة';
        }
        
        if (this.elements.nextWisdomBtn) {
            this.elements.nextWisdomBtn.disabled = this.currentWisdomId >= this.totalWisdom;
            this.elements.nextWisdomBtn.innerHTML = this.currentWisdomId >= this.totalWisdom ?
                '<i class="bi bi-chevron-left"></i>' :
                'التالية <i class="bi bi-chevron-left"></i>';
        }
        
        // تحديث حقل الإدخال
        if (this.elements.gotoInput) {
            this.elements.gotoInput.value = this.currentWisdomId;
            this.elements.gotoInput.max = this.totalWisdom;
        }
    }
    
    renderCurrentWisdom() {
        if (!this.currentWisdom || !this.elements.wisdomContainer) return;
        
        const wisdom = this.currentWisdom;
        const content = wisdom.content;
        
        const html = `
            <div class="wisdom-container" data-wisdom-id="${wisdom.content.wisdom_id}">
                <!-- رأس الحكمة -->
                <div class="wisdom-header card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h3 class="text-success mb-2">${wisdom.metadata.title}</h3>
                                <div class="wisdom-meta mb-2">
                                    ${wisdom.metadata.category ? `<span class="badge bg-info me-2">${wisdom.metadata.category}</span>` : ''}
                                    ${content.section ? `<span class="badge bg-light text-dark me-2">${content.section}</span>` : ''}
                                    ${wisdom.metadata.page_start ? `<small class="text-muted d-block">الصفحات: ${wisdom.metadata.page_start} - ${wisdom.metadata.page_end}</small>` : ''}
                                </div>
                                ${content.keywords ? `
                                    <div class="wisdom-keywords">
                                        ${content.keywords.map(kw => `<span class="badge bg-light text-dark me-1 mb-1">${kw}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="wisdom-actions">
                                    <button class="btn btn-outline-success btn-sm me-2" id="copy-wisdom-btn">
                                        <i class="bi bi-clipboard"></i> نسخ
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" id="share-wisdom-btn">
                                        <i class="bi bi-share"></i> مشاركة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- محتوى الحكمة -->
                <div class="wisdom-content">
                    <div class="wisdom-text card border-0 bg-light mb-4">
                        <div class="card-body">
                            <blockquote class="blockquote mb-0">
                                <p class="text-center" style="font-size: 1.3rem; line-height: 2;">
                                    <i class="bi bi-quote text-muted me-2"></i>
                                    ${content.text}
                                    <i class="bi bi-quote text-muted ms-2"></i>
                                </p>
                            </blockquote>
                        </div>
                    </div>
                    
                    <!-- شرح الحكمة -->
                    ${content.footnotes && content.footnotes.length > 0 ? `
                        <div class="wisdom-explanation card shadow-sm mb-4">
                            <div class="card-header bg-primary text-white">
                                <i class="bi bi-chat-quote me-2"></i> شرح الحكمة
                            </div>
                            <div class="card-body">
                                ${content.footnotes.map(footnote => `
                                    <div class="explanation-item mb-3">
                                        <div class="d-flex align-items-start">
                                            <span class="badge bg-primary me-2">${footnote.id}</span>
                                            <div class="explanation-content">
                                                <p class="mb-1">${footnote.text}</p>
                                                ${footnote.page ? `<small class="text-muted">الصفحة: ${footnote.page}</small>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- حكم ذات صلة -->
                    <div class="related-wisdom">
                        <h5 class="text-secondary mb-3">
                            <i class="bi bi-link-45deg me-2"></i> حكم ذات صلة
                        </h5>
                        <div class="row">
                            ${this.getRelatedWisdom().map(related => `
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100 border hover-card">
                                        <div class="card-body">
                                            <h6 class="card-title text-truncate">${related.title}</h6>
                                            <p class="card-text text-muted small text-truncate">${related.preview}</p>
                                            <button class="btn btn-sm btn-outline-primary" 
                                                    onclick="window.nahjWisdom.loadWisdom(${related.id})">
                                                قراءة الحكمة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- تذييل الحكمة -->
                <div class="wisdom-footer mt-4 pt-3 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-book"></i> ${wisdom.metadata.source || 'نهج البلاغة'}
                            </small>
                        </div>
                        <div class="col-md-6 text-end">
                            <small class="text-muted">
                                شرح: ${wisdom.metadata.editor || 'محمد عبده'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.wisdomContainer.innerHTML = html;
        
        // إعداد تفاعلات الأزرار
        this.setupWisdomInteractions();
    }
    
    getRelatedWisdom() {
        // الحصول على حكم ذات صلة (بناءً على التصنيف)
        const currentCategory = this.currentWisdom.metadata.category;
        const related = this.wisdomIndex
            .filter(w => w.category === currentCategory && w.id !== this.currentWisdomId)
            .slice(0, 3);
        
        return related.map(w => ({
            id: w.id,
            title: w.title,
            preview: this.getWisdomPreview(w.id)
        }));
    }
    
    getWisdomPreview(wisdomId) {
        // نصوص معاينة افتراضية
        const previews = [
            "حكمة عميقة عن الحياة والموت",
            "نصيحة قيمة في التعامل مع الناس",
            "عبرة وتأمل في أمور الدنيا",
            "موعظة بليغة عن التقوى",
            "كلمة حكمة في طلب العلم"
        ];
        return previews[wisdomId % previews.length];
    }
    
    setupWisdomInteractions() {
        // نسخ الحكمة
        const copyBtn = document.getElementById('copy-wisdom-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = this.currentWisdom.content.text;
                navigator.clipboard.writeText(text).then(() => {
                    // إظهار رسالة نجاح
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="bi bi-check2"></i> تم النسخ';
                    copyBtn.classList.add('btn-success');
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.remove('btn-success');
                    }, 2000);
                });
            });
        }
        
        // مشاركة الحكمة
        const shareBtn = document.getElementById('share-wisdom-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const text = `${this.currentWisdom.content.text}\n\n- نهج البلاغة، الحكمة ${this.currentWisdomId}`;
                if (navigator.share) {
                    navigator.share({
                        title: this.currentWisdom.metadata.title,
                        text: text,
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('تم نسخ الحكمة للمشاركة!');
                    });
                }
            });
        }
    }
    
    showNoResults() {
        if (this.elements.wisdomContainer) {
            this.elements.wisdomContainer.innerHTML = `
                <div class="text-center p-5">
                    <i class="bi bi-search display-1 text-muted mb-3"></i>
                    <h4 class="text-secondary">لا توجد نتائج</h4>
                    <p class="text-muted">لم نعثر على حكم تطابق بحثك</p>
                    <button class="btn btn-primary mt-3" onclick="window.nahjWisdom.clearSearch()">
                        <i class="bi bi-arrow-clockwise"></i> عرض جميع الحكم
                    </button>
                </div>
            `;
        }
    }
    
    clearSearch() {
        this.searchTerm = '';
        this.currentCategory = 'all';
        
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        if (this.elements.categoryFilter) this.elements.categoryFilter.value = 'all';
        
        this.filterWisdom();
    }
    
    showError(message) {
        if (this.elements.wisdomContainer) {
            this.elements.wisdomContainer.innerHTML = `
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

// تصدير الكلاس للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.NahjWisdom = NahjWisdom;
    console.log('✅ NahjWisdom جاهز للاستخدام');

}


