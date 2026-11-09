// CSS вращает одну статичную картинку и на мобильных браузерах.
const recordToggle = document.querySelector(".record-art__toggle");
const recordArt = document.querySelector(".record-art");
if (recordToggle && recordArt) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const setPaused = (paused, userInitiated = false) => {
    recordArt.classList.toggle("is-paused", paused);
    recordArt.classList.toggle("is-playing", !paused && userInitiated);
    recordToggle.setAttribute("aria-pressed", String(paused));
    recordToggle.textContent = paused
      ? "Включить вращение"
      : "Остановить вращение";
  };
  setPaused(reducedMotion.matches);
  recordToggle.hidden = false;
  recordToggle.addEventListener("click", () => {
    setPaused(!recordArt.classList.contains("is-paused"), true);
  });
}

// Прокрутка поддерживает свайп; крайние копии кадров замыкают карусель без обратного пролистывания.
const galleryTrack = document.querySelector(".photo-gallery__track");
const galleryControls = document.querySelector(".photo-gallery__controls");
if (galleryTrack && galleryControls) {
  const slides = Array.from(galleryTrack.querySelectorAll(".photo-gallery__slide"));
  const dots = Array.from(galleryControls.querySelectorAll(".photo-gallery__dots button"));
  const previous = galleryControls.querySelector(".photo-gallery__previous");
  const next = galleryControls.querySelector(".photo-gallery__next");
  const counter = galleryControls.querySelector(".photo-gallery__counter");
  const gallery = galleryTrack.closest(".photo-gallery");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let settleTimer;
  let isInView = false;
  let autoplayTimer;

  const updateControls = (index) => {
    currentIndex = index;
    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === currentIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };
  const jumpToSlot = (slot) => {
    galleryTrack.style.scrollBehavior = "auto";
    galleryTrack.style.scrollSnapType = "none";
    galleryTrack.scrollLeft = slot * galleryTrack.clientWidth;
    requestAnimationFrame(() => {
      galleryTrack.style.scrollBehavior = "";
      galleryTrack.style.scrollSnapType = "";
    });
  };
  const showSlide = (index) => {
    const slot = index < 0 ? 0 : index >= slides.length ? slides.length + 1 : index + 1;
    galleryTrack.scrollTo({
      left: slot * galleryTrack.clientWidth,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  };
  const scheduleAutoplay = () => {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
      if (isInView && !document.hidden && !reducedMotion.matches) {
        showSlide(currentIndex + 1);
      } else {
        scheduleAutoplay();
      }
    }, 5000);
  };
  const moveTo = (index) => {
    showSlide(index);
    scheduleAutoplay();
  };

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  [firstClone, lastClone].forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
    clone.querySelector("img").alt = "";
  });
  galleryTrack.prepend(lastClone);
  galleryTrack.append(firstClone);
  jumpToSlot(1);

  previous.addEventListener("click", () => moveTo(currentIndex - 1));
  next.addEventListener("click", () => moveTo(currentIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => moveTo(index)));
  galleryTrack.addEventListener("scroll", () => {
    const slot = Math.max(0, Math.min(slides.length + 1, Math.round(galleryTrack.scrollLeft / galleryTrack.clientWidth)));
    updateControls(slot === 0 ? slides.length - 1 : slot === slides.length + 1 ? 0 : slot - 1);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (slot === 0) jumpToSlot(slides.length);
      if (slot === slides.length + 1) jumpToSlot(1);
      scheduleAutoplay();
    }, 120);
  }, { passive: true });
  galleryTrack.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveTo(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  window.addEventListener("resize", () => {
    jumpToSlot(currentIndex + 1);
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
    }, { threshold: 0.2 }).observe(gallery);
  } else {
    isInView = true;
  }
  scheduleAutoplay();
  updateControls(0);
  galleryControls.hidden = false;
}

// Ссылка «Наверх» остаётся доступной при прокрутке и не закрывает начало страницы.
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const updateBackToTop = () => {
    backToTop.classList.toggle("is-hidden", window.scrollY < 320);
  };
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("pageshow", updateBackToTop);
  updateBackToTop();
}
