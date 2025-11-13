document.getElementById('checkBtn').addEventListener('click', async () => {
  const pubKey = document.getElementById('addressInput').value.trim();
  const resultDiv = document.getElementById('result');
  const network = document.getElementById('networkSelect').value; // <-- define network here

  resultDiv.style.display = 'block';

  if (!pubKey) {
    resultDiv.innerHTML = `<p style="color:#ff6666;">⚠️ Please enter a Stellar public key</p>`;
    return;
  }

  resultDiv.innerHTML = `<p style="color:#00ffff;">⏳ Checking balance...</p>`;

  try {
    // Fetch from backend
    const res = await fetch(`http://localhost:5001/balance/${pubKey}?network=${encodeURIComponent(network)}`);

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Backend did not return JSON. Check backend route and port.");
    }

    const data = await res.json();

    if (!res.ok) {
      resultDiv.innerHTML = `<p style="color:#ff6666;">❌ ${data.error || "Unknown error"}</p>`;
      return;
    }

    const list = data.balances
      .map(b => `<li><strong>${b.asset}</strong>: ${b.balance}</li>`)
      .join('');

    resultDiv.innerHTML = `
      <div class="card glass">
        <h3>🪐 Account: ${data.account_id.slice(0, 10)}...</h3>
        <ul>${list}</ul>
        <small>Sequence: ${data.sequence}</small>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:#ff6666;">⚡ Backend error: ${error.message}</p>`;
    console.error(error);
  }
});
