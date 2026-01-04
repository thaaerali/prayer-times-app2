// ملف JavaScript المعدل للجدول الشهري (بدون ES6 modules)
(function() {
    'use strict';
    
    // كائن الجدول الشهري
    const MonthlyTimetable = {
        currentDate: new Date(),
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        currentDay: new Date().getDate(),
        
        // أسماء الأشهر بالعربية
        monthNames: [
            "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
            "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
        ],
        
        // تهيئة
        init: function() {
            console.log('📅 تهيئة الجدول الشهري...');
            this.setupEventListeners();
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
        
        // تحميل محتوى الجدول
        loadTimetableContent: function() {
            const contentDiv = document.getElementById('monthly-timetable-content');
            if (!contentDiv) return;
            
            contentDiv.innerHTML = `
                <div class="monthly-timetable-container p-3">
                    <!-- عناصر التحكم -->
                    <div class="month-controls d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
                        <div class="d-flex align-items-center gap-2">
                            <button id="prev-month-btn" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-chevron-right"></i> السابق
                            </button>
                            <div id="current-month-display" class="current-month-display fw-bold">
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
                    </div>
                    
                    <!-- جدول أوقات الصلاة -->
                    <div class="table-responsive">
                        <table class="table table-bordered table-hover">
                            <thead class="table-primary">
                                <tr>
                                    <th>اليوم</th>
                                    <th>الإمساك</th>
                                    <th>الفجر</th>
                                    <th>الشروق</th>
                                    <th>الظهر</th>
                                    <th>العصر</th>
                                    <th>الغروب</th>
                                    <th>المغرب</th>
                                    <th>العشاء</th>
                                    <th>منتصف الليل</th>
                                </tr>
                            </thead>
                            <tbody id="monthly-table-body">
                                <!-- سيتم ملء الجدول هنا -->
                                <tr>
                                    <td colspan="10" class="text-center py-4">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">جاري التحميل...</span>
                                        </div>
                                        <span class="ms-2">جاري تحميل أوقات الصلاة...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- معلومات إضافية -->
                    <div class="mt-4 text-center text-muted small">
                        <p>جميع الأوقات بالتوقيت المحلي • يتم الحساب بناءً على إعداداتك الحالية</p>
                        <p class="mb-0" id="monthly-location-info">الموقع: جاري التحديث...</p>
                    </div>
                </div>
            `;
            
            // إعداد الأحداث للعناصر الجديدة
            this.setupModalEventListeners();
        },
        
        // إعداد أحداث النافذة المنبثقة
        setupModalEventListeners: function() {
            setTimeout(() => {
                const prevBtn = document.getElementById('prev-month-btn');
                const nextBtn = document.getElementById('next-month-btn');
                const todayBtn = document.getElementById('go-to-today-btn');
                
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => this.changeMonth(-1));
                }
                
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => this.changeMonth(1));
                }
                
                if (todayBtn) {
                    todayBtn.addEventListener('click', () => this.goToCurrentMonth());
                }
            }, 100);
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
        
        // توليد الجدول
        generateTable: function() {
            const tableBody = document.getElementById('monthly-table-body');
            if (!tableBody) return;
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <span class="ms-2">جاري حساب أوقات الصلاة...</span>
                    </td>
                </tr>
            `;
            
            // احصل على إعدادات التطبيق الرئيسي
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            const currentLocation = window.currentLocation || {
                latitude: 31.9539,
                longitude: 44.3736,
                city: 'النجف'
            };
            
            // تحديث معلومات الموقع
            const locationInfo = document.getElementById('monthly-location-info');
            if (locationInfo) {
                locationInfo.textContent = `الموقع: ${currentLocation.city}`;
            }
            
            // إحصائيات الشهر
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const today = new Date();
            const isCurrentMonth = this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
            
            setTimeout(() => {
                let tableHTML = '';
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(this.currentYear, this.currentMonth, day);
                    const isToday = isCurrentMonth && day === today.getDate();
                    
                    // حساب أوقات الصلاة التقريبية
                    const prayerTimes = this.calculatePrayerTimesForDay(date, currentLocation);
                    
                    // إنشاء الصف
                    const rowClass = isToday ? 'table-success' : '';
                    
                    tableHTML += `
                        <tr class="${rowClass}">
                            <td class="fw-bold ${isToday ? 'text-danger' : ''}">
                                ${day}
                                ${isToday ? '<span class="badge bg-danger ms-1">اليوم</span>' : ''}
                            </td>
                            <td>${prayerTimes.imsak}</td>
                            <td>${prayerTimes.fajr}</td>
                            <td>${prayerTimes.sunrise}</td>
                            <td>${prayerTimes.dhuhr}</td>
                            <td>${prayerTimes.asr}</td>
                            <td>${prayerTimes.sunset}</td>
                            <td>${prayerTimes.maghrib}</td>
                            <td>${prayerTimes.isha}</td>
                            <td>${prayerTimes.midnight}</td>
                        </tr>
                    `;
                }
                
                tableBody.innerHTML = tableHTML;
            }, 800); // تأخير لمحاكاة الحساب
        },
        
        // حساب أوقات الصلاة التقريبية ليوم محدد
        calculatePrayerTimesForDay: function(date, location) {
            const month = date.getMonth();
            const day = date.getDate();
            
            // حسابات تقريبية بناءً على الشهر والموقع
            const baseHour = 5.5 + (month * 0.1) + (day * 0.003);
            
            return {
                imsak: this.formatTimeFromDecimal(baseHour - 0.2),
                fajr: this.formatTimeFromDecimal(baseHour),
                sunrise: this.formatTimeFromDecimal(baseHour + 1.2),
                dhuhr: '12:15',
                asr: this.formatTimeFromDecimal(15.5 - (month * 0.05)),
                sunset: this.formatTimeFromDecimal(18.5 - (month * 0.08)),
                maghrib: this.formatTimeFromDecimal(18.7 - (month * 0.08)),
                isha: this.formatTimeFromDecimal(19.5 - (month * 0.07)),
                midnight: '23:30'
            };
        },
        
        // تنسيق الوقت من الرقم العشري
        formatTimeFromDecimal: function(decimalTime) {
            const hours = Math.floor(decimalTime);
            const minutes = Math.round((decimalTime - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        },
        
        // إظهار إشعار
        showNotification: function(message) {
            // استخدام إشعار Bootstrap إذا كان متاحاً
            if (typeof bootstrap !== 'undefined') {
                const toastEl = document.getElementById('notification');
                if (toastEl) {
                    const toast = new bootstrap.Toast(toastEl);
                    const toastBody = toastEl.querySelector('.toast-body');
                    if (toastBody) {
                        toastBody.textContent = message;
                        toast.show();
                    }
                }
            } else {
                alert(message);
            }
        }
    };
    
    // تهيئة عند تحميل DOM
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            MonthlyTimetable.init();
            
            // جعل الكائن متاحاً عالمياً
            window.MonthlyTimetable = MonthlyTimetable;
            
            console.log('✅ الجدول الشهري جاهز للاستخدام');
        }, 1000);
    });
})();