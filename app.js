// Streamlined Application Controller for Practice & Real-World Application

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Navigation Tab Switching (Practice & Application)
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const practiceTopActions = document.getElementById('practiceTopActions');
  const applicationTopActions = document.getElementById('applicationTopActions');

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

      // Update top actions
      if (target === 'practice') {
        if (practiceTopActions) practiceTopActions.classList.remove('hidden');
        if (applicationTopActions) applicationTopActions.classList.add('hidden');
      } else {
        if (practiceTopActions) practiceTopActions.classList.add('hidden');
        if (applicationTopActions) applicationTopActions.classList.remove('hidden');
      }

      // Reset weights back to rack when switching tabs
      if (window.sim) {
        window.sim.returnAllToRack();
        window.sim.currentTab = target;

        if (target === 'practice') {
          window.sim.resetToInitial();
        } else if (target === 'application') {
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
});
