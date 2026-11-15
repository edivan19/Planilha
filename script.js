const STORAGE_KEY = "controleFinanceiroLancamentos";

let lancamentos = carregarDados();
let meuGrafico = null;

const formulario = document.getElementById("finance-form");
const corpoTabela = document.getElementById("table-body");
const filtroMes = document.getElementById("filtro-mes");

const campoId = document.getElementById("edit-id");
const campoItem = document.getElementById("item");
const campoCategoria = document.getElementById("categoria");
const campoTipo = document.getElementById("tipo");
const campoValor = document.getElementById("valor");
const campoData = document.getElementById("data");

const botaoSalvar = document.getElementById("btn-salvar");
const botaoCancelar = document.getElementById("btn-cancelar");

function carregarDados() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentos));
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function obterLancamentosFiltrados() {
  const mesSelecionado = filtroMes.value;

  if (!mesSelecionado) {
    return lancamentos;
  }

  return lancamentos.filter((lancamento) =>
    lancamento.data.startsWith(mesSelecionado),
  );
}

function atualizarSistema() {
  const dados = obterLancamentosFiltrados();

  let totalReceitas = 0;
  let totalDespesas = 0;

  dados.forEach((lancamento) => {
    const valor = Number(lancamento.valor);

    if (lancamento.tipo === "receita") {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  document.getElementById("total-receita").textContent =
    formatarMoeda(totalReceitas);

  document.getElementById("total-despesa").textContent =
    formatarMoeda(totalDespesas);

  document.getElementById("saldo-final").textContent = formatarMoeda(saldo);

  renderizarTabela(dados);
  atualizarGrafico(totalReceitas, totalDespesas);
}

function renderizarTabela(dados) {
  corpoTabela.replaceChildren();

  if (dados.length === 0) {
    const linha = document.createElement("tr");
    const coluna = document.createElement("td");

    coluna.colSpan = 6;
    coluna.textContent = "Nenhum lançamento encontrado.";
    coluna.className = "empty-message";

    linha.appendChild(coluna);
    corpoTabela.appendChild(linha);
    return;
  }

  const ordenados = [...dados].sort((a, b) => b.data.localeCompare(a.data));

  ordenados.forEach((lancamento) => {
    const linha = document.createElement("tr");

    const descricao = document.createElement("td");
    descricao.textContent = lancamento.item;

    const categoria = document.createElement("td");
    categoria.textContent = lancamento.categoria;

    const tipo = document.createElement("td");
    tipo.textContent = lancamento.tipo === "receita" ? "Receita" : "Despesa";

    tipo.className =
      lancamento.tipo === "receita" ? "type-receita" : "type-despesa";

    const valor = document.createElement("td");
    valor.textContent = formatarMoeda(lancamento.valor);

    const data = document.createElement("td");
    data.textContent = formatarData(lancamento.data);

    const acoes = document.createElement("td");

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.className = "btn-edit";
    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", () => {
      editarLancamento(lancamento.id);
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "btn-delete";
    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", () => {
      excluirLancamento(lancamento.id);
    });

    acoes.append(botaoEditar, botaoExcluir);

    linha.append(descricao, categoria, tipo, valor, data, acoes);

    corpoTabela.appendChild(linha);
  });
}

function atualizarGrafico(receitas, despesas) {
  const contexto = document.getElementById("myChart");

  if (meuGrafico) {
    meuGrafico.destroy();
  }

  meuGrafico = new Chart(contexto, {
    type: "doughnut",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [
        {
          data: [receitas, despesas],
          backgroundColor: ["#219653", "#d64545"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  const item = campoItem.value.trim();
  const categoria = campoCategoria.value.trim();
  const tipo = campoTipo.value;
  const valor = Number(campoValor.value);
  const data = campoData.value;

  if (!item || !categoria || !data || !Number.isFinite(valor) || valor <= 0) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  if (tipo !== "receita" && tipo !== "despesa") {
    alert("Selecione um tipo válido.");
    return;
  }

  const id = campoId.value;

  if (id) {
    const indice = lancamentos.findIndex((lancamento) => lancamento.id === id);

    if (indice !== -1) {
      lancamentos[indice] = {
        id,
        item,
        categoria,
        tipo,
        valor,
        data,
      };
    }
  } else {
    lancamentos.push({
      id: `${Date.now()}-${Math.random()}`,
      item,
      categoria,
      tipo,
      valor,
      data,
    });
  }

  salvarDados();
  formulario.reset();
  campoId.value = "";
  campoData.value = new Date().toLocaleDateString("en-CA");
  botaoSalvar.textContent = "Adicionar lançamento";
  botaoCancelar.hidden = true;

  atualizarSistema();
});

function editarLancamento(id) {
  const lancamento = lancamentos.find((item) => item.id === id);

  if (!lancamento) return;

  campoId.value = lancamento.id;
  campoItem.value = lancamento.item;
  campoCategoria.value = lancamento.categoria;
  campoTipo.value = lancamento.tipo;
  campoValor.value = lancamento.valor;
  campoData.value = lancamento.data;

  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.hidden = false;

  formulario.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function excluirLancamento(id) {
  const confirmar = confirm("Deseja realmente excluir este lançamento?");

  if (!confirmar) return;

  lancamentos = lancamentos.filter((lancamento) => lancamento.id !== id);

  salvarDados();
  atualizarSistema();

  if (campoId.value === id) {
    cancelarEdicao();
  }
}

function cancelarEdicao() {
  formulario.reset();
  campoId.value = "";
  campoData.value = new Date().toLocaleDateString("en-CA");
  botaoSalvar.textContent = "Adicionar lançamento";
  botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", cancelarEdicao);

document.getElementById("btn-limpar").addEventListener("click", function () {
  if (lancamentos.length === 0) {
    alert("Não existem lançamentos para excluir.");
    return;
  }

  const confirmar = confirm(
    "Deseja excluir TODOS os lançamentos? Essa ação não pode ser desfeita.",
  );

  if (!confirmar) return;

  lancamentos = [];

  salvarDados();
  cancelarEdicao();
  atualizarSistema();
});

filtroMes.addEventListener("change", atualizarSistema);

campoData.value = new Date().toLocaleDateString("en-CA");

atualizarSistema();
