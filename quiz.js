// Interactive Quiz Engine for KHTN 8 Pascal Law & Hydraulic Simulation

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Phát biểu nào sau đây đúng nhất về sự truyền áp suất trong chất lỏng kín (Định luật Pascal)?",
    options: [
      "Áp suất tác dụng vào chất lỏng chỉ được truyền theo phương thẳng đứng từ trên xuống dưới.",
      "Áp suất tác dụng vào chất lỏng được truyền nguyên vẹn theo mọi hướng.",
      "Áp suất tác dụng vào chất lỏng sẽ bị giảm dần theo khoảng cách xa dần nguồn tác dụng.",
      "Áp suất chỉ truyền tới đáy bình chứa mà không tác dụng lên thành bình."
    ],
    correct: 1,
    explanation: "Định luật Pascal: 'Áp suất tác dụng vào chất lỏng được truyền nguyên vẹn theo mọi hướng.' Đây là tính chất then chốt giúp chất lỏng truyền lực trong các hệ thống thủy lực."
  },
  {
    id: 2,
    question: "Trong thí nghiệm Hình 16.3 SGK, pít-tông (1) có diện tích S₁ gấp đôi S₂. Nếu đặt 4 quả nặng lên pít-tông (1) thì cần đặt bao nhiêu quả nặng lên pít-tông (2) để hai pít-tông cân bằng ngang nhau?",
    options: [
      "8 quả nặng",
      "4 quả nặng",
      "2 quả nặng",
      "1 quả nặng"
    ],
    correct: 2,
    explanation: "Để cân bằng: p₁ = p₂ ⇔ F₁ / S₁ = F₂ / S₂ ⇔ F₁ / F₂ = S₁ / S₂ = 2. Vì vậy lực F₁ gấp đôi F₂, nghĩa là 4 quả nặng ở (1) chỉ cần cân bằng với 2 quả nặng ở (2)!"
  },
  {
    id: 3,
    question: "Một máy nâng thủy lực có diện tích pít-tông lớn S₁ = 50·S₂. Muốn nâng một ô tô có trọng lượng 15.000 N, người ta chỉ cần tác dụng lên pít-tông nhỏ một lực F₂ là:",
    options: [
      "750.000 N",
      "15.000 N",
      "300 N",
      "50 N"
    ],
    correct: 2,
    explanation: "Áp dụng công thức: F₁ / F₂ = S₁ / S₂ ⇒ F₂ = F₁ / (S₁ / S₂) = 15.000 / 50 = 300 N. Một lực chỉ tương đương vật nặng 30 kg đã có thể nâng bổng chiếc ô tô 1.5 tấn!"
  },
  {
    id: 4,
    question: "Trong máy nén thủy lực có S₁ = 2·S₂, nếu pít-tông nhỏ đi xuống một đoạn h₂ = 6 cm thì pít-tông lớn sẽ dâng lên một đoạn h₁ là bao nhiêu?",
    options: [
      "12 cm",
      "6 cm",
      "3 cm",
      "0 cm"
    ],
    correct: 2,
    explanation: "Do thể tích chất lỏng chuyển dời là không đổi: V = S₁ · h₁ = S₂ · h₂ ⇒ h₁ = h₂ · (S₂ / S₁) = 6 · (1/2) = 3 cm. Lực nâng được lợi 2 lần nhưng quãng đường dịch chuyển bị thiệt 2 lần (bảo toàn công A₁ = A₂)!"
  },
  {
    id: 5,
    question: "Thiết bị hoặc máy móc nào sau đây KHÔNG ứng dụng nguyên lý truyền áp suất của chất lỏng?",
    options: [
      "Kích nâng thủy lực dùng trong gara sửa xe",
      "Hệ thống phanh đĩa dầu thủy lực trên xe máy, ô tô",
      "Máy ép mùn cưa, phế liệu thủy lực",
      "Nhiệt kế thủy ngân đo nhiệt độ"
    ],
    correct: 3,
    explanation: "Nhiệt kế thủy ngân hoạt động dựa trên hiện tượng giãn nở vì nhiệt của chất lỏng, không phải máy truyền lực thủy lực dựa trên định luật Pascal."
  }
];

class QuizEngine {
  constructor() {
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = {};
    this.container = document.getElementById('quizContainer');
    this.scoreBadge = document.getElementById('quizScoreBadge');
  }

  init() {
    this.render();
  }

