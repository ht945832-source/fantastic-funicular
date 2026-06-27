const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// ==================== FILE STORAGE ====================
const HISTORY_FILE = './history.json';
const PATTERNS_FILE = './patterns.json';
const MODEL_WEIGHTS_FILE = './model_weights.json';

// Load history if exists
let resultHistory = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        resultHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        console.log(`[📂] Đã tải ${resultHistory.length} phiên từ history.json`);
    } catch (e) {
        console.error('[❌] Lỗi đọc history.json:', e.message);
    }
}

// Load model weights if exists
let modelWeights = {
    'model1': 1.0, 'model2': 1.0, 'model3': 1.0, 'model4': 1.0,
    'model5': 1.0, 'model6': 1.0, 'model7': 1.0, 'model8': 1.0,
    'model9': 1.0, 'model10': 1.0, 'model11': 1.0, 'model12': 1.0,
    'model13': 1.0, 'model14': 1.0, 'model15': 1.0, 'model16': 1.0,
    'model17': 1.0, 'model18': 1.0, 'model19': 1.0, 'model20': 1.0,
    'model21': 1.0
};

// Load sub model weights
let subModelWeights = {};
for (let i = 1; i <= 42; i++) {
    subModelWeights[`sub_model_${i}`] = 1.0;
}

// Load mini model weights
let miniModelWeights = {};
for (let i = 1; i <= 21; i++) {
    miniModelWeights[`mini_model_${i}`] = 1.0;
}

if (fs.existsSync(MODEL_WEIGHTS_FILE)) {
    try {
        const savedWeights = JSON.parse(fs.readFileSync(MODEL_WEIGHTS_FILE, 'utf8'));
        modelWeights = savedWeights.modelWeights || modelWeights;
        subModelWeights = savedWeights.subModelWeights || subModelWeights;
        miniModelWeights = savedWeights.miniModelWeights || miniModelWeights;
        console.log('[📂] Đã tải model_weights.json');
    } catch (e) {
        console.error('[❌] Lỗi đọc model_weights.json:', e.message);
    }
}

// Save history
function saveHistory(entry) {
    resultHistory.push(entry);
    if (resultHistory.length > 1000) resultHistory.shift();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(resultHistory, null, 2));
}

// Save model weights
function saveModelWeights() {
    const weights = {
        modelWeights,
        subModelWeights,
        miniModelWeights
    };
    fs.writeFileSync(MODEL_WEIGHTS_FILE, JSON.stringify(weights, null, 2));
}

// ==================== GLOBAL VARIABLES ====================
let currentSessionId = null;
let lastResult = null;
let lastPrediction = null;
let stats = {
    total: 0,
    correct: 0,
    wrong: 0,
    consecutiveLosses: 0,
    modelPerformance: {}
};

let apiResponseData = {
    "Phien": null,
    "Xuc_xac_1": null,
    "Xuc_xac_2": null,
    "Xuc_xac_3": null,
    "Tong": null,
    "Ket_qua": "",
    "Phien_hien_tai": null,
    "Du_doan": "",
    "Loai_cau": "",
    "Mau_cau_phat_hien": "",
    "Do_tin_cay": "0%",
    "Trang_thai": "",
    "Ket_qua_du_doan": "",
    "Thong_ke": {
        "tong": 0,
        "dung": 0,
        "sai": 0,
        "ti_le": "0%"
    },
    "id": "@tranhoang2286"
};

// ==================== SUPER AI ENGINE ====================
class SuperAI {
    constructor() {
        this.weights = {};
        this.learningRate = 0.01;
        this.momentum = 0.9;
        this.velocity = {};
        this.performanceHistory = [];
        this.initWeights();
    }

    initWeights() {
        const allModels = [...Object.keys(modelWeights), ...Object.keys(subModelWeights), ...Object.keys(miniModelWeights)];
        for (let model of allModels) {
            this.weights[model] = {
                weight: 1.0,
                velocity: 0,
                accuracy: 0.5,
                samples: 0
            };
        }
    }

    updateWeight(modelName, error, confidence) {
        if (!this.weights[modelName]) return;
        
        const w = this.weights[modelName];
        const gradient = -error * confidence * w.weight;
        w.velocity = this.momentum * w.velocity - this.learningRate * gradient;
        w.weight += w.velocity;
        w.weight = Math.max(0.3, Math.min(2.0, w.weight));
        w.samples++;
    }

