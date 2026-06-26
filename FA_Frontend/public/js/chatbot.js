(function () {
  const webchat = document.getElementById("sparklebot-webchat");

  if (!webchat) {
    const challengeButtons = document.querySelectorAll("[data-training-challenge]");
    const selectedChallenge = document.querySelector("[data-selected-challenge]");
    const startButton = document.querySelector("[data-start-training]");
    const dashboard = document.querySelector("[data-training-dashboard]");
    const game = document.querySelector("[data-training-game]");
    const gameChallenge = document.querySelector("[data-game-challenge]");
    const backButton = document.querySelector("[data-training-back]");
    const redFlags = document.querySelectorAll("[data-red-flag]");
    const submitScore = document.querySelector("[data-submit-score]");
    const scoreMessage = document.querySelector("[data-training-score]");
    const resultsPanel = document.querySelector("[data-training-results]");
    const resultFound = document.querySelector("[data-result-found]");
    const resultPoints = document.querySelector("[data-result-points]");
    const resultHeading = document.querySelector("[data-result-heading]");
    const missedCount = document.querySelector("[data-missed-count]");
    const reviewItems = document.querySelectorAll("[data-review-item]");
    const missedFlagsPanel = document.querySelector(".missed-flags");
    const gameContent = document.querySelector(".training-game-content");

    function openChallenge(challenge) {
      gameChallenge.textContent = challenge;
      dashboard.classList.add("hidden");
      game.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    challengeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        challengeButtons.forEach((card) => card.classList.toggle("active", card === button));
        selectedChallenge.textContent = button.dataset.trainingChallenge;
        openChallenge(button.dataset.trainingChallenge);
      });
    });

    if (startButton) {
      startButton.addEventListener("click", () => {
        openChallenge(selectedChallenge.textContent);
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        game.classList.add("hidden");
        dashboard.classList.remove("hidden");
      });
    }

    redFlags.forEach((flag) => {
      flag.addEventListener("click", () => flag.classList.toggle("selected"));
    });

    if (submitScore) {
      submitScore.addEventListener("click", () => {
        if (submitScore.dataset.completed === "true") {
          resultsPanel.classList.add("hidden");
          scoreMessage.classList.add("hidden");
          gameContent.classList.remove("score-view");
          redFlags.forEach((flag) => flag.classList.remove("selected"));
          submitScore.dataset.completed = "false";
          submitScore.innerHTML = "I’m done! Check my score <span aria-hidden=\"true\">&rarr;</span>";
          game.classList.add("hidden");
          dashboard.classList.remove("hidden");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const found = document.querySelectorAll("[data-red-flag].selected").length;
        const total = redFlags.length;
        const points = Math.round((found / total) * 100);
        scoreMessage.textContent = found === total
          ? `Excellent spotting! You found all ${total} red flags.`
          : `You found ${found} of ${total} red flags. Review the message and try again.`;
        scoreMessage.classList.remove("hidden");
        resultFound.textContent = found;
        resultPoints.textContent = points;
        missedCount.textContent = total - found;
        resultHeading.textContent = found === total
          ? "Excellent work! You found every red flag."
          : "This one fooled most people too.";
        reviewItems.forEach((item, index) => {
          item.classList.toggle("hidden", redFlags[index].classList.contains("selected"));
        });
        missedFlagsPanel.classList.toggle("hidden", found === total);
        resultsPanel.classList.remove("hidden");
        gameContent.classList.add("score-view");
        submitScore.dataset.completed = "true";
        submitScore.innerHTML = "Next challenge <span aria-hidden=\"true\">&rarr;</span>";
      });
    }

    return;
  }

  function showError(message) {
    webchat.innerHTML = "";

    const error = document.createElement("div");
    error.className = "webchat-loading";
    error.innerHTML = `<p>${message}</p>`;
    webchat.appendChild(error);
  }

  function showReadyMessage() {
    webchat.innerHTML = "";

    const ready = document.createElement("div");
    ready.className = "webchat-loading";

    const message = document.createElement("p");
    message.textContent = "RedFlag is ready.";

    const note = document.createElement("p");
    note.className = "form-note";
    note.textContent = "Use the chat button on this page to start a conversation.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-primary";
    button.textContent = "Open RedFlag";
    button.addEventListener("click", () => {
      if (window.botpress && typeof window.botpress.open === "function") {
        window.botpress.open();
      }
    });

    ready.appendChild(message);
    ready.appendChild(note);
    ready.appendChild(button);
    webchat.appendChild(ready);
  }

  function waitForBotpress() {
    return new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        if (window.botpress && typeof window.botpress.open === "function") {
          clearInterval(timer);
          resolve();
          return;
        }

        if (Date.now() - startedAt > 15000) {
          clearInterval(timer);
          reject(new Error("Botpress did not load in time."));
        }
      }, 250);
    });
  }

  async function initBotpress() {
    try {
      await waitForBotpress();
      showReadyMessage();
    } catch (error) {
      showError("RedFlag is unavailable right now.");
    }
  }

  initBotpress();
})();
