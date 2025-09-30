// ---------------- إدارة الأصوات ----------------
const adhanSounds = {
  'aba dhari alhulwaji': 'audio/aba dhari alhulwaji.mp3',
  'shibr maealih': 'audio/shibr maealih.mp3',
  'mustafaa alsaraaf': 'audio/mustafaa alsaraaf.mp3',
  'muhamad altawakhiy': 'audio/muhamad altawakhiy.mp3'
};

// دالة للتحقق إذا كان التشغيل التلقائي مفعل للصلاة
function shouldPlayAdhan(prayer, settings) {
  switch(prayer) {
    case 'fajr': return settings.playFajrAdhan !== false;
    case 'dhuhr': return settings.playDhuhrAdhan !== false;
    case 'asr': return settings.playAsrAdhan !== false;
    case 'maghrib': return settings.playMaghribAdhan !== false;
    case 'isha': return settings.playIshaAdhan !== false;
    default: return false;
  }
}

// ---------------- تشغيل الصوت ----------------
async function playAdhanSound(soundId) {
  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');

  if (!soundUrl) {
    showError('لم يتم العثور على ملف الصوت المحدد');
    return;
  }

  const volumeLevel = 0.7; 
  const fileExists = await checkFileExists(soundUrl);

  if (!fileExists) {
    showError(`ملف الصوت غير موجود: ${soundUrl}`);
    return;
  }

  adhanPlayer.src = soundUrl;
  adhanPlayer.volume = volumeLevel;

  try {
    const promise = adhanPlayer.play();
    if (promise !== undefined) {
      promise.then(() => {
        showNotification('جاري تشغيل الأذان');
      }).catch(error => {
        showError('تعذر تشغيل الأذان.');
        console.error('Error playing adhan:', error);
      });
    }
  } catch (error) {
    console.error('Error playing adhan:', error);
    showNotification('تعذر تشغيل صوت الأذان. يرجى تفعيل الصوت.');
  }
}

// ---------------- التحقق من الملف ----------------
async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file:', error);
    return false;
  }
}

// ---------------- أذونات الصوت ----------------
function checkAudioPermissions() {
  try {
    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAC';

    testAudio.play().then(() => {
      console.log('إذن الصوت مُمنوح');
      testAudio.pause();
      localStorage.setItem('audioPermission', 'granted');
    }).catch(error => {
      console.log('لم يتم منح إذن الصوت:', error);
      localStorage.setItem('audioPermission', 'denied');
    });
  } catch (error) {
    console.error('خطأ في التحقق من أذونات الصوت:', error);
  }
}

// ---------------- التحقق من أوقات الصلاة ----------------
function checkPrayerTimes() {
  const now = new Date();
  const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};

  // الحصول على أوقات الصلاة
  const times = getPrayerTimes(
    currentLocation.latitude || 31.9539, 
    currentLocation.longitude || 44.3736, 
    now,
    settings.calculationMethod || 'MWL'
  );

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  prayers.forEach(prayer => {
    if (shouldPlayAdhan(prayer, settings) && isPrayerTime(times[prayer], currentTime)) {
      playAdhanSound(settings.selectedSound || 'aba dhari alhulwaji');
    }
  });
}

// ---------------- التحقق من الوقت ----------------
// يسمح بفارق حتى دقيقة واحدة
function isPrayerTime(prayerTime, currentTime) {
  const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
  const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

  const prayerTotal = prayerHours * 60 + prayerMinutes;
  const currentTotal = currentHours * 60 + currentMinutes;

  return Math.abs(prayerTotal - currentTotal) <= 1;
}

// ---------------- بدء التشغيل ----------------
document.addEventListener("DOMContentLoaded", () => {
  checkAudioPermissions();
  setInterval(checkPrayerTimes, 60000); // فحص كل دقيقة
  setTimeout(checkPrayerTimes, 3000);   // فحص أولي بعد 3 ثوانٍ
});

// ---------------- دوال إشعار وهمية (بدلًا من أخطاء) ----------------
function showError(msg) { console.error(msg); }
function showNotification(msg) { console.log(msg); }
