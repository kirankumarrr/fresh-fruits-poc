exports.config = {
  0: {
    field: 'deliveryExperience',
    value: 'points',
  },
  1: {
    field: 'freshnessFruits',
    value: 'value',
  },
  2: {
    field: 'orderAgain',
    value: 'value',
  },
  3: {
    field: 'comments',
    value: 'text',
    id: 'textareaForm',
  },
};

exports.questions = [
  {
    type: 'rating',
    question: 'How do you rate the delivery experience?',

    options: [
      {
        text: 'Great',
        points: '10',
      },
      {
        text: 'Not so Great',
        points: '5',
      },
      {
        text: 'Awful',
        points: '0',
      },
    ],
  },
  {
    type: 'rating',
    question: 'How do you rate the Freshness of the fruits?',
    options: [
      {
        text: 'Great',
        value: '10',
      },
      {
        text: 'Not so Great',
        value: '5',
      },
      {
        text: 'Awful',
        value: '0',
      },
    ],
  },
  {
    type: 'boolean',
    question: 'Would you order again?',
    options: [
      {
        text: 'Yes, Definitely',
        value: true,
      },
      {
        text: 'Not so Great',
        value: false,
      },
    ],
  },
  {
    type: 'text',
    question: 'Any comments?',
  },
];
