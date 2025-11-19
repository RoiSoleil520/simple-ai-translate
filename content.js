// 划词翻译功能
let translateButton = null;
let translationBubble = null;
let selectedText = '';
let selectedLang = 'zh'; // 默认翻译成中文

// 创建翻译按钮（带语言选择）
function createTranslateButton() {
  if (translateButton) {
    return translateButton;
  }

  const container = document.createElement('div');
  container.id = 'simple-translate-btn';
  container.className = 'simple-translate-btn';
  container.style.display = 'none';
  
  container.innerHTML = `
    <select class="translate-lang-select" id="translateLangSelect">
      <option value="zh">中文</option>
      <option value="en">英语</option>
      <option value="ja">日语</option>
      <option value="ko">韩语</option>
      <option value="fr">法语</option>
      <option value="de">德语</option>
      <option value="es">西班牙语</option>
      <option value="ru">俄语</option>
    </select>
    <button class="translate-action-btn">翻译</button>
  `;
  
  document.body.appendChild(container);
  
  // 语言选择器
  const langSelect = container.querySelector('.translate-lang-select');
  langSelect.addEventListener('change', (e) => {
    e.stopPropagation();
    selectedLang = e.target.value;
  });
  
  // 点击翻译按钮
  const actionBtn = container.querySelector('.translate-action-btn');
  actionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (selectedText) {
      showTranslationResult();
      translateText(selectedText, selectedLang);
    }
  });

  translateButton = container;
  return container;
}

// 创建翻译结果气泡
function createTranslationBubble() {
  if (translationBubble) {
    return translationBubble;
  }

  const bubble = document.createElement('div');
  bubble.id = 'simple-translate-bubble';
  bubble.className = 'simple-translate-bubble';
  bubble.style.display = 'none';
  
  bubble.innerHTML = `
    <div class="translate-header">
      <span class="translate-text"></span>
      <button class="translate-close">×</button>
    </div>
    <div class="translate-result">正在翻译...</div>
  `;

  document.body.appendChild(bubble);
  
  // 关闭按钮
  bubble.querySelector('.translate-close').addEventListener('click', () => {
    hideBubble();
  });

  translationBubble = bubble;
  return bubble;
}

// 显示翻译按钮
function showTranslateButton(x, y, text) {
  const button = createTranslateButton();
  selectedText = text;
  
  // 智能判断默认语言：中文翻译成英文，其他翻译成中文
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  selectedLang = isChinese ? 'en' : 'zh';
  
  // 更新选择器的值
  const langSelect = button.querySelector('.translate-lang-select');
  if (langSelect) {
    langSelect.value = selectedLang;
  }
  
  button.style.display = 'flex';
  button.style.left = x + 'px';
  button.style.top = y + 'px';

  // 确保按钮不超出屏幕
  setTimeout(() => {
    const rect = button.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      button.style.left = (window.innerWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      button.style.top = (y - rect.height - 10) + 'px';
    }
  }, 0);
}

// 显示翻译结果
function showTranslationResult() {
  const button = document.getElementById('simple-translate-btn');
  const bubble = createTranslationBubble();
  const textDiv = bubble.querySelector('.translate-text');
  const resultDiv = bubble.querySelector('.translate-result');

  // 设置文本
  textDiv.textContent = selectedText;
  resultDiv.textContent = '正在翻译...';

  // 隐藏按钮，显示结果
  if (button) {
    bubble.style.left = button.style.left;
    bubble.style.top = button.style.top;
    button.style.display = 'none';
  }
  
  bubble.style.display = 'block';

  // 确保气泡不超出屏幕
  setTimeout(() => {
    const rect = bubble.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      bubble.style.left = (window.innerWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > window.innerHeight + window.scrollY) {
      bubble.style.top = (parseInt(bubble.style.top) - rect.height - 40) + 'px';
    }
  }, 0);
}

// 翻译文本
async function translateText(text, targetLang = 'zh') {
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      from: 'auto',
      to: targetLang
    });

    const bubble = document.getElementById('simple-translate-bubble');
    if (bubble) {
      const resultDiv = bubble.querySelector('.translate-result');
      
      if (result.success) {
        resultDiv.textContent = result.translation;
      } else {
        resultDiv.textContent = '翻译失败: ' + (result.error || '未知错误');
      }
    }
  } catch (error) {
    console.error('Translation error:', error);
    const bubble = document.getElementById('simple-translate-bubble');
    if (bubble) {
      const resultDiv = bubble.querySelector('.translate-result');
      resultDiv.textContent = '翻译失败: ' + error.message;
    }
  }
}

// 隐藏所有元素
function hideBubble() {
  const button = document.getElementById('simple-translate-btn');
  const bubble = document.getElementById('simple-translate-bubble');
  if (button) button.style.display = 'none';
  if (bubble) bubble.style.display = 'none';
  selectedText = '';
}

// 监听文本选择
document.addEventListener('mouseup', (e) => {
  // 避免在翻译按钮或气泡内触发
  if (e.target.closest('#simple-translate-btn') || e.target.closest('#simple-translate-bubble')) {
    return;
  }

  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0 && text.length < 1000) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 显示翻译按钮
      showTranslateButton(
        rect.left + rect.width / 2 - 60,
        rect.bottom + window.scrollY + 5,
        text
      );
    } else if (text.length === 0) {
      // 点击其他地方时隐藏
      hideBubble();
    }
  }, 10);
});

// 监听键盘事件（ESC 关闭）
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideBubble();
  }
});

console.log('Simple AI Translate: Content script loaded');

