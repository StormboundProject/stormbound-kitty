import getDrawingProbability from '../../../src/helpers/getDrawingProbability'

describe('The `getDrawingProbability` helper', () => {
  const FUSION_STONES = {
    MYTHIC: 0.17857142857142938,
    HEROIC: 0.11451338599956063,
    CLASSIC: 0.08302129947958125,
    NOBLE: 0.04198831015640114,
    HUMBLE: 0.014102804801729651,
  }

  Object.keys(FUSION_STONES).forEach(bookType => {
    it(`should return ${FUSION_STONES[bookType]}% for a ${bookType} book`, () => {
      expect(getDrawingProbability(bookType, [1, 1, 1, 1])).to.equal(
        FUSION_STONES[bookType]
      )
    })
  })

  it('should return 0 for a specific common card in a MYTHIC book', () => {
    expect(getDrawingProbability('MYTHIC', [1, 0, 0, 0])).to.equal(0)
  })
  it('should return 0 for a specific common card in a HEROIC book', () => {
    expect(getDrawingProbability('HEROIC', [1, 0, 0, 0])).to.equal(0)
  })
  it('should return 0 for a specific rare card in a MYTHIC book', () => {
    expect(getDrawingProbability('MYTHIC', [0, 1, 0, 0])).to.equal(0)
  })
})