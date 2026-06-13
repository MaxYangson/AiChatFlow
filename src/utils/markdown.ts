import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * 自定义渲染器，处理代码块高亮
 */
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  let highlighted: string;
  
  try {
    highlighted = hljs.highlight(text, { language }).value;
  } catch {
    highlighted = text;
  }
  
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

// 配置 marked 选项
marked.setOptions({
  renderer,
  breaks: false,   // 关闭：不再将单个换行符转为<br>，避免与<p>标签叠加导致间距过大
  gfm: true        // GitHub风格Markdown
});

/**
 * 将Markdown文本解析为HTML
 * @param text Markdown格式的文本
 * @returns HTML字符串
 */
export function renderMarkdown(text: string): string {
  try {
    return marked.parse(text) as string;
  } catch {
    // 解析失败时返回转义后的原文
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}
