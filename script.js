// ===== 設定と準備 =====
const TOTAL_STAMPS = 6; 

// 1. ユーザーIDの管理（ブラウザに保存して再利用）
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "U" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("userId", userId);
}

// 2. 現在のスタンプ進捗をローカルストレージから取得
let stamps = JSON.parse(localStorage.getItem("stamps")) || [];

// 3. URLからスタンプ番号を取得 (?stamp=1 など)
const urlParams = new URLSearchParams(window.location.search);
const newStamp = urlParams.get("stamp");

// ===== スタンプ取得処理 =====
// URLに新しいスタンプがあり、かつ、まだ持っていない場合のみ実行
if (newStamp && !stamps.includes(newStamp)) {
    // 手元のブラウザに保存
    stamps.push(newStamp);
    localStorage.setItem("stamps", JSON.stringify(stamps));
    alert(`スタンプ ${newStamp} をゲットしました！`);

    // サーバーへ送信（バックアップとログ用）
    fetch("https://suoit-github-oit.onrender.com/api/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userId: userId,
            stamp: newStamp 
        })
    })
    .then(res => res.json())
    .then(data => console.log("サーバー応答:", data))
    .catch(err => console.error("サーバー送信エラー:", err));
}

// ===== 画面表示の制御 =====

// スタンプボタン（台紙）の生成
const container = document.getElementById("stamp-container");
for (let i = 1; i <= TOTAL_STAMPS; i++) {
    const btn = document.createElement("button");
    btn.classList.add("stamp-btn");
    btn.textContent = i;
    btn.disabled = true; // 基本はクリック不可
    
    // 取得済みなら色を変える
    if (stamps.includes(String(i))) {
        btn.classList.add("active");
    }
    container.appendChild(btn);
}

// 景品ボタンの制御
const rewardBtn = document.getElementById("reward-btn");

function updateRewardButton() {
    if (stamps.length === TOTAL_STAMPS) {
        rewardBtn.disabled = false;
        rewardBtn.classList.add("enabled");
        
        // メッセージを表示
        if (!document.getElementById("complete-msg")) {
            const msg = document.createElement("p");
            msg.id = "complete-msg";
            msg.textContent = "🎉 全てのスタンプを集めました！景品を受け取りましょう！";
            msg.style.color = "#d9534f";
            msg.style.fontWeight = "bold";
            container.after(msg);
        }
    }
}

// 景品ボタンを押した時の処理
rewardBtn.addEventListener("click", () => {
    alert("おめでとうございます！店員さんにこの画面を見せて景品を受け取ってください🎁\nユーザーID: " + userId);
});

// 起動時にボタンの状態をチェック
updateRewardButton();
