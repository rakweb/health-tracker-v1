// ====================== HEALTH TRACKER - Advanced Chart.js ======================

let entries = [];
let chartInstance = null;

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

function renderTable() { /* your table code */ }

function renderChart() {
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(document.getElementById('metricsChart'), {
    type: 'line',
    data: {
      labels: entries.map(e => e.date),
      datasets: [
        { label: 'Glucose', data: entries.map(e => e.glucose), borderColor: '#4ba3ff', yAxisID: 'y', tension: 0.3 },
        { label: 'Systolic', data: entries.map(e => e.sys), borderColor: '#ff5c5c', yAxisID: 'y1', tension: 0.3 },
        { label: 'Weight', data: entries.map(e => e.weightLbs), borderColor: '#27d79b', yAxisID: 'y2', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        annotation: {
          annotations: {
            line1: { type: 'line', yMin: 140, yMax: 140, borderColor: 'red', borderWidth: 2, borderDash: [6, 6] }
          }
        }
      },
      scales: {
        y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Glucose' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'BP' } },
        y2: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Weight' } }
      }
    }
  });
}

// All button listeners (Add Entry, Refresh, Save CSV, Save PDF, Theme, etc.)
document.addEventListener('DOMContentLoaded', () => {
  // ... your button listeners here (same as previous working version)
  renderChart();
});
