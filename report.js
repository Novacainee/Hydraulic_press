// Practical Lab Report Data Manager

class ReportManager {
  constructor() {
    this.records = [];
    this.tableBody = document.getElementById('reportTableBody');
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('khtn8_pascal_report');
      if (data) {
        this.records = JSON.parse(data);
      }
    } catch (e) {
      this.records = [];
    }
    this.render();
  }

  saveToStorage() {
    try {
      localStorage.setItem('khtn8_pascal_report', JSON.stringify(this.records));
    } catch(e) {}
  }

  addRecord(record) {
    this.records.push({
      id: this.records.length + 1,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      ...record
    });
    this.saveToStorage();
    this.render();
  }

  clearData() {
    if (this.records.length === 0) return;
    if (confirm('Bạn có chắc muốn xoá toàn bộ bảng số liệu đo lường không?')) {
      this.records = [];
      this.saveToStorage();
      this.render();
    }
  }

  render() {
    if (!this.tableBody) return;

    if (this.records.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-slate-500 italic">
            Chưa có dữ liệu. Bấm "Ghi số liệu" để lưu các lần đo thí nghiệm!
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    this.records.forEach((r, idx) => {
      let statusColor = "text-emerald-400";
      if (r.status.includes('chìm') || r.status.includes('lệch')) {
        statusColor = "text-amber-400";
      }

      html += `
        <tr class="border-b border-slate-700/60 hover:bg-slate-800/40 transition">
          <td class="p-1.5 font-mono text-slate-400">#${idx + 1}</td>
          <td class="p-1.5 font-bold text-sky-300">${r.F1}</td>
          <td class="p-1.5 text-slate-300">${r.S1}</td>
          <td class="p-1.5 font-mono text-sky-400">${r.p1}</td>
          <td class="p-1.5 font-bold text-emerald-300">${r.F2}</td>
          <td class="p-1.5 text-slate-300">${r.S2}</td>
          <td class="p-1.5 font-mono text-emerald-400">${r.p2}</td>
          <td class="p-1.5 font-medium ${statusColor}">${r.status}</td>
        </tr>
      `;
    });

    this.tableBody.innerHTML = html;
  }
}

window.reportManager = new ReportManager();

