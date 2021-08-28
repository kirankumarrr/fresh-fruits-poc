const { config, questions } = require('./config');
let postEndpoint =
  'https://60b0c06a1f26610017fff217.mockapi.io/api/users/survey';
const localStorageKey = 'freshsurvey';
let questionCount = 0;
let isProceedEnabled = false;
let collectResponse = {};
let formErrors = {};

/**
 * @desc On window load : read survey answers,
 * question number from local storage if exist and paint in dom
 */
window.onload = function () {
  let storedResponse = getLocalStorage();
  if (storedResponse) {
    collectResponse = storedResponse.collectResponse;
    questionCount = storedResponse.questionCount;
    isProceedEnabled = storedResponse.isProceedEnabled;
  }
  hideNextBtn();
  if (isProceedEnabled) {
    const proceed = document.getElementById('surveyStart');
    const surveyBody = document.getElementById('surveyBody');
    proceed.classList.add('hide');
    surveyBody.classList.remove('hide');
    viewDynamicQuestions(questionCount);
  }
  document.getElementById('wrapper').classList.remove('hide');
};

/**
 * @desc Hide next button on last question(Any comments? page)
 */
function hideNextBtn() {
  if (questionCount == questions.length - 1) {
    document.getElementById('btnNext').classList.add('hide');
    document.getElementById('btnSubmit').classList.remove('hide');
  }
}

/**
 * @param Event : parameter any html or context
 * @desc  Hide landing page and proceed takes to survey questions
 * @desc Set values to localstorage (page count)
 */
function proceed(event) {
  event.preventDefault();
  isProceedEnabled = true;
  const proceed = document.getElementById('surveyStart');
  proceed.classList.add('hide');
  surveyBody.classList.remove('hide');
  showList(questionCount);
  let storedResponse = getLocalStorage();
  if (storedResponse === null) {
    let responseToStore = {
      collectResponse,
      questionCount,
      isProceedEnabled,
    };
    setLocalStorage(responseToStore);
  } else {
    storedResponse.isProceedEnabled = isProceedEnabled;
    storedResponse.questionCount = questionCount;
    setLocalStorage(storedResponse);
  }
}

/**
 * @param Event : parameter any html or context
 * @desc Helps to navigate to previous questions or landing page.
 * @desc Set values to localstorage (page count)
 * @desc Call dynamic previous question creation
 */
function back(event) {
  event.preventDefault();
  if (questionCount == 0) {
    document.getElementById('surveyBody').classList.add('hide');
    document.getElementById('surveyStart').classList.remove('hide');
  }

  if (questionCount === questions.length - 1) {
    document.getElementById('btnNext').classList.remove('hide');
    document.getElementById('btnSubmit').classList.add('hide');
  }
  if (questionCount !== 0) {
    questionCount--;
    let storedResponse = getLocalStorage();
    storedResponse.questionCount = questionCount;
    setLocalStorage(storedResponse);
    viewDynamicQuestions(questionCount);
  }
}

/**
 * @param Event : parameter any html or context
 * @desc Helps to navigate to next questions
 * @desc Set values to localstorage
 * @desc Call dynamic question creation
 */
function next(event) {
  event.preventDefault();

  if (
    (questionCount < questions.length - 1 &&
      Object.keys(collectResponse).length === questionCount + 1) ||
    collectResponse[config[questionCount].field] !== undefined
  ) {
    questionCount++;
    let storedResponse = getLocalStorage();
    storedResponse.questionCount = questionCount;
    setLocalStorage(storedResponse);
    delete formErrors[config[questionCount].field];
    viewDynamicQuestions(questionCount);
    hideNextBtn();
  } else {
    addErrors();
  }
}

/**
 * @param Event : parameter any html or context
 * @desc Submit survey form
 */
function submit(event) {
  event.preventDefault();
  checkHasErrors();

  if (Object.keys(collectResponse).length === questions.length) {
    postData(collectResponse);
  }
}

/**
 * @desc Set values into local storage when change occurs
 */
