// hoangdzPatternEngine.js
// THUẬT TOÁN HỌC CẦU TỰ ĐỘNG - HOANGDZ ENGINE (KHÔNG RANDOM)

class HoangdzPatternEngine {
    constructor() {
        this.historicalData = "";
        this.recentPattern50 = "";
        this.recentPattern20 = "";
        this.patternMemory = {}; // Lưu trữ tần suất xuất hiện của các mẫu cầu
    }

    // Hàm nạp dữ liệu cầu thô từ tệp dữ liệu của bạn
    feedRawData(rawString) {
        if (!rawString) return;
        // Chuẩn hóa dữ liệu về định dạng T và X
        this.historicalData += rawString.replace(/[^TX]/g, "");
        this.analyzePatterns();
    }

    // Phân tích ma trận mẫu hình (Pattern Matrix) chuyên sâu
    analyzePatterns() {
        const len = this.historicalData.length;
        if (len < 10) return;

        // Cập nhật chuỗi hẹp 20 và 50 phiên phục vụ bám sát cầu nhảy
        this.recentPattern50 = this.historicalData.slice(-50);
        this.recentPattern20 = this.historicalData.slice(-20);

        // Học các mẫu chuỗi độ dài từ 3 đến 6 phiên liên tục
        for (let size = 3; size <= 6; size++) {
            for (let i = 0; i <= len - size - 1; i++) {
                const currentPattern = this.historicalData.slice(i, i + size);
                const nextResult = this.historicalData.charAt(i + size);

                if (!this.patternMemory[currentPattern]) {
                    this.patternMemory[currentPattern] = { T: 0, X: 0, total: 0 };
                }
                this.patternMemory[currentPattern][nextResult]++;
                this.patternMemory[currentPattern].total++;
            }
        }
    }

    // Hệ thống 10 thuật toán đối chiếu chuỗi (Deterministic Algorithms)
    runAdvancedPrediction() {
        if (this.historicalData.length < 10) return { prediction: "Tài", confidence: "50%" };

        const lastChar = this.historicalData.slice(-1);
        const last3 = this.historicalData.slice(-3);
        const last4 = this.historicalData.slice(-4);
        const last5 = this.historicalData.slice(-5);

        let taiScore = 0;
        let xiuScore = 0;

        // --- ALGORITHM 1: Khớp mẫu hình quá khứ chuỗi 5 (Pattern Matching 5) ---
        if (this.patternMemory[last5] && this.patternMemory[last5].total > 2) {
            const mem = this.patternMemory[last5];
            if (mem.T > mem.X) taiScore += 3.5; else if (mem.X > mem.T) xiuScore += 3.5;
        }

        // --- ALGORITHM 2: Khớp mẫu hình quá khứ chuỗi 4 (Pattern Matching 4) ---
        if (this.patternMemory[last4] && this.patternMemory[last4].total > 4) {
            const mem = this.patternMemory[last4];
            if (mem.T > mem.X) taiScore += 2.5; else if (mem.X > mem.T) xiuScore += 2.5;
        }

        // --- ALGORITHM 3: Khớp mẫu hình quá khứ chuỗi 3 (Pattern Matching 3) ---
        if (this.patternMemory[last3] && this.patternMemory[last3].total > 5) {
            const mem = this.patternMemory[last3];
            if (mem.T > mem.X) taiScore += 1.5; else if (mem.X > mem.T) xiuScore += 1.5;
        }

        // --- ALGORITHM 4: Phân tích gia tốc hồi quy 20 phiên gần nhất ---
        const tai20 = (this.recentPattern20.match(/T/g) || []).length;
        const xiu20 = 20 - tai20;
        if (tai20 >= 14) xiuScore += 2.0; // Bẻ cầu khi Tài quá rực (Hồi quy)
        else if (xiu20 >= 14) taiScore += 2.0; // Bẻ cầu khi Xỉu quá rực

        // --- ALGORITHM 5: Thuật toán mật độ bệt chuỗi hẹp 50 phiên ---
        const tai50 = (this.recentPattern50.match(/T/g) || []).length;
        if (tai50 > 28) taiScore += 1.0; // Xu hướng nghiêng hẳn về Tài
        else if (tai50 < 22) xiuScore += 1.0; // Xu hướng nghiêng hẳn về Xỉu

        // --- ALGORITHM 6: Logic Chu kỳ Lặp Đảo Biến Thiên (Alternating Cycle) ---
        if (last4 === "TXTX" || last4 === "XTXT") {
            if (lastChar === "T") xiuScore += 2.0; else taiScore += 2.0;
        }

        // --- ALGORITHM 7: Phát hiện Phanh Cầu gãy (Break-Point Detection) ---
        if (last5 === "TTTTT") xiuScore += 3.0; // Phanh bệt Tài dài
        if (last5 === "XXXXX") taiScore += 3.0; // Phanh bệt Xỉu dài

        // --- ALGORITHM 8: Ma trận dịch chuyển Markov bậc 1 ---
        if (this.patternMemory[lastChar]) {
            const mem = this.patternMemory[lastChar];
            if (mem.T > mem.X) taiScore += 0.5; else xiuScore += 0.5;
        }

        // --- ALGORITHM 9: Phân tích đối xứng chuỗi kép (Mirror Pattern) ---
        const currentDoublet = this.historicalData.slice(-2);
        if (currentDoublet === "TT") taiScore += 0.8; 
        else if (currentDoublet === "XX") xiuScore += 0.8;

        // --- ALGORITHM 10: Tần suất cân bằng logic tổng cục ---
        const totalLen = this.historicalData.length;
        const globalTai = (this.historicalData.match(/T/g) || []).length;
        const globalXiu = totalLen - globalTai;
        if (globalTai > globalXiu) xiuScore += 0.2; else taiScore += 0.2;

        // TỔNG HỢP LOGIC ĐỒNG THUẬN QUYẾT ĐỊNH KẾT QUẢ
        const finalPrediction = taiScore >= xiuScore ? "Tài" : "Xỉu";
        const totalScore = taiScore + xiuScore;
        const confidence = totalScore > 0 ? ((Math.max(taiScore, xiuScore) / totalScore) * 100).toFixed(2) + "%" : "50%";

        return {
            prediction: finalPrediction,
            confidence: confidence,
            debug: { taiScore, xiuScore }
        };
    }
}

module.exports = new HoangdzPatternEngine();
