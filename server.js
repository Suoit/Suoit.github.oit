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
    
    // スタンプごとの回数を集計
    const stats = {};
    db.forEach(item => {
        const key = item.stamp; // スタンプID (例: "1")
        stats[key] = (stats[key] || 0) + 1;
    });

    // 見やすいHTMLで返す
    let html = `
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; max-width: 400px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
                    th { background: #eee; }
                </style>
            </head>
            <body>
                <h1>📊 スタンプ利用状況</h1>
                <table>
                    <tr><th>スタンプ番号</th><th>取得人数</th></tr>
                    ${Object.keys(stats).sort().map(key => 
                        `<tr><td>No. ${key}</td><td>${stats[key]} 人</td></tr>`
                    ).join('')}
                </table>
                <p>総ログ数: ${db.length} 件</p>
                <a href="/api/raw-data">生データを見る(JSON)</a>
            </body>
        </html>
    `;
    res.send(html);
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
