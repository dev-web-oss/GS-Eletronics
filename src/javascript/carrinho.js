// carrinho.js
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.closest('#mobile_btn')) abrirCarrinho();
    if (target.closest('#fechar-carrinho')) fecharCarrinho();
  });
});

export function adicionarAoCarrinho(id, nome, preco, quantidade) {
  let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};

  if (carrinho[id]) {
    carrinho[id].quantidade += quantidade;
  } else {
    carrinho[id] = {
      nome,
      preco,
      quantidade
    };
  }

  sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function abrirCarrinho() {
  const carrinhoEl = document.getElementById('perfil');
  carrinhoEl.classList.add('ativo');
  listarCarrinho();
}

function fecharCarrinho() {
  const carrinhoEl = document.getElementById('perfil');
  carrinhoEl.classList.remove('ativo');
}

function listarCarrinho() {
  const carrinhoItens = document.getElementById('carrinho-itens');
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};

  carrinhoItens.innerHTML = '';
  let total = 0;

  Object.entries(carrinho).forEach(([id, item]) => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('item-carrinho');

    itemEl.innerHTML = `
      <strong>${item.nome}</strong><br>
      Quantidade: 
      <input type="number" min="1" value="${item.quantidade}" data-id="${id}" class="quantidade-input" style="width: 50px; margin: 10px; font-size: 20px" /><br>
      Preço: <strong>${
        Number(item.preco) === 0
          ? "A combinar"
          : `R$ ${(item.preco * item.quantidade).toFixed(2)}`
      }</strong><br>
      <button data-id="${id}" class="btn-remover">Remover</button><br>
    `;

    carrinhoItens.appendChild(itemEl);
    total += item.preco * item.quantidade;
  });

  const totalEl = document.createElement('div');
  totalEl.style.marginTop = '10px';
  totalEl.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
  carrinhoItens.appendChild(totalEl);

  // Após renderizar, ligar os eventos dos inputs e botões
  ativarEventosEdicao();
}

// Torna a função acessível globalmente
window.adicionarAoCarrinho = adicionarAoCarrinho;

//evento de comprar do botão "COMPRAR AGORA"
document.addEventListener('DOMContentLoaded', () => {
  const comprarBtn = document.getElementById('comprar-btn');
  if (comprarBtn) {
    comprarBtn.addEventListener('click', () => {
      const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};
      let mensagem = 'Esta é a minha lista de compras que eu fiz no site:%0A%0A';
      let totalGeral = 0;

      Object.values(carrinho).forEach(item => {
        const totalItem = item.preco * item.quantidade;
        totalGeral += totalItem;
        mensagem += `- Produto: ${item.nome}%0A`;
        mensagem += `  Quantidade: ${item.quantidade}%0A`;
        mensagem += `  Valor: ${
          Number(item.preco) === 0
            ? "A combinar"
            : `R$ ${totalItem.toFixed(2)}`
        }%0A%0A`;
      });

      mensagem += `VALOR TOTAL DA COMPRA: R$ ${totalGeral.toFixed(2)}%0A%0A`;
      mensagem += `Você tem essa lista a pronta entrega?`;

      const numeroWhatsApp = '5511919265754';
      const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

      window.open(url, '_blank');
    });
  }
});

//evento do botão de comprar do toggle
document.addEventListener('DOMContentLoaded', () => {
  const btnComprar = document.getElementById('btn-comprar');
  if (btnComprar) {
    btnComprar.addEventListener('click', () => {
      const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};
      let mensagem = 'Esta é a minha lista de compras que eu fiz no site:%0A%0A';
      let totalGeral = 0;

      Object.values(carrinho).forEach(item => {
        const totalItem = item.preco * item.quantidade;
        totalGeral += totalItem;
        mensagem += `- Produto: ${item.nome}%0A`;
        mensagem += `  Quantidade: ${item.quantidade}%0A`;
        mensagem += `  Valor: ${
          Number(item.preco) === 0
            ? "A combinar"
            : `R$ ${totalItem.toFixed(2)}`
        }%0A%0A`;
      });

      mensagem += `VALOR TOTAL DA COMPRA: R$ ${totalGeral.toFixed(2)}%0A%0A`;
      mensagem += `Você tem essa lista a pronta entrega?`;

      const numeroWhatsApp = '5511919265754';
      const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

      window.open(url, '_blank');
    });
  }
});

export function comprarProdutoViaWhatsApp(nome, preco) {
  const mensagem = `Vi este produto no site e gostei:%0A%0AProduto: ${nome}%0AValor: R$ ${parseFloat(preco).toFixed(2)}%0A%0AVoce tem ele a pronta entrega?`;
  const numeroWhatsApp = '5511919265754';
  const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
  window.open(url, '_blank');
}

function ativarEventosEdicao() {
  // Inputs de quantidade
  const inputsQuantidade = document.querySelectorAll('.quantidade-input');
  inputsQuantidade.forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      let novaQuantidade = parseInt(e.target.value);

      if (isNaN(novaQuantidade) || novaQuantidade < 1) {
        novaQuantidade = 1;
        e.target.value = 1;
      }

      atualizarQuantidade(id, novaQuantidade);
    });
  });

  // Botões remover
  const botoesRemover = document.querySelectorAll('.btn-remover');
  botoesRemover.forEach(botao => {
    botao.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      removerItemCarrinho(id);
    });
  });
}

function atualizarQuantidade(id, novaQuantidade) {
  let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};

  if (carrinho[id]) {
    carrinho[id].quantidade = novaQuantidade;
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    listarCarrinho(); // Re-renderiza a lista atualizada
  }
}

function removerItemCarrinho(id) {
  let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || {};

  if (carrinho[id]) {
    delete carrinho[id];
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    listarCarrinho(); // Re-renderiza a lista atualizada
  }
}