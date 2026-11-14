// Main Application Controller & UI Interaction Glue for 4 Tabs

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Navigation Tab Switching (4 Tabs)
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const bannerBadge = document.getElementById('bannerBadge');
  const bannerTitle = document.getElementById('bannerTitle');
  const bannerDesc = document.getElementById('bannerDesc');
  const obsActionRow = document.getElementById('observationActionRow');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update active nav-tab styling
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panel
      tabPanels.forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
      });

      const activePanel = document.getElementById(`panel-${target}`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
        activePanel.classList.add('active', 'animate-fadeIn');
      }

      // Update simulation mode and top banner
      if (window.sim) {
        window.sim.currentTab = target;

        if (target === 'observation') {
          if (bannerBadge) bannerBadge.textContent = '1';
          if (bannerTitle) bannerTitle.textContent = 'Mục 1: Quan Sát Thí Nghiệm Truyền Áp Suất Chất Lỏng';
          if (bannerDesc) bannerDesc.textContent = 'Xem cấu tạo các dụng cụ thí nghiệm ở bảng bên phải. Bấm nút "Chạy mẫu" để quan sát hệ thống tự động đặt 4 quả cân bên trái và 2 quả cân bên phải.';
          if (obsActionRow) obsActionRow.classList.remove('hidden');
          window.sim.carLiftActive = false;
        } else if (target === 'practice') {
          if (bannerBadge) bannerBadge.textContent = '2';
          if (bannerTitle) bannerTitle.textContent = 'Mục 2: Học Sinh Tự Thực Hành Thí Nghiệm & Ghi Số Liệu';
          if (bannerDesc) bannerDesc.textContent = 'Dùng nút [+] / [-] ở khay quả cân (hoặc kéo thả) để thay đổi số quả cân. Bấm "Ghi số liệu" để ghi lại kết quả vào bảng đo.';
          if (obsActionRow) obsActionRow.classList.add('hidden');
          window.sim.carLiftActive = false;
        } else if (target === 'conclusion') {
          if (bannerBadge) bannerBadge.textContent = '3';
          if (bannerTitle) bannerTitle.textContent = 'Mục 3: Trả Lời Câu Hỏi Củng Cố & Mở Khóa Kết Luận';
          if (bannerDesc) bannerDesc.textContent = 'Trả lời 5 câu hỏi trắc nghiệm bên phải để kiểm tra độ hiểu bài và mở khóa nội dung Kết luận định luật Pascal!';
          if (obsActionRow) obsActionRow.classList.add('hidden');
          window.sim.carLiftActive = false;
          if (window.quiz) window.quiz.init();
        } else if (target === 'application') {
          if (bannerBadge) bannerBadge.textContent = '4';
          if (bannerTitle) bannerTitle.textContent = 'Mục 4: Ứng Dụng Thực Tế - Máy Nâng Ô Tô Thủy Lực';
          if (bannerDesc) bannerDesc.textContent = 'Bấm nút "BƠM KÍCH NÂNG XE" bên phải để xem người thợ dùng lực nhỏ bơm chất lỏng nâng bổng ô tô 1.5 tấn!';
          if (obsActionRow) obsActionRow.classList.add('hidden');
          window.sim.loadCarLiftMode();
        }

        window.sim.calculatePhysics();
        window.sim.updateTelemetry();
      }

      if (window.sound) window.sound.playClick();
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // 2. Sound Toggle Button
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.sound) {
        const isEnabled = window.sound.toggleSound();
        if (soundIcon) {
          soundIcon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
          soundIcon.className = `w-4 h-4 ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`;
        }
        if (soundText) {
          soundText.textContent = isEnabled ? 'Âm thanh' : 'Đã tắt';
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // 3. Global Reset Button
  const resetBtn = document.getElementById('resetSimBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.sim) {
        window.sim.resetToInitial();
      }
    });
  }

  // 4. Ratio Slider in Practice Mode
  const ratioSlider = document.getElementById('ratioSlider');
  const ratioDisplay = document.getElementById('ratioDisplay');
  if (ratioSlider) {
    ratioSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (ratioDisplay) ratioDisplay.textContent = `${val.toFixed(1)}×`;
      if (window.sim) window.sim.setRatio(val);
    });
  }

  // 5. Toggle Options (Pressure Vectors, Particles, Ruler)
  const toggleVectors = document.getElementById('toggleVectors');
  const toggleParticles = document.getElementById('toggleParticles');
  const toggleRuler = document.getElementById('toggleRuler');

  if (toggleVectors) {
    toggleVectors.addEventListener('change', (e) => {
      if (window.sim) window.sim.showVectors = e.target.checked;
    });
  }

  if (toggleParticles) {
    toggleParticles.addEventListener('change', (e) => {
      if (window.sim) window.sim.showParticles = e.target.checked;
    });
  }

  if (toggleRuler) {
    toggleRuler.addEventListener('change', (e) => {
      if (window.sim) window.sim.showRuler = e.target.checked;
    });
  }

  // Initial Quiz Initialization
  if (window.quiz) {
    window.quiz.init();
  }
});
