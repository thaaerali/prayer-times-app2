class NahjLetters {
  
    constructor(baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/') {
        this.baseURL = baseURL;
        this.lettersIndexURL = this.baseURL + 'letters/letters-index.json';
        this.currentLetter = null;
        this.lettersIndex = [];
        this.currentLetterId = 1;
        this.totalLetters = 79;

        // عناصر DOM الخاصة بالرسائل
        this.elements = {
            lettersContent: null,
            lettersNav: null,
            letterContainer: null
        };
    }

    async init(containerId = 'nahj-content') {
        try {
            console.log('📜 جاري تهيئة قسم الرسائل...');
            await this.loadLettersIndex();

            if (containerId) {
                this.setupContainer(containerId);
            }

            return this;

        } catch (error) {
            console.error('❌ خطأ في تهيئة قسم الرسائل:', error);
            return this;
        }
    }

    async loadLettersIndex() {
        try {
            console.log('📋 جاري تحميل فهرس الرسائل...');

            const response = await fetch(this.lettersIndexURL);

            if (!response.ok) {
                console.log('⚠️ فهرس الرسائل غير موجود على Netlify، إنشاء فهرس افتراضي...');
                this.createDefaultIndex();
                return this.lettersIndex;
            }

            const data = await response.json();
            this.lettersIndex = data.letters_index || [];
            this.totalLetters = this.lettersIndex.length;

            console.log(`✅ تم تحميل فهرس الرسائل: ${this.totalLetters} رسالة`);
            return this.lettersIndex;

        } catch (error) {
            console.error('❌ خطأ في تحميل فهرس الرسائل:', error);
            this.createDefaultIndex();
            return this.lettersIndex;
        }
    }

    // باقي الكود يبقى كما هو مع تغيير fetch الرسائل إلى baseURL الجديد
    async loadLetter(letterId) {
        try {
            console.log(`📥 جاري تحميل الرسالة ${letterId}...`);

            const letterInfo = this.lettersIndex.find(l => l.id === letterId);
            if (!letterInfo) {
                throw new Error(`الرسالة ${letterId} غير موجودة في الفهرس`);
            }

            if (letterInfo.has_content !== false) {
                // استخدام رابط Netlify بدل GitHub
                const letterURL = this.baseURL + letterInfo.file;
                const response = await fetch(letterURL);

                if (response.ok) {
                    this.currentLetter = await response.json();
                    this.currentLetterId = letterId;
                    console.log(`✅ تم تحميل الرسالة: ${this.currentLetter.metadata.title}`);
                    return this.currentLetter;
                }
            }

            console.log(`⚠️ ملف الرسالة ${letterId} غير موجود على Netlify، إنشاء محتوى افتراضي...`);
            this.createDefaultLetter(letterId, letterInfo);

            return this.currentLetter;

        } catch (error) {
            console.error(`❌ خطأ في تحميل الرسالة ${letterId}:`, error);
            this.createDefaultLetter(letterId);
            return this.currentLetter;
        }
    }

    createDefaultIndex() {
        this.lettersIndex = [
            { id: 1, file: 'letters/letter-001.json', title: 'الرسالة الأولى', has_content: true },
            { id: 2, file: 'letters/letter-002.json', title: 'الرسالة الثانية', has_content: false },
            { id: 3, file: 'letters/letter-003.json', title: 'الرسالة الثالثة', has_content: false },
            { id: 4, file: 'letters/letter-004.json', title: 'العهد إلى مالك الأشتر', has_content: false }
        ];
        this.totalLetters = this.lettersIndex.length;
        console.log(`✅ تم إنشاء فهرس افتراضي: ${this.totalLetters} رسالة`);
    }

    // باقي الكود (createDefaultLetter, setupContainer, renderCurrentLetter, renderLetter, renderSection...) يبقى كما هو
}

// تصدير الكلاس للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.NahjLetters = NahjLetters;
    console.log('✅ NahjLetters جاهز للاستخدام مع Netlify');
}




