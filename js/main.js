// main.js - النسخة المعدلة مع تصحيح الخطأ
class NahjAlBalaghaApp {
    constructor() {
        console.log('🔍 التحقق من توفر الكلاسات:');
        console.log('- NahjSermons:', typeof window.NahjSermons);
        console.log('- NahjLetters:', typeof window.NahjLetters);
        console.log('- NahjWisdom:', typeof window.NahjWisdom);
        
        // تحقق من وجود الكلاسات قبل إنشاء النسخ
        if (typeof window.NahjSermons === 'undefined') {
            console.warn('⚠️ NahjSermons غير محمل - سيكون قسم الخطب غير متوفر');
        }
        if (typeof window.NahjLetters === 'undefined') {
            console.warn('⚠️ NahjLetters غير محمل - سيكون قسم الرسائل غير متوفر');
        }
        if (typeof window.NahjWisdom === 'undefined') {
            console.warn('⚠️ NahjWisdom غير محمل - سيكون قسم الحكم غير متوفر');
        }
        
        // إنشاء نسخ من الكلاسات المتاحة
        this.sermons = window.NahjSermons ? new window.NahjSermons() : null;
        this.letters = window.NahjLetters ? new window.NahjLetters() : null;
        this.wisdom = window.NahjWisdom ? new window.NahjWisdom() : null;
        
        this.currentView = 'sermons';
        this.isInitialized = false;
        
        console.log('✅ تم إنشاء تطبيق نهج البلاغة');
    }
    
    async init() {
        try {
            if (this.isInitialized) {
                console.log('⚠️ التطبيق مهيئ بالفعل');
                return;
            }
            
            console.log('🔄 جاري تهيئة نهج البلاغة...');
            
            // تهيئة الخطب إذا كانت متاحة
            if (this.sermons) {
                await this.sermons.init('nahj-content');
                console.log('✅ قسم الخطب جاهز');
            } else {
                console.log('⚠️ قسم الخطب غير متوفر');
            }
            
            // تحميل فهرس الرسائل فقط (بدون عرض)
            if (this.letters) {
                await this.letters.loadLettersIndex();
                console.log('✅ فهرس الرسائل محمل');
            } else {
                console.log('⚠️ قسم الرسائل غير متوفر');
            }
            
            // تحميل فهرس الحكم
            if (this.wisdom) {
                await this.wisdom.loadWisdomIndex();
                console.log('✅ فهرس الحكم محمل');
            } else {
                console.log('⚠️ قسم الحكم غير متوفر');
            }
            
            this.setupNavigation();
            await this.showView('sermons');
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة نهج البلاغة بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة نهج البلاغة:', error);
            this.showError('تعذر تهيئة نهج البلاغة: ' + error.message);
        }
    }
    
