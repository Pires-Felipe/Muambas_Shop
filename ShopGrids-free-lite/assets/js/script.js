const addToCartButtons = document.querySelectorAll('.add-to-cart');


addToCartButtons.forEach(button => {
  button.addEventListener('click', function() {
    const productData = {
      image: button.getAttribute('data-image'),
      image1: button.getAttribute('data-image1'),
      image2: button.getAttribute('data-image2'),
      image3: button.getAttribute('data-image3'),
      image4: button.getAttribute('data-image4'),
      category: button.getAttribute('data-category'),
      title: button.getAttribute('data-title'),
      review: button.getAttribute('data-review'),
      price: button.getAttribute('data-price'),
      subtitle: button.getAttribute('data-subtitle'),
      details: button.getAttribute('data-details'),
      colors: button.getAttribute('data-available-colors'),
    };

    // Obter a cor selecionada
    const selectedColors = Array.from(document.querySelectorAll('.color-option input:checked + label span'))
      .map(span => span.getAttribute('data-color'));

    productData.selectedColors = selectedColors;

    localStorage.setItem('productData', JSON.stringify(productData));
  });
});

window.addEventListener('beforeunload', function() {
  // Verificar se há dados do produto armazenados no localStorage
  if (localStorage.getItem('productData')) {
    const productData = JSON.parse(localStorage.getItem('productData'));
    sessionStorage.setItem('productData', JSON.stringify(productData));
  }
});

// Verificar se há dados do produto armazenados no sessionStorage
if (sessionStorage.getItem('productData')) {
  const productData = JSON.parse(sessionStorage.getItem('productData'));
  const availableColors = productData.colors.split(',');

  const colorOptionContainer = document.getElementById('colorOptions');
  const colors = productData.colors.split(',');

  colors.forEach((color, index) => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.classList.add('single-checkbox');

    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = `checkbox-${color}`;
    checkboxInput.checked = true;
    checkboxDiv.appendChild(checkboxInput);

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', `checkbox-${color}`);
    const span = document.createElement('span');
    span.setAttribute('data-color', color);

    checkboxLabel.appendChild(span);
    checkboxDiv.appendChild(checkboxLabel);

    const checkboxStyleClass = `checkbox-style-${index + 1}`;
    checkboxDiv.classList.add(checkboxStyleClass);

    checkboxInput.addEventListener('change', function() {
      const selectedCheckboxes = document.querySelectorAll('.single-checkbox input:checked');
      selectedCheckboxes.forEach((checkbox) => {
        checkbox.parentNode.classList.add('checked');
      });

      const uncheckedCheckboxes = document.querySelectorAll('.single-checkbox input:not(:checked)');
      uncheckedCheckboxes.forEach((checkbox) => {
        checkbox.parentNode.classList.remove('checked');
      });
    });

    const style = document.createElement('style');
    style.innerHTML = `
      .item-details .product-info .form-group.color-option .single-checkbox.${checkboxStyleClass} input[type="checkbox"]+label span {
        border: 2px solid ${color};
      }
      .item-details .product-info .form-group.color-option .single-checkbox.${checkboxStyleClass} input[type="checkbox"]+label span::before {
        background-color: ${color};
      }
    `;
    document.head.appendChild(style);

    colorOptionContainer.appendChild(checkboxDiv);
  });

  // Definir os elementos onde os dados do produto serão exibidos
  const productImage = document.getElementById('current');
  const productImage1 = document.getElementById('product-image1');
  const productImage2 = document.getElementById('product-image2');
  const productImage3 = document.getElementById('product-image3');
  const productImage4 = document.getElementById('product-image4');
  const productCategory = document.getElementById('product-category');
  const productTitle = document.getElementById('product-title');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  const productDetails = document.getElementById('product-details');

  // Atualizar os elementos com os dados do produto
  productImage.src = productData.image;
  productImage1.src = productData.image1;
  productImage2.src = productData.image2;
  productImage3.src = productData.image3;
  productImage4.src = productData.image4;
  productCategory.innerHTML += ' <a href="javascript:void(0)">' + productData.category + '</a>';
  productTitle.innerHTML = productData.title;
  productPrice.innerHTML = productData.price;
  productDescription.innerHTML = productData.subtitle;
  productDetails.innerHTML = productData.details;

  // Armazenar os dados do produto no localStorage ao carregar a página
  localStorage.setItem('productData', JSON.stringify(productData));
}

// Limpar os dados do produto ao sair da página
window.addEventListener('beforeunload', function() {
  localStorage.removeItem('productData');
});

