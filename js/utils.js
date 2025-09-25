// دوال مساعدة عامة

// دالة لعرض رسائل الخطأ
function showError(message) {
  try {
    const errorMessageElement = document.getElementById('error-message');
    if (!errorMessageElement) {
      console.error('عنصر عرض الخطأ غير موجود:', message);
      return;
    }
    
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    
    // إخفاء الرسالة تلقائياً بعد 5 ثواني
    setTimeout(() => {
      if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
      }
    }, 5000);
  } catch (error) {
    console.error('خطأ في عرض الرسالة:', error);
  }
}

// دالة لعرض الإشعارات
function showNotification(message, type = 'success') {
  try {
    const notificationEl = document.getElementById('notification');
    if (!notificationEl) {
      console.log('إشعار:', message);
      return;
    }
    
    // تحديث نص الإشعار
    const toastBody = notificationEl.querySelector('.toast-body');
    if (toastBody) {
      toastBody.textContent = message;
    }
    
    // تغيير اللون حسب نوع الإشعار
    if (type === 'error') {
      notificationEl.classList.remove('bg-primary', 'bg-success');
      notificationEl.classList.add('bg-danger');
    } else if (type === 'success') {
      notificationEl.classList.remove('bg-primary', 'bg-danger');
      notificationEl.classList.add('bg-success');
    } else {
      notificationEl.classList.remove('bg-success', 'bg-danger');
      notificationEl.classList.add('bg-primary');
    }
    
    // التحقق من وجود bootstrap قبل استخدام Toast
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toast = new bootstrap.Toast(notificationEl);
      toast.show();
    } else {
      // بديل إذا لم يكن bootstrap متاحاً
      notificationEl.style.display = 'block';
      setTimeout(() => {
        notificationEl.style.display = 'none';
      }, 3000);
    }
  } catch (error) {
    console.error('خطأ في عرض الإشعار:', error);
  }
}

// دالة لتحديث حالة الموقع
function updateLocationStatus(message, isError = false) {
  try {
    const locationStatus = document.getElementById('location-status');
    if (!locationStatus) {
      console.log('حالة الموقع:', message);
      return;
    }
    
    locationStatus.textContent = message;
    locationStatus.className = isError ? 'mt-2 small text-danger' : 'mt-2 small text-success';
  } catch (error) {
    console.error('خطأ في تحديث حالة الموقع:', error);
  }
}

// دالة لتنسيق الوقت مع التقريب - نسخة محسنة
function formatTime(time, format = '24h') {
  if (!time || time === '--:--' || time === 'Invalid Date') {
    return '--:--';
  }
  
  try {
    // تنظيف النص وإزالة أي مسافات
    const cleanTime = time.toString().trim();
    let [hours, minutes] = cleanTime.split(':').map(Number);
    
    // التحقق من صحة القيم
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return '--:--';
    }
    
    if (format === '24h') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    
    if (format === '12h') {
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // التنسيق الافتراضي (12 ساعة بدون am/pm)
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('خطأ في تنسيق الوقت:', error, time);
    return '--:--';
  }
}

// دالة لتطبيق التقريب - نسخة محسنة
function applyRounding(time, method = 'nearest') {
  if (!time || time === '--:--' || time === 'Invalid Date' || method === 'none') {
    return time;
  }
  
  try {
    const cleanTime = time.toString().trim();
    let [hours, minutes] = cleanTime.split(':').map(Number);
    
    // التحقق من صحة القيم
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    // تطبيق التقريب
    if (method === 'nearest') {
      minutes = Math.round(minutes / 5) * 5;
    } else if (method === 'up') {
      minutes = Math.ceil(minutes / 5) * 5;
    } else if (method === 'down') {
      minutes = Math.floor(minutes / 5) * 5;
    }
    
    // التعامل مع تجاوز الدقائق
    if (minutes >= 60) { 
      minutes = 0; 
      hours += 1; 
    }
    
    // التعامل مع تجاوز الساعات
    if (hours >= 24) { 
      hours = 0; 
    }
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('خطأ في تطبيق التقريب:', error, time);
    return time;
  }
}