    learn(actual, predicted, modelsUsed) {
        const error = actual === predicted ? 0 : 1;
        
        for (let [modelName, result] of Object.entries(modelsUsed)) {
            if (result && result.confidence) {
                const confidence = result.confidence || 0.5;
                this.updateWeight(modelName, error, confidence);
                
                if (this.weights[modelName]) {
                    const w = this.weights[modelName];
                    w.accuracy = (w.accuracy * w.samples + (1 - error)) / (w.samples + 1);
                }
            }
        }
        
        this.performanceHistory.push({
            actual,
            predicted,
            error,
            timestamp: Date.now(),
            models: Object.keys(modelsUsed).length
        });
        
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory.shift();
        }
    }

    predictWithWeights(predictions) {
        let weightedTai = 0;
        let weightedXiu = 0;
        let totalWeight = 0;
        let details = [];

        for (let [modelName, result] of Object.entries(predictions)) {
            if (!result || !result.prediction || !result.confidence) continue;
            
            const w = this.weights[modelName];
            const weight = w ? w.weight : 1.0;
            const weightedConfidence = weight * result.confidence;
            
            if (result.prediction === 'Tài') {
                weightedTai += weightedConfidence;
            } else if (result.prediction === 'Xỉu') {
                weightedXiu += weightedConfidence;
            }
            
            totalWeight += weightedConfidence;
            details.push({
                model: modelName,
                prediction: result.prediction,
                confidence: result.confidence,
                weight: weight,
                accuracy: w ? w.accuracy : 0.5
            });
        }

        details.sort((a, b) => b.confidence - a.confidence);

        return {
            taiScore: weightedTai,
            xiuScore: weightedXiu,
            totalWeight,
            details: details.slice(0, 10)
        };
    }

    detectBreakPattern(results) {
        if (results.length < 8) return null;

        const last8 = results.slice(-8);
        const last4 = results.slice(-4);
        
        const currentStreak = this.getStreak(results);
        const pattern = this.detectPattern(results);
        
        let warning = false;
        let reason = '';
        let confidence = 0;

        if (currentStreak >= 5) {
            warning = true;
            reason = `Cầu bệt dài ${currentStreak} phiên, khả năng gãy cao`;
            confidence = 0.6 + (currentStreak - 5) * 0.05;
        }

        if (last4[0] === last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3]) {
            warning = true;
            reason = 'Phát hiện dấu hiệu bẻ cầu 2-2';
            confidence = 0.7;
        }

        if (this.isAlternating(results, 6)) {
            warning = true;
            reason = 'Cầu 1-1 dài 6 phiên, sắp gãy';
            confidence = 0.75;
        }

        if (warning) {
            return { warning: true, reason, confidence, currentStreak, pattern };
        }
        return null;
    }

    getStreak(results) {
        if (results.length === 0) return 0;
        const last = results[results.length - 1];
        let streak = 1;
        for (let i = results.length - 2; i >= 0; i--) {
            if (results[i] === last) streak++;
            else break;
        }
        return streak;
    }

    isAlternating(results, length) {
        if (results.length < length) return false;
        const last = results.slice(-length);
        for (let i = 0; i < last.length - 1; i++) {
            if (last[i] === last[i+1]) return false;
        }
        return true;
    }

    detectPattern(results) {
        if (results.length < 3) return 'Không xác định';
        const last3 = results.slice(-3);
        
        if (last3[0] === last3[1] && last3[1] === last3[2]) return 'Bệt';
        if (last3[0] !== last3[1] && last3[1] !== last3[2]) return '1-1';
        if (last3[0] === last3[1] && last3[1] !== last3[2]) return '2-1';
        return '1-2';
    }

    getOverallConfidence(predictions) {
        let totalConfidence = 0;
        let count = 0;
        
        for (let [name, result] of Object.entries(predictions)) {
            if (result && result.confidence) {
                const w = this.weights[name];
                const weight = w ? w.weight : 1.0;
                totalConfidence += result.confidence * weight;
                count++;
            }
        }
        return count > 0 ? totalConfidence / count : 0.5;
    }

    getLongTermTrend(history) {
        if (history.length < 20) return { trend: 'Chưa đủ dữ liệu', strength: 0 };
        
        const results = history.map(h => h.Ket_qua);
        const first10 = results.slice(0, 10);
        const last10 = results.slice(-10);
        
        const firstTai = first10.filter(r => r === 'Tài').length;
        const lastTai = last10.filter(r => r === 'Tài').length;
        
        const shift = (lastTai - firstTai) / 10;
        const strength = Math.abs(shift);
        
        if (shift > 0.2) return { trend: 'Tài đang lên', strength, shift };
        if (shift < -0.2) return { trend: 'Xỉu đang lên', strength, shift };
        return { trend: 'Xu hướng đi ngang', strength, shift };
    }
}

// ==================== TAI XIU ANALYZER ====================
class TaiXiuAnalyzer {
    constructor() {
        this.modelWeights = modelWeights;
        this.subModelWeights = subModelWeights;
        this.miniModelWeights = miniModelWeights;
        
        this.subModels = {};
        this.miniModels = {};
        this.initSubModels();
        this.initMiniModels();
        this.patternLibrary = this.loadPatternLibrary();
    }

    loadPatternLibrary() {
        if (fs.existsSync(PATTERNS_FILE)) {
            try {
                return JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf8'));
            } catch (e) {
                console.error('[❌] Lỗi đọc patterns.json:', e.message);
            }
        }
        return { '1-1': [], '2-2': [], '3-3': [], '1-2': [], '2-1': [], '2-1-2': [], '1-2-1': [], 'bệt': [], 'loạn': [] };
    }

    savePatternLibrary() {
        fs.writeFileSync(PATTERNS_FILE, JSON.stringify(this.patternLibrary, null, 2));
    }

    initSubModels() {
        const subModelSpecialties = {
            1: { name: '1-1 thuần', type: '1-1', logic: 'pure', minLength: 4, threshold: 0.9 },
            2: { name: '1-1 biến thể', type: '1-1', logic: 'variant', minLength: 5, threshold: 0.8 },
            3: { name: '1-1 dài hạn', type: '1-1', logic: 'long', minLength: 8, threshold: 0.75 },
            4: { name: '1-1 kết hợp', type: '1-1', logic: 'hybrid', minLength: 6, threshold: 0.7 },
            5: { name: '1-1 gãy', type: '1-1', logic: 'break', minLength: 6, threshold: 0.8 },
            6: { name: '1-1 phục hồi', type: '1-1', logic: 'recovery', minLength: 7, threshold: 0.7 },
            7: { name: '2-2 chuẩn', type: '2-2', logic: 'pure', minLength: 6, threshold: 0.9 },
            8: { name: '2-2 lệch', type: '2-2', logic: 'offset', minLength: 7, threshold: 0.8 },
            9: { name: '2-2 biến tướng', type: '2-2', logic: 'variant', minLength: 8, threshold: 0.75 },
            10: { name: '2-2 kết hợp 1-1', type: '2-2', logic: 'hybrid', minLength: 8, threshold: 0.7 },
            11: { name: '2-2 dài', type: '2-2', logic: 'long', minLength: 10, threshold: 0.8 },
            12: { name: '2-2 bẻ', type: '2-2', logic: 'break', minLength: 7, threshold: 0.85 },
            13: { name: 'bệt ngắn', type: 'bệt', logic: 'short', minLength: 3, threshold: 0.8 },
            14: { name: 'bệt trung', type: 'bệt', logic: 'medium', minLength: 5, threshold: 0.85 },
            15: { name: 'bệt dài', type: 'bệt', logic: 'long', minLength: 7, threshold: 0.9 },
            16: { name: 'bệt gãy', type: 'bệt', logic: 'break', minLength: 5, threshold: 0.8 },
            17: { name: 'bệt xen kẽ', type: 'bệt', logic: 'hybrid', minLength: 6, threshold: 0.7 },
            18: { name: 'siêu bệt', type: 'bệt', logic: 'super', minLength: 10, threshold: 0.95 },
            19: { name: '3-3 chuẩn', type: '3-3', logic: 'pure', minLength: 9, threshold: 0.9 },
            20: { name: '3-3 biến thể', type: '3-3', logic: 'variant', minLength: 10, threshold: 0.8 },
            21: { name: '3-3 ngắn', type: '3-3', logic: 'short', minLength: 6, threshold: 0.7 },
            22: { name: '3-3 kết hợp', type: '3-3', logic: 'hybrid', minLength: 9, threshold: 0.75 },
            23: { name: '3-3 bẻ', type: '3-3', logic: 'break', minLength: 8, threshold: 0.8 },
            24: { name: '3-3 dài', type: '3-3', logic: 'long', minLength: 12, threshold: 0.85 },
            25: { name: '2-1-2 chuẩn', type: '2-1-2', logic: 'pure', minLength: 5, threshold: 0.9 },
            26: { name: '2-1-2 biến thể', type: '2-1-2', logic: 'variant', minLength: 6, threshold: 0.8 },
            27: { name: '2-1-2 dài', type: '2-1-2', logic: 'long', minLength: 8, threshold: 0.8 },
            28: { name: '1-2-1 chuẩn', type: '1-2-1', logic: 'pure', minLength: 5, threshold: 0.9 },
            29: { name: '1-2-1 biến thể', type: '1-2-1', logic: 'variant', minLength: 6, threshold: 0.8 },
            30: { name: '1-2-1 dài', type: '1-2-1', logic: 'long', minLength: 8, threshold: 0.8 },
            31: { name: 'bẻ cầu 1-1', type: 'break', logic: 'break11', minLength: 4, threshold: 0.85 },
            32: { name: 'bẻ cầu 2-2', type: 'break', logic: 'break22', minLength: 5, threshold: 0.85 },
            33: { name: 'bẻ cầu bệt', type: 'break', logic: 'breakStreak', minLength: 4, threshold: 0.8 },
            34: { name: '11 sang 22', type: 'transition', logic: '11to22', minLength: 6, threshold: 0.75 },
            35: { name: '22 sang 11', type: 'transition', logic: '22to11', minLength: 6, threshold: 0.75 },
            36: { name: 'bệt sang 11', type: 'transition', logic: 'streakTo11', minLength: 5, threshold: 0.7 },
            37: { name: 'phân tích tần suất', type: 'frequency', logic: 'frequency', minLength: 10, threshold: 0.7 },
            38: { name: 'phân tích chu kỳ', type: 'cycle', logic: 'cycle', minLength: 12, threshold: 0.7 },
            39: { name: 'phân tích đối xứng', type: 'symmetry', logic: 'symmetry', minLength: 8, threshold: 0.75 },
            40: { name: 'phân tích Fibonacci', type: 'fibonacci', logic: 'fibonacci', minLength: 8, threshold: 0.7 },
            41: { name: 'xu hướng dài', type: 'trend', logic: 'longTrend', minLength: 15, threshold: 0.8 },
            42: { name: 'siêu phân tích', type: 'super', logic: 'super', minLength: 20, threshold: 0.85 }
        };
        
        for (let i = 1; i <= 42; i++) {
            this.subModels[`sub_model_${i}`] = {
                ...subModelSpecialties[i],
                weight: this.subModelWeights[`sub_model_${i}`] || 1.0,
                accuracy: 0.5,
                predictions: []
            };
        }
    }

