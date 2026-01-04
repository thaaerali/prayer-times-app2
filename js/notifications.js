/*************************************************
 * 1) متغيرات عامة + النظام القديم (للتوافق)
 *************************************************/
let lastNotifiedPrayer = null;
let notificationCheckInterval;



/*************************************************
 * 2) دوال النظام القديم (Toast + فحص الدقيقة)
 *************************************************/
function showPrayerNotification(prayerName, prayerTime) {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    if (settings[`${prayerName}Notification`] === false) return;

    const toastEl = document.getElementById('prayer-notification');
    if (!toastEl) return;

    toastEl.querySelector('#prayer-notification-title').textContent = 'حان وقت الصلاة';
    toastEl.querySelector('#prayer-notification-body').textContent =
        `حان وقت صلاة ${prayerNames[prayerName]} (${prayerTime})`;

    new bootstrap.Toast(toastEl).show();

    lastNotifiedPrayer = prayerName;

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('حان وقت الصلاة', {
            body: `حان وقت صلاة ${prayerNames[prayerName]}`,
            icon: '/icon.png'
        });
    }
}

function isPrayerTime(prayerTime, currentTime) {
    if (!prayerTime) return false;
    return prayerTime === currentTime;
}

function startNotificationChecker() {
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);

    notificationCheckInterval = setInterval(() => {
        if (!window.currentPrayerTimes) return;

        const now = new Date();
        const currentTime =
            now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');

        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
            if (
                isPrayerTime(window.currentPrayerTimes[prayer], currentTime) &&
                lastNotifiedPrayer !== prayer
            ) {
                showPrayerNotification(prayer, window.currentPrayerTimes[prayer]);
            }
        });
    }, 60000);
}

/*************************************************
 * 3) الفئة الموحدة NotificationManager (الأساس)
 *************************************************/
class NotificationManager {

    constructor() {
        this.defaultSettings = {
            alertAtPrayerTime: true,
            notifyBeforeMinutes: 10,
            selectedPrayers: {
                fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true
            }
        };

        this.settings = JSON.parse(
            localStorage.getItem('notificationSettings')
        ) || structuredClone(this.defaultSettings);

        this.timers = {};
    }

    init() {
        this.requestPermission();
        this.bindUI();
        this.scheduleAll();
    }

    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    bindUI() {
        document
            .getElementById('show-alert-prayer-time')
            ?.addEventListener('change', e => {
                this.settings.alertAtPrayerTime = e.target.checked;
                this.save();
            });

        document
            .getElementById('notification-before-time-select')
            ?.addEventListener('change', e => {
                this.settings.notifyBeforeMinutes = parseInt(e.target.value) || 10;
                this.save();
            });

        document.querySelectorAll('.prayer-notification-check')
            .forEach(cb => {
                cb.addEventListener('change', e => {
                    const p = e.target.id.replace('-notification', '');
                    this.settings.selectedPrayers[p] = e.target.checked;
                    this.save();
                });
            });
    }

    save() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
        this.scheduleAll();
    }

    scheduleAll() {
        this.clearTimers();
        startNotificationChecker(); // توافق قديم

        if (!window.currentPrayerTimes) return;

        Object.keys(this.settings.selectedPrayers).forEach(prayer => {
            if (!this.settings.selectedPrayers[prayer]) return;

            const time = window.currentPrayerTimes[prayer];
            if (!time) return;

            if (this.settings.alertAtPrayerTime) {
                this.scheduleExact(prayer, time);
            }

            if (this.settings.notifyBeforeMinutes > 0) {
                this.scheduleBefore(prayer, time);
            }
        });
    }

    scheduleExact(prayer, timeStr) {
        const date = this.parseTime(timeStr);
        const delay = date - new Date();
        if (delay <= 0) return;

        this.timers[`exact_${prayer}`] = setTimeout(() => {
            showPrayerNotification(prayer, timeStr);
            this.scheduleExact(prayer, timeStr);
        }, delay);
    }

    scheduleBefore(prayer, timeStr) {
        const date = this.parseTime(timeStr);
        date.setMinutes(date.getMinutes() - this.settings.notifyBeforeMinutes);

        const delay = date - new Date();
        if (delay <= 0) return;

        this.timers[`before_${prayer}`] = setTimeout(() => {
            this.notify(
                'تذكير بالصلاة',
                `تبقى ${this.settings.notifyBeforeMinutes} دقيقة على صلاة ${prayerNames[prayer]}`
            );
            this.scheduleBefore(prayer, timeStr);
        }, delay);
    }

    notify(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }

    parseTime(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d < new Date()) d.setDate(d.getDate() + 1);
        return d;
    }

    clearTimers() {
        Object.values(this.timers).forEach(clearTimeout);
        this.timers = {};
    }
}

/*************************************************
 * 4) التهيئة العامة (مرة واحدة)
 *************************************************/
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
    window.notificationManager.init();
});

/*************************************************
 * 5) الربط مع تحديث أوقات الصلاة
 *************************************************/
window.addEventListener('prayerTimesUpdated', () => {
    if (window.notificationManager) {
        window.notificationManager.scheduleAll();
    }
});

/*************************************************
 * 6) تصدير (اختياري للتشخيص)
 *************************************************/
window.startNotificationChecker = startNotificationChecker;
window.showPrayerNotification = showPrayerNotification;

