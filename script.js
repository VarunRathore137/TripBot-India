// ======================================================
// TripBot - Unified Frontend Script
// Handles:
// 1️⃣ Hero text animation (homepage)
// 2️⃣ Generate Itinerary (plantrip.html)
// ======================================================

// ---- 1️⃣ Simple glow animation for hero section ----
document.addEventListener("DOMContentLoaded", () => {
    const heroText = document.querySelector(".hero-content h2");
    if (heroText) {
      heroText.style.opacity = "0";
      setTimeout(() => {
        heroText.style.transition = "opacity 1s ease";
        heroText.style.opacity = "1";
      }, 300);
    }
  
    // ---- 2️⃣ Detect if we are on plantrip.html ----
    if (window.location.pathname.includes("plantrip.html")) {
      initTripPlanner();
    }
  });
  
  // ======================================================
  // ---- 3️⃣ PLAN TRIP PAGE LOGIC ----
  // ======================================================
  function initTripPlanner() {
    const btn = document.querySelector(".generate-btn");
    const output = document.getElementById("aiOutput");
  
    if (!btn || !output) return;
  
    // Your backend endpoint (replace with your deployed URL if needed)
    const API_URL = "http://localhost:5000/api/generate-itinerary";
    // Example for deployed version:
    // const API_URL = "https://tripbot-backend.vercel.app/api/generate-itinerary";
  
    btn.addEventListener("click", async () => {
      // Collect user inputs
      const payload = {
        destination: document.getElementById("destination").value.trim(),
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        interests: document.getElementById("interests").value.trim(),
        budget: document.getElementById("budget").value
      };
  
      // Basic validation
      if (!payload.destination) {
        output.innerHTML = `<p style="color:#ff6b6b;">⚠️ Please enter a destination first.</p>`;
        return;
      }
  
      // Loading state
      btn.disabled = true;
      btn.textContent = "Generating...";
      output.innerHTML = `
        <div style="text-align:center;padding:1rem;">
          <p>🧠 Thinking... Generating your AI itinerary...</p>
          <div class="loader"></div>
        </div>
      `;
  
      try {
        // API call to backend
        const resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
  
        const data = await resp.json();
        renderItinerary(data, output);
      } catch (err) {
        console.error("Error generating itinerary:", err);
        output.innerHTML = `<p style="color:#ff6b6b;">❌ Failed to generate itinerary. Check your server or API key.</p>`;
      } finally {
        btn.disabled = false;
        btn.textContent = "✨ Generate Itinerary";
      }
    });
  }
  
  // ======================================================
  // ---- 4️⃣ Render the returned itinerary nicely ----
  // ======================================================
  function renderItinerary(plan, container) {
    if (!plan || !plan.days) {
      container.innerHTML = `<p>⚠️ No valid itinerary returned.</p>`;
      return;
    }
  
    const { destination, summary, days, estimatedCost } = plan;
  
    let html = `
      <h3>${destination || "Your Trip"}</h3>
      <p>${summary || "Here's your AI-crafted travel plan."}</p>
    `;
  
    days.forEach(day => {
      html += `
        <div class="day-block" style="margin-bottom:1.2rem;">
          <h4 style="color:var(--accent);">Day ${day.day}: ${day.title}</h4>
          <ul style="margin-top:0.5rem;">
            ${day.activities?.map(a => `<li>${a}</li>`).join("") || "<li>No activities listed</li>"}
          </ul>
        </div>
      `;
    });
  
    html += `<p><strong>💰 Estimated Cost:</strong> ${estimatedCost || "N/A"}</p>`;
  
    container.innerHTML = html;
  }
  
  // ======================================================
  // ---- 5️⃣ Optional Loader Animation ----
  // ======================================================
  const style = document.createElement("style");
  style.textContent = `
  .loader {
    border: 3px solid rgba(255,255,255,0.1);
    border-top: 3px solid var(--accent);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    margin: 10px auto;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;
  document.head.appendChild(style);
  