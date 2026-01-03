/**
 * ملف إدارة الإشعارات والتنبيهات (محدث)
 */

// إدارة الإشعارات والتنبيهات
let lastNotifiedPrayer = null;
let notificationCheckInterval;

// دالة لعرض إشعار الصلاة (محدثة)
function showPrayerNotification(prayerName, prayerTime) {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    
    // التحقق مما إذا كان الإشعار مفعل لهذه الصلاة
    let notificationEnabled = true;
    switch(prayerName) {
        case 'fajr': notificationEnabled = settings.fajrNotification !== false; break;
        case 'dhuhr': notificationEnabled = settings.dhuhrNotification !== false; break;
        case 'asr': notificationEnabled = settings.asrNotification !== false; break;
        case 'maghrib': notificationEnabled = settings.maghribNotification !== false; break;
        case 'isha': notificationEnabled = settings.ishaNotification !== false; break;
    }
    
    if (!notificationEnabled) return;
    
    const prayerNotificationTitle = document.getElementById('prayer-notification-title');
    const prayerNotificationBody = document.getElementById('prayer-notification-body');
    const prayerNotification = document.getElementById('prayer-notification');
    
    prayerNotificationTitle.textContent = 'حان وقت الصلاة';
    prayerNotificationBody.textContent = `حان وقت صلاة ${prayerNames[prayerName]} (${prayerTime})`;
    
    // تغيير لون الإشعار حسب نوع الصلاة
    const prayerColors = {
        fajr: '#0d6efd',
        dhuhr: '#198754',
        asr: '#6f42c1',
        maghrib: '#fd7e14',
        isha: '#6c757d'
    };
    
    prayerNotification.style.backgroundColor = prayerColors[prayerName] || '#0d6efd';
    prayerNotification.querySelector('.toast-header').style.backgroundColor = prayerColors[prayerName] || '#0d6efd';
    
    const prayerToast = new bootstrap.Toast(prayerNotification);
    prayerToast.show();
    
    // تحديث آخر صلاة تم إشعارها
    lastNotifiedPrayer = prayerName;
    
    // إرسال إشعار المتصفح (إذا كان مسموحاً)
    if ('Notification' in window && Notification.permission === 'granted') {
        const prayerNames = {
            fajr: 'الفجر',
            dhuhr: 'الظهر',
            asr: 'العصر',
            maghrib: 'المغرب',
            isha: 'العشاء'
        };
        
        new Notification('حان وقت الصلاة', {
            body: `حان وقت صلاة ${prayerNames[prayerName]}`,
            icon: '/icon.png'
        });
    }
}

// دورة فحص دخول أوقات الصلاة
function startNotificationChecker() {
    // إيقاف الدورة السابقة إذا كانت تعمل
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
    
    // بدء دورة فحص جديدة كل دقيقة
    notificationCheckInterval = setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        
        // الحصول على أوقات الصلاة الحالية
        const times = getPrayerTimes(
            currentLocation.latitude || 31.9539, 
            currentLocation.longitude || 44.3736, 
            now,
            settings.calculationMethod || 'MWL'
        );
        
        // التحقق من كل صلاة إذا حان وقتها ولم يتم الإشعار بها مسبقاً
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        prayers.forEach(prayer => {
            if (isPrayerTime(times[prayer], currentTime) && lastNotifiedPrayer !== prayer) {
                showPrayerNotification(prayer, times[prayer]);
            }
        });
    }, 60000); // التحقق كل دقيقة
}

// فحص ما إذا حان وقت الصلاة
function isPrayerTime(prayerTime, currentTime) {
    if (!prayerTime) return false;
    
    const [prayerHour, prayerMinute] = prayerTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    
    return prayerHour === currentHour && prayerMinute === currentMinute;
}

// فئة إدارة الإشعارات المحدثة
class NotificationManager {
    constructor() {
        this.notifications = {
            alertAtPrayerTime: true,
            notifyBeforeMinutes: 10,
            selectedPrayers: {
                fajr: true,
                dhuhr: true,
                asr: true,
                maghrib: true,
                isha: true
            }
        };
        
        this.timers = {};
        this.saveTimeout = null;
        this.isSaving = false;
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.bindEvents();
        this.setupAutoSave();
        this.scheduleAllNotifications();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            try {
                this.notifications = JSON.parse(saved);
                this.updateUI();
            } catch (e) {
                console.error('Error loading notification settings:', e);
            }
        }
    }
    
    bindEvents() {
        // Show alert at each prayer time
        document.getElementById('show-alert-prayer-time')?.addEventListener('change', (e) => {
            this.notifications.alertAtPrayerTime = e.target.checked;
            this.autoSave();
            this.scheduleAlerts();
        });
        
        // Notification time options dropdown
        document.getElementById('notification-before-time-select')?.addEventListener('change', (e) => {
            this.notifications.notifyBeforeMinutes = parseInt(e.target.value);
            this.autoSave();
            this.scheduleBeforeNotifications();
        });
        
        // Prayer selection checkboxes
        document.querySelectorAll('.prayer-notification-check').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const prayer = e.target.id.replace('-notification', '');
                this.notifications.selectedPrayers[prayer] = e.target.checked;
                this.autoSave();
                this.scheduleAllNotifications();
            });
        });
    }
    
    setupAutoSave() {
        // Update save status every second
        setInterval(() => {
            this.updateSaveStatus();
        }, 1000);
    }
    
    autoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveSettings();
        }, 500);
    }
    
    saveSettings() {
        this.isSaving = true;
        
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.notifications));
            this.showSaveStatus('تم الحفظ', 'success');
        } catch (e) {
            console.error('Error saving settings:', e);
            this.showSaveStatus('خطأ في الحفظ', 'error');
        }
        
        setTimeout(() => {
            this.isSaving = false;
        }, 300);
    }
    
   updateSaveStatus() {
    const statusEl = document.getElementById('auto-save-status');
    if (!statusEl) return;
    
    if (this.isSaving) {
        statusEl.innerHTML = '<i class="bi bi-hourglass-split text-warning me-1"></i>';
        statusEl.className = 'text-center mt-4 small text-warning';
    } else {
        statusEl.innerHTML = '<i class="bi bi-check-circle text-success me-1"></i>';
        statusEl.className = 'text-center mt-4 small text-muted';
    }
}

