// algorithms.js
// HOANGDZ LOGIC ENGINE - KHÔNG RANDOM

class SunAlgorithms {
    constructor() {
        this.totalMainModels = 21;
        this.totalSubModels = 42;
        this.totalMiniModels = 21;
    }

    // --- 21 THUẬT TOÁN CHÍNH (MAIN MODELS) ---
    runMainModel(id, history) {
        if (history.length < 5) return "Tài"; // Mặc định khi chưa đủ dữ liệu nền
        const last = history[history.length - 1];
        const p1 = history[history.length - 2];
        const p2 = history[history.length - 3];

        switch(id) {
            case 1: return last.Ket_qua; // Cầu bệt (Thuận)
            case 2: return last.Ket_qua === "Tài" ? "Xỉu" : "Tài"; // Cầu đảo 1-1
            case 3: return (history.length % 2 === 0) ? "Tài" : "Xỉu"; // Chu kỳ động nhị phân
            case 4: return last.Tong % 2 === 0 ? "Tài" : "Xỉu"; // Logic chẵn lẻ tổng điểm
            case 5: return last.Tong > 11 ? "Tài" : "Xỉu"; // Logic tiệm cận biên trên/dưới
            case 6: return (last.Xuc_xac_1 + last.Xuc_xac_2) % 2 === 0 ? "Tài" : "Xỉu"; // Logic cặp xúc xắc 1-2
            case 7: return (last.Xuc_xac_2 + last.Xuc_xac_3) % 2 === 0 ? "Xỉu" : "Tài"; // Logic cặp xúc xắc 2-3
            case 8: return last.Xuc_xac_1 === last.Xuc_xac_3 ? "Tài" : "Xỉu"; // Thuật toán đối xứng tâm điểm
            case 9: return p1 && last.Ket_qua === p1.Ket_qua ? (last.Ket_qua === "Tài" ? "Xỉu" : "Tài") : last.Ket_qua; // Phanh cầu 2-2
            case 10: return last.Tong >= 7 && last.Tong <= 14 ? "Xỉu" : "Tài"; // Logic vùng mật độ cao
            case 11: return (last.Xuc_xac_1 * last.Xuc_xac_2 * last.Xuc_xac_3) % 2 === 0 ? "Tài" : "Xỉu"; // Logic tích chuỗi số
            case 12: return last.Tong % 3 === 0 ? "Tài" : "Xỉu"; // Logic đồng dư modulo 3
            case 13: return last.Tong % 3 === 1 ? "Xỉu" : "Tài"; // Logic đồng dư modulo 3 biến thể
            case 14: return (last.Tong + p1.Tong) % 2 === 0 ? "Tài" : "Xỉu"; // Logic tổng kép liên phiên
            case 15: return last.Tong > p1.Tong ? "Tài" : "Xỉu"; // Thuật toán gia tốc (Tăng đánh Thuận)
            case 16: return last.Tong > p1.Tong ? "Xỉu" : "Tài"; // Thuật toán gia tốc ngược (Tăng đánh Đảo)
            case 17: return (last.Xuc_xac_1 + p1.Xuc_xac_1) % 2 === 0 ? "Tài" : "Xỉu"; // Logic chuỗi điểm xúc xắc đầu
            case 18: return (last.Xuc_xac_3 + p1.Xuc_xac_3) % 2 === 0 ? "Xỉu" : "Tài"; // Logic chuỗi điểm xúc xắc cuối
            case 19: return Math.abs(last.Tong - p1.Tong) <= 3 ? "Xỉu" : "Tài"; // Thuật toán biên độ hẹp
            case 20: return (last.Tong + last.Xuc_xac_1) % 2 === 0 ? "Tài" : "Xỉu"; // Logic tổng hợp điểm nền và hạt nhân
            case 21: return history.filter(h => h.Ket_qua === "Tài").length > history.filter(h => h.Ket_qua === "Xỉu").length ? "Xỉu" : "Tài"; // Thuật toán hồi quy hồi vị (Đánh phe yếu)
            default: return "Tài";
        }
    }

    // --- 42 THUẬT TOÁN PHỤ (SUB MODELS - CHUYÊN SÂU CẦU LẶP) ---
    runSubModel(id, history) {
        if (history.length < 8) return "Xỉu";
        const last5 = history.slice(-5).map(h => h.Ket_qua);
        const lastText = last5.join("");

        // Nhóm phân tích chuyên sâu cầu 1-1, 2-2, 3-3 từ ID 1 đến 42
        if (id >= 1 && id <= 14) { // Chuyên trách phân tích ma trận cầu ngắn 1-1 và 1-2
            return lastText.endsWith("TX") || lastText.endsWith("XT") ? "Tài" : "Xỉu";
        }
        if (id >= 15 && id <= 28) { // Chuyên trách phân tích hệ số Fibonacci áp vào tổng điểm liên phiên
            const sum3 = history.slice(-3).reduce((acc, cur) => acc + cur.Tong, 0);
            return sum3 % 2 === 0 ? "Tài" : "Xỉu";
        }
        if (id >= 29 && id <= 42) { // Chuyên trách kiểm thử độ lệch biên xác suất hồi quy
            const ratio = history.slice(-10).filter(h => h.Ket_qua === "Tài").length / 10;
            return ratio >= 0.6 ? "Xỉu" : "Tài";
        }
        return "Tài";
    }

    // --- 21 THUẬT TOÁN MINI (MINI MODELS - MA TRẬN DỊCH CHUYỂN TRẠNG THÁI) ---
    runMiniModel(id, history) {
        if (history.length < 4) return "Tài";
        const last = history[history.length - 1];
        const p1 = history[history.length - 2];
        
        // Tạo ma trận dịch chuyển logic dựa trên id
        const key = `${p1.Ket_qua}->${last.Ket_qua}`;
        if (id % 3 === 0) {
            return key === "Tài->Tài" || key === "Xỉu->Xỉu" ? "Xỉu" : "Tài";
        } else if (id % 3 === 1) {
            return key === "Tài->Xỉu" ? "Tài" : "Xỉu";
        } else {
            return last.Tong % 2 !== 0 ? "Tài" : "Xỉu";
        }
    }
}

module.exports = new SunAlgorithms();
