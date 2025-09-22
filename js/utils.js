// دوال مساعدة عامة
function showError(message) {
  const errorMessageElement = document.getElementById('error-message');
  if (!errorMessageElement) return;
  
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = 'block';
  setTimeout(() => {
    errorMessageElement.style.display = 'none';
  }, 5000);
}

function showNotification(message) {
  const notificationEl = document.getElementById('notification');
  if (!notificationEl) return;
  
  notificationEl.querySelector('.toast-body').textContent = message;
  
  // التحقق من وجود bootstrap قبل إنشاء Toast
  if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
    const toast = new bootstrap.Toast(notificationEl);
    toast.show();
  } else {
    // Fallback بسيط إذا لم يكن bootstrap متاحاً
    notificationEl.style.display = 'block';
    setTimeout(() => {
      notificationEl.style.display = 'none';
    }, 3000);
  }
}

function updateLocationStatus(message, isError = false) {
  const locationStatus = document.getElementById('location-status');
  if (!locationStatus) return;
  
  locationStatus.textContent = message;
  locationStatus.className = isError ? 'mt-2 small text-danger' : 'mt-2 small text-success';
}

function formatTime(time, format) {
  if (!time || typeof time !== 'string') return '--:--';
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '--:--';
    
    if (format === '24h') return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    
    if (format === '12h') return `${hours}:${minutes.toString().padStart(2,'0')} ${period}`;
    return `${hours}:${minutes.toString().padStart(2,'0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
}

function applyRounding(time, method) {
  if (!time || typeof time !== 'string') return '00:00';
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '00:00';
    
    if (method === 'nearest') minutes = Math.round(minutes/5)*5;
    else if (method === 'up') minutes = Math.ceil(minutes/5)*5;
    else if (method === 'down') minutes = Math.floor(minutes/5)*5;
    else if (method === 'none') { /* لا تقم بأي تقريب */ }
    
    if (minutes === 60) { 
      minutes = 0; 
      hours += 1; 
      if (hours === 24) hours = 0;
    }
    
    return `${hours}:${minutes.toString().padStart(2,'0')}`;
  } catch (error) {
    console.error('Error applying rounding:', error);
    return time;
  }
}

async function checkFileExists(url) {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file:', error);
    return false;
  }
}

// دوال إدارة المظهر (الوضع الليلي/النهاري)
function applyTheme(theme) {
  if (!theme) theme = 'light';
  
  console.log('تطبيق المظهر:', theme);
  
  // إزالة جميع الأوضاع أولاً
  document.body.classList.remove('dark-mode', 'bg-light');
  
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'light') {
    document.body.classList.add('bg-light');
  } else if (theme === 'auto') {
    // التلقائي - نتحقق من تفضيلات النظام
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.add('bg-light');
    }
  }
  
  // حفظ التفضيل في localStorage ضمن إعدادات التطبيق
  try {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.appearance = theme;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
    console.log('تم حفظ المظهر في الإعدادات:', theme);
  } catch (error) {
    console.error('خطأ في حفظ المظهر:', error);
  }
}

function loadTheme() {
  try {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    console.log('تحميل المظهر المحفوظ:', savedTheme);
    
    applyTheme(savedTheme);
    return savedTheme;
  } catch (error) {
    console.error('خطأ في تحميل المظهر:', error);
    applyTheme('light');
    return 'light';
  }
}

function watchSystemTheme() {
  if (window.matchMedia) {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        if (settings.appearance === 'auto') {
          console.log('تغير تفضيل النظام، تطبيق الوضع التلقائي');
          applyTheme('auto');
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // تنظيف event listener عند الحاجة
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } catch (error) {
      console.error('خطأ في مراقبة تفضيلات النظام:', error);
    }
  }
}

// دالة مساعدة للتحقق من دعم localStorage
function isLocalStorageSupported() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error('localStorage غير مدعوم:', error);
    return false;
  }
}

// دالة للحصول على الوقت الحالي بتنسيق HH:MM
function getCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// دالة للتحقق إذا كان الوقت بين وقتين
function isTimeBetween(startTime, endTime, currentTime) {
  if (!startTime || !endTime || !currentTime) return false;
  
  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);
  const current = currentTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const currentMinutes = current[0] * 60 + current[1];
  
  if (endMinutes < startMinutes) {
    // الوقت يتخطى منتصف الليل
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  } else {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
}

// دالة لتأخير التنفيذ
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة للتحقق من اتصال الإنترنت
async function checkInternetConnection() {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
}

console.log('تم تحميل utils.js بنجاح');
// في نهاية js/utils.js
console.log('تم تحميل ملف utils.js');


