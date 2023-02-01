// contentScript.js file is responsible for accessing and manipulating DOM on the page.

(() => {
  chrome.runtime.onMessage.addListener(function (request) {
    // receives the message sent from background.js.
    // then creates a div that contains the input and result elements.
    if (request.message === "twitter.com detected") {
      // we create a wrapper div
      const container = document.createElement("div");
      container.style.width = "300px";
      container.setAttribute("id", "contentWrapper");
      // creating an input and appending it to the container
      const input = document.createElement("input");
      container.appendChild(input);

      let inputTweet;

      // interval that runs every 1.5s that gets the footer section once it is rendered.
      const interval = setInterval(() => {
        let footer = document.querySelector("[aria-label='Footer']");
        // we style and display the input after the footer has been successfully loaded.
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Drag text here");
        input.style.width = "inherit";
        input.style.height = "auto";
        input.style.padding = "12px";
        input.style.color = "white";
        input.style.backgroundColor = "#1A8CD850";
        input.style.border = "2px solid #1A8CD8";
        input.style.borderRadius = "12px";

        // we check if the container has not been added and then adds the container.
        // this if check helps us to not add container element on every interval function run.
        if (!document.getElementById("contentWrapper")) {
          footer.parentNode.insertAdjacentElement("afterend", container);
        }

        // listener that gets data that was dragged on.
        input.addEventListener("drop", (event) => {
          event.preventDefault();
          input.value = event.dataTransfer.getData("text");
          inputTweet = input.value;
          // we create a result element and assign few styling and attributes to it.
          const result = document.createElement("p");
          result.setAttribute("id", "resultPara");
          result.style.cursor = "pointer";
          result.style.color = "white";
          result.style.fontFamily = "monospace";
          result.style.width = "inherit";
          result.style.padding = "12px";
          result.style.backgroundColor = "#1A8CD8";
          result.style.borderRadius = "12px";
          // on every drop the innerText is set to empty so that the previous
          // results does not show up.
          result.innerText = "";

          // function that is responsible for copying the result
          function copyTextToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }

          // we remove the result element if there are more than one.
          if (container.childElementCount > 1) {
            container.removeChild(document.getElementById("resultPara"));
          }

          // getting the response back from background.js
          chrome.runtime.sendMessage({ data: inputTweet }, function (response) {
            if (response) {
              // assigning the response after replacing unnecessary space to result and then appending.
              result.innerText = `${response.replace(/\n\n/g, "")}`;
              container.appendChild(result);
            } else {
              alert(
                "No response from OpenAI. Please make sure you have you have your OpenAI key in `background.js` or re drag the tweet. If the error still persists, refresh the page and try again. For any assistance, feel free to reach out to me at @ashwincodes on Twitter."
              );
            }
          });

          // listening for click event on the result element that passes the result value and runs
          // copyTextToClipboard fn.
          result.addEventListener("click", () => {
            copyTextToClipboard(result.innerText);
            // little element that displays "Copied!" text for 1.5s
            const copied = document.createElement("p");
            copied.innerText = "Copied!";
            copied.style.color = "#1A8CD8";
            container.appendChild(copied);
            setTimeout(() => {
              copied.innerText = "";
            }, 1500);
          });
        });
        if (footer) {
          clearInterval(interval);
        }
      }, 1000);

      // interval responsible for making each tweet draggable while grabbing the tweet data every 2s(in case new tweet appears).
      setInterval(() => {
        let tweetText = document.querySelectorAll("[data-testid='tweetText']");
        tweetText.forEach((element) => {
          element.setAttribute("draggable", "true");
          element.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text", event.target.innerText);
          });
        });
      }, 2000);
    }
  });
})();
