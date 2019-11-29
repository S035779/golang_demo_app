export function announcePageTitle() {
  const el = document.getElementById('announcer');
  // タイトル用の文字列は都合の良い方法で参照すればよい
  const tEl = document.querySelector('[data-page-title]');
  const value = tEl && tEl.value ? tEl.value : null;
  const textContent = tEl && tEl.textContent ? tEl.textContent : null;
  const title = value || textContent || 'SPA Note';
  document.title = title;
  el.textContent = `ページ「${title}」を開きました`;
}
