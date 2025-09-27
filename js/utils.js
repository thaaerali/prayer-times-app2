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
  const toast = new bootstrap.Toast(notificationEl);
  toast.show();
}

function updateLocationStatus(message, isError = false) {
  const locationStatus = document.getElementById('location-status');
  if (!locationStatus) return;
  
  locationStatus.textContent = message;
  locationStatus.className = isError ? 'mt-2 small text-danger' : 'mt-2 small text-success';
}

// دالة لتنسيق الوقت مع التقريب - نسخة محسنة
function formatTime(time, format) {
  if (!time || time === '--:--' || time === 'Invalid Date') return '--:--';
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    
    // التحقق من صحة القيم
    if (isNaN(hours) || isNaN(minutes)) return '--:--';
    
    if (format === '24h') {
      return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    }
    
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    
    if (format === '12h') {
      return `${hours}:${minutes.toString().padStart(2,'0')} ${period}`;
    }
    
    return `${hours}:${minutes.toString().padStart(2,'0')}`;
  } catch (error) {
    console.error('Error formatting time:', error, time);
    return '--:--';
  }
}

// دالة لتطبيق التقريب - نسخة محسنة
function applyRounding(time, method) {
  if (!time || time === '--:--' || time === 'Invalid Date' || method === 'none') {
    return time;
  }
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    
    // التحقق من صحة القيم
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    if (method === 'nearest') {
      minutes = Math.round(minutes / 5) * 5;
    } else if (method === 'up') {
      minutes = Math.ceil(minutes / 5) * 5;
    } else if (method === 'down') {
      minutes = Math.floor(minutes / 5) * 5;
    }
    
    if (minutes === 60) { 
      minutes = 0; 
      hours += 1; 
      if (hours === 24) hours = 0;
    }
    
    return `${hours}:${minutes.toString().padStart(2,'0')}`;
  } catch (error) {
    console.error('Error applying rounding:', error, time);
    return time;
  }
}

// دالة مساعدة لتحويل الوقت إلى دقائق
function convertTimeToMinutes(timeString) {
  if (!timeString || timeString === '--:--') return 0;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  } catch (error) {
    console.error('Error converting time to minutes:', error);
    return 0;
  }
}

async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// دالة تطبيق المظهر
function applyTheme(theme) {
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
    
    // حفظ التفضيل في localStorage
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.appearance = theme;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
}

// تحميل التفضيل المحفوظ عند بدء التحميل
function loadTheme() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    applyTheme(savedTheme);
    return savedTheme;
}

// للاستماع لتغير تفضيلات النظام عند اختيار "تلقائي"
function watchSystemTheme() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', e => {
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            if (settings.appearance === 'auto') {
                applyTheme('auto');
            }
        });
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
    console.error('Error displaying date:', error);
  }
}
// دالة محسنة لعرض الإشعارات
function showNotification(message, type = 'success') {
  console.log(`إشعار [${type}]: ${message}`);
  
  // استخدام toast من Bootstrap إذا كان متاحاً
  const notificationEl = document.getElementById('notification');
  if (notificationEl && typeof bootstrap !== 'undefined') {
    const toastBody = notificationEl.querySelector('.toast-body');
    if (toastBody) {
      toastBody.textContent = message;
      
      // تغيير لون الخلفية حسب النوع
      if (type === 'error') {
        notificationEl.classList.remove('bg-primary');
        notificationEl.classList.add('bg-danger');
      } else {
        notificationEl.classList.remove('bg-danger');
        notificationEl.classList.add('bg-primary');
      }
      
      const toast = new bootstrap.Toast(notificationEl);
      toast.show();
      return;
    }
  }
  
  // fallback بسيط
  alert(message);
}

// دالة محسنة لتحديث حالة الموقع
function updateLocationStatus(message, isError = false) {
  const statusElement = document.getElementById('location-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `location-status ${isError ? 'text-danger' : 'text-success'}`;
    
    // إظهار العنصر إذا كان مخفياً
    statusElement.style.display = 'block';
  }
}
