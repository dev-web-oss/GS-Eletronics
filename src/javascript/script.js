import "./swiper-init.js";
import { carregarProdutosPorCategoria } from "./categorias.js";
import { loginComGoogle } from "./auth.js";
import { carregarDestaques } from "./destaque.js";
import "./carrinho.js";
import "./destaque.js";

// Inicialização após DOM pronto
document.addEventListener("DOMContentLoaded", () => {
  carregarDestaques();

  let prevScroll = window.scrollY;
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll > prevScroll && currentScroll > 100) {
      // Rolando para baixo
      header.style.top = "-100px"; // Esconde o header
    } else {
      // Rolando para cima
      header.style.top = "0";
    }

    prevScroll = currentScroll;
  });

  // categorias
  document.querySelectorAll(".categoria-card, .categoria-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.dataset.categoria === "TodosProdutos") {
        // Redireciona para a página que mostra todos os produtos
        window.location.href = "allProdutos.html"; // ajuste o caminho se necessário
      } else {
        carregarProdutosPorCategoria(btn.dataset.categoria);
      }
    })
  );

  // botões de login/avaliar
  document.addEventListener("click", async (e) => {
    if (e.target.id === "loginBtn" || e.target.id === "avaliarBtn") {
      const user = await loginComGoogle();
      if (!user) return;
      // enviarAvaliacao lida com inputs do formulário
      enviarAvaliacao();
    }

    if (e.target.id === "verTodas") {
      document.getElementById("modal").classList.remove("hidden");
    }
    if (e.target.id === "fecharModal") {
      document.getElementById("modal").classList.add("hidden");
    }
  });
});