    setupNavigation() {
        console.log('🔄 جاري إعداد التنقل...');
        
        // تبويبات نهج البلاغة
        const tabs = document.querySelectorAll('#nahj-tabs .nav-link');
        if (!tabs.length) {
            console.warn('⚠️ تبويبات نهج البلاغة غير موجودة');
            return;
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                console.log(`📱 تم النقر على: ${section}`);
                
                // التحقق من توفر القسم قبل التبديل
                if (!this.isSectionAvailable(section)) {
                    this.showSectionNotAvailable(section);
                    return;
                }
                
                this.showView(section);
            });
        });
        
        console.log('✅ تم إعداد التنقل');
    }
    
    isSectionAvailable(section) {
        switch(section) {
            case 'sermons':
                return this.sermons !== null;
            case 'letters':
                return this.letters !== null;
            case 'wisdoms':
                return this.wisdom !== null;
            default:
                return false;
        }
    }
    
    async showView(viewType) {
        console.log(`🔄 تبديل العرض إلى: ${viewType}`);
        this.currentView = viewType;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('#nahj-tabs .nav-link').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-section') === viewType) {
                tab.classList.add('active');
            }
        });
        
        // إعداد المحتوى حسب القسم
        const contentDiv = document.getElementById('nahj-content');
        
        switch(viewType) {
            case 'sermons':
                if (this.sermons) {
                    if (!this.sermons.currentSermon) {
                        await this.sermons.loadSermon(1);
                    }
                } else {
                    this.showSectionNotAvailable('sermons');
                }
                break;
                
            case 'letters':
                if (this.letters) {
                    contentDiv.innerHTML = `
                        <div class="letters-welcome text-center p-4">
                            <h4 class="text-primary mb-3">📜 رسائل الإمام علي (ع)</h4>
                            <p class="text-muted mb-4">مجموعة رسائل الإمام علي بن أبي طالب إلى الولاة والقادة والناس</p>
                            <div class="row justify-content-center">
                                <div class="col-md-8">
                                    <div class="card shadow-sm mb-3">
                                        <div class="card-body">
                                            <h5 class="card-title">الرسالة الأولى</h5>
                                            <p class="card-text">رسالة إلى أهل الكوفة عند مسيره من المدينة إلى البصرة</p>
                                            <button class="btn btn-primary" onclick="loadLetter(1)">
                                                قراءة الرسالة
                                            </button>
                                        </div>
                                    </div>
                                    <div class="card shadow-sm mb-3">
                                        <div class="card-body">
                                            <h5 class="card-title">العهد إلى مالك الأشتر</h5>
                                            <p class="card-text">أشهر عهد في التاريخ الإسلامي عند توليته مصر</p>
                                            <button class="btn btn-primary" onclick="loadLetter(4)">
                                                قراءة العهد
                                            </button>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline-primary w-100 mt-3" onclick="showLettersList()">
                                        <i class="bi bi-list-ul"></i> عرض جميع الرسائل
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    this.showSectionNotAvailable('letters');
                }
                break;
                
            case 'wisdoms':
                if (this.wisdom) {
                    // عرض قسم الحكم مع واجهة البحث
                    contentDiv.innerHTML = `
                        <div class="wisdoms-welcome text-center p-4">
                            <h4 class="text-success mb-3">💭 حكم الإمام علي (ع)</h4>
                            <p class="text-muted mb-4">مجموعة من الحكم والمواعظ التي تنير العقول وتصلح القلوب</p>
                            
                            <!-- إحصائيات سريعة -->
                            <div class="row mb-4">
                                <div class="col-4">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h5 class="text-success">480+</h5>
                                            <small class="text-muted">حكمة</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h5 class="text-primary">10</h5>
                                            <small class="text-muted">تصنيف</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h5 class="text-warning">120</h5>
                                            <small class="text-muted">صفحة</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- أزرار الإجراءات -->
                            <div class="d-grid gap-2 d-md-block">
                                <button class="btn btn-success me-md-2 mb-2" onclick="loadRandomWisdom()">
                                    <i class="bi bi-shuffle"></i> حكمة عشوائية
                                </button>
                                <button class="btn btn-outline-success mb-2" onclick="loadWisdom(1)">
                                    <i class="bi bi-arrow-right"></i> بدء القراءة
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // تهيئة واجهة الحكم بعد فترة قصيرة
                    setTimeout(async () => {
                        if (this.wisdom) {
                            await this.wisdom.init('nahj-content');
                        }
                    }, 100);
                } else {
                    this.showSectionNotAvailable('wisdoms');
                }
                break;
        }
    }
    
   async loadLetter(letterId) {
    try {
        if (!this.letters) {
            throw new Error('قسم الرسائل غير متوفر');
        }

        // تحميل الرسالة
        await this.letters.loadLetter(letterId);

        // التأكد من وجود الحاوية
        const contentDiv = document.getElementById('nahj-content');
        if (!contentDiv) return;

        // إنشاء واجهة الرسائل (إن لم تكن موجودة)
        this.letters.setupContainer('nahj-content');

        // عرض الرسالة الحالية
        await this.letters.renderCurrentLetter();

    } catch (error) {
        console.error('❌ خطأ في تحميل الرسالة:', error);
        this.showError('تعذر تحميل الرسالة: ' + error.message);
    }
}

    
    async loadWisdom(wisdomId) {
        try {
            if (!this.wisdom) {
                throw new Error('قسم الحكم غير متوفر');
            }
            
            // تحميل وتهيئة الحكمة
            await this.wisdom.loadWisdom(wisdomId);
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الحكمة:', error);
            this.showError('تعذر تحميل الحكمة: ' + error.message);
        }
    }
    
    async loadRandomWisdom() {
        try {
            if (!this.wisdom) {
                throw new Error('قسم الحكم غير متوفر');
            }
            
            const randomId = Math.floor(Math.random() * this.wisdom.totalWisdom) + 1;
            await this.loadWisdom(randomId);
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الحكمة العشوائية:', error);
            this.showError('تعذر تحميل الحكمة العشوائية: ' + error.message);
        }
    }
    
    showLettersList() {
        if (!this.letters) {
            this.showSectionNotAvailable('letters');
            return;
        }
        
        // عرض قائمة الرسائل
        const lettersList = this.letters.lettersIndex || [];
        
        let html = `
            <div class="letters-list">
                <button class="btn btn-outline-secondary mb-3" onclick="window._nahjAppInstance.showView('letters')">
                    <i class="bi bi-arrow-right"></i> العودة
                </button>
                
                <h4 class="text-primary mb-4">قائمة الرسائل</h4>
                
                <div class="row">
        `;
        
        if (lettersList.length === 0) {
            html += `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> لا توجد رسائل متاحة حالياً
                    </div>
                </div>
            `;
        } else {
            lettersList.forEach(letter => {
                html += `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card h-100 hover-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <span class="badge bg-primary me-2">${letter.id}</span>
                                    ${letter.title}
                                </h5>
                                ${letter.subtitle ? `<p class="card-text text-muted small">${letter.subtitle}</p>` : ''}
                                ${letter.category ? `<span class="badge bg-info mb-2">${letter.category}</span>` : ''}
                                <button class="btn btn-sm btn-outline-primary mt-2" onclick="window._nahjAppInstance.loadLetter(${letter.id})">
                                    قراءة الرسالة
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        document.getElementById('nahj-content').innerHTML = html;
    }
    
    showSectionNotAvailable(section) {
        const sectionNames = {
            'sermons': 'الخطب',
            'letters': 'الرسائل', 
            'wisdoms': 'الحكم'
        };
        
        const contentDiv = document.getElementById('nahj-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="text-center p-5">
                    <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                    <h4 class="text-secondary">القسم غير متوفر</h4>
                    <p class="text-muted">قسم ${sectionNames[section]} غير متاح حالياً</p>
                    <p class="small text-muted">تأكد من تحميل ملف ${sectionNames[section]}.js</p>
                    <button class="btn btn-primary mt-3" onclick="window._nahjAppInstance.showView('sermons')">
                        العودة للخطب
                    </button>
                </div>
            `;
        }
    }
    
    showError(message) {
        const contentDiv = document.getElementById('nahj-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${message}
                </div>
            `;
        }
    }
}

// الدوال المساعدة للاستخدام من HTML
function loadLetter(letterId) {
    if (window._nahjAppInstance && window._nahjAppInstance.loadLetter) {
        return window._nahjAppInstance.loadLetter(letterId);
    }
    alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
}

function loadWisdom(wisdomId) {
    if (window._nahjAppInstance && window._nahjAppInstance.loadWisdom) {
        return window._nahjAppInstance.loadWisdom(wisdomId);
    }
    alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
}

function loadRandomWisdom() {
    if (window._nahjAppInstance && window._nahjAppInstance.loadRandomWisdom) {
        return window._nahjAppInstance.loadRandomWisdom();
    }
    alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
}

function showLettersList() {
    if (window._nahjAppInstance && window._nahjAppInstance.showLettersList) {
        return window._nahjAppInstance.showLettersList();
    }
    alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
}

// بدء التطبيق بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('📖 DOM جاهز، إعداد نهج البلاغة...');
    
    // زر الدخول لنهج البلاغة
    const nahjButton = document.getElementById('nahj-button');
    if (!nahjButton) {
        console.error('❌ زر نهج البلاغة غير موجود!');
        return;
    }
    
    nahjButton.addEventListener('click', async () => {
        console.log('🎯 تم النقر على زر نهج البلاغة');
        
        try {
            // تأكد من تحميل Bootstrap
            if (typeof bootstrap === 'undefined') {
                throw new Error('Bootstrap غير محمل!');
            }
            
            // حذف النسخة القديمة إن وجدت
            if (window._nahjAppInstance) {
                console.log('🔄 إعادة تهيئة التطبيق...');
            }
            
            // إنشاء نسخة جديدة من التطبيق
            const app = new NahjAlBalaghaApp();
            
            // حفظ النسخة في متغير مختلف لتجنب التعارض
            window._nahjAppInstance = app;
            
            // تهيئة التطبيق
            await app.init();
            
            // تبديل الصفحات
            document.getElementById('home-page').classList.remove('active');
            document.getElementById('nahj-page').classList.add('active');
            
            console.log('✅ تم التبديل إلى صفحة نهج البلاغة');
            
        } catch (error) {
            console.error('❌ خطأ في فتح نهج البلاغة:', error);
            
            // عرض رسالة خطأ بديلة
            const contentDiv = document.getElementById('nahj-content');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> تعذر فتح نهج البلاغة: ${error.message}
                        <div class="mt-3">
                            <small class="text-muted d-block">تحقق من:</small>
                            <ul class="text-muted small">
                                <li>اتصال الإنترنت</li>
                                <li>تحميل ملفات JavaScript</li>
                                <li>تحميل مكتبة Bootstrap</li>
                            </ul>
                            <button class="btn btn-sm btn-outline-danger mt-2" onclick="window.location.reload()">
                                <i class="bi bi-arrow-clockwise"></i> إعادة تحميل الصفحة
                            </button>
                        </div>
                    </div>
                `;
            }
            
            // مع ذلك، قم بتبديل الصفحات لعرض الرسالة
            document.getElementById('home-page').classList.remove('active');
            document.getElementById('nahj-page').classList.add('active');
        }
    });
    
    // زر العودة
    const backButton = document.getElementById('nahj-back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            document.getElementById('nahj-page').classList.remove('active');
            document.getElementById('home-page').classList.add('active');
            console.log('↩️ العودة للصفحة الرئيسية');
        });
    }
});

