"use client";
import "../globals.css";
import ArrayShow from "../components/displayWallet";
import AttributeInput from "../components/attributeInput";
import { Web3Storage } from "web3.storage";
import { File } from "web3.storage";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faInfoCircle,
  faTrash,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { useContractWrite } from "wagmi";
import abiData from "./abi.json";
import { isAddress } from "web3-utils";
import Web3AuthConnectorInstance from "../components/web3config";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Web3AuthProfile from "../components/web3profile";
import Mint from "../components/mint";
library.add(faInfoCircle);
// Global Vaiables

export var ipfsURL;
var jsonList = [];
export var theData = [];
var theImageUrl;
const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({ apiKey: "TVxT2Kjzsy4pFTaoWknc3O8SwxAuUqm6" }),
    publicProvider(),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    //new MetaMaskConnector({ chains }),
    Web3AuthConnectorInstance(chains),
  ],
  provider,
  webSocketProvider,
});

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [displayWallets, setDisplayWallets] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [displayMonoWallets, setDisplayMonoWallets] = useState(false);
  const [thelist, setThelist] = useState([]);

  function getAccessToken() {
    return process.env.NEXT_PUBLIC_API_KEY;
  }
  function handleSelectedImage() {
    var imageElement = document.getElementById("imgurl");
    imageElement.value = null;

    var parentElement = document.getElementById("imagePreview");
    var imgElement = parentElement.querySelector("img");
    imgElement.src = "";
  }
  const monoInput = () => {
    const data = document.getElementById("monoWalletAddress").value;
    setDisplayMonoWallets(true);
    setThelist((prevData) => [...prevData, data]); // Update theData array with new value
    var isValidAddress = isAddress(data);
    if (isValidAddress) {
      console.log("Valid Ethereum address");
      theData.push(data);
      document.getElementById("monoWalletAddress").value = ""; // Set the value to an empty string
      alert(data + " Wallet Address Added");
      handleDisplayWallets();
    } else {
      alert(data + " " + "Invalid Ethereum address");
    }
  };

  function handleDisplayWallets() {
    try {
      const divElement = document.getElementById("displayWallet");
      divElement.innerHTML = "";
      theData.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.classList.add("flex", "justify-center", "space-x-2");
        const textElement = document.createElement("p");
        textElement.textContent = item;
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "🗑";
        deleteButton.addEventListener("click", () => {
          deleteItem(index);
        });
        listItem.appendChild(textElement);
        listItem.appendChild(deleteButton);
        divElement.appendChild(listItem);
      });

      function deleteItem(index) {
        theData.splice(index, 1);
        console.log(theData);
        handleDisplayWallets();
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function handleAllFunctions() {
    try {
      setUploading(true);
      await imageStorage();
      await getdata();
    } catch (error) {
      // Handle any errors that occurred during the asynchronous tasks
      console.error(error);
    } finally {
      // Check if both imageStorage and getdata have completed before setting uploading to false
      if (uploading) {
        setUploading(false);
      }
    }
  }
  function handleImageSelect() {
    const fileInput = document.getElementById("imgurl");
    const file = event.target.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const imagePreview = document.getElementById("imagePreview");
      const img = document.createElement("img");
      img.src = e.target.result;
      imagePreview.innerHTML = "";
      imagePreview.appendChild(img);
    };

    reader.readAsDataURL(file);
  }
  //Function take the lis and Display it in the Frontend
  function handleAttributesDisplay() {
    const jsonListDiv = document.getElementById("attribute");
    jsonListDiv.innerHTML = "";

    jsonList.forEach((jsonObj, index) => {
      const values = Object.values(jsonObj);
      const reqData = `${values[0]}:${values[1]}`;

      const listItem = document.createElement("div");
      listItem.classList.add("flex", "justify-center", "space-x-2");

      const pElement = document.createElement("p");
      pElement.textContent = JSON.stringify(reqData);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑";
      deleteButton.addEventListener("click", () => deleteItem(index));

      function deleteItem(index) {
        jsonList.splice(index, 1);
        handleAttributesDisplay();
      }

      listItem.appendChild(pElement);
      listItem.appendChild(deleteButton);
      jsonListDiv.appendChild(listItem);
    });
  }
  //Funciton for adding Attributes
  function handleAttributesInput() {
    const Key = document.getElementById("keyId").value;
    const Value = document.getElementById("valueId").value;
    var keyValuePair = {
      trait_type: Key,
      value: Value,
    };
    jsonList.push(keyValuePair);
    handleAttributesDisplay();
  }
  async function imageStorage() {
    const fileInput = document.getElementById("imgurl");
    const file = fileInput.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    const imageData = [file];
    const client = new Web3Storage({ token: getAccessToken() });
    const rootCid = await client.put(imageData);
    const ipfsURL = "ipfs://" + rootCid + "/" + file.name;
    console.log(ipfsURL);
    theImageUrl = ipfsURL;
  }
  async function webstorage(data) {
    const client = new Web3Storage({ token: getAccessToken() });
    const rootCid = await client.put(data);
    ipfsURL = "ipfs://" + rootCid + "/hello.json";
    console.log(ipfsURL);
  }

  function jsonToArray(data) {
    for (let i in data) {
      var theOne = data[i][0];
      var isValidAddress = isAddress(theOne);
      if (isValidAddress) {
        theData.push(theOne);
      } else {
        alert(theOne + " " + "Invalid Wallet Address");
      }
      //setThelist((prevData) => [...prevData, data]);
      console.log(theData);
      handleDisplayWallets();
      setDisplayWallets(true);
    }
  }

  function startPapa() {
    const theFile = Papa.parse(document.getElementById("csvfile").files[0], {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: function (results) {
        var data = results["data"];
        jsonToArray(data);
      },
    });
  }

  function parsecsv() {
    const fileInput = document.getElementById("csvfile");
    startPapa();
  }

  async function getdata() {
    const Name = document.getElementById("name").value;
    const Description = document.getElementById("desc").value;
    let inputData = {
      description: Description,
      image: theImageUrl,
      name: Name,
      attributes: jsonList,
    };
    const blob = new Blob([JSON.stringify(inputData)], {
      type: "application/json",
    });
    const outputData = [new File([blob], "hello.json")];
    await webstorage(outputData);
  }
  return (
    <WagmiConfig client={client}>
      <div className="rounded-lg p-5 w-full text-white">
        <div className="sm:flex sm:justify-center  "></div>
        <div className="rounded-lg bg-white bg-opacity-10 p-2  justify-evenly">
          <div className="flex justify-evenly">
            <div className="flex-col justify-center">
              <div className="flex justify-center">
                <h1 className="text-2xl m-2 hover:underline-offset-1 font-medium">
                  {" "}
                  CERTIFICATE DETAILS
                </h1>
              </div>
              <div className="flex flex-col items-center  space-y-12  m-5 items-end gap-6">
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    className="shadow bg-transparent border rounded-[7px] w-96 py-2 px-3 text-white focus:text-pink-500 leading-tight focus:outline-none focus:border-pink-500 focus:shadow-outline"
                    id="name"
                    type="text"
                    placeholder="Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">
                    Attributes{" "}
                  </label>
                  <div className="flex w-96">
                    <div
                      id="attribute"
                      className="hover:border-pink-500 shadow h-16 max-h-16  overflow-y-auto bg-transparent border rounded-l-[7px]  w-full py-2 px-3 text-white focus:text-pink-500 leading-tight focus:outline-none focus:border-pink-500 focus:shadow-outline"
                    />
                    <AttributeInput onButtonClick={handleAttributesInput} />
                  </div>
                </div>

                <div className="w-96">
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Description
                  </label>
                  <textarea
                    id="desc"
                    rows="6"
                    className="block  h-52  p-2.5 w-full text-sm text-white bg-transparent  rounded-[7px] border border-white  focus:ring-pink-500 focus:outline-none focus:border-pink-500 focus:shadow-outline"
                    placeholder="Write your thoughts here..."
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-white text-sm font-bold mb-2">
                    Upload Photo
                  </label>
                  <div className="flex">
                    <input
                      id="imgurl"
                      type="file"
                      className="shadow bg-transparent border rounded-[7px]  w-96 py-2 px-3 text-white focus:text-pink-500 leading-tight focus:outline-none focus:border-pink-500 focus:shadow-outline"
                      required
                      onChange={handleImageSelect}
                    />
                    <button
                      onClick={handleSelectedImage}
                      className="ml-2 border-none"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ color: "#fff" }}
                      />
                    </button>
                  </div>
                </div>

                <div className="items-center  w-96 m-0 flex-col">
                  <div className="w-full h-60" id="imagePreview"></div>
                </div>
              </div>
            </div>
            <div className="flex-col justify-center">
              <div className="flex justify-center">
                <h1 className="text-2xl  mb-4 m-2  hover:underline-offset-1 font-medium ">
                  TARGET WALLETS
                </h1>
              </div>
              <div className="m-5 mt-10 space-y-12">
                <div className="relative m-11 flex h-10 m-5 w-full m-5 min-w-[24rem] max-w-[24rem]">
                  <label className="relative inline-block px-4 py-2 h-full w-full text-sm font-medium leading-5 text-white border rounded-[7px] cursor-pointer bg-transparent hover:border-pink-500 hover:text-pink-500">
                    <div className="flex justify-between">
                      <span className="">Choose CSV File</span>
                      <input
                        id="csvfile"
                        type="file"
                        accept=".csv"
                        onChange={parsecsv}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  </label>
                </div>
                <div className="flex w-92 h-96 justify-center">
                  <img alt="csv format" src="walletI.png" />
                </div>
                <div className="items-center flex justify-center m-5 font-bold text-3xl">
                  {"OR"}
                </div>
                <div className="flex justify-center ml-5  h-10 w-full  min-w-[24rem] max-w-[24rem]">
                  <div>
                    <label className="block text-white text-sm font-bold mb-2">
                      Insert Wallet Address{" "}
                    </label>
                    <div className="flex w-96 mb-8">
                      <input
                        id="monoWalletAddress"
                        className="shadow bg-transparent border rounded-l-[7px]  w-full py-2 px-3 text-white focus:text-pink-500 leading-tight focus:outline-none focus:border-pink-500 focus:shadow-outline"
                        placeholder=" "
                      />
                      <button
                        onClick={monoInput}
                        className="rounded-r-[7px] bg-pink-500 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none peer-placeholder-shown:pointer-events-none peer-placeholder-shown:bg-blue-gray-500 peer-placeholder-shown:opacity-50 peer-placeholder-shown:shadow-none"
                        data-ripple-light="false"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
                <div className="items-center mt-8 flex-col">
                  <div className="text-xl m-2 flex justify-center">
                    Wallet Addresses
                  </div>
                  <div
                    id="displayWallet"
                    className=" flex-col w-full h-60  max-h-60 p-4 overflow-y-auto bg-white bg-opacity-5 rounded-[7px]  text-center justify-center"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-col justify-center">
            <div>
              <Mint onButtonClick={handleAllFunctions} />
            </div>
          </div>
        </div>
      </div>
    </WagmiConfig>
  );
}
