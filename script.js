// Vetor principal para armazenar todos os alunos
let alunos = [];

// Índice do aluno atualmente selecionado para lançamento de notas
let alunoSelecionadoIndex = -1;

/**
 * Função para carregar o conteúdo de uma página HTML dinamicamente.
 * @param {string} pageName - O nome do arquivo da página (ex: 'home', 'cadastro').
 */
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById('content-area').innerHTML = html;

        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add active class to the corresponding button
        const clickedButton = document.querySelector(`.nav-btn[onclick="loadPage('${pageName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }

        // Run specific functions after content is loaded
        if (pageName === 'home') {
            atualizarEstatisticas();
        } else if (pageName === 'cadastro') {
            listarAlunos();
        } else if (pageName === 'notas') {
            atualizarSelectAlunos();
            document.getElementById('notasContainer').style.display = 'none'; // Hide notes container initially
        } else if (pageName === 'historico') {
            exibirHistorico();
        }
    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        document.getElementById('content-area').innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
}

/**
 * Função para cadastrar um novo aluno
 */
function cadastrarAluno() {
    const nomeInput = document.getElementById('nomeAluno');
    const frequenciaInput = document.getElementById('frequenciaAluno');

    if (!nomeInput || !frequenciaInput) return; // Ensure elements exist

    const nome = nomeInput.value.trim();
    const frequencia = parseFloat(frequenciaInput.value);

    // Validações
    if (!nome) {
        alert('Por favor, digite o nome do aluno!');
        return;
    }

    if (isNaN(frequencia) || frequencia < 0 || frequencia > 100) {
        alert('Por favor, digite uma frequência válida (0-100)!');
        return;
    }

    // Verifica se já existe um aluno com esse nome
    if (alunos.some(aluno => aluno.nome.toLowerCase() === nome.toLowerCase())) {
        alert('Já existe um aluno cadastrado com esse nome!');
        return;
    }

    // Cria objeto do aluno e adiciona ao vetor
    const novoAluno = {
        nome: nome,
        frequencia: frequencia,
        notas: [],
        media: 0,
        aprovado: null
    };

    alunos.push(novoAluno);

    // Limpa os campos
    nomeInput.value = '';
    frequenciaInput.value = '';

    // Atualiza a lista de alunos
    listarAlunos();

    alert(`Aluno ${nome} cadastrado com sucesso!`);
}

/**
 * Função para listar todos os alunos cadastrados
 */
function listarAlunos() {
    const container = document.getElementById('alunosCadastrados');
    if (!container) return; // Ensure element exists

    if (alunos.length === 0) {
        container.innerHTML = '<p>Nenhum aluno cadastrado ainda.</p>';
        return;
    }

    let html = '';
    alunos.forEach((aluno, index) => {
        html += `
            <div class="student-card">
                <h4>${aluno.nome}</h4>
                <p><strong>Frequência:</strong> ${aluno.frequencia}%</p>
                <p><strong>Notas:</strong> ${aluno.notas.length > 0 ? aluno.notas.join(', ') : 'Nenhuma nota lançada'}</p>
                ${aluno.media > 0 ? `<p><strong>Média:</strong> ${aluno.media.toFixed(1)}</p>` : ''}
                <button class="btn btn-danger" onclick="removerAluno(${index})">Remover</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Função para remover um aluno
 * @param {number} index - Índice do aluno no vetor
 */
function removerAluno(index) {
    if (confirm(`Deseja realmente remover o aluno ${alunos[index].nome}?`)) {
        alunos.splice(index, 1);
        listarAlunos();
        atualizarSelectAlunos();
    }
}

/**
 * Função para atualizar o select de alunos na página de notas
 */
function atualizarSelectAlunos() {
    const select = document.getElementById('selectAluno');
    if (!select) return; // Ensure element exists

    select.innerHTML = '<option value="">Selecione um aluno...</option>';

    alunos.forEach((aluno, index) => {
        select.innerHTML += `<option value="${index}">${aluno.nome}</option>`;
    });
}

/**
 * Função chamada quando um aluno é selecionado para lançamento de notas
 */
function selecionarAluno() {
    const select = document.getElementById('selectAluno');
    const notasContainer = document.getElementById('notasContainer');
    const nomeAlunoSelecionado = document.getElementById('nomeAlunoSelecionado');

    if (!select || !notasContainer || !nomeAlunoSelecionado) return; // Ensure elements exist

    const index = parseInt(select.value);

    if (isNaN(index)) {
        notasContainer.style.display = 'none';
        alunoSelecionadoIndex = -1;
        return;
    }

    alunoSelecionadoIndex = index;
    const aluno = alunos[index];

    // Mostra o container de notas
    notasContainer.style.display = 'block';
    nomeAlunoSelecionado.textContent = `Notas de ${aluno.nome}`;

    // Exibe notas existentes
    exibirNotasExistentes();

    // Limpa o campo de nova nota
    const novaNotaInput = document.getElementById('novaNota');
    if (novaNotaInput) {
        novaNotaInput.value = '';
    }
}

/**
 * Função para exibir as notas já lançadas do aluno selecionado
 */
function exibirNotasExistentes() {
    if (alunoSelecionadoIndex === -1) return; // No student selected

    const aluno = alunos[alunoSelecionadoIndex];
    const container = document.getElementById('notasExistentes');
    if (!container) return; // Ensure element exists

    if (aluno.notas.length === 0) {
        container.innerHTML = '<p>Nenhuma nota lançada ainda.</p>';
    } else {
        let html = '<h4>Notas já lançadas:</h4><div class="notes-input">';
        aluno.notas.forEach(nota => {
            html += `<span style="background: #e2e8f0; padding: 8px 15px; border-radius: 6px; font-weight: bold;">${nota}</span>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // Exibe média se houver notas
    exibirMediaAluno();
}

/**
 * Função para adicionar uma nova nota ao aluno selecionado
 */
function adicionarNota() {
    if (alunoSelecionadoIndex === -1) {
        alert('Selecione um aluno primeiro!');
        return;
    }

    const novaNotaInput = document.getElementById('novaNota');
    if (!novaNotaInput) return; // Ensure element exists

    const nota = parseFloat(novaNotaInput.value);

    if (isNaN(nota) || nota < 0 || nota > 10) {
        alert('Por favor, digite uma nota válida (0-10)!');
        return;
    }

    // Adiciona a nota ao vetor de notas do aluno
    alunos[alunoSelecionadoIndex].notas.push(nota);

    // Calcula a nova média
    calcularMedia(alunoSelecionadoIndex);

    // Atualiza a exibição
    exibirNotasExistentes();

    // Limpa o campo
    novaNotaInput.value = '';

    alert(`Nota ${nota} adicionada com sucesso!`);
}

/**
 * Função para calcular a média de um aluno
 * @param {number} index - Índice do aluno no vetor
 */
function calcularMedia(index) {
    const aluno = alunos[index];

    if (aluno.notas.length === 0) {
        aluno.media = 0;
        aluno.aprovado = null;
        return;
    }

    // Calcula a média das notas
    const soma = aluno.notas.reduce((acc, nota) => acc + nota, 0);
    aluno.media = soma / aluno.notas.length;

    // Define se está aprovado ou reprovado
    aluno.aprovado = aluno.media >= 6;
}

/**
 * Função para exibir a média do aluno selecionado
 */
function exibirMediaAluno() {
    if (alunoSelecionadoIndex === -1) return; // No student selected

    const aluno = alunos[alunoSelecionadoIndex];
    const container = document.getElementById('mediaAluno');
    if (!container) return; // Ensure element exists

    if (aluno.notas.length === 0) {
        container.innerHTML = '';
        return;
    }

    const resultClass = aluno.aprovado ? 'aprovado' : 'reprovado';
    const resultText = aluno.aprovado ? 'APROVADO' : 'REPROVADO';

    container.innerHTML = `
        <div class="result ${resultClass}">
            Média: ${aluno.media.toFixed(1)} - ${resultText}
        </div>
    `;
}

/**
 * Função para exibir o histórico completo de todos os alunos
 */
function exibirHistorico() {
    const container = document.getElementById('historicoContainer');
    if (!container) return; // Ensure element exists

    if (alunos.length === 0) {
        container.innerHTML = '<p>Nenhum aluno cadastrado ainda.</p>';
        return;
    }

    let html = '';
    alunos.forEach(aluno => {
        const cardClass = aluno.aprovado === null ? '' : (aluno.aprovado ? '' : 'reprovado');
        const resultClass = aluno.aprovado === null ? '' : (aluno.aprovado ? 'aprovado' : 'reprovado');
        const resultText = aluno.aprovado === null ? 'Sem notas' : (aluno.aprovado ? 'APROVADO' : 'REPROVADO');

        html += `
            <div class="student-card ${cardClass}">
                <h3>${aluno.nome}</h3>
                <p><strong>Frequência:</strong> ${aluno.frequencia}%</p>
                <p><strong>Notas:</strong> ${aluno.notas.length > 0 ? aluno.notas.join(', ') : 'Nenhuma nota lançada'}</p>
                ${aluno.notas.length > 0 ? `
                    <p><strong>Média:</strong> ${aluno.media.toFixed(1)}</p>
                    <div class="result ${resultClass}">${resultText}</div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Função para atualizar as estatísticas na página home
 */
function atualizarEstatisticas() {
    const totalAlunosElem = document.getElementById('totalAlunos');
    const totalAprovadosElem = document.getElementById('totalAprovados');
    const totalReprovadosElem = document.getElementById('totalReprovados');
    const mediaGeralElem = document.getElementById('mediaGeral');

    if (!totalAlunosElem || !totalAprovadosElem || !totalReprovadosElem || !mediaGeralElem) {
        return; // Exit if elements are not present (e.g., when not on home page)
    }

    const totalAlunos = alunos.length;
    let totalAprovados = 0;
    let totalReprovados = 0;
    let somaMedias = 0;
    let alunosComNotas = 0;

    alunos.forEach(aluno => {
        if (aluno.aprovado === true) {
            totalAprovados++;
            somaMedias += aluno.media;
            alunosComNotas++;
        } else if (aluno.aprovado === false) {
            totalReprovados++;
            somaMedias += aluno.media;
            alunosComNotas++;
        }
    });

    const mediaGeral = alunosComNotas > 0 ? (somaMedias / alunosComNotas) : 0;

    // Atualiza os elementos na tela
    totalAlunosElem.textContent = totalAlunos;
    totalAprovadosElem.textContent = totalAprovados;
    totalReprovadosElem.textContent = totalReprovados;
    mediaGeralElem.textContent = mediaGeral.toFixed(1);
}

// Initial load of the home page is handled in index.html now.
// The functions for updating stats, listing students, etc., are now called by loadPage().