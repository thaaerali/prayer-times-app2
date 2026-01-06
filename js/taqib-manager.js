// ملف مدير تعقيبات الصلاة - معدل لعرض كامل الصفحة
(function() {
    'use strict';
    
    // كائن تعقيبات الصلاة
    const TaqibManager = {
        // روابط GitHub للملفات
        taqibUrls: {
            fajr: 'https://raw.githubusercontent.com/thaaerali/taqib/refs/heads/main/taqib/fajr.txt',
            dhuhr: 'https://raw.githubusercontent.com/thaaerali/taqib/refs/heads/main/taqib/dhuhr.txt',
            asr: 'https://raw.githubusercontent.com/thaaerali/taqib/refs/heads/main/taqib/asr.txt',
            maghrib: 'https://raw.githubusercontent.com/thaaerali/taqib/refs/heads/main/taqib/maghrib.txt',
            isha: 'https://raw.githubusercontent.com/thaaerali/taqib/refs/heads/main/taqib/isha.txt'
        },
        
        // أسماء الصلوات بالعربية
        prayerNames: {
            fajr: 'صلاة الفجر',
            dhuhr: 'صلاة الظهر',
            asr: 'صلاة العصر',
            maghrib: 'صلاة المغرب',
            isha: 'صلاة العشاء'
        },
        
        // تهيئة
        init: function() {
            console.log('📖 تهيئة تعقيبات الصلاة...');
            this.setupEventListeners();
        },
        
        // إعداد مستمعي الأحداث
        setupEventListeners: function() {
            setTimeout(() => {
                const taqibBtn = document.getElementById('taqib-button');
                if (taqibBtn) {
                    console.log('✅ تم العثور على زر تعقيب الصلاة');
                    taqibBtn.addEventListener('click', () => this.openTaqibModal());
                } else {
                    console.warn('⚠️ زر تعقيب الصلاة غير موجود');
                }
            }, 500);
        },
        
        // فتح نافذة تعقيب الصلاة - نافذة كاملة
        openTaqibModal: function() {
            console.log('فتح نافذة تعقيب الصلاة...');
            
            const modalElement = document.getElementById('taqib-modal');
            if (!modalElement) {
                console.error('نافذة تعقيب الصلاة غير موجودة');
                return;
            }
            
            // تحميل المحتوى
            this.loadTaqibContent();
            
            // إظهار النافذة باستخدام Bootstrap - نافذة كاملة
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: true
            });
            modal.show();
        },
        
        // تحميل محتوى تعقيب الصلاة - تصميم كامل الصفحة
        loadTaqibContent: function() {
            const contentDiv = document.getElementById('taqib-content');
            if (!contentDiv) return;
            
            contentDiv.innerHTML = `
                <div class="taqib-container" style="min-height: 80vh;">
                    <!-- رأس التعقيبات -->
                    <div class="taqib-header text-center mb-4">
                        <h4 class="text-success mb-2">تعقيب الصلاة</h4>
                        <p class="text-muted small">
                            <i class="bi bi-info-circle me-1"></i>
                            اختر الصلاة لعرض تعقيبها من مصباح المتهجد
                        </p>
                    </div>
                    
                    <!-- أزرار الصلوات -->
                    <div class="taqib-buttons row g-3 mb-4">
                        <div class="col-6 col-md-4 col-lg">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100 py-3" data-prayer="fajr">
                                <i class="bi bi-sunrise me-2 fs-5"></i>
                                <div class="d-block">الفجر</div>
                                <small class="text-muted">صلاة الصبح</small>
                            </button>
                        </div>
                        <div class="col-6 col-md-4 col-lg">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100 py-3" data-prayer="dhuhr">
                                <i class="bi bi-sun me-2 fs-5"></i>
                                <div class="d-block">الظهر</div>
                                <small class="text-muted">صلاة الظهر</small>
                            </button>
                        </div>
                        <div class="col-6 col-md-4 col-lg">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100 py-3" data-prayer="asr">
                                <i class="bi bi-cloud-sun me-2 fs-5"></i>
                                <div class="d-block">العصر</div>
                                <small class="text-muted">صلاة العصر</small>
                            </button>
                        </div>
                        <div class="col-6 col-md-6 col-lg">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100 py-3" data-prayer="maghrib">
                                <i class="bi bi-sunset me-2 fs-5"></i>
                                <div class="d-block">المغرب</div>
                                <small class="text-muted">صلاة المغرب</small>
                            </button>
                        </div>
                        <div class="col-12 col-md-6 col-lg">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100 py-3" data-prayer="isha">
                                <i class="bi bi-moon-stars me-2 fs-5"></i>
                                <div class="d-block">العشاء</div>
                                <small class="text-muted">صلاة العشاء</small>
                            </button>
                        </div>
                    </div>
                    
                    <!-- معلومات -->
                    <div class="alert alert-info mb-4">
                        <div class="d-flex">
                            <div class="me-3">
                                <i class="bi bi-lightbulb fs-4"></i>
                            </div>
                            <div class="flex-grow-1">
                                <small>
                                    <strong>معلومة:</strong> التعقيبات من كتاب "مصباح المتهجد" للشيخ الطوسي.
                                    يمكنك حفظ التعقيب أو مشاركته مع الآخرين.
                                </small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-info" onclick="TaqibManager.closeModal()">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- منطقة عرض التعقيب - مساحة أكبر -->
                    <div id="taqib-display-area" class="taqib-display-area mt-4 p-4 bg-light rounded" style="min-height: 400px;">
                        <div class="text-center py-5">
                            <i class="bi bi-book fs-1 text-muted mb-3"></i>
                            <h4 class="text-muted mb-3">اختر صلاة لعرض تعقيبها</h4>
                            <p class="text-muted small">انقر على أي من الصلوات أعلاه لعرض تعقيبها الكامل</p>
                        </div>
                    </div>
                    
                    <!-- أزرار الإجراءات العامة -->
                    <div class="taqib-actions mt-4 d-flex justify-content-end gap-2">
                        <button class="btn btn-outline-secondary btn-sm" onclick="TaqibManager.closeModal()">
                            <i class="bi bi-x-circle me-1"></i> إغلاق
                        </button>
                        <button class="btn btn-outline-primary btn-sm" id="print-all-taqib">
                            <i class="bi bi-printer me-1"></i> طباعة الكل
                        </button>
                    </div>
                </div>
            `;
            
            // إعداد أحداث الأزرار
            this.setupTaqibButtons();
            this.setupActionButtons();
        },
        
        // إعداد أحداث أزرار الصلوات
        setupTaqibButtons: function() {
            setTimeout(() => {
                const prayerButtons = document.querySelectorAll('.taqib-prayer-btn');
                prayerButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const prayer = e.currentTarget.getAttribute('data-prayer');
                        this.loadTaqibForPrayer(prayer);
                    });
                });
            }, 100);
        },
        
        // إعداد أحداث أزرار الإجراءات
        setupActionButtons: function() {
            setTimeout(() => {
                // زر طباعة الكل
                const printAllBtn = document.getElementById('print-all-taqib');
                if (printAllBtn) {
                    printAllBtn.addEventListener('click', () => {
                        this.printAllTaqib();
                    });
                }
            }, 100);
        },
        
        // تحميل تعقيب لصلاة محددة
        async loadTaqibForPrayer(prayer) {
            const displayArea = document.getElementById('taqib-display-area');
            if (!displayArea) return;
            
            // عرض مؤشر التحميل
            displayArea.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border spinner-border-lg text-success" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <h5 class="mt-3 text-success">جاري تحميل تعقيب ${this.prayerNames[prayer]}</h5>
                    <p class="text-muted small">قد يستغرق هذا بضع لحظات...</p>
                </div>
            `;
            
            try {
                // محاولة تحميل من GitHub
                const response = await fetch(this.taqibUrls[prayer]);
                
                if (!response.ok) {
                    throw new Error(`خطأ في تحميل التعقيب: ${response.status}`);
                }
                
                const text = await response.text();
                
                // عرض التعقيب
                this.displayTaqib(prayer, text);
                
            } catch (error) {
                console.error('خطأ في تحميل التعقيب:', error);
                
                // استخدام تعقيب افتراضي إذا فشل التحميل
                const defaultTaqib = this.getDefaultTaqib(prayer);
                this.displayTaqib(prayer, defaultTaqib);
                
                // إظهار رسالة تحذير
                this.showTaqibNotification('تعذر تحميل التعقيب من الإنترنت، تم عرض نسخة محلية', 'warning');
            }
        },
        
        // عرض التعقيب - تصميم كامل الصفحة
        displayTaqib(prayer, content) {
            const displayArea = document.getElementById('taqib-display-area');
            if (!displayArea) return;
            
            // معالجة النص لتنسيق أفضل
            const formattedContent = this.formatTaqibContent(content);
            
            displayArea.innerHTML = `
                <!-- رأس التعقيب -->
                <div class="taqib-header mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="text-success mb-0">
                            <i class="bi bi-bookmark-heart me-2"></i>
                            ${this.prayerNames[prayer]}
                        </h4>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-success" onclick="copyTaqibToClipboard('${prayer}')">
                                <i class="bi bi-clipboard me-1"></i> نسخ
                            </button>
                            <button class="btn btn-outline-primary" onclick="shareTaqib('${prayer}')">
                                <i class="bi bi-share me-1"></i> مشاركة
                            </button>
                            <button class="btn btn-outline-secondary" onclick="printCurrentTaqib('${prayer}')">
                                <i class="bi bi-printer me-1"></i> طباعة
                            </button>
                        </div>
                    </div>
                    
                    <div class="alert alert-success">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-info-circle me-2 fs-5"></i>
                            <div>
                                <strong>تعقيب ${this.prayerNames[prayer]} عن مصباح المتهجد</strong>
                                <div class="d-flex gap-3 mt-2 small">
                                    <span><i class="bi bi-clock me-1"></i> وقت القراءة: ${this.calculateReadingTime(content)} دقيقة</span>
                                    <span><i class="bi bi-card-text me-1"></i> عدد الكلمات: ${this.countWords(content)} كلمة</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- محتوى التعقيب - مساحة كبيرة -->
                <div class="taqib-content mb-4">
                    <div class="card border-0 shadow-lg" style="min-height: 300px;">
                        <div class="card-body p-4">
                            <div class="taqib-text fs-5" id="taqib-text-${prayer}" style="line-height: 2; font-family: 'Traditional Arabic', serif;">
                                ${formattedContent}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- أزرار التنقل والإجراءات -->
                <div class="taqib-footer">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-secondary" onclick="loadPreviousTaqib('${prayer}')">
                                    <i class="bi bi-arrow-right me-2"></i> التعقيب السابق
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-secondary" onclick="loadNextTaqib('${prayer}')">
                                    التعقيب التالي <i class="bi bi-arrow-left ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // حفظ التعقيب في localStorage للاستخدام بدون اتصال
            this.saveTaqibToCache(prayer, content);
            
            // تمييز الزر النشط
            this.highlightActiveButton(prayer);
            
            // التمرير إلى الأعلى
            displayArea.scrollTop = 0;
        },
        
        // تنسيق محتوى التعقيب - تحسين التنسيق
        formatTaqibContent(content) {
            if (!content) return '<p class="text-center text-muted">لا يوجد تعقيب متاح</p>';
            
            let formatted = content;
            
            // استبدال الأسطر الجديدة
            formatted = formatted.replace(/\n{3,}/g, '\n\n');
            formatted = formatted.replace(/\n/g, '<br><br>');
            
            // تنسيق العناوين والكلمات المهمة
            const highlightWords = [
                'اَللّـهُمَّ',
                'سُبْحانَ اللهِ',
                'صَلَّى اللهُ عَلى مُحَمَّد',
                'تَعْقِيبُ',
                'قُلْ'
            ];
            
            highlightWords.forEach(word => {
                const regex = new RegExp(`(${word})`, 'gi');
                formatted = formatted.replace(regex, '<strong class="text-primary">$1</strong>');
            });
            
            // إضافة فواصل بين المقاطع
            const sectionMarkers = [
                'وقل أيضاً',
                'وتقول عشر مرّات',
                'ثمّ قل',
                'ثمّ قل مائة مرّة',
                'ومائة مرّة'
            ];
            
            sectionMarkers.forEach(marker => {
                const regex = new RegExp(`(${marker}[^<]+)`, 'gi');
                formatted = formatted.replace(regex, 
                    '<hr class="my-4"><div class="alert alert-light"><strong>$1</strong></div>');
            });
            
            // تنسيق الأعداد والتكرار
            formatted = formatted.replace(/(\d+)(\s*)(مِرَّة|مَرَّة|مرّات|مرّة)/gi, 
                '<span class="badge bg-info text-dark fs-6 me-1">$1 $3</span>');
            
            // تحسين ظهور الآيات والأدعية
            formatted = formatted.replace(/يَا[^<]+/gi, '<span class="text-success fw-bold">$&</span>');
            
            return formatted;
        },
        
        // حساب وقت القراءة
        calculateReadingTime(text) {
            const words = text.split(/\s+/).length;
            const readingTime = Math.ceil(words / 150); // 150 كلمة في الدقيقة للعربية
            return readingTime || 1;
        },
        
        // حساب عدد الكلمات
        countWords(text) {
            return text.split(/\s+/).length;
        },
        
        // حفظ التعقيب في الكاش
        saveTaqibToCache(prayer, content) {
            try {
                const cacheKey = `taqib_${prayer}`;
                const cacheData = {
                    content: content,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            } catch (error) {
                console.error('خطأ في حفظ التعقيب في الكاش:', error);
            }
        },
        
        // تحميل التعقيب من الكاش
        loadTaqibFromCache(prayer) {
            try {
                const cacheKey = `taqib_${prayer}`;
                const cached = localStorage.getItem(cacheKey);
                
                if (cached) {
                    const cacheData = JSON.parse(cached);
                    // التحقق من أن البيانات عمرها أقل من 7 أيام
                    const oneWeek = 7 * 24 * 60 * 60 * 1000;
                    if (new Date().getTime() - cacheData.timestamp < oneWeek) {
                        return cacheData.content;
                    }
                }
            } catch (error) {
                console.error('خطأ في تحميل التعقيب من الكاش:', error);
            }
            
            return null;
        },
        
        // تمييز الزر النشط
        highlightActiveButton(prayer) {
            const buttons = document.querySelectorAll('.taqib-prayer-btn');
            buttons.forEach(button => {
                button.classList.remove('active', 'btn-success', 'border-success', 'border-2');
                button.classList.add('btn-outline-success');
                
                if (button.getAttribute('data-prayer') === prayer) {
                    button.classList.remove('btn-outline-success');
                    button.classList.add('btn-success', 'active', 'border-success', 'border-2');
                    // إضافة تأثير
                    button.style.transform = 'scale(1.05)';
                    button.style.transition = 'all 0.3s ease';
                } else {
                    button.style.transform = 'scale(1)';
                }
            });
        },
        
        // طباعة جميع التعقيبات
        printAllTaqib() {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>تعقيبات الصلاة - مصباح المتهجد</title>
                    <style>
                        body { font-family: 'Traditional Arabic', serif; padding: 20px; }
                        h1 { color: #198754; text-align: center; }
                        .prayer-section { margin: 30px 0; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
                        .prayer-title { color: #0d6efd; font-size: 1.5rem; }
                        .taqib-content { line-height: 2; font-size: 1.1rem; }
                        @media print {
                            .no-print { display: none; }
                            body { font-size: 14pt; }
                        }
                    </style>
                </head>
                <body>
                    <h1>تعقيبات الصلاة من كتاب مصباح المتهجد</h1>
                    <p class="text-center">طباعة بتاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                    <hr>
            `);
            
            // إضافة كل التعقيبات
            Object.keys(this.prayerNames).forEach(prayer => {
                printWindow.document.write(`
                    <div class="prayer-section">
                        <h2 class="prayer-title">${this.prayerNames[prayer]}</h2>
                        <div class="taqib-content">${this.getDefaultTaqib(prayer).replace(/\n/g, '<br>')}</div>
                    </div>
                `);
            });
            
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        },
        
        // إغلاق النافذة
        closeModal() {
            const modalElement = document.getElementById('taqib-modal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        },
        
        // تعقيبات افتراضية
        getDefaultTaqib(prayer) {
            const defaultTaqibs = {
                fajr: `تعقيب صَلاة الصّبح عَن مِصْباح المتهجّد

اَللّـهُمَّ صَلِّ علَى مُحَمَّد وَآلِ مُحَمَّد وَاهْدِني لِمَا اخْتُلِفَ فيهِ مِنَ الْحَقِّ بِاِذْنِكَ اِنَّكَ تَهْدي مَنْ تَشاءُ اِلى صِراط مُسْتَقيم وتقول عشر مرّات: اَللّـهُمَّ صَلِّ عَلى مُحَمَّد وَآلِ مُحَمَّد الْاَوْصِياءِ الرّاضينَ المَرْضِيّينَ بِاَفْضَلِ صَلَواتِكَ وَبارِكْ عَلَيْهِمْ بِاَفْضَلِ بَرَكاتِكَ وَالسَّلامُ عَلَيْهِمْ وَعَلى اَرْواحِهِمْ وَاَجْسادِهِمْ وَرَحْمَةُ اللهِ وَبَرَكاتُهُ وهذه الصّلاة واردة يوم الجمعة أيضاً عصراً بفضل عظيم.
وقل أيضاً: اَللّـهُمَّ اَحْيِنى عَلى ما اَحْيَيْتَ عَلَيْهِ عَلِيِّ بْنَ اَبي طالِب وَاَمِتْني عَلى ما ماتَ عَلَيْهِ عَلِيُّ ابن اَبي طالِب (عليه السلام)
وقل مائة مرّة: اَسْتَغْفِرُ اللهَ وَاَتُوبُ اِلَيْهِ ومائة مرّة أَسْأَلُ اللهَ الْعافِيَةَ
ومائة مرّة: اَسْتَجيرُ بِاللهِ مِنَ النّارِ ومائة مرّة: وَأَسْأَلُهُ الْجَنَّةَ
ومائة مرّة: أَسْأَلُ اللهَ الْحُورَ الْعينَ
ومائة مرّة: لا اِلـهَ اِلاَّ اللهُ الْمَلِكُ الْحَقُّ الْمُبينُ
ومائة مرّة التّوحيد
ومائة مرّة: صَلَّى اللهُ عَلى مُحَمَّد وَآلِ مُحَمَّد
ومائة مرّة: سُبْحانَ اللهِ وَاَلْحَمْدُ للهِ وَلا اِلـهَ اِلاَّ اللهُ وَاَللهُ اَكْبَرُ وَلا حَوْلَ وَلا قُوَّةَ اِلاّ بِاللهِ الْعَلِيِّ الْعَظيمِ
ومائة مرّة: ما شاءَ اللهُ كانَ وَلا حَوْلَ وَلا قُوَّةَ اِلاّ بِاللهِ الْعَلِيِّ الْعَظيمِ
ثمّ قل: اَصْبَحْتُ اَللّـهُمَّ مُعْتَصِماً بِذِمامِكَ الْمَنيعِ الَّذي لا يُطاوَلُ وَلا يُحاوَلُ مِنْ شَرِّ كُلِّ غاشِم وَطارِق مِنْ سائِرِ مَنْ خَلَقْتَ وَما خَلَقْتَ مِنْ خَلْقِكَ الصّامِتِ وَالنّاطِقِ في جُنَّة مِنْ كُلِّ مَخُوف بِلِباس سابِغَة وَلاءِ اَهْلِ بَيْتِ نَبِيِّكَ مُحْتَجِباً مِنْ كُلِّ قاصِد لي اِلى اَذِيَّة بِجِدار حَصين الْاِخْلاصِ فِي الْاِعْتِرافِ بِحَقِّهِمْ وَالَّتمَسُّكِ بَحَبْلِهِمْ مُوقِناً اَنَّ الْحَقَّ لَهُمْ وَمَعَهُمْ وَفيهِمْ وَبِهِمْ اُوالي مَنْ والَوْا وَاُجانِبُ مَنْ جانَبُوا فَاَعِذْني اَللّـهُمَّ بِهِمْ مِنْ شَرِّ كُلِّ ما اَتَّقيهِ يا عَظيمُ حَجَزْتُ الْاَعادِيَ عَنّي بِبَديعِ السَّمواتِ وَالْاَرْضِ اِنّا جَعَلْنا مِنْ بَيْنِ اَيْديهِمِ سَدّاً وَمِنْ خَلْفِهِمْ سَدّاً فَاَغْشَيْناهُمْ فَهُمْ لا يُبْصِرُونَ.`,
                
                dhuhr: `تعقيب صلاة الظهر عن مصباح المتهجد

اَللّـهُمَّ صَلِّ علَى مُحَمَّد وَآلِ مُحَمَّد وَاقْبِلْ صَلاتي وَدُعائي وَارْحَمْ تَضَرُّعي وَذُلّي وَتَعَبُّدي وَاجْعَلْني مِنْ عُتَقائِكَ مِنَ النّارِ
وقل: يا ذَا الْجَلالِ وَالْاِكْرامِ يا ذَا النَّعْماءِ وَالْجُودِ يا ذَا الْمَنِّ وَالطَّوْلِ حَرِّمْ شَيْبَتي عَلَى النّارِ
ثمّ قل مائة مرّة: اَسْتَغْفِرُ اللهَ رَبّي وَاَتُوبُ اِلَيْهِ
ومائة مرّة: يا اَرْحَمَ الرّاحِمينَ`,
                
                asr: `تعقيب صلاة العصر عن مصباح المتهجد

اَللّـهُمَّ صَلِّ علَى مُحَمَّد وَآلِ مُحَمَّد وَاغْفِرْ لي ذُنُوبي وَتُبْ عَلَيَّ اِنَّكَ اَنْتَ التَّوّابُ الرَّحيمُ
وقل: يا عَظيمُ اِغْفِرْ لي الذَّنْبَ الْعَظيمَ فَاِنَّهُ لا يَغْفِرُ الذُّنُوبَ اِلاَّ اَنْتَ
ثمّ قل مائة مرّة: اَللّـهُمَّ صَلِّ عَلى مُحَمَّد وَآلِ مُحَمَّد
ومائة مرّة: اَسْتَغْفِرُ اللهَ الْعَظيمَ الَّذي لا اِلـهَ اِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَاَتُوبُ اِلَيْهِ`,
                
                maghrib: `تعقيب صلاة المغرب عن مصباح المتهجد

اَللّـهُمَّ صَلِّ علَى مُحَمَّد وَآلِ مُحَمَّد وَاجْعَلْني مِنْ عُتَقائِكَ مِنَ النّارِ وَمِنْ اَوْلِيائِكَ اَهْلِ الْجَنَّةِ
وقل: اَللّـهُمَّ اِنّي اَسْاَلُكَ مُوجِباتِ رَحْمَتِكَ وَعَزائِمَ مَغْفِرَتِكَ وَالسَّلامَةَ مِنْ كُلِّ اِثْم وَالْغَنيمَةَ مِنْ كُلِّ بِرّ
ثمّ قل مائة مرّة: اَللّـهُمَّ اغْفِرْ لي وَارْحَمْني وَتُبْ عَلَيَّ
ومائة مرّة: يا رَحْمنُ يا رَحيمُ`,
                
                isha: `تعقيب صلاة العشاء عن مصباح المتهجد

اَللّـهُمَّ صَلِّ علَى مُحَمَّد وَآلِ مُحَمَّد وَاغْفِرْ لي ما مَضى مِنْ ذُنُوبي وَاعْصِمْني فيما بَقِيَ مِنْ عُمْري
وقل: اَللّـهُمَّ بِكَ اُمْسَيْتُ وَبِكَ اَصْبَحْتُ وَبِكَ اَحْيا وَبِكَ اَمُوتُ وَاِلَيْكَ النُّشُورُ
ثمّ قل مائة مرّة: سُبْحانَ اللهِ وَالْحَمْدُ للهِ وَلا اِلـهَ اِلاَّ اللهُ وَاللهُ اَكْبَرُ
ومائة مرّة: لا حَوْلَ وَلا قُوَّةَ اِلاّ بِاللهِ الْعَلِيِّ الْعَظيمِ`
            };
            
            return defaultTaqibs[prayer] || 'تعقيب الصلاة غير متوفر حالياً.';
        },
        
        // إظهار إشعار
        showTaqibNotification: function(message, type = 'info') {
            try {
                const toastEl = document.getElementById('notification');
                if (toastEl && typeof bootstrap !== 'undefined') {
                    const toast = new bootstrap.Toast(toastEl);
                    const toastBody = toastEl.querySelector('.toast-body');
                    if (toastBody) {
                        toastBody.textContent = message;
                        
                        // تغيير اللون حسب النوع
                        toastEl.classList.remove('bg-primary', 'bg-success', 'bg-danger', 'bg-warning');
                        
                        if (type === 'success') {
                            toastEl.classList.add('bg-success');
                        } else if (type === 'error') {
                            toastEl.classList.add('bg-danger');
                        } else if (type === 'warning') {
                            toastEl.classList.add('bg-warning');
                            toastEl.classList.add('text-dark');
                        } else {
                            toastEl.classList.add('bg-primary');
                        }
                        
                        toast.show();
                        return;
                    }
                }
                
                console.log(`${type}: ${message}`);
                
            } catch (error) {
                console.error('خطأ في عرض الإشعار:', error);
                console.log(`${type}: ${message}`);
            }
        }
    };
    
    // الدوال المساعدة للاستخدام من HTML
    window.copyTaqibToClipboard = function(prayer) {
        const taqibText = document.getElementById(`taqib-text-${prayer}`);
        if (taqibText) {
            const textToCopy = taqibText.innerText;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                TaqibManager.showTaqibNotification('تم نسخ التعقيب إلى الحافظة', 'success');
            }).catch(err => {
                console.error('خطأ في النسخ: ', err);
                TaqibManager.showTaqibNotification('تعذر نسخ التعقيب', 'error');
            });
        }
    };
    
    window.shareTaqib = function(prayer) {
        const prayerName = TaqibManager.prayerNames[prayer];
        const shareText = `تعقيب ${prayerName} من تطبيق أوقات الصلاة`;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: `تعقيب ${prayerName}`,
                text: shareText,
                url: shareUrl
            }).then(() => {
                console.log('تمت المشاركة بنجاح');
            }).catch(error => {
                console.error('خطأ في المشاركة:', error);
            });
        } else {
            // بديل للمتصفحات التي لا تدعم Web Share API
            copyTaqibToClipboard(prayer);
            TaqibManager.showTaqibNotification('تم نسخ التعقيب، يمكنك الآن مشاركته', 'success');
        }
    };
    
    window.loadPreviousTaqib = function(currentPrayer) {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const currentIndex = prayers.indexOf(currentPrayer);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : prayers.length - 1;
        TaqibManager.loadTaqibForPrayer(prayers[previousIndex]);
    };
    
    window.loadNextTaqib = function(currentPrayer) {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const currentIndex = prayers.indexOf(currentPrayer);
        const nextIndex = currentIndex < prayers.length - 1 ? currentIndex + 1 : 0;
        TaqibManager.loadTaqibForPrayer(prayers[nextIndex]);
    };
    
    window.printCurrentTaqib = function(prayer) {
        const prayerName = TaqibManager.prayerNames[prayer];
        const taqibText = document.getElementById(`taqib-text-${prayer}`);
        
        if (taqibText) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>${prayerName} - تعقيب الصلاة</title>
                    <style>
                        body { 
                            font-family: 'Traditional Arabic', 'Arial', sans-serif; 
                            padding: 30px; 
                            line-height: 2;
                            font-size: 16pt;
                        }
                        h1 { 
                            color: #198754; 
                            text-align: center; 
                            border-bottom: 2px solid #198754;
                            padding-bottom: 10px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            color: #666;
                        }
                        .content {
                            text-align: justify;
                            margin-top: 20px;
                        }
                        @media print {
                            body { font-size: 14pt; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${prayerName}</h1>
                    <div class="header">
                        <p>تعقيب الصلاة من كتاب مصباح المتهجد</p>
                        <p>طباعة بتاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                    <hr>
                    <div class="content">
                        ${taqibText.innerHTML}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    // تهيئة عند تحميل DOM
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            TaqibManager.init();
            
            // جعل الكائن متاحاً عالمياً
            window.TaqibManager = TaqibManager;
            
            console.log('✅ تعقيبات الصلاة جاهزة للاستخدام');
        }, 1000);
    });

})();