showSaveStatus(message, type = 'success') {
    const statusEl = document.getElementById('auto-save-status');
    if (!statusEl) return;
    
    let icon = 'bi-check-circle';
    let textClass = 'text-success';
    
    if (type === 'error') {
        icon = 'bi-exclamation-circle';
        textClass = 'text-danger';
    } else if (type === 'warning') {
        icon = 'bi-exclamation-triangle';
        textClass = 'text-warning';
    } else if (type === 'info') {
        icon = 'bi-info-circle';
        textClass = 'text-info';
    }
    
    statusEl.innerHTML = `<i class="bi ${icon} ${textClass} me-1"></i>`;
    statusEl.className = `text-center mt-4 small ${textClass}`;
    
    // العودة للحالة العادية بعد 2 ثانية
    setTimeout(() => {
        this.updateSaveStatus();
    }, 2000);
}
    
    updateUI() {
        // Update alert checkbox
        const alertCheckbox = document.getElementById('show-alert-prayer-time');
        if (alertCheckbox) alertCheckbox.checked = this.notifications.alertAtPrayerTime;
        
        // Update time dropdown
        const timeSelect = document.getElementById('notification-before-time-select');
        if (timeSelect) {
            timeSelect.value = this.notifications.notifyBeforeMinutes.toString();
        }
        
        // Update prayer checkboxes
        for (const prayer in this.notifications.selectedPrayers) {
            const checkbox = document.getElementById(`${prayer}-notification`);
            if (checkbox) checkbox.checked = this.notifications.selectedPrayers[prayer];
        }
    }
    
    scheduleAllNotifications() {
        this.clearAllTimers();
        
        if (this.notifications.alertAtPrayerTime) {
            this.scheduleAlerts();
        }
        
        if (this.notifications.notifyBeforeMinutes > 0) {
            this.scheduleBeforeNotifications();
        }
        
        // إعادة تشغيل الفحص الدوري (للتوافق مع النظام القديم)
        startNotificationChecker();
    }
    
    scheduleAlerts() {
        if (!this.notifications.alertAtPrayerTime) return;
        
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        prayers.forEach(prayer => {
            if (this.notifications.selectedPrayers[prayer]) {
                const prayerTime = this.getPrayerTime(prayer);
                if (prayerTime) {
                    this.scheduleAlert(prayer, prayerTime);
                }
            }
        });
    }
    
    scheduleBeforeNotifications() {
        const minutesBefore = this.notifications.notifyBeforeMinutes;
        if (minutesBefore <= 0) return;
        
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        prayers.forEach(prayer => {
            if (this.notifications.selectedPrayers[prayer]) {
                const prayerTime = this.getPrayerTime(prayer);
                if (prayerTime) {
                    const notificationTime = this.calculateTimeBefore(prayerTime, minutesBefore);
                    this.scheduleNotification(prayer, notificationTime, `يتبقى ${minutesBefore} دقيقة على صلاة`);
                }
            }
        });
    }
    
    getPrayerTime(prayerName) {
        if (!window.currentPrayerTimes) return null;
        
        const prayerTimes = window.currentPrayerTimes;
        const prayerMap = {
            fajr: 'fajr',
            dhuhr: 'dhuhr',
            asr: 'asr',
            maghrib: 'maghrib',
            isha: 'isha'
        };
        
        return prayerTimes[prayerMap[prayerName]];
    }
    
    calculateTimeBefore(timeString, minutes) {
        try {
            const [hours, mins] = timeString.split(':').map(Number);
            if (isNaN(hours) || isNaN(mins)) return null;
            
            const date = new Date();
            date.setHours(hours, mins - minutes, 0, 0);
            
            // إذا كان الوقت في الماضي، أضف يوم
            if (date < new Date()) {
                date.setDate(date.getDate() + 1);
            }
            
            return date;
        } catch (e) {
            console.error('خطأ في حساب الوقت:', e);
            return null;
        }
    }
    
    scheduleAlert(prayerName, time) {
        const alertTime = this.parseTimeString(time);
        if (!alertTime) return;
        
        const now = new Date();
        const timeToAlert = alertTime - now;
        
        if (timeToAlert > 0 && timeToAlert < 24 * 60 * 60 * 1000) {
            const timerId = setTimeout(() => {
                this.showBrowserNotification(prayerName, 'alert');
                // إعادة الجدولة لليوم التالي
                this.scheduleAlert(prayerName, time);
            }, timeToAlert);
            
            const key = `alert_${prayerName}_${alertTime.getTime()}`;
            this.timers[key] = timerId;
            
            console.log(`جدولة تنبيه لصلاة ${prayerName}: ${alertTime.toLocaleTimeString()}`);
        }
    }
    
    scheduleNotification(prayerName, time, message) {
        if (!time) return;
        
        const now = new Date();
        const timeToNotify = time - now;
        
        if (timeToNotify > 0 && timeToNotify < 24 * 60 * 60 * 1000) {
            const timerId = setTimeout(() => {
                this.showBrowserNotification(prayerName, 'before');
                // إعادة الجدولة لليوم التالي
                const nextDay = new Date(time);
                nextDay.setDate(nextDay.getDate() + 1);
                this.scheduleNotification(prayerName, nextDay, message);
            }, timeToNotify);
            
            const key = `notification_${prayerName}_${time.getTime()}`;
            this.timers[key] = timerId;
            
            console.log(`جدولة إشعار لصلاة ${prayerName}: ${time.toLocaleTimeString()}`);
        }
    }
    
    parseTimeString(timeString) {
        if (!timeString) return null;
        
        try {
            const [hours, mins] = timeString.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, mins, 0, 0);
            
            if (date < new Date()) {
                date.setDate(date.getDate() + 1);
            }
            
            return date;
        } catch (e) {
            console.error('خطأ في تحليل الوقت:', e);
            return null;
        }
    }
    
    showBrowserNotification(prayerName, type = 'alert') {
        const prayerNames = {
            fajr: 'الفجر',
            dhuhr: 'الظهر',
            asr: 'العصر',
            maghrib: 'المغرب',
            isha: 'العشاء'
        };
        
        if (type === 'alert') {
            const title = 'تنبيه وقت الصلاة';
            const body = `حان وقت صلاة ${prayerNames[prayerName]}`;
            
            // عرض إشعار Toast
            showPrayerNotification(prayerName, this.getPrayerTime(prayerName));
            
            // إشعار المتصفح
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        } else if (type === 'before') {
            const title = 'تذكير بالصلاة';
            const body = `${this.notifications.notifyBeforeMinutes} دقيقة تتبقى على صلاة ${prayerNames[prayerName]}`;
            
            // عرض إشعار Toast
            this.showToastNotification(title, body, 'reminder');
            
            // إشعار المتصفح
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        }
    }
    
    showToastNotification(title, body, type = 'info') {
        // Create toast element
        const toastHtml = `
            <div class="toast prayer-toast" role="alert">
                <div class="toast-header ${type === 'reminder' ? 'bg-info text-white' : 'bg-primary text-white'}">
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${body}
                </div>
            </div>
        `;
        
        // Create toast container if not exists
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Add toast
        toastContainer.insertAdjacentHTML('afterbegin', toastHtml);
        
        // Show toast
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remove toast after hide
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
    
    clearAllTimers() {
        for (const timerId in this.timers) {
            clearTimeout(this.timers[timerId]);
        }
        this.timers = {};
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('تم منح الإذن للإشعارات');
                }
            });
        }
    }
}

