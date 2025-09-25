// إدارة الأصوات والتشغيل التلقائي
const adhanSounds = {
  'abdul-basit': 'audio/abdul-basit.mp3',
  'mishary-rashid': 'audio/mishary-rashid.mp3',
  'saud-al-shuraim': 'audio/saud-al-shuraim.mp3',
  'yasser-al-dosari': 'audio/yasser-al-dosari.mp3'
};

// متغير لتتبع حالة التشغيل
let isAdhanPlaying = false;
let prayerTimesInterval = null;

async function playAdhanSound(soundId) {
  console.log('محاولة تشغيل الصوت:', soundId);
  
  // التحقق من وجود الدوال المساعدة
  if (typeof showError === 'undefined' || typeof showNotification === 'undefined') {
    console.warn('الدوال المساعدة غير متاحة، استخدام console بدلاً منها');
  }

  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');
  const volumeLevel = document.getElementById('volume-level');

  if (!soundUrl) {
    console.error('لم يتم العثور على ملف الصوت المحدد:', soundId);
    if (typeof showError === 'function') {
      showError('لم يتم العثور على ملف الصوت المحدد');
    }
    return;
  }

  if (!adhanPlayer) {
    console.error('عنصر تشغيل الصوت غير موجود');
    if (typeof showError === 'function') {
      showError('عنصر تشغيل الصوت غير موجود');
    }
    return;
  }

  // منع التشغيل المتعدد
  if (isAdhanPlaying) {
    console.log('الأذان يعمل بالفعل، إلغاء التشغيل الجديد');
    return;
  }

  try {
    // التحقق من وجود الملف أولاً
    console.log('التحقق من وجود الملف:', soundUrl);
    const fileExists = await checkFileExists(soundUrl);

    if (!fileExists) {
      const errorMsg = `ملف الصوت غير موجود: ${soundUrl}. يرجى التأكد من وجود الملف في المجلد المحدد.`;
      console.error(errorMsg);
      if (typeof showError === 'function') {
        showError(errorMsg);
      }
      return;
    }

    // تعيين مستوى الصوت
    const volume = volumeLevel ? (volumeLevel.value / 100) : 0.8;
    console.log('مستوى الصوت:', volume);
    
    // تشغيل الصوت
    adhanPlayer.src = soundUrl;
    adhanPlayer.volume = volume;
    isAdhanPlaying = true;

    console.log('بدء تشغيل الصوت...');
    const promise = adhanPlayer.play();

    if (promise !== undefined) {
      promise.then(() => {
        console.log('تم بدء تشغيل الأذان بنجاح');
        if (typeof showNotification === 'function') {
          showNotification('جاري تشغيل الأذان');
        }
        
        // إعادة تعيين حالة التشغيل عند انتهاء الصوت
        adhanPlayer.onended = () => {
          isAdhanPlaying = false;
          console.log('انتهى تشغيل الأذان');
        };
        
        adhanPlayer.onerror = (error) => {
          isAdhanPlaying = false;
          console.error('خطأ في تشغيل الأذان:', error);
          if (typeof showError === 'function') {
            showError('تعذر تشغيل الأذان. يرجى تفعيل الصوت في المتصفح.');
          }
        };
        
      }).catch(error => {
        isAdhanPlaying = false;
        console.error('Error playing adhan:', error);
        if (typeof showError === 'function') {
          showError('تعذر تشغيل الأذان. يرجى تفعيل الصوت في المتصفح.');
        }
      });
    }
  } catch (error) {
    isAdhanPlaying = false;
    console.error('Error playing adhan:', error);
    if (typeof showNotification === 'function') {
      showNotification('تعذر تشغيل صوت الأذان. يرجى تفعيل الصوت.');
    }
  }
}

