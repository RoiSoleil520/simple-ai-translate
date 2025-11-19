// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text, request.from || 'auto', request.to || 'en')
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  }
});

// 简单的语言检测
function detectLanguage(text) {
  // 检测中文字符
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return 'zh';
  }
  // 检测日文字符
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return 'ja';
  }
  // 检测韩文字符
  if (/[\uac00-\ud7af]/.test(text)) {
    return 'ko';
  }
  // 检测俄文字符
  if (/[\u0400-\u04ff]/.test(text)) {
    return 'ru';
  }
  // 检测阿拉伯字符
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar';
  }
  // 默认假设是英文
  return 'en';
}

// 翻译函数
async function translateText(text, fromLang = 'auto', toLang = 'en') {
  try {
    // 如果是自动检测，先检测语言
    const detectedLang = fromLang === 'auto' ? detectLanguage(text) : fromLang;
    
    // 使用多个翻译 API，按优先级尝试
    const translators = [
      translateWithGoogleMirror,  // Google 支持 auto，优先使用
      translateWithLibreTranslate,
      translateWithMyMemory
    ];

    let lastError = null;
    for (const translator of translators) {
      try {
        // 对于不支持 auto 的 API，使用检测到的语言
        const sourceLang = translator === translateWithMyMemory ? detectedLang : fromLang;
        const result = await translator(text, sourceLang, toLang);
        if (result) {
          return { success: true, translation: result };
        }
      } catch (error) {
        console.error('Translator failed:', error);
        lastError = error;
        continue; // 尝试下一个翻译服务
      }
    }

    throw new Error(lastError?.message || '所有翻译服务都失败了');
  } catch (error) {
    console.error('Translation error:', error);
    return { success: false, error: error.message };
  }
}

// 使用 Microsoft Translator（通过公开接口）
async function translateWithMicrosoft(text, fromLang, toLang) {
  try {
    const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';
    const params = new URLSearchParams({
      'from': fromLang === 'auto' ? '' : fromLang,
      'to': toLang
    });

    // 注意：这需要 API key，这里提供一个简化版本
    // 实际使用时需要用户自己配置 API key
    throw new Error('Microsoft Translator requires API key');
  } catch (error) {
    throw error;
  }
}

// 使用 LibreTranslate（开源免费翻译 API）
async function translateWithLibreTranslate(text, fromLang, toLang) {
  try {
    const url = 'https://libretranslate.com/translate';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang === 'auto' ? 'auto' : fromLang,
        target: toLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error('LibreTranslate API error');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    throw error;
  }
}

// 使用 MyMemory Translation API（免费，但有限制）
async function translateWithMyMemory(text, fromLang, toLang) {
  try {
    // MyMemory 不支持 'auto'，必须传入具体语言
    if (fromLang === 'auto') {
      fromLang = detectLanguage(text);
    }

    // MyMemory 支持的语言代码转换
    const langMap = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'ru': 'ru-RU'
    };

    const sourceLang = langMap[fromLang] || fromLang;
    const targetLang = langMap[toLang] || toLang;
    
    // 不再使用 'auto'，必须传入具体的语言对
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('MyMemory API 请求失败');
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    } else {
      throw new Error(data.responseDetails || 'MyMemory 翻译失败');
    }
  } catch (error) {
    console.error('MyMemory error:', error);
    throw error;
  }
}

// 使用简单的 Google Translate 镜像（非官方）
async function translateWithGoogleMirror(text, fromLang, toLang) {
  try {
    // Google Translate 支持 auto
    const sourceLang = fromLang === 'auto' ? 'auto' : fromLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Google Translate API 请求失败');
    }

    const data = await response.json();
    
    // 解析 Google Translate 的响应格式
    if (data && data[0]) {
      const translation = data[0].map(item => item[0]).filter(Boolean).join('');
      if (translation) {
        return translation;
      }
    }
    throw new Error('Google Translate 响应格式无效');
  } catch (error) {
    console.error('Google Translate error:', error);
    throw error;
  }
}

console.log('Simple AI Translate: Background script loaded');

