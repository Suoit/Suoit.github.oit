// ===== スタンプ設定 =====
const TOTAL_STAMPS = 6; // スタンプ数（店舗数に合わせて変更）

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
}

// スタンプ表示を更新
const container = document.getElementById("stamp-container");
for (let i = 1; i <= TOTAL_STAMPS; i++) {
  const stamp = document.createElement("div");
  stamp.classList.add("stamp");
  stamp.textContent = i;
  if (stamps.includes(String(i))) stamp.classList.add("active");
  container.appendChild(stamp);
}

// 全スタンプ獲得チェック
if (stamps.length === TOTAL_STAMPS) {
  const msg = document.createElement("p");
  msg.textContent = "🎉 全てのスタンプを集めました！景品を受け取りましょう！";
  container.after(msg);
}
