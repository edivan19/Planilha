let myChart;

function updateAll() {
  let totalRec = 0;
  let totalDes = 0;

  const rows = document.querySelectorAll("#table-body tr");

  rows.forEach((row) => {
    const type = row.querySelector("select").value;
    const val = parseFloat(row.querySelector(".val-input").value) || 0;

    if (type === "receita") totalRec += val;
    else totalDes += val;
  });

  const saldo = totalRec - totalDes;

  // Atualiza os cards
  document.getElementById("total-receita").innerText =
    `R$ ${totalRec.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  document.getElementById("total-despesa").innerText =
    `R$ ${totalDes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  document.getElementById("saldo-final").innerText =
    `R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  renderChart(totalRec, totalDes);
}

function renderChart(rec, des) {
  const ctx = document.getElementById("myChart").getContext("2d");

  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [rec, des],
          backgroundColor: ["#2ecc71", "#e74c3c"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function addRow() {
  const body = document.getElementById("table-body");
  const row = document.createElement("tr");
  row.innerHTML = `
        <td><input type="text" placeholder="Ex: Mercado"></td>
        <td><input type="text" placeholder="Ex: Alimentação"></td>
        <td>
            <select onchange="updateAll()">
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
            </select>
        </td>
        <td><input type="number" class="val-input" value="0" onchange="updateAll()"></td>
        <td><button onclick="this.parentElement.parentElement.remove(); updateAll();" style="color:red; border:none; background:none; cursor:pointer;">✕</button></td>
    `;
  body.appendChild(row);
}

// Iniciar ao carregar a página
window.onload = updateAll;
