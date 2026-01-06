// ============================================
// ملف JavaScript مستقل للفوتر الذكي - Smart Footer
// إصدار: 1.0.0
// تاريخ: 2024
// مطور: AzkaMothol
// 
// متطلبات:
// 1. ملف CSS: smart-footer.css
// 2. عنصر HTML: <footer id="main-footer">
// 
// مميزات:
// - لا يعتمد على مكتبات خارجية
// - يظهر ويختفي الفوتر عند الحاجة
// - يدعم اللمس والماوس
// - يحفظ تفضيلات المستخدم
// - يدعم اختصارات لوحة المفاتيح
// ============================================

(function() {
    'use strict';
    
    // ============================================
    // كائن الفوتر الذكي الرئيسي
    // ============================================
    const SmartFooter = {
        // إعدادات افتراضية
        config: {
            autoHideDelay: 3000,     // تأخير الإخفاء التلقائي (3 ثواني)
            showOnHover: true,       // إظهار عند التمرير فوق
            showOnTouch: true,       // إظهار عند اللمس
            savePreference: true,    // حفظ تفضيلات المستخدم
            animationSpeed: 400,     // سرعة التحريك
            scrollThreshold: 100,    // المسافة من الأسفل لإظهار الفوتر
            hoverDelay: 1000         // تأخير الإخفاء بعد مغادرة الماوس
        },
        
        // حالة النظام
        state: {
            isVisible: false,
            isHovered: false,
            timeoutId: null,
            userPreference: null,    // null=تلقائي, true=دائم الإظهار, false=دائم الإخفاء
            isMobile: false
        },
        
        // العناصر
        elements: {
            footer: null,
            toggleBtn: null,
            activationArea: null
        },
        
        // ============================================
        // التهيئة الرئيسية
        // ============================================
        init: function(options) {
            console.log('🚀 تهيئة الفوتر الذكي...');
            
            // دمج الإعدادات المخصصة
            if (options) {
                this.config = { ...this.config, ...options };
            }
            
            // الكشف عن الجهاز
            this.state.isMobile = this.isMobileDevice();
            
            // إعداد العناصر
            this.setupElements();
            
            // إذا لم يتم العثور على الفوتر، نخرج
            if (!this.elements.footer) {
                console.error('❌ لم يتم العثور على عنصر الفوتر (#main-footer)');
                console.info('💡 تأكد من وجود: <footer id="main-footer">...</footer>');
                return;
            }
            
            // تحميل تفضيلات المستخدم
            this.loadUserPreference();
            
            // إنشاء العناصر المطلوبة
            this.createRequiredElements();
            
            // إعداد الأحداث
            this.setupEventListeners();
            
            // التهيئة الأولية
            this.initialSetup();
            
            console.log('✅ الفوتر الذكي جاهز للاستخدام');
            console.log('📱 الجهاز: ' + (this.state.isMobile ? 'محمول' : 'سطح مكتب'));
            console.log('⚙️  الإعدادات:', this.config);
            
            return this;
        },
        
        // ============================================
        // دوال المساعدة
        // ============================================
        
        // الكشف عن الجهاز المحمول
        isMobileDevice: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // إنشاء عنصر
        createElement: function(tag, className, id, innerHTML) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (id) element.id = id;
            if (innerHTML) element.innerHTML = innerHTML;
            return element;
        },
        
        // إضافة أيقونة Font Awesome (إذا لم تكن موجودة)
        getIcon: function(type) {
            const icons = {
                up: '↑',
                down: '↓',
                eye: '👁️',
                eyeSlash: '🔒',
                chevronUp: '⬆️',
                chevronDown: '⬇️'
            };
            
            // محاولة استخدام Font Awesome إذا كان موجودًا
            if (typeof FontAwesome !== 'undefined' || document.querySelector('link[href*="font-awesome"]')) {
                const faIcons = {
                    up: '<i class="fas fa-chevron-up"></i>',
                    down: '<i class="fas fa-chevron-down"></i>',
                    eye: '<i class="fas fa-eye"></i>',
                    eyeSlash: '<i class="fas fa-eye-slash"></i>'
                };
                return faIcons[type] || icons[type];
            }
            
            // استخدام الرموز الأساسية
            return icons[type] || '⬆️';
        },
        
        // ============================================
        // إدارة العناصر
        // ============================================
        
        // إعداد العناصر الموجودة
        setupElements: function() {
            this.elements.footer = document.getElementById('main-footer');
            this.elements.toggleBtn = document.getElementById('footer-toggle');
            this.elements.activationArea = document.getElementById('footer-activation-area');
        },
        
        // إنشاء العناصر المطلوبة
        createRequiredElements: function() {
            // زر التحكم
            if (!this.elements.toggleBtn) {
                this.elements.toggleBtn = this.createElement(
                    'button',
                    'footer-toggle-btn',
                    'footer-toggle',
                    this.getIcon('chevronUp')
                );
                this.elements.toggleBtn.title = 'إظهار/إخفاء الفوتر';
                this.elements.toggleBtn.setAttribute('aria-label', 'إظهار/إخفاء الفوتر');
                document.body.appendChild(this.elements.toggleBtn);
            }
            
            // منطقة التنشيط
            if (!this.elements.activationArea) {
                this.elements.activationArea = this.createElement(
                    'div',
                    'footer-activation-area',
                    'footer-activation-area'
                );
                this.elements.activationArea.title = 'مرر أو انقر لإظهار الفوتر';
                document.body.appendChild(this.elements.activationArea);
            }
        },
        
        // ============================================
        // إدارة التفضيلات
        // ============================================
        
        // تحميل تفضيلات المستخدم
        loadUserPreference: function() {
            if (this.config.savePreference) {
                try {
                    const preference = localStorage.getItem('smartFooterPreference');
                    if (preference !== null) {
                        this.state.userPreference = JSON.parse(preference);
                    }
                } catch (e) {
                    console.warn('⚠️ تعذر تحميل تفضيلات الفوتر:', e);
                    this.state.userPreference = null;
                }
            }
        },
        
        // حفظ تفضيلات المستخدم
        saveUserPreference: function(preference) {
            if (this.config.savePreference) {
                try {
                    this.state.userPreference = preference;
                    localStorage.setItem('smartFooterPreference', JSON.stringify(preference));
                } catch (e) {
                    console.warn('⚠️ تعذر حفظ تفضيلات الفوتر:', e);
                }
            }
        },
        
        // ============================================
        // التحكم في الفوتر
        // ============================================
        
        // إظهار الفوتر
        showFooter: function() {
            if (!this.elements.footer) return;
            
            clearTimeout(this.state.timeoutId);
            this.state.isVisible = true;
            
            this.elements.footer.classList.remove('hidden');
            this.elements.footer.classList.add('visible');
            this.elements.toggleBtn.classList.add('active');
            document.body.classList.add('footer-active');
            
            // تحديث الأيقونة
            this.updateToggleIcon();
        },
        
        // إخفاء الفوتر
        hideFooter: function() {
            if (!this.elements.footer) return;
            
            this.state.isVisible = false;
            
            this.elements.footer.classList.remove('visible');
            this.elements.footer.classList.add('hidden');
            this.elements.toggleBtn.classList.remove('active');
            document.body.classList.remove('footer-active');
            
            // تحديث الأيقونة
            this.updateToggleIcon();
        },
        
        // إظهار الفوتر مؤقتاً
        showFooterTemporarily: function() {
            if (this.state.userPreference === false) return;
            
            this.showFooter();
            
            // إخفاء تلقائي إذا كان الوضع تلقائي
            if (this.state.userPreference === null) {
                clearTimeout(this.state.timeoutId);
                this.state.timeoutId = setTimeout(() => {
                    if (!this.state.isHovered) {
                        this.hideFooter();
                    }
                }, this.config.autoHideDelay);
            }
        },
        
        // تبديل حالة الفوتر
        toggleFooter: function() {
            if (this.state.userPreference === null) {
                // تحويل إلى دائم الإظهار
                this.saveUserPreference(true);
                this.showFooter();
            } else if (this.state.userPreference === true) {
                // تحويل إلى دائم الإخفاء
                this.saveUserPreference(false);
                this.hideFooter();
            } else {
                // تحويل إلى تلقائي
                this.saveUserPreference(null);
                this.hideFooter();
            }
            
            this.updateToggleButton();
        },
        
        // ============================================
        // تحديث العناصر
        // ============================================
        
        // تحديث زر التحكم
        updateToggleButton: function() {
            if (!this.elements.toggleBtn) return;
            
            let title, tooltip;
            
            if (this.state.userPreference === null) {
                title = 'الفوتر: تلقائي';
                tooltip = 'يظهر عند الحاجة ويختفي تلقائياً';
            } else if (this.state.userPreference === true) {
                title = 'الفوتر: دائم الإظهار';
                tooltip = 'الفوتر ظاهر دائماً';
            } else {
                title = 'الفوتر: دائماً مخفي';
                tooltip = 'الفوتر مخفي، انقر لإظهاره';
            }
            
            this.elements.toggleBtn.title = title;
            this.elements.toggleBtn.setAttribute('aria-label', title);
            
            // تحديث tooltip إذا كان Bootstrap موجودًا
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const tooltipInstance = bootstrap.Tooltip.getInstance(this.elements.toggleBtn);
                if (tooltipInstance) {
                    tooltipInstance.setContent({ '.tooltip-inner': tooltip });
                }
            }
        },
        
        // تحديث الأيقونة
        updateToggleIcon: function() {
            if (!this.elements.toggleBtn) return;
            
            let icon;
            if (this.state.userPreference === null) {
                icon = this.state.isVisible ? 'chevronDown' : 'chevronUp';
            } else if (this.state.userPreference === true) {
                icon = 'eye';
            } else {
                icon = 'eyeSlash';
            }
            
            this.elements.toggleBtn.innerHTML = this.getIcon(icon);
        },
        
        // ============================================
        // معالجة الأحداث
        // ============================================
        
        // إعداد مستمعي الأحداث
        setupEventListeners: function() {
            // زر التحكم
            if (this.elements.toggleBtn) {
                this.elements.toggleBtn.addEventListener('click', () => this.toggleFooter());
            }
            
            // الفوتر نفسه
            if (this.elements.footer) {
                if (this.config.showOnHover) {
                    this.elements.footer.addEventListener('mouseenter', () => {
                        this.state.isHovered = true;
                        if (this.state.userPreference === null) {
                            clearTimeout(this.state.timeoutId);
                            this.showFooter();
                        }
                    });
                    
                    this.elements.footer.addEventListener('mouseleave', () => {
                        this.state.isHovered = false;
                        if (this.state.userPreference === null) {
                            this.state.timeoutId = setTimeout(() => {
                                this.hideFooter();
                            }, this.config.hoverDelay);
                        }
                    });
                }
            }
            
            // منطقة التنشيط
            if (this.elements.activationArea) {
                if (this.config.showOnHover) {
                    this.elements.activationArea.addEventListener('mouseenter', () => {
                        this.showFooterTemporarily();
                    });
                }
                
                if (this.config.showOnTouch && this.state.isMobile) {
                    this.elements.activationArea.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.showFooterTemporarily();
                    });
                    
                    this.elements.activationArea.addEventListener('click', () => {
                        this.showFooterTemporarily();
                    });
                }
            }
            
            // التمرير
            window.addEventListener('scroll', () => this.handleScroll());
            
            // تغيير الحجم
            window.addEventListener('resize', () => this.handleResize());
            
            // لوحة المفاتيح
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
            
            // لمس الشاشة (للأجهزة المحمولة)
            if (this.state.isMobile) {
                document.addEventListener('touchstart', (e) => this.handleTouch(e));
            }
        },
        
        // معالجة التمرير
        handleScroll: function() {
            if (this.state.userPreference !== null) return;
            
            const scrollPosition = window.scrollY + window.innerHeight;
            const pageHeight = document.body.scrollHeight;
            
            // إظهار الفوتر عند الاقتراب من الأسفل
            if (scrollPosition >= pageHeight - this.config.scrollThreshold) {
                this.showFooterTemporarily();
            }
            
            // إخفاء الفوتر عند التمرير للأعلى
            if (window.scrollY < 100 && this.state.isVisible && !this.state.isHovered) {
                this.hideFooter();
            }
        },
        
        // معالجة تغيير الحجم
        handleResize: function() {
            // تحديث حالة الجهاز
            this.state.isMobile = this.isMobileDevice();
            
            // إخفاء الفوتر على الشاشات الكبيرة في الوضع التلقائي
            if (window.innerWidth > 768 && this.state.userPreference === null && this.state.isVisible) {
                this.hideFooter();
            }
        },
        
        // معالجة ضغطات المفاتيح
        handleKeyPress: function(e) {
            // Ctrl/Cmd + F لتبديل الفوتر
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.toggleFooter();
            }
            
            // Escape لإخفاء الفوتر في الوضع التلقائي
            if (e.key === 'Escape' && this.state.isVisible && this.state.userPreference === null) {
                this.hideFooter();
            }
        },
        
        // معالجة اللمس
        handleTouch: function(e) {
            // إظهار الفوتر عند اللمس في الجزء السفلي من الشاشة
            const touchY = e.touches[0].clientY;
            const screenHeight = window.innerHeight;
            
            if (touchY > screenHeight - 100) {
                this.showFooterTemporarily();
            }
        },
        
        // ============================================
        // التهيئة الأولية
        // ============================================
        
        initialSetup: function() {
            // إضافة كلاسات CSS
            this.elements.footer.classList.add('hidden');
            
            // تحديث زر التحكم
            this.updateToggleButton();
            this.updateToggleIcon();
            
            // إخفاء الفوتر في البداية
            this.hideFooter();
            
            // إظهار رسالة ترحيب في وحدة التحكم
            console.log('👋 مرحباً! الفوتر الذكي جاهز للاستخدام.');
            console.log('🎮 اختصارات لوحة المفاتيح:');
            console.log('   Ctrl/Cmd + F: تبديل حالة الفوتر');
            console.log('   Escape: إخفاء الفوتر (في الوضع التلقائي)');
        },
        
        // ============================================
        // واجهة برمجة التطبيقات العامة (API)
        // ============================================
        
        // إظهار الفوتر يدويًا
        show: function() {
            this.showFooter();
            return this;
        },
        
        // إخفاء الفوتر يدويًا
        hide: function() {
            this.hideFooter();
            return this;
        },
        
        // تبديل حالة الفوتر يدويًا
        toggle: function() {
            this.toggleFooter();
            return this;
        },
        
        // تغيير الإعدادات
        setConfig: function(newConfig) {
            this.config = { ...this.config, ...newConfig };
            return this;
        },
        
        // الحصول على الحالة الحالية
        getStatus: function() {
            return {
                visible: this.state.isVisible,
                preference: this.state.userPreference,
                isMobile: this.state.isMobile,
                config: this.config
            };
        },
        
        // إعادة التعيين
        reset: function() {
            this.saveUserPreference(null);
            this.hideFooter();
            this.updateToggleButton();
            console.log('🔄 تم إعادة تعيين الفوتر الذكي');
            return this;
        },
        
        // التدمير (إزالة الفوتر الذكي)
        destroy: function() {
            // إزالة الأحداث
            if (this.elements.toggleBtn) {
                this.elements.toggleBtn.remove();
            }
            
            if (this.elements.activationArea) {
                this.elements.activationArea.remove();
            }
            
            // إزالة كلاسات CSS
            if (this.elements.footer) {
                this.elements.footer.classList.remove('hidden', 'visible');
                document.body.classList.remove('footer-active');
            }
            
            // إزالة الـ CSS المضافة
            const style = document.getElementById('smart-footer-styles');
            if (style) style.remove();
            
            // إزالة الكائن من النطاق العام
            delete window.SmartFooter;
            
            console.log('🗑️ تم إزالة الفوتر الذكي');
        }
    };
    
    // ============================================
    // التهيئة التلقائية
    // ============================================
    
    // الانتظار حتى تحميل DOM
    function initialize() {
        // التحقق مما إذا كان هناك ملف CSS
        const hasCSS = document.querySelector('link[href*="smart-footer"]') || 
                      document.querySelector('style[id*="smart-footer"]');
        
        if (!hasCSS) {
            console.warn('⚠️ لم يتم العثور على ملف CSS للفوتر الذكي');
            console.info('💡 الرجاء إضافة: <link rel="stylesheet" href="smart-footer.css">');
        }
        
        // تهيئة الفوتر الذكي
        window.SmartFooter = SmartFooter.init();
    }
    
    // بدء التشغيل عند جاهزية DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();