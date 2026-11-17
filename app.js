// Application Controller for 2 Tabs:
// Tab 1: Thí nghiệm về sự truyền áp suất của chất lỏng (Practice)
// Tab 2: Tiếng động trong tai (Ear Pressure Simulation)

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Navigation Tab Switching (2 Tabs)
  const navTabs = document.querySelectorAll('.nav-tab');
  const mainHydraulic = document.getElementById('mainSectionHydraulic');
  const mainEar = document.getElementById('mainSectionEar');

  const panelPractice = document.getElementById('panel-practice');
  const practiceTopActions = document.getElementById('practiceTopActions');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update active nav-tab styling
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (target === 'practice') {
        if (mainHydraulic) mainHydraulic.classList.remove('hidden');
        if (mainEar) mainEar.classList.add('hidden');

        if (panelPractice) panelPractice.classList.remove('hidden');
        if (practiceTopActions) practiceTopActions.classList.remove('hidden');

        if (window.sim) {
          window.sim.currentTab = 'practice';
          window.sim.returnAllToRack();
          window.sim.resetToInitial();
          window.sim.calculatePhysics();
          window.sim.updateTelemetry();
        }
      } else if (target === 'ear-pressure') {
        // Ear Pressure Simulation Tab
        if (mainHydraulic) mainHydraulic.classList.add('hidden');
        if (mainEar) mainEar.classList.remove('hidden');

        if (window.earSim) {
          setTimeout(() => {
            window.earSim.resize();
            window.earSim.update3DTransform();
            if (window.earSim.selectedPartId) {
              window.earSim.selectPart(window.earSim.selectedPartId);
            }
          }, 50);
        }
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
          soundIcon.className = `w-4 h-4 ${isEnabled ? 'text-emerald-600' : 'text-slate-400'}`;
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
      const activeTab = document.querySelector('.nav-tab.active');
      const tabName = activeTab ? activeTab.dataset.tab : 'practice';

      if (tabName === 'ear-pressure') {
        if (window.earSim) {
          window.earSim.resetZoom();
          window.earSim.setSubMode('anatomy');
          window.earSim.initView();
          window.earSim.setStage(1);
        }
      } else {
        if (window.sim) {
          window.sim.resetToInitial();
        }
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

  // 6. Direct Tab Linking via URL Hash
  const hash = window.location.hash.replace('#', '');
  if (hash === 'ear-pressure' || hash === 'practice') {
    const targetTabBtn = document.querySelector(`.nav-tab[data-tab="${hash}"]`);
    if (targetTabBtn) targetTabBtn.click();
  }
});