  render() {
    if (!this.container) return;

    if (this.currentIndex >= QUIZ_QUESTIONS.length) {
      this.renderFinalResult();
      return;
    }

    const q = QUIZ_QUESTIONS[this.currentIndex];
    const isAnswered = this.userAnswers[q.id] !== undefined;
    const selectedIdx = this.userAnswers[q.id];

    let html = `
      <div class="space-y-3 animate-fadeIn">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Câu hỏi ${this.currentIndex + 1} / ${QUIZ_QUESTIONS.length}</span>
          <span class="font-mono text-emerald-400 font-bold">Điểm: ${this.score} / ${QUIZ_QUESTIONS.length}</span>
        </div>

        <div class="p-3 rounded-xl bg-slate-900 border border-slate-700 font-semibold text-xs text-white leading-relaxed">
          ${q.question}
        </div>

        <div class="space-y-2">
    `;

    q.options.forEach((opt, idx) => {
      let btnClass = "w-full text-left p-2.5 rounded-xl text-xs border transition flex items-start gap-2 ";
      let badge = `<span class="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold">${String.fromCharCode(65 + idx)}</span>`;

      if (!isAnswered) {
        btnClass += "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300";
      } else {
        if (idx === q.correct) {
          btnClass += "bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold";
          badge = `<span class="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[11px] shrink-0 font-bold">✓</span>`;
        } else if (idx === selectedIdx) {
          btnClass += "bg-rose-950/60 border-rose-500/80 text-rose-200";
          badge = `<span class="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[11px] shrink-0 font-bold">✗</span>`;
        } else {
          btnClass += "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
        }
      }

      html += `
        <button class="${btnClass}" ${isAnswered ? 'disabled' : `onclick="quiz.selectAnswer(${q.id}, ${idx})"`}>
          ${badge}
          <span class="pt-0.5">${opt}</span>
        </button>
      `;
    });

    html += `</div>`;

    if (isAnswered) {
      const isCorrect = selectedIdx === q.correct;
      html += `
        <div class="p-3 rounded-xl ${isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'} border text-xs leading-relaxed animate-fadeIn">
          <div class="font-bold flex items-center gap-1.5 mb-1">
            <span>${isCorrect ? '🎉 Chính xác!' : '💡 Giải thích chi tiết:'}</span>
          </div>
          <p class="text-slate-300">${q.explanation}</p>
        </div>

        <button class="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-600/20" onclick="quiz.nextQuestion()">
          ${this.currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả tổng kết 🏆'}
        </button>
      `;
    }

    this.container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  selectAnswer(qid, optIndex) {
    if (this.userAnswers[qid] !== undefined) return;
    this.userAnswers[qid] = optIndex;

    const q = QUIZ_QUESTIONS[this.currentIndex];
    if (optIndex === q.correct) {
      this.score++;
      if (window.sound) window.sound.playSuccess();
    } else {
      if (window.sound) window.sound.playClick();
    }

    if (this.scoreBadge) {
      this.scoreBadge.textContent = `Điểm: ${this.score}/${QUIZ_QUESTIONS.length}`;
    }

    this.render();
  }

  nextQuestion() {
    this.currentIndex++;
    this.render();
  }

  renderFinalResult() {
    const percentage = Math.round((this.score / QUIZ_QUESTIONS.length) * 100);
    let title = "Hoàn thành thử thách!";
    let emoji = "🎉";
    let message = "Bạn đã nắm rất vững định luật Pascal và nguyên lý máy nén thủy lực!";

    if (percentage < 60) {
      title = "Cố gắng lên nhé!";
      emoji = "📚";
      message = "Hãy xem lại phần 'Lý thuyết SGK' và thực hiện lại thí nghiệm để nắm chắc hơn.";
    }

    this.container.innerHTML = `
      <div class="text-center py-4 space-y-3 animate-fadeIn">
        <div class="text-4xl">${emoji}</div>
        <h4 class="text-base font-extrabold text-white">${title}</h4>
        <div class="text-2xl font-black text-emerald-400 font-mono">
          ${this.score} / ${QUIZ_QUESTIONS.length} điểm (${percentage}%)
        </div>
        <p class="text-xs text-slate-300 px-3">
          ${message}
        </p>

        <button class="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition" onclick="quiz.restart()">
          Làm lại bài kiểm tra 🔄
        </button>
      </div>
    `;
  }

  restart() {
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = {};
    if (this.scoreBadge) {
      this.scoreBadge.textContent = `Điểm: 0/${QUIZ_QUESTIONS.length}`;
    }
    this.render();
  }
}

window.quiz = new QuizEngine();

