import { saveAs } from 'file-saver';

export const buildExportHtml = (title: string, body: string): string =>
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; margin: 0 auto; max-width: 800px; padding: 48px 24px; line-height: 1.6; color: #24292f; }
      code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
      pre { background: #f6f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; }
      pre code { background: none; padding: 0; }
      blockquote { border-left: 4px solid #d0d7de; margin: 0; padding-left: 16px; color: #57606a; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d0d7de; padding: 6px 12px; text-align: left; }
      @media print { body { max-width: none; padding: 0; } }
    </style>
  </head>
  <body>
    <article>${body}</article>
  </body>
</html>`;

export const exportMarkdownFile = (content: string, title: string): void => {
  const safeTitle = title.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'note';
  saveAs(new Blob([content], { type: 'text/markdown' }), `${safeTitle}.md`);
};

export const exportHtmlFile = (title: string, html: string): void => {
  const safeTitle = title.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'note';
  const doc = buildExportHtml(title, html);
  saveAs(new Blob([doc], { type: 'text/html' }), `${safeTitle}.html`);
};

export const exportPdf = (title: string, html: string): void => {
  const doc = buildExportHtml(title, html);
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  };

  document.body.appendChild(iframe);
  iframe.src = url;

  setTimeout(() => {
    iframe.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
};
