// Общая проверка формы на странице заявки и в диалоговом окне.
const orderDialog = document.querySelector('#order-dialog');
const orderForm = document.querySelector('#order-form');
const selectedProduct = document.querySelector('#selected-product');
const successMessage = document.querySelector('#success-message');

if (orderForm && selectedProduct && successMessage) {
  if (typeof products !== 'undefined') {
    Array.from(selectedProduct.options).forEach((option) => {
      const product = products.find((item) => item.code === option.value);
      if (product) option.textContent = `${product.title} — ${product.priceLabel}`;
    });
  }
  orderForm.noValidate = true;
  const fields = Array.from(orderForm.elements).filter((field) => field.willValidate);

  function errorText(field) {
    if (field.validity.valueMissing) return 'Заполните это поле.';
    if (field.validity.typeMismatch && field.type === 'email') return 'Введите корректный адрес электронной почты.';
    if (field.validity.patternMismatch && field.type === 'tel') return 'Введите телефон в формате +79000000000.';
    if (field.validity.tooShort) return `Введите не менее ${field.minLength} символов.`;
    return 'Проверьте значение поля.';
  }

  function setFieldError(field) {
    const wrapper = field.closest('.order-form__field, .order-form__consent');
    if (!wrapper) return field.validity.valid;
    let message = wrapper.querySelector('.order-form__error');
    if (!message) {
      message = document.createElement('small');
      message.classList.add('order-form__error');
      message.id = `${field.id}-error`;
      message.setAttribute('role', 'alert');
      wrapper.append(message);
    }
    const valid = field.validity.valid && !(field.name === 'name' && field.value.trim().length < 2);
    message.textContent = valid ? '' : (field.name === 'name' && field.value.trim().length < 2 ? 'Введите имя не короче двух символов.' : errorText(field));
    message.hidden = valid;
    if (valid) field.removeAttribute('aria-invalid');
    else field.setAttribute('aria-invalid', 'true');
    if (valid) {
      if (field.id === 'order-phone') field.setAttribute('aria-describedby', 'phone-hint');
      else field.removeAttribute('aria-describedby');
    }
    else field.setAttribute('aria-describedby', field.id === 'order-phone' ? `phone-hint ${message.id}` : message.id);
    return valid;
  }

  orderForm.addEventListener('input', (event) => {
    if (fields.includes(event.target)) setFieldError(event.target);
    successMessage.hidden = true;
  });
  orderForm.addEventListener('change', (event) => {
    if (fields.includes(event.target)) setFieldError(event.target);
  });
  orderForm.addEventListener('reset', () => {
    queueMicrotask(() => {
      fields.forEach((field) => {
        field.removeAttribute('aria-invalid');
        if (field.id !== 'order-phone') field.removeAttribute('aria-describedby');
      });
      orderForm.querySelectorAll('.order-form__error').forEach((error) => { error.hidden = true; error.textContent = ''; });
    });
  });
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const firstInvalid = fields.find((field) => !setFieldError(field));
    // Показываем ошибки сразу у всех полей, даже если первое уже неверно.
    fields.forEach(setFieldError);
    if (firstInvalid) return firstInvalid.focus();
    const productName = selectedProduct.selectedOptions[0].textContent.trim();
    orderForm.reset();
    orderDialog?.close();
    successMessage.textContent = `Заявка на «${productName}» подготовлена. Данные не отправлены на сервер.`;
    successMessage.hidden = false;
    successMessage.focus();
  });

  const productCode = new URLSearchParams(window.location.search).get('product');
  if (productCode && Array.from(selectedProduct.options).some((option) => option.value === productCode)) selectedProduct.value = productCode;

  if (orderDialog) {
    document.querySelectorAll('[data-order-product]').forEach((button) => button.addEventListener('click', () => {
      orderForm.reset();
      successMessage.hidden = true;
      selectedProduct.value = button.dataset.orderProduct;
      orderDialog.showModal();
    }));
    document.querySelector('#close-order-dialog')?.addEventListener('click', () => orderDialog.close());
  }
}
