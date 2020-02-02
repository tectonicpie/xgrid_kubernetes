import React from 'react';
import axios from 'axios';
import './App.css';

export default class Example extends React.Component {
  constructor(props) {
      super(props);

      this.state = {
        connection_status : "loading",
        logs: [],
      };
      this.createLog = this.createLog.bind(this);
      this.getLogs = this.getLogs.bind(this);
  }

  componentDidMount() {
    axios.get("http://172.18.109.205:30503")
    .then(res => {
      if(res.data.connected)
      {
        this.setState({
          connection_status: "Connected to backend!"
        })
      }
      console.log(res);
    })
  }

  createLog() {
    axios.post("http://172.18.109.205:30503/create_log")
      .then(function (response) {
        console.log(response);
      })
  }

  getLogs() {
    var self = this;
    axios.get("http://172.18.109.205:30503/get_logs")
      .then(function (response) {
        console.log(response);
        self.setState({
          logs: response.data
        })
      })
  }
  renderTableData() {
    return this.state.logs.map((log, index) => {
       const { _id, time } = log //destructuring
       return (
          <tr key={_id}>
             <td>{_id}</td>
             <td>{time}</td>
          </tr>
       )
    })
 }
  render() {
      return (
          <div>
            <div>
            {this.state.connection_status}
            <button onClick={this.createLog}>
              Create log
            </button>
            <button onClick={this.getLogs}>
              Get logs
            </button>
            </div>
            <div>
            <h1 id='title'>Logs</h1>
            <table id='logs'>
               <tbody>
                  {this.renderTableData()}
               </tbody>
            </table>
         </div>
          </div>
          );
      }
  }
