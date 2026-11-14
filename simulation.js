// Simulation Physics & Canvas 2D Engine for Pascal Law & Hydraulic Press
// Supports: Tab 1 (Observation locked), Tab 2 (Practice), Tab 3 (Conclusion), Tab 4 (Animated Car Lift)

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
    this.weights1 = 0;
    this.weights2 = 0;

    // Displacements from reference equilibrium 0 (in virtual cm)
    this.h1 = 0;
    this.h2 = 0;
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

    // ==========================================
    // CAR LIFT APPLICATION STATE
    // ==========================================
    this.carWeight = 15000; // 15,000 N (1.5 tons)
    this.carLiftHeight = 0; // Virtual meters (0.0 to 2.0m)
    this.carLiftPxl = 0; // Current animated pixel lift
    this.targetCarLiftPxl = 0; // Target pixel lift
    this.leverPressAnim = 0; // 1.0 when lever is pressed, decays to 0

    // Drag and Drop State
    this.draggedFrom = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    this.hoverTarget = null; // 1, 2, 'rack', 'pumpLever'

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

    const bottomY = h * 0.85;
    const cylinderHeight = h * 0.62;
    const topY = bottomY - cylinderHeight;
    const pipeHeight = Math.max(34, h * 0.08);
    const centerY = bottomY - cylinderHeight * 0.48;

    const s1 = this.currentTab === 'application' ? 50 : this.area1;
    const s2 = this.currentTab === 'application' ? 10 : this.area2;
    const d1Ratio = Math.sqrt(s1 / s2);
    
    const baseW = Math.min(w * 0.15, 95);
    const width2 = baseW;
    const width1 = baseW * Math.min(d1Ratio, 2.2);

    const spacing = Math.min(w * 0.32, 210);
    const cx1 = w * 0.38 - spacing * 0.5;
    const cx2 = w * 0.38 + spacing * 0.5;

    // Weight Rack position
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
      c1: {
        cx: cx1,
        width: width1,
        left: cx1 - width1 * 0.5,
        right: cx1 + width1 * 0.5,
        top: topY,
        bottom: bottomY,
      },
      c2: {
        cx: cx2,
        width: width2,
        left: cx2 - width2 * 0.5,
        right: cx2 + width2 * 0.5,
        top: topY,
        bottom: bottomY,
      },
      rack: {
        x: rackX,
        y: rackY,
        width: rackW,
        height: rackH
      },
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
    // Locked in observation or application mode
    if (this.currentTab === 'observation' || this.currentTab === 'application') {
      return;
    }

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
    if (this.currentTab === 'observation' || this.currentTab === 'application') {
      return;
    }

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

  // Reset all weights back to rack
  returnAllToRack() {
    this.clearDemoTimeouts();
    this.weights1 = 0;
    this.weights2 = 0;
    this.targetH1 = 0;
    this.targetH2 = 0;
    this.carLiftHeight = 0;
    this.targetCarLiftPxl = 0;
    this.carLiftPxl = 0;
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

    // Step 0: Reset
    this.weights1 = 0;
    this.weights2 = 0;
    this.calculatePhysics();
    this.updateTelemetry();

    if (bannerTitle) bannerTitle.textContent = "Đang chạy mẫu... Bước 1: Tự động đặt 4 quả cân (40N) lên Pít-tông (1)";
    if (bannerDesc) bannerDesc.textContent = "Áp suất mặt chất lỏng ở nhánh (1) tăng lên (p₁ = 2.0 kPa), truyền nguyên vẹn theo mọi hướng đẩy pít-tông (2) dâng lên cao!";

    // Step 1: Place 4 weights on Piston 1
    const t1 = setTimeout(() => {
      this.weights1 = 4;
      this.weights2 = 0;
      if (window.sound) window.sound.playClink();
      this.calculatePhysics();
      this.updateTelemetry();
    }, 400);
    this.demoTimeouts.push(t1);

    // Step 2: After 2.5 seconds, place 2 weights on Piston 2 to balance
    const t2 = setTimeout(() => {
      if (bannerTitle) bannerTitle.textContent = "Bước 2: Đặt tiếp 2 quả cân (20N) lên Pít-tông (2) để thiết lập cân bằng";
      if (bannerDesc) bannerDesc.textContent = "Áp suất ở hai nhánh bằng nhau (p₁ = p₂ = 2.0 kPa). Hai pít-tông từ từ trở về vị trí cân bằng ngang vạch số 0 ban đầu!";

      this.weights2 = 2;
      if (window.sound) window.sound.playClink();
      this.calculatePhysics();
      this.updateTelemetry();
      this.isDemoRunning = false;
    }, 2500);
    this.demoTimeouts.push(t2);
  }

  // -------------------------------------------------------------
  // CAR LIFT APPLICATION CONTROLS (Ứng dụng thực tế)
  // -------------------------------------------------------------
  loadCarLiftMode() {
    this.currentTab = 'application';
    this.returnAllToRack();
    this.carLiftHeight = 0;
    this.targetCarLiftPxl = 0;
    this.carLiftPxl = 0;
    this.leverPressAnim = 0;
    this.updateLayout();
    this.updateTelemetry();
  }

  pumpCarLift() {
    // Each pump stroke lifts car by 0.4m (max 2.0m)
    if (this.carLiftHeight < 2.0) {
      this.carLiftHeight = Math.min(2.0, parseFloat((this.carLiftHeight + 0.4).toFixed(1)));
      // Lift distance: 0.4m ~ 20 pixels
      this.targetCarLiftPxl = this.carLiftHeight * 45;
      this.leverPressAnim = 1.0; // Trigger lever down animation

      if (window.sound) {
        window.sound.playClink();
        window.sound.startHydraulic(0.7);
        setTimeout(() => window.sound.stopHydraulic(), 350);
      }
    } else {
      if (window.sound) window.sound.playClick();
    }
    this.updateTelemetry();
  }

  resetCarLift() {
    this.carLiftHeight = 0;
    this.targetCarLiftPxl = 0;
    this.leverPressAnim = 0;
    if (window.sound) {
      window.sound.playClick();
      window.sound.startHydraulic(0.4);
      setTimeout(() => window.sound.stopHydraulic(), 400);
    }
    this.updateTelemetry();
  }

  // -------------------------------------------------------------
  // PHYSICAL MODEL & STRICT DISPLACEMENT LIMITS
  // -------------------------------------------------------------
  calculatePhysics() {
    if (this.currentTab === 'application') return;

    const s1 = this.area1;
    const s2 = this.area2;
    const f1 = this.weights1 * this.weightVal;
    const f2 = this.weights2 * this.weightVal;

    const p1 = f1 / s1; // N/cm^2
    const p2 = f2 / s2; // N/cm^2
    const deltaP = p1 - p2;

    const maxStroke1 = 2.5; // cm (Piston 1 max travel)

    if (Math.abs(deltaP) < 0.0001) {
      this.targetH1 = 0;
      this.targetH2 = 0;
    } else {
      const displacement1 = Math.sign(deltaP) * Math.min(maxStroke1, Math.abs(deltaP) * 1.35);
      this.targetH1 = displacement1;
      this.targetH2 = -displacement1 * (s1 / s2);
    }
  }

  updatePhysics(dt) {
    if (this.currentTab === 'application') {
      // Smooth interpolation for car lift height
      const speed = 6.0;
      this.carLiftPxl += (this.targetCarLiftPxl - this.carLiftPxl) * speed * dt;

      // Lever return animation
      if (this.leverPressAnim > 0) {
        this.leverPressAnim = Math.max(0, this.leverPressAnim - dt * 3.5);
      }
      return;
    }

    // Normal laboratory U-tube physics
    const k = 10.0;
    const damping = 0.72;

    const diff1 = this.targetH1 - this.h1;
    this.velocityH1 += diff1 * k * dt;
    this.velocityH1 *= Math.pow(damping, dt * 60);

    this.h1 += this.velocityH1 * dt;

    const s1 = this.area1;
    const s2 = this.area2;
    this.h2 = -this.h1 * (s1 / s2);

    const spd = Math.abs(this.velocityH1);
    if (spd > 0.3 && window.sound) {
      window.sound.startHydraulic(Math.min(0.8, spd / 3.0));
    } else if (window.sound && window.sound.isHydraulicPlaying) {
      window.sound.stopHydraulic();
    }

    const isNowBalanced = (Math.abs(this.h1) < 0.03 && Math.abs(this.velocityH1) < 0.04);
    const pressureBalanced = (Math.abs((this.weights1 * this.weightVal) / this.area1 - (this.weights2 * this.weightVal) / this.area2) < 0.0001);

    if (isNowBalanced && pressureBalanced && !this.wasBalanced && (this.weights1 > 0 || this.weights2 > 0)) {
      if (window.sound) window.sound.playSuccess();
    }
    this.wasBalanced = isNowBalanced && pressureBalanced;

    // Fluid particles
    const flowDirection = Math.sign(this.velocityH1);
    const flowSpeed = Math.abs(this.velocityH1) * 0.06 + 0.02;

    this.particles.forEach(p => {
      p.u += flowDirection * flowSpeed * p.speed * dt;
      if (p.u > 1) p.u -= 1;
      if (p.u < 0) p.u += 1;
    });
  }

  updateTelemetry() {
    const isApp = (this.currentTab === 'application');

    const s1 = isApp ? 500 : this.area1;
    const s2 = isApp ? 10 : this.area2;
    const f1 = isApp ? this.carWeight : this.weights1 * this.weightVal;
    const f2 = isApp ? (this.carLiftHeight > 0 ? 300 : 0) : this.weights2 * this.weightVal;

    const p1_kPa = isApp ? 300 : (f1 / s1) * 10;
    const p2_kPa = isApp ? (this.carLiftHeight > 0 ? 300 : 0) : (f2 / s2) * 10;

    const liveF1 = document.getElementById('liveF1');
    const liveS1 = document.getElementById('liveS1');
    const liveP1 = document.getElementById('liveP1');
    const liveF2 = document.getElementById('liveF2');
    const liveS2 = document.getElementById('liveS2');
    const liveP2 = document.getElementById('liveP2');
    const labelP1Title = document.getElementById('labelP1Title');
    const labelP2Title = document.getElementById('labelP2Title');
    const ratioSummary = document.getElementById('liveRatioSummary');
    const rackCountBadge = document.getElementById('remainingRackCountBadge');
    const rackW1 = document.getElementById('rackW1Count');
    const rackW2 = document.getElementById('rackW2Count');
    const carHeightBadge = document.getElementById('carHeightBadge');
    const statusPill = document.getElementById('statusPill');
    const statusText = document.getElementById('statusText');

    if (liveF1) liveF1.textContent = f1.toFixed(0);
    if (liveS1) liveS1.textContent = s1.toFixed(0);
    if (liveP1) liveP1.textContent = p1_kPa.toFixed(1);

    if (liveF2) liveF2.textContent = f2.toFixed(0);
    if (liveS2) liveS2.textContent = s2.toFixed(0);
    if (liveP2) liveP2.textContent = p2_kPa.toFixed(1);

    if (labelP1Title) {
      labelP1Title.textContent = isApp ? "BỆ NÂNG Ô TÔ (1)" : "PÍT-TÔNG (1) LỚN";
    }
    if (labelP2Title) {
      labelP2Title.textContent = isApp ? "CẦN BƠM TAY (2)" : "PÍT-TÔNG (2) NHỎ";
    }

    if (ratioSummary) {
      if (isApp) {
        ratioSummary.innerHTML = `Lợi về lực: <i>F</i><sub>1</sub> = 50 × <i>F</i><sub>2</sub> (15.000N / 300N)`;
      } else {
        ratioSummary.innerHTML = `Tỉ lệ diện tích: <i>S</i><sub>1</sub> = ${(s1 / s2).toFixed(1)} × <i>S</i><sub>2</sub>`;
      }
    }

    if (rackCountBadge) {
      rackCountBadge.textContent = `Còn lại: ${this.rackWeights} / ${this.totalWeights}`;
    }
    if (rackW1) rackW1.textContent = this.weights1;
    if (rackW2) rackW2.textContent = this.weights2;

    if (carHeightBadge) {
      carHeightBadge.textContent = `Độ cao nâng: ${this.carLiftHeight.toFixed(1)} m`;
    }

    // Status pill state
    if (statusPill && statusText) {
      if (isApp) {
        if (this.carLiftHeight > 0) {
          statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-amber-500/20 text-amber-300 border-amber-500/40";
          statusText.textContent = `Trạm nâng: Đang nâng ô tô ở độ cao +${this.carLiftHeight.toFixed(1)} m`;
        } else {
          statusPill.className = "pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur shadow-lg transition-all duration-300 bg-slate-800 text-slate-300 border-slate-700";
          statusText.textContent = "Bệ nâng ở vị trí thấp nhất (Sẵn sàng bơm)";
        }
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

    const isApp = (this.currentTab === 'application');
    const yEquilibrium = centerY;

    let yFluid1, yFluid2;

    if (isApp) {
      // In Car Lift mode, fluid 1 rises as car is lifted
      yFluid1 = yEquilibrium - this.carLiftPxl * 0.4;
      yFluid2 = yEquilibrium + (this.leverPressAnim * 25);
    } else {
      const minFluidY1 = c1.top + 34;
      const maxFluidY1 = bottomY - pipeHeight - 14;
      yFluid1 = Math.max(minFluidY1, Math.min(maxFluidY1, yEquilibrium + this.h1 * scalePxlPerCm));

      const minFluidY2 = c2.top + 34;
      const maxFluidY2 = bottomY - pipeHeight - 14;
      yFluid2 = Math.max(minFluidY2, Math.min(maxFluidY2, yEquilibrium + this.h2 * scalePxlPerCm));
    }

    // 1. Lab Floor & Table Bench
    this.drawLaboratoryEnvironment(ctx, w, h, bottomY, c1, c2);

    // 2. On-Canvas Weight Rack (Only in Tab 1, 2, 3)
    if (!isApp) {
      this.drawOnCanvasWeightRack(ctx, rack, this.rackWeights);
    }

    // 3. Cylinder Glass Backing
    this.drawCylinderGlassBack(ctx, c1);
    this.drawCylinderGlassBack(ctx, c2);

    // 4. Metric Ruler (Only in Tab 1 & 2)
    if (this.showRuler && !isApp) {
      this.drawMetricRuler(ctx, c1, yEquilibrium, scalePxlPerCm);
      this.drawMetricRuler(ctx, c2, yEquilibrium, scalePxlPerCm);
    }

    // 5. Liquid Fluid Body
    this.drawFluid(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight, isApp);

    // 6. Flow Particles & Pascal Pressure Vectors
    if (this.showParticles) {
      this.drawFlowParticles(ctx, c1, c2, yFluid1, yFluid2, bottomY, pipeHeight);
    }
    if (this.showVectors && !isApp) {
      this.drawPressureVectors(ctx, c1, c2, yFluid1, yFluid2, bottomY);
    }

    // 7. Reference Line
    if (!isApp) {
      this.drawReferenceLine(ctx, c1, c2, yEquilibrium);
    }

    // 8. Pistons / Car Lift Platform
    if (isApp) {
      this.drawHydraulicCarLiftStation(ctx, c1, c2, yFluid1, yFluid2, bottomY);
    } else {
      this.drawPistonAssembly(ctx, c1, yFluid1, 1, this.weights1);
      this.drawPistonAssembly(ctx, c2, yFluid2, 2, this.weights2);
    }

    // 9. Glass Front Reflections & Top Rims
    this.drawCylinderGlassFront(ctx, c1);
    this.drawCylinderGlassFront(ctx, c2);

    // 10. Pressure Gauges
    this.drawPressureGauges(ctx, c1, c2, isApp);

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

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, benchY - 2, w, 2);

    ctx.fillStyle = '#334155';
    [c1.cx, c2.cx].forEach(cx => {
      ctx.fillRect(cx - 16, bottomY, 32, 12);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 18, bottomY + 10, 36, 2);
    });
  }

  // Draw On-Canvas Weight Rack
  drawOnCanvasWeightRack(ctx, rack, availableCount) {
    const { x, y, width, height } = rack;
    const isInteractive = (this.currentTab === 'practice');
    const isHovered = isInteractive && (this.hoverTarget === 'rack');

    ctx.save();
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

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`KHAY QUẢ CÂN (10N): ${availableCount}/${this.totalWeights}`, x + width * 0.5, y + 12);

    const slotSpacing = (width - 16) / 6;
    for (let i = 0; i < this.totalWeights; i++) {
      const slotX = x + 10 + i * slotSpacing + slotSpacing * 0.5;
      const slotY = y + height - 10;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(slotX, slotY, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (i < availableCount) {
        this.drawSingleBrassWeight(ctx, slotX, slotY + 2, 16, 17, 3);
      }
    }
    ctx.restore();
  }

  // Draw Metric Ruler
  drawMetricRuler(ctx, c, yEquilibrium, scalePxlPerCm) {
    const rulerX = c.right + 6;
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

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
        const disp = -cm;
        const txt = disp === 0 ? '0' : (disp > 0 ? `+${disp}` : `${disp}`);
        ctx.fillStyle = isZero ? '#fbbf24' : 'rgba(203, 213, 225, 0.7)';
        ctx.fillText(txt, rulerX + tickLength + 3, y + 3);
      }
    }
    ctx.restore();
  }

  // Reference Line
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

  // Draw Fluid (Water in Lab, Amber Hydraulic Oil in Car Lift)
  drawFluid(ctx, c1, c2, y1, y2, bottomY, pipeH, isApp) {
    const pipeTop = bottomY - pipeH;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c1.left, y1);
    ctx.quadraticCurveTo(c1.cx, y1 + 3, c1.right, y1);
    ctx.lineTo(c1.right, pipeTop);
    ctx.lineTo(c2.left, pipeTop);
    ctx.lineTo(c2.left, y2);
    ctx.quadraticCurveTo(c2.cx, y2 + 3, c2.right, y2);
    ctx.lineTo(c2.right, bottomY);
    ctx.lineTo(c1.left, bottomY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, Math.min(y1, y2), 0, bottomY);
    if (isApp) {
      // Warm Amber Hydraulic Oil
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.88)');
      grad.addColorStop(1, 'rgba(180, 83, 9, 0.98)');
    } else {
      // Lab Water
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.98)');
    }

    ctx.fillStyle = grad;
    ctx.fill();

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

  // Microparticles
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

  // Pressure vectors
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

    this.drawArrow(ctx, c1.cx - 10, y1 + 18, c1.cx - 10, y1 + 18 - arrowLen1);
    this.drawArrow(ctx, c1.cx + 10, y1 + 18, c1.cx + 10, y1 + 18 - arrowLen1);
    this.drawArrow(ctx, c1.left + 15, (y1 + bottomY) * 0.5, c1.left + 15 - arrowLen1, (y1 + bottomY) * 0.5);
    this.drawArrow(ctx, c1.right - 15, (y1 + bottomY) * 0.5, c1.right - 15 + arrowLen1, (y1 + bottomY) * 0.5);

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

  drawCylinderGlassBack(ctx, c) {
    ctx.save();
    ctx.fillStyle = 'rgba(241, 245, 249, 0.03)';
    ctx.fillRect(c.left, c.top, c.width, c.bottom - c.top);
    ctx.restore();
  }

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

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(c.left - 3, c.top - 2, c.width + 6, 4);

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
  // PISTON ASSEMBLY (Standard Lab Mode)
  // -------------------------------------------------------------
  drawPistonAssembly(ctx, c, yFluid, pistonId, numWeights) {
    const pistonH = 22;
    const pistonTop = yFluid - pistonH;
    const rodW = Math.max(7, c.width * 0.12);
    const rodH = 75;
    const trayY = pistonTop - rodH;
    const trayW = c.width * 1.35;

    ctx.save();

    // 1. Piston Head
    const metalGrad = ctx.createLinearGradient(c.left, 0, c.right, 0);
    metalGrad.addColorStop(0, '#64748b');
    metalGrad.addColorStop(0.25, '#f8fafc');
    metalGrad.addColorStop(0.5, '#cbd5e1');
    metalGrad.addColorStop(0.8, '#94a3b8');
    metalGrad.addColorStop(1, '#475569');

    ctx.fillStyle = metalGrad;
    ctx.fillRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // Rubber O-Rings
    ctx.fillStyle = '#090d16';
    ctx.fillRect(c.left + 1, pistonTop + 4, c.width - 2, 4);
    ctx.fillRect(c.left + 1, pistonTop + 14, c.width - 2, 4);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(c.left + 6, pistonTop + 5, c.width * 0.35, 1.5);
    ctx.fillRect(c.left + 6, pistonTop + 15, c.width * 0.35, 1.5);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(c.left + 1, pistonTop, c.width - 2, pistonH);

    // 2. Rod
    const rodGrad = ctx.createLinearGradient(c.cx - rodW * 0.5, 0, c.cx + rodW * 0.5, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.3, '#ffffff');
    rodGrad.addColorStop(0.7, '#cbd5e1');
    rodGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(c.cx - rodW * 0.5, trayY, rodW, rodH);

    // 3. Tray
    this.drawWeighingTray(ctx, c.cx, trayY, trayW, pistonId);

    // 4. Weights
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

  drawWeighingTray(ctx, cx, y, width, pistonId) {
    const isInteractive = (this.currentTab === 'practice');
    const isHovered = isInteractive && (this.hoverTarget === pistonId);

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

    const knobGrad = ctx.createRadialGradient(cx, top - knobR, 1, cx, top - knobR, knobR);
    knobGrad.addColorStop(0, '#fef08a');
    knobGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.arc(cx, top - knobR, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

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

  // -------------------------------------------------------------
  // REALISTIC HYDRAULIC CAR LIFT STATION (Ứng dụng thực tế)
  // -------------------------------------------------------------
  drawHydraulicCarLiftStation(ctx, c1, c2, yFluid1, yFluid2, bottomY) {
    const liftOffset = this.carLiftPxl; // 0 to 90px

    // 1. CAR LIFT RAM & PLATFORM (Piston 1)
    const ramTop = yFluid1 - 24 - liftOffset;
    const ramW = Math.max(16, c1.width * 0.28);

    ctx.save();

    // Telescopic chrome ram extending upward
    const ramGrad = ctx.createLinearGradient(c1.cx - ramW * 0.5, 0, c1.cx + ramW * 0.5, 0);
    ramGrad.addColorStop(0, '#94a3b8');
    ramGrad.addColorStop(0.3, '#ffffff');
    ramGrad.addColorStop(0.7, '#cbd5e1');
    ramGrad.addColorStop(1, '#475569');

    ctx.fillStyle = ramGrad;
    ctx.fillRect(c1.cx - ramW * 0.5, ramTop, ramW, (bottomY - ramTop));

    // Heavy duty steel vehicle platform
    const platformY = ramTop - 8;
    const platW = Math.max(150, c1.width * 1.8);
    const platLeft = c1.cx - platW * 0.5;

    ctx.fillStyle = '#334155';
    ctx.fillRect(platLeft, platformY, platW, 10);

    // Yellow/Black hazard caution stripes on platform edge
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(platLeft + 2, platformY + 2, platW - 4, 3);

    // Car Wheels Ramps / Stops
    ctx.fillStyle = '#64748b';
    ctx.fillRect(platLeft + 15, platformY - 4, 12, 4);
    ctx.fillRect(platLeft + platW - 27, platformY - 4, 12, 4);

    // 2. RED SPORTS CAR SILHOUETTE
    const carX = c1.cx;
    const carY = platformY;

    // Car shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + 3, platW * 0.4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(carX - 60, carY - 6);
    ctx.lineTo(carX - 54, carY - 18);
    ctx.lineTo(carX - 25, carY - 22);
    ctx.lineTo(carX - 8, carY - 36);
    ctx.lineTo(carX + 28, carY - 36);
    ctx.lineTo(carX + 46, carY - 18);
    ctx.lineTo(carX + 64, carY - 10);
    ctx.lineTo(carX + 64, carY - 6);
    ctx.closePath();
    ctx.fill();

    // Roof & Windows
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(carX - 22, carY - 22);
    ctx.lineTo(carX - 6, carY - 34);
    ctx.lineTo(carX + 12, carY - 34);
    ctx.lineTo(carX + 12, carY - 22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(carX + 16, carY - 22);
    ctx.lineTo(carX + 16, carY - 34);
    ctx.lineTo(carX + 26, carY - 34);
    ctx.lineTo(carX + 42, carY - 22);
    ctx.closePath();
    ctx.fill();

    // Wheels
    const drawWheel = (wx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx, carY - 5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(wx, carY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    drawWheel(carX - 38);
    drawWheel(carX + 38);

    // Car Weight Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ô TÔ TẢI TRỌNG: 15.000 N (1.5 tấn)', carX, carY - 44);

    // Height measurement vertical ruler beside car
    const hrX = platLeft - 18;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hrX, bottomY);
    ctx.lineTo(hrX, platformY);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.carLiftHeight.toFixed(1)}m`, hrX - 4, platformY + 6);

    // 3. MECHANICAL PUMP LEVER & HANDLE (Piston 2)
    const p2H = 20;
    const p2Top = yFluid2 - p2H;
    const p2RodW = 8;
    const p2RodH = 65;
    const p2RodTop = p2Top - p2RodH;

    // Small Piston Head
    ctx.fillStyle = '#475569';
    ctx.fillRect(c2.left + 1, p2Top, c2.width - 2, p2H);

    // Piston Rod
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(c2.cx - p2RodW * 0.5, p2RodTop, p2RodW, p2RodH);

    // Pump Pivot Lever / Handle
    const leverPivotX = c2.cx;
    const leverPivotY = p2RodTop;
    const leverLength = 55;
    // Lever angle pivots downwards when pressed
    const leverAngle = -0.3 + (this.leverPressAnim * 0.55);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leverPivotX - 12, leverPivotY);
    ctx.lineTo(leverPivotX + Math.cos(leverAngle) * leverLength, leverPivotY + Math.sin(leverAngle) * leverLength);
    ctx.stroke();

    // Rubber Grip Handle on end of lever
    const handleEndX = leverPivotX + Math.cos(leverAngle) * leverLength;
    const handleEndY = leverPivotY + Math.sin(leverAngle) * leverLength;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(handleEndX, handleEndY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Technician / Hand Force indicator
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Tay kích: F₂ = 300 N', handleEndX + 8, handleEndY + 4);

    ctx.restore();
  }

  // Draw Pressure Gauges
  drawPressureGauges(ctx, c1, c2, isApp) {
    const s1 = isApp ? 500 : this.area1;
    const s2 = isApp ? 10 : this.area2;
    const f1 = isApp ? this.carWeight : this.weights1 * this.weightVal;
    const f2 = isApp ? (this.carLiftHeight > 0 ? 300 : 0) : this.weights2 * this.weightVal;
    const p1 = isApp ? 300 : (f1 / s1) * 10;
    const p2 = isApp ? (this.carLiftHeight > 0 ? 300 : 0) : (f2 / s2) * 10;

    const gaugeR = 21;
    const gaugeY = c1.top + 35;

    this.drawSingleGauge(ctx, c1.left - gaugeR - 8, gaugeY, gaugeR, p1, 'p₁', isApp);
    this.drawSingleGauge(ctx, c2.right + gaugeR + 8, gaugeY, gaugeR, p2, 'p₂', isApp);
  }

  drawSingleGauge(ctx, gx, gy, r, valueKPa, label, isApp) {
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

    const maxKPa = isApp ? 400.0 : 5.0;
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
      if (!c1 || !c2) return null;

      if (this.currentTab === 'application') {
        if (pos.x >= c2.left - 30 && pos.x <= c2.right + 70 && pos.y <= c2.bottom) {
          return 'pumpLever';
        }
        return null;
      }

      if (pos.x >= c1.left - 20 && pos.x <= c1.right + 20 && pos.y <= c1.bottom) return 1;
      if (pos.x >= c2.left - 20 && pos.x <= c2.right + 20 && pos.y <= c2.bottom) return 2;
      if (rack && pos.x >= rack.x - 5 && pos.x <= rack.x + rack.width + 5 &&
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

      // In Application mode: clicking on pump lever pumps the lift!
      if (this.currentTab === 'application' && target === 'pumpLever') {
        this.pumpCarLift();
        return;
      }

      // ONLY in Practice mode do clicks add/remove weights
      if (this.currentTab !== 'practice') return;

      if (target === 1 && this.weights1 > 0) {
        this.removeWeightFromPiston(1);
      } else if (target === 2 && this.weights2 > 0) {
        this.removeWeightFromPiston(2);
      } else if (target === 'rack' && this.rackWeights > 0) {
        this.addWeightToPiston(1);
      }
    });

    // Mouse drag ONLY in Practice mode
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.currentTab !== 'practice') return;

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

      // Set cursor style
      if (this.currentTab === 'observation') {
        this.canvas.style.cursor = 'default';
      } else if (this.currentTab === 'application') {
        this.canvas.style.cursor = this.hoverTarget === 'pumpLever' ? 'pointer' : 'default';
      } else if (this.currentTab === 'practice') {
        this.canvas.style.cursor = this.hoverTarget ? 'pointer' : 'grab';
      }
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
