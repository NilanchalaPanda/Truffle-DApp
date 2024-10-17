import "./App.css";
import Web3 from "web3";
import { useState, useEffect } from "react";
import SimpleStorage from "./contracts/SimpleStorage.json";

function App() {
  const [state, setState] = useState({ web3: null, contract: null });
  const [data, setData] = useState("nil");

  // SETTING UP THE SMART CONTRACT
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
    const initContract = async () => {
      const web3 = new Web3(provider);
      const networkID = await web3.eth.net.getId();
      const deploymentNetwork = SimpleStorage.networks[networkID];

      if (deploymentNetwork) {
        const contractInstance = new web3.eth.Contract(
          SimpleStorage.abi,
          deploymentNetwork.address
        );
        setState({ web3: web3, contract: contractInstance });
      } else {
        console.error("Contract not deployed on this network.");
      }
    };

    provider && initContract();
  }, []);

  // NOW CALLING THE SMART CONTRACT FUNCTIONS --> getter
  useEffect(() => {
    const { contract } = state;

    const readData = async () => {
      if (contract) {
        const contractData = await contract.methods.getter().call();
        setData(contractData.toString());
      }
    };

    readData();
  }, [state]);

  async function writeData() {
    const { contract } = state;
    const val = document.querySelector("#output").value;
    await contract.methods
      .setter(val)
      .send({ from: "0x44692f04CF113a67CD111F3982185bd90856b76A" }); // 10 is the value we're setting
    window.location.reload();
  }

  return (
    <div className="App">
      <h1>Contract Data : {data}</h1>
      <input type="text" id="output" required />
      <button onClick={writeData} className="button button2">
        Change data
      </button>
    </div>
  );
}

export default App;
