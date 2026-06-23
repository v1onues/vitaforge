'use client';

import { useRouter } from 'next/navigation';

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });

  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');

  html = html.replace(/\[\[(.+?)\]\]/g, '<a href="#" data-wikilink="$1" class="wikilink text-primary underline decoration-dotted hover:decoration-solid cursor-pointer">$1</a>');

  return html;
}

export function MarkdownRenderer({ content }: { content: string }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-wikilink]');
    if (target) {
      e.preventDefault();
      const title = target.getAttribute('data-wikilink');
      if (title) {
        router.push(`/notes?search=${encodeURIComponent(title)}`);
      }
    }
  };

  return (
    <div
      className="markdown-content prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      onClick={handleClick}
    />
  );
}
