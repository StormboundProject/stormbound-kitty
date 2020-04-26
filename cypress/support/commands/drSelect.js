import s from '../../integration/dryRunner/selectors'
import getRawCardData from '../../../src/helpers/getRawCardData'

const select = (id, options = { log: true }) => {
  if (typeof id === 'number') {
    return cy
      .get(s.CARD, { log: false })
      .eq(id, { log: false })
      .then($card => cy.drSelect($card.attr('id'), options))
  }

  const { log } = options
  const { name } = getRawCardData(id)

  if (log) {
    Cypress.log({
      name: `SELECT`,
      message: `Select ‘${name}’ (${id})`,
      consoleProps: () => ({ id, name }),
    })
  }

  return cy
    .get(s.CARD, { log: false })
    .filter('#' + id, { log: false })
    .as('card')
    .prev('button', { log: false })
    .click({ log: false })
}

export default select