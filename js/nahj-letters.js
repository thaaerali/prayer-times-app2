// nahj-letters.js - معالجة الرسائل فقط
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
            // ... إلخ
        };
    }
    
    async init() {
        await this.loadLettersIndex();
        this.setupLettersUI();
        return this;
    }
    
    async loadLettersIndex() {
        try {
            const response = await fetch(this.lettersIndexURL);
            if (!response.ok) throw new Error(`فهرس الرسائل: ${response.status}`);
            
            const data = await response.json();
            this.lettersIndex = data.letters_index || [];
            this.totalLetters = this.lettersIndex.length;
            
            console.log(`✅ فهرس الرسائل: ${this.totalLetters} رسالة`);
            return this.lettersIndex;
            
        } catch (error) {
            console.error('❌ خطأ في فهرس الرسائل:', error);
            return [];
        }
    }
    
    async loadLetter(letterId) {
        try {
            const letterInfo = this.lettersIndex.find(l => l.id === letterId);
            if (!letterInfo) throw new Error(`الرسالة ${letterId} غير موجودة`);
            
            const letterURL = this.baseURL + letterInfo.file;
            const response = await fetch(letterURL);
            
            if (!response.ok) throw new Error(`الرسالة ${letterId}: ${response.status}`);
            
            this.currentLetter = await response.json();
            this.currentLetterId = letterId;
            
            console.log(`📜 الرسالة ${letterId}: ${this.currentLetter.metadata.title}`);
            return this.currentLetter;
            
        } catch (error) {
            console.error(`❌ خطأ في الرسالة ${letterId}:`, error);
            return null;
        }
    }
    
    renderLetter(letterData) {
        if (!letterData) return '<div class="alert alert-danger">تعذر تحميل الرسالة</div>';
        
        return `
            <div class="letter-container">
                <!-- رأس الرسالة -->
                <div class="letter-header">
                    <h3>${letterData.metadata.title}</h3>
                    <p class="text-muted">إلى: ${letterData.content.recipient || 'غير محدد'}</p>
                </div>
                
                <!-- محتوى الرسالة -->
                <div class="letter-content">
                    ${letterData.content.sections.map(section => this.renderSection(section)).join('')}
                </div>
                
                <!-- معلومات الرسالة -->
                <div class="letter-footer">
                    <small class="text-muted">
                        الصفحات: ${letterData.metadata.page_start} - ${letterData.metadata.page_end}
                    </small>
                </div>
            </div>
        `;
    }
    
    renderSection(section) {
        return `
            <div class="letter-section">
                <p>${section.text}</p>
                ${section.footnotes && section.footnotes.length > 0 ? `
                    <div class="section-footnotes">
                        <button class="btn btn-sm btn-outline-secondary" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#footnotes-${section.id}">
                            <i class="bi bi-chat-left-quote"></i> ${section.footnotes.length} حاشية
                        </button>
                        <div class="collapse" id="footnotes-${section.id}">
                            ${section.footnotes.map(fn => `
                                <div class="footnote">
                                    <sup>${fn.id}</sup> ${fn.text}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ... باقي الدوال الخاصة بالرسائل
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NahjLetters;
}