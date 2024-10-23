const protocol = "https";
const url = "open-api.thenational.academy/api/v0";
const apiKey = "025254dc-633e-452c-9b1e-f8de90ff6ea8";

const badges = {
  wordsmith: {
    imgPath: "assets/icons/wordsmith.png",
    title: "Wordsmith",
  },
  bookworm: {
    imgPath: "assets/icons/bookworm.png",
    title: "Curious bookworm",
  },
  "grammar-mechanic": {
    imgPath: "assets/icons/grammar-mechanic.png",
    title: "Grammar mechanic",
  },
  "critical-thinker": {
    title: "Critical thinker",
  },
  interpreter: {
    title: "Interpreter",
  },
  "self-reflector": {
    title: "Self reflector",
  },
  empath: {
    imgPath: "assets/icons/empath.png",
    title: "Empath",
  },
  "social-learner": {
    title: "Social learner",
  },
  scribe: {
    title: "Scribe",
  },
  orator: {
    imgPath: "assets/icons/orator.png",
    title: "Orator",
  },
};

const badgeNcMap = {
  "Read further exception words, noting the unusual correspondences between spelling and sound, and where these occur in the word":
    ["wordsmith"],
  "Increase their familiarity with a wide range of books, including fairy stories, myths and legends, and retelling some of these orally":
    ["bookworm"],
  "Identify themes and conventions in a wide range of books": [
    "bookworm",
    "critical-thinker",
  ],
  "Check that the text makes sense to them, discussing their understanding and explaining the meaning of words in context":
    ["interpreter", "self-reflector"],
  "Draw inferences such as inferring characters’ feelings, thoughts and motives from their actions, and justifying inferences with evidence":
    ["empath", "critical-thinker"],
  "Participate in discussion about both books that are read to them and those they can read for themselves, taking turns and listening to what others say":
    ["interpreter", "social-learner"],
  "Ask relevant questions to extend their understanding and knowledge": [
    "critical-thinker",
  ],
  "Articulate and justify answers, arguments and opinions": [
    "critical-thinker",
  ],
  "Speak audibly and fluently with an increasing command of Standard English": [
    "orator",
  ],
  "Select and use appropriate registers for effective communication": [
    "orator",
  ],
  "Apply their growing knowledge of root words, prefixes and suffixes (etymology and morphology) as listed in - see English appendix 1 , both to read aloud and to understand the meaning of new words they meet":
    ["wordsmith"],
  "Write from memory simple sentences, dictated by the teacher, that include words and punctuation taught so far":
    ["scribe"],
  "Use the present perfect form of verbs in contrast to the past tense": [
    "grammar-mechanic",
  ],
  "Choose nouns or pronouns appropriately for clarity and cohesion and to avoid repetition":
    ["wordsmith"],
};

const getPageDetails = () =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      const activeTab = tabs[0];
      const activeTabId = activeTab.id; // or do whatever you need

      const location = activeTab.url;

      if (
        !location.includes(
          "https://www.thenational.academy/teachers/programmes"
        )
      ) {
        reject(
          "You must be at thenational.academy/teachers/programmes to use this extension"
        );
      }

      const programmePath = location.match(/programmes\/(.*?)\//)[1];
      const unitPath = location.match(/units\/(.*)\//)[1];

      if (programmePath != "english-primary-ks2") {
        reject(
          "This extension currently only works for the English Primary KS2 programme"
        );
      }
      resolve({ programmePath, unitPath });
    });
  });

const main = async () => {
  try {
    const { programmePath, unitPath } = await getPageDetails();

    const path = `units/${unitPath}/summary`;

    const requestString = `${protocol}://${url}/${path}`;

    const res = await fetch(requestString, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    nationalCurriculumContent = data.nationalCurriculumContent;
    const availableBadges = nationalCurriculumContent
      .map((n) => badgeNcMap[n])
      .filter(Boolean);

    const badgeScores = availableBadges.reduce((acc, curr) => {
      curr.forEach((badge) => {
        acc[badge] = acc[badge] ? acc[badge] + 1 : 1;
      });
      return acc;
    }, {});

    document.querySelector("#current-programme").innerHTML = `${programmePath}`;
    document.querySelector("#current-unit").innerHTML = `${unitPath}`;

    const badgeBoxes =
      Object.entries(badgeScores)
        .map(([badge, score]) => {
          return `<div class="badge-box">
        <img width="100px" src="${badges[badge].imgPath}" />
        <h3>${badges[badge].title}</h3>
        <p>${score * 100} xp per lesson</p>
        <div class="checkbox-container"><input type="checkbox"/></div>
      
      </div>`;
        })
        .join("") + '<button id="save">Save</button>';

    document.querySelector("#badge-container").innerHTML =
      availableBadges.length > 0 ? badgeBoxes : "No badges available";
  } catch (e) {
    console.log(e);
  }
};

main();
