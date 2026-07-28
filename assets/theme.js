document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Hero Slideshow ---------- */
  document.querySelectorAll('.hero-slideshow').forEach(function (wrap) {
    var slides = wrap.querySelectorAll('.hero-slide');
    var dots = wrap.querySelectorAll('.dot');
    var index = 0;
    function show(i) {
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === i); });
      index = i;
    }
    var prev = wrap.querySelector('[data-slide-prev]');
    var next = wrap.querySelector('[data-slide-next]');
    if (prev) prev.addEventListener('click', function () { show((index - 1 + slides.length) % slides.length); });
    if (next) next.addEventListener('click', function () { show((index + 1) % slides.length); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(parseInt(d.dataset.slideIndex, 10)); });
    });
    if (slides.length > 1) {
      setInterval(function () { show((index + 1) % slides.length); }, 6000);
    }
  });

  /* ---------- Product row horizontal scroll ---------- */
  document.querySelectorAll('[data-product-row]').forEach(function (row) {
    var wrap = row.closest('.featured-collection__row');
    if (!wrap) return;
    var prev = wrap.querySelector('[data-row-prev]');
    var next = wrap.querySelector('[data-row-next]');
    if (prev) prev.addEventListener('click', function () { row.scrollBy({ left: -260, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { row.scrollBy({ left: 260, behavior: 'smooth' }); });
  });

  /* ---------- Category menu toggle (mobile) ---------- */
  var catToggle = document.getElementById('CategoryMenuToggle');
  if (catToggle) {
    catToggle.addEventListener('click', function () {
      var list = document.querySelector('.site-header__nav-list');
      if (list) list.style.display = list.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  /* ---------- Product page: image thumbnails ---------- */
  document.querySelectorAll('.product-page__thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var mainImg = document.getElementById('ProductMainImage');
      if (mainImg) mainImg.src = thumb.dataset.fullSrc;
      document.querySelectorAll('.product-page__thumb').forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  });

  /* ---------- Quantity steppers (product page) ---------- */
  document.querySelectorAll('[data-qty-minus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      input.value = Math.max(1, parseInt(input.value || 1, 10) - 1);
    });
  });
  document.querySelectorAll('[data-qty-plus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentElement.querySelector('input');
      input.value = parseInt(input.value || 1, 10) + 1;
    });
  });

  /* ---------- Cart page quantity steppers (submit form on change) ---------- */
  document.querySelectorAll('[data-cart-qty-minus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.querySelector('input[data-line="' + btn.dataset.line + '"]');
      input.value = Math.max(0, parseInt(input.value || 0, 10) - 1);
    });
  });
  document.querySelectorAll('[data-cart-qty-plus]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.querySelector('input[data-line="' + btn.dataset.line + '"]');
      input.value = parseInt(input.value || 0, 10) + 1;
    });
  });

  /* ---------- Wishlist (local, front-end only) ---------- */
  document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      btn.classList.toggle('is-active');
    });
  });

  /* ---------- Cart drawer open/close ---------- */
  var cartTrigger = document.getElementById('CartIconTrigger');
  var cartDrawer = document.getElementById('cart-drawer');
  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    refreshCartDrawer();
  }
  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('is-open');
  }
  if (cartTrigger && cartDrawer) {
    cartTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      openCartDrawer();
    });
  }
  document.querySelectorAll('[data-cart-close]').forEach(function (el) {
    el.addEventListener('click', closeCartDrawer);
  });

  function refreshCartDrawer() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var itemsEl = document.getElementById('CartDrawerItems');
        var subtotalEl = document.getElementById('CartDrawerSubtotal');
        if (!itemsEl) return;
        if (cart.items.length === 0) {
          itemsEl.innerHTML = '<p>Your cart is empty</p>';
        } else {
          itemsEl.innerHTML = cart.items.map(function (item) {
            return '<div style="display:flex;gap:10px;margin-bottom:14px;">' +
              '<img src="' + item.image + '" width="60" height="60" style="object-fit:cover;border-radius:6px;">' +
              '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + item.product_title + '</div>' +
              '<div style="font-size:12px;color:#777;">Qty ' + item.quantity + '</div>' +
              '<div style="font-size:13px;font-weight:700;color:var(--color-accent-red);">' + formatMoney(item.final_line_price) + '</div></div>' +
              '</div>';
          }).join('');
        }
        if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
      })
      .catch(function () {});
  }

  function formatMoney(cents) {
    return '£' + (cents / 100).toFixed(2);
  }

  /* ---------- AJAX add-to-cart from product cards / product page ---------- */
  document.body.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[action*="/cart/add"]')) return;
    e.preventDefault();
    var formData = new FormData(form);
    fetch('/cart/add.js', { method: 'POST', body: formData })
      .then(function (r) { return r.json(); })
      .then(function () {
        openCartDrawer();
      })
      .catch(function () {
        form.submit(); // fallback to normal submit
      });
  });

});
