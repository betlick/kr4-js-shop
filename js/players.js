// Один способ показа всех битов: встроенный плеер или ссылка, если встраивание недоступно.
const youtubePlayers = [];

function getVideoId(preview) {
  const source = preview.querySelector('iframe')?.src || preview.querySelector('a[href*="youtu"]')?.href;
  if (!source) return null;
  const url = new URL(source, window.location.href);
  return url.searchParams.get('v') || url.pathname.split('/embed/')[1]?.split('/')[0] || null;
}

function registerYoutubePlayers() {
  if (!window.YT?.Player) return;
  youtubePlayers.splice(0, youtubePlayers.length, ...youtubePlayers.filter((player) => player.getIframe()?.isConnected));
  document.querySelectorAll('.beat-player[data-youtube-id]').forEach((frame) => {
    if (frame.dataset.registered) return;
    frame.dataset.registered = 'true';
    const player = new YT.Player(frame, {
      events: {
        onStateChange(event) {
          if (event.data !== YT.PlayerState.PLAYING) return;
          for (const other of youtubePlayers) {
            if (other !== event.target && other.getIframe()?.isConnected) other.pauseVideo();
          }
        }
      }
    });
    youtubePlayers.push(player);
  });
}

function makePreview(preview) {
  const id = getVideoId(preview);
  if (!id || typeof products === 'undefined') return;
  const product = products.find((item) => item.youtubeId === id);
  if (!product) return;
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  if (product.embedAvailable === false) {
    const link = document.createElement('a');
    link.classList.add('beat-preview__external-only');
    link.href = watchUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Смотреть «${product.title}» на YouTube, новая вкладка`);
    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    image.alt = '';
    image.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = 'Смотреть на YouTube ↗';
    link.append(image, label);
    preview.replaceChildren(link);
    return;
  }
  const frame = document.createElement('iframe');
  frame.classList.add('beat-player');
  frame.dataset.youtubeId = id;
  const url = new URL(`https://www.youtube.com/embed/${id}`);
  url.searchParams.set('enablejsapi', '1');
  if (window.location.origin !== 'null') url.searchParams.set('origin', window.location.origin);
  frame.src = url.toString();
  frame.title = `Прослушать «${product.title}»`;
  frame.loading = 'lazy';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  const fallback = document.createElement('a');
  fallback.classList.add('beat-preview__fallback');
  fallback.href = watchUrl;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'Открыть на YouTube ↗';
  preview.replaceChildren(frame, fallback);
}

function setupPreviews() {
  document.querySelectorAll('.product-card .beat-preview:not([data-ready]), .product-detail .beat-preview:not([data-ready])').forEach((preview) => {
    preview.dataset.ready = 'true';
    makePreview(preview);
  });
  registerYoutubePlayers();
}

document.addEventListener('beat:rendered', setupPreviews);
setupPreviews();
window.onYouTubeIframeAPIReady = registerYoutubePlayers;
if (!window.YT?.Player) {
  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  document.head.append(api);
}
