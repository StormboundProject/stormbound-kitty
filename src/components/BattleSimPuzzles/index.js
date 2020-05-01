import React from 'react'
import { Link } from 'react-router-dom'
import hookIntoProps from 'hook-into-props'
import Column from '../Column'
import EmptySearch from '../EmptySearch'
import Error from '../Error'
import InfoHint from '../InfoHint'
import Loader from '../Loader'
import PageMeta from '../PageMeta'
import Puzzle from '../BattleSimPuzzle'
import PuzzlesFilters from '../BattleSimPuzzlesFilters'
import Row from '../Row'
import Title from '../Title'
import useFetch from '../../hooks/useFetch'
import './index.css'

class BattleSimPuzzles extends React.Component {
  state = {
    difficulty: '*',
    type: '*',
    restrictions: [],
    name: '',
  }

  resetFilters = () =>
    this.setState({
      difficulty: '*',
      type: '*',
      restrictions: [],
      name: '',
    })

  updateFilter = name => value => this.setState({ [name]: value })

  matchesName = puzzle =>
    this.state.name === '' ||
    puzzle.name
      .toLowerCase()
      .replace('’', "'")
      .includes(this.state.name.toLowerCase())
  matchesType = puzzle =>
    this.state.type === '*' || puzzle.type === this.state.type
  matchesDifficulty = puzzle =>
    this.state.difficulty === '*' ||
    puzzle.difficulty === +this.state.difficulty
  matchesRestriction = puzzle =>
    this.state.restrictions.length === 0 ||
    this.state.restrictions.every(restriction =>
      puzzle.restrictions.includes(restriction)
    )

  getPuzzles = () =>
    (this.props.data || [])
      .filter(this.matchesName)
      .filter(this.matchesDifficulty)
      .filter(this.matchesRestriction)
      .filter(this.matchesType)

  render() {
    const puzzles = this.getPuzzles()

    return (
      <>
        <h1 className='VisuallyHidden'>Puzzles</h1>

        <Row desktopOnly wideGutter>
          <Column width='1/3'>
            <Title>Filters</Title>
            <PuzzlesFilters {...this.state} updateFilter={this.updateFilter} />
          </Column>
          <Column width='2/3'>
            <Title>Puzzles</Title>

            {this.props.loading ? (
              <Loader />
            ) : this.props.error ? (
              <Error noTitle error={`Error fetching puzzles.`} />
            ) : puzzles.length > 0 ? (
              <ul className='BattleSimPuzzles__list'>
                {puzzles.map(puzzle => (
                  <li className='BattleSimPuzzles__item' key={puzzle.name}>
                    <Puzzle {...puzzle} key={puzzle.name} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptySearch
                title='No puzzles found'
                resetFilters={this.resetFilters}
              />
            )}
            <InfoHint icon='sword'>
              Design your own puzzles and{' '}
              <Link to='/faq#adding-a-puzzle'>have them added</Link> to the
              list!
            </InfoHint>
          </Column>
        </Row>

        <PageMeta
          title='Puzzles'
          description='Stormbound puzzles made by the community.'
        />
      </>
    )
  }
}

export default hookIntoProps(() => useFetch('/data/puzzles.json'))(
  BattleSimPuzzles
)
