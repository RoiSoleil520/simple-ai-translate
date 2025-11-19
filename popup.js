// DOM 元素
const sourceText = document.getElementById('sourceText');
const resultText = document.getElementById('resultText');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const swapBtn = document.getElementById('swapBtn');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const charCount = document.getElementById('charCount');

// 字符计数
sourceText.addEventListener('input', () => {
  const length = sourceText.value.length;
  charCount.textContent = `${length} / 5000`;
  
  if (length > 5000) {
    charCount.style.color = '#f44336';
  } else {
    charCount.style.color = '#999';
  }
});

// 清空输入
clearBtn.addEventListener('click', () => {
  sourceText.value = '';
  resultText.textContent = '';
  charCount.textContent = '0 / 5000';
  sourceText.focus();
});

// 交换语言
swapBtn.addEventListener('click', () => {
  if (sourceLang.value === 'auto') {
    return; // 自动检测不能交换
  }
  
  const tempLang = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tempLang;
  
  const tempText = sourceText.value;
  sourceText.value = resultText.textContent;
  resultText.textContent = tempText;
});

// 翻译按钮
translateBtn.addEventListener('click', async () => {
  const text = sourceText.value.trim();
  
  if (!text) {
    showMessage('请输入要翻译的文本');
    return;
  }
  
  if (text.length > 5000) {
    showMessage('文本长度不能超过 5000 个字符');
    return;
  }
  
  // 显示加载状态
  const originalText = translateBtn.textContent;
  translateBtn.disabled = true;
  translateBtn.textContent = '⏳ 翻译中...';
  resultText.textContent = '正在翻译，请稍候...';
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      from: sourceLang.value,
      to: targetLang.value
    });
    
    if (result.success) {
      resultText.textContent = result.translation;
      
      // 保存翻译历史
      saveHistory(text, result.translation);
    } else {
      resultText.textContent = '翻译失败: ' + (result.error || '未知错误');
    }
  } catch (error) {
    console.error('Translation error:', error);
    resultText.textContent = '翻译失败: ' + error.message;
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = originalText;
  }
});

// 复制译文
copyBtn.addEventListener('click', async () => {
  const text = resultText.textContent;
  
  if (!text || text === '翻译结果将显示在这里...') {
    showMessage('没有内容可复制');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    showMessage('✅ 已复制');
  } catch (error) {
    console.error('Copy error:', error);
    showMessage('❌ 复制失败');
  }
});

// 朗读译文
speakBtn.addEventListener('click', () => {
  const text = resultText.textContent;
  
  if (!text || text === '翻译结果将显示在这里...') {
    showMessage('没有内容可朗读');
    return;
  }
  
  // 停止当前朗读
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLangCode(targetLang.value);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  speechSynthesis.speak(utterance);
  showMessage('🔊 开始朗读');
});

// 回车翻译
sourceText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    translateBtn.click();
  }
});

// 显示消息提示
function showMessage(message) {
  const existingMsg = document.querySelector('.toast-message');
  if (existingMsg) {
    existingMsg.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 10000;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 1500);
}

// 获取语言代码（用于语音朗读）
function getLangCode(lang) {
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
  return langMap[lang] || 'en-US';
}

// 保存翻译历史
function saveHistory(source, translation) {
  chrome.storage.local.get(['history'], (result) => {
    const history = result.history || [];
    history.unshift({
      source,
      translation,
      timestamp: Date.now()
    });
    
    // 只保留最近 50 条
    if (history.length > 50) {
      history.length = 50;
    }
    
    chrome.storage.local.set({ history });
  });
}


// 页面加载时自动聚焦输入框
sourceText.focus();