// دالة للتحقق من وجود الملف
async function checkFileExists(url) {
  try {
    console.log('جاري التحقق من الملف:', url);
    const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    const exists = response.ok;
    console.log('نتيجة التحقق من الملف:', exists);
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

// دالة للتحقق من أوقات الصلاة وتشغيل الأذان
function checkPrayerTimes() {
  console.log('التحقق من أوقات الصلاة...');
  
  // التحقق من وجود الدوال والكائنات المطلوبة
  if (typeof getPrayerTimes === 'undefined') {
    console.warn('دالة getPrayerTimes غير متاحة');
    return;
  }

  // التحقق من وجود currentLocation
  if (typeof currentLocation === 'undefined') {
    console.warn('currentLocation غير معرّف، استخدام القيم الافتراضية');
    // إنشاء currentLocation إذا لم يكن موجوداً
    if (typeof window !== 'undefined') {
      window.currentLocation = {
        latitude: 31.9539,
        longitude: 44.3736,
        city: 'النجف'
      };
    } else {
      console.error('window غير متاح');
      return;
    }
  }

  const now = new Date();
  const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  console.log('الوقت الحالي:', currentTime);
  
  // تحميل الإعدادات مع القيم الافتراضية
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    console.log('الإعدادات المحملة:', settings);
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
    settings = {};
  }

  // استخدام القيم الافتراضية إذا كانت currentLocation غير متاحة
  const lat = currentLocation?.latitude || 31.9539;
  const lng = currentLocation?.longitude || 44.3736;

  try {
    // الحصول على أوقات الصلاة الحالية
    console.log('جاري حساب أوقات الصلاة...');
    const times = getPrayerTimes(lat, lng, now, settings.calculationMethod || 'MWL');
    console.log('أوقات الصلاة المحسوبة:', times);
    
    // التحقق من صحة الأوقات
    if (!times || typeof times !== 'object') {
      console.warn('أوقات الصلاة غير صالحة');
      return;
    }

    // التحقق من كل صلاة إذا حان وقتها
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    prayers.forEach(prayer => {
      const prayerTime = times[prayer];
      const shouldPlay = shouldPlayAdhan(prayer, settings);
      const isTime = isPrayerTime(prayerTime, currentTime);
      
      console.log(`الصلاة: ${prayer}, الوقت: ${prayerTime}, التشغيل مفعل: ${shouldPlay}, حان الوقت: ${isTime}`);
      
      if (shouldPlay && isTime) {
        console.log(`حان وقت صلاة ${prayer}, تشغيل الأذان`);
        const selectedSound = settings.selectedSound || 'abdul-basit';
        console.log('الصوت المحدد:', selectedSound);
        playAdhanSound(selectedSound);
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من أوقات الصلاة:', error);
  }
}

// دالة مساعدة للتحقق إذا حان وقت الصلاة
function isPrayerTime(prayerTime, currentTime) {
  if (!prayerTime || prayerTime === '--:--' || prayerTime === 'Invalid Date') {
    console.log('وقت الصلاة غير صالح:', prayerTime);
    return false;
  }

  try {
    const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

    // التحقق من صحة الأرقام
    if (isNaN(prayerHours) || isNaN(prayerMinutes) || 
        isNaN(currentHours) || isNaN(currentMinutes)) {
      console.log('أرقام الوقت غير صالحة:', { prayerHours, prayerMinutes, currentHours, currentMinutes });
      return false;
    }

    const isTime = prayerHours === currentHours && prayerMinutes === currentMinutes;
    console.log(`مقارنة الوقت: ${prayerTime} vs ${currentTime} -> ${isTime}`);
    return isTime;
  } catch (error) {
    console.error('خطأ في التحقق من وقت الصلاة:', error);
    return false;
  }
}

// دالة للتحقق إذا كان التشغيل التلقائي مفعل للصلاة
function shouldPlayAdhan(prayer, settings) {
  // إذا لم توجد إعدادات، استخدام القيم الافتراضية (مفعل)
  if (!settings || typeof settings !== 'object') {
    console.log('لا توجد إعدادات، استخدام القيم الافتراضية (مفعل)');
    return true;
  }

  let shouldPlay = true;
  
  switch(prayer) {
    case 'fajr': 
      shouldPlay = settings.playFajrAdhan !== false;
      break;
    case 'dhuhr': 
      shouldPlay = settings.playDhuhrAdhan !== false;
      break;
    case 'asr': 
      shouldPlay = settings.playAsrAdhan !== false;
      break;
    case 'maghrib': 
      shouldPlay = settings.playMaghribAdhan !== false;
      break;
    case 'isha': 
      shouldPlay = settings.playIshaAdhan !== false;
      break;
    default: 
      shouldPlay = false;
  }
  
  console.log(`تشغيل أذان ${prayer}: ${shouldPlay}`);
  return shouldPlay;
}

// دالة لإيقاف الأذان
function stopAdhan() {
  console.log('إيقاف الأذان...');
  const adhanPlayer = document.getElementById('adhan-player');
  if (adhanPlayer) {
    adhanPlayer.pause();
    adhanPlayer.currentTime = 0;
    isAdhanPlaying = false;
    console.log('تم إيقاف الأذان');
  }
}

// دالة للتحقق من حالة التشغيل
function getAdhanStatus() {
  return isAdhanPlaying;
}

// دالة لبدء مراقبة أوقات الصلاة
function startPrayerTimesMonitoring() {
  console.log('بدء مراقبة أوقات الصلاة...');
  
  // إيقاف المراقبة السابقة إذا كانت تعمل
  if (prayerTimesInterval) {
    clearInterval(prayerTimesInterval);
    prayerTimesInterval = null;
  }
  
  // بدء المراقبة الجديدة
  prayerTimesInterval = setInterval(checkPrayerTimes, 60000); // فحص كل دقيقة
  console.log('تم بدء المراقبة، سيتم الفحص كل دقيقة');
}

// دالة لإيقاف مراقبة أوقات الصلاة
function stopPrayerTimesMonitoring() {
  console.log('إيقاف مراقبة أوقات الصلاة...');
  if (prayerTimesInterval) {
    clearInterval(prayerTimesInterval);
    prayerTimesInterval = null;
    console.log('تم إيقاف المراقبة');
  }
}

// تهيئة مدير الصوت
function initAudioManager() {
  console.log('=== تهيئة مدير الصوت ===');
  
  // التحقق من وجود عنصر الصوت
  const adhanPlayer = document.getElementById('adhan-player');
  if (!adhanPlayer) {
    console.error('❌ عنصر تشغيل الصوت غير موجود في الصفحة');
    return false;
  }
  
  console.log('✅ عنصر تشغيل الصوت موجود');

  // إعداد مستمعي الأحداث للصوت
  adhanPlayer.onended = () => {
    isAdhanPlaying = false;
    console.log('✅ انتهى تشغيل الأذان');
  };

  adhanPlayer.onerror = (error) => {
    isAdhanPlaying = false;
    console.error('❌ حدث خطأ في تشغيل الصوت:', error);
  };

  // بدء المراقبة بعد التأكد من تهيئة الصفحة
  setTimeout(() => {
    console.log('بدء المراقبة بعد التأخير...');
    startPrayerTimesMonitoring();
    checkPrayerTimes(); // فحص أولي
  }, 3000); // تأخير 3 ثواني لضمان تحميل الصفحة بالكامل
  
  return true;
}

// التهيئة عند تحميل DOM
function initialize() {
  if (document.readyState === 'loading') {
    console.log('📄 الصفحة قيد التحميل، انتظار DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initAudioManager);
  } else {
    console.log('✅ الصفحة محملة بالفعل، بدء التهيئة...');
    setTimeout(initAudioManager, 100);
  }
}

// بدء التهيئة
initialize();

// جعل الدوال متاحة globally للاختبار
if (typeof window !== 'undefined') {
  window.playAdhanSound = playAdhanSound;
  window.stopAdhan = stopAdhan;
  window.getAdhanStatus = getAdhanStatus;
  window.checkPrayerTimes = checkPrayerTimes;
  window.startPrayerTimesMonitoring = startPrayerTimesMonitoring;
  window.stopPrayerTimesMonitoring = stopPrayerTimesMonitoring;
}