function updateLocalStorageWhenChanged() {
  let storedResponse = getLocalStorage();
  storedResponse = {
    ...storedResponse,
    collectResponse,
  };
  setLocalStorage(storedResponse);
}

/**
 * @desc Append errors after validating questions
 */
function addErrors() {
  formErrors[config[questionCount].field] = 'cannot be empty';
  document.getElementById('errorMessage').classList.remove('hide');
  document.getElementById(
    'errorMessage'
  ).innerHTML = `${config[questionCount].field} cannot be Empty`;
}

/**
 * @desc Find if error exists then add errors
 * @desc Delete when no errors found
 */
function checkHasErrors() {
  if (
    questionCount < questions.length &&
    Object.keys(collectResponse).length === questions.length
  ) {
    delete formErrors[config[questionCount].field];
  } else {
    addErrors();
  }
}

/**
 * @param {Number} count
 * @desc Load dedicated question page based on type passed
 */
function viewDynamicQuestions(count) {
  if (questions[count].type === 'boolean') {
    showBoolean(count);
  } else if (questions[count].type === 'text') {
    showTextarea(count);
  } else {
    showList(count);
  }
}

const errorElement = `<p id="errorMessage" data-testid="errorMessage" class="errorMessage hide"></p>`;
const errorSubmitElement = `<p id="errorSubmitElement" data-testid="errorSubmitElement" class="errorMessage hide"></p>`;

/**
 * @desc Clean up error after values are filled
 */
function cleanUpErrors() {
  if (document.getElementById('errorMessage')) {
    document.getElementById('errorMessage').classList.add('hide');
  }
}

/**
 * @param {Number} count
 * @desc construct dynamic question and list options
 * @desc Add event listeners for tracking option selection
 * @desc User data is futher set in local storage
 */
function showList(count) {
  let question = document.getElementById('questions');
  let options = questions[count].options;

  let lis = '';
  options.forEach((list, index) => {
    lis += `<li class="option${
      collectResponse[config[count].field] &&
      collectResponse[config[count].field].text === list.text
        ? ' active'
        : ''
    }" points=${
      list[config[count].value]
    } position=${index} parentposition=${count} field=${config[count].field} >${
      list.text
    }</li>`;
  });

  const listQuestions = `
  <h2 class="headingQuestion">${questions[count].question}</h2>
  <ul class="option_group" data-testid="option_group">
  ${lis}
  </ul>
  ${errorElement}
  `;
  question.innerHTML = listQuestions;

  // Event Delegation
  question.querySelector('ul').addEventListener('click', function (event) {
    if (document.querySelector('ul li.active')) {
      document.querySelector('ul li.active').classList.remove('active');
    }

    cleanUpErrors();

    if (event.target.tagName.toLowerCase() === 'li') {
      event.target.classList.add('active');
      const parentPos = Number(event.target.getAttribute('parentposition'));
      const position = Number(event.target.getAttribute('position'));
      collectResponse[config[count].field] = {
        points: event.target.getAttribute('points'),
        text: questions[parentPos].options[position].text,
      };
      updateLocalStorageWhenChanged();
    }
  });
}

const isTrueSet = (myValue) => myValue === 'true';

/**
 * @param {Number} count
 * @desc Construct dynamic question radio buttons
 * @desc Add event listeners for tracking radio button change
 * @desc User data is futher set in local storage
 */
function showBoolean(count) {
  let question = document.getElementById('questions');
  let options = questions[count].options;
  let lis = '';
  options.forEach((list, index) => {
    const isActive =
      collectResponse[config[count].field] === list.value ? 'active' : '';

    lis += `
  <div class="form-input">
      <div class="input-wrapper ${isActive}">
        <input type="radio" 
        name=${config[count].field} 
        value=${list.value}
         data-testid="choice"
         id="choice-${index}" ${isActive ? 'checked' : ''}> 
        <div class="svg-wrapper">${svgRadioButton}</div>
      </div>
      <label for="choice-${index}">${list.text}</label>
  </div>
  `;
  });
  question.innerHTML = `
 <h2>${questions[count].question}</h2>
  <div id="radioForm" class="radioForm">
    ${lis}
  </div>
  ${errorElement}
 `;

  question.querySelectorAll('input[name="orderAgain"]').forEach((record) => {
    record.addEventListener('click', function (event) {
      if (document.querySelector('.input-wrapper.active')) {
        document
          .querySelector('.input-wrapper.active')
          .classList.remove('active');
      }

      cleanUpErrors();
      collectResponse[config[questionCount].field] = isTrueSet(
        event.target.value
      );
      updateLocalStorageWhenChanged();

      const getEle = event.target.closest('.input-wrapper');
      if (getEle) {
        getEle.classList.add('active');
      }
    });
  });
}

