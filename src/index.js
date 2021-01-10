import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Console(props) {
  return (
    <div className="console">
      <ul>{
        props.messages.map((message) => {
          return (
            <li key={message.time}>
              {message.time + ':  ' + message.text}
            </li>
          );
        })
      }</ul>
    </div>
  );
}

function Tabs(props) {
  return (
    <div className="tabs">
      <ul>{
        props.tabs.map((tab) => {
          if (tab.enabled) {
            return (
              <li key={tab.name} onClick={() => { props.onClickTab(tab) }}>
                {tab.name}
              </li>
            )
          }
          return null;
        })
      }</ul>
    </div>
  )
}

class JobsWindow extends React.Component {
  render() {
    return (
      <div className="jobsWindow window">
        Total Population: {this.props.population}
        <div>
          Leaders: {this.props.jobs.leader}
        </div>
        <div>
          Unassigned: {this.props.jobs.unassigned}
        </div>
        <div>
          Trappers: {this.props.jobs.trapper}
          <input
            type="range"
            min="0"
            max={this.props.jobs.trapper + this.props.jobs.unassigned}
            value={this.props.jobs.trapper}
            onChange={(event) => { this.handleTrapperChange('trapper', parseInt(event.target.value)) }}
          ></input>
        </div>
      </div>
    )
  }

  handleTrapperChange(job, newValue) {
    const jobs = Object.assign({}, this.props.jobs);
    jobs.unassigned += jobs[job] - newValue;
    jobs[job] = newValue;
    this.props.updateJobs(jobs);
  }
}

class MainWindow extends React.Component {
  render() {
    return (
      <div className="mainWindow window">
        <h4>Food: {this.props.resources.food}</h4>
        {this.createCatchFoodButton()}
        {this.createRecruitSpiderButton()}
      </div>
    );
  }

  createCatchFoodButton() {
    if (this.props.population <= 4) {
      return (
        <div><button onClick={() => { this.catchFood() }}>Catch Food</button></div>
      )
    }
  }
  catchFood() {
    this.props.updateResources({
      food: this.props.resources.food + 1,
    });
  }

  createRecruitSpiderButton() {
    const recruitmentCost = Math.floor(10 * Math.pow(1.2, this.props.population - 1));
    return (
      <div><button onClick={() => { this.recruitSpider(recruitmentCost) }}>Recruit Spider</button>
      Cost: {recruitmentCost} food</div>
    )
  }
  recruitSpider(cost) {
    if (this.props.resources.food >= cost) {
      this.props.updateResources({
        food: this.props.resources.food - cost,
      });
      this.props.updatePopulation(this.props.population + 1);
    }
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const date = new Date();
    this.state = {
      messages: [{ text: 'message 1', time: 154 }, { text: 'message 2', time: 318 }, { text: 'message 3', time: 500 },
        { text: 'message 4', time: 661 }, { text: 'message 5', time: 915 }, { text: 'message 6', time: date.getTime() }],
      resources: {
        food: 10,
      },
      buildings: {
        traps: 0,
      },
      jobs: {
        leader: 1,
        trapper: 0,
        unassigned: 0,
      },
      tabs: [{ name: 'main', enabled: true }, { name: 'jobs', enabled: false }],
      selectedTab: 'main',
      population: 1,
    };

    setInterval(() => {
      const newState = performGameLoop(this.state);
      this.setState(newState);
    }, 1000);
  }
  render() {
    return (
      <div className="game">
        <Console
          messages={this.state.messages}
        />
        <Tabs
          tabs={this.state.tabs}
          onClickTab={(tab) => this.handleClickTab(tab)}
        />
        {this.getSelectedWindow()}
      </div>
    );
  }
  getSelectedWindow() {
    switch (this.state.selectedTab) {
      case 'main':
        return (
          <MainWindow 
            resources={this.state.resources}
            buildings={this.state.buildings}
            jobs={this.state.jobs}
            population={this.state.population}
            updateResources={(resources) => {this.updateResources(resources)}}
            updateBuildings={(buildings) => {this.updateBuildings(buildings)}}
            updateJobs={(jobs) => {this.updateJobs(jobs)}}
            updatePopulation={(population) => {this.updatePopulation(population)}}
          />
        );
      case 'jobs':
        return (
          <JobsWindow
            jobs={this.state.jobs}
            population={this.state.population}
            updateJobs={(jobs) => {this.updateJobs(jobs)}}
          />
        )
      default:
        return (
          <div></div>
        )
    }
    
  }
  updateResources(resources) {
    this.setState({
      resources: resources,
    });
  }
  updateBuildings(buildings) {
    this.setState({
      buildings: buildings,
    });
  }
  updateJobs(jobs) {
    this.setState({
      jobs: jobs,
    });
  }
  updatePopulation(population) {
    const jobs = Object.assign({}, this.state.jobs);
    if (population > this.state.population) {
      if (population <= 4) {
        jobs.trapper += population - this.state.population;
      } else {
        if (population === 5) {
          this.unlockJobsTab();
        }
        jobs.unassigned += population - this.state.population;
      }
    } else {
      /* handle cases where population shrinks */
    }
    this.setState({
      population: population,
      jobs: jobs,
    });
  }

  handleClickTab(tab) {
    this.setState({
      selectedTab: tab.name,
    });
  }

  unlockJobsTab() {
    const tabs = this.state.tabs.slice();
    const jobsTab = tabs.find((tab) => tab.name === 'jobs');
    jobsTab.enabled = true;
    this.setState({
      tabs: tabs,
    });
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function performGameLoop(gameState) {
  const updatedGameState = Object.assign({}, gameState);
  updatedGameState.resources.food += gameState.jobs.trapper * 2;
  updatedGameState.resources.food -= gameState.population;
  return updatedGameState;
}