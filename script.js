// ----------------------------------------------------------------------
// 1. VARIÁVEIS GLOBAIS
// São acessíveis à partir de qualquer função JavaScript.
// ----------------------------------------------------------------------

// Procura pelo elemento com o ID "txt-nova-tarefa" no documento HTML
const txt_nova_tarefa = document.querySelector("#txt-nova-tarefa");
// Procura pelo elemento com o ID "btn-nova-tarefa" no documento HTML
const btn_nova_tarefa = document.querySelector("#btn-nova-tarefa");
// Procura pelo elemento com o ID "lista-tarefas" no documento HTML
const lista_tarefas = document.querySelector("#lista-tarefas");

// Carrega o áudio reproduzido ao "Concluir" uma tarefa
const audioConcluir = new Audio('sound/gmae.wav');
//força o navegador a pre-carregar o audio para evitar atrasos na reproduçao
audioConcluir.preload = "auto";

//variavel global que controla a exibibiçao da modal "excluir atrefa"
const modalExcluir = new bootstrap.Modal(document.getElementById('exampleModal'));

// variavel global que armazena a tarefa que sera excluida
let id_tarefa_excluir;

// ----------------------------------------------------------------------
// 2. FUNÇÕES DE LÓGICA
// ----------------------------------------------------------------------

function iniciaToDo() {
    // alert("Olá mundo!");
    
    // Associa função "adicionarTarefa()" ao evento de clicar no botão de "Adicionar" nova tarefa
    btn_nova_tarefa.addEventListener("click", adicionarTarefa);
    // Associa função "adicionarTarefaEnter()" ao evento de pressionar qualquer tecla
    // no campo de "Adicionar nova tarefa"
    txt_nova_tarefa.addEventListener("keypress", adicionarTarefaEnter);

    // Carrega as tarefas salvas no cookie do navegador web ao carregar a pagina 
    const arrayTarefas = obterTarefasDoNavegador();
    // Limpa os cooies de tarefas ao navegador web antes de chamar a funçao "adicionarTarefas",
    // Ja que a funçao "adicionarTarefa()" adiciona as tarefas aos cookies do navegador wweb 
    // e se nao limpar o cookie antes de chamar a funçao "adicionarTarefa()", teriamos tarefas duplicadas no cookie
    salvarKookieTarefas([]);
    arrayTarefas.forEach(strTarefa => {
        adicionarTarefa(strTarefa);
    });
    
    // Permite arrastar e soltar as tarefas com o pressionar do mouse para alterar sua ordem de exibiçao
    lista_tarefas.querySelectorAll("li").forEach(li => makeDraggable(li));
}

function adicionarTarefa(strTarefa) {
    // Se a tarefa recebida nao for uma variavel do tipo 'string' (ex.: evento de clique no botao 'Adicionar' tarefa) ou for vazia
    if (typeof strTarefa !== 'string' || strTarefa == null) {
        // Atribui como valor da variavel 'srtTarefa' o texto digitado na caixa de texto 'Adiciona nova tarefa'
        strTarefa = txt_nova_tarefa.value;
    }

    // Se a caixa de texto de "Adicionar nova tarefa" não está vazia
    // .trim() remove espaços em branco do começo e fim do valor do campo
    if (strTarefa.trim() !== "") {
        const btn_item = `
        <div>
        <button class="btn btn-success btn-sm me-2 btn-concluir" onclick="concluirTarefa(this)">Concluir</button>
        <button class="btn btn-danger btn-sm btn-excluir" onclick="obterIDTarefaExcluir(this);modalExcluir.show()">Excluir</button>
        </div>
        `;
        
        // Cria um novo item de lista
        const item = document.createElement("li");
        item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        // Adiciona o texto digitado na caixa de texto e os botões para concluir e excluir a tarefa.
        // "span" permite aplicar formatações em linha
        // "w-75" limita o nome da tarefa à 75% da largura da linha, deixando 25% da largura restante reservado para os botões
        // "text-truncate" corta e adiciona reticências (três pontos ...) em nomes de tarefas que excedem 75% da largura da linha
        item.innerHTML = "<span class='w-75 text-truncate'>" + strTarefa + "</span>" + btn_item;

        // Adiciona suporte a arrastar e soltar ao novo item da lista de tarefas
        makeDraggable(item);
        // Ao terminar de arrastar o item, reordena ele no cookie do navegador web para que, ao carregar a pagina,
        // A tarefa seja exibida na nova posiçao em que ele foi arrastada
        item.addEventListener("dragend", () => {
            let arrayTarefas = []; // Cria um vetor vazio
            // Para cada tarefa, conforme sua nova ordem na lista de tarefas apos arrastar e soltar os elementos
            Array.from(lista_tarefas.children).forEach(i => {
                arrayTarefas.push(i.querySelector("span").textContent); // Adiciona a tarefa ao vetor de tarefas
            });
            salvarKookieTarefas(arrayTarefas); // Atualiza o cookie com a nova ordem da lista das tarefas
        });

        // Adiciona a nova tarefa aos cookies do navegador wweb
        adicionarTarefaAoCookie(strTarefa);
        
        // Adiciona o item a lista de tarefas
        lista_tarefas.append(item);
    }
    // Limpa o campo de texto de "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.value = "";
    // Seleciona o campo "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.focus();
}