/**
 * @param {Number} count
 * @desc Construct dynamic question textarea
 * @desc Add event listeners for tracking change in textarea
 * @desc User data is futher set in local storage
 */
function showTextarea(count) {
  let question = document.getElementById('questions');
  question.innerHTML = `
 <h2>${questions[count].question}</h2>
  <div id="textareaForm" class="textareaForm">
    <textarea data-testid="commentsTextarea" name="comments" value="" placeholder="Add your comments here"></textarea>
  </div>
  ${errorElement}
  ${errorSubmitElement}
 `;

  const textAreaElement = document
    .getElementById('questions')
    .querySelector('textarea');
  if (!!collectResponse[config[questionCount].field]) {
    textAreaElement.innerHTML = collectResponse[config[questionCount].field];
  }

  textAreaElement.addEventListener('change', function (event) {
    collectResponse[config[questionCount].field] = event.target.value;

    if (event.target.value.trim() === '') {
      delete collectResponse[config[questionCount].field];
    } else {
      collectResponse[config[questionCount].field] = event.target.value;
      cleanUpErrors();
    }
    updateLocalStorageWhenChanged();
  });
}

/**
 * @param { Object } data : post payload data
 * @desc Trigger http post call which contains survey collected data
 * @desc When api call is failed errors are shown
 * @desc When api call is success navigate to survey completed page
 */
const postData = async (data) => {
  try {
    const rawResponse = await fetch(postEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const content = await rawResponse.json();
    if (content) {
      document.getElementById('surveyEndingBody').classList.remove('hide');
      document.getElementById('surveyBody').classList.add('hide');
      questionCount = 0;
      isProceedEnabled = false;
      collectResponse = {};
      formErrors = {};
      localStorage.removeItem(localStorageKey);
      document.getElementById('errorSubmitElement').classList.add('hide');
    }
  } catch (error) {
    const getErrorElement = document.getElementById('errorSubmitElement');
    getErrorElement.classList.remove('hide');
    getErrorElement.innerHTML = 'Error on post';
  }
};
const svgRadioButton = `<?xml version="1.0" encoding="UTF-8"?><svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<title>radio_button_checked</title>
<desc>Created with Sketch.</desc>
<g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
  <g id="Rounded" transform="translate(-340.000000, -4322.000000)">
      <g id="Toggle" transform="translate(100.000000, 4266.000000)">
          <g id="-Round-/-Toggle-/-radio_button_checked" transform="translate(238.000000, 54.000000)">
              <g>
                  <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                  <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M12,20 C16.42,20 20,16.42 20,12 C20,7.58 16.42,4 12,4 C7.58,4 4,7.58 4,12 C4,16.42 7.58,20 12,20 Z M12,17 C9.23857625,17 7,14.7614237 7,12 C7,9.23857625 9.23857625,7 12,7 C14.7614237,7 17,9.23857625 17,12 C17,14.7614237 14.7614237,17 12,17 Z" id="🔹-Icon-Color" fill="#1D1D1D"></path>
              </g>
          </g>
      </g>
  </g>
</g>
</svg>`;

document.getElementById('proceedBtn').addEventListener('click', proceed);
document.getElementById('btnBack').addEventListener('click', back);
document.getElementById('btnNext').addEventListener('click', next);
document.getElementById('btnSubmit').addEventListener('click', submit);

// utils
function setLocalStorage(data) {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
}
function getLocalStorage() {
  return JSON.parse(localStorage.getItem(localStorageKey));
}
