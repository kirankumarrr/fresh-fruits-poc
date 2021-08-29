/**
 * @jest-environment jsdom
 */

const {
  getAllByTestId,
  getByText,
  getByTestId,
  fireEvent,
  waitFor,
} = require('@testing-library/dom');
const { toHaveClass } = require('@testing-library/jest-dom');
const { expect } = require('@jest/globals');
// @jest-environment
const html = require('./config');
let container;
let findValues;
let surveyStart;
let surveyBody;
let surveyEndingBody;
let btnSubmit;
let btnBack;
let btnNext;
let proceedBtn;
beforeAll(async () => {
  document.body.innerHTML = html;
  findValues = require('../js/index');
  container = document.body;
  surveyStart = getByTestId(container, 'surveyStart');
  surveyBody = getByTestId(container, 'surveyBody');
  surveyEndingBody = getByTestId(container, 'surveyEndingBody');
  btnSubmit = getByTestId(container, 'btnSubmit');
  btnBack = getByTestId(container, 'btnBack');
  btnNext = getByTestId(container, 'btnNext');
  proceedBtn = getByText(container, 'Proceed');
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { reload: jest.fn() },
  });

  global.fetch = jest.fn(() => {
    return new Promise((resolve, _) => {
      setTimeout(() => {
        resolve({ json: () => Promise.resolve({ a: 2 }) });
      }, 1000);
    });
  });
});

describe('Landing Page', () => {
  test('should display heading', () => {
    expect(getByText(container, 'FreshWork Fruits')).toBeDefined();
  });

  test('should only display landing page initially', () => {
    expect(surveyStart).not.toHaveClass('hide');
    expect(surveyEndingBody).toHaveClass('hide');
    expect(surveyBody).toHaveClass('hide');
  });
  test('should display survey body when proceed button is triggered', () => {
    fireEvent.click(proceedBtn);
    expect(surveyStart).toHaveClass('hide');
    expect(surveyEndingBody).toHaveClass('hide');
    expect(surveyBody).not.toHaveClass('hide');
    expect(btnSubmit).toHaveClass('hide');
    expect(btnBack).not.toHaveClass('hide');
    expect(btnNext).not.toHaveClass('hide');
  });
  test('should load delivery experience rating with dynamic options', () => {
    fireEvent.click(proceedBtn);
    const option_group = getByTestId(container, 'option_group');
    expect(option_group.children.length).toBe(3);
    expect(
      getByText(container, 'How do you rate the delivery experience?')
    ).toBeDefined();
  });
  test('should display error when clicked on next button without selecting rating', () => {
    fireEvent.click(proceedBtn);
    fireEvent.click(btnNext);
    const errorMessage = getByTestId(container, 'errorMessage');
    expect(errorMessage).not.toHaveClass('hide');
  });
  test('should goto next survey rating question when option is selected', () => {
    const questions = getByTestId(container, 'questions');
    fireEvent.click(proceedBtn);
    const option_group = getByTestId(container, 'option_group');
    option_group.children[0].click();
    fireEvent.click(btnNext);
    expect(option_group.children.length).toBe(3);
    expect(
      getByText(container, 'How do you rate the Freshness of the fruits?')
    ).toBeDefined();
  });
  test('should display landing page when clicked on back button', () => {
    fireEvent.click(btnBack);
    expect(surveyStart).toHaveClass('hide');
    expect(surveyBody).not.toHaveClass('hide');
    expect(surveyEndingBody).toHaveClass('hide');
    fireEvent.click(btnBack);
    expect(surveyStart).not.toHaveClass('hide');
    expect(surveyBody).toHaveClass('hide');
    expect(surveyEndingBody).toHaveClass('hide');
  });
});

describe('Would you order again page', () => {
  beforeAll(async () => {
    fireEvent.click(proceedBtn);
    const option_group1 = getByTestId(container, 'option_group');
    option_group1.children[0].click();
    fireEvent.click(btnNext);
    const option_group2 = getByTestId(container, 'option_group');
    option_group2.children[0].click();
    fireEvent.click(btnNext);
  });

  test('should display Proper Question', () => {
    expect(getByText(container, 'Would you order again?')).toBeDefined();
  });
  test('should display error when clicked on next button if radio button is not selected', () => {
    fireEvent.click(btnNext);
    const errorMessage = getByTestId(container, 'errorMessage');
    expect(errorMessage).not.toHaveClass('hide');
    expect(getByText(container, 'orderAgain cannot be Empty')).toBeDefined();
  });
  test('should add active class when radio button is selected', () => {
    const radioItem = getAllByTestId(container, 'choice');
    radioItem[0].click();
    expect(getByText(container, 'Would you order again?')).toBeDefined();
    expect(radioItem[0].closest('.input-wrapper')).toHaveClass('active');
    const errorMessage = getByTestId(container, 'errorMessage');
    expect(errorMessage).toHaveClass('hide');
    radioItem[1].click();
    expect(radioItem[0].closest('.input-wrapper')).not.toHaveClass('active');
    expect(radioItem[1].closest('.input-wrapper')).toHaveClass('active');
  });
});

