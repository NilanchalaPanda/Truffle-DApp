import Web3 from "web3";
import { useState, useEffect } from "react";
import SongContract from "./contracts/SongContract.json"; // Replace with the new contract's ABI

function App() {
  const [state, setState] = useState({ web3: null, contract: null });
  const [songs, setSongs] = useState([]);
  const [songDetails, setSongDetails] = useState({
    title: "",
    ipfsHash: "",
    rentPrice: 0,
  });
  const [account, setAccount] = useState("");

  // SETTING UP THE SMART CONTRACT
  useEffect(() => {
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    const initContract = async () => {
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts(); // Get user accounts
      setAccount(accounts[0]);

      const networkID = await web3.eth.net.getId();
      const deploymentNetwork = SongContract.networks[networkID];

      if (deploymentNetwork) {
        const contractInstance = new web3.eth.Contract(
          SongContract.abi,
          deploymentNetwork.address
        );
        setState({ web3: web3, contract: contractInstance });
      } else {
        console.error("Contract not deployed on this network.");
      }
    };

    provider && initContract();
  }, []);
  console.log("Account : ", account);

  // Fetch all songs from the contract
  useEffect(() => {
    const { contract } = state;

    const fetchSongs = async () => {
      if (contract) {
        const songList = await contract.methods.getAllSongs().call();
        setSongs(songList);
      }
    };

    fetchSongs();
  }, [state]);

  // Upload a new song to the blockchain
  const uploadSong = async () => {
    const { contract } = state;
    const { title, ipfsHash, rentPrice } = songDetails;

    if (contract && title && ipfsHash && rentPrice > 0) {
      await contract.methods
        .uploadSong(title, ipfsHash, rentPrice)
        .send({ from: account });
      window.location.reload(); // Reload to fetch the latest data
    } else {
      console.error("Invalid input");
    }
  };

  // Rent a song by sending payment
  const rentSong = async (songId, rentPrice) => {
    const { contract } = state;

    if (contract) {
      await contract.methods
        .rentSong(songId)
        .send({ from: account, value: rentPrice });
      window.location.reload();
    } else {
      console.error("Contract not initialized");
    }
  };

  return (
    <div className="App bg-purple-100 min-h-screen flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-purple-800 mb-8">
        SONG RENTAL DApplication
      </h1>

      {/* Upload a New Song */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-10 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4">
          Upload Song
        </h2>
        <input
          type="text"
          placeholder="Song Title"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setSongDetails({ ...songDetails, title: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="IPFS Hash"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setSongDetails({ ...songDetails, ipfsHash: e.target.value })
          }
          required
        />
        <input
          type="number"
          placeholder="Rent Price (in Wei)"
          className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setSongDetails({ ...songDetails, rentPrice: e.target.value })
          }
          required
        />
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
          onClick={uploadSong}
        >
          Upload
        </button>
      </div>

      {/* Display All Songs */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4">
          Available Songs for Rent
        </h2>
        {songs.length > 0 ? (
          <ul className="space-y-4">
            {songs.map((song, index) => (
              <li
                key={index}
                className="border-b pb-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold text-purple-700">
                    Title: {song.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    IPFS Hash: {song.ipfsHash}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rent Price: {song.rentPrice} Wei
                  </p>
                </div>
                <button
                  className="bg-purple-600 text-white py-1 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  onClick={() => rentSong(index + 1, song.rentPrice)}
                >
                  Rent this Song
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No songs available yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
