import { db } from "./firebase-init.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { adicionarAoCarrinho, comprarProdutoViaWhatsApp } from './carrinho.js';

let swiperAtual = null;

export async function carregarProdutosPorCategoria(categoriaId) {
  const container = document.getElementById("produtos");
  const botaoFechar = document.getElementById("fechar-produtos");

  if (swiperAtual) {
    swiperAtual.destroy(true, true);
    swiperAtual = null;
  }

  container.innerHTML = `
    <div class="swiper-container">
      <div class="swiper-wrapper"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-pagination"></div>
    </div>
  `;

  const swiperWrapper = container.querySelector(".swiper-wrapper");

  const produtosCol = collection(db, `Categorias/${categoriaId}/Produtos`);
  const produtosSnap = await getDocs(produtosCol);

  if (produtosSnap.empty) {
    swiperWrapper.innerHTML = `<p style="text-align: center; padding: 20px;">Nenhum produto encontrado.</p>`;
  } else {
    produtosSnap.forEach((produtoDoc) => {
      const dados = produtoDoc.data();

      // Se não estiver à venda, ignora o produto
      if (!dados.vendendo) return;

      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");

      const nomeAbreviado = dados.nome.length > 35 ? dados.nome.slice(0, 35) + "..." : dados.nome;

      let precoFormatado = "";

      const preco = Number(dados.preco);
      const precoPromocional = Number(dados.precoPromocional);

      if (preco === 0) {
        precoFormatado = "Preço: <i>A combinar</i>";
      } else if (precoPromocional > 0 && precoPromocional < preco) {
        const desconto = Math.round(((preco - precoPromocional) / preco) * 100);
        precoFormatado = `
          <small>De: <s>${preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</s></small><br>
          <strong>Por: ${precoPromocional.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })} <span style="color:red; font-size: 0.8em;">-${desconto}%</span></strong>
        `;
      } else {
        precoFormatado = preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }

      slide.innerHTML = `
        <div class="produto-card">
          <img src="${dados.imagem1}" alt="${dados.nome}">
          <div class="infoProduto">
            <h3 style="margin-top: 12px;">${nomeAbreviado}</h3>
            <p style="margin-top: 8px;">${precoFormatado}</p>
            <div>
              <button class="btn-comprar" data-id="${produtoDoc.id}" data-nome="${dados.nome}" data-preco="${dados.preco}">
                <i class="fa-solid fa-money-check-dollar"></i> Comprar
              </button>
              <button class="btn-add-carrinho" data-id="${produtoDoc.id}" data-nome="${dados.nome}" data-preco="${dados.preco}">
                <i class="fa-solid fa-cart-shopping"></i> Adicionar
              </button>
            </div>
            <div class="quantidade-container" style="display: none;">
              <div class="quantidade-controles">
                <button class="cancel"><i class="fa-solid fa-ban"></i></button>
                <button class="diminuir-qtd">-</button>
                <span class="quantidade-valor">1</span>
                <button class="aumentar-qtd">+</button>
              </div>
              <button class="confirmar-qtd">Confirmar</button>
            </div>
          </div>
        </div>
      `;


      // Referência aos elementos
      const btnBuy = slide.querySelector(".btn-comprar");
      const btnAdd = slide.querySelector(".btn-add-carrinho");
      const qtdContainer = slide.querySelector(".quantidade-container");
      const btnCancel = slide.querySelector(".cancel");
      const btnMais = slide.querySelector(".aumentar-qtd");
      const qtdValor = slide.querySelector(".quantidade-valor");
      const btnMenos = slide.querySelector(".diminuir-qtd");
      const btnConfirmar = slide.querySelector(".confirmar-qtd");

      let quantidade = 1;

      btnBuy.addEventListener("click", (e) => {
        e.stopPropagation();
        const nome = dados.nome;
        const precoFinal = (Number(dados.precoPromocional) > 0 && Number(dados.precoPromocional) < Number(dados.preco))
          ? Number(dados.precoPromocional)
          : Number(dados.preco);
        comprarProdutoViaWhatsApp(nome, precoFinal);
      });

      btnAdd.addEventListener("click", (e) => {
        btnBuy.style.display = "none";
        qtdContainer.style.display = "flex";
        quantidade = 1;
        qtdValor.textContent = quantidade;
      });

      btnCancel.addEventListener("click", (e) => {
        e.stopPropagation();
        qtdContainer.style.display = "none";
        btnBuy.style.display = "";
      });

      btnMais.addEventListener("click", (e) => {
        e.stopPropagation();
        quantidade++;
        qtdValor.textContent = quantidade;
      });

      btnMenos.addEventListener("click", (e) => {
        e.stopPropagation();
        if (quantidade > 1) {
          quantidade--;
          qtdValor.textContent = quantidade;
        }
      });

      btnConfirmar.addEventListener("click", (e) => {
        e.stopPropagation();
        const precoFinal = (Number(dados.precoPromocional) > 0 && Number(dados.precoPromocional) < Number(dados.preco))
          ? Number(dados.precoPromocional)
          : Number(dados.preco);
        adicionarAoCarrinho(produtoDoc.id, dados.nome, precoFinal, quantidade);
        qtdContainer.style.display = "none";
        btnBuy.style.display = "";
      });

      
      slide.addEventListener("click", (e) => {
        if (e.target.closest(".btn-add-carrinho")) return;
        window.location.href = `produto.html?id=${produtoDoc.id}&categoria=${categoriaId}`;
      });

      swiperWrapper.appendChild(slide);
    });
  }

  botaoFechar.style.display = "block";

  setTimeout(() => {
    swiperAtual = new Swiper(".swiper-container", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 1000,
      grabCursor: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1500: { slidesPerView: 3 },
      },
    });    
  }, 100);

  document.getElementById("fechar-produtos").addEventListener("click", () => {
    container.innerHTML = "";
    botaoFechar.style.display = "none";
    if (swiperAtual) {
      swiperAtual.destroy(true, true);
      swiperAtual = null;
    }
  });
}
