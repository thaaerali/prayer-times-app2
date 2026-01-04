// ملف JavaScript للجدول الشهري لأوقات الصلاة

class MonthlyTimetable {
    constructor() {
        // المتغيرات العامة
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.currentDay = this.currentDate.getDate();
        
        // بيانات الإعدادات (سيتم تحميلها من localStorage)
        this.settings = {
            city: 'auto',
            calculationMethod: 'Hadi',
            timeFormat: '24h',
            adjustments: {},
            location: null
        };
        
        // أسماء الأشهر بالعربية
        this.monthNames = [
            "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
            "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
        ];
        
        // أسماء الصلوات بالعربية
        this.prayerNames = {
            imsak: 'الإمساك',
            fajr: 'الفجر',
            sunrise: 'الشروق',
            dhuhr: 'الظهر',
            asr: 'العصر',
            sunset: 'الغروب',
            maghrib: 'المغرب',
            isha: 'العشاء',
            midnight: 'منتصف الليل'
        };
        
        // تهيئة كائن الصلاة
        this.prayTimes = new PrayTimes();
        
        this.init();
    }
    
    // تهيئة التطبيق
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.generateTable();
        this.updateUI();
        
        // إخفاء زر العودة للأعلى في البداية
        document.getElementById('back-to-top').style.display = 'none';
        
        // إضافة مستمع لحدث التمرير
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    // تحميل الإعدادات من localStorage
    loadSettings() {
        try {
            // محاولة تحميل الإعدادات من المشروع الرئيسي
            const savedSettings = localStorage.getItem('prayerSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                
                // دمج الإعدادات
                this.settings = {
                    ...this.settings,
                    ...parsed,
                    city: parsed.city || 'auto',
                    calculationMethod: parsed.calculationMethod || 'Hadi',
                    timeFormat: parsed.timeFormat || '24h'
                };
                
                // تحديث القائمة المنسدلة للمدينة
                const citySelect = document.getElementById('city-select');
                if (citySelect && this.settings.city) {
                    citySelect.value = this.settings.city;
                }
                
                // تطبيق طريقة الحساب
                if (this.prayTimes && this.settings.calculationMethod) {
                    this.prayTimes.setMethod(this.settings.calculationMethod);
                }
            }
            
            // تحميل الموقع المحفوظ
            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                this.settings.location = JSON.parse(savedLocation);
            }
        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
        }
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // أزرار التنقل بين الأشهر
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
        document.getElementById('go-to-today').addEventListener('click', () => this.goToCurrentMonth());
        
        // تغيير المدينة
        document.getElementById('city-select').addEventListener('change', (e) => this.changeCity(e.target.value));
        
