import { useState, useRef } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";

const signMessage = async ({ setError, message }) => {
  try {
    console.log({ message });
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");

    await window.ethereum.send("eth_requestAccounts");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    const address = await signer.getAddress();

    return {
      message,
      signature,
      address
    };
  } catch (err) {
    setError(err.message);
  }
};

// Set a cookie with a long expiration date (e.g., 10 years from now)
function setPermanentCookie(cookieName, cookieValue) {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 10);

  const cookieString = `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieValue)};expires=${expirationDate.toUTCString()};path=/`;
  document.cookie = cookieString;
}

export default function SignMessage() {
  const resultBox = useRef();
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState();

  const handleSign = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    const sig = await signMessage({
      setError,
      message: data.get("message")
    });
    if (sig) {
      setSignatures([...signatures, sig]);
      setPermanentCookie("signature", sig.signature);
      setPermanentCookie("address", sig.address);
      setPermanentCookie("message", sig.message);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('https://backend-xi-eight.vercel.app/metadata/123', {
        withCredentials: true // This allows sending cookies along with the request
      });

      // Process the response data
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  

  return (
    <form className="m-4" onSubmit={handleSign}>
      <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Sign messages
          </h1>
          <div className="">
            <div className="my-3">
              <textarea
                required
                type="text"
                name="message"
                className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                placeholder="Message"
              />
            </div>
          </div>
        </main>
        <footer className="p-4">
          <button
            onClick= {fetchData}
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            fetchData
          </button>
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Sign message
          </button>
          <ErrorMessage message={error} />
        </footer>
        {signatures.map((sig, idx) => {
          return (
            <div className="p-2" key={sig}>
              <div className="my-3">
                <p>
                  Message {idx + 1}: {sig.message}
                </p>
                <p>Signer: {sig.address}</p>
                <textarea
                  type="text"
                  readOnly
                  ref={resultBox}
                  className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                  placeholder="Generated signature"
                  value={sig.signature}
                />
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
  
}
