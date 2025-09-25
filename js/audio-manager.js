// إدارة الأصوات والتشغيل التلقائي
const adhanSounds = {
  'abdul-basit': 'audio/abdul-basit.mp3',
  'mishary-rashid': 'audio/mishary-rashid.mp3',
  'saud-al-shuraim': 'audio/saud-al-shuraim.mp3',
  'yasser-al-dosari': 'audio/yasser-al-dosari.mp3'
};

// متغير لتتبع حالة التشغيل
let isAdhanPlaying = false;

async function playAdhanSound(soundId) {
  // التحقق من وجود الدوال المساعدة
  if (typeof showError === 'undefined' || typeof showNotification === 'undefined') {
    console.error('الدوال المساعدة غير متاحة');
    return;
  }

  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');
  const volumeLevel = document.getElementById('volume-level');

  if (!soundUrl) {
    showError('لم يتم العثور على ملف الصوت المحدد');
    return;
  }

  if (!adhanPlayer) {
    showError('عنصر تشغيل الصوت غير موجود');
    return;
  }

  // منع التشغيل المتعدد
  if (isAdhanPlaying) {
    console.log('الأذان يعمل بالفعل، إلغاء التشغيل الجديد');
    return;
  }

  try {
    // التحقق من وجود الملف أولاً
    const fileExists = await checkFileExists(soundUrl);

    if (!fileExists) {
      showError(`ملف الصوت غير موجود: ${soundUrl}. يرجى التأكد من وجود الملف في المجلد المحدد.`);
      return;
    }

    // تعيين مستوى الصوت
    const volume = volumeLevel ? volumeLevel.value / 100 : 0.8;
    
    // تشغيل الصوت
    adhanPlayer.src = soundUrl;
    adhanPlayer.volume = volume;
    isAdhanPlaying = true;

    const promise = adhanPlayer.play();

    if (promise !== undefined) {
      promise.then(() => {
        showNotification('جاري تشغيل الأذان');
        
        // إعادة تعيين حالة التشغيل عند انتهاء الصوت
        adhanPlayer.onended = () => {
          isAdhanPlaying = false;
          console.log('انتهى تشغيل الأذان');
        };
        
        adhanPlayer.onerror = () => {
          isAdhanPlaying = false;
          console.error('خطأ في تشغيل الأذان');
        };
        
      }).catch(error => {
        isAdhanPlaying = false;
        showError('تعذر تشغيل الأذان. يرجى تفعيل الصوت في المتصفح.');
        console.error('Error playing adhan:', error);
      });
    }
  } catch (error) {
    isAdhanPlaying = false;
    console.error('Error playing adhan:', error);
    showNotification('تعذر تشغيل صوت الأذان. يرجى تفعيل الصوت.');
  }
}

// دالة للتحقق من وجود الملف
async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

// دالة للتحقق من أوقات الصلاة وتشغيل الأذان
function checkPrayerTimes() {
  // التحقق من وجود الدوال والكائنات المطلوبة
  if (typeof getPrayerTimes === 'undefined') {
    console.warn('دالة getPrayerTimes غير متاحة');
    return;
  }

  // التحقق من وجود currentLocation
  if (typeof currentLocation === 'undefined') {
    console.warn('currentLocation غير معرّف، استخدام القيم الافتراضية');
    window.currentLocation = {
      latitude: 31.9539,
      longitude: 44.3736,
      city: 'النجف'
    };
  }

  const now = new Date();
  const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  
  // تحميل الإعدادات مع القيم الافتراضية
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
    settings = {};
  }

  // استخدام القيم الافتراضية إذا كانت currentLocation غير متاحة
  const lat = currentLocation.latitude || 31.9539;
  const lng = currentLocation.longitude || 44.3736;

  try {
    // الحصول على أوقات الصلاة الحالية
    const times = getPrayerTimes(lat, lng, now, settings.calculationMethod || 'MWL');
    
    // التحقق من صحة الأوقات
    if (!times || typeof times !== 'object') {
      console.warn('أوقات الصلاة غير صالحة');
      return;
    }

    // التحقق من كل صلاة إذا حان وقتها
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    prayers.forEach(prayer => {
      if (shouldPlayAdhan(prayer, settings) && isPrayerTime(times[prayer], currentTime)) {
        console.log(`حان وقت صلاة ${prayer}, تشغيل الأذان`);
        playAdhanSound(settings.selectedSound || 'abdul-basit');
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من أوقات الصلاة:', error);
  }
}

// دالة مساعدة للتحقق إذا حان وقت الصلاة
function isPrayerTime(prayerTime, currentTime) {
  if (!prayerTime || prayerTime === '--:--' || prayerTime === 'Invalid Date') {
    return false;
  }

  try {
    const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

    // التحقق من صحة الأرقام
    if (isNaN(prayerHours) || isNaN(prayerMinutes) || 
        isNaN(currentHours) || isNaN(currentMinutes)) {
      return false;
    }

    return prayerHours === currentHours && prayerMinutes === currentMinutes;
  } catch (error) {
    console.error('خطأ في التحقق من وقت الصلاة:', error);
    return false;
  }
}

// دالة للتحقق إذا كان التشغيل التلقائي مفعل للصلاة
function shouldPlayAdhan(prayer, settings) {
  // إذا لم توجد إعدادات، استخدام القيم الافتراضية (مفعل)
  if (!settings || typeof settings !== 'object') {
    return true;
  }

  switch(prayer) {
    case 'fajr': 
      return settings.playFajrAdhan !== false;
    case 'dhuhr': 
      return settings.playDhuhrAdhan !== false;
    case 'asr': 
      return settings.playAsrAdhan !== false;
    case 'maghrib': 
      return settings.playMaghribAdhan !== false;
    case 'isha': 
      return settings.playIshaAdhan !== false;
    default: 
      return false;
  }
}

// دالة لإيقاف الأذان
function stopAdhan() {
  const adhanPlayer = document.getElementById('adhan-player');
  if (adhanPlayer) {
    adhanPlayer.pause();
    adhanPlayer.currentTime = 0;
    isAdhanPlaying = false;
  }
}

// دالة للتحقق من حالة التشغيل
function getAdhanStatus() {
  return isAdhanPlaying;
}

// تهيئة مدير الصوت
function initAudioManager() {
  console.log('تهيئة مدير الصوت...');
  
  // التحقق من وجود عنصر الصوت
  const adhanPlayer = document.getElementById('adhan-player');
  if (!adhanPlayer) {
    console.error('عنصر تشغيل الصوت غير موجود في الصفحة');
    return;
  }

  // إعداد مستمعي الأحداث للصوت
  adhanPlayer.onended = () => {
    isAdhanPlaying = false;
    console.log('انتهى تشغيل الأذان');
  };

  adhanPlayer.onerror = (error) => {
    isAdhanPlaying = false;
    console.error('حدث خطأ في تشغيل الصوت:', error);
  };

  // بدء المراقبة بعد التأكد من تهيئة الصفحة
  setTimeout(() => {
    setInterval(checkPrayerTimes, 60000); // فحص كل دقيقة
    checkPrayerTimes(); // فحص أولي
  }, 3000); // تأخير 3 ثواني لضمان تحميل الصفحة بالكامل
}

// التهيئة عند تحميل DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAudioManager);
} else {
  // الصفحة محملة بالفعل
  initAudioManager();
}
