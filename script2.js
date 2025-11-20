const TOTAL_STAMPS = 6;

// URLからstamp番号を取得
const urlParams = new URLSearchParams(window.location.search);
const newStamp = urlParams.get("stamp");

// ローカルストレージから進捗を取得
let stamps = JSON.parse(localStorage.getItem("stamps")) || [];

// 新しいスタンプがある場合は保存
if (newStamp && !stamps.includes(newStamp)) {
  stamps.push(newStamp);
  localStorage.setItem("stamps", JSON.stringify(stamps));
  alert(`スタンプ${newStamp}をゲットしました！`);
fetch("http://localhost:3000/api/stamp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stamp: newStamp })
  })
  .then(res => res.json())
  .then(data => console.log("サーバー応答:", data))
  .catch(err => console.error("送信エラー:", err));
}

// スタンプボタンの生成
const container = document.getElementById("stamp-container");
for (let i = 1; i <= TOTAL_STAMPS; i++) {
  const btn = document.createElement("button");
  btn.classList.add("stamp-btn");
  btn.textContent = i;
  btn.disabled = true; // クリック不可
  if (stamps.includes(String(i))) btn.classList.add("active");
  container.appendChild(btn);
}

// 景品ボタン
const rewardBtn = document.getElementById("reward-btn");

function checkAllStamps() {
  if (stamps.length === TOTAL_STAMPS) {
    rewardBtn.disabled = false;
    rewardBtn.classList.add("enabled");
  }
}

rewardBtn.addEventListener("click", () => {
  if (stamps.length === TOTAL_STAMPS) {
    alert("🎉 全てのスタンプを集めました！景品を受け取りましょう！");
    // ここに景品応募フォームへの遷移などを追加可能
  }
});

// 初回チェック
checkAllStamps();
