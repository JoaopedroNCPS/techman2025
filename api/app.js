(() => {
  const STORAGE_KEY = 'techman_data_v1';

  if (!localStorage.getItem(STORAGE_KEY)) {
    const data = {
      perfis: [
        { id: 1, nome: 'Administrador' },
        { id: 2, nome: 'Técnico' },
        { id: 3, nome: 'Gerente' }
      ],
      usuarios: [
        { id: 1, nome: 'Admin Teste', email: 'admin@techman.local', perfilId: 1 }
      ],
      equipamentos: [],
      comentarios: [],
      nextId: { equipamento: 1, comentario: 1 }
    };

    const csvEquipamentos = `
id;equipamento;imagem;descricao;ativo;data
1;Torno Mecçnico 500mm Modelo BV20L 220V - TTM520 - Tander;Torno_Mecanico_500mm.png;"O Torno Mecçnico Tander TTM520 ç uma ferramenta utilizada por vçrios profissionais na confecão e acabamento de inçmeras peças metçlicas, tais como: eixos, polias, pinos, roscas, peças cilçndricas internas e externas, cones, esferas, entre outros. 
2;Processador Intel Core i9-7920X Skylake, Cache 16.5MB, 2.9GHz (4.3GHz Max Turbo), LGA 2066 - BX80673I97920X;Intel_Core_i9.png;"Com esse processador inovador e incrçvel vocç desfruta ao mçximo o verdadeiro potencial do seu computador e desfruta da mais pura velocidade. Maximize o seu desempenho seja trabalhando, jogando, navegando ou assistindo o seu filme preferido, com esse processador vocç pode tudo!";1;2019-10-01 15:00:20.873
3;Monitor, Dell, U2518D, UltraSharp, Preto e Suporte em Alumçnio, 25""";Monitor_Dell.png;"Dç vida ao seu trabalho com uma tela de 25 polegadas quase sem bordas que conta com detalhes em cores vçvidas e consistentes graças a tecnologia hdr, resoluão qhd e çngulo de visço ultra-amplo. Aumente sua performance com os recursos dell display manager, dell easy arrange e trabalhe confortavelmente graça a um suporte totalmente ajustçvel e recurso confortview.";0;2018-10-01 10:00:20.000
4;Mouse Gamer Razer Deathadder Essential çptico 5 Botçes 4G 6.400 DPI;Mouse_Razer.png;"Nada melhor do que um mouse gamer com tecnologia de ponta para qualificar seus comandos e aprimorar suas jogadas nos games. Com este Mouse Gamer Razer, sua atuaão nas batalhas gamers serço ainda mais bem-sucedidas, com desempenho acima da mçdia e desenvoltura arrasadora, que vai deixar seus oponentes impressionados. O mouse Razer Deathadder Essential tem sensor çptico de 6400 DPI de 4G, 5 botçes, design moderno e ergonçmico, especialmente projetado para jogadores destros, e uma empunhadura lateral emborrachada que garante mais firmeza ao manuseio do equipamento, melhorando as respostas obtidas pelos players. O mouse Razer ainda oferece ajuste de sensibilidade, pezinhos Ultraslick silenciosos, cabo ultra resistente de fibra trançada e Modo Always-On, que mantçm o mouse ligado mesmo quando o equipamento estiver inativo. ç um mouse gamer Razer para ninguçm botar defeito, com todas as funães e especificaães tçcnicas que vocç precisa para ter mais produtividade nos jogos. O Razer Deathadder Essential ç realmente essencial e ainda tem o diferencial de estar habilitado para Razer Synapse 3 e de ser compatçvel com PC e Mac, com porta USB. Conheça o modelo e faça um investimento seguro!";1;2017-10-01 09:00:20.000
5;All-in-One Media Keyboard;Teclado_Microsoft.png;"O All-in-One Media Keyboard é o dispositivo ideal para sua sala ou home office. Com teclado em tamanho natural e trackpad multitoque integrado, é possível digitar, passar o dedo, arrastar, fazer zoom e clicar facilmente. O teclado com teclas de atalho de mçdia personalizçveis permite que a Web e suas mçsicas, fotos e filmes favoritos estejam a seu alcance. O teclado tambçm tem um design resistente, portanto, nço ç necessçrio se preocupar com esbarrçes, quedas ou derramamentos comuns. O All-in-One Media Keyboard ç tudo o que vocç precisa para digitar confortavelmente e navegar sem esforço.";0;2017-10-01 13:00:00.000
`;

    function parseCSV(csv, delimiter = ';') {
      const lines = [];
      let currentLine = [];
      let inQuotes = false;
      let field = '';
      for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];
        if (char === '"' && csv[i - 1] !== '\\') {
          inQuotes = !inQuotes;
          continue;
        }
        if (!inQuotes && char === delimiter) {
          currentLine.push(field);
          field = '';
          continue;
        }
        if (!inQuotes && (char === '\n' || (char === '\r' && nextChar === '\n'))) {
          currentLine.push(field);
          lines.push(currentLine);
          currentLine = [];
          field = '';
          if (char === '\r') i++;
          continue;
        }
        field += char;
      }
      if (field) currentLine.push(field);
      if (currentLine.length) lines.push(currentLine);

      const headers = lines.shift();
      return lines.map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
    }

    data.equipamentos = parseCSV(csvEquipamentos)
      .map(e => ({
        id: Number(e.id),
        nome: e.equipamento,
        imagemUrl: e.imagem,
        descricao: e.descricao,
        ativo: e.ativo === '1',
        dataInclusao: e.data
      }));

    data.nextId.equipamento = data.equipamentos.length + 1;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  }

  const sessionRaw = sessionStorage.getItem('techman_user');
  if (!sessionRaw) return window.location.href = 'index.html';
  const currentUser = JSON.parse(sessionRaw);

  const btnLogout = document.getElementById('btnLogout');
  const btnNovoEquip = document.getElementById('btnNovoEquip');
  const equipListEl = document.getElementById('equipList');
  const modalComments = document.getElementById('modalComments');
  const modalAddComment = document.getElementById('modalAddComment');
  const modalNewEquip = document.getElementById('modalNewEquip');
  const modalConfirmDelete = document.getElementById('modalConfirmDelete');
  const commentsContainer = document.getElementById('commentsContainer');
  const btnOpenAddComment = document.getElementById('btnOpenAddComment');
  const txtComment = document.getElementById('txtComment');
  const btnSaveComment = document.getElementById('btnSaveComment');
  const inpEquipName = document.getElementById('inpEquipName');
  const inpEquipImage = document.getElementById('inpEquipImage');
  const inpEquipDesc = document.getElementById('inpEquipDesc');
  const inpEquipAtivo = document.getElementById('inpEquipAtivo');
  const btnCreateEquip = document.getElementById('btnCreateEquip');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  let currentEquipId = null;
  let toDeleteEquipId = null;

  if (currentUser.perfil !== 'Administrador') btnNovoEquip.style.display = 'none';

  function loadData() { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return data; }
  function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2)); }
  function clearForms() { txtComment.value=''; btnSaveComment.disabled=true; inpEquipName.value=''; inpEquipImage.value=''; inpEquipDesc.value=''; inpEquipAtivo.checked=true; btnCreateEquip.disabled=true; }
  function escapeHtml(s) { return s ? s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;') : ''; }
  function openModal(mod) { mod.classList.remove('hidden'); }
  function closeParentModal(e) { e.target.closest('.modal').classList.add('hidden'); clearForms(); }

  function renderEquipList() {
    loadData();
    const list = (data.equipamentos||[]).filter(e => e.ativo);
    equipListEl.innerHTML='';
    if (!list.length) { equipListEl.innerHTML='<p>Nenhum equipamento ativo encontrado.</p>'; return; }
    list.sort((a,b)=> new Date(b.dataInclusao) - new Date(a.dataInclusao));
    list.forEach(e=>{
      const item=document.createElement('div');
      item.className='equip-item';
      let imgSrc='assets/placeholder.jpg';
      if(e.imagemUrl && e.imagemUrl.trim()) imgSrc = /^https?:\/\//.test(e.imagemUrl)? e.imagemUrl : 'assets/' + e.imagemUrl;
      item.innerHTML=`
        <img src="${imgSrc}" alt="${escapeHtml(e.nome)}" />
        <div class="equip-body">
          <h4>${escapeHtml(e.nome)}</h4>
          <p class="desc">${escapeHtml(e.descricao||'')}</p>
          <div class="equip-actions">
            <button class="btn-comment" data-id="${e.id}">Comentários</button>
            ${currentUser.perfil==='Administrador'?`<button class="btn-delete" data-id="${e.id}">🗑 Excluir</button>`:''}
          </div>
        </div>
      `;
      equipListEl.appendChild(item);
    });
    document.querySelectorAll('.btn-comment').forEach(b=> b.addEventListener('click', ev=> { currentEquipId = Number(ev.currentTarget.dataset.id); openComments(currentEquipId); }));
    document.querySelectorAll('.btn-delete').forEach(b=> b.addEventListener('click', ev=> { toDeleteEquipId = Number(ev.currentTarget.dataset.id); openModal(modalConfirmDelete); }));
  }

  function openComments(equipId) {
    loadData();
    const comments = (data.comentarios||[]).filter(c=>c.equipamentoId===equipId).sort((a,b)=> new Date(b.dataInclusao)-new Date(a.dataInclusao));
    commentsContainer.innerHTML='';
    if(!comments.length) commentsContainer.innerHTML='<p>Sem comentários.</p>';
    else comments.forEach(c=>{
      const user=(data.usuarios||[]).find(u=>u.id===c.usuarioId)||{};
      const perfil=(data.perfis||[]).find(p=>p.id===user.perfilId)||{};
      const div=document.createElement('div');
      div.className='comment';
      div.innerHTML=`
        <div class="comment-header">
          <strong>${escapeHtml(user.nome||'Usuário')}</strong>
          <span class="tag">${escapeHtml(perfil.nome||'')}</span>
          <span class="date">${new Date(c.dataInclusao).toLocaleString()}</span>
        </div>
        <div class="comment-body">${escapeHtml(c.texto)}</div>
      `;
      commentsContainer.appendChild(div);
    });
    openModal(modalComments);
  }

  btnLogout.addEventListener('click', ()=>{ sessionStorage.removeItem('techman_user'); window.location.href='index.html'; });
  btnNovoEquip.addEventListener('click', ()=>{ openModal(modalNewEquip); checkCreateEquipForm(); });
  [inpEquipName, inpEquipImage, inpEquipDesc].forEach(inp=> inp.addEventListener('input', checkCreateEquipForm));
  btnCreateEquip.addEventListener('click', ()=>{
    const nome=inpEquipName.value.trim();
    let img=inpEquipImage.value.trim();
    const desc=inpEquipDesc.value.trim();
    const ativo=inpEquipAtivo.checked;
    if(!nome||!img||!desc) return;
    if(!img.startsWith("http")&&!img.startsWith("assets/")) img="assets/"+img;
    loadData();
    const id=data.nextId.equipamento||1;
    const novo={id,nome,imagemUrl:img,descricao:desc,ativo,dataInclusao:new Date().toISOString()};
    data.equipamentos.push(novo);
    data.nextId.equipamento=id+1;
    saveData();
    closeParentModal({target:btnCreateEquip});
    renderEquipList();
  });
  function checkCreateEquipForm(){ btnCreateEquip.disabled=!(inpEquipName.value.trim() && inpEquipImage.value.trim() && inpEquipDesc.value.trim()); }

  btnOpenAddComment.addEventListener('click', ()=>{
    closeParentModal({target:btnOpenAddComment});
    openModal(modalAddComment);
    txtComment.value='';
    btnSaveComment.disabled=true;
  });
  txtComment.addEventListener('input', ()=>{ btnSaveComment.disabled = !txtComment.value.trim(); });
  btnSaveComment.addEventListener('click', ()=>{
    const texto=txtComment.value.trim();
    if(!texto) return;
    loadData();
    const id=data.nextId.comentario||1;
    const novo={id,equipamentoId:currentEquipId,usuarioId:currentUser.id,texto,dataInclusao:new Date().toISOString()};
    data.comentarios.push(novo);
    data.nextId.comentario=id+1;
    saveData();
    closeParentModal({target:btnSaveComment});
    alert('Sucesso! Comentário cadastrado.');
    renderEquipList();
  });
  btnConfirmDelete.addEventListener('click', ()=>{
    loadData();
    data.equipamentos = data.equipamentos.filter(e=>e.id!==toDeleteEquipId);
    saveData();
    closeParentModal({target:btnConfirmDelete});
    renderEquipList();
  });
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', e=>closeParentModal(e)));

  renderEquipList();
})();
