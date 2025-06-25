import { db } from "./firebase-init.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { comprarProdutoViaWhatsApp, adicionarAoCarrinho } from "./carrinho.js";
import "./carrinho.js";

const todasCategorias = [
  "Acessorio", "Antena", "CaboHDMI", "CaboDeCelular", "CaixaDeSom", "Campainha",
  "CapasDeCelular", "Carregadores", "CartoesDeMemoria", "Chaveiros", "CoposGarrafas",
  "Ferramentas", "FoneDeOuvido", "Lanterna", "Marmita", "Massageador",
  "MiniCompressor", "Mouse", "Projetores", "Radios", "RelogioSmartWatch", "Suporte", "VideoGame"
];

const selectCategoria = document.getElementById("selectCategoria");
const inputBusca = document.getElementById("inputBusca");
const listaProdutos = document.getElementById("lista-produtos");

document.addEventListener("DOMContentLoaded", () => {
  const categoriaSalva = localStorage.getItem("categoriaSelecionada");
  const buscaSalva = localStorage.getItem("termoBusca");
  const scrollPos = localStorage.getItem("scrollPos");

  if (categoriaSalva || buscaSalva) {
    selectCategoria.value = categoriaSalva || "Todos";
    inputBusca.value = buscaSalva || "";

    carregarProdutos(selectCategoria.value, buscaSalva || "").then(() => {
      const scrollPos = localStorage.getItem("scrollPos");

      if (scrollPos) {
        const tentaScroll = setInterval(() => {
          const algumCard = document.querySelector(".card-produto");
          if (algumCard) {
            window.scrollTo({ top: parseInt(scrollPos), behavior: "auto" });
            clearInterval(tentaScroll);

            // limpa o localStorage
            localStorage.removeItem("categoriaSelecionada");
            localStorage.removeItem("termoBusca");
            localStorage.removeItem("scrollPos");
          }
        }, 100);
      }
    });
  } else {
    carregarProdutos("Todos");
  }

  let prevScroll = window.scrollY;
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    header.style.top = currentScroll > prevScroll && currentScroll > 100 ? "-230px" : "0";
    prevScroll = currentScroll;
  });

  selectCategoria.addEventListener("change", () => {
    carregarProdutos(selectCategoria.value, inputBusca.value.trim().toLowerCase());
  });

  inputBusca.addEventListener("input", () => {
    carregarProdutos(selectCategoria.value, inputBusca.value.trim().toLowerCase());
  });
});

async function carregarProdutos(categoriaSelecionada, termoBusca = "") {
  listaProdutos.innerHTML = "<p>Carregando produtos...</p>";

  const categoriasParaBuscar =
    categoriaSelecionada === "Todos" ? todasCategorias : [categoriaSelecionada];

  let produtos = [];

  for (const cat of categoriasParaBuscar) {
    const ref = collection(db, `Categorias/${cat}/Produtos`);
    const snap = await getDocs(ref);

    snap.forEach((doc) => {
      const dados = doc.data();
      if (!dados.vendendo) return;
      produtos.push({
        id: doc.id,
        categoria: cat,
        ...dados
      });
    });
  }

  if (termoBusca) {
    produtos = produtos.filter((p) =>
      p.nome.toLowerCase().includes(termoBusca)
    );
  }

  if (produtos.length === 0) {
    listaProdutos.innerHTML = "<p style='text-align:center;'>Nenhum produto encontrado.</p>";
    return Promise.resolve(); // resolve mesmo que não tenha produtos
  }

  listaProdutos.innerHTML = "";

  produtos.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("card-produto");

    const nomeAbreviado = p.nome.length > 40 ? p.nome.slice(0, 40) + "..." : p.nome;
    const preco = Number(p.preco);
    const precoPromo = Number(p.precoPromocional);

    let precoFormatado = "";
    if (preco === 0) {
      precoFormatado = "Preço: <i>A combinar</i>";
    } else if (precoPromo > 0 && precoPromo < preco) {
      precoFormatado = `
        <small>De: <s>${preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</s></small><br>
        <strong>Por: ${precoPromo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
      `;
    } else {
      precoFormatado = `${preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    }

    card.innerHTML = `
      <img src="${p.imagem1}" alt="${p.nome}" />
      <div class="infoAllProduto">
        <h3 style="margin-top: 12px;">${nomeAbreviado}</h3>
        <p style="margin-top: 8px;">${precoFormatado}</p>
        <div>
          <button class="btn-comprar" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}">
            <i class="fa-solid fa-money-check-dollar"></i> Comprar
          </button>
          <button class="btn-add-carrinho" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}">
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
    `;

      card.addEventListener("click", (e) => {
        if (
          e.target.closest(".btn-add-carrinho") ||
          e.target.closest(".btn-comprar") ||
          e.target.closest(".quantidade-container")
        ) return;

        localStorage.setItem("scrollPos", window.scrollY);
        localStorage.setItem("categoriaSelecionada", selectCategoria.value);
        localStorage.setItem("termoBusca", inputBusca.value.trim().toLowerCase());

        window.location.href = `produto.html?id=${p.id}&categoria=${p.categoria}`;
      });

      const btnBuy = card.querySelector(".btn-comprar");
      const btnAdd = card.querySelector(".btn-add-carrinho");
      const qtdContainer = card.querySelector(".quantidade-container");
      const btnCancel = card.querySelector(".cancel");
      const btnMais = card.querySelector(".aumentar-qtd");
      const qtdValor = card.querySelector(".quantidade-valor");
      const btnMenos = card.querySelector(".diminuir-qtd");
      const btnConfirmar = card.querySelector(".confirmar-qtd");

      let quantidade = 1;

      btnBuy.addEventListener("click", (e) => {
        e.stopPropagation();
        const precoFinal = (precoPromo > 0 && precoPromo < preco) ? precoPromo : preco;
        comprarProdutoViaWhatsApp(p.nome, precoFinal);
      });

      btnAdd.addEventListener("click", (e) => {
        e.stopPropagation();
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
        const precoFinal = (precoPromo > 0 && precoPromo < preco) ? precoPromo : preco;
        adicionarAoCarrinho(p.id, p.nome, precoFinal, quantidade);
        qtdContainer.style.display = "none";
        btnBuy.style.display = "";
      });

      listaProdutos.appendChild(card);
  });

  return Promise.resolve(); // IMPORTANTE: indica que terminou
}
