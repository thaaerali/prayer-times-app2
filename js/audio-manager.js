// إدارة الأصوات والتشغيل التلقائي - النسخة المحسنة
const adhanSounds = {
  'aba dhari alhulwaji': 'audio/aba-dhari-alhulwaji.mp3',
  'shibr maealih': 'audio/shibr-maealih.mp3',
  'mustafaa alsaraaf': 'audio/mustafaa-alsaraaf.mp3',
  'muhamad altawakhiy': 'audio/muhamad-altawakhiy.mp3'
};

// دالة مساعدة للتحقق من وقت الصلاة (إذا كانت مفقودة)
function isPrayerTime(prayerTime, currentTime) {
  if (!prayerTime) return false;
  
  const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
  const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
  
  const prayerTotalMinutes = prayerHours * 60 + prayerMinutes;
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  // التحقق إذا كان الوقت الحالي ضمن دقيقتين من وقت الصلاة
  return Math.abs(currentTotalMinutes - prayerTotalMinutes) <= 2;
}

async function playAdhanSound(soundId) {
  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');

  if (!adhanPlayer) {
    console.error('عنصر المشغل الصوتي غير موجود في DOM');
    return;
  }

  if (!soundUrl) {
    showError('لم يتم العثور على ملف الصوت المحدد');
    return;
  }

  const volumeLevel = 0.7;

  try {
    // إيقاف أي تشغيل سابق
    adhanPlayer.pause();
    adhanPlayer.currentTime = 0;

    // تعيين المصدر والحجم
    adhanPlayer.src = soundUrl;
    adhanPlayer.volume = volumeLevel;

    // محاولة التشغيل
    await adhanPlayer.play();
    showNotification('جاري تشغيل الأذان');
    
    // تسجيل التشغيل الناجح
    console.log('تم تشغيل الأذان بنجاح:', soundId);
    
  } catch (error) {
    console.error('خطأ في تشغيل الأذان:', error);
    showError('تعذر تشغيل الأذان. يرجى تفعيل الصوت.');
  }
}

// دالة محسنة للتحقق من أوقات الصلاة
function checkPrayerTimes() {
  const now = new Date();
  const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

  console.log('التحقق من أوقات الصلاة:', currentTime);

  const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
  const prayerSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};

  // الحصول على أوقات الصلاة
  const times = getPrayerTimes(
    currentLocation.latitude || 31.9539, 
    currentLocation.longitude || 44.3736, 
    now,
    prayerSettings.calculationMethod || 'MWL'
  );

  console.log('أوقات الصلاة اليوم:', times);

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  prayers.forEach(prayer => {
    if (shouldPlayAdhan(prayer, soundSettings) && isPrayerTime(times[prayer], currentTime)) {
      console.log(`حان وقت ${prayer} - تشغيل الأذان`);
      playAdhanSound(soundSettings.selectedSound || 'aba dhari alhulwaji');
    }
  });
}

// إضافة تصحيح الأخطاء
function debugAudioSystem() {
  console.log('فحص نظام الصوت:');
  console.log('المستخدم:', navigator.userAgent);
  console.log('إعدادات الصوت:', JSON.parse(localStorage.getItem('soundSettings')));
  console.log('إعدادات الصلاة:', JSON.parse(localStorage.getItem('prayerSettings')));
  
  // اختبار تشغيل صوت مباشر
  const testAudio = new Audio();
  testAudio.volume = 0.1;
  testAudio.play().then(() => {
    console.log('نظام الصوت يعمل بشكل طبيعي');
    testAudio.pause();
  }).catch(error => {
    console.error('مشكلة في نظام الصوت:', error);
  });
}

// تحسين التهيئة
document.addEventListener("DOMContentLoaded", () => {
  console.log('تهيئة نظام الأذان...');
  
  // فحص النظام
  debugAudioSystem();
  
  // بدء المراقبة
  setInterval(checkPrayerTimes, 60000);
  
  // فحص أولي فوري
  checkPrayerTimes();
  
  console.log('نظام الأذان جاهز للمراقبة');
});