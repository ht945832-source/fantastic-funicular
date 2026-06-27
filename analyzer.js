// analyzer.js
const fs = require('fs');
const algorithms = require('./algorithms');

const WEIGHTS_FILE = './model_weights.json';
const AUTO_REVERSAL_THRESHOLD = 5; // Gặp 5 phiên thua liên tục sẽ kích hoạt đảo cầu logic

class SunAnalyzer {
    constructor() {
        this.weights = { main: {}, sub: {}, mini: {} };
        this.stats = { consecutiveLosses: 0, autoReversalActive: false, totalPredictions: 0, correctPredictions: 0 };
        this.initWeights();
    }

    initWeights() {
        if (fs.existsSync(WEIGHTS_FILE)) {
            try {
                const data = JSON.parse(fs.readFileSync(WEIGHTS_FILE, 'utf8'));
                this.weights = data.weights || this.weights;
                this.stats = data.stats || this.stats;
                return;
            } catch (e) { console.log("[❌] Khởi tạo trọng số mới"); }
        }
        // Tạo trọng số mặc định cho tất cả 84 models
        for (let i = 1; i <= 21; i++) this.weights.main[`model_${i}`] = 1.0;
        for (let i = 1; i <= 42; i++) this.weights.sub[`sub_${i}`] = 1.0;
        for (let i = 1; i <= 21; i++) this.weights.mini[`mini_${i}`] = 1.0;
    }

    saveWeights() {
        fs.writeFileSync(WEIGHTS_FILE, JSON.stringify({ weights: this.weights, stats: this.stats }, null, 2));
    }

    predict(history) {
        if (history.length < 5) return { prediction: "Tài", confidence: "0%" };

        let taiVotes = 0;
        let xiuVotes = 0;

        // Tập hợp phiếu bầu từ 21 main models
        for (let i = 1; i <= 21; i++) {
            const vote = algorithms.runMainModel(i, history);
            const w = this.weights.main[`model_${i}`] || 1.0;
            if (vote === "Tài") taiVotes += w; else xiuVotes += w;
        }

        // Tập hợp phiếu bầu từ 42 sub models
        for (let i = 1; i <= 42; i++) {
            const vote = algorithms.runSubModel(i, history);
            const w = this.weights.sub[`sub_${i}`] || 1.0;
            if (vote === "Tài") taiVotes += w; else xiuVotes += w;
        }

        // Tập hợp phiếu bầu từ 21 mini models
        for (let i = 1; i <= 21; i++) {
            const vote = algorithms.runMiniModel(i, history);
            const w = this.weights.mini[`mini_${i}`] || 1.0;
            if (vote === "Tài") taiVotes += w; else xiuVotes += w;
        }

        // Kết quả đồng thuận cao nhất (Tuyệt đối không random)
        let finalPrediction = taiVotes >= xiuVotes ? "Tài" : "Xỉu";
        const totalVotes = taiVotes + xiuVotes;
        const confidence = ((Math.max(taiVotes, xiuVotes) / totalVotes) * 100).toFixed(2) + "%";

        // Tự động kích hoạt cơ chế đảo cầu nếu đang dính chuỗi thua dài
        if (this.stats.autoReversalActive) {
            finalPrediction = finalPrediction === "Tài" ? "Xỉu" : "Tài";
        }

        return { prediction: finalPrediction, confidence };
    }

    updateLearning(history, realResult) {
        if (history.length < 5) return;

        this.stats.totalPredictions++;
        let isSystemCorrect = false;

        // Chấm điểm hiệu năng từng model để tối ưu hóa trọng số cho phiên sau
        for (let i = 1; i <= 21; i++) {
            if (algorithms.runMainModel(i, history) === realResult) this.weights.main[`model_${i}`] += 0.1;
            else this.weights.main[`model_${i}`] = Math.max(0.1, this.weights.main[`model_${i}`] - 0.1);
        }
        for (let i = 1; i <= 42; i++) {
            if (algorithms.runSubModel(i, history) === realResult) this.weights.sub[`sub_${i}`] += 0.05;
            else this.weights.sub[`sub_${i}`] = Math.max(0.05, this.weights.sub[`sub_${i}`] - 0.05);
        }
        for (let i = 1; i <= 21; i++) {
            if (algorithms.runMiniModel(i, history) === realResult) this.weights.mini[`mini_${i}`] += 0.1;
            else this.weights.mini[`mini_${i}`] = Math.max(0.1, this.weights.mini[`mini_${i}`] - 0.1);
        }

        // Thống kê chuỗi thắng thua toàn cục
        const currentPrediction = this.predict(history).prediction;
        if (currentPrediction === realResult) {
            this.stats.correctPredictions++;
            this.stats.consecutiveLosses = 0;
            this.stats.autoReversalActive = false;
        } else {
            this.stats.consecutiveLosses++;
            if (this.stats.consecutiveLosses >= AUTO_REVERSAL_THRESHOLD) {
                this.stats.autoReversalActive = true;
                console.log(`[⚠️] Kích hoạt chế độ đảo cầu thông minh tự động do thua liền ${this.stats.consecutiveLosses} phiên.`);
            }
        }

        this.saveWeights();
    }
}

module.exports = new SunAnalyzer();