// Função para adicionar um item ao carrinho
function addToCart() {
  // Coleta os dados do produto
  var productTitle = document.getElementById('product-title').textContent;
  var productImage = document.getElementById('product-image1').src;
  var productPrice = parseFloat(document.getElementById('product-price').textContent.replace('R$', ''));
  var productQuantity = parseInt(document.querySelector('.quantity select').value);

  // Coleta as cores selecionadas
  var selectedColors = Array.from(document.querySelectorAll('.color-option input:checked + label span'))
    .map(span => span.getAttribute('data-color'));

  // Verifica se o número de cores selecionadas não é maior que a quantidade de itens selecionados
  if (selectedColors.length > productQuantity) {
    alert('O número de cores selecionadas não pode ser maior que a quantidade de itens selecionados.');
    return;
  }

  // Calcula o subtotal do item
  var itemTotal = productPrice * productQuantity;

  // Cria o elemento do item do carrinho
  var cartItem = document.createElement('li');
  cartItem.innerHTML = `
    <a href="javascript:void(0)" class="remove" title="Remove this item"><i class="lni lni-close"></i></a>
    <div class="cart-img-head">
      <a class="cart-img" href="product-details.html"><img src="${productImage}" alt="#"></a>
    </div>
    <div class="content">
      <h4><a href="product-details.html">${productTitle}</a></h4>
      <p class="quantity">${productQuantity}x - <span class="amount">R$${(productPrice * productQuantity).toFixed(2)}</span></p>
      <p class="color">Cores: ${selectedColors.join(', ')}</p>
    </div>
  `;

  // Adiciona o item ao carrinho
  var cartItems = document.querySelector('.cart-items .shopping-list');
  cartItems.appendChild(cartItem);

  // Atualiza o número total de itens no carrinho
  var cartCount = document.querySelectorAll('.cart-items .total-items');
  for (var i = 0; i < cartCount.length; i++) {
    var totalCount = parseInt(cartCount[i].textContent) + 1;
    cartCount[i].textContent = totalCount;
  }

  // Calcula e exibe o total do carrinho
  updateCartTotal();
  saveCartData();
}

// Função para salvar os dados do carrinho no armazenamento local
function saveCartData() {
  var cartItems = document.querySelectorAll('.cart-items .shopping-list li');

  var cartData = Array.from(cartItems).map(item => {
    var productTitle = item.querySelector('.content h4 a').textContent;
    var productImage = item.querySelector('.cart-img').href;
    var productPrice = parseFloat(item.querySelector('.quantity .amount').textContent.replace('R$', ''));
    var productQuantity = parseInt(item.querySelector('.quantity').textContent);
    var selectedColors = item.querySelector('.color').textContent.replace('Cores: ', '').split(', ');

    return {
      title: productTitle,
      image: productImage,
      price: productPrice,
      quantity: productQuantity,
      colors: selectedColors
    };
  });

  localStorage.setItem('cartData', JSON.stringify(cartData));
}

// Função para carregar os dados do carrinho do armazenamento local
function loadCartData() {
  var cartData = localStorage.getItem('cartData');

  if (cartData) {
    cartData = JSON.parse(cartData);

    cartData.forEach(item => {
      var cartItem = document.createElement('li');
      cartItem.innerHTML = `
        <a href="javascript:void(0)" class="remove" title="Remove this item"><i class="lni lni-close"></i></a>
        <div class="cart-img-head">
          <a class="cart-img" href="${item.image}"><img src="${item.image}" alt="#"></a>
        </div>
        <div class="content">
          <h4><a href="product-details.html">${item.title}</a></h4>
          <p class="quantity">${item.quantity}x - <span class="amount">R$${(item.price * item.quantity).toFixed(2)}</span></p>
          <p class="color">Cores: ${item.colors.join(', ')}</p>
        </div>
      `;

      var cartItems = document.querySelector('.cart-items .shopping-list');
      cartItems.appendChild(cartItem);
    });

    // Atualiza o número total de itens no carrinho
    var cartCount = document.querySelectorAll('.cart-items .total-items');
    for (var i = 0; i < cartCount.length; i++) {
      var totalCount = parseInt(cartCount[i].textContent) + cartData.length;
      cartCount[i].textContent = totalCount;
    }

    // Calcula e exibe o total do carrinho
    updateCartTotal();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadCartData();
});


// Função para calcular e exibir o total do carrinho
function updateCartTotal() {
  var cartItems = document.querySelectorAll('.cart-items .shopping-list li');
  var total = 0;

  for (var i = 0; i < cartItems.length; i++) {
    var amountElement = cartItems[i].querySelector('.amount');
    var amount = parseFloat(amountElement.textContent.replace('R$', ''));
    total += amount;
  }

  // Atualiza o total do carrinho
  var totalAmountElement = document.querySelector('.cart-items .total-amount');
  totalAmountElement.textContent = 'R$' + total.toFixed(2);
}

// Adiciona um listener de evento ao botão "Adicionar ao carrinho"
var addToCartButton = document.getElementById('addToCartButton');
addToCartButton.addEventListener('click', addToCart);
