let activeScroller: "canvas" | "raw" | null = null;
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

export function handleScrollSync(
  source: "canvas" | "raw",
  sourceElement: HTMLElement,
  targetElement: HTMLElement
) {
  if (activeScroller && activeScroller !== source) return;

  activeScroller = source;
  if (scrollTimeout) clearTimeout(scrollTimeout);

  const sourceMaxScroll = sourceElement.scrollHeight - sourceElement.clientHeight;
  const targetMaxScroll = targetElement.scrollHeight - targetElement.clientHeight;

  if (sourceMaxScroll > 0 && targetMaxScroll > 0) {
    const percentage = sourceElement.scrollTop / sourceMaxScroll;
    targetElement.scrollTop = percentage * targetMaxScroll;
  }

  scrollTimeout = setTimeout(() => {
    activeScroller = null;
  }, 100);
}
