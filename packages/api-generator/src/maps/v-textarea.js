const { inputEvents, textEvents, validatableEvents, textFieldSlots } = require('../helpers/variables')

module.exports = {
  'v-textarea': {
    events: [
      {
        name: 'input',
        value: 'string',
      },
      {
        name: 'change',
        value: 'string',
      },
      ...inputEvents,
      ...textEvents,
    ].concat(validatableEvents),
    slots: [
      ...textFieldSlots,
    ],
  },
}
