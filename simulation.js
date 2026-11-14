// Simulation Physics & Canvas 2D Engine for Pascal Law & Hydraulic Press
// Updated: 10N weights, 6 weights max with on-canvas rack, strict stroke bounds, 4-tab workflow

class HydraulicSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Current tab mode: 'observation', 'practice', 'conclusion', 'application'
    this.currentTab = 'observation';

    // Physical parameters
    this.ratio = 2.0; // S1 / S2
    this.baseArea2 = 10; // cm^2
    this.area1 = 20; // cm^2 (Piston 1)
    this.area2 = 10; // cm^2 (Piston 2)

    // Weights configuration: exactly 6 weights total in system, each 10 N
    this.totalWeights = 6;
    this.weightVal = 10; // 10 N per weight
    this.weights1 = 0; // Number of weights on piston 1
    this.weights2 = 0; // Number of weights on piston 2

    // Displacements from reference equilibrium 0 (in virtual cm)
    // Positive h means pushed downward, negative h means lifted upward
    this.h1 = 0; // cm (Piston 1)
    this.h2 = 0; // cm (Piston 2)
    this.targetH1 = 0;
    this.targetH2 = 0;
    this.velocityH1 = 0;

    // Fluid properties
    this.fluidType = 'water'; // water

    // Visual options
    this.showVectors = true;
    this.showParticles = true;
    this.showRuler = true;

    // Particles for fluid flow visualization
    this.particles = [];
    this.initParticles(35);

    // Car Lift Mode Specifics
    this.carWeight = 15000; // 15,000 N (1.5 tons)
    this.carLiftActive = false;
    this.carLiftHeight = 0; // elevated distance in cm

    // Drag and Drop & Interaction State
    this.draggedFrom = null; // 'rack', 'piston1', 'piston2'
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    this.hoverTarget = null; // 1, 2, or 'rack'

    // Sample Demo running state
    this.isDemoRunning = false;
    this.demoTimeouts = [];

    // Geometry layout cache
    this.layout = {};

    // Animation & Sound State
    this.lastTime = performance.now();
    this.wasBalanced = true;

    this.bindEvents();
    this.resize();
    this.startLoop();
  }

  // Total remaining weights currently resting in the rack
  get rackWeights() {
    return Math.max(0, this.totalWeights - this.weights1 - this.weights2);
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        u: Math.random(),
        crossOffset: (Math.random() - 0.5) * 0.7,
        speed: (Math.random() * 0.4 + 0.8),
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.4 + 0.3
      });
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.updateLayout();
  }

  updateLayout() {
    const w = this.width;
    const h = this.height;

    // Base coordinates for U-tube system
    // Make cylinders tall and ensure top rim is well above maximum possible travel!
    const bottomY = h * 0.85;
    const cylinderHeight = h * 0.62;
    const topY = bottomY - cylinderHeight;
    const pipeHeight = Math.max(34, h * 0.08);

    // Equilibrium reference line sits at ~54% of cylinder height
    const centerY = bottomY - cylinderHeight * 0.48;

    // Cylinder widths proportional to sqrt(Area)
    const s1 = this.area1;
    const s2 = this.area2;
    const d1Ratio = Math.sqrt(s1 / s2);
    
    // Scale widths gracefully
    const baseW = Math.min(w * 0.15, 95);
    const width2 = baseW;
    const width1 = baseW * Math.min(d1Ratio, 2.2);

    // Positions of cylinders
    const spacing = Math.min(w * 0.28, 190);
    const cx1 = w * 0.38 - spacing * 0.5;
    const cx2 = w * 0.38 + spacing * 0.5;

    // Weight Rack position: placed prominently on the lab bench beside Cylinder 2
    const rackW = Math.min(180, w * 0.26);
    const rackH = 46;
    const rackX = Math.min(w - rackW - 16, cx2 + width2 * 0.5 + 45);
    const rackY = bottomY - rackH + 12;

    this.layout = {
      w, h,
      centerY,
      bottomY,
      topY,
      cylinderHeight,
      pipeHeight,
      // Cylinder 1 (Large)
      c1: {
        cx: cx1,
        width: width1,
        left: cx1 - width1 * 0.5,
        right: cx1 + width1 * 0.5,
        top: topY,
        bottom: bottomY,
      },
      // Cylinder 2 (Small)
      c2: {
        cx: cx2,
        width: width2,
        left: cx2 - width2 * 0.5,
        right: cx2 + width2 * 0.5,
        top: topY,
        bottom: bottomY,
      },
      // On-Canvas Weight Rack
      rack: {
        x: rackX,
        y: rackY,
        width: rackW,
        height: rackH
      },
      // Virtual scale: 1 cm virtual = N pixels
      scalePxlPerCm: cylinderHeight * 0.045
    };
  }

  setRatio(newRatio) {
    this.ratio = Math.max(1, Math.min(4, newRatio));
    this.area2 = this.baseArea2;
    this.area1 = this.baseArea2 * this.ratio;
    this.updateLayout();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  // Add 1 weight to piston from rack
  addWeightToPiston(pistonId) {
    if (this.rackWeights <= 0) {
      if (window.sound) window.sound.playClick();
      return;
    }

    if (pistonId === 1) {
      this.weights1++;
    } else {
      this.weights2++;
    }

    if (window.sound) window.sound.playClink();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  // Remove 1 weight from piston back to rack
  removeWeightFromPiston(pistonId) {
    if (pistonId === 1) {
      if (this.weights1 > 0) {
        this.weights1--;
        if (window.sound) window.sound.playClick();
      }
    } else {
      if (this.weights2 > 0) {
        this.weights2--;
        if (window.sound) window.sound.playClick();
      }
    }

    this.calculatePhysics();
    this.updateTelemetry();
  }

  // Return all weights from both pistons back to the rack
  returnAllToRack() {
    this.clearDemoTimeouts();
    this.weights1 = 0;
    this.weights2 = 0;
    this.carLiftActive = false;
    this.carLiftHeight = 0;
    if (window.sound) window.sound.playClick();
    this.calculatePhysics();
    this.updateTelemetry();
  }

  resetToInitial() {
    this.returnAllToRack();
    this.setRatio(2.0);
    const slider = document.getElementById('ratioSlider');
    if (slider) slider.value = 2;
    const disp = document.getElementById('ratioDisplay');
    if (disp) disp.textContent = '2.0×';
  }

  clearDemoTimeouts() {
    this.demoTimeouts.forEach(t => clearTimeout(t));
    this.demoTimeouts = [];
    this.isDemoRunning = false;
  }

  // -------------------------------------------------------------
  // RUN SAMPLE DEMO (Chạy mẫu: 4 quả bên trái, 2 quả bên phải)
  // -------------------------------------------------------------
  runSampleDemo() {
    this.clearDemoTimeouts();
    this.isDemoRunning = true;
    this.setRatio(2.0);

    const bannerTitle = document.getElementById('bannerTitle');
    const bannerDesc = document.getElementById('bannerDesc');

    // Step 0: Reset to rack
    this.weights1 = 0;
    this.weights2 = 0;
    this.calculatePhysics();
    this.updateTelemetry();

    if (bannerTitle) bannerTitle.textContent = "Đang chạy mẫu... Bước 1: Đặt 4 quả cân (40N) lên Pít-tông (1)";
    if (bannerDesc) bannerDesc.textContent = "Áp suất tác dụng lên mặt chất lỏng ở nhánh (1) tăng vọt (p₁ = 2.0 kPa), truyền nguyên vẹn theo mọi hướng đẩy pít-tông (2) dâng lên cao!";

    // Step 1: Place 4 weights on Piston 1
    const t1 = setTimeout(() => {
      this.weights1 = 4;
      this.weights2 = 0;
      if (window.sound) window.sound.playClink();
      this.calculatePhysics();
      this.updateTelemetry();
    }, 400);
    this.demoTimeouts.push(t1);

    // Step 2: After 2.2 seconds, place 2 weights on Piston 2 to balance
    const t2 = setTimeout(() => {
      if (bannerTitle) bannerTitle.textContent = "Bước 2: Đặt 2 quả cân (20N) lên Pít-tông (2) để thiết lập cân bằng";
      if (bannerDesc) bannerDesc.textContent = "Áp suất ở hai nhánh bằng nhau (p₁ = p₂ = 2.0 kPa). Hai pít-tông trở về vị trí cân bằng ngang vạch số 0 ban đầu!";

      this.weights2 = 2;
      if (window.sound) window.sound.playClink();
      this.calculatePhysics();
      this.updateTelemetry();
      this.isDemoRunning = false;
    }, 2400);
    this.demoTimeouts.push(t2);
  }

  // -------------------------------------------------------------
  // CAR LIFT APPLICATION CONTROLS
  // -------------------------------------------------------------
  loadCarLiftMode() {
    this.carLiftActive = true;
    this.carLiftHeight = 0;
    this.weights1 = 0;
    this.weights2 = 0;
    this.calculatePhysics();
    this.updateTelemetry();
  }

  pumpCarLift() {
    this.carLiftActive = true;
    // Each pump lifts car by 0.8 cm (max 5 cm)
    this.carLiftHeight = Math.min(5.0, this.carLiftHeight + 0.8);
    if (window.sound) {
      window.sound.playClink();
      window.sound.startHydraulic(0.6);
      setTimeout(() => window.sound.stopHydraulic(), 300);
    }
    this.updateTelemetry();
  }

  resetCarLift() {
    this.carLiftHeight = 0;
    if (window.sound) window.sound.playClick();
    this.updateTelemetry();
  }

  // -------------------------------------------------------------
  // PHYSICAL MODEL & STRICT DISPLACEMENT LIMITS
  // -------------------------------------------------------------
  calculatePhysics() {
    const s1 = this.area1; // cm^2
    const s2 = this.area2; // cm^2

    // Each weight is 10 N
    const f1 = this.weights1 * this.weightVal; // N
    const f2 = this.weights2 * this.weightVal; // N

    // Added pressures in N/cm^2 (x10 = kPa)
    const p1 = f1 / s1; // N/cm^2
    const p2 = f2 / s2; // N/cm^2

    // Pressure difference Delta P
    const deltaP = p1 - p2; // N/cm^2

    // STRICT STROKE LIMIT CALCULATIONS:
    // Piston 2 must NEVER push above top rim of cylinder!
    // Piston 1 must NEVER push below bottom connecting pipe!
    const maxStroke1 = 2.6; // cm (Piston 1 max travel)
    const maxStroke2 = maxStroke1 * (s1 / s2); // Volume conservation: S1*h1 = S2*h2

    if (Math.abs(deltaP) < 0.0001) {
      // Perfect equilibrium! Both at 0
      this.targetH1 = 0;
      this.targetH2 = 0;
    } else {
      // Displace proportionally to pressure difference, strictly clamped
      const displacement1 = Math.sign(deltaP) * Math.min(maxStroke1, Math.abs(deltaP) * 1.35);
      this.targetH1 = displacement1;
      this.targetH2 = -displacement1 * (s1 / s2);
    }
  }

  updatePhysics(dt) {
    // Damped harmonic motion
    const k = 10.0;
    const damping = 0.72;

    const diff1 = this.targetH1 - this.h1;
    this.velocityH1 += diff1 * k * dt;
    this.velocityH1 *= Math.pow(damping, dt * 60);

    this.h1 += this.velocityH1 * dt;

    // Strict volume conservation
    const s1 = this.area1;
    const s2 = this.area2;
    this.h2 = -this.h1 * (s1 / s2);

    // Audio hum feedback during motion
    const speed = Math.abs(this.velocityH1);
    if (speed > 0.3 && window.sound) {
      window.sound.startHydraulic(Math.min(0.8, speed / 3.0));
    } else if (window.sound && window.sound.isHydraulicPlaying) {
      window.sound.stopHydraulic();
    }

    // Check if system has settled into equilibrium
    const isNowBalanced = (Math.abs(this.h1) < 0.03 && Math.abs(this.velocityH1) < 0.04);
    const pressureBalanced = (Math.abs((this.weights1 * this.weightVal) / this.area1 - (this.weights2 * this.weightVal) / this.area2) < 0.0001);

    if (isNowBalanced && pressureBalanced && !this.wasBalanced && (this.weights1 > 0 || this.weights2 > 0)) {
      if (window.sound) window.sound.playSuccess();
    }
    this.wasBalanced = isNowBalanced && pressureBalanced;

    // Update particle flow
    const flowDirection = Math.sign(this.velocityH1);
    const flowSpeed = Math.abs(this.velocityH1) * 0.06 + 0.02;

    this.particles.forEach(p => {
      p.u += flowDirection * flowSpeed * p.speed * dt;
      if (p.u > 1) p.u -= 1;
      if (p.u < 0) p.u += 1;
    });
  }

  updateTelemetry() {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * this.weightVal;
    const f2 = this.carLiftActive ? (this.carLiftHeight > 0 ? 300 : 0) : this.weights2 * this.weightVal;

    const p1_kPa = (f1 / s1) * 10;
    const p2_kPa = (f2 / s2) * 10;

    // Update DOM indicators
    const liveF1 = document.getElementById('liveF1');
    const liveS1 = document.getElementById('liveS1');
    const liveP1 = document.getElementById('liveP1');
    const liveF2 = document.getElementById('liveF2');
    const liveS2 = document.getElementById('liveS2');
    const liveP2 = document.getElementById('liveP2');
    const ratioSummary = document.getElementById('liveRatioSummary');
    const rackCountBadge = document.getElementById('remainingRackCountBadge');
    const rackW1 = document.getElementById('rackW1Count');
    const rackW2 = document.getElementById('rackW2Count');
    const statusPill = document.getElementById('statusPill');
    const statusText = document.getElementById('statusText');

    if (liveF1) liveF1.textContent = f1.toFixed(0);
    if (liveS1) liveS1.textContent = s1.toFixed(0);
    if (liveP1) liveP1.textContent = p1_kPa.toFixed(2);

    if (liveF2) liveF2.textContent = f2.toFixed(0);
    if (liveS2) liveS2.textContent = s2.toFixed(0);
    if (liveP2) liveP2.textContent = p2_kPa.toFixed(2);

    if (ratioSummary) {
      ratioSummary.innerHTML = `Tỉ lệ diện tích: <i>S</i><sub>1</sub> = ${(s1 / s2).toFixed(1)} × <i>S</i><sub>2</sub>`;
    }

    if (rackCountBadge) {
      rackCountBadge.textContent = `Còn lại: ${this.rackWeights} / ${this.totalWeights}`;
    }
    if (rackW1) rackW1.textContent = this.weights1;
    if (rackW2) rackW2.textContent = this.weights2;

    // Status pill state
    if (statusPill && statusText) {
      if (this.carLiftActive) {
        statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-amber-500/20 text-amber-300 border-amber-500/40";
        statusText.textContent = `Bệ nâng ô tô: Đang nâng +${this.carLiftHeight.toFixed(1)} cm`;
      } else {
        const deltaP = p1_kPa - p2_kPa;
        if (Math.abs(deltaP) < 0.001) {
          statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
          statusText.textContent = "Cân bằng ngang nhau (p₁ = p₂)";
        } else if (deltaP > 0) {
          statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-amber-500/20 text-amber-300 border-amber-500/40";
          statusText.textContent = "Pít-tông 1 chìm xuống, Pít-tông 2 dâng lên (p₁ > p₂)";
        } else {
          statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-sky-500/20 text-sky-300 border-sky-500/40";
          statusText.textContent = "Pít-tông 2 chìm xuống, Pít-tông 1 dâng lên (p₂ > p₁)";
        }
      }
    }
  }

  recordCurrentState() {
    const s1 = this.area1;
    const s2 = this.area2;
    const f1 = this.weights1 * this.weightVal;
    const f2 = this.weights2 * this.weightVal;

    const p1 = ((f1 / s1) * 10).toFixed(2);
    const p2 = ((f2 / s2) * 10).toFixed(2);

    let status = "Cân bằng ngang vạch 0";
    if (f1 / s1 > f2 / s2) status = "Pít-tông (1) hạ, (2) dâng";
    else if (f1 / s1 < f2 / s2) status = "Pít-tông (2) hạ, (1) dâng";

    if (window.reportManager) {
      window.reportManager.addRecord({
        F1: `${f1}`,
        S1: `${s1} cm²`,
        p1: `${p1}`,
        F2: `${f2}`,
        S2: `${s2} cm²`,
        p2: `${p2}`,
        status: status
      });

      if (window.sound) window.sound.playSuccess();
    }
  }

  // -------------------------------------------------------------
  // CANVAS RENDERING
  // -------------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const { w, h, c1, c2, rack, bottomY, topY, centerY, pipeHeight, scalePxlPerCm } = this.layout;
    if (!c1 || !c2) return;

    ctx.clearRect(0, 0, w, h);

    // Compute pixel heights of liquid surfaces, strictly clamped
    const yEquilibrium = centerY;
    
    // In car lift mode, height reflects pump
    let effH1 = this.h1;
    let effH2 = this.h2;
    if (this.carLiftActive) {
      effH1 = -this.carLiftHeight * 0.5;
      effH2 = this.carLiftHeight * 1.5;
    }

    // STRICT CLAMPING: Fluid level must stay inside [topY + 32, bottomY - pipeHeight - 12]
    const minFluidY1 = c1.top + 34;
    const maxFluidY1 = bottomY - pipeHeight - 14;
    const yFluid1 = Math.max(minFluidY1, Math.min(maxFluidY1, yEquilibrium + effH1 * scalePxlPerCm));

    const minFluidY2 = c2.top + 34;
    const maxFluidY2 = bottomY - pipeHeight - 14;
    const yFluid2 = Math.max(minFluidY2, Math.min(maxFluidY2, yEquilibrium + effH2 * scalePxlPerCm));

    // 1. Lab Table Bench
    this.drawLaboratoryEnvironment(ctx, w, h, bottomY, c1, c2);

    // 2. On-Canvas Weight Rack (Tray holding available 10N weights)
    this.drawOnCanvasWeightRack(ctx, rack, this.rackWeights);

    // 3. Cylinder Glass Backing
    this.drawCylinderGlassBack(ctx, c1);
    this.drawCylinderGlassBack(ctx, c2);

    // 4. Metric Ruler (with fixed text: no "+-")
    if (this.showRuler && !this.carLiftActive) {
      this.drawMetricRuler(ctx, c1, yEquilibrium, scalePxlPerCm);
      this.drawMetricRuler(ctx, c2, yEquilibrium, scalePxlPerCm);
    }

    // 5. Liquid Fluid Body
    this.drawFluid(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight);

    // 6. Flow Particles & Pascal Pressure Vectors
    if (this.showParticles) {
      this.drawFlowParticles(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight);
    }
    if (this.showVectors && !this.carLiftActive) {
      this.drawPressureVectors(ctx, c1, c2, yFluid1, yFluid2, bottomY);
    }

    // 7. Reference Equilibrium 0 Line
    if (!this.carLiftActive) {
      this.drawReferenceLine(ctx, c1, c2, yEquilibrium);
    }

    // 8. Metallic Pistons Assembly
    if (this.carLiftActive) {
      this.drawCarPlatformAssembly(ctx, c1, yFluid1);
      this.drawPistonAssembly(ctx, c2, yFluid2, 2, 0);
    } else {
      this.drawPistonAssembly(ctx, c1, yFluid1, 1, this.weights1);
      this.drawPistonAssembly(ctx, c2, yFluid2, 2, this.weights2);
    }

    // 9. Glass Front Reflections & Top Rims
    this.drawCylinderGlassFront(ctx, c1);
    this.drawCylinderGlassFront(ctx, c2);

    // 10. Pressure Gauges
    this.drawPressureGauges(ctx, c1, c2);

    // 11. Floating Weight if actively dragging
    if (this.isDragging) {
      this.drawFloatingWeight(ctx, this.mousePos.x, this.mousePos.y);
    }
  }

  // Draw lab bench & glass mounting brackets
  drawLaboratoryEnvironment(ctx, w, h, bottomY, c1, c2) {
    const benchY = bottomY + 12;

    const benchGrad = ctx.createLinearGradient(0, benchY, 0, h);
    benchGrad.addColorStop(0, '#1e293b');
    benchGrad.addColorStop(0.15, '#0f172a');
    benchGrad.addColorStop(1, '#020617');

    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, w, h - benchY);

    // Metallic trim border on table
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, benchY - 2, w, 2);

    // Stable clamps under U-tube
    ctx.fillStyle = '#334155';
    [c1.cx, c2.cx].forEach(cx => {
      ctx.fillRect(cx - 16, bottomY, 32, 12);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 18, bottomY + 10, 36, 2);
    });
  }

  // -------------------------------------------------------------
  // ON-CANVAS WEIGHT RACK (Khay đựng quả cân kế bên)
  // -------------------------------------------------------------
  drawOnCanvasWeightRack(ctx, rack, availableCount) {
    const { x, y, width, height } = rack;
    const isHovered = (this.hoverTarget === 'rack');

    ctx.save();

    // Wooden/metallic tray base
    const trayGrad = ctx.createLinearGradient(x, y, x, y + height);
    trayGrad.addColorStop(0, isHovered ? '#3b82f6' : '#334155');
    trayGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = trayGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#60a5fa' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tray label
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`KHAY QUẢ CÂN (10N): ${availableCount}/${this.totalWeights}`, x + width * 0.5, y + 12);

    // 6 discrete weight slots
    const slotSpacing = (width - 16) / 6;
    for (let i = 0; i < this.totalWeights; i++) {
      const slotX = x + 10 + i * slotSpacing + slotSpacing * 0.5;
      const slotY = y + height - 10;

      // Draw slot indentation ring
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(slotX, slotY, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // If weight is available in rack, draw it sitting in slot
      if (i < availableCount) {
        this.drawSingleBrassWeight(ctx, slotX, slotY + 2, 16, 17, 3);
      }
    }

    ctx.restore();
  }

  // Draw metric ruler markings (-6 cm to +6 cm) without "+-" bug
  drawMetricRuler(ctx, c, yEquilibrium, scalePxlPerCm) {
    const rulerX = c.right + 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(rulerX, c.top + 25);
    ctx.lineTo(rulerX, c.bottom - 15);
    ctx.stroke();

    for (let cm = -6; cm <= 6; cm++) {
      const y = yEquilibrium + cm * scalePxlPerCm;
      if (y < c.top + 25 || y > c.bottom - 15) continue;

      const isZero = (cm === 0);
      const isMajor = (cm % 2 === 0);
      const tickLength = isZero ? 12 : (isMajor ? 8 : 4);

      ctx.beginPath();
      ctx.moveTo(rulerX, y);
      ctx.lineTo(rulerX + tickLength, y);
      ctx.strokeStyle = isZero ? '#f59e0b' : 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = isZero ? 2 : 1;
      ctx.stroke();

      if (isMajor || isZero) {
        // Physical displacement: negative cm is UP (+), positive cm is DOWN (-)
        const disp = -cm;
        const txt = disp === 0 ? '0' : (disp > 0 ? `+${disp}` : `${disp}`);
        ctx.fillStyle = isZero ? '#fbbf24' : 'rgba(203, 213, 225, 0.7)';
        ctx.fillText(txt, rulerX + tickLength + 3, y + 3);
      }
    }
    ctx.restore();
  }

  // Reference zero line connecting both cylinders
  drawReferenceLine(ctx, c1, c2, yEquilibrium) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(c1.left - 8, yEquilibrium);
    ctx.lineTo(c2.right + 8, yEquilibrium);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Vạch số 0 (Ban đầu)', c1.left - 12, yEquilibrium + 3);
    ctx.restore();
  }

  // Draw U-tube fluid with meniscus curve
  drawFluid(ctx, c1, c2, y1, y2, bottomY, pipeH) {
    const pipeTop = bottomY - pipeH;

    ctx.save();
    ctx.beginPath();
    // Left cylinder fluid surface meniscus
    ctx.moveTo(c1.left, y1);
    ctx.quadraticCurveTo(c1.cx, y1 + 3, c1.right, y1);
    // Down to pipe
    ctx.lineTo(c1.right, pipeTop);
    // Along pipe
    ctx.lineTo(c2.left, pipeTop);
    // Up to right fluid surface
    ctx.lineTo(c2.left, y2);
    // Right fluid surface meniscus
    ctx.quadraticCurveTo(c2.cx, y2 + 3, c2.right, y2);
    // Down right cylinder
    ctx.lineTo(c2.right, bottomY);
    // Across bottom
    ctx.lineTo(c1.left, bottomY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, Math.min(y1, y2), 0, bottomY);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.98)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Glossy surface lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c1.left + 2, y1);
    ctx.lineTo(c1.right - 2, y1);
    ctx.moveTo(c2.left + 2, y2);
    ctx.lineTo(c2.right - 2, y2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw floating microparticles
  drawFlowParticles(ctx, c1, c2, y1, y2, bottomY, pipeH) {
    const pipeCenterY = bottomY - pipeH * 0.5;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    this.particles.forEach(p => {
      let px, py;
      if (p.u < 0.35) {
        const t = p.u / 0.35;
        px = c1.cx + p.crossOffset * (c1.width * 0.4);
        py = y1 + (pipeCenterY - y1) * t;
      } else if (p.u < 0.65) {
        const t = (p.u - 0.35) / 0.3;
        px = c1.cx + (c2.cx - c1.cx) * t;
        py = pipeCenterY + p.crossOffset * (pipeH * 0.35);
      } else {
        const t = (p.u - 0.65) / 0.35;
        px = c2.cx + p.crossOffset * (c2.width * 0.4);
        py = pipeCenterY - (pipeCenterY - y2) * t;
      }

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    ctx.restore();
  }

  // Pressure vectors according to Pascal's law
  drawPressureVectors(ctx, c1, c2, y1, y2, bottomY) {
    const s1 = this.area1;
    const s2 = this.area2;
    const f1 = this.weights1 * this.weightVal;
    const f2 = this.weights2 * this.weightVal;
    const p1 = f1 / s1;
    const p2 = f2 / s2;

    const baseLen = 12;
    const arrowLen1 = Math.min(24, baseLen + p1 * 8);
    const arrowLen2 = Math.min(24, baseLen + p2 * 8);

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Cylinder 1 pressure vectors
    this.drawArrow(ctx, c1.cx - 10, y1 + 18, c1.cx - 10, y1 + 18 - arrowLen1);
    this.drawArrow(ctx, c1.cx + 10, y1 + 18, c1.cx + 10, y1 + 18 - arrowLen1);
    this.drawArrow(ctx, c1.left + 15, (y1 + bottomY) * 0.5, c1.left + 15 - arrowLen1, (y1 + bottomY) * 0.5);
    this.drawArrow(ctx, c1.right - 15, (y1 + bottomY) * 0.5, c1.right - 15 + arrowLen1, (y1 + bottomY) * 0.5);

    // Cylinder 2 pressure vectors
    this.drawArrow(ctx, c2.cx, y2 + 18, c2.cx, y2 + 18 - arrowLen2);
    this.drawArrow(ctx, c2.left + 10, (y2 + bottomY) * 0.5, c2.left + 10 - arrowLen2, (y2 + bottomY) * 0.5);
    this.drawArrow(ctx, c2.right - 10, (y2 + bottomY) * 0.5, c2.right - 10 + arrowLen2, (y2 + bottomY) * 0.5);

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 4.5;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // Draw Cylinder Glass Backing
  drawCylinderGlassBack(ctx, c) {
    ctx.save();
    ctx.fillStyle = 'rgba(241, 245, 249, 0.03)';
    ctx.fillRect(c.left, c.top, c.width, c.bottom - c.top);
    ctx.restore();
  }

  // Draw Cylinder Glass Walls & Rims
  drawCylinderGlassFront(ctx, c) {
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(c.left, c.top);
    ctx.lineTo(c.left, c.bottom);
    ctx.moveTo(c.right, c.top);
    ctx.lineTo(c.right, c.bottom);
    ctx.stroke();

    // Top Rim Collar & Mechanical Stroke Stop
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(c.left - 3, c.top - 2, c.width + 6, 4);

    // Specular streaks
    const streakGrad = ctx.createLinearGradient(c.left, 0, c.right, 0);
    streakGrad.addColorStop(0, 'rgba(255,255,255,0.14)');
    streakGrad.addColorStop(0.12, 'rgba(255,255,255,0.02)');
    streakGrad.addColorStop(0.88, 'rgba(255,255,255,0)');
    streakGrad.addColorStop(0.96, 'rgba(255,255,255,0.12)');

    ctx.fillStyle = streakGrad;
    ctx.fillRect(c.left, c.top, c.width, c.bottom - c.top);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // METALLIC PISTON ASSEMBLY
  // -------------------------------------------------------------
  drawPistonAssembly(ctx, c, yFluid, pistonId, numWeights) {
    const pistonH = 22;
    const pistonTop = yFluid - pistonH;
    const rodW = Math.max(7, c.width * 0.12);
    const rodH = 75;
    const trayY = pistonTop - rodH;
    const trayW = c.width * 1.35;

    ctx.save();

    // 1. Piston Head (Metallic cylinder sitting on fluid)
    const metalGrad = ctx.createLinearGradient(c.left, 0, c.right, 0);
    metalGrad.addColorStop(0, '#64748b');
    metalGrad.addColorStop(0.25, '#f8fafc');
    metalGrad.addColorStop(0.5, '#cbd5e1');
    metalGrad.addColorStop(0.8, '#94a3b8');
    metalGrad.addColorStop(1, '#475569');

    ctx.fillStyle = metalGrad;
    ctx.fillRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // Two Rubber O-Ring Seals
    ctx.fillStyle = '#090d16';
    ctx.fillRect(c.left + 1, pistonTop + 4, c.width - 2, 4);
    ctx.fillRect(c.left + 1, pistonTop + 14, c.width - 2, 4);

    // O-ring specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(c.left + 6, pistonTop + 5, c.width * 0.35, 1.5);
    ctx.fillRect(c.left + 6, pistonTop + 15, c.width * 0.35, 1.5);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // 2. Chrome Piston Rod
    const rodGrad = ctx.createLinearGradient(c.cx - rodW * 0.5, 0, c.cx + rodW * 0.5, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.3, '#ffffff');
    rodGrad.addColorStop(0.7, '#cbd5e1');
    rodGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(c.cx - rodW * 0.5, trayY, rodW, rodH);

    // 3. Top Weighing Tray
    this.drawWeighingTray(ctx, c.cx, trayY, trayW, pistonId);

    // 4. Brass 10N Weights on Tray
    this.drawWeightsOnTray(ctx, c.cx, trayY - 2, numWeights, trayW);

    // Red level indicator arrow on ruler
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(c.right, pistonTop + pistonH * 0.5);
    ctx.lineTo(c.right + 5, pistonTop + pistonH * 0.5 - 3);
    ctx.lineTo(c.right + 5, pistonTop + pistonH * 0.5 + 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw shallow concave weighing plate
  drawWeighingTray(ctx, cx, y, width, pistonId) {
    const isHovered = (this.hoverTarget === pistonId);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    const trayGrad = ctx.createLinearGradient(cx - width * 0.5, 0, cx + width * 0.5, 0);
    if (isHovered) {
      trayGrad.addColorStop(0, '#38bdf8');
      trayGrad.addColorStop(0.5, '#e0f2fe');
      trayGrad.addColorStop(1, '#0284c7');
    } else {
      trayGrad.addColorStop(0, '#94a3b8');
      trayGrad.addColorStop(0.2, '#f8fafc');
      trayGrad.addColorStop(0.5, '#cbd5e1');
      trayGrad.addColorStop(1, '#64748b');
    }

    ctx.fillStyle = trayGrad;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.5, y - 6);
    ctx.lineTo(cx - width * 0.45, y);
    ctx.lineTo(cx + width * 0.45, y);
    ctx.lineTo(cx + width * 0.5, y - 6);
    ctx.lineTo(cx + width * 0.48, y + 3);
    ctx.lineTo(cx - width * 0.48, y + 3);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isHovered ? '#38bdf8' : '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`(${pistonId})`, cx, y + 14);

    ctx.restore();
  }

  // Draw 10N Brass weights on tray
  drawWeightsOnTray(ctx, cx, baseY, count, trayWidth) {
    if (count <= 0) return;

    const weightW = 20;
    const weightH = 16;
    const knobR = 3;

    const maxPerRow = Math.min(count, Math.max(2, Math.floor(trayWidth / (weightW + 3))));
    const rows = Math.ceil(count / maxPerRow);

    let drawn = 0;
    for (let r = 0; r < rows; r++) {
      const inThisRow = Math.min(count - drawn, maxPerRow);
      const rowStartX = cx - ((inThisRow - 1) * (weightW + 3)) * 0.5;
      const rowY = baseY - r * (weightH + 2);

      for (let i = 0; i < inThisRow; i++) {
        const wx = rowStartX + i * (weightW + 3);
        this.drawSingleBrassWeight(ctx, wx, rowY, weightW, weightH, knobR);
        drawn++;
      }
    }
  }

  // Draw single 10N brass weight
  drawSingleBrassWeight(ctx, cx, bottomY, w, h, knobR) {
    const left = cx - w * 0.5;
    const top = bottomY - h;

    ctx.save();
    const brassGrad = ctx.createLinearGradient(left, 0, left + w, 0);
    brassGrad.addColorStop(0, '#b45309');
    brassGrad.addColorStop(0.2, '#fef08a');
    brassGrad.addColorStop(0.5, '#f59e0b');
    brassGrad.addColorStop(0.8, '#d97706');
    brassGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.roundRect(left, top, w, h, 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Knob handle
    const knobGrad = ctx.createRadialGradient(cx, top - knobR, 1, cx, top - knobR, knobR);
    knobGrad.addColorStop(0, '#fef08a');
    knobGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.arc(cx, top - knobR, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // "10N" stamped mark
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 8px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10N', cx, top + h * 0.72);

    ctx.restore();
  }

  drawFloatingWeight(ctx, x, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    this.drawSingleBrassWeight(ctx, x, y + 8, 22, 18, 3.5);
    ctx.restore();
  }

  // Draw Car Platform for Car Lift Application
  drawCarPlatformAssembly(ctx, c, yFluid) {
    const pistonH = 22;
    const pistonTop = yFluid - pistonH;
    const rodW = c.width * 0.2;
    const rodH = 75;
    const trayY = pistonTop - rodH;

    ctx.save();

    // Piston Head & Rod
    ctx.fillStyle = '#64748b';
    ctx.fillRect(c.left + 1, pistonTop, c.width - 2, pistonH);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(c.cx - rodW * 0.5, trayY, rodW, rodH);

    // Sturdy Hydraulic Scissor / Platform
    const carX = c.cx;
    const carY = trayY - 6;

    ctx.fillStyle = '#334155';
    ctx.fillRect(carX - 65, carY, 130, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(carX - 63, carY + 2, 126, 3); // Yellow hazard stripes

    // Car silhouette
    ctx.fillStyle = '#ef4444'; // Red sports car
    ctx.beginPath();
    ctx.moveTo(carX - 55, carY - 6);
    ctx.lineTo(carX - 50, carY - 16);
    ctx.lineTo(carX - 25, carY - 20);
    ctx.lineTo(carX - 10, carY - 32);
    ctx.lineTo(carX + 25, carY - 32);
    ctx.lineTo(carX + 42, carY - 16);
    ctx.lineTo(carX + 58, carY - 10);
    ctx.lineTo(carX + 58, carY - 6);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(carX - 20, carY - 20);
    ctx.lineTo(carX - 8, carY - 30);
    ctx.lineTo(carX + 10, carY - 30);
    ctx.lineTo(carX + 10, carY - 20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(carX + 13, carY - 20);
    ctx.lineTo(carX + 13, carY - 30);
    ctx.lineTo(carX + 24, carY - 30);
    ctx.lineTo(carX + 38, carY - 20);
    ctx.closePath();
    ctx.fill();

    // Wheels
    const drawWheel = (wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, carY - 5, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(wx, carY - 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawWheel(carX - 35);
    drawWheel(carX + 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ô TÔ: 15.000 N (1.5 tấn)', carX, carY - 38);

    ctx.restore();
  }

  // Draw Pressure Gauges
  drawPressureGauges(ctx, c1, c2) {
    const s1 = this.carLiftActive ? 500 : this.area1;
    const s2 = this.carLiftActive ? 10 : this.area2;
    const f1 = this.carLiftActive ? this.carWeight : this.weights1 * this.weightVal;
    const f2 = this.carLiftActive ? (this.carLiftHeight > 0 ? 300 : 0) : this.weights2 * this.weightVal;
    const p1 = (f1 / s1) * 10;
    const p2 = (f2 / s2) * 10;

    const gaugeR = 21;
    const gaugeY = c1.top + 35;

    this.drawSingleGauge(ctx, c1.left - gaugeR - 8, gaugeY, gaugeR, p1, 'p₁');
    this.drawSingleGauge(ctx, c2.right + gaugeR + 8, gaugeY, gaugeR, p2, 'p₂');
  }

  drawSingleGauge(ctx, gx, gy, r, valueKPa, label) {
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(label === 'p₁' ? gx + r - 2 : gx - r - 6, gy - 3, 8, 6);

    const bezelGrad = ctx.createLinearGradient(gx - r, gy - r, gx + r, gy + r);
    bezelGrad.addColorStop(0, '#f8fafc');
    bezelGrad.addColorStop(1, '#475569');
    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(gx, gy, r - 3, 0, Math.PI * 2);
    ctx.fill();

    // Scale ticks
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let a = -Math.PI * 0.75; a <= Math.PI * 0.75; a += Math.PI * 0.25) {
      const tx1 = gx + Math.cos(a) * (r - 7);
      const ty1 = gy + Math.sin(a) * (r - 7);
      const tx2 = gx + Math.cos(a) * (r - 4);
      const ty2 = gy + Math.sin(a) * (r - 4);
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    const maxKPa = 5.0;
    const norm = Math.min(1.0, valueKPa / maxKPa);
    const needleAngle = -Math.PI * 0.75 + norm * (Math.PI * 1.5);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(needleAngle) * (r - 6), gy + Math.sin(needleAngle) * (r - 6));
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${label}`, gx, gy + r * 0.6);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // INTERACTION HANDLERS (Canvas Drag & Drop, Clicks)
  // -------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const checkHoverTarget = (pos) => {
      const { c1, c2, rack } = this.layout;
      if (!c1 || !c2 || !rack) return null;

      // Piston 1
      if (pos.x >= c1.left - 20 && pos.x <= c1.right + 20 && pos.y <= c1.bottom) return 1;
      // Piston 2
      if (pos.x >= c2.left - 20 && pos.x <= c2.right + 20 && pos.y <= c2.bottom) return 2;
      // Weight rack
      if (pos.x >= rack.x - 5 && pos.x <= rack.x + rack.width + 5 &&
          pos.y >= rack.y - 5 && pos.y <= rack.y + rack.height + 5) {
        return 'rack';
      }
      return null;
    };

    // Canvas click interactions
    this.canvas.addEventListener('click', (e) => {
      if (this.isDragging) return;
      const pos = getPos(e);
      const target = checkHoverTarget(pos);

      if (target === 1 && this.weights1 > 0) {
        // Clicking piston 1 removes 1 weight back to rack
        this.removeWeightFromPiston(1);
      } else if (target === 2 && this.weights2 > 0) {
        // Clicking piston 2 removes 1 weight back to rack
        this.removeWeightFromPiston(2);
      } else if (target === 'rack' && this.rackWeights > 0) {
        // Clicking rack adds 1 weight to Piston 1 (or 2 if 1 is full)
        this.addWeightToPiston(1);
      }
    });

    // Mouse drag support on canvas
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const target = checkHoverTarget(pos);
      if (target === 'rack' && this.rackWeights > 0) {
        this.isDragging = true;
        this.draggedFrom = 'rack';
        this.mousePos = pos;
      } else if (target === 1 && this.weights1 > 0) {
        this.isDragging = true;
        this.draggedFrom = 'piston1';
        this.weights1--;
        this.calculatePhysics();
        this.updateTelemetry();
        this.mousePos = pos;
      } else if (target === 2 && this.weights2 > 0) {
        this.isDragging = true;
        this.draggedFrom = 'piston2';
        this.weights2--;
        this.calculatePhysics();
        this.updateTelemetry();
        this.mousePos = pos;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mousePos = getPos(e);
      this.hoverTarget = checkHoverTarget(this.mousePos);
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        const dropTarget = checkHoverTarget(this.mousePos);
        if (dropTarget === 1) {
          this.weights1++;
          if (window.sound) window.sound.playClink();
        } else if (dropTarget === 2) {
          this.weights2++;
          if (window.sound) window.sound.playClink();
        } else {
          // Dropped on rack or outside: return to rack (or restore)
          if (window.sound) window.sound.playClick();
        }

        this.isDragging = false;
        this.draggedFrom = null;
        this.calculatePhysics();
        this.updateTelemetry();
      }
    });
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.updatePhysics(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Instantiate simulation when DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new HydraulicSimulation('simCanvas');
});
