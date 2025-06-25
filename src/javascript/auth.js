import { auth, provider } from './firebase-init.js';
import { signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

export async function loginComGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Erro no login:', error);
    return null;
  }
}