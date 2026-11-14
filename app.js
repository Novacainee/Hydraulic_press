// Main Application Controller & UI Interaction Glue

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Navigation Tab Switching
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const sgkBanner = document.getElementById('sgkStepBanner');

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

      // Contextual Banner visibility
      if (sgkBanner) {
        if (target === 'sgk') {
          sgkBanner.classList.remove('hidden');
        } else {
          sgkBanner.classList.add('hidden');
        }
      }

      // Configure Simulation mode
      if (window.sim) {
        if (target === 'sgk') {
          window.sim.mode = 'sgk';
          window.sim.applyScenario('balanced');
        } else if (target === 'sandbox') {
          window.sim.mode = 'sandbox';
          window.sim.carLiftActive = false;
        } else if (target === 'hydraulic-lift') {
          window.sim.loadCarLiftDemo();
        } else if (target === 'quiz') {
          if (window.quiz) window.quiz.init();
        } else if (target === 'report') {
          if (window.reportManager) window.reportManager.render();
        }
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

  // 3. Theory Guide Modal
  const guideBtn = document.getElementById('guideBtn');
  const guideModal = document.getElementById('guideModal');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const guideGotItBtn = document.getElementById('guideGotItBtn');

  const openModal = () => {
    if (guideModal) {
      guideModal.classList.remove('hidden');
      if (window.sound) window.sound.playClick();
    }
  };

  const closeModal = () => {
    if (guideModal) {
      guideModal.classList.add('hidden');
      if (window.sound) window.sound.playClick();
    }
  };

  if (guideBtn) guideBtn.addEventListener('click', openModal);
  if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeModal);
  if (guideGotItBtn) guideGotItBtn.addEventListener('click', closeModal);

  if (guideModal) {
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) closeModal();
    });
  }

  // 4. Reset Simulation Button
  const resetBtn = document.getElementById('resetSimBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.sim) {
        window.sim.clearWeights();
        window.sim.setRatio(2.0);
        window.sim.setFluid('water');
        window.sim.applyScenario('balanced');

        const ratioSlider = document.getElementById('ratioSlider');
        if (ratioSlider) ratioSlider.value = 2;
        const ratioDisplay = document.getElementById('ratioDisplay');
        if (ratioDisplay) ratioDisplay.textContent = '2.0×';

        document.querySelectorAll('.fluid-btn').forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    });
  }

  // 5. Ratio Slider in Sandbox Mode
  const ratioSlider = document.getElementById('ratioSlider');
  const ratioDisplay = document.getElementById('ratioDisplay');
  if (ratioSlider) {
    ratioSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (ratioDisplay) ratioDisplay.textContent = `${val.toFixed(1)}×`;
      if (window.sim) window.sim.setRatio(val);
    });
  }

  // 6. Fluid Type Selection Buttons
  const fluidButtons = document.querySelectorAll('.fluid-btn');
  fluidButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      fluidButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const fluid = btn.dataset.fluid;
      if (window.sim) window.sim.setFluid(fluid);
    });
  });

  // 7. Toggle Options (Pressure Vectors, Particles, Ruler)
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

