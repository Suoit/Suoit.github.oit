const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = './stamps_data.json';

// ヘルパー関数: データを読み込む
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent || '[]');
    }
    return [];
}

// 1. スタンプ保存用 (既存機能 + 集計ログ)
app.post('/api/stamp', (req, res) => {
    const { userId, stamp } = req.body;
    console.log(`受信: ユーザー ${userId}, スタンプ ${stamp}`);

    try {
        let db = loadData();

        // 重複チェック
        const isDuplicate = db.some(item => item.userId === userId && item.stamp === stamp);

        if (isDuplicate) {
            return res.json({ message: "既に取得済みです", status: "skipped" });
        }

        // データを追加
        db.push({ 
            userId, 
            stamp, 
            time: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) 
        });
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

        // ★追加機能：そのスタンプが合計何回押されたか数える
        const totalCount = db.filter(item => item.stamp === stamp).length;
        console.log(`📊 スタンプ【${stamp}】は現在 ${totalCount} 人に読み込まれました！`);

        res.json({ 
            message: "サーバーに保存完了！", 
            status: "success",
            currentCount: totalCount // フロント側にも回数を返す
        });

    } catch (err) {
        console.error("保存エラー:", err);
        res.status(500).json({ error: "保存失敗" });
    }
});

// ★追加機能：集計結果を見るためのページ
// https://...onrender.com/stats にアクセスすると見れます
app.get('/stats', (req, res) => {
    const db = loadData();
    
    // 1. 集計用HTML作成
    const stats = {};
    db.forEach(item => { stats[item.stamp] = (stats[item.stamp] || 0) + 1; });
    const tableStats = Object.keys(stats).sort().map(key => 
        `<tr><td>No. ${key}</td><td>${stats[key]} 人</td></tr>`
    ).join('');

    // 2. 履歴用HTML作成
    const tableHistory = [...db].reverse().map(item => `
        <tr>
            <td class="time">${item.time || '不明'}</td>
            <td><strong>No. ${item.stamp}</strong></td>
            <td style="font-family:monospace; font-size:0.8em;">${item.userId}</td>
        </tr>
    `).join('');

    // 3. HTMLファイルを読み込んで置換する
    try {
        let html = fs.readFileSync('./stats.html', 'utf8');
        html = html.replace('{{TABLE_STATS}}', tableStats);
        html = html.replace('{{TABLE_HISTORY}}', tableHistory);
        html = html.replace('{{TOTAL_COUNT}}', db.length);
        res.send(html);
    } catch (err) {
        res.status(500).send("HTMLの読み込みに失敗しました");
    }
});

// ★追加機能：生データ確認用 (JSON)
app.get('/api/raw-data', (req, res) => {
    const db = loadData();
    res.json(db);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ★追加機能：データを初期化する (管理者用)
// https://...onrender.com/reset-data にアクセスすると削除されます
app.get('/reset-data', (req, res) => {
    try {
        const emptyData = [];
        fs.writeFileSync(DATA_FILE, JSON.stringify(emptyData, null, 2));
        console.log("⚠️ データを初期化しました");
        res.send('<h1>✅ データの初期化が完了しました</h1><a href="/stats">統計に戻る</a>');
    } catch (err) {
        res.status(500).send("初期化失敗: " + err);
    }
});

