// Дополнительные карточки страницы битов строятся из тех же данных, что каталог.
const moreProducts = document.querySelector('[data-more-products]');

if (moreProducts && typeof products !== 'undefined') {
  for (const product of products.slice(0, 4)) {
    const article = document.getElementById(product.code);
    if (!article) continue;
    const price = article.querySelector('.product-detail__price');
    if (price) price.textContent = product.priceLabel;
    const costRow = Array.from(article.querySelectorAll('.product-table tbody tr'))
      .find((row) => row.querySelector('th')?.textContent.trim() === 'Стоимость');
    if (costRow) costRow.querySelector('td').textContent = product.priceLabel;
  }
  const additionalProducts = products.slice(4);
  for (const product of additionalProducts) {
    const article = document.createElement('article');
    article.classList.add('product-detail');
    article.id = product.code;
    article.setAttribute('aria-labelledby', `${product.code}-title`);

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

    const content = document.createElement('div');
    content.classList.add('product-detail__content');
    const title = document.createElement('h2');
    title.classList.add('product-detail__title');
    title.id = `${product.code}-title`;
    title.textContent = product.title;
    const author = document.createElement('p');
    author.classList.add('product-detail__author');
    author.textContent = `Автор: ${product.author}`;
    const description = document.createElement('p');
    description.classList.add('product-detail__description');
    description.textContent = product.description;
    const price = document.createElement('p');
    price.classList.add('product-detail__price');
    price.textContent = product.priceLabel;
    const actions = document.createElement('div');
    actions.classList.add('product-detail__actions');
    const listen = document.createElement('a');
    listen.classList.add('button', 'button--secondary');
    listen.href = youtube.href;
    listen.target = '_blank';
    listen.rel = 'noopener noreferrer';
    listen.textContent = 'Слушать на YouTube';
    const order = document.createElement('a');
    order.classList.add('button', 'button--primary');
    order.href = `order.html?product=${encodeURIComponent(product.code)}`;
    order.textContent = 'Оставить заявку';
    actions.append(listen, order);
    content.append(title, author, description, price, actions);
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');
    tableWrapper.tabIndex = 0;
    tableWrapper.setAttribute('role', 'region');
    tableWrapper.setAttribute('aria-label', `Характеристики ${product.title}`);
    const table = document.createElement('table');
    table.classList.add('product-table');
    const caption = document.createElement('caption');
    caption.classList.add('product-table__caption');
    caption.textContent = `Характеристики ${product.title}`;
    const body = document.createElement('tbody');
    for (const [label, value] of [
      ['Автор', product.author],
      ['Прослушивание', 'YouTube'],
      ['Стоимость', product.priceLabel],
      ['Лицензия', 'Уточняется у правообладателя']
    ]) {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.classList.add('product-table__cell');
      heading.scope = 'row';
      heading.textContent = label;
      const cell = document.createElement('td');
      cell.classList.add('product-table__cell');
      cell.textContent = value;
      row.append(heading, cell);
      body.append(row);
    }
    table.append(caption, body);
    tableWrapper.append(table);
    article.append(preview, content, tableWrapper);
    moreProducts.append(article);
  }
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (target && additionalProducts.some((product) => product.code === target.id)) {
    window.addEventListener('load', () => target.scrollIntoView(), { once: true });
  }
}