function adicionarTarefaEnter(evento) {
    // Se a tecla pressionada for igual a "Enter"
    if (evento.key == "Enter") {
        // Chama a função JavaScript "adicionarTarefa()"
        adicionarTarefa();
    }
}

function concluirTarefa(btn_concluir) {
    // Reproduz o áudio ao clicar no botão de "Concluir"
    audioConcluir.play();
    
    // Joga 50 confettis na tela
    for (let i = 0; i <= 5; i++) {
        confetti();
    }
    
    // atualiza o ID da tarefa a ser excluida e
    // passa com paramentro o botao de "concluir"
    obterIDTarefaExcluir(btn_concluir);
    
    // chama a funçao JS "excluirTarefa()".
    excluirTarefa();
}

function excluirTarefa() {
    // Remove a tarefa do cookie do navegador web
    const arrayTarefas = obterTarefasDoNavegador(); // Carrega as tarefas para um vetor a partir do cookie do navegador web
    arrayTarefas.splice(id_tarefa_excluir, 1); // Remove 1 tarefa do vetor apartir do ID da tarefa excluida 
    salvarKookieTarefas(arrayTarefas); // Atualiza o cookie do navegador web apos excluir a tarefa
    // remove o item da lista de tarefas
    lista_tarefas.removeChild(lista_tarefas.children[id_tarefa_excluir]);
    //fecha amodal de "excluir tarefa"
    modalExcluir.hide();
    
}

function obterIDTarefaExcluir(btn) {
    // encontra o elmento HTML "li" (item) pai mais proximo do
    // botao de "excluir" ou "excluir" clickando.
    //perceba que na funçao JS "obterIDTarefaExcluir()", o botao clickado e
    // recebido como parametro da funçao (btn).
    const item = btn.closest("li");
    const tarefas = Array.from (lista_tarefas.children);
    //por exemplo, se temos tres tarefas e excluimos a ultima tarefa,
    //id_tarefa_excluir sera definido para "3" que e o ID da tarefa excluida.
    id_tarefa_excluir = tarefas.indexOf(item);
}

// ---------------------------------------------------------------------
// 3. KOOKIES
// Adiciona funcionalidade de kookies (persistencia) das tarefas adicionadas
// (mantem as tarefas adicionadas mesmo ao fechar ou atualizar a pagina)
// ---------------------------------------------------------------------

const CHAVE_TAREFAS_TODO = 'tarefas_todo';

function obterTarefasDoNavegador() {
// Tenta ler o kookie do navegador
try {
    const cookie = localStorage.getItem(CHAVE_TAREFAS_TODO);
    if (cookie) {
        // Se o cookie existir, retorna o cookie
        return JSON.parse(cookie);
    }
} catch (e) {
    console.error("Falha ao ler o kookie do armazenamento local.");
}
// Retorna um vetor vazio em caso de falha
return [];
}

function salvarKookieTarefas(arrayTarefas) {
    try {
        // Salva as tarefas em formato JSON no navegador web
        // Voce pode visualizar os itens salvos no navegador web em:
        // Botao doreito na pagina > Inspencionar > Application > Storange > Local storage
        localStorage.setItem(CHAVE_TAREFAS_TODO, JSON.stringify(arrayTarefas)); 
    } catch (e) {
        console.error("ERRO: Falha ao salvar as tarefas no navegador. Erro: ", e);
    }
}

function adicionarTarefaAoCookie(strTarefa) {
    const arrayTarefas = obterTarefasDoNavegador(); // Obtem as tarefas atuais do cookie do navegador web em formato de vetor
    arrayTarefas.push(strTarefa); // Adiciona a tarefa recebida como parametro da funçao ao cookie do navegador web
    salvarKookieTarefas(arrayTarefas); // Salva o cookie com a tarefa adicionada no navegador web
}

// ----------------------------------------------------------------------
// 4. ESCUTADORES DE EVENTOS E INÍCIO
// ----------------------------------------------------------------------

iniciaToDo();