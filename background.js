// background.js file runs in background

// Listener that sends message to the contentScript file when url
// of the current tab includes twitter.com
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url.includes("twitter.com")) {
    chrome.tabs.sendMessage(tabId, { message: "twitter.com detected" });
  }
});

// listener that recieves message from contentScript.js and sending the fetched data back
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // getting the tweet
  let tweet;
  if (request.data) {
    tweet = request.data;
  }

  let prompt = `Give me a engaging tweet reply without using hashtags and enumeration points. Under the word limit of 280 letters for the following tweet: ${tweet}`;

  // replace `null` with your OpenAI API key. grab it here: https://beta.openai.com/account/api-keys
  const API_KEY = null;

  // sending response in case API key is not there
  if (API_KEY === null) {
    sendResponse("No API key found");
    return;
  }

  // function that calls open ai
  fetch("https://api.openai.com/v1/completions", {
    body: JSON.stringify({
      model: "text-davinci-002",
      prompt: prompt,
      temperature: 0.8,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    method: "POST",
  })
    .then((response) => response.json())
    .then((response) => sendResponse(response.choices[0].text)) // sending the response back to contentScript.js
    .catch();
  return true;
});