    initMiniModels() {
        const specialties = {
            1: 'phat_hien_cau_dep', 2: 'du_doan_bien_dong', 3: 'phan_tich_so_sanh',
            4: 'nhan_dien_xu_huong_cuc_bo', 5: 'tinh_toan_xac_suat_cao',
            6: 'phat_hien_diem_gay', 7: 'du_doan_nguong', 8: 'phan_tich_chuoi',
            9: 'nhan_dien_mau_lap', 10: 'tinh_he_so_tuong_quan', 11: 'du_doan_doan_nhiet',
            12: 'phan_tich_pha', 13: 'nhan_dien_song', 14: 'tinh_toan_momentum',
            15: 'du_doan_hoi_phuc', 16: 'phat_hien_dot_bien', 17: 'phan_tich_can_bang',
            18: 'nhan_dien_tan_so', 19: 'du_doan_chu_ky', 20: 'tinh_toan_ma_tran',
            21: 'phan_tich_tong_hop'
        };
        
        for (let i = 1; i <= 21; i++) {
            this.miniModels[`mini_model_${i}`] = {
                weight: this.miniModelWeights[`mini_model_${i}`] || 1.0,
                accuracy: 0.5,
                specialty: specialties[i] || 'chung',
                predictions: []
            };
        }
    }

    getResultArray(history) {
        return history.map(h => h.Ket_qua || (h.score >= 11 ? 'Tài' : 'Xỉu'));
    }

