// Board ranges from the WB infographic, checked 2026-11-16.
// Cover dimensions include the fabric that wraps underneath the board.
const coverSizes = {
  small: { label: '130 × 47 см', minLength: 110, maxLength: 122, minWidth: 30, maxWidth: 40, note: 'Для досок от 110 × 30 до 122 × 40 см.' },
  large: { label: '135 × 56 см', minLength: 122, maxLength: 130, minWidth: 40, maxWidth: 50, note: 'Для досок от 122 × 40 до 130 × 50 см.' }
};
function recommendCover(length, width) {
  if (!Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
    return { size: null, title: 'Проверьте измерения', description: 'Введите длину и ширину рабочей поверхности доски в сантиметрах.' };
  }
  if (length < width) {
    return { size: null, title: 'Проверьте измерения', description: 'Длина доски обычно больше её ширины. Возможно, значения поменялись местами.' };
  }
  for (const [size, fit] of Object.entries(coverSizes)) {
    if (length >= fit.minLength && length <= fit.maxLength && width >= fit.minWidth && width <= fit.maxWidth) {
      return { size, title: `Вам подойдёт чехол ${fit.label}`, description: `${fit.note} При необычной форме носика уточните посадку у продавца на Wildberries.` };
    }
  }
  return { size: null, title: 'Размеры вне рекомендованных диапазонов', description: 'По этим измерениям мы не можем рекомендовать один из наших чехлов. Максимальная доска для чехла 135 × 56 см — 130 × 50 см. Уточните посадку у продавца, указав длину, ширину и форму доски.' };
}

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const products = {
  beige: { small: '1183039147', large: '725376885' },
  grey: { small: '400528233', large: '575197795' }
};
const leafVariants = {
  small: { image: 'assets/leaf-small-clean.webp', pattern: 'Вертикальные листья · 130 × 47 см', alt: 'Чехол MessLess 130 × 47 см с вертикальными листьями на гладильной доске' },
  large: { image: 'assets/leaf-large-clean.webp', pattern: 'Горизонтальные листья · 135 × 56 см', alt: 'Чехол MessLess 135 × 56 см с горизонтальными листьями на гладильной доске' }
};
function updateProduct(product, size) {
  const buy = product.querySelector('[data-buy]');
  if (buy) buy.href = `https://www.wildberries.ru/catalog/${products[product.dataset.color][size]}/detail.aspx`;
  if (product.dataset.color === 'leaf') {
    const variant = leafVariants[size];
    const photo = product.querySelector('.product-image img');
    photo.src = variant.image;
    photo.alt = variant.alt;
    product.querySelector('[data-pattern]').textContent = variant.pattern;
  }
  const fitNote = product.querySelector('[data-fit]');
  if (fitNote) fitNote.textContent = coverSizes[size].note;
}
document.querySelectorAll('.product').forEach(product => {
  product.querySelectorAll('input').forEach(input => input.addEventListener('change', () => updateProduct(product, input.value)));
});
const guide = document.querySelector('#size-guide');
const result = document.querySelector('#guide-result');
document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => {
  guide.showModal(); document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => guide.close());
guide.addEventListener('click', event => {
  const bounds = guide.getBoundingClientRect();
  if (event.target === guide && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) guide.close();
});
guide.addEventListener('close', () => document.body.classList.remove('modal-open'));
document.querySelector('#guide-form').addEventListener('submit', event => {
  event.preventDefault();
  const length = Number(document.querySelector('#board-length').value);
  const width = Number(document.querySelector('#board-width').value);
  const { title, description } = recommendCover(length, width);
  result.replaceChildren();
  const heading = document.createElement('h3'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = description;
  result.append(heading, paragraph);
  const link = document.createElement('a'); link.className = 'inline-link'; link.href = '#collection'; link.textContent = 'Посмотреть коллекцию ';
  link.append(document.querySelector('.icon-arrow-ne').cloneNode(true));
  link.addEventListener('click', () => guide.close()); result.append(link); result.hidden = false;
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
}

// Mobile shows one colour at a time; desktop shows all three designs.
const colorPicker = document.querySelector('.mobile-color-picker');
const colorButtons = document.querySelectorAll('[data-select-color]');
colorButtons.forEach(button => button.addEventListener('click', () => {
  const current = document.querySelector('.product.is-selected');
  const next = document.querySelector(`.product[data-color="${button.dataset.selectColor}"]`);
  const size = current.querySelector('input:checked').value;
  const nextSize = next.querySelector(`input[value="${size}"]`);
  nextSize.checked = true;
  nextSize.dispatchEvent(new Event('change', { bubbles: true }));
  next.querySelector('.product-image').after(colorPicker);
  document.querySelectorAll('.product').forEach(product => product.classList.toggle('is-selected', product === next));
  next.classList.add('is-visible');
  colorButtons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  document.querySelector('#selected-color').textContent = button.getAttribute('aria-label');
  button.focus({ preventScroll: true });
}));
if (window.matchMedia('(max-width: 700px)').matches) {
  document.querySelectorAll('.accordion details').forEach(item => item.open = false);
}