// الاحتفاظ بالكائن العالمي للتوافق مع الكود القديم
window.nahjApp = {
    loadLetter: function(letterId) {
        if (window._nahjAppInstance && window._nahjAppInstance.loadLetter) {
            return window._nahjAppInstance.loadLetter(letterId);
        }
        alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
        return Promise.resolve();
    },
    loadWisdom: function(wisdomId) {
        if (window._nahjAppInstance && window._nahjAppInstance.loadWisdom) {
            return window._nahjAppInstance.loadWisdom(wisdomId);
        }
        alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
        return Promise.resolve();
    },
    loadRandomWisdom: function() {
        if (window._nahjAppInstance && window._nahjAppInstance.loadRandomWisdom) {
            return window._nahjAppInstance.loadRandomWisdom();
        }
        alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
        return Promise.resolve();
    },
    showView: function(viewType) {
        if (window._nahjAppInstance && window._nahjAppInstance.showView) {
            return window._nahjAppInstance.showView(viewType);
        }
        alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
        return Promise.resolve();
    },
    showLettersList: function() {
        if (window._nahjAppInstance && window._nahjAppInstance.showLettersList) {
            return window._nahjAppInstance.showLettersList();
        }
        alert('تطبيق نهج البلاغة غير مهيئ بعد. اضغط على زر نهج البلاغة أولاً.');
    }
};


