export default defineNuxtPlugin(() => {
  const stop = (e: Event) => e.preventDefault();

  // iOS pinch gestures
  document.addEventListener("gesturestart", stop);
  document.addEventListener("gesturechange", stop);
  document.addEventListener("gestureend", stop);

  // Pinch with two fingers
  document.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false }
  );

  // Ctrl + mouse wheel and trackpad pinch (desktop)
  document.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    },
    { passive: false }
  );

  // Ctrl +, Ctrl -, Ctrl 0
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.ctrlKey && ["+", "-", "=", "0"].includes(e.key)) e.preventDefault();
  });

  // Double-tap zoom
  let lastTouch = 0;
  document.addEventListener(
    "touchend",
    (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    },
    { passive: false }
  );
});