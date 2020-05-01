describe('Routes — Deck Builder', () => {
  const ID =
    'MUYxMywxTjIzLDFOMiwxTjM3LDFONjksMUYyMywxTjcyLDFOMTksMU4yMCwxRjgsMU42NCwxRjE0'

  it('it should render', () => {
    cy.visit('/deck').get('main h1').should('exist')
  })

  it('it should render deck editor for ' + ID, () => {
    cy.visit('/deck/' + ID)
      .get('main h1')
      .should('exist')
  })

  it('it should render deck details for ' + ID, () => {
    cy.visit('/deck/' + ID + '/details')
      .get('main h1')
      .should('exist')
  })

  it('it should render deck tracker for ' + ID, () => {
    cy.visit('/deck/' + ID + '/tracker')
      .get('main h1')
      .should('exist')
  })

  it('it should render deck dry-runner for ' + ID, () => {
    cy.visit('/deck/' + ID + '/dry-run')
      .get('main h1')
      .should('exist')
  })

  it('it should render the ready decks', () => {
    cy.visit('/deck/suggestions').get('main h1').should('exist')
  })
})