// دالة مساعدة لتحويل الوقت إلى دقائق
function convertTimeToMinutes(timeString) {
  if (!timeString || timeString === '--:--') return 0;
  
  try {
    const cleanTime = timeString.toString().trim();
    const [hours, minutes] = cleanTime.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return 0;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
    
    return hours * 60 + minutes;
  } catch (error) {
    console.error('خطأ في تحويل الوقت إلى دقائق:', error);
    return 0;
  }
}

// دالة للتحقق من وجود ملف
async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('خطأ في التحقق من وجود الملف:', error);
    return false;
  }
}

// دالة تطبيق المظهر
function applyTheme(theme) {
  try {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('bg-light');
    } else if (theme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('bg-light');
    } else {
      // التلقائي - نتحقق من تفضيلات النظام
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('bg-light');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('bg-light');
      }
    }
  } catch (error) {
    console.error('خطأ في تطبيق المظهر:', error);
  }
}

// تحميل التفضيل المحفوظ عند بدء التحميل
function loadTheme() {
  try {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    applyTheme(savedTheme);
    return savedTheme;
  } catch (error) {
    console.error('خطأ في تحميل المظهر:', error);
    applyTheme('light');
    return 'light';
  }
}

// للاستماع لتغير تفضيلات النظام عند اختيار "تلقائي"
function watchSystemTheme() {
  if (window.matchMedia) {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', e => {
        try {
          const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
          if (settings.appearance === 'auto') {
            applyTheme('auto');
          }
        } catch (error) {
          console.error('خطأ في تغيير مظهر النظام:', error);
        }
      });
    } catch (error) {
      console.error('خطأ في إعداد مستمع مظهر النظام:', error);
    }
  }
}

// دالة لعرض التاريخ الحالي
function displayDate() {
  try {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const dateString = now.toLocaleDateString('ar-SA', options);
    const dateDisplay = document.getElementById('date-display');
    
    if (dateDisplay) {
      dateDisplay.textContent = dateString;
    }
  } catch (error) {
    console.error('خطأ في عرض التاريخ:', error);
    // محاولة استخدام تنسيق أبسط
    try {
      const now = new Date();
      const simpleDate = now.toLocaleDateString('ar-SA');
      const dateDisplay = document.getElementById('date-display');
      if (dateDisplay) {
        dateDisplay.textContent = simpleDate;
      }
    } catch (simpleError) {
      console.error('خطأ في عرض التاريخ المبسط:', simpleError);
    }
  }
}

// دالة للانتظار حتى يكون DOM جاهزاً
function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// دالة للتحقق من وجود عنصر
function elementExists(selector) {
  try {
    return document.querySelector(selector) !== null;
  } catch (error) {
    return false;
  }
}

// دالة للحصول على العنصر بأمان
function getElement(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.error('خطأ في الحصول على العنصر:', selector, error);
    return null;
  }
}

// دالة للتحقق من اتصال الإنترنت
async function checkInternetConnection() {
  try {
    const response = await fetch('https://httpbin.org/status/200', { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// دالة لتأخير التنفيذ
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة للتحقق من دعم المتصفح
function checkBrowserSupport() {
  const supports = {
    geolocation: !!navigator.geolocation,
    localStorage: !!window.localStorage,
    serviceWorker: 'serviceWorker' in navigator,
    fetch: !!window.fetch,
    promises: !!window.Promise
  };
  
  return supports;
}

// تهيئة الأدوات المساعدة
function initUtils() {
  console.log('تهيئة الأدوات المساعدة...');
  
  // التحقق من دعم المتصفح
  const browserSupport = checkBrowserSupport();
  if (!browserSupport.localStorage) {
    console.error('المتصفح لا يدعم localStorage');
  }
  if (!browserSupport.geolocation) {
    console.warn('المتصفح لا يدعم Geolocation');
  }
  
  return browserSupport;
}

// التهيئة التلقائية عند تحميل الصفحة
if (typeof window !== 'undefined') {
  domReady(() => {
    initUtils();
  });
}
