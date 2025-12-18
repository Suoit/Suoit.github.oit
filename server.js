const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // フロントとバックの通信を許可する設定
const fs = require('fs'); // ファイル保存用

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = './stamps_data.json';

// スタンプ取得を受け取るエンドポイント
app.post('/api/stamp', (req, res) => {
    const { userId, stamp } = req.body;
    console.log(`受信: ユーザー ${userId}, スタンプ ${stamp}`);

    try {
        let db = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            db = JSON.parse(fileContent || '[]');
        }

        // ★ 重複チェック：同じuserIdが同じstampを既に持っているか確認
        const isDuplicate = db.some(item => item.userId === userId && item.stamp === stamp);

        if (isDuplicate) {
            console.log(`重複のため保存をスキップ: ユーザー ${userId}, スタンプ ${stamp}`);
            return res.json({ message: "既に取得済みです", status: "skipped" });
        }

        // 重複がなければ追加
        db.push({ 
            userId, 
            stamp, 
            time: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) 
        });
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
        console.log("新規スタンプを保存しました！");
        res.json({ message: "サーバーに保存完了！", status: "success" });

    } catch (err) {
        console.error("保存エラー:", err);
        res.status(500).json({ error: "保存失敗" });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
