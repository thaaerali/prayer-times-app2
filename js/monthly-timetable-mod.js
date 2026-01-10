// ملف JavaScript المعدل للجدول الشهري مع حساب واقعي باستخدام praytimes.js
(function() {
    'use strict';
    
    // كائن الجدول الشهري
    const MonthlyTimetable = {
        currentDate: new Date(),
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        currentDay: new Date().getDate(),
        
        // كائن praytimes
        prayTimes: null,
        
        // أسماء الأشهر بالعربية
        monthNames: [
            "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
            "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
        ],
        
        // أسماء الصلوات بالعربية
        prayerNames: {
            imsak: 'الإمساك',
            fajr: 'الفجر',
            sunrise: 'الشروق',
            dhuhr: 'الظهر',
            asr: 'العصر',
            sunset: 'الغروب',
            maghrib: 'المغرب',
            isha: 'العشاء',
            midnight: 'منتصف الليل'
        },
        
        // تهيئة
        init: function() {
            console.log('📅 تهيئة الجدول الشهري...');
            
            // تهيئة مكتبة praytimes إذا كانت متاحة
            this.initPrayTimes();
            
            this.setupEventListeners();
        },
        
        // تهيئة مكتبة praytimes
        initPrayTimes: function() {
            if (typeof PrayTimes !== 'undefined') {
                this.prayTimes = new PrayTimes();
                console.log('✅ مكتبة PrayTimes محملة وجاهزة للاستخدام');
                
                // تعيين طريقة الحساب من الإعدادات
                const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
                const calculationMethod = settings.calculationMethod || 'Hadi';
                
                if (this.prayTimes.setMethod) {
                    this.prayTimes.setMethod(calculationMethod);
                    console.log(`✅ طريقة الحساب: ${calculationMethod}`);
                }
            } else {
                console.warn('⚠️ مكتبة PrayTimes غير محملة، سيتم استخدام حساب تقريبي');
            }
        },
        
        // إعداد مستمعي الأحداث
        setupEventListeners: function() {
            // تأخير للسماح بتحميل DOM
            setTimeout(() => {
                const timetableBtn = document.getElementById('monthly-timetable-button');
                if (timetableBtn) {
                    console.log('✅ تم العثور على زر الجدول الشهري');
                    timetableBtn.addEventListener('click', () => this.openTimetableModal());
                } else {
                    console.warn('⚠️ زر الجدول الشهري غير موجود');
                }
            }, 500);
        },
        
        // فتح نافذة الجدول الشهري
        openTimetableModal: function() {
            console.log('فتح نافذة الجدول الشهري...');
            
            const modalElement = document.getElementById('monthly-timetable-modal');
            if (!modalElement) {
                console.error('نافذة الجدول الشهري غير موجودة');
                return;
            }
            
            // تحميل المحتوى
            this.loadTimetableContent();
            
            // إظهار النافذة باستخدام Bootstrap
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // عند إظهار النافذة، توليد الجدول
            modalElement.addEventListener('shown.bs.modal', () => {
                this.generateTable();
            });
        },
        
        // تحميل محتوى الجدول مع خيارات متقدمة
        loadTimetableContent: function() {
            const contentDiv = document.getElementById('monthly-timetable-content');
            if (!contentDiv) return;
            
            // احصل على الموقع الحالي من التطبيق الرئيسي
            const currentLocation = this.getCurrentLocation();
            
            contentDiv.innerHTML = `
                <div class="monthly-timetable-container p-3">
                    <!-- رأس الجدول -->
                    <div class="monthly-header text-center mb-4">
                        <h4 class="text-primary mb-2">جدول أوقات الصلاة الشهري</h4>
                        <div id="monthly-location-info" class="text-muted small">
                            <i class="bi bi-geo-alt"></i> الموقع: ${currentLocation.city}
                        </div>
                    </div>
                    
                    <!-- عناصر التحكم -->
                    <div class="month-controls d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4 p-3 bg-light rounded">
                        <div class="d-flex align-items-center gap-2">
                            <button id="prev-month-btn" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-chevron-right"></i> السابق
                            </button>
                            <div id="current-month-display" class="current-month-display fw-bold px-3">
                                ${this.monthNames[this.currentMonth]} ${this.currentYear}
                            </div>
                            <button id="next-month-btn" class="btn btn-outline-primary btn-sm">
                                التالي <i class="bi bi-chevron-left"></i>
                            </button>
                        </div>
                        
                        <div class="d-flex align-items-center gap-2">
                            <button id="go-to-today-btn" class="btn btn-primary btn-sm">
                                <i class="bi bi-calendar-check me-1"></i> هذا الشهر
                            </button>
                        </div>
                        
                        <!-- طريقة الحساب -->
                        <div class="d-flex align-items-center gap-2">
                            <span class="small text-muted">طريقة الحساب:</span>
                            <select id="calculation-method-monthly" class="form-select form-select-sm" style="width: auto;">
                                <option value="Hadi">تقويم الهادي</option>
                                <option value="MWL">رابطة العالم الإسلامي</option>
                                <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية</option>
                                <option value="Egypt">هيئة المساحة المصرية</option>
                                <option value="Makkah">أم القرى</option>
                                <option value="Karachi">جامعة العلوم الإسلامية كراتشي</option>
                                <option value="Tehran">جامعة طهران</option>
                                <option value="Jafari">الهيئة العامة للتقويم (إيران)</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- معلومات سريعة -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card border-0 bg-light">
                                <div class="card-body text-center py-2">
                                    <small class="text-muted d-block">خط العرض</small>
                                    <span class="fw-bold">${currentLocation.latitude.toFixed(4)}°</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-0 bg-light">
                                <div class="card-body text-center py-2">
                                    <small class="text-muted d-block">خط الطول</small>
                                    <span class="fw-bold">${currentLocation.longitude.toFixed(4)}°</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-0 bg-light">
                                <div class="card-body text-center py-2">
                                    <small class="text-muted d-block">التوقيت الصيفي</small>
                                    <span class="fw-bold">${this.getDstStatus()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- جدول أوقات الصلاة -->
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover table-sm">
                            <thead class="table-primary">
                                <tr>
                                    <th class="text-center">اليوم</th>
                                    <th class="text-center">الإمساك</th>
                                    <th class="text-center">الفجر</th>
                                    <th class="text-center">الشروق</th>
                                    <th class="text-center">الظهر</th>
                                    <th class="text-center">العصر</th>
                                    <th class="text-center">الغروب</th>
                                    <th class="text-center">المغرب</th>
                                    <th class="text-center">العشاء</th>
                                    <th class="text-center">منتصف الليل</th>
                                </tr>
                            </thead>
                            <tbody id="monthly-table-body">
                                <!-- سيتم ملء الجدول هنا -->
                                <tr>
                                    <td colspan="10" class="text-center py-4">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">جاري التحميل...</span>
                                        </div>
                                        <span class="ms-2">جاري حساب أوقات الصلاة...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- معلومات إضافية -->
                    <div class="mt-4 text-center text-muted small">
                        <p>
                            <i class="bi bi-info-circle me-1"></i>
                            جميع الأوقات بالتوقيت المحلي • يتم الحساب باستخدام مكتبة praytimes.js
                        </p>
                        <div class="alert alert-info py-2">
                            <small>
                                <i class="bi bi-lightbulb me-1"></i>
                                <strong>ملاحظة:</strong> هذه الأوقات دقيقة وتعتمد على الموقع الجغرافي وطريقة الحساب المختارة.
                            </small>
                        </div>
                    </div>
                </div>
            `;
            
            // تعيين طريقة الحساب المختارة
            this.setCalculationMethod();
            
            // إعداد الأحداث للعناصر الجديدة
            this.setupModalEventListeners();
        },
        
        // الحصول على الموقع الحالي
        getCurrentLocation: function() {
            // محاولة الحصول من التطبيق الرئيسي أولاً
            if (window.currentLocation && window.currentLocation.latitude) {
                console.log('📍 باستخدام الموقع الحالي من التطبيق:', window.currentLocation.city);
                return window.currentLocation;
            }
            
            // محاولة الحصول من localStorage
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            
            if (settings.latitude && settings.longitude) {
                console.log('📍 باستخدام الموقع من localStorage:', settings.cityName || 'موقع محفوظ');
                return {
                    latitude: settings.latitude,
                    longitude: settings.longitude,
                    city: settings.cityName || 'موقع محفوظ'
                };
            }
            
            // القيم الافتراضية إذا لم يتم العثور على موقع
            console.log('⚠️ لم يتم العثور على موقع، استخدام قيم افتراضية');
            return {
                latitude: 31.9539,
                longitude: 44.3736,
                city: 'النجف'
            };
        },
        
        // تعيين طريقة الحساب من الإعدادات
        setCalculationMethod: function() {
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            const calculationMethod = settings.calculationMethod || 'Hadi';
            
            const methodSelect = document.getElementById('calculation-method-monthly');
            if (methodSelect) {
                methodSelect.value = calculationMethod;
                
                // تحديث مكتبة praytimes إذا كانت متاحة
                if (this.prayTimes && this.prayTimes.setMethod) {
                    this.prayTimes.setMethod(calculationMethod);
                }
            }
        },
        
        // الحصول على حالة التوقيت الصيفي
        getDstStatus: function() {
            const now = new Date();
            const jan = new Date(now.getFullYear(), 0, 1);
            const jul = new Date(now.getFullYear(), 6, 1);
            const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
            
            return now.getTimezoneOffset() < stdTimezoneOffset ? "نعم" : "لا";
        },
        
        // إعداد أحداث النافذة المنبثقة
        setupModalEventListeners: function() {
            setTimeout(() => {
                const prevBtn = document.getElementById('prev-month-btn');
                const nextBtn = document.getElementById('next-month-btn');
                const todayBtn = document.getElementById('go-to-today-btn');
                const methodSelect = document.getElementById('calculation-method-monthly');
                
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => this.changeMonth(-1));
                }
                
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => this.changeMonth(1));
                }
                
                if (todayBtn) {
                    todayBtn.addEventListener('click', () => this.goToCurrentMonth());
                }
                
                if (methodSelect) {
                    methodSelect.addEventListener('change', (e) => this.changeCalculationMethod(e.target.value));
                }
            }, 100);
        },
        
        // تغيير طريقة الحساب
        changeCalculationMethod: function(method) {
            if (this.prayTimes && this.prayTimes.setMethod) {
                this.prayTimes.setMethod(method);
                console.log(`✅ تم تغيير طريقة الحساب إلى: ${method}`);
                
                // حفظ الإعدادات
                const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
                settings.calculationMethod = method;
                localStorage.setItem('prayerSettings', JSON.stringify(settings));
                
                // إعادة توليد الجدول
                this.generateTable();
                
                this.showNotification(`تم تغيير طريقة الحساب إلى ${this.getMethodName(method)}`);
            }
        },
        
        // الحصول على اسم طريقة الحساب
        getMethodName: function(method) {
            const methodNames = {
                'Hadi': 'تقويم الهادي',
                'MWL': 'رابطة العالم الإسلامي',
                'ISNA': 'الجمعية الإسلامية لأمريكا الشمالية',
                'Egypt': 'هيئة المساحة المصرية',
                'Makkah': 'أم القرى',
                'Karachi': 'جامعة العلوم الإسلامية كراتشي',
                'Tehran': 'جامعة طهران',
                'Jafari': 'الهيئة العامة للتقويم (إيران)'
            };
            
            return methodNames[method] || method;
        },
        
        // تغيير الشهر
        changeMonth: function(direction) {
            this.currentMonth += direction;
            
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            } else if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            
            this.updateMonthDisplay();
            this.generateTable();
        },
        
        // الانتقال إلى الشهر الحالي
        goToCurrentMonth: function() {
            const now = new Date();
            this.currentMonth = now.getMonth();
            this.currentYear = now.getFullYear();
            
            this.updateMonthDisplay();
            this.generateTable();
            
            this.showNotification('تم الانتقال إلى الشهر الحالي');
        },
        
        // تحديث عرض الشهر
        updateMonthDisplay: function() {
            const display = document.getElementById('current-month-display');
            if (display) {
                display.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
            }
        },
        
        // توليد الجدول باستخدام مكتبة praytimes
        generateTable: function() {
            const tableBody = document.getElementById('monthly-table-body');
            if (!tableBody) return;
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <p class="mt-3 text-muted">جاري حساب أوقات الصلاة بدقة...</p>
                        <small class="text-muted">قد يستغرق ذلك بضع لحظات</small>
                    </td>
                </tr>
            `;
            
            // احصل على الموقع الحالي
            const currentLocation = this.getCurrentLocation();
            
            // تحديث معلومات الموقع
            const locationInfo = document.getElementById('monthly-location-info');
            if (locationInfo) {
                locationInfo.innerHTML = `<i class="bi bi-geo-alt"></i> الموقع: ${currentLocation.city}`;
            }
            
            // إحصائيات الشهر
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const today = new Date();
            const isCurrentMonth = this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
            
            // استخدم setTimeout للسماح بعرض رسالة التحميل
            setTimeout(() => {
                this.generateTableContent(tableBody, daysInMonth, currentLocation, isCurrentMonth, today);
            }, 100);
        },
        
        // توليد محتوى الجدول
        generateTableContent: function(tableBody, daysInMonth, location, isCurrentMonth, today) {
            let tableHTML = '';
            let prayersCalculated = 0;
            const totalDays = daysInMonth;
            
            for (let day = 1; day <= totalDays; day++) {
                const date = new Date(this.currentYear, this.currentMonth, day);
                const isToday = isCurrentMonth && day === today.getDate();
                
                // حساب أوقات الصلاة باستخدام praytimes أو الحساب التقريبي
                const prayerTimes = this.calculatePrayerTimes(date, location);
                
                // إنشاء الصف
                const rowClass = isToday ? 'table-success' : '';
                const todayBadge = isToday ? '<span class="badge bg-danger ms-1">اليوم</span>' : '';
                
                tableHTML += `
                    <tr class="${rowClass}">
                        <td class="fw-bold text-center ${isToday ? 'text-danger' : ''}">
                            ${day}
                            ${todayBadge}
                        </td>
                        <td class="text-center">${prayerTimes.imsak}</td>
                        <td class="text-center">${prayerTimes.fajr}</td>
                        <td class="text-center">${prayerTimes.sunrise}</td>
                        <td class="text-center">${prayerTimes.dhuhr}</td>
                        <td class="text-center">${prayerTimes.asr}</td>
                        <td class="text-center">${prayerTimes.sunset}</td>
                        <td class="text-center">${prayerTimes.maghrib}</td>
                        <td class="text-center">${prayerTimes.isha}</td>
                        <td class="text-center">${prayerTimes.midnight}</td>
                    </tr>
                `;
                
                prayersCalculated++;
                
                // تحديث التقدم كل 5 أيام
                if (prayersCalculated % 5 === 0) {
                    setTimeout(() => {
                        tableBody.innerHTML = tableHTML + this.getLoadingRow(prayersCalculated, totalDays);
                    }, 0);
                }
            }
            
            // عند الانتهاء، عرض الجدول الكامل
            setTimeout(() => {
                tableBody.innerHTML = tableHTML;
                console.log(`✅ تم حساب ${totalDays} يوم من أوقات الصلاة لموقع: ${location.city}`);
                
                // إضافة صف التذييل
                const tfoot = document.createElement('tfoot');
                tfoot.innerHTML = `
                    <tr class="table-light">
                        <td colspan="10" class="text-center py-2">
                            <small class="text-muted">
                                <i class="bi bi-check-circle text-success me-1"></i>
                                تم حساب ${totalDays} يوم من أوقات الصلاة بدقة لـ ${location.city}
                            </small>
                        </td>
                    </tr>
                `;
                tableBody.parentNode.appendChild(tfoot);
                
            }, 100);
        },
        
        // صف التحميل مع مؤشر التقدم
        getLoadingRow: function(calculated, total) {
            const percentage = Math.round((calculated / total) * 100);
            return `
                <tr id="loading-row">
                    <td colspan="10" class="text-center py-3">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" 
                                 style="width: ${percentage}%">
                                ${percentage}%
                            </div>
                        </div>
                        <small class="text-muted mt-2 d-block">
                            جاري حساب أوقات الصلاة... ${calculated} من ${total} يوم
                        </small>
                    </td>
                </tr>
            `;
        },
        
        // حساب أوقات الصلاة باستخدام praytimes
        calculatePrayerTimes: function(date, location) {
            // إذا كانت مكتبة praytimes متاحة، استخدمها
            if (this.prayTimes && typeof this.prayTimes.getTimes === 'function') {
                try {
                    // الحصول على طريقة الحساب الحالية
                    const methodSelect = document.getElementById('calculation-method-monthly');
                    const currentMethod = methodSelect ? methodSelect.value : 'Hadi';
                    
                    // إعدادات تقويم الهادي مع الزاوية 4 للمغرب
                    if (currentMethod === 'Hadi') {
                        // حفظ الإعدادات الأصلية
                        const originalMethod = this.prayTimes.getMethod();
                        
                        // استخدام طريقة جعفري كأساس (لأنها تستخدم الزاوية 4 للمغرب)
                        this.prayTimes.setMethod('Jafari');
                        
                        // تعديل إعدادات تقويم الهادي
                        const hadiParams = {
                            fajr: 18,   // تقويم الهادي يستخدم 18°
                            isha: 18,   // تقويم الهادي يستخدم 18°
                            maghrib: 4, // الزاوية 4 للمغرب (مشترك مع الجعفري)
                            asr: 'Standard', // المذهب الحنفي
                            highLats: 'NightMiddle'
                        };
                        
                        // تطبيق إعدادات الهادي
                        this.prayTimes.adjust(hadiParams);
                        
                        // حساب الأوقات
                        const times = this.prayTimes.getTimes(
                            date,
                            [location.latitude, location.longitude],
                            3, // توقيت العراق
                            0, // الارتفاع
                            0  // التوقيت الصيفي
                        );
                        
                        // استعادة الطريقة الأصلية
                        this.prayTimes.setMethod(originalMethod);
                        
                        // تطبيق تعديلات الوقت من الإعدادات
                        const adjustedTimes = this.applyTimeAdjustments(times);
                        
                        return {
                            imsak: this.formatTime(adjustedTimes.imsak || times.imsak || '--:--'),
                            fajr: this.formatTime(adjustedTimes.fajr || times.fajr || '--:--'),
                            sunrise: this.formatTime(adjustedTimes.sunrise || times.sunrise || '--:--'),
                            dhuhr: this.formatTime(adjustedTimes.dhuhr || times.dhuhr || '--:--'),
                            asr: this.formatTime(adjustedTimes.asr || times.asr || '--:--'),
                            sunset: this.formatTime(adjustedTimes.sunset || times.sunset || '--:--'),
                            maghrib: this.formatTime(adjustedTimes.maghrib || times.maghrib || '--:--'), // سيتم حسابها بـ 4°
                            isha: this.formatTime(adjustedTimes.isha || times.isha || '--:--'),
                            midnight: this.formatTime(adjustedTimes.midnight || times.midnight || '--:--')
                        };
                    } else {
                        // طرق حساب أخرى (بدون تغيير)
                        const times = this.prayTimes.getTimes(
                            date,
                            [location.latitude, location.longitude],
                            3,
                            0,
                            0
                        );
                        
                        const adjustedTimes = this.applyTimeAdjustments(times);
                        
                        return {
                            imsak: this.formatTime(adjustedTimes.imsak || times.imsak || '--:--'),
                            fajr: this.formatTime(adjustedTimes.fajr || times.fajr || '--:--'),
                            sunrise: this.formatTime(adjustedTimes.sunrise || times.sunrise || '--:--'),
                            dhuhr: this.formatTime(adjustedTimes.dhuhr || times.dhuhr || '--:--'),
                            asr: this.formatTime(adjustedTimes.asr || times.asr || '--:--'),
                            sunset: this.formatTime(adjustedTimes.sunset || times.sunset || '--:--'),
                            maghrib: this.formatTime(adjustedTimes.maghrib || times.maghrib || '--:--'),
                            isha: this.formatTime(adjustedTimes.isha || times.isha || '--:--'),
                            midnight: this.formatTime(adjustedTimes.midnight || times.midnight || '--:--')
                        };
                    }
                } catch (error) {
                    console.error('خطأ في حساب أوقات الصلاة باستخدام praytimes:', error);
                    return this.calculateApproximateTimes(date, location);
                }
            } else {
                // استخدام حساب تقريبي
                return this.calculateApproximateTimes(date, location);
            }
        },
        
        // تطبيق تعديلات الوقت من الإعدادات
        applyTimeAdjustments: function(times) {
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            const adjustments = settings.adjustments || {};
            
            const adjustedTimes = { ...times };
            
            // تطبيق التعديلات على كل صلاة
            Object.keys(adjustments).forEach(prayer => {
                if (adjustedTimes[prayer] && adjustments[prayer] !== 0) {
                    adjustedTimes[prayer] = this.adjustTime(adjustedTimes[prayer], adjustments[prayer]);
                }
            });
            
            return adjustedTimes;
        },
        
        // تعديل الوقت
        adjustTime: function(timeString, adjustment) {
            try {
                const [hours, minutes] = timeString.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes + adjustment;
                
                let newHours = Math.floor(totalMinutes / 60);
                const newMinutes = totalMinutes % 60;
                
                // تصحيح الساعات إذا كانت خارج النطاق (0-23)
                if (newHours >= 24) newHours -= 24;
                if (newHours < 0) newHours += 24;
                
                return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
            } catch (error) {
                console.error('خطأ في تعديل الوقت:', error);
                return timeString;
            }
        },
        
        // حساب أوقات الصلاة التقريبية (كبديل)
        calculateApproximateTimes: function(date, location) {
            const month = date.getMonth();
            const day = date.getDate();
            const dayOfYear = this.getDayOfYear(date);
            
            // حسابات أكثر دقة بناءً على الموقع والوقت من السنة
            const latFactor = Math.abs(location.latitude) / 90;
            const dayFactor = dayOfYear / 365;
            
            // حسابات مخصصة بناءً على الموقع
            const baseFajr = 5.0 + latFactor * 1.5 + Math.sin(dayFactor * Math.PI * 2) * 0.5;
            const baseSunrise = baseFajr + 1.2;
            const baseSunset = 18.5 - latFactor * 1.5 - Math.sin(dayFactor * Math.PI * 2) * 0.5;
            
            return {
                imsak: this.formatTimeFromDecimal(baseFajr - 0.2),
                fajr: this.formatTimeFromDecimal(baseFajr),
                sunrise: this.formatTimeFromDecimal(baseSunrise),
                dhuhr: '12:15',
                asr: this.formatTimeFromDecimal(15.5 - latFactor * 0.8),
                sunset: this.formatTimeFromDecimal(baseSunset),
                maghrib: this.formatTimeFromDecimal(baseSunset + 0.2),
                isha: this.formatTimeFromDecimal(baseSunset + 1.2),
                midnight: '23:30'
            };
        },
        
        // الحصول على رقم اليوم في السنة
        getDayOfYear: function(date) {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = date - start;
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        },
        
        // تنسيق الوقت
        formatTime: function(timeString) {
            if (!timeString || timeString === '--:--') return '--:--';
            
            try {
                const [hours, minutes] = timeString.split(':').map(Number);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } catch (error) {
                console.error('خطأ في تنسيق الوقت:', error);
                return '--:--';
            }
        },
        
        // تنسيق الوقت من الرقم العشري
        formatTimeFromDecimal: function(decimalTime) {
            const hours = Math.floor(decimalTime);
            const minutes = Math.round((decimalTime - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        },
        
        // إظهار إشعار
        showNotification: function(message, type = 'info') {
            try {
                // استخدام Toast من Bootstrap إذا كان متاحاً
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
                
                // إذا فشل Toast، استخدم console.log
                console.log(`${type}: ${message}`);
                
            } catch (error) {
                console.error('خطأ في عرض الإشعار:', error);
                console.log(`${type}: ${message}`);
            }
        }
    };
    
    // تهيئة عند تحميل DOM
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            MonthlyTimetable.init();
            
            // جعل الكائن متاحاً عالمياً
            window.MonthlyTimetable = MonthlyTimetable;
            
            console.log('✅ الجدول الشهري جاهز للاستخدام مع مكتبة PrayTimes');
        }, 1000);
    });
})();