// تهيئة مدير الإشعارات عند تحميل الصفحة
let notificationManager;

// تهيئة النظام القديم أولاً
let prayerNames = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
};

// دالة مساعدة للحصول على أوقات الصلاة (افتراضية - يجب استبدالها بالدالة الحقيقية)
function getPrayerTimes(lat, lng, date, method) {
    // هذه دالة افتراضية - استبدلها بالدالة الحقيقية من مشروعك
    return window.currentPrayerTimes || {};
}

// تهيئة كل شيء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة مدير الإشعارات الجديد
    notificationManager = new NotificationManager();
    
    // طلب الإذن للإشعارات
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            setTimeout(() => {
                Notification.requestPermission();
            }, 1000);
        }
    }
    
    window.notificationManager = notificationManager;
    
    // بدء فحص الإشعارات القديم (للتوافق)
    startNotificationChecker();
});

// جدولة الإشعارات عند تحديث أوقات الصلاة
if (typeof window !== 'undefined') {
    window.addEventListener('prayerTimesUpdated', () => {
        if (notificationManager) {
            setTimeout(() => {
                notificationManager.scheduleAllNotifications();
            }, 500);
        }
    });
}

// جعل الدوال متاحة عالمياً
window.showPrayerNotification = showPrayerNotification;
window.startNotificationChecker = startNotificationChecker;
window.isPrayerTime = isPrayerTime;
window.NotificationManager = NotificationManager;