describe('Comments question page', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    const radioItem = getAllByTestId(container, 'choice');
    radioItem[0].click();
    fireEvent.click(btnNext);
  });

  beforeEach(() => {
    fetch.mockClear();
  });
  afterAll(() => jest.setTimeout(5 * 1000));
  test('should display Proper Question:Any comments?', () => {
    expect(getByText(container, 'Any comments?')).toBeDefined();
  });
  test('should display submit button and hide next button', () => {
    expect(btnSubmit).not.toHaveClass('hide');
    expect(btnBack).not.toHaveClass('hide');
    expect(btnNext).toHaveClass('hide');

    fireEvent.click(btnBack);

    expect(btnSubmit).toHaveClass('hide');
    expect(btnBack).not.toHaveClass('hide');
    expect(btnNext).not.toHaveClass('hide');
    fireEvent.click(btnNext);
  });
  test('should show error when clicked on submit if comments are empty', () => {
    const errorMessage = getByTestId(container, 'errorMessage');
    expect(errorMessage).toHaveClass('hide');
    fireEvent.click(btnSubmit);
    expect(errorMessage).not.toHaveClass('hide');
  });
  test('should show error and when comments are added then errors to be hidden', () => {
    expect(getByText(container, 'Any comments?')).toBeDefined();
    const commentsTextarea = getByTestId(container, 'commentsTextarea');
    const errorMessage = getByTestId(container, 'errorMessage');
    expect(errorMessage).not.toHaveClass('hide');
    fireEvent.click(btnSubmit);
    fireEvent.change(commentsTextarea, { target: { value: 123 } });
    expect(commentsTextarea.value).toBe('123');
    expect(errorMessage).toHaveClass('hide');
    fireEvent.change(commentsTextarea, { target: { value: '' } });
    fireEvent.click(btnSubmit);
    expect(errorMessage).not.toHaveClass('hide');
  });

  test('should throw error if post call fails', async () => {
    expect(getByText(container, 'Any comments?')).toBeDefined();
    const commentsTextarea = getByTestId(container, 'commentsTextarea');
    fireEvent.change(commentsTextarea, { target: { value: 'test' } });
    fireEvent.click(btnSubmit);
    const errorSubmitElement = getByTestId(container, 'errorSubmitElement');

    expect(errorSubmitElement).toHaveClass('hide');
    expect(fetch).toHaveBeenCalledTimes(1);
    fetch.mockImplementationOnce(() => Promise.reject('API Failure'));

    await waitFor(() => {
      expect(surveyStart).toHaveClass('hide');
      expect(surveyEndingBody).toHaveClass('hide');
      expect(surveyBody).not.toHaveClass('hide');
    });
  });

  test('should post the survey data when clicked on submit', async () => {
    expect(getByText(container, 'Any comments?')).toBeDefined();
    const commentsTextarea = getByTestId(container, 'commentsTextarea');
    const errorSubmitElement = getByTestId(container, 'errorSubmitElement');
    expect(errorSubmitElement).toHaveClass('hide');
    fireEvent.change(commentsTextarea, { target: { value: 'test' } });
    fireEvent.click(btnSubmit);
    expect(fetch).toHaveBeenCalledTimes(1);
    const payloadData = {
      deliveryExperience: { points: '10', text: 'Great' },
      freshnessFruits: { points: '10', text: 'Great' },
      orderAgain: true,
      comments: 'test',
    };

    expect(fetch).toHaveBeenCalledWith(
      'https://60b0c06a1f26610017fff217.mockapi.io/api/users/survey',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      }
    );
    await waitFor(() => {
      expect(surveyStart).toHaveClass('hide');
      expect(surveyBody).toHaveClass('hide');
      expect(surveyEndingBody).not.toHaveClass('hide');
    });
  });
});