        // زر العودة للأعلى
        document.getElementById('back-to-top').addEventListener('click', () => this.scrollToTop());
    }
    
    // تغيير الشهر
    changeMonth(direction) {
        this.currentMonth += direction;
        
        // تصحيح الشهر والسنة
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        // إعادة توليد الجدول
        this.generateTable();
        this.updateUI();
        
        // إظهار إشعار
        this.showNotification(`تم التحديث إلى ${this.monthNames[this.currentMonth]} ${this.currentYear}`);
    }
    
    // الانتقال إلى الشهر الحالي
    goToCurrentMonth() {
        const now = new Date();
        this.currentMonth = now.getMonth();
        this.currentYear = now.getFullYear();
        
        this.generateTable();
        this.updateUI();
        
        this.showNotification('تم العودة إلى الشهر الحالي');
    }
    
    // تغيير المدينة
    async changeCity(city) {
        this.settings.city = city;
        
        if (city === 'auto') {
            // محاولة الحصول على الموقع الحالي
            await this.getCurrentLocation();
        } else {
            // استخدام المدينة المحددة
            this.settings.location = this.getCityCoordinates(city);
        }
        
        // إعادة توليد الجدول
        this.generateTable();
        this.updateUI();
        
        // حفظ الإعدادات
        this.saveSettings();
        
        this.showNotification(`تم التحديث إلى ${this.getCityName(city)}`);
    }
    
    // الحصول على إحداثيات المدينة
    getCityCoordinates(city) {
        const cities = {
            'Najaf': { lat: 32.0297, lng: 44.3466, name: 'النجف' },
            'Makkah': { lat: 21.4225, lng: 39.8262, name: 'مكة المكرمة' },
            'Madinah': { lat: 24.4672, lng: 39.6111, name: 'المدينة المنورة' },
            'Baghdad': { lat: 33.3152, lng: 44.3661, name: 'بغداد' },
            'Basra': { lat: 30.5081, lng: 47.7804, name: 'البصرة' },
            'Karbala': { lat: 32.6167, lng: 44.0333, name: 'كربلاء' },
            'Cairo': { lat: 30.0444, lng: 31.2357, name: 'القاهرة' }
        };
        
        return cities[city] || { lat: 32.0297, lng: 44.3466, name: 'النجف' };
    }
    
    // الحصول على اسم المدينة
    getCityName(cityCode) {
        const cityNames = {
            'auto': 'الموقع الحالي',
            'Najaf': 'النجف',
            'Makkah': 'مكة المكرمة',
            'Madinah': 'المدينة المنورة',
            'Baghdad': 'بغداد',
            'Basra': 'البصرة',
            'Karbala': 'كربلاء',
            'Cairo': 'القاهرة'
        };
        
        return cityNames[cityCode] || cityCode;
    }
    
    // الحصول على الموقع الحالي
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.showNotification('المتصفح لا يدعم تحديد الموقع');
                this.settings.location = this.getCityCoordinates('Najaf');
                resolve(this.settings.location);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.settings.location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        name: 'موقعك الحالي'
                    };
                    resolve(this.settings.location);
                },
                (error) => {
                    console.error('خطأ في تحديد الموقع:', error);
                    this.showNotification('تعذر تحديد موقعك، تم استخدام النجف كافتراضي');
                    this.settings.location = this.getCityCoordinates('Najaf');
                    resolve(this.settings.location);
                },
                { timeout: 10000 }
            );
        });
    }
    
    // تنسيق الوقت بناءً على الإعدادات
    formatTime(timeString, format = '24h') {
        if (!timeString) return '--:--';
        
        const [hours, minutes] = timeString.split(':').map(Number);
        
        if (format === '12h') {
            const period = hours >= 12 ? 'PM' : 'AM';
            const twelveHour = hours % 12 || 12;
            return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
        } else if (format === '12H') {
            const twelveHour = hours % 12 || 12;
            return `${twelveHour}:${minutes.toString().padStart(2, '0')}`;
        } else {
            // 24 ساعة
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }
    
    // توليد جدول أوقات الصلاة للشهر
    async generateTable() {
        // التأكد من وجود بيانات الموقع
        if (!this.settings.location && this.settings.city === 'auto') {
            await this.getCurrentLocation();
        } else if (!this.settings.location) {
            this.settings.location = this.getCityCoordinates(this.settings.city);
        }
        
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
        
        // تحديث عنوان الشهر
        document.getElementById('month-year-title').textContent = 
            `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // إنشاء صفوف الجدول
        let tableHTML = '';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = isCurrentMonth && day === today.getDate();
            
            // حساب أوقات الصلاة لهذا اليوم
            const prayerTimes = this.calculatePrayerTimes(date);
            
            // إنشاء الصف
            const rowClass = isToday ? 'today-row' : '';
            
            tableHTML += `
                <tr class="${rowClass}">
                    <td class="day-cell fw-bold">${day}</td>
                    <td class="imsak-time">${this.formatTime(prayerTimes.imsak, this.settings.timeFormat)}</td>
                    <td class="fajr-time">${this.formatTime(prayerTimes.fajr, this.settings.timeFormat)}</td>
                    <td class="sunrise-time">${this.formatTime(prayerTimes.sunrise, this.settings.timeFormat)}</td>
                    <td class="dhuhr-time">${this.formatTime(prayerTimes.dhuhr, this.settings.timeFormat)}</td>
                    <td class="asr-time">${this.formatTime(prayerTimes.asr, this.settings.timeFormat)}</td>
                    <td class="sunset-time">${this.formatTime(prayerTimes.sunset, this.settings.timeFormat)}</td>
                    <td class="maghrib-time">${this.formatTime(prayerTimes.maghrib, this.settings.timeFormat)}</td>
                    <td class="isha-time">${this.formatTime(prayerTimes.isha, this.settings.timeFormat)}</td>
                    <td class="midnight-time">${this.formatTime(prayerTimes.midnight, this.settings.timeFormat)}</td>
                </tr>
            `;
        }
        
        // تحديث الجدول
        document.getElementById('prayer-table-body').innerHTML = tableHTML;
    }
    
    // حساب أوقات الصلاة ليوم محدد
    calculatePrayerTimes(date) {
        if (!this.settings.location || !this.prayTimes) {
            return this.getDefaultTimes();
        }
        
        try {
            // حساب أوقات الصلاة باستخدام praytimes.js
            const times = this.prayTimes.getTimes(
                date,
                [this.settings.location.lat, this.settings.location.lng],
                this.settings.timezone || 3, // افتراضياً +3
                this.settings.elevation || 0,
                this.settings.dst || 0
            );
            
            // تطبيق أي تعديلات محفوظة
            if (this.settings.adjustments) {
                Object.keys(this.settings.adjustments).forEach(prayer => {
                    if (times[prayer]) {
                        const adjustment = this.settings.adjustments[prayer] || 0;
                        if (adjustment !== 0) {
                            const [hours, minutes] = times[prayer].split(':').map(Number);
                            const date = new Date();
                            date.setHours(hours, minutes + adjustment, 0);
                            times[prayer] = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        }
                    }
                });
            }
            
            return times;
        } catch (error) {
            console.error('خطأ في حساب أوقات الصلاة:', error);
            return this.getDefaultTimes();
        }
    }
    
    // أوقات افتراضية في حالة الخطأ
    getDefaultTimes() {
        return {
            imsak: '05:30',
            fajr: '05:45',
            sunrise: '07:00',
            dhuhr: '12:15',
            asr: '15:30',
            sunset: '17:45',
            maghrib: '18:00',
            isha: '19:15',
            midnight: '23:30'
        };
    }
    
    // تحديث واجهة المستخدم
    updateUI() {
        // تحديث عرض الشهر الحالي
        document.getElementById('current-month').textContent = 
            `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // تحديث معلومات الموقع
        const locationInfo = document.getElementById('current-location-info');
        if (this.settings.location) {
            locationInfo.textContent = `الموقع: ${this.settings.location.name}`;
        }
        
        // تحديث القائمة المنسدلة للمدينة
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.value = this.settings.city;
        }
    }
    
    // حفظ الإعدادات
    saveSettings() {
        try {
            // حفظ إعدادات الجدول الشهري
            const monthlySettings = {
                city: this.settings.city,
                lastMonth: this.currentMonth,
                lastYear: this.currentYear
            };
            
            localStorage.setItem('monthlyTimetableSettings', JSON.stringify(monthlySettings));
            
            // يمكن أيضاً تحديث إعدادات المشروع الرئيسي إذا لزم الأمر
            const mainSettings = {
                ...this.settings,
                calculationMethod: this.settings.calculationMethod,
                timeFormat: this.settings.timeFormat
            };
            
            localStorage.setItem('prayerSettings', JSON.stringify(mainSettings));
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات:', error);
        }
    }
    
    // التعامل مع التمرير
    handleScroll() {
        const backToTopButton = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    }
    
    // التمرير إلى الأعلى
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // إظهار الإشعارات
    showNotification(message, type = 'info') {
        const notification = document.getElementById('monthly-notification');
        
        // تعيين النص واللون بناءً على النوع
        notification.textContent = message;
        notification.className = 'monthly-notification';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#26a269';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#c01c28';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#f5a623';
        } else {
            notification.style.backgroundColor = '#1e3c72';
        }
        
        // إظهار الإشعار
        notification.style.display = 'block';
        
        // إخفاء الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const monthlyTimetable = new MonthlyTimetable();
    
    // جعل الكائن متاحاً عالمياً إذا لزم الأمر
    window.monthlyTimetable = monthlyTimetable;
});