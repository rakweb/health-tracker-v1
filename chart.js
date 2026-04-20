let entries = [];
let chartInstance = null;

// Toast
function showToast(msg) {
  const toast = document.getElementById('updateToast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

window.UI = {
  closeEntry: () => document.getElementById('entryModal').classList.remove('show')
};

// Render
function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = entries.map((e, i) => `
    <tr>
      <td>${e.date || '—'}</td>
      <td>${e.glucose || '—'}</td>
      <td>${e.sys || '—'}/${e.dia || '—'}</td>
      <td>${e.weightLbs || '—'}</td>
      <td><button class="btn" onclick="editEntry(${i})">Edit</button>
          <button class="btn danger" onclick="deleteEntry(${i})">Delete</button></td>
    </tr>
  `).join('');
}

function renderChart() {
  if (chartInstance) chartInstance.destroy();
  const canvas = document.getElementById('metricsChart');
  if (!canvas) return;

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: entries.map(e => e.date),
      datasets: [
        { label: 'Glucose', data: entries.map(e => e.glucose), borderColor: '#4ba3ff' },
        { label: 'Systolic', data: entries.map(e => e.sys), borderColor: '#ff5c5c' }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

window.editEntry = function(i) { /* Add your full edit logic here */ };
window.deleteEntry = function(i) {
  if (confirm('Delete?')) {
    entries.splice(i, 1);
    renderTable();
    renderChart();
  }
};

// Main Button Handlers
document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('btnAdd').addEventListener('click', () => {
    document.getElementById('entryModal').classList.add('show');
  });

  document.getElementById('btnSaveEntry').addEventListener('click', () => {
    const entry = {
      date: document.getElementById('f_date').value,
      glucose: +document.getElementById('f_glucose').value,
      sys: +document.getElementById('f_sys').value,
      dia: +document.getElementById('f_dia').value,
      weightLbs: +document.getElementById('f_weightLbs').value
    };
    entries.unshift(entry);
    renderTable();
    renderChart();
    showToast('Entry Saved');
    UI.closeEntry();
  });

  document.getElementById('btnRefresh').addEventListener('click', () => {
    renderTable();
    renderChart();
    showToast('Refreshed');
  });

  document.getElementById('btnSaveCSV').addEventListener('click', () => showToast('CSV Exported'));
  document.getElementById('btnSavePDF').addEventListener('click', () => showToast('PDF Exported'));
  document.getElementById('btnFields').addEventListener('click', () => showToast('Fields Modal Opened'));
  document.getElementById('btnThresholds').addEventListener('click', () => showToast('Thresholds Opened'));
  document.getElementById('btnOptions').addEventListener('click', () => showToast('Options Opened'));

  // Sample Data
  entries = [
    {date:"2026-04-17", glucose:98, sys:118, dia:76, weightLbs:185},
    {date:"2026-04-16", glucose:105, sys:122, dia:80, weightLbs:186}
  ];

  renderTable();
  renderChart();
  showToast('App Loaded');
});
