// ملف مدير تعقيبات الصلاة
(function() {
    'use strict';
    
    // كائن تعقيبات الصلاة
    const TaqibManager = {
        // روابط GitHub للملفات
        taqibUrls: {
            fajr: 'https://raw.githubusercontent.com/AzkaMothol/prayer-times/main/taqib/fajr.txt',
            dhuhr: 'https://raw.githubusercontent.com/AzkaMothol/prayer-times/main/taqib/dhuhr.txt',
            asr: 'https://raw.githubusercontent.com/AzkaMothol/prayer-times/main/taqib/asr.txt',
            maghrib: 'https://raw.githubusercontent.com/AzkaMothol/prayer-times/main/taqib/maghrib.txt',
            isha: 'https://raw.githubusercontent.com/AzkaMothol/prayer-times/main/taqib/isha.txt'
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
        
        // فتح نافذة تعقيب الصلاة
        openTaqibModal: function() {
            console.log('فتح نافذة تعقيب الصلاة...');
            
            const modalElement = document.getElementById('taqib-modal');
            if (!modalElement) {
                console.error('نافذة تعقيب الصلاة غير موجودة');
                return;
            }
            
            // تحميل المحتوى
            this.loadTaqibContent();
            
            // إظهار النافذة باستخدام Bootstrap
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        },
        
        // تحميل محتوى تعقيب الصلاة
        loadTaqibContent: function() {
            const contentDiv = document.getElementById('taqib-content');
            if (!contentDiv) return;
            
            contentDiv.innerHTML = `
                <div class="taqib-container">
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
                        <div class="col-6 col-md-4">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100" data-prayer="fajr">
                                <i class="bi bi-sunrise me-2"></i>
                                الفجر
                            </button>
                        </div>
                        <div class="col-6 col-md-4">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100" data-prayer="dhuhr">
                                <i class="bi bi-sun me-2"></i>
                                الظهر
                            </button>
                        </div>
                        <div class="col-6 col-md-4">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100" data-prayer="asr">
                                <i class="bi bi-cloud-sun me-2"></i>
                                العصر
                            </button>
                        </div>
                        <div class="col-6 col-md-4">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100" data-prayer="maghrib">
                                <i class="bi bi-sunset me-2"></i>
                                المغرب
                            </button>
                        </div>
                        <div class="col-6 col-md-4">
                            <button class="taqib-prayer-btn btn btn-outline-success w-100" data-prayer="isha">
                                <i class="bi bi-moon-stars me-2"></i>
                                العشاء
                            </button>
                        </div>
                    </div>
                    
                    <!-- معلومات -->
                    <div class="alert alert-info">
                        <div class="d-flex">
                            <div class="me-3">
                                <i class="bi bi-lightbulb fs-4"></i>
                            </div>
                            <div>
                                <small>
                                    <strong>معلومة:</strong> التعقيبات من كتاب "مصباح المتهجد" للشيخ الطوسي.
                                    يمكنك حفظ التعقيب أو مشاركته مع الآخرين.
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- منطقة عرض التعقيب -->
                    <div id="taqib-display-area" class="taqib-display-area mt-4 p-3 bg-light rounded d-none">
                        <div class="text-center">
                            <i class="bi bi-book fs-1 text-muted mb-3"></i>
                            <p class="text-muted">اختر صلاة لعرض تعقيبها</p>
                        </div>
                    </div>
                </div>
            `;
            
            // إعداد أحداث الأزرار
            this.setupTaqibButtons();
        },
        
        // إعداد أحداث أزرار الصلوات
        setupTaqibButtons: function() {
            setTimeout(() => {
                const prayerButtons = document.querySelectorAll('.taqib-prayer-btn');
                prayerButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const prayer = e.target.getAttribute('data-prayer');
                        this.loadTaqibForPrayer(prayer);
                    });
                });
            }, 100);
        },
        
        // تحميل تعقيب لصلاة محددة
        async loadTaqibForPrayer(prayer) {
            const displayArea = document.getElementById('taqib-display-area');
            if (!displayArea) return;
            
            // عرض مؤشر التحميل
            displayArea.classList.remove('d-none');
            displayArea.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-success" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p class="mt-2 text-muted">جاري تحميل تعقيب ${this.prayerNames[prayer]}...</p>
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
        
        // عرض التعقيب
        displayTaqib(prayer, content) {
            const displayArea = document.getElementById('taqib-display-area');
            if (!displayArea) return;
            
            // معالجة النص لتنسيق أفضل
            const formattedContent = this.formatTaqibContent(content);
            
            displayArea.innerHTML = `
                <!-- رأس التعقيب -->
                <div class="taqib-header mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="text-success mb-0">
                            <i class="bi bi-bookmark-heart me-2"></i>
                            ${this.prayerNames[prayer]}
                        </h5>
                        <div>
                            <button class="btn btn-sm btn-outline-success" onclick="copyTaqibToClipboard('${prayer}')">
                                <i class="bi bi-clipboard me-1"></i> نسخ
                            </button>
                            <button class="btn btn-sm btn-outline-primary ms-2" onclick="shareTaqib('${prayer}')">
                                <i class="bi bi-share me-1"></i> مشاركة
                            </button>
                        </div>
                    </div>
                    
                    <div class="alert alert-success py-2">
                        <small>
                            <i class="bi bi-info-circle me-1"></i>
                            تعقيب ${this.prayerNames[prayer]} عن مصباح المتهجد
                        </small>
                    </div>
                </div>
                
                <!-- محتوى التعقيب -->
                <div class="taqib-content">
                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body">
                            <div class="taqib-text" id="taqib-text-${prayer}">
                                ${formattedContent}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- معلومات إضافية -->
                <div class="taqib-footer mt-4">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card border-0 bg-light">
                                <div class="card-body py-2">
                                    <small class="text-muted d-flex align-items-center">
                                        <i class="bi bi-clock-history me-2"></i>
                                        <span>وقت القراءة: ${this.calculateReadingTime(content)} دقيقة</span>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card border-0 bg-light">
                                <div class="card-body py-2">
                                    <small class="text-muted d-flex align-items-center">
                                        <i class="bi bi-card-text me-2"></i>
                                        <span>عدد الكلمات: ${this.countWords(content)} كلمة</span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- أزرار التنقل -->
                    <div class="d-flex justify-content-between mt-3">
                        <button class="btn btn-sm btn-outline-secondary" onclick="loadPreviousTaqib('${prayer}')">
                            <i class="bi bi-arrow-right me-1"></i> التعقيب السابق
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="loadNextTaqib('${prayer}')">
                            التعقيب التالي <i class="bi bi-arrow-left ms-1"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // حفظ التعقيب في localStorage للاستخدام بدون اتصال
            this.saveTaqibToCache(prayer, content);
            
            // تمييز الزر النشط
            this.highlightActiveButton(prayer);
        },
        
        // تنسيق محتوى التعقيب
        formatTaqibContent(content) {
            if (!content) return '<p class="text-muted">لا يوجد تعقيب متاح</p>';
            
            let formatted = content;
            
            // استبدال الأسطر الجديدة بـ <br>
            formatted = formatted.replace(/\n/g, '<br>');
            
            // تنسيق العناوين
            formatted = formatted.replace(/اَللّـهُمَّ/gi, '<strong class="text-success">اَللّـهُمَّ</strong>');
            formatted = formatted.replace(/سُبْحانَ اللهِ/gi, '<strong class="text-primary">سُبْحانَ اللهِ</strong>');
            formatted = formatted.replace(/صَلَّى اللهُ عَلى مُحَمَّد/gi, '<strong class="text-danger">صَلَّى اللهُ عَلى مُحَمَّد</strong>');
            
            // إضافة فواصل بين المقاطع
            formatted = formatted.replace(/(وقل أيضاً:|وتقول عشر مرّات:|ثمّ قل:)/g, '<hr class="my-3"><strong>$1</strong><br>');
            
            // إضافة أرقام للجمل المكررة
            const countRegex = /(\d+) مرّات?:/g;
            formatted = formatted.replace(countRegex, '<span class="badge bg-info">$1 مرّة</span><br>');
            
            return formatted;
        },
        
        // حساب وقت القراءة
        calculateReadingTime(text) {
            const words = text.split(/\s+/).length;
            const readingTime = Math.ceil(words / 200); // 200 كلمة في الدقيقة
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
                button.classList.remove('active', 'btn-success');
                button.classList.add('btn-outline-success');
                
                if (button.getAttribute('data-prayer') === prayer) {
                    button.classList.remove('btn-outline-success');
                    button.classList.add('btn-success', 'active');
                }
            });
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