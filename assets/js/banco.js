  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { getDatabase, ref, push, get, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

  // Your web app's Firebase configuration
  const firebaseConfig = {
   apiKey: "AIzaSyCCp8A-C7fuA6aNo0bLACty7f0pzrZTIqk",
   authDomain: "muambas-shop.firebaseapp.com",
   databaseURL: "https://muambas-shop-default-rtdb.firebaseio.com",
   projectId: "muambas-shop",
   storageBucket: "muambas-shop.appspot.com",
   messagingSenderId: "647727361533",
   appId: "1:647727361533:web:2a0abff8380a614d293d94",
   measurementId: "G-1Q9Y1Y2Z53"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

  const emailInputLogin = document.getElementById("emailInputLogin");
  const passwordInputLogin = document.getElementById("passwordInputLogin");
  const submitButtonLogin = document.getElementById("submitButtonLogin");

  const emailInputSignup = document.getElementById("emailInputSignup");
  const passwordInputSignup = document.getElementById("passwordInputSignup");
  const submitButtonSignup = document.getElementById("submitButtonSignup");
  const nomeInputSignup = document.getElementById("nomeInputSignup");
  const sobrenome = document.getElementById("sobrenomeInputSignup");

  let userIdFrom = ""; // Variável global para armazenar o ID do usuário
  const userIdFromDB = localStorage.getItem("userIdFrom");

  // Verificação de login
  if (submitButtonLogin) {
   submitButtonLogin.addEventListener("click", () => {
    event.preventDefault();
    const email = emailInputLogin.value.toLowerCase().trim();
    const password = passwordInputLogin.value;

    signInWithEmailAndPassword(auth, email, password)
     .then(() => {
      // Autenticação bem-sucedida
      getUserIdFromEmail(email)
       .then((userIdFromDB) => {
        userIdFrom = userIdFromDB;
        localStorage.setItem("userIdFrom", userIdFrom);
        console.log("ID do usuário:", userIdFrom);
        window.location.href = "index.html";
       })
       .catch((error) => {
        console.error("Erro ao obter o ID do usuário do banco de dados:", error);
       });
     })
     .catch((signInError) => {
      // Ocorreu um erro durante a autenticação
      const errorCode = signInError.code;
      const errorMessage = signInError.message;
      console.error("Erro de autenticação:", errorCode, errorMessage);
     });
   });
  }

  // Função para obter o ID do usuário com base no email
  function getUserIdFromEmail(email) {
   const usuariosRef = ref(database, "usuarios");

   return get(usuariosRef)
    .then((snapshot) => {
     let userId = "";
     snapshot.forEach((userIdSnapshot) => {
      const idUsuario = userIdSnapshot.key;
      const emailUsuario = userIdSnapshot.child("credenciais/email").val();

      if (emailUsuario === email) {
       userId = idUsuario.split("_")[0]; // Extrai o ID do usuário do nó "id_usuario"
       return;
      }
     });
     return userId;
    })
    .catch((error) => {
     console.error("Erro ao obter ID do usuário:", error);
     return ""; // Retorna uma string vazia em caso de erro
    });
  }

  // Função para obter o último ID de usuário existente ao criar conta
  function getUltimoIdUsuario() {

   const usuariosRef = ref(database, 'usuarios');

   return get(usuariosRef).then((snapshot) => {
    const usuarios = snapshot.val();
    if (usuarios) {
     const idsUsuarios = Object.keys(usuarios);
     const ultimoId = idsUsuarios[idsUsuarios.length - 1];
     return parseInt(ultimoId.split('_')[0]);
    } else {
     return 0; // Retorna 0 se não houver usuários cadastrados
    }
   });
  }

  // Criar conta 
  if (submitButtonSignup) {

   submitButtonSignup.addEventListener('click', (event) => {
    event.preventDefault();
    const email = emailInputSignup.value.toLowerCase().trim();
    const password = passwordInputSignup.value;
    const nome = nomeInputSignup.value;
    const sobrenome = sobrenomeInputSignup.value;

    // Obter o último ID de usuário existente
    getUltimoIdUsuario().then((ultimoId) => {
     const proximoId = ultimoId + 1;
     userIdFrom = proximoId.toString().padStart(2, '0');
     localStorage.setItem("userIdFrom", userIdFrom);

     const usuarioId = `${proximoId.toString().padStart(2, '0')}_usuario`;



     // Cadastrar usuário com e-mail e senha
     createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {

       const usuarioData = {
        credenciais: {
         nome: nome,
         sobrenome: sobrenome,
         email: email,
         senha: password,
         id: proximoId.toString().padStart(2, '0')
        }
       };


       const usuarioIdRef = ref(database, `usuarios/${usuarioId}`);
       set(usuarioIdRef, usuarioData)
        .then(() => {

         console.log(userIdFrom, "Dados do usuário salvos no banco de dados");
         window.location.href = "index.html"; // Redireciona para a página de índice
        })
        .catch((error) => {
         console.error('Erro ao salvar os dados do usuário:', error);
        });
      })
      .catch((createUserError) => {
       // Ocorreu um erro ao criar o usuário
       const errorCode = createUserError.code;
       const errorMessage = createUserError.message;
       console.error('Erro ao criar usuário:', errorCode, errorMessage);
      });
    });
   });
  }

  // Após o usuário fazer login com sucesso
  setPersistence(auth, browserLocalPersistence)
   .then(() => {
    // A persistência local foi definida com sucesso
   })
   .catch((error) => {
    // Ocorreu um erro ao definir a persistência local
   });

   const profileLink = document.querySelector('.user');
   const loginLinks = document.querySelectorAll('.user-login');

  
if (profileLink && loginLinks) {

 onAuthStateChanged(auth, (user) => {
 if (user) {
   profileLink.style.display = 'block'; // Exibe o link de perfil
loginLinks.forEach((link) => {
 link.style.display = 'none'; // Oculta os links de login
});

  console.log(userIdFromDB); // O usuário está autenticado, exiba o conteúdo apropriado
 } else {
  profileLink.style.display = 'none'; // Oculta o link de perfil
  loginLinks.forEach((link) => {
   link.style.display = 'block'; // Exibe os links de login
  });
 }
});
}

// Função para pré-carregar a página de perfil e o arquivo CSS
function preLoadProfilePage() {
  // Pré-carregar a página de perfil
  fetch('profile.html')
    .then(response => response.text())
    .then(html => {
      // Armazenar a página de perfil em cache
      sessionStorage.setItem('profilePage', html);
    })
    .catch(error => {
      console.error('Erro ao pré-carregar a página de perfil:', error);
    });

  // Pré-carregar o arquivo CSS da página de perfil
  fetch('assets/css/profile.css')
    .then(response => response.text())
    .then(css => {
      // Armazenar o arquivo CSS em cache
      sessionStorage.setItem('profileCSS', css);
    })
    .catch(error => {
      console.error('Erro ao pré-carregar o arquivo CSS da página de perfil:', error);
    });
    
    fetch('assets/js/banco.js')
     .then(response => response.text())
     .then(js => {
      // Armazenar o arquivo JavaScript em cache
      sessionStorage.setItem('profileJS', js);
     })
     .catch(error => {
      console.error('Erro ao pré-carregar o arquivo JavaScript da página de perfil:', error);
     });
}

// Verificar o estado de autenticação do usuário
onAuthStateChanged(auth, (user) => {
  if (user) {
    // O usuário está autenticado, pré-carregar a página de perfil
    preLoadProfilePage();
    // Redirecionar para a página de perfil após o pré-carregamento
  } else {
    // O usuário não está autenticado, exibir o conteúdo de visitante ou redirecionar para a página de login
  }
});

function editProfile() {
   const usuariosRef = ref(database, "usuarios");
   const usuarioId = userIdFromDB;
   const usuarioRef = `${usuarioId}_usuario`;
   const credenciaisRef = ref(database, `usuarios/${usuarioRef}/credenciais`);


  // Adicione um ouvinte de evento ao botão "Salvar Perfil"
  const saveButton = document.querySelector('.profile-button');
  saveButton.addEventListener('click', () => {
    // Obtenha os valores dos campos do formulário
    const nome = document.getElementById('input-nome').value;
    const sobrenome = document.getElementById('input-sobrenome').value;
    const telefone = document.getElementById('input-telefone').value;
    const email = document.getElementById('input-email').value;
    const estado = document.getElementById('input-estado').value;
    const codigoPostal = document.getElementById('input-postalcode').value;
    const cidade = document.getElementById('input-cidade').value;
    const rua = document.getElementById('input-rua').value;
    const bairro = document.getElementById('input-bairro').value;
    const numero = document.getElementById('input-numero').value;
    const complemento = document.getElementById('input-complemento').value;
    const detalhes = document.getElementById('input-detalhes');

    // Atualize os dados do usuário no banco de dados
    set(ref(database, `usuarios/${usuarioRef}/credenciais`), {
      nome,
      sobrenome,
      telefone,
      email,
      estado,
      codigoPostal,
      cidade,
      rua,
      bairro,
      numero,
      complemento,
      detalhes
    }).then(() => {
      alert('Perfil atualizado com sucesso!');
    }).catch(error => {
      console.error('Erro ao atualizar perfil:', error);
    });
  });

// Recupere os dados do usuário do banco de dados
get(credenciaisRef)
 .then((snapshot) => {
  const userData = snapshot.val();

  // Preencha os campos do formulário com os dados do usuário
  document.getElementById('input-nome').value = userData.nome;
  document.getElementById('input-sobrenome').value = userData.sobrenome;
  document.getElementById('input-telefone').value = userData.telefone;
  document.getElementById('input-email').value = userData.email;
  document.getElementById('input-estado').value = userData.estado;
  document.getElementById('input-postalcode').value = userData.codigoPostal;
  document.getElementById('input-cidade').value = userData.cidade;
  document.getElementById('input-rua').value = userData.rua;
  document.getElementById('input-bairro').value = userData.bairro;
  document.getElementById('input-numero').value = userData.numero;
  document.getElementById('input-complemento').value = userData.complemento;
  document.getElementById('input-detalhes').value = userData.detalhes;
  document.getElementById('info-name').textContent = userData.nome;
  document.getElementById('info-email').textContent = userData.email;

   })
 .catch((error) => {
  console.error('Erro ao recuperar dados do perfil:', error);
 });

}

var profileIn = document.querySelector(".profile-button")

if (profileIn) {
 editProfile();
}

window.totalPayment = null;
// Recupera o valor de totalPayment do localStorage
var totalPaymentStorage = localStorage.getItem('totalPayment');
totalPayment = totalPaymentStorage;

console.log(totalPayment)

function checkout() {
 
  const usuariosRef = ref(database, "usuarios");
  const usuarioId = userIdFromDB;
  const usuarioRef = `${usuarioId}_usuario`;
  const credenciaisRef = ref(database, `usuarios/${usuarioRef}/credenciais`);
  const carrinhoId = `${usuarioId}_carrinho`;
  const carrinhoRef = ref(database, `usuarios/${usuarioRef}/carrinho/${carrinhoId}`);

// Escuta as alterações no carrinho do usuário
onValue(carrinhoRef, (snapshot) => {
   const carrinhoData = snapshot.val();
   const carrinhoContainer = document.getElementById("carrinho-container");

// Limpa o conteúdo anterior do carrinho
carrinhoContainer.innerHTML = "";

// Percorre cada item do carrinho
for (const itemId in carrinhoData.itens) {
  if (Object.hasOwnProperty.call(carrinhoData.itens, itemId)) {
    const item = carrinhoData.itens[itemId];
    
    // Cria os elementos HTML para o produto
    const article = document.createElement("article");
    article.classList.add("product");

    const img = document.createElement("img");
    img.classList.add("product__image");
    img.src = item.imagem;
    img.alt = item.titulo;

    const divDetails = document.createElement("div");
    divDetails.classList.add("product__details");

    const divTitle = document.createElement("div");

    const h3Title = document.createElement("h3");
    h3Title.classList.add("product__title");
    h3Title.textContent = item.titulo;

    const divPrice = document.createElement("div");
    divPrice.classList.add("price");

    const pPriceAfter = document.createElement("p");
    pPriceAfter.classList.add("price__after");
    pPriceAfter.textContent = "R$" + item.preco_unitario;

    const sPriceBefore = document.createElement("s");
    sPriceBefore.classList.add("price__before");
    sPriceBefore.textContent = "R$ 99,90";

    // Adiciona os elementos ao HTML
    divTitle.appendChild(h3Title);
    divPrice.appendChild(pPriceAfter);
    divPrice.appendChild(sPriceBefore);

    divDetails.appendChild(divTitle);
    divDetails.appendChild(divPrice);

    article.appendChild(img);
    article.appendChild(divDetails);

    carrinhoContainer.appendChild(article);
  }
}

  // Recupere os dados do usuário do banco de dados
  get(credenciaisRef)
    .then((snapshot) => {
      const userData = snapshot.val();
      const endereco = userData.rua + ", " + userData.bairro + ", " + userData.numero;
      
      // Preencha os campos do formulário com os dados do usuário
      
      const email = document.getElementById('email');
      email.value = userData.email;
      
      const telefone = document.getElementById('phone');
      telefone.value = userData.telefone;
      
      const nome = document.getElementById('name');
      nome.value = userData.nome + " " + userData.sobrenome;
      
      const addressElement = document.getElementById('address');
      addressElement.value = endereco;
      
      const cidade = document.getElementById('city');
      cidade.value = userData.cidade;

      const postalcode = document.getElementById('postal-code');
      postalcode.value = userData.codigoPostal;


      // Calcular o valor total do carrinho
      get(carrinhoRef)
        .then((snapshot) => {
          const carrinhoData = snapshot.val();
          let valorTotal = 0;
          

          // Iterar sobre os itens do carrinho e calcular o valor total
          for (const itemId in carrinhoData.itens) {
            const item = carrinhoData.itens[itemId];
            const precoTotalItem = item.quantidade * item.preco_unitario;
            valorTotal += precoTotalItem;
            
          }

          // Exibir o valor total no campo correspondente
          const valorTotalElement = document.getElementById('total');
          valorTotalElement.textContent = 'R$ ' + valorTotal.toFixed(2);

          // Calcular e exibir o total final
          calcularTotal(valorTotal);
        })
        .catch((error) => {
          console.error('Erro ao recuperar dados do carrinho:', error);
        });
    })
    .catch((error) => {
      console.error('Erro ao recuperar dados do perfil:', error);
    });
  });
  }

function calcularTotal(valorTotalItens) {
  const freteElement = document.getElementById("frete");
  const descontoElement = document.getElementById("desconto");
  const totalElement = document.getElementById("total");
  const totalFinalElement = document.getElementById("total-final");

  // Definir os valores do frete e do desconto com base no valor total dos itens
  let frete = 0;
  let desconto = 0;

  if (valorTotalItens < 15) {
    frete = 2;
  } else {
    frete = valorTotalItens * 0.12;
  }

  if (valorTotalItens > 60) {
    desconto = valorTotalItens * 0.08;
  }

  // Calcular o preço total e o preço final
  const precoTotal = valorTotalItens + frete - desconto;
  const precoFinal = precoTotal.toFixed(2);

  // Atualizar os elementos HTML com os valores calculados
  freteElement.textContent = "R$ " + frete.toFixed(2);
  descontoElement.textContent = "-R$ " + desconto.toFixed(2);
  totalElement.textContent = "R$ " + valorTotalItens.toFixed(2);
  totalFinalElement.textContent = "R$ " + precoFinal;
  
  totalPayment = precoFinal;
  localStorage.setItem('totalPayment', totalPayment);
}


  // Puxar lista deprodutos do banco de dados
  function createProductCards() {
   const productContainer = document.querySelector(".productCont");
   const produtosRef = ref(database, "produtos");

   onValue(produtosRef, (snapshot) => {

    if (productContainer) {
     productContainer.innerHTML = ""; // Limpa o conteúdo da div com a class="row"

     const produtos = snapshot.val();
     for (const productId in produtos) {
      const product = produtos[productId];
      const card = createCardElement(productId, product);
      productContainer.appendChild(card);
     }
    }
   });
  }

  // Criar os card para os produtos do banco
  function createCardElement(productId, product) {
   const colDiv = document.createElement("div");
   colDiv.className = "col-lg-3 col-md-6 col-12";

   const card = document.createElement("div");
   card.className = "single-product";

   const cardImg = document.createElement("div");
   cardImg.className = "product-image";

   const productImage = document.createElement("img");
   productImage.src = product.image;
   productImage.alt = product.title;
   productImage.id = `product-image-${productId}`;

   const cartButton = document.createElement("div");
   cartButton.className = "cart-button button";

   const buttonLink = document.createElement("a");


   const addToCartButton = document.createElement("button");
   addToCartButton.className = "btn add-to-cart";
   addToCartButton.setAttribute("data-id", productId);
   addToCartButton.setAttribute("data-availablecolors", product.availablecolors.join(","));
   addToCartButton.setAttribute("data-image", product.image);
   addToCartButton.setAttribute("data-category", product.category);
   addToCartButton.setAttribute("data-title", product.title);
   addToCartButton.setAttribute("data-review", product.review);
   addToCartButton.setAttribute("data-price", product.price);
   addToCartButton.setAttribute("data-subtitle", product.subtitle);
   addToCartButton.setAttribute("data-details", product.details);
   addToCartButton.setAttribute("data-image1", product.images[0]);
   addToCartButton.setAttribute("data-image2", product.images[1]);
   addToCartButton.setAttribute("data-image3", product.images[2]);
   addToCartButton.setAttribute("data-image4", product.images[3]);

   const cartIcon = document.createElement("i");
   cartIcon.className = "lni lni-cart";

   addToCartButton.appendChild(cartIcon);
   addToCartButton.appendChild(document.createTextNode(" Adicionar ao carrinho"));
   buttonLink.appendChild(addToCartButton);

   cartButton.appendChild(buttonLink);
   cardImg.appendChild(productImage);
   cardImg.appendChild(cartButton);



   addToCartButton.addEventListener('click', function(event) {
    event.preventDefault();

    const productData = {
     id: productId,
     image: product.image,
     image1: product.images[0],
     image2: product.images[1],
     image3: product.images[2],
     image4: product.images[3],
     category: product.category,
     title: product.title,
     review: product.review,
     price: product.price,
     subtitle: product.subtitle,
     details: product.details,
     colors: product.availablecolors.join(","),
    };

    // Obter a cor selecionada
    const selectedColors = Array.from(document.querySelectorAll('.color-option input:checked + label span'))
     .map(span => span.getAttribute('data-color'));

    productData.selectedColors = selectedColors;
    localStorage.setItem('productData', JSON.stringify(productData));
    // Redirecionar para a página de detalhes do produto após um pequeno atraso
    setTimeout(function() {
     window.location.replace('product-details.html');
    }, 1000);
   });


   const productInfo = document.createElement("div");
   productInfo.className = "product-info";

   const categorySpan = document.createElement("span");
   categorySpan.className = "category";
   categorySpan.id = `product-category-${productId}`;
   categorySpan.textContent = product.category;

   const titleHeading = document.createElement("h4");
   titleHeading.className = "title";

   const titleLink = document.createElement("a");
   titleLink.href = "product-grids.html";
   titleLink.id = `product-title-${productId}`;
   titleLink.textContent = product.title;

   const reviewList = document.createElement("ul");
   reviewList.className = "review";

   for (let i = 0; i < 5; i++) {
    const reviewItem = document.createElement("li");
    const starIcon = document.createElement("i");
    starIcon.className = "lni lni-star-filled";
    reviewItem.appendChild(starIcon);
    reviewList.appendChild(reviewItem);
   }

   const reviewSpan = document.createElement("li");
   reviewSpan.id = `product-review-${productId}`;
   reviewSpan.textContent = product.review;
   reviewList.appendChild(reviewSpan);

   const priceDiv = document.createElement("div");
   priceDiv.className = "price";

   const priceSpan = document.createElement("span");
   priceSpan.id = `product-price-${productId}`;
   priceSpan.textContent = product.price;

   titleHeading.appendChild(titleLink);
   productInfo.appendChild(categorySpan);
   productInfo.appendChild(titleHeading);
   productInfo.appendChild(reviewList);
   priceDiv.appendChild(priceSpan);
   productInfo.appendChild(priceDiv);

   card.appendChild(cardImg)
   card.appendChild(productInfo);

   colDiv.appendChild(card);

   return colDiv;
  }

  createProductCards();

  window.addEventListener('beforeunload', function() {

   // Verificar se há dados do produto armazenados no localStorage
   if (localStorage.getItem('productData')) {
    const productData = JSON.parse(localStorage.getItem('productData'));
    sessionStorage.setItem('productData', JSON.stringify(productData));
   }
  });

  const colorOptionContainer = document.getElementById('colorOptions');

  if (colorOptionContainer) {
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
    const productDetailsImg = document.getElementById('product-details-img');
    const productDetails = document.getElementById('product-details');
    const productId = document.querySelector('.id-data').setAttribute('data-id', 'x');

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
    
    productTitle.dataset.id = productData.id;


    if (isImageURL(productData.details)) {
     // Se o productData.details for uma URL de imagem
     productDetailsImg.src = productData.details; //
    } else {
     // Se o productData.details for um texto
     productDetails.innerHTML = productData.details; //
    }


    function isImageURL(url) {
  return url.toLowerCase().startsWith('http');
}


    // Armazenar os dados do produto no localStorage ao carregar a página
    localStorage.setItem('productData', JSON.stringify(productData));
   }
  }

  // Limpar os dados do produto ao sair da página
  window.addEventListener('beforeunload', function() {
   localStorage.removeItem('productData');
  });

  // remover item do carrinho
  window.removeCartItem = function removeCartItem(event) {
   var removeButton = event.target;
   var cartItem = removeButton.closest('li');
   var cartItems = document.querySelector('.cart-items .shopping-list');
   cartItems.removeChild(cartItem);

   // Atualiza o número total de itens no carrinho
   var cartCount = document.querySelectorAll('.cart-items .total-items');
   for (var i = 0; i < cartCount.length; i++) {
    var totalCount = parseInt(cartCount[i].textContent) - 1;
    cartCount[i].textContent = totalCount;
   }

   // Calcula e exibe o total do carrinho
   updateCartTotal();

   // Remove o item do banco de dados
   var item = removeButton.getAttribute('data-itemId');
   var itemId = item;

   console.log(itemId);

   removeCartItemFromDatabase(itemId);
  }

  // Função para remover o item do banco de dados
  function removeCartItemFromDatabase(itemId) {
   const usuarioId = userIdFromDB;
   const idItem = itemId;
   const usuarioRef = `${usuarioId}_usuario`;
   const carrinhoId = `${usuarioId}_carrinho`;
   const item = `${usuarioId}_item_${idItem}`;
   const carrinhoRef = ref(database, `usuarios/${usuarioRef}/carrinho/${carrinhoId}/itens/${item}`);

   // Remove o item do banco de dados
   remove(carrinhoRef)
    .then(() => {
     console.log("Item" + carrinhoRef + "removido do banco de dados com sucesso!")
    })
    .catch((error) => {
     console.error("Erro ao remover o item do banco de dados:", error);
    });
  }

  // Variável global para armazenar o produto selecionado ao clicar em add ao carrinho
  window.selectedProduct = null;

  // Função para adicionar um item ao carrinho
  function addToCart() {
   // Coleta os dados do produto
   var productTitle = document.getElementById('product-title').textContent;
   var productImage = document.getElementById('product-image1').src;
   var productPrice = document.getElementById('product-price').textContent.replace('R$', '').replace(',', '.');

   var productQuantity = parseInt(document.querySelector('.quantity select').value);
   var productId = document.getElementById('product-title').dataset.id;

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

   // Cria o objeto do item do carrinho
   var cartItem = {
    title: productTitle,
    image: productImage,
    price: productPrice,
    quantity: productQuantity,
    colors: selectedColors,
    id: productId
   };

   // Armazena o produto selecionado na variável global
   selectedProduct = cartItem;




   // Cria o elemento do item do carrinho
   var cartItem = document.createElement('li');
   cartItem.innerHTML = `
    <a href="javascript:void(0)" class="remove" title="Remove this item" data-itemId="${productId}"><i class="lni lni-close"></i></a>
    <div class="cart-img-head">
      <a class="cart-img"><img class="img-cart" src="${productImage}" alt="#"></a>
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


   // Calcula e exibe o total do carrinho
   enviarProdutoParaBanco(selectedProduct);
   updateCartTotal();
   loadCartData();

  }

  // Função para carregar os dados do carrinho do banco de dados
  function loadCartData() {
   const usuariosRef = ref(database, "usuarios");
   const usuarioId = userIdFromDB;
   const usuarioRef = `${usuarioId}_usuario`;
   const carrinhoId = `${usuarioId}_carrinho`;
   const carrinhoRef = ref(database, `usuarios/${usuarioRef}/carrinho/${carrinhoId}`);

   // Escuta as alterações no carrinho do usuário
   onValue(carrinhoRef, (snapshot) => {
    const carrinhoData = snapshot.val();

    if (carrinhoData && carrinhoData.itens) {
     const cartItems = Object.values(carrinhoData.itens);

     // Limpa os itens existentes no carrinho
     var cartItemsContainer = document.querySelector('.cart-items .shopping-list');
     cartItemsContainer.innerHTML = '';

     cartItems.forEach((item) => {
      var cartItem = document.createElement('li');
      cartItem.innerHTML = `
          <a href="javascript:void(0)" onclick="removeCartItem(event);" class="remove" title="Remove this item" data-itemId="${item.id}"><i class="lni lni-close"></i></a>
          <div class="cart-img-head">
            <a class="cart-img" href="#"><img src="${item.imagem}" alt="#"></a>
          </div>
          <div class="content">
            <h4><a href="product-details.html">${item.titulo}</a></h4>
            <p class="quantity">${item.quantidade}x - <span class="amount">R$${(item.preco_unitario * item.quantidade).toFixed(2)}</span></p>
            ${item.cores_selecionadas ? `<p class="color">Cores: ${item.cores_selecionadas.join(', ')}</p>` : ''}
          </div>
        `;
      cartItemsContainer.appendChild(cartItem);
     });

     // Atualiza o número total de itens no carrinho
     var cartCount = document.querySelectorAll('.cart-items .total-items');
     for (var i = 0; i < cartCount.length; i++) {
      var totalCount = cartItems.length;
      cartCount[i].textContent = totalCount;
     }

     // Calcula e exibe o total do carrinho
     updateCartTotal();
    }
   });
  }

  var carrinho = document.querySelector('.main-btn');
  if (carrinho) {
   onAuthStateChanged(auth, (user) => {
    if (user) {
     loadCartData();
     console.log(userIdFromDB); // O usuário está autenticado, exiba o conteúdo apropriado
    } else {
     
    }
   });
  }

  // Função para calcular e exibir o total do carrinho
  function updateCartTotal() {
   var cartItems = document.querySelectorAll('.cart-items .shopping-list li');
   var total = 0;

   for (var i = 0; i < cartItems.length; i++) {
    var amountElement = cartItems[i].querySelector('.amount');
    var amount = parseFloat(amountElement.textContent.replace('R$', ''));
    var quantityElement = cartItems[i].querySelector('.quantity');
    var quantity = parseInt(quantityElement.textContent);
    total += amount;
   }

   // Atualiza o total do carrinho
   var totalAmountElement = document.querySelector('.cart-items .total-amount');
   totalAmountElement.textContent = 'R$' + total.toFixed(2);
  }

  // Função para enviar dados do carrinho para o banco de dados
  function enviarParaBanco(cartData) {
   const usuarioId = userIdFromDB;
   const usuarioRef = `${usuarioId}_usuario`;
   const carrinhoId = `${usuarioId}_carrinho`;
   const carrinhoRef = ref(database, `usuarios/${usuarioRef}/carrinho/${carrinhoId}`);

   // Define os dados a serem enviados para o banco de dados
   const dataCriacao = new Date().toISOString();

   console.log("Tentando obter os dados do carrinho...");
   console.log(selectedProduct);

   // Verifica se o carrinho existe
   get(carrinhoRef)
    .then((snapshot) => {
     console.log("Dados do carrinho obtidos com sucesso!");

     let carrinhoData = {};

     try {
      carrinhoData = snapshot.val() || {};
      console.log("Dados do carrinho antes da atualização:", carrinhoData);
     } catch (error) {
      console.error("Erro ao obter os dados do carrinho:", error);
      return;
     }

     // Se o carrinho já existe, verifica o número do próximo item
     let proximoItemNumero = 1;
     if (carrinhoData.itens) {
      const itensKeys = Object.keys(carrinhoData.itens);
      const ultimoItemKey = itensKeys[itensKeys.length - 1];
      const ultimoItemNumero = parseInt(ultimoItemKey.split("_")[3]);

      proximoItemNumero = ultimoItemNumero + 1;
     } else {
      carrinhoData.itens = {}; // Inicializa carrinhoData.itens como um objeto vazio se for null
     }

     // Preenche os itens do carrinho com os dados da cartData
     cartData.forEach((item) => {
      // Verifica se o item já existe no carrinho
      let itemExistente = false;
      let itemIdExistente = null;
      for (const itemId in carrinhoData.itens) {
       const itemCarrinho = carrinhoData.itens[itemId];
       if (
        itemCarrinho.titulo === item.title &&
        itemCarrinho.id === item.id &&
        itemCarrinho.preco_unitario === item.price &&
        arraysEqual(itemCarrinho.cores_selecionadas, item.colors) &&
        itemCarrinho.quantidade === item.quantity
       ) {
        itemExistente = true;
        itemIdExistente = itemId;
        break;
       }
      }

      // Se o item existe no carrinho, atualiza as informações
      if (itemExistente) {
       const itemData = {
        titulo: item.title,
        preco_unitario: item.price,
        cores_selecionadas: item.colors,
        quantidade: item.quantity,
        imagem: item.image,
        id: item.id,
       };

       carrinhoData.itens[itemIdExistente] = itemData;
       console.log(`Item '${item.title}' atualizado no carrinho.`);
      } else {
       // Se o item não existe no carrinho, adiciona como um novo item
       let itemExistenteComDiferencas = false;
       let itemIdExistenteComDiferencas = null;

       for (const itemId in carrinhoData.itens) {
        const itemCarrinho = carrinhoData.itens[itemId];
        if (
         itemCarrinho.titulo === item.title &&
         arraysEqual(itemCarrinho.cores_selecionadas, item.colors)
        ) {
         itemExistenteComDiferencas = true;
         itemIdExistenteComDiferencas = itemId;
         break;
        }
       }

       if (itemExistenteComDiferencas) {
        const itemData = {
         titulo: item.title,
         preco_unitario: item.price,
         cores_selecionadas: item.colors,
         quantidade: item.quantity,
         imagem: item.image,
         id: item.id,
        };

        carrinhoData.itens[itemIdExistenteComDiferencas] = itemData;
        console.log(`Item '${item.title}' atualizado no carrinho com diferenças.`);
       } else {
        const itemId = `${usuarioId}_item_${item.id}`;
        const itemData = {
         id: item.id, // Adiciona o ID do produto ao objeto itemData
         titulo: item.title,
         preco_unitario: item.price,
         cores_selecionadas: item.colors,
         quantidade: item.quantity,
         imagem: item.image,
        };

        carrinhoData.itens[itemId] = itemData;
        console.log(`Novo item '${item.title}' adicionado ao carrinho.`);
        proximoItemNumero++;
       }
      }
     });

     // Atualiza a data de criação do carrinho
     carrinhoData.data_criacao = dataCriacao;

     console.log("Dados do carrinho após a atualização:", carrinhoData);

     // Envia os dados atualizados para o banco de dados
     set(carrinhoRef, carrinhoData)
      .then(() => {
       console.log("Dados enviados com sucesso!");
      })
      .catch((error) => {
       console.error("Erro ao enviar os dados:", error);
      });
    })
    .catch((error) => {
     console.error("Erro ao obter os dados do carrinho:", error);
    });

   // Função para comparar arrays
   function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
     return false;
    }
    for (let i = 0; i < arr1.length; i++) {
     if (arr1[i] !== arr2[i]) {
      return false;
     }
    }
    return true;
   }
  }

  // Função para enviar o produto individual para o banco de dados
  function enviarProdutoParaBanco() {
   // Verifica se há um produto selecionado
   if (selectedProduct) {
    // Envia o produto para o banco de dados
    enviarParaBanco([selectedProduct]);
    // Limpa o produto selecionado da variável global
    selectedProduct = null;
   } else {
    console.error('Nenhum produto selecionado para enviar para o banco de dados.');
   }
  }


var page = document.querySelector(".checkout-info");

if (page) {
 checkout();
}

  // Adiciona um listener de evento ao botão "addToCartButton"
  var addToCardButton = document.getElementById('addToCartButton');
  if (addToCardButton) {
   addToCartButton.addEventListener('click', function() {
    
    onAuthStateChanged(auth, (user) => {
    if (user) {
        
    addToCart();
    
     console.log(userIdFromDB);// O usuário está autenticado, exiba o conteúdo apropriado
    } else {
      alert("Faça login");// O usuário não está autenticado, exiba o conteúdo de visitante ou redirecione para a página de login
    }
  });
    
   });
  }





function redirectToPayment() {
  var selectedOption = document.querySelector("input[name='payment-method']:checked").id;

  // Armazenar a opção selecionada no localStorage
  localStorage.setItem("selectedOption", selectedOption);

  // Redirecionar para a página de pagamento com o parâmetro correspondente
  if (selectedOption === "pix") {
    window.location.href = "payment.html?option=pix";
  } else if (selectedOption === "picpay") {
    window.location.href = "payment.html?option=picpay";
  } else if (selectedOption === "boleto") {
    window.location.href = "payment.html?option=boleto";
  }
}

const spans= document.querySelectorAll(".total-span");


// Selecionar todos os elementos <span> com a mesma classe

// Iterar sobre os spans e verificar qual está visível
spans.forEach((span) => {
  if (window.getComputedStyle(span).display !== 'none') {
    // O elemento está visível, então defina o texto
    span.textContent = "BRL " + totalPayment;
  }
});




const time = document.querySelector(".time");

if(time) {

document.addEventListener("DOMContentLoaded", function() {
  var urlParams = new URLSearchParams(window.location.search);
  var option = urlParams.get("option");

  var pixForm = document.querySelector(".pix-form");
  var picpayForm = document.querySelector(".picpay-form");
  var boletoForm = document.querySelector(".boleto-form");

  // Esconder todos os formulários
  pixForm.style.display = "none";
  picpayForm.style.display = "none";
  boletoForm.style.display = "none";

  // Verificar se há uma opção selecionada no localStorage
  var selectedOption = localStorage.getItem("selectedOption");

  // Exibir o formulário correspondente com base na opção armazenada
  if (selectedOption === "pix") {
    pixForm.style.display = "block";
  } else if (selectedOption === "picpay") {
    picpayForm.style.display = "block";
  } else if (selectedOption === "boleto") {
    boletoForm.style.display = "block";
  } else {
    // Se nenhuma opção estiver armazenada, exibir o formulário com base no parâmetro da URL
    if (option === "pix") {
      pixForm.style.display = "block";
    } else if (option === "picpay") {
      picpayForm.style.display = "block";
    } else if (option === "boleto") {
      boletoForm.style.display = "block";
    }
  }


});

}

var btnfinish = document.getElementById('checkbtn-finish');
if(btnfinish) {
btnfinish.onclick = redirectToPayment;
}




if (typeof modulePix !== 'undefined') {
console.log(totalPayment);
const Pix = modulePix;
const pix = new Pix(
 "08507487980",
 "Muambas Shop Turvo LTDA",
 "Felipe Pires",
 "Turvo",
 "5776869",
 totalPayment
);

const payload = pix.getPayload();

console.log(payload);

const inputPix = document.getElementById('myInput');
inputPix.innerHTML = payload;

  // O módulo existe, execute o código relacionado ao módulo aqui
} else {
   // O módulo não está definido ou não foi carregado corretamente
  // Faça algo para lidar com essa situação, como exibir uma mensagem de erro
}









/* onAuthStateChanged(auth, (user) => {
 if (user) {

  console.log(userIdFromDB); // O usuário está autenticado, exiba o conteúdo apropriado
 } else {
  alert("Faça login"); // O usuário não está autenticado, exiba o conteúdo de visitante ou redirecione para a página de login
 }
});*/