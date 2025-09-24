
(() => {
  const STORAGE_KEY = 'techman_data_v1';

  function seedIfEmpty() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return;
 
    const perfis = [
      { id: 1, nome: 'Administrador' },
      { id: 2, nome: 'Técnico' },
      { id: 3, nome: 'Operador' }
    ];

    const usuarios = [
      { id: 1, nome: 'Admin Teste', senha: '123456', perfilId: 1 },
      { id: 2, nome: 'Tec. Cati', senha: '222222', perfilId: 2 },
      { id: 3, nome: 'Oper Maria', senha: '333333', perfilId: 3 }
    ];

    const obj = { perfis, usuarios, equipamentos, comentarios, nextId: { equipamento: 4, comentario: 4 } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj, null, 2));
  }

  seedIfEmpty();

  const display = document.getElementById('display');
  const msg = document.getElementById('msg');
  const enterBtn = document.getElementById('enter');
  const clearBtn = document.getElementById('clear');
  const numButtons = Array.from(document.querySelectorAll('.num'));

  let pin = '';

  function updateDisplay() {
    display.textContent = '*'.repeat(pin.length) + '-'.repeat(6 - pin.length);
    enterBtn.disabled = pin.length !== 6;
    if (pin.length === 6) msg.textContent = '';
  }

  numButtons.forEach(b => {
    b.addEventListener('click', () => {
      if (pin.length >= 6) return;
      pin += b.dataset.num;
      updateDisplay();
    });
  });

  clearBtn.addEventListener('click', () => {
    pin = '';
    updateDisplay();
    msg.textContent = '';
  });

enterBtn.addEventListener('click', () => {
  if (pin.length !== 6) return;
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const usuario = (data.usuarios || []).find(u => u.senha === pin);

  if (usuario) {
    sessionStorage.setItem('techman_user', JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      perfil: data.perfis.find(p => p.id === usuario.perfilId)?.nome
    }));

    msg.textContent = ` Bem-vindo, ${usuario.nome}`;
    msg.style.color = 'green';
    
    window.location.href = 'app.html';
  } else {
    msg.textContent = ' ERRO: Senha incorreta.';
    msg.style.color = 'red';
    pin = '';
  }
});

  updateDisplay();
})();
