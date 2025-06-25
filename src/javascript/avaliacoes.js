import { db } from './firebase-init.js';
import {
  collection,
  query,
  orderBy,
  getDocs,
  setDoc,
  doc,
  where,
  serverTimestamp,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { auth, provider } from './firebase-init.js';

// Elementos do DOM
const loginBtn = document.getElementById('loginBtn');
const avaliacaoForm = document.getElementById('avaliacao-form');
const enviarBtn = document.getElementById('enviarAvaliacao');
const comentarioInput = document.getElementById('comentario');
const estrelasEls = Array.from(document.querySelectorAll('.stars span'));
const avaliacoesLista = document.getElementById('avaliacoes-lista');
const verTodasBtn = document.getElementById('verTodas');
const modal = document.getElementById('modal');
const fecharModal = document.getElementById('fecharModal');
const todasAvaliacoesDiv = document.getElementById('todasAvaliacoes');

let avaliacaoEstrelas = 0;
let nomeUsuario = '';
let fotoUsuario = '';
const FOTO_PADRAO = 'https://www.gravatar.com/avatar/?d=mp';

// Autenticação e exibição do formulário
loginBtn.addEventListener('click', async () => {
  const result = await signInWithPopup(auth, provider);
  nomeUsuario = result.user.displayName;
  fotoUsuario = result.user.photoURL || FOTO_PADRAO;
  loginBtn.classList.add('hidden');
  avaliacaoForm.classList.remove('hidden');
});

onAuthStateChanged(auth, user => {
  if (user) {
    nomeUsuario = user.displayName;
    fotoUsuario = user.photoURL || FOTO_PADRAO;
    loginBtn.classList.add('hidden');
    avaliacaoForm.classList.remove('hidden');
  }
});

// Seleção de estrelas
estrelasEls.forEach((star, index) => {
  star.addEventListener('mouseenter', () => {
    estrelasEls.forEach((s, i) => {
      s.classList.toggle('hovered', i <= index);
    });
  });

  star.addEventListener('mouseleave', () => {
    estrelasEls.forEach(s => s.classList.remove('hovered'));
  });

  star.addEventListener('click', () => {
    avaliacaoEstrelas = index + 1;
    estrelasEls.forEach((s, i) => {
      s.classList.toggle('selected', i < avaliacaoEstrelas);
    });
  });
});


// Função para gerar HTML de uma avaliação
function gerarHTML(av) {
  const stars = '★'.repeat(av.estrelas || 0) + '☆'.repeat(5 - (av.estrelas || 0));
  const foto = av.foto || FOTO_PADRAO;
  return `
    <div class="avaliacao">
      <img src="${foto}" alt="${av.nome}" class="avatar-usuario">
      <strong>${av.nome}</strong>
      <div class="starsAv">${stars}</div>
      <p>${av.comentario}</p>
    </div>
  `;
}

// Carrega avaliações do Firestore
export async function carregarAvaliacoes() {
  const q = query(
    collection(db, 'Avaliacoes'),
    orderBy('data', 'desc')
  );
  const snapshot = await getDocs(q);
  const avaliacoes = snapshot.docs.map(d => d.data());

  avaliacoesLista.innerHTML = '';
  todasAvaliacoesDiv.innerHTML = '';

  // mostra os 3 mais recentes
  avaliacoes.slice(0, 3).forEach(av => {
    avaliacoesLista.innerHTML += gerarHTML(av);
  });

  // todos no modal
  avaliacoes.forEach(av => {
    todasAvaliacoesDiv.innerHTML += gerarHTML(av);
  });

  // botão "Mais avaliações"
  verTodasBtn.classList.toggle('hidden', avaliacoes.length <= 3);

  // exibe/oculta área de avaliação
  if (avaliacoes.length === 0) {
    document.getElementById('user-area').classList.add('hidden');
    loginBtn.classList.remove('hidden');
  } else {
    document.getElementById('user-area').classList.remove('hidden');
  }
}

// Envia ou atualiza avaliação
export async function enviarAvaliacao() {
  const comentario = comentarioInput.value.trim();
  if (avaliacaoEstrelas === 0 || comentario === '') {
    alert('Preencha todas as informações');
    return;
  }
  const user = auth.currentUser;
  const email = user.email;

  const q = query(collection(db, 'Avaliacoes'), where('email', '==', email));
  const snap = await getDocs(q);
  const dados = {
    nome: nomeUsuario,
    email,
    foto: fotoUsuario,
    comentario,
    estrelas: avaliacaoEstrelas,
    data: serverTimestamp()
  };

  if (!snap.empty) {
    const ref = snap.docs[0].ref;
    await updateDoc(ref, dados);
  } else {
    await setDoc(doc(db, 'Avaliacoes', email), dados);
  }

  comentarioInput.value = '';
  estrelasEls.forEach(s => s.classList.remove('selected'));
  avaliacaoEstrelas = 0;
  carregarAvaliacoes();
}

// Listeners para modal
verTodasBtn.addEventListener('click', () => modal.classList.remove('hidden'));
fecharModal.addEventListener('click', () => modal.classList.add('hidden'));

// Botão enviar
enviarBtn.addEventListener('click', enviarAvaliacao);

// Carrega inicial
carregarAvaliacoes();