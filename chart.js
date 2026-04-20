document.addEventListener('DOMContentLoaded', () => {

  // Add Entry
  document.getElementById('btnAdd').addEventListener('click', () => {
    document.getElementById('entryModalTitle').textContent = 'Add Entry';
    document.getElementById('entryModal').classList.add('show');
  });

  // Save Entry
  document.getElementById('btnSaveEntry').addEventListener('click', () => {
    showToast('✅ Entry Saved');
    document.getElementById('entryModal').classList.remove('show');
  });

  // Refresh
  document.getElementById('btnRefresh').addEventListener('click', () => {
    showToast('✅ Refreshed');
  });

  // Select Fields
  document.getElementById('btnFields').addEventListener('click', () => {
    document.getElementById('fieldsModal').classList.add('show');
  });

  // Thresholds
  document.getElementById('btnThresholds').addEventListener('click', () => {
    document.getElementById('thModal').classList.add('show');
  });

  // Options
  document.getElementById('btnOptions').addEventListener('click', () => {
    document.getElementById('optModal').classList.add('show');
  });

  // Import CSV
  document.getElementById('btnImportCSV').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  showToast('✅ All buttons active');
});
