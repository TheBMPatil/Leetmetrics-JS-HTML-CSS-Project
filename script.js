document.addEventListener("DOMContentLoaded", function () {
  //search button
  //   console.log("Doc loaded")
  const searchButton = document.getElementById("search-btn");
  //userinput
  const usernameInput = document.getElementById("username-input");
  //stats
  const statsContainer = document.querySelector(".stats");
  //Circle
  const hardProgressCircle = document.querySelector(".hard");
  const mediumProgressCircle = document.querySelector(".medium");
  const easyProgressCircle = document.querySelector(".easy");
  //Lables
  const hardLabel = document.querySelector(".hard-label");
  const mediumLabel = document.querySelector(".medium-label");
  const easyLabel = document.querySelector(".easy-label");
  //
  const cardsStatContainerr = document.querySelector(".stats-cards");
  //
  function validateUserName(userName) {
    if (userName.trim() == "") {
      alert("Username should not be emppty..!");
      return false;
    }
    const regex = /^[a-zA-Z0-9_]{1,15}$/;
    const isMatching = regex.test(userName);
    if (!isMatching) {
      alert("Invalid Username");
    }
    return isMatching;
  }

  searchButton.addEventListener("click", function () {
    const userName = usernameInput.value;
    console.log("User name : " + userName);
    if (validateUserName(userName)) {
      fetchUserDetails(userName);
    }
  });

  async function fetchUserDetails(userName) {
    try {
      statsContainer.style.setProperty("display", "none");
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;
      const targetUrl = `https://leetcode.com/graphql`;
      const proxyUrl = `http://cors-anywhere.herokuapp.com/`;
      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");
      const graphql = JSON.stringify({
        query:
          "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
        variables: { username: `${userName}` },
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow",
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);
      if (!response.ok) {
        throw new Error("Unable to fetch user details");
      }
      const parsedData = await response.json();
      console.log(parsedData);
      statsContainer.style.setProperty("display", "flex");
      displayUserData(parsedData);
    } catch (error) {
      statsContainer.innerHTML = `<h3>No data Found</h3>`;
      console.error(error);
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgressCircles(solved, total, label, circle) {
    const progressdegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressdegree}%`);
    label.textContent = `${solved}/${total}`;
  }
  function displayUserData(parsedData) {
    const totalQues = parsedData.data.allQuestionsCount[0].count;
    const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
    const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
    const totalHardQues = parsedData.data.allQuestionsCount[3].count;

    const solvedTotalQues =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedTotalEasyQues =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedTotalMediumQues =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedTotalHardQues =
      parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgressCircles(
      solvedTotalEasyQues,
      totalEasyQues,
      easyLabel,
      easyProgressCircle
    );
    updateProgressCircles(
      solvedTotalMediumQues,
      totalMediumQues,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgressCircles(
      solvedTotalHardQues,
      totalHardQues,
      hardLabel,
      hardProgressCircle
    );

    const cardsData = [
      {
        label: "Overall Submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: "Overall Easy Submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: "Overall Medium Submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: "Overall Hard Submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];
    // console.log("Card data : ", cardData);
    cardsStatContainerr.innerHTML = cardsData
      .map(
        (data) => `
             <div class="card">
             <h4>${data.label}</h4>
             <p>${data.value}</p>             
             </div>`
      )
      .join("");
  }
});
