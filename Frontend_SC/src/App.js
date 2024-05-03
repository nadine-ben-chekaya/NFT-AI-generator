import { useState, useEffect } from "react";
import { NFTStorage, File } from "nft.storage";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import axios from "axios";

// Components
import Spinner from "react-bootstrap/Spinner";
import Navigation from "./components/Navigation";

// ABIs
import NFT from "./abis/MyAINFT.json";

// Config
import config from "./config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [url, setURL] = useState(null);
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    console.log("network name", network.name);
    const nft = new ethers.Contract(
      config[network.name].nft.address,
      NFT,
      provider
    );
    console.log("nft instance from loadBlockchainData", nft);
    setNFT(nft);
  };

  const createImage = async (e) => {
    e.preventDefault();
    if (description === "") {
      window.alert("Please provide a description");
      return;
    }
    setIsMinted(false);
    setIsWaiting(true);
    setMessage("Generating Image...");

    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;

    // Send the request
    const response = await axios({
      url: URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        inputs: description,
        options: { wait_for_model: true },
      }),
      responseType: "arraybuffer",
    });

    const type = response.headers["content-type"];
    const data = response.data;

    const base64data = Buffer.from(data).toString("base64");
    const img = `data:${type};base64,` + base64data; // <-- This is so we can render it on the page
    setImage(img);

    setIsGenerated(true);

    const ipfsFile = new File([data], "image.jpeg", { type: "image/jpeg" });

    setFile(ipfsFile);

    setIsWaiting(false);
    setMessage("");
  };

  const uploadImage = async () => {
    setIsWaiting(true);
    setMessage("Uploading Image...");

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({
      token: process.env.REACT_APP_NFT_STORAGE_API_KEY,
    });

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: file,
      name: name,
      description: description,
    });

    // Save the URL
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;
    setURL(url);
    console.log("url from IPFS upload image: ", url);
  };

  const mintImage = async (e) => {
    e.preventDefault();
    // Upload image to IPFS (NFT.Storage)
    await uploadImage();

    // Mint NFT
    setMessage("Waiting for Mint...");

    const signer = await provider.getSigner();
    console.log("signer from mint nft", signer);
    const transaction = await nft.connect(signer).mintNFT(url);
    console.log("transaction from mint nft", transaction);
    console.log("nft from mint nft", nft);
    //await transaction.wait();
    setIsGenerated(false);
    setIsWaiting(false);
    setIsMinted(true);
    setName(null);
    setDescription(null);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className="form">
        {!isGenerated ? (
          <form onSubmit={createImage}>
            <input
              id="description"
              type="text"
              placeholder="Create a description..."
              onChange={(e) => setDescription(e.target.value)}
            />
            <input id="Generate" type="submit" value="Generate Image" />
          </form>
        ) : (
          isGenerated &&
          image && (
            <form onSubmit={mintImage}>
              <input
                id="name"
                type="text"
                placeholder="Type a name for your NFT..."
                onChange={(e) => setName(e.target.value)}
              />
              <input id="mint" type="submit" value="Upload to IPFS & Mint" />
            </form>
          )
        )}

        <div className="image">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            !isWaiting && url && <img src={image} alt="AI generated image" />
          )}
        </div>
      </div>

      {!isWaiting && isMinted && (
        <p>
          NFT is Minted, View&nbsp;
          <a href={url} target="_blank" rel="noreferrer">
            Metadata
          </a>
        </p>
      )}
    </div>
  );
}

export default App;