    // ==================== SUB MODELS ====================
    runSubModel11(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        const last4 = results.slice(-4);
        
        switch (model.logic) {
            case 'pure':
                if (this.isPerfectAlternating(results, 4)) {
                    return { prediction: last === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.9, reason: '1-1 thuần túy' };
                }
                break;
            case 'variant':
                if (this.isAlternatingWithTolerance(results, 1)) {
                    return { prediction: last === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.8, reason: '1-1 biến thể' };
                }
                break;
            case 'long':
                const longResults = results.slice(-12);
                const altCount = this.countAlternating(longResults);
                if (altCount >= 8) {
                    return { prediction: last === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.7 + (altCount / 20), reason: `1-1 dài hạn ${altCount}/11` };
                }
                break;
            case 'break':
                if (last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3]) {
                    const streak = this.getStreak(results.slice(0, -1));
                    if (streak > 4) {
                        return { prediction: last, confidence: 0.8, reason: '1-1 sắp gãy, giữ nguyên' };
                    }
                }
                break;
            case 'recovery':
                if (last4[0] === last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3]) {
                    return { prediction: last4[3] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.7, reason: '1-1 phục hồi' };
                }
                break;
        }
        return null;
    }

    runSubModel22(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        const last6 = results.slice(-6);
        const last8 = results.slice(-8);
        
        switch (model.logic) {
            case 'pure':
                if (last6.length === 6 && last6[0] === last6[1] && last6[1] !== last6[2] &&
                    last6[2] === last6[3] && last6[3] !== last6[4] && last6[4] === last6[5]) {
                    return { prediction: last6[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.9, reason: '2-2 chuẩn' };
                }
                break;
            case 'offset':
                if (last6.length === 6 && last6[0] === last6[1] && last6[1] !== last6[2] &&
                    last6[2] !== last6[3] && last6[3] === last6[4] && last6[4] !== last6[5]) {
                    return { prediction: last6[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.8, reason: '2-2 lệch' };
                }
                break;
            case 'variant':
                if (last8.length === 8 && last8[0] === last8[1] && last8[1] !== last8[2] &&
                    last8[2] === last8[3] && last8[3] !== last8[4] &&
                    last8[4] === last8[5] && last8[5] !== last8[6] && last8[6] === last8[7]) {
                    return { prediction: last8[6] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.75, reason: '2-2 biến tướng' };
                }
                break;
            case 'long':
                let score = 0;
                for (let i = 0; i < 7; i+=2) {
                    if (i+1 < 8 && last8[i] === last8[i+1]) score++;
                }
                if (score >= 3) {
                    return { prediction: last === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.7 + (score * 0.05), reason: `2-2 dài ${score}/4` };
                }
                break;
            case 'break':
                if (last6.length === 6 && last6[0] === last6[1] && last6[1] !== last6[2] &&
                    last6[2] === last6[3] && last6[3] !== last6[4] && last6[4] !== last6[5]) {
                    return { prediction: last6[4], confidence: 0.85, reason: 'Bẻ cầu 2-2' };
                }
                break;
        }
        return null;
    }

    runSubModelStreak(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        const other = last === 'Tài' ? 'Xỉu' : 'Tài';
        
        let streak = 1;
        for (let i = results.length - 2; i >= 0; i--) {
            if (results[i] === last) streak++;
            else break;
        }
        
        switch (model.logic) {
            case 'short':
                if (streak >= 2 && streak <= 3) return { prediction: last, confidence: 0.7 + (streak * 0.05), reason: `Bệt ngắn ${streak}` };
            case 'medium':
                if (streak >= 4 && streak <= 5) return { prediction: last, confidence: 0.75 + ((streak - 4) * 0.05), reason: `Bệt trung ${streak}` };
            case 'long':
                if (streak >= 6) return { prediction: last, confidence: 0.8 + (Math.min(streak, 10) * 0.01), reason: `Bệt dài ${streak}` };
            case 'break':
                if (streak >= 4) return { prediction: other, confidence: 0.6 + (streak * 0.03), reason: `Bệt ${streak}, sắp gãy` };
            case 'super':
                if (streak >= 8) return { prediction: last, confidence: 0.9, reason: `Siêu bệt ${streak}` };
        }
        return null;
    }

    runSubModel33(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        const last9 = results.slice(-9);
        
        switch (model.logic) {
            case 'pure':
                if (last9.length === 9 && last9[0] === last9[1] && last9[1] === last9[2] &&
                    last9[3] === last9[4] && last9[4] === last9[5] &&
                    last9[6] === last9[7] && last9[7] === last9[8] &&
                    last9[0] !== last9[3] && last9[3] !== last9[6]) {
                    return { prediction: last9[6] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.9, reason: '3-3 chuẩn' };
                }
                break;
            case 'short':
                if (results.length >= 6) {
                    const last6 = results.slice(-6);
                    if (last6[0] === last6[1] && last6[1] === last6[2] &&
                        last6[3] === last6[4] && last6[4] === last6[5]) {
                        return { prediction: last6[3] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.7, reason: '3-3 ngắn' };
                    }
                }
                break;
            case 'break':
                if (last9.length === 9 && last9[0] === last9[1] && last9[1] === last9[2] &&
                    last9[3] === last9[4] && last9[4] === last9[5] &&
                    last9[6] !== last9[7]) {
                    return { prediction: last9[6], confidence: 0.8, reason: 'Bẻ cầu 3-3' };
                }
                break;
        }
        return null;
    }

    runSubModel212(results, model) {
        if (results.length < model.minLength) return null;
        const last5 = results.slice(-5);
        
        switch (model.logic) {
            case 'pure':
                if (last5.length === 5 && last5[0] === last5[1] && last5[1] !== last5[2] &&
                    last5[2] !== last5[3] && last5[3] === last5[4] && last5[0] === last5[3]) {
                    return { prediction: last5[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.9, reason: '2-1-2 chuẩn' };
                }
                break;
            case 'variant':
                if (results.length >= 7) {
                    const last7 = results.slice(-7);
                    if (last7[0] === last7[1] && last7[1] !== last7[2] &&
                        last7[3] === last7[4] && last7[4] !== last7[5] &&
                        last7[0] === last7[3]) {
                        return { prediction: last7[5] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.8, reason: '2-1-2 biến thể' };
                    }
                }
                break;
        }
        return null;
    }

    runSubModel121(results, model) {
        if (results.length < model.minLength) return null;
        const last5 = results.slice(-5);
        
        switch (model.logic) {
            case 'pure':
                if (last5.length === 5 && last5[0] !== last5[1] && last5[1] === last5[2] &&
                    last5[2] !== last5[3] && last5[3] === last5[4] && last5[0] === last5[3]) {
                    return { prediction: last5[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.9, reason: '1-2-1 chuẩn' };
                }
                break;
            case 'variant':
                if (results.length >= 7) {
                    const last7 = results.slice(-7);
                    if (last7[0] !== last7[1] && last7[1] === last7[2] &&
                        last7[3] !== last7[4] && last7[4] === last7[5] &&
                        last7[0] === last7[3]) {
                        return { prediction: last7[5] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.8, reason: '1-2-1 biến thể' };
                    }
                }
                break;
        }
        return null;
    }

    runSubModelBreak(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        const last4 = results.slice(-4);
        const last5 = results.slice(-5);
        
        switch (model.logic) {
            case 'break11':
                if (last4.length === 4 && last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] === last4[3]) {
                    return { prediction: last4[3], confidence: 0.85, reason: 'Bẻ cầu 1-1' };
                }
                break;
            case 'break22':
                if (last5.length === 5 && last5[0] === last5[1] && last5[1] !== last5[2] &&
                    last5[2] === last5[3] && last5[3] !== last5[4] && last5[0] === last5[4]) {
                    return { prediction: last5[4], confidence: 0.85, reason: 'Bẻ cầu 2-2' };
                }
                break;
            case 'breakStreak':
                const streak = this.getStreak(results.slice(0, -1));
                if (streak >= 3 && last !== results[results.length - 2]) {
                    return { prediction: last, confidence: 0.8, reason: `Bẻ bệt sau ${streak}` };
                }
                break;
            case '11to22':
                if (results.length >= 6) {
                    const last6 = results.slice(-6);
                    if (last6[0] !== last6[1] && last6[1] !== last6[2] &&
                        last6[2] === last6[3] && last6[3] !== last6[4] && last6[4] === last6[5]) {
                        return { prediction: last6[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.75, reason: '11 sang 22' };
                    }
                }
                break;
            case '22to11':
                if (results.length >= 6) {
                    const last6 = results.slice(-6);
                    if (last6[0] === last6[1] && last6[1] !== last6[2] &&
                        last6[2] !== last6[3] && last6[3] !== last6[4] && last6[4] !== last6[5]) {
                        return { prediction: last6[4] === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.75, reason: '22 sang 11' };
                    }
                }
                break;
        }
        return null;
    }

    runSubModelAdvanced(results, model) {
        if (results.length < model.minLength) return null;
        const last = results[results.length - 1];
        
        switch (model.logic) {
            case 'frequency':
                const freq = this.analyzeFrequency(results);
                if (freq.dominant && freq.ratio > 0.6) {
                    return { prediction: freq.dominant, confidence: 0.6 + (freq.ratio * 0.2), reason: `Tần suất ${freq.dominant} ${(freq.ratio*100).toFixed(0)}%` };
                }
                break;
            case 'cycle':
                const cycle = this.detectCycle(results);
                if (cycle.found) return { prediction: cycle.next, confidence: 0.7, reason: `Chu kỳ ${cycle.length}` };
                break;
            case 'symmetry':
                if (results.length >= 6) {
                    const last3 = results.slice(-3);
                    const prev3 = results.slice(-6, -3);
                    if (last3[0] === prev3[2] && last3[1] === prev3[1] && last3[2] === prev3[0]) {
                        return { prediction: last3[1], confidence: 0.75, reason: 'Cầu đối xứng' };
                    }
                }
                break;
            case 'fibonacci':
                const fibs = [1, 2, 3, 5];
                for (let fib of fibs) {
                    if (results.length >= fib * 2) {
                        const lastFib = results.slice(-fib);
                        const prevFib = results.slice(-fib*2, -fib);
                        if (JSON.stringify(lastFib) === JSON.stringify(prevFib)) {
                            return { prediction: lastFib[0], confidence: 0.7, reason: `Fibonacci ${fib}` };
                        }
                    }
                }
                break;
            case 'longTrend':
                if (results.length >= 15) {
                    const first = results.slice(0, 5);
                    const last5 = results.slice(-5);
                    const firstTai = first.filter(r => r === 'Tài').length;
                    const lastTai = last5.filter(r => r === 'Tài').length;
                    if (lastTai > firstTai + 2) return { prediction: 'Tài', confidence: 0.8, reason: 'Xu hướng Tài' };
                    if (lastTai < firstTai - 2) return { prediction: 'Xỉu', confidence: 0.8, reason: 'Xu hướng Xỉu' };
                }
                break;
            case 'super':
                const superAnalysis = this.superAnalysis(results);
                if (superAnalysis.confidence > 0.8) return superAnalysis;
                break;
        }
        return null;
    }

    // ==================== HELPER FUNCTIONS ====================
    isPerfectAlternating(results, length) {
        const last = results.slice(-length);
        for (let i = 0; i < last.length - 1; i++) {
            if (last[i] === last[i+1]) return false;
        }
        return true;
    }

    isAlternatingWithTolerance(results, tolerance) {
        const last = results.slice(-6);
        let errors = 0;
        for (let i = 0; i < last.length - 1; i++) {
            if (last[i] === last[i+1]) errors++;
        }
        return errors <= tolerance;
    }

    countAlternating(results) {
        let count = 0;
        for (let i = 0; i < results.length - 1; i++) {
            if (results[i] !== results[i+1]) count++;
        }
        return count;
    }

    getStreak(results) {
        if (results.length === 0) return 0;
        const last = results[results.length - 1];
        let streak = 1;
        for (let i = results.length - 2; i >= 0; i--) {
            if (results[i] === last) streak++;
            else break;
        }
        return streak;
    }

    analyzeFrequency(results) {
        const recent = results.slice(-20);
        const taiCount = recent.filter(r => r === 'Tài').length;
        const xiuCount = recent.length - taiCount;
        const ratio = Math.max(taiCount, xiuCount) / recent.length;
        const dominant = taiCount > xiuCount ? 'Tài' : 'Xỉu';
        return { dominant, ratio };
    }

    detectCycle(results) {
        for (let cycleLen of [2, 3, 4]) {
            if (results.length < cycleLen * 2) continue;
            const lastCycle = results.slice(-cycleLen);
            const prevCycle = results.slice(-cycleLen*2, -cycleLen);
            if (JSON.stringify(lastCycle) === JSON.stringify(prevCycle)) {
                return { found: true, length: cycleLen, next: lastCycle[0] };
            }
        }
        return { found: false };
    }

    superAnalysis(results) {
        const freq = this.analyzeFrequency(results);
        const last = results[results.length - 1];
        
        if (freq.ratio > 0.7) {
            const pred = freq.dominant === 'Tài' ? 'Xỉu' : 'Tài';
            return { prediction: pred, confidence: 0.85, reason: 'Siêu phân tích - cân bằng tần suất' };
        }
        
        const streak = this.getStreak(results);
        if (streak >= 5) {
            const pred = last === 'Tài' ? 'Xỉu' : 'Tài';
            return { prediction: pred, confidence: 0.8, reason: `Siêu phân tích - bệt ${streak}, dự đoán đảo` };
        }
        
        return { confidence: 0 };
    }

    // ==================== RUN MODELS ====================
    runSubModel(index, history) {
        if (history.length < 3) return null;
        const results = this.getResultArray(history);
        const model = this.subModels[`sub_model_${index}`];
        if (!model) return null;
        
        let result = null;
        const type = model.type;
        
        switch (type) {
            case '1-1': result = this.runSubModel11(results, model); break;
            case '2-2': result = this.runSubModel22(results, model); break;
            case 'bệt': result = this.runSubModelStreak(results, model); break;
            case '3-3': result = this.runSubModel33(results, model); break;
            case '2-1-2': result = this.runSubModel212(results, model); break;
            case '1-2-1': result = this.runSubModel121(results, model); break;
            case 'break': case 'transition': result = this.runSubModelBreak(results, model); break;
            default: result = this.runSubModelAdvanced(results, model);
        }
        
        if (result) result.model_name = model.name;
        return result;
    }

    runMiniModel(index, history) {
        if (history.length < 2) return null;
        const results = this.getResultArray(history);
        const miniModel = this.miniModels[`mini_model_${index}`];
        
        let prediction, confidence, reason;
        
        switch (miniModel.specialty) {
            case 'phat_hien_cau_dep': {
                const pattern = this.analyzeBasicPatterns(history);
                prediction = pattern.prediction;
                confidence = pattern.confidence * 0.9;
                reason = pattern.reason;
                break;
            }
            case 'du_doan_bien_dong': {
                const streak = this.getStreak(results);
                if (streak >= 3) {
                    prediction = results[results.length - 1];
                    confidence = 0.7;
                    reason = 'Biến động thấp, tiếp tục';
                } else {
                    prediction = results[results.length - 1] === 'Tài' ? 'Xỉu' : 'Tài';
                    confidence = 0.6;
                    reason = 'Biến động cao, đảo chiều';
                }
                break;
            }
            case 'nhan_dien_xu_huong_cuc_bo': {
                const last3 = results.slice(-3);
                if (last3[0] === last3[1] && last3[1] === last3[2]) {
                    prediction = last3[0];
                    confidence = 0.75;
                    reason = 'Xu hướng bệt ngắn';
                } else if (last3[0] !== last3[1] && last3[1] !== last3[2]) {
                    prediction = last3[2] === 'Tài' ? 'Xỉu' : 'Tài';
                    confidence = 0.7;
                    reason = 'Xu hướng 1-1';
                } else {
                    prediction = results[results.length - 1];
                    confidence = 0.5;
                    reason = 'Xu hướng không rõ';
                }
                break;
            }
            case 'tinh_toan_xac_suat_cao': {
                const taiCount = results.filter(r => r === 'Tài').length;
                const xiuCount = results.length - taiCount;
                if (taiCount > xiuCount * 1.5) {
                    prediction = 'Xỉu';
                    confidence = 0.7;
                    reason = 'Xác suất Tài cao, dự đoán Xỉu';
                } else if (xiuCount > taiCount * 1.5) {
                    prediction = 'Tài';
                    confidence = 0.7;
                    reason = 'Xác suất Xỉu cao, dự đoán Tài';
                } else {
                    prediction = results[results.length - 1];
                    confidence = 0.5;
                    reason = 'Xác suất cân bằng';
                }
                break;
            }
            default: {
                const random = Math.random();
                if (random < 0.5) {
                    prediction = results[results.length - 1];
                    confidence = 0.5;
                } else {
                    prediction = results[results.length - 1] === 'Tài' ? 'Xỉu' : 'Tài';
                    confidence = 0.5;
                }
                reason = `Mini ${index} (${miniModel.specialty})`;
            }
        }
        
        return { prediction, confidence: Math.min(confidence, 0.95), reason, model_name: `mini_${index}` };
    }

    analyzeBasicPatterns(history) {
        if (history.length < 3) {
            return { prediction: null, confidence: 0, reason: 'Không đủ dữ liệu' };
        }
        const results = this.getResultArray(history);
        const last = results[results.length - 1];
        
        let confidence = 0.5;
        let pred = last === 'Tài' ? 'Xỉu' : 'Tài';
        let reason = 'Mặc định đảo chiều';
        
        const streak = this.getStreak(results);
        if (streak >= 3) {
            pred = last;
            confidence = 0.6 + (streak * 0.05);
            reason = `Bệt ${streak} phiên`;
        }
        
        if (results.length >= 4) {
            const last4 = results.slice(-4);
            if (last4[0] !== last4[1] && last4[1] !== last4[2] && last4[2] !== last4[3]) {
                pred = last4[3] === 'Tài' ? 'Xỉu' : 'Tài';
                confidence = 0.75;
                reason = 'Cầu 1-1';
            }
        }
        
        return { prediction: pred, confidence: Math.min(confidence, 0.95), reason };
    }

    // ==================== ENSEMBLE ALL MODELS ====================
    ensembleModels(history) {
        const modelResults = {};
        
        // Main models
        modelResults.model1 = this.analyzeBasicPatterns(history);
        
        // Sub models
        for (let i = 1; i <= 42; i++) {
            const subResult = this.runSubModel(i, history);
            if (subResult && subResult.prediction) {
                modelResults[`sub_model_${i}`] = subResult;
            }
        }
        
        // Mini models
        for (let i = 1; i <= 21; i++) {
            const miniResult = this.runMiniModel(i, history);
            if (miniResult && miniResult.prediction) {
                modelResults[`mini_model_${i}`] = miniResult;
            }
        }
        
        // Weighted vote
        let taiWeight = 0;
        let xiuWeight = 0;
        let totalWeight = 0;
        let details = [];
        
        for (let [modelName, result] of Object.entries(modelResults)) {
            if (result && result.prediction && result.confidence > 0.3) {
                let weight = 1.0;
                if (modelName.startsWith('sub')) {
                    weight = this.subModelWeights[modelName] || 1.0;
                } else if (modelName.startsWith('mini')) {
                    weight = this.miniModelWeights[modelName] || 1.0;
                } else {
                    weight = this.modelWeights[modelName] || 1.0;
                }
                
                const weightedConfidence = weight * result.confidence;
                
                if (result.prediction === 'Tài') {
                    taiWeight += weightedConfidence;
                } else if (result.prediction === 'Xỉu') {
                    xiuWeight += weightedConfidence;
                }
                
                totalWeight += weightedConfidence;
                details.push({
                    model: result.model_name || modelName,
                    prediction: result.prediction,
                    confidence: result.confidence,
                    weight: weight,
                    reason: result.reason
                });
            }
        }
        
        details.sort((a, b) => b.confidence - a.confidence);
        
        let finalPrediction, finalConfidence, finalReason, finalPattern, finalType;
        
        if (totalWeight > 0) {
            const taiRatio = taiWeight / totalWeight;
            const xiuRatio = xiuWeight / totalWeight;
            
            if (taiRatio > 0.55) {
                finalPrediction = 'Tài';
                finalConfidence = taiRatio;
                finalReason = `${details.length} models đồng thuận Tài (${(taiRatio*100).toFixed(1)}%)`;
            } else if (xiuRatio > 0.55) {
                finalPrediction = 'Xỉu';
                finalConfidence = xiuRatio;
                finalReason = `${details.length} models đồng thuận Xỉu (${(xiuRatio*100).toFixed(1)}%)`;
            } else {
                const bestModel = details[0];
                if (bestModel) {
                    finalPrediction = bestModel.prediction;
                    finalConfidence = 0.5 + bestModel.confidence * 0.2;
                    finalReason = `Dùng model ${bestModel.model}: ${bestModel.reason}`;
                } else {
                    const lastResult = history.length > 0 ? history[history.length - 1].Ket_qua : 'Tài';
                    finalPrediction = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
                    finalConfidence = 0.5;
                    finalReason = 'Không có model đủ tin cậy';
                }
            }
        } else {
            const lastResult = history.length > 0 ? history[history.length - 1].Ket_qua : 'Tài';
            finalPrediction = lastResult === 'Tài' ? 'Xỉu' : 'Tài';
            finalConfidence = 0.5;
            finalReason = 'Không đủ dữ liệu';
        }
        
        if (details.length > 0) {
            finalType = details[0].model;
            finalPattern = history.length > 0 ? this.getResultArray(history.slice(-5)).join('') : '';
        } else {
            finalType = 'Không xác định';
            finalPattern = '';
        }
        
        return {
            prediction: finalPrediction,
            confidence: finalConfidence,
            reason: finalReason,
            pattern_type: finalType,
            pattern: finalPattern,
            details: details.slice(0, 5)
        };
    }

    updateModelWeights(actual, predicted, confidence) {
        const correct = (actual === predicted) ? 1 : 0;
        
        for (let modelName in this.modelWeights) {
            if (correct) {
                this.modelWeights[modelName] = Math.min(this.modelWeights[modelName] * 1.01, 2.0);
            } else {
                this.modelWeights[modelName] = Math.max(this.modelWeights[modelName] * 0.99, 0.5);
            }
        }
        
        for (let modelName in this.subModelWeights) {
            if (correct) {
                this.subModelWeights[modelName] = Math.min(this.subModelWeights[modelName] * 1.005, 1.5);
            } else {
                this.subModelWeights[modelName] = Math.max(this.subModelWeights[modelName] * 0.995, 0.7);
            }
        }
        
        for (let modelName in this.miniModelWeights) {
            if (correct) {
                this.miniModelWeights[modelName] = Math.min(this.miniModelWeights[modelName] * 1.003, 1.3);
            } else {
                this.miniModelWeights[modelName] = Math.max(this.miniModelWeights[modelName] * 0.997, 0.8);
            }
        }
        
        saveModelWeights();
    }
}

// ==================== INIT ANALYZER ====================
const analyzer = new TaiXiuAnalyzer();
const superAI = new SuperAI();
global.lastPredictions = {};

// ==================== WEBSOCKET ====================
const WEBSOCKET_URL = "wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfYXBpc3Vud2luMTIzIn0.hgrRbSV6vnBwJMg9ZFtbx3rRu9mX_hZMZ_m5gMNhkw0";
const WS_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Origin": "https://play.sun.win"
};
const RECONNECT_DELAY = 2500;
const PING_INTERVAL = 15000;

let ws = null;
let pingInterval = null;
let reconnectTimeout = null;

const initialMessages = [
    [
        1,
        "MiniGame",
        "GM_apivopnha",
        "WangLin",
        {
            "info": "{\"ipAddress\":\"14.249.227.107\",\"wsToken\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiI5ODE5YW5zc3MiLCJib3QiOjAsImlzTWVyY2hhbnQiOmZhbHNlLCJ2ZXJpZmllZEJhbmtBY2NvdW50IjpmYWxzZSwicGxheUV2ZW50TG9iYnkiOmZhbHNlLCJjdXN0b21lcklkIjozMjMyODExNTEsImFmZklkIjoic3VuLndpbiIsImJhbm5lZCI6ZmFsc2UsImJyYW5kIjoiZ2VtIiwidGltZXN0YW1wIjoxNzYzMDMyOTI4NzcwLCJsb2NrR2FtZXMiOltdLCJhbW91bnQiOjAsImxvY2tDaGF0IjpmYWxzZSwicGhvbmVWZXJpZmllZCI6ZmFsc2UsImlwQWRkcmVzcyI6IjE0LjI0OS4yMjcuMTA3IiwibXV0ZSI6ZmFsc2UsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnN3aW5zaG9wLm5ldC9pbWFnZXMvYXZhdGFyL2F2YXRhcl8wNS5wbmciLCJwbGF0Zm9ybUlkIjo0LCJ1c2VySWQiOiI4ODM4NTMzZS1kZTQzLTRiOGQtOTUwMy02MjFmNDA1MDUzNGUiLCJyZWdUaW1lIjoxNzYxNjMyMzAwNTc2LCJwaG9uZSI6IiIsImRlcG9zaXQiOmZhbHNlLCJ1c2VybmFtZSI6IkdNX2FwaXZvcG5oYSJ9.guH6ztJSPXUL1cU8QdMz8O1Sdy_SbxjSM-CDzWPTr-0\",\"locale\":\"vi\",\"userId\":\"8838533e-de43-4b8d-9503-621f4050534e\",\"username\":\"GM_apivopnha\",\"timestamp\":1763032928770,\"refreshToken\":\"e576b43a64e84f789548bfc7c4c8d1e5.7d4244a361e345908af95ee2e8ab2895\"}",
            "signature": "45EF4B318C883862C36E1B189A1DF5465EBB60CB602BA05FAD8FCBFCD6E0DA8CB3CE65333EDD79A2BB4ABFCE326ED5525C7D971D9DEDB5A17A72764287FFE6F62CBC2DF8A04CD8EFF8D0D5AE27046947ADE45E62E644111EFDE96A74FEC635A97861A425FF2B5732D74F41176703CA10CFEED67D0745FF15EAC1065E1C8BCBFA"
        }
    ],
    [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
    [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
];

function connectWebSocket() {
    if (ws) {
        ws.removeAllListeners();
        ws.close();
    }

    ws = new WebSocket(WEBSOCKET_URL, { headers: WS_HEADERS });

    ws.on('open', () => {
        console.log('[✅] WebSocket connected.');
        initialMessages.forEach((msg, i) => {
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(msg));
                }
            }, i * 600);
        });

        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            }
        }, PING_INTERVAL);
    });

    ws.on('pong', () => {});

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (!Array.isArray(data) || typeof data[1] !== 'object') return;
            const { cmd, sid, d1, d2, d3, gBB } = data[1];

            if (cmd === 1008 && sid) {
                currentSessionId = sid;
            }

            if (cmd === 1003 && gBB) {
                if (!d1 || !d2 || !d3) return;

                const total = d1 + d2 + d3;
                const result = (total > 10) ? "Tài" : "Xỉu";

                let predictionCorrect = false;
                if (lastPrediction && lastPrediction.ket_qua) {
                    predictionCorrect = (lastPrediction.ket_qua === result);
                    
                    stats.total++;
                    if (predictionCorrect) {
                        stats.correct++;
                        stats.consecutiveLosses = 0;
                    } else {
                        stats.wrong++;
                        stats.consecutiveLosses++;
                    }
                    
                    analyzer.updateModelWeights(result, lastPrediction.ket_qua, lastPrediction.do_tin_cay);
                }

                const historyEntry = {
                    phien: currentSessionId,
                    Xuc_xac_1: d1,
                    Xuc_xac_2: d2,
                    Xuc_xac_3: d3,
                    Tong: total,
                    Ket_qua: result,
                    du_doan: lastPrediction ? lastPrediction.ket_qua : null,
                    loai_cau: lastPrediction ? lastPrediction.loai_cau : null,
                    do_tin_cay: lastPrediction ? lastPrediction.do_tin_cay : null,
                    thoi_gian: new Date().toISOString()
                };
                saveHistory(historyEntry);

                const historyForAnalyzer = resultHistory.map(h => ({
                    score: h.Tong,
                    Ket_qua: h.Ket_qua,
                    Xuc_xac_1: h.Xuc_xac_1,
                    Xuc_xac_2: h.Xuc_xac_2,
                    Xuc_xac_3: h.Xuc_xac_3
                }));

                const ensembleResult = analyzer.ensembleModels(historyForAnalyzer);
                
                // Lưu predictions cho Super AI
                const predictions = {};
                for (let i = 1; i <= 42; i++) {
                    const subResult = analyzer.runSubModel(i, historyForAnalyzer);
                    if (subResult && subResult.prediction) {
                        predictions[`sub_model_${i}`] = subResult;
                    }
                }
                global.lastPredictions = predictions;
                
                let finalPrediction = ensembleResult.prediction;
                let finalConfidence = ensembleResult.confidence;
                let finalType = ensembleResult.pattern_type;
                let finalPattern = ensembleResult.pattern;
                let finalReason = ensembleResult.reason;
                
                // Super AI: Early Warning
                const results = historyForAnalyzer.map(h => h.Ket_qua);
                const earlyWarning = superAI.detectBreakPattern(results);
                if (earlyWarning && earlyWarning.warning && earlyWarning.confidence > 0.7) {
                    const opposite = finalPrediction === 'Tài' ? 'Xỉu' : 'Tài';
                    finalPrediction = opposite;
                    finalConfidence = Math.min(finalConfidence * 1.2, 0.95);
                    finalReason += ` ⚠️ ${earlyWarning.reason}`;
                }
                
                // Super AI: Long-term trend
                const longTermTrend = superAI.getLongTermTrend(historyForAnalyzer);
                if (longTermTrend.strength > 0.3) {
                    const trendPred = longTermTrend.trend.includes('Tài') ? 'Tài' : 'Xỉu';
                    if (finalPrediction !== trendPred && finalConfidence < 0.6) {
                        finalPrediction = trendPred;
                        finalConfidence = Math.min(finalConfidence + 0.1, 0.9);
                        finalReason += ` 📈 ${longTermTrend.trend}`;
                    }
                }
                
                // Chống đảo
                if (stats.consecutiveLosses >= 3) {
                    finalPrediction = finalPrediction === 'Tài' ? 'Xỉu' : 'Tài';
                    finalConfidence = 0.4;
                    finalType = 'CHỐNG ĐẢO (SAU ' + stats.consecutiveLosses + ' LẦN THUA)';
                    finalPattern = '';
                    finalReason = 'Chống đảo do thua liên tiếp';
                }

                lastPrediction = {
                    phien: currentSessionId ? parseInt(currentSessionId) + 1 : null,
                    ket_qua: finalPrediction,
                    loai_cau: finalType,
                    mau_cau: finalPattern,
                    do_tin_cay: (finalConfidence * 100).toFixed(0) + '%'
                };

                const trangThai = finalType.includes('CHỐNG') ? 'Chống đảo' :
                                 (finalType.includes('THEO') ? 'Đang theo kết quả' : 'Đang theo cầu');

                const tiLe = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) + '%' : '0%';

                apiResponseData = {
                    "Phien": currentSessionId,
                    "Xuc_xac_1": d1,
                    "Xuc_xac_2": d2,
                    "Xuc_xac_3": d3,
                    "Tong": total,
                    "Ket_qua": result,
                    "Phien_hien_tai": currentSessionId ? parseInt(currentSessionId) + 1 : null,
                    "Du_doan": finalPrediction,
                    "Loai_cau": finalType,
                    "Mau_cau_phat_hien": finalPattern,
                    "Do_tin_cay": (finalConfidence * 100).toFixed(0) + '%',
                    "Trang_thai": trangThai,
                    "Ket_qua_du_doan": predictionCorrect ? '✅' : (stats.total > 0 ? '❌' : ''),
                    "Thong_ke": {
                        "tong": stats.total,
                        "dung": stats.correct,
                        "sai": stats.wrong,
                        "ti_le": tiLe
                    },
                    "id": "@tranhoang2286"
                };

                console.log('\n' + '🟦'.repeat(20));
                console.log(`🎲 Phiên ${apiResponseData.Phien} | KQ: ${result}`);
                console.log(`📊 Lịch sử: ${results.slice(-12).join(' ')}`);
                console.log(`🔍 Phát hiện: ${finalType} | Mẫu: ${finalPattern || '...'}`);
                console.log(`🤖 Dự đoán phiên ${apiResponseData.Phien_hien_tai}: ${finalPrediction} (${(finalConfidence * 100).toFixed(0)}%)`);
                console.log(`📈 Thống kê: Đúng ${stats.correct}/${stats.total} (${tiLe}) ${apiResponseData.Ket_qua_du_doan}`);
                if (stats.consecutiveLosses > 0) console.log(`⚠️ Thua liên tiếp: ${stats.consecutiveLosses}`);
                console.log('🟦'.repeat(20) + '\n');

                lastResult = result;
                currentSessionId = null;
            }
        } catch (e) {
            console.error('[❌] Lỗi xử lý message:', e.message);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`[🔌] WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
        clearInterval(pingInterval);
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectWebSocket, RECONNECT_DELAY);
    });

    ws.on('error', (err) => {
        console.error('[❌] WebSocket error:', err.message);
        ws.close();
    });
}

// ==================== EXPRESS API ====================
app.get('/api/ditmemaysun', (req, res) => {
    res.json(apiResponseData);
});

app.get('/api/his', (req, res) => {
    const recent = resultHistory.slice(-20).reverse();
    res.json({
        success: true,
        total: resultHistory.length,
        data: recent,
        stats: {
            tong: stats.total,
            dung: stats.correct,
            sai: stats.wrong,
            ti_le: stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) + '%' : '0%',
            consecutive_losses: stats.consecutiveLosses
        }
    });
});

app.get('/api/models', (req, res) => {
    res.json({
        main_models: Object.keys(analyzer.modelWeights).length,
        sub_models: Object.keys(analyzer.subModels).length,
        mini_models: Object.keys(analyzer.miniModels).length,
        total: 21 + 42 + 21,
        weights: {
            main: analyzer.modelWeights,
            sub: analyzer.subModelWeights,
            mini: analyzer.miniModelWeights
        }
    });
});

app.get('/', (req, res) => {
    res.json(apiResponseData);
});

app.listen(PORT, () => {
    console.log(`[🌐] Server running at http://localhost:${PORT}`);
    console.log(`[🤖] 21 main + 42 sub + 21 mini = 84 models`);
    console.log(`[🧠] Super AI: Reinforcement Learning + Early Warning + Long-term Trend`);
    console.log(`[📁] History: ${HISTORY_FILE} | Patterns: ${PATTERNS_FILE} | Weights: ${MODEL_WEIGHTS_FILE}`);
});

// ==================== START ====================
connectWebSocket();
