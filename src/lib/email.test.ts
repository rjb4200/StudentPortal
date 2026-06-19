import { describe, it, expect } from 'vitest';
import { escHtml } from '@/lib/esc-html';

describe('escHtml', () => {
  it('escapes ampersand', () => {
    expect(escHtml('A & B')).toBe('A &amp; B');
  });

  it('escapes less-than', () => {
    expect(escHtml('a < b')).toBe('a &lt; b');
  });

  it('escapes greater-than', () => {
    expect(escHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quote', () => {
    expect(escHtml('he said "hello"')).toBe('he said &quot;hello&quot;');
  });

  it('escapes single quote', () => {
    expect(escHtml("O'Brien")).toBe('O&#39;Brien');
  });

  it('escapes all special characters together', () => {
    expect(escHtml(`<script>alert("xss") & 'hack'</script>`)).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#39;hack&#39;&lt;/script&gt;'
    );
  });

  it('returns empty string for empty input', () => {
    expect(escHtml('')).toBe('');
  });

  it('leaves already-escaped text unchanged (double-escaping prevention)', () => {
    const input = '&lt;script&gt;';
    expect(escHtml(input)).toBe('&amp;lt;script&amp;gt;');
  });

  it('leaves normal text unchanged', () => {
    expect(escHtml('John Smith')).toBe('John Smith');
    expect(escHtml('test@example.com')).toBe('test@example.com');
  });

  it('handles Unicode characters', () => {
    expect(escHtml('José Muñoz')).toBe('José Muñoz');
    expect(escHtml('日本')).toBe('日本');
  });

  it('handles only special chars (no normal text)', () => {
    expect(escHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#39;');
  });
});
