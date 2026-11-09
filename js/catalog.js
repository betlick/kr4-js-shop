const productsContainer = document.querySelector('[data-products-container]');
const searchInput = document.querySelector('[data-catalog-search]');
const categorySelect = document.querySelector('[data-catalog-category]');
const sortSelect = document.querySelector('[data-catalog-sort]');
const catalogCount = document.querySelector('[data-catalog-count]');
const catalogEmpty = document.querySelector('[data-catalog-empty]');
const filtersForm = document.querySelector('[data-catalog-filters]');

if (productsContainer && filtersForm && searchInput && categorySelect && sortSelect && catalogCount && catalogEmpty && typeof products !== 'undefined') {
  const state = { query: '', category: 'all', sort: 'default' };
  const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

  function prepareProducts() {
    const query = state.query.trim().toLocaleLowerCase('ru');
    let result = products.filter((product) => product.title.toLocaleLowerCase('ru').includes(query));
    if (state.category === 'free') result = result.filter((product) => product.isFree);
    else if (state.category !== 'all') result = result.filter((product) => product.artists.includes(state.category));
    result = [...result];
    if (state.sort === 'price-asc') result.sort((a, b) => (a.priceKnown === false) - (b.priceKnown === false) || a.price - b.price);
    if (state.sort === 'price-desc') result.sort((a, b) => (a.priceKnown === false) - (b.priceKnown === false) || b.price - a.price);
    if (state.sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    return result;
  }

  function createCard(product) {
    const card = document.createElement('article');
    card.classList.add('product-card');
    const preview = document.createElement('div');
    preview.classList.add('beat-preview');
    const youtube = document.createElement('a');
    youtube.classList.add('beat-preview__link');
    youtube.href = `https://www.youtube.com/watch?v=${product.youtubeId}`;
    youtube.target = '_blank';
    youtube.rel = 'noopener noreferrer';
    youtube.setAttribute('aria-label', `Слушать «${product.title}» на YouTube, новая вкладка`);
    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${product.youtubeId}/hqdefault.jpg`;
    image.alt = '';
    image.loading = 'lazy';
    const play = document.createElement('span');
    play.classList.add('beat-preview__play-button');
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '';
    youtube.append(image, play);
    preview.append(youtube);
    const category = document.createElement('p');
    category.classList.add('product-card__category');
    category.textContent = `Автор: ${product.author}`;
    const title = document.createElement('h3');
    title.classList.add('product-card__title');
    const titleLink = document.createElement('a');
    titleLink.href = `product.html#${product.code}`;
    titleLink.textContent = product.title;
    title.append(titleLink);
    const description = document.createElement('p');
    description.classList.add('product-card__description');
    description.textContent = product.description;
    const price = document.createElement('p');
    price.classList.add('product-card__price');
    price.textContent = product.priceLabel || formatPrice(product.price);
    const actions = document.createElement('div');
    actions.classList.add('product-card__actions');
    const details = document.createElement('a');
    details.classList.add('button', 'button--secondary');
    details.href = titleLink.href;
    details.textContent = 'Подробнее';
    const order = document.createElement('button');
    order.classList.add('button', 'button--primary', 'product-card__button');
    order.type = 'button';
    order.dataset.productId = String(product.id);
    order.textContent = 'Заказать';
    order.disabled = !product.isAvailable;
    actions.append(details, order);
    card.append(preview, category, title, description, price, actions);
    return card;
  }

  function render() {
    const visible = prepareProducts();
    productsContainer.replaceChildren(...visible.map(createCard));
    document.dispatchEvent(new Event('beat:rendered'));
    catalogCount.textContent = `Найдено: ${visible.length}`;
    catalogEmpty.hidden = visible.length > 0;
  }
  const comparisonBody = document.querySelector('#comparison .product-table tbody');
  if (comparisonBody) {
    const rows = products.map((product) => {
      const row = document.createElement('tr');
      const name = document.createElement('th');
      name.classList.add('product-table__cell');
      name.scope = 'row';
      const link = document.createElement('a');
      link.href = `product.html#${product.code}`;
      link.textContent = product.title;
      name.append(link);
      const author = document.createElement('td');
      author.classList.add('product-table__cell');
      author.textContent = product.author;
      const listening = document.createElement('td');
      listening.classList.add('product-table__cell');
      listening.textContent = 'YouTube';
      const price = document.createElement('td');
      price.classList.add('product-table__cell');
      price.textContent = product.priceLabel;
      row.append(name, author, listening, price);
      return row;
    });
    comparisonBody.replaceChildren(...rows);
    const headings = document.querySelectorAll('#comparison .product-table thead th');
    if (headings[1]) headings[1].textContent = 'Автор';
  }
  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    render();
  });
  categorySelect.addEventListener('change', (event) => {
    state.category = event.target.value;
    render();
  });
  sortSelect.addEventListener('change', (event) => {
    state.sort = event.target.value;
    render();
  });
  filtersForm.addEventListener('submit', (event) => event.preventDefault());
  filtersForm.addEventListener('reset', () => {
    state.query = '';
    state.category = 'all';
    state.sort = 'default';
    render();
  });
  productsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    const product = products.find((item) => item.id === Number(button.dataset.productId));
    if (!product) return;
    const dialog = document.querySelector('#order-dialog');
    const form = document.querySelector('#order-form');
    const select = document.querySelector('#selected-product');
    if (dialog && form && select) {
      form.reset();
      select.value = product.code;
      dialog.showModal();
    } else {
      window.location.href = `order.html?product=${encodeURIComponent(product.code)}`;
    }
  });
  render();
}
