import { db } from "./firebase-init.js";
import { iniciarSwiper } from "./swiper-init.js";
import {
  collectionGroup,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export async function carregarDestaques() {
  const destaqueContainer = document.getElementById("destaque-container");

  const destaquesQuery = query(
    collectionGroup(db, "Produtos"),
    where("destaque", "==", true)
  );

  const snapshot = await getDocs(destaquesQuery);

  if (snapshot.empty) {
    console.log("Nenhum produto em destaque encontrado.");
    return;
  }

  snapshot.forEach((doc) => {
    const produto = doc.data();
    const card = document.createElement("div");
    card.classList.add("swiper-slide");

    const preco = Number(produto.preco);
  const precoPromocional = Number(produto.precoPromocional);

  let precoFormatado = "";

  const temPromocao =
    produto.precoPromocional !== undefined &&
    produto.precoPromocional !== "" &&
    !isNaN(precoPromocional) &&
    precoPromocional > 0 &&
    precoPromocional < preco;

  if (preco === 0) {
    precoFormatado = "Preço: <i>A combinar</i>";
  } else if (temPromocao) {
    precoFormatado = `
      <div class="etiqueta-preco">
        <div class="preco-antigo">
          De: <s>${preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</s>
        </div>
        <div class="preco-promocional">
          Por: ${precoPromocional.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      </div>
    `;
  } else {
    precoFormatado = `<strong>${preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}</strong>`;
  }

  card.innerHTML = `
    <img src="${produto.imagem1}" alt="${produto.nome}" class="produto-imagem" />
    <div class="preco-tag preco-animado">
      <i class="fa-solid fa-tag"></i> ${precoFormatado}
    </div>
  `;
    destaqueContainer.appendChild(card);
  });

  setTimeout(iniciarSwiper, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  const btnEspaco = document.getElementById('btnProdutos');
  if (btnEspaco) {
    btnEspaco.addEventListener('click', () => {
      window.location.href = `allProdutos.html`;
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const btnEspaco = document.getElementById('btnWhats');
  if (btnEspaco) {
    btnEspaco.addEventListener('click', () => {
      window.open('https://wa.me/5511975410555');
    });
  }
});