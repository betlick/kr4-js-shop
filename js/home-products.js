const homeGrid = document.querySelector('#popular .products-grid');

if (homeGrid && typeof products !== 'undefined') {
  Array.from(homeGrid.querySelectorAll('.product-card')).slice(0, 4).forEach((card, index) => {
    const price = card.querySelector('.product-card__price');
    if (price) price.textContent = products[index].priceLabel;
  });
  for (const product of products.slice(4)) {
    const card = document.createElement('article');
    card.classList.add('product-card');
    const preview = document.createElement('div');
    preview.classList.add('beat-preview');
    const play = document.createElement('a');
    play.classList.add('beat-preview__link');
    play.href = `https://www.youtube.com/watch?v=${product.youtubeId}`;
    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${product.youtubeId}/hqdefault.jpg`;
    image.alt = '';
    image.loading = 'lazy';
    const icon = document.createElement('span');
    icon.classList.add('beat-preview__play-button');
    icon.setAttribute('aria-hidden', 'true');
    play.append(image, icon);
    preview.append(play);
    const author = document.createElement('p');
    author.classList.add('product-card__category');
    author.textContent = `Автор: ${product.author}`;
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
    price.textContent = product.priceLabel;
    const actions = document.createElement('div');
    actions.classList.add('product-card__actions');
    const details = document.createElement('a');
    details.classList.add('button', 'button--secondary');
    details.href = titleLink.href;
    details.textContent = 'Подробнее';
    const order = document.createElement('button');
    order.classList.add('button', 'button--primary', 'product-card__button');
    order.type = 'button';
    order.dataset.orderProduct = product.code;
    order.textContent = 'Заказать';
    actions.append(details, order);
    card.append(preview, author, title, description, price, actions);
    homeGrid.append(card);
  }
}
